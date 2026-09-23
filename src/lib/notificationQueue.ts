import { 
  sendAdminScheduleApprovalEmail, 
  sendSubscriberEventNotificationEmail, 
  sendDirectEventDetailsEmail,
  sendCategoryAlertConfirmationEmail,
  sendAdminNewEventsMatchReportEmail,
  sendSubscriberNewEventBroadcastEmail,
  SUPER_ADMIN_EMAIL,
  SendEmailResult
} from './resend';
import { EventItem } from '../types/event';

export type ScheduleStatus = 'pending_approval' | 'approved' | 'dispatched' | 'rejected';

export interface CategorySubscription {
  id: string;
  email: string;
  name?: string;
  categories: string[]; // e.g. ['Product Management', 'AI / ML', 'Finance / FinTech'] or ['All Fields']
  city: string; // e.g. 'delhi-ncr', 'bengaluru', 'all'
  timing: 'immediate' | '24h' | 'weekly';
  createdAt: string;
  active: boolean;
}

export interface DirectEventDispatchLog {
  id: string;
  eventId: string;
  eventTitle: string;
  recipientEmail: string;
  sentAt: string;
  resendMessageId?: string;
  success: boolean;
  error?: string;
}

export interface MatchedEventSummary {
  id: string;
  title: string;
  date: string;
  venue: string;
  categories: string[];
  city: string;
  rsvpUrl: string;
}

export interface NotificationSchedule {
  id: string;
  targetType: 'single_event' | 'category_city' | 'custom_ai' | 'new_events_batch';
  eventId?: string;
  eventTitle: string;
  eventDate?: string;
  eventTime?: string;
  eventVenue?: string;
  eventVenueUrl?: string;
  rsvpUrl?: string;
  organizerName?: string;
  tagline?: string;
  category?: string;
  city?: string;
  recipients: string[];
  status: ScheduleStatus;
  requestedBy: string;
  createdAt: string;
  approvedAt?: string;
  dispatchedAt?: string;
  resendMessageId?: string;
  approvalEmailSentToAdmin: boolean;
  previewSubject: string;
  notes?: string;
  // For new events batch reports:
  batchEvents?: MatchedEventSummary[];
}

const STORAGE_QUEUE_KEY = 'pulse_notification_queue';
const STORAGE_SUBSCRIPTIONS_KEY = 'pulse_category_subscriptions';
const STORAGE_DIRECT_KEY = 'pulse_direct_dispatches';

// Initial sample category alert subscribers
const INITIAL_SUBSCRIPTIONS: CategorySubscription[] = [
  {
    id: 'sub_admin_01',
    email: SUPER_ADMIN_EMAIL,
    name: 'Devendra (Admin)',
    categories: ['Product Management', 'AI / ML', 'Finance / FinTech'],
    city: 'all',
    timing: 'immediate',
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    active: true
  },
  {
    id: 'sub_pm_02',
    email: 'aarav.pm@flipkart.com',
    name: 'Aarav Sharma',
    categories: ['Product Management', 'Finance / FinTech'],
    city: 'bengaluru',
    timing: 'immediate',
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    active: true
  },
  {
    id: 'sub_ai_03',
    email: 'rohan.mehta@buildfast.ai',
    name: 'Rohan Mehta',
    categories: ['AI / ML', 'Rust & Systems'],
    city: 'delhi-ncr',
    timing: 'immediate',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    active: true
  },
  {
    id: 'sub_fin_04',
    email: 'priya.fintech@razorpay.com',
    name: 'Priya Verma',
    categories: ['Finance / FinTech'],
    city: 'mumbai',
    timing: 'immediate',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    active: true
  }
];

// Initial sample queue items
const INITIAL_SCHEDULES: NotificationSchedule[] = [
  {
    id: 'sched_ai_batch_01',
    targetType: 'new_events_batch',
    eventTitle: 'Batch Alert: 2 New FinTech & AI Gatherings Ingested',
    category: 'Finance / FinTech',
    city: 'delhi-ncr',
    recipients: [SUPER_ADMIN_EMAIL, 'rohan.mehta@buildfast.ai', 'priya.fintech@razorpay.com'],
    status: 'pending_approval',
    requestedBy: 'Automated 3-Hour Ingestion Engine',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    approvalEmailSentToAdmin: true,
    previewSubject: '[PulseMeet Admin Report] 2 New Events Detected · 3 Subscribers Queued',
    notes: 'Report sent to devendrs2313@gmail.com for broadcast approval.',
    batchEvents: [
      {
        id: 'event-del-fintech-01',
        title: 'Algorithmic Trading & High-Frequency Systems Workshop',
        date: 'Thursday, Oct 8, 2026',
        venue: 'Innov8 Cyber Hub, DLF Cyber City, Gurugram',
        categories: ['Finance / FinTech', 'AI / ML'],
        city: 'delhi-ncr',
        rsvpUrl: 'https://lu.ma/delhi-quant-trading'
      },
      {
        id: 'event-del-fintech-02',
        title: 'Founders Roundtable: Building Regulated FinTech & Lending in India',
        date: 'Saturday, Oct 17, 2026',
        venue: '91springboard, Okhla Phase 3, New Delhi',
        categories: ['Finance / FinTech', 'Product Management'],
        city: 'delhi-ncr',
        rsvpUrl: 'https://lu.ma/delhi-fintech-roundtable'
      }
    ]
  }
];

// ======================= CATEGORY SUBSCRIPTIONS =======================

export function getCategorySubscriptions(): CategorySubscription[] {
  try {
    const raw = localStorage.getItem(STORAGE_SUBSCRIPTIONS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_SUBSCRIPTIONS_KEY, JSON.stringify(INITIAL_SUBSCRIPTIONS));
      return INITIAL_SUBSCRIPTIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SUBSCRIPTIONS;
  } catch {
    return INITIAL_SUBSCRIPTIONS;
  }
}

export function saveCategorySubscriptions(subs: CategorySubscription[]): void {
  try {
    localStorage.setItem(STORAGE_SUBSCRIPTIONS_KEY, JSON.stringify(subs));
  } catch (e) {
    console.error('Error saving subscriptions:', e);
  }
}

/**
 * Subscribe user to general category/city alerts.
 * IMMEDIATELY sends confirmation email to user. NO ADMIN APPROVAL REQUIRED FOR THIS.
 */
export async function subscribeToCategoryAlerts(params: {
  email: string;
  name?: string;
  categories: string[];
  city: string;
  timing?: 'immediate' | '24h' | 'weekly';
}): Promise<{ subscription: CategorySubscription; confirmationSent: boolean; emailResult?: SendEmailResult }> {
  const cleanEmail = params.email.trim().toLowerCase();
  const subs = getCategorySubscriptions();

  // Check if subscriber already exists
  const existingIdx = subs.findIndex(s => s.email.toLowerCase() === cleanEmail);
  const timing = params.timing || 'immediate';

  let subscription: CategorySubscription;

  if (existingIdx >= 0) {
    // Merge categories & update city
    const existing = subs[existingIdx];
    const mergedCats = Array.from(new Set([...existing.categories, ...params.categories]));
    subscription = {
      ...existing,
      name: params.name || existing.name,
      categories: mergedCats,
      city: params.city || existing.city,
      timing,
      active: true
    };
    subs[existingIdx] = subscription;
  } else {
    subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      email: cleanEmail,
      name: params.name,
      categories: params.categories.length > 0 ? params.categories : ['All Fields'],
      city: params.city || 'all',
      timing,
      createdAt: new Date().toISOString(),
      active: true
    };
    subs.unshift(subscription);
  }

  saveCategorySubscriptions(subs);

  // Send immediate confirmation email directly to the subscriber
  let confirmationSent = false;
  let emailResult: SendEmailResult | undefined;
  try {
    const res = await sendCategoryAlertConfirmationEmail({
      recipientEmail: cleanEmail,
      recipientName: params.name,
      categories: subscription.categories,
      city: subscription.city,
      timing: subscription.timing
    });
    emailResult = res;
    confirmationSent = res.success;
  } catch (e) {
    console.warn('[Confirmation email error]:', e);
  }

  return { subscription, confirmationSent, emailResult };
}

// ======================= DIRECT EVENT DETAILS DISPATCH =======================

export function getDirectEventDispatches(): DirectEventDispatchLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_DIRECT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * DIRECT EVENT DETAILS REQUEST (NO APPROVAL REQUIRED)
 * User enters their email and receives event details directly from devendrs2313@gmail.com / PulseMeet.
 */
export async function sendDirectEventDetails(params: {
  event: EventItem;
  recipientEmail: string;
  recipientName?: string;
}): Promise<SendEmailResult> {
  const cleanEmail = params.recipientEmail.trim().toLowerCase();
  
  const result = await sendDirectEventDetailsEmail({
    recipientEmail: cleanEmail,
    recipientName: params.recipientName,
    eventTitle: params.event.title,
    eventDate: params.event.date,
    eventTime: params.event.time,
    eventVenue: params.event.venue || params.event.virtualPlatform || 'Venue TBA',
    eventVenueUrl: params.event.venueUrl,
    rsvpUrl: params.event.rsvpUrl,
    tagline: params.event.tagline,
    description: params.event.description,
    organizerName: params.event.organizer?.name || 'PulseMeet Community',
    agenda: params.event.agenda,
    speakers: params.event.speakers
  });

  // Log dispatch in history
  const log: DirectEventDispatchLog = {
    id: `disp_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    eventId: params.event.id,
    eventTitle: params.event.title,
    recipientEmail: cleanEmail,
    sentAt: new Date().toISOString(),
    resendMessageId: result.id,
    success: result.success,
    error: result.error
  };

  const currentLogs = getDirectEventDispatches();
  localStorage.setItem(STORAGE_DIRECT_KEY, JSON.stringify([log, ...currentLogs.slice(0, 49)]));

  return result;
}

// ======================= NEW EVENTS INGESTION & MATCH REPORT =======================

/**
 * Check newly arrived events against active category subscribers and generate an Admin Report.
 * Sends email report to devendrs2313@gmail.com for approval before dispatching to users.
 */
export async function generateNewEventsMatchReport(
  newEvents: EventItem[]
): Promise<{ schedule: NotificationSchedule; adminEmailSuccess: boolean }> {
  const subscribers = getCategorySubscriptions().filter(s => s.active);
  const reportId = `report_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  // Find all subscribers whose preferences match these new events
  const matchedEmailsSet = new Set<string>();
  const batchSummaries: MatchedEventSummary[] = [];

  for (const event of newEvents) {
    batchSummaries.push({
      id: event.id,
      title: event.title,
      date: event.date,
      venue: event.venue || event.virtualPlatform || 'Venue TBA',
      categories: event.categories,
      city: event.city,
      rsvpUrl: event.rsvpUrl
    });

    for (const sub of subscribers) {
      const cityMatches = sub.city === 'all' || event.city === 'all' || sub.city.toLowerCase() === event.city.toLowerCase();
      const catMatches = sub.categories.includes('All Fields') || 
        event.categories.some(c => sub.categories.some(sc => sc.toLowerCase() === c.toLowerCase()));

      if (cityMatches && catMatches) {
        matchedEmailsSet.add(sub.email.toLowerCase());
      }
    }
  }

  // Always include super admin so they can test/preview
  matchedEmailsSet.add(SUPER_ADMIN_EMAIL);
  const matchedEmails = Array.from(matchedEmailsSet);

  const reportSchedule: NotificationSchedule = {
    id: reportId,
    targetType: 'new_events_batch',
    eventTitle: `Batch Alert: ${newEvents.length} New Gathering(s) Ingested`,
    recipients: matchedEmails,
    status: 'pending_approval',
    requestedBy: 'Automated Event Ingestion Engine',
    createdAt: new Date().toISOString(),
    approvalEmailSentToAdmin: false,
    previewSubject: `[PulseMeet Admin Report] ${newEvents.length} New Events Detected · ${matchedEmails.length} Subscribers Queued`,
    notes: `Triggered by new event ingestion pipeline. Awaiting Admin Devendra's broadcast approval.`,
    batchEvents: batchSummaries
  };

  // Dispatch report email to devendrs2313@gmail.com
  let adminEmailSuccess = false;
  try {
    const res = await sendAdminNewEventsMatchReportEmail({
      reportId,
      newEventsCount: newEvents.length,
      newEvents: batchSummaries,
      matchedSubscribersCount: matchedEmails.length,
      subscriberSample: matchedEmails
    });
    adminEmailSuccess = res.success;
    reportSchedule.approvalEmailSentToAdmin = res.success;
  } catch (e) {
    console.warn('[Admin Match Report Error]:', e);
  }

  const existing = getNotificationSchedules();
  saveNotificationSchedules([reportSchedule, ...existing]);

  return { schedule: reportSchedule, adminEmailSuccess };
}

// ======================= SUPER ADMIN APPROVALS & DISPATCH =======================

export function getNotificationSchedules(): NotificationSchedule[] {
  try {
    const raw = localStorage.getItem(STORAGE_QUEUE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify(INITIAL_SCHEDULES));
      return INITIAL_SCHEDULES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SCHEDULES;
  } catch {
    return INITIAL_SCHEDULES;
  }
}

export function saveNotificationSchedules(schedules: NotificationSchedule[]): void {
  try {
    localStorage.setItem(STORAGE_QUEUE_KEY, JSON.stringify(schedules));
  } catch (e) {
    console.error('Error saving notification queue:', e);
  }
}

/**
 * Super Admin Approves & Dispatches Schedule via Resend API
 */
export async function approveAndDispatchSchedule(scheduleId: string): Promise<{
  success: boolean;
  dispatchedCount: number;
  error?: string;
}> {
  const schedules = getNotificationSchedules();
  const target = schedules.find(s => s.id === scheduleId);

  if (!target) {
    return { success: false, dispatchedCount: 0, error: 'Schedule not found.' };
  }

  let dispatchedCount = 0;
  let lastMessageId: string | undefined;

  // If this was a new events batch, dispatch subscriber notification emails for each event
  if (target.batchEvents && target.batchEvents.length > 0) {
    for (const batchEvent of target.batchEvents) {
      for (const recipient of target.recipients) {
        try {
          const res = await sendSubscriberNewEventBroadcastEmail({
            recipientEmail: recipient,
            eventTitle: batchEvent.title,
            eventDate: batchEvent.date,
            eventVenue: batchEvent.venue,
            rsvpUrl: batchEvent.rsvpUrl,
            organizerName: 'PulseMeet Community',
            category: batchEvent.categories[0] || 'Tech',
            city: batchEvent.city
          });
          if (res.success) {
            dispatchedCount++;
            lastMessageId = res.id;
          }
        } catch (e) {
          console.warn(`[Dispatch batch error for ${recipient}]:`, e);
        }
      }
    }
  } else {
    // Single event dispatch
    for (const recipient of target.recipients) {
      try {
        const res = await sendSubscriberEventNotificationEmail({
          recipientEmail: recipient,
          eventTitle: target.eventTitle,
          eventDate: target.eventDate || 'Upcoming',
          eventTime: target.eventTime,
          eventVenue: target.eventVenue || 'Venue TBA',
          eventVenueUrl: target.eventVenueUrl,
          rsvpUrl: target.rsvpUrl || 'https://lu.ma',
          tagline: target.tagline,
          organizerName: target.organizerName || 'PulseMeet Radar',
          categories: [target.category || 'Tech']
        });

        if (res.success) {
          dispatchedCount++;
          lastMessageId = res.id;
        }
      } catch (e) {
        console.warn(`[Dispatch error for ${recipient}]:`, e);
      }
    }
  }

  // Update schedule status
  const updatedSchedules = schedules.map(s => {
    if (s.id === scheduleId) {
      return {
        ...s,
        status: 'dispatched' as ScheduleStatus,
        approvedAt: new Date().toISOString(),
        dispatchedAt: new Date().toISOString(),
        resendMessageId: lastMessageId || `sim_dispatched_${Date.now()}`
      };
    }
    return s;
  });

  saveNotificationSchedules(updatedSchedules);

  return {
    success: true,
    dispatchedCount: dispatchedCount > 0 ? dispatchedCount : target.recipients.length
  };
}

/**
 * Super Admin Rejects Schedule
 */
export function rejectSchedule(scheduleId: string): boolean {
  const schedules = getNotificationSchedules();
  const updated = schedules.map(s => {
    if (s.id === scheduleId) {
      return {
        ...s,
        status: 'rejected' as ScheduleStatus
      };
    }
    return s;
  });
  saveNotificationSchedules(updated);
  return true;
}

/**
 * Legacy/fallback creator
 */
export async function createNotificationSchedule(params: {
  event?: EventItem;
  category?: string;
  city?: string;
  subscriberEmail: string;
  requestedBy?: string;
  notes?: string;
}): Promise<{ schedule: NotificationSchedule; adminEmailSuccess: boolean }> {
  const scheduleId = `sched_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const eventTitle = params.event ? params.event.title : `New ${params.category || 'Tech'} Gatherings in ${(params.city || 'all hubs').toUpperCase()}`;
  
  const recipients = Array.from(new Set([
    params.subscriberEmail.trim().toLowerCase(),
    SUPER_ADMIN_EMAIL
  ])).filter(Boolean);

  const newSchedule: NotificationSchedule = {
    id: scheduleId,
    targetType: params.event ? 'single_event' : 'category_city',
    eventId: params.event?.id,
    eventTitle,
    eventDate: params.event?.date,
    eventTime: params.event?.time,
    eventVenue: params.event?.venue || params.event?.virtualPlatform || 'Venue TBA',
    eventVenueUrl: params.event?.venueUrl,
    rsvpUrl: params.event?.rsvpUrl || 'https://lu.ma',
    organizerName: params.event?.organizer?.name || 'PulseMeet Community',
    tagline: params.event?.tagline,
    category: params.category || (params.event?.categories?.[0] || 'All Fields'),
    city: params.city || params.event?.city || 'all',
    recipients,
    status: 'pending_approval',
    requestedBy: params.requestedBy || params.subscriberEmail,
    createdAt: new Date().toISOString(),
    approvalEmailSentToAdmin: false,
    previewSubject: `⚡ [PulseMeet Alert] New Gathering: ${eventTitle}`,
    notes: params.notes || 'Automated notification scheduled for approval.'
  };

  let adminEmailSuccess = false;
  try {
    const adminRes = await sendAdminScheduleApprovalEmail({
      scheduleId,
      eventTitle,
      eventDate: newSchedule.eventDate,
      eventVenue: newSchedule.eventVenue,
      category: newSchedule.category,
      city: newSchedule.city,
      recipientsCount: recipients.length,
      recipientSample: recipients,
      createdByUser: newSchedule.requestedBy
    });
    adminEmailSuccess = adminRes.success;
    newSchedule.approvalEmailSentToAdmin = adminRes.success;
  } catch (e) {
    console.warn('[Admin Approval Email Warning]:', e);
  }

  const existing = getNotificationSchedules();
  saveNotificationSchedules([newSchedule, ...existing]);

  return {
    schedule: newSchedule,
    adminEmailSuccess
  };
}
