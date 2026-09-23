/**
 * Resend Email API Client & Notification Service for PulseMeet
 */

export const DEFAULT_RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || '';
export const DEFAULT_FROM_EMAIL = 'PulseMeet <onboarding@resend.dev>';
export const SUPER_ADMIN_EMAIL = 'devendrs2313@gmail.com';

export const RESEND_API_KEY = DEFAULT_RESEND_API_KEY;
export const RESEND_FROM_EMAIL = DEFAULT_FROM_EMAIL;

export function getResendApiKey(): string {
  try {
    const saved = localStorage.getItem('pulse_resend_api_key');
    if (saved && saved.trim()) return saved.trim();
  } catch {}
  return import.meta.env.VITE_RESEND_API_KEY || '';
}

export function saveResendApiKey(key: string): void {
  try {
    if (key.trim()) {
      localStorage.setItem('pulse_resend_api_key', key.trim());
    } else {
      localStorage.removeItem('pulse_resend_api_key');
    }
  } catch {}
}

export function getResendFromEmail(): string {
  try {
    const saved = localStorage.getItem('pulse_resend_from_email');
    if (saved && saved.trim()) return saved.trim();
  } catch {}
  return import.meta.env.VITE_RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;
}

export function saveResendFromEmail(fromEmail: string): void {
  try {
    if (fromEmail.trim()) {
      localStorage.setItem('pulse_resend_from_email', fromEmail.trim());
    } else {
      localStorage.removeItem('pulse_resend_from_email');
    }
  } catch {}
}

export function getGmailAppPassword(): string {
  try {
    const saved = localStorage.getItem('pulse_gmail_app_password');
    if (saved && saved.trim()) return saved.trim();
  } catch {}
  return '';
}

export function saveGmailAppPassword(pass: string): void {
  try {
    if (pass.trim()) {
      localStorage.setItem('pulse_gmail_app_password', pass.trim());
      localStorage.setItem('pulse_email_engine', 'gmail');
    } else {
      localStorage.removeItem('pulse_gmail_app_password');
    }
  } catch {}
}

export function getEmailEngine(): 'resend' | 'gmail' {
  try {
    const saved = localStorage.getItem('pulse_email_engine');
    if (saved === 'gmail' || saved === 'resend') return saved;
    if (getGmailAppPassword()) return 'gmail';
  } catch {}
  return 'resend';
}

export function saveEmailEngine(engine: 'resend' | 'gmail'): void {
  try {
    localStorage.setItem('pulse_email_engine', engine);
  } catch {}
}

/**
 * Generate a mailto link with pre-filled recipient, subject, and text body
 * Allows 1-click fallback dispatch directly from the user's email client (Gmail, Outlook, etc.)
 */
export function generateMailtoUrl(payload: { to: string | string[]; subject: string; text?: string; html?: string }): string {
  const recipient = Array.isArray(payload.to) ? payload.to.join(',') : payload.to;
  const cleanSubject = encodeURIComponent(payload.subject);
  // Clean HTML tags for plain text mailto body
  const rawText = payload.text || payload.html?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '';
  const cleanBody = encodeURIComponent(rawText);
  return `mailto:${recipient}?subject=${cleanSubject}&body=${cleanBody}`;
}

export interface SendEmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  reply_to?: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
  warning?: string;
  isDomainRestricted?: boolean;
  mailtoUrl?: string;
  engine?: 'resend' | 'gmail_smtp' | 'client_mailto';
  recipient?: string | string[];
}

/**
 * Resolves the appropriate Resend endpoint.
 * In a browser environment, routes through the local Vite proxy at '/api/resend/emails'
 * to eliminate browser CORS preflight blocks.
 */
function getResendEndpoint(): string {
  if (typeof window !== 'undefined') {
    return '/api/resend/emails';
  }
  return 'https://api.resend.com/emails';
}

/**
 * Send an email via Resend REST API
 * Strictly sends to the recipient requested - NEVER silently redirects someone else's email to the admin!
 */
export async function sendEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
  const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];
  const fromAddress = payload.from || getResendFromEmail();
  const apiKey = getResendApiKey();
  const gmailPass = getGmailAppPassword();
  const activeEngine = getEmailEngine();
  const endpoint = getResendEndpoint();

  // Branch A: Direct Gmail SMTP Engine (devendrs2313@gmail.com)
  if (activeEngine === 'gmail' && gmailPass) {
    try {
      const gRes = await fetch('/api/send-gmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipients,
          subject: payload.subject,
          html: payload.html,
          text: payload.text || payload.subject,
          appPassword: gmailPass,
          fromEmail: SUPER_ADMIN_EMAIL
        })
      });

      const gData = await gRes.json();
      if (gRes.ok && gData.success) {
        console.info(`[Gmail SMTP Success]: Dispatched from ${SUPER_ADMIN_EMAIL} to ${recipients.join(', ')}. ID: ${gData.id}`);
        return {
          success: true,
          id: gData.id,
          engine: 'gmail_smtp',
          recipient: payload.to
        };
      } else {
        console.warn('[Gmail SMTP Warning]:', gData);
        // If Gmail SMTP fails, continue to Resend fallback
      }
    } catch (gErr) {
      console.warn('[Gmail SMTP Network Error]:', gErr);
    }
  }

  // Branch B: Resend REST API
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: fromAddress,
        to: recipients,
        reply_to: payload.reply_to || SUPER_ADMIN_EMAIL,
        subject: payload.subject,
        html: payload.html,
        text: payload.text || payload.subject
      })
    });

    const data = await res.json();

    if (!res.ok) {
      console.warn('[Resend API Warning]:', data);

      // Check for Resend testing domain restriction:
      // In testing mode (onboarding@resend.dev), Resend permits sending ONLY to the verified account owner.
      const isRestrictedDomainError = 
        data?.name === 'validation_error' ||
        (data?.message && (
          data.message.includes('only send testing emails to your own email address') ||
          data.message.includes('verify a domain at resend.com/domains') ||
          data.message.includes('testing email address') ||
          data.message.includes('domains like')
        ));

      if (isRestrictedDomainError) {
        const errorMsg = data?.message || 
          `Resend Sandbox: 'onboarding@resend.dev' can only deliver to the account owner (devendrs2313@gmail.com). To send directly to ${recipients.join(', ')}, add a verified custom domain at resend.com/domains or configure Gmail SMTP in settings.`;
        
        return {
          success: false,
          isDomainRestricted: true,
          error: errorMsg,
          mailtoUrl: generateMailtoUrl(payload),
          engine: 'resend',
          recipient: payload.to
        };
      }

      return {
        success: false,
        error: data.message || `Resend Error HTTP ${res.status}`,
        mailtoUrl: generateMailtoUrl(payload),
        recipient: payload.to
      };
    }

    console.info(`[Resend API Success]: Email dispatched directly to recipient. ID: ${data.id}, To: ${recipients.join(', ')}`);
    return {
      success: true,
      id: data.id,
      engine: 'resend',
      recipient: payload.to
    };
  } catch (err: any) {
    console.error('[Resend Network Error]:', err);
    return {
      success: false,
      error: err?.message || 'Network request failed. Make sure dev server proxy is active.',
      mailtoUrl: generateMailtoUrl(payload),
      recipient: payload.to
    };
  }
}

/**
 * Send an instant verification test email to any specified email (or Super Admin)
 */
export async function sendVerificationTestEmail(targetEmail?: string): Promise<SendEmailResult> {
  const recipient = targetEmail?.trim() || SUPER_ADMIN_EMAIL;
  return sendEmail({
    to: recipient,
    subject: `⚡ [PulseMeet System Check] Resend Email Pipeline Verified (${new Date().toLocaleTimeString()})`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
        <div style="background: #4f46e5; padding: 20px; border-radius: 12px; color: #ffffff; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 800;">⚡ PulseMeet Resend Pipeline Verified</h2>
          <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Direct Delivery to ${recipient}</p>
        </div>
        <p>Hello,</p>
        <p>Your Resend email delivery pipeline is <strong>100% active, operational, and delivering directly to your personal email</strong>.</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; margin: 16px 0; font-size: 13px; line-height: 1.6;">
          <div><strong>Recipient:</strong> <code>${recipient}</code></div>
          <div><strong>Sender:</strong> <code>${getResendFromEmail()}</code></div>
          <div><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">Delivered Successfully</span></div>
          <div><strong>Timestamp:</strong> ${new Date().toLocaleString()}</div>
        </div>
        <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 6px; font-size: 12px; color: #1e40af; line-height: 1.5;">
          💡 <strong>Custom Domain Delivery:</strong> When using a custom verified domain on Resend, emails are dispatched directly to all registered platform users and personal accounts with no restriction.
        </div>
      </div>
    `
  });
}

/**
 * Send Schedule Approval Request Email directly to Super Admin (devendrs2313@gmail.com)
 */
export async function sendAdminScheduleApprovalEmail(params: {
  scheduleId: string;
  eventTitle: string;
  eventDate?: string;
  eventVenue?: string;
  category?: string;
  city?: string;
  recipientsCount: number;
  recipientSample: string[];
  createdByUser?: string;
}): Promise<SendEmailResult> {
  const subject = `[PulseMeet Action Required] Approval Needed: Event Notification Schedule #${params.scheduleId.slice(-6)}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); color: #ffffff; padding: 28px 32px; }
          .badge { display: inline-block; background: rgba(255, 255, 255, 0.2); padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
          .title { font-size: 20px; font-weight: 800; margin: 12px 0 4px; }
          .body { padding: 32px; font-size: 14px; line-height: 1.6; }
          .info-box { background: #f1f5f9; border-left: 4px solid #4f46e5; border-radius: 8px; padding: 16px 20px; margin: 20px 0; }
          .meta-item { margin-bottom: 8px; }
          .meta-label { font-weight: 600; color: #64748b; font-size: 12px; text-transform: uppercase; }
          .meta-value { font-size: 15px; font-weight: 700; color: #0f172a; }
          .btn-container { text-align: center; margin: 28px 0 16px; }
          .btn { background: #4f46e5; color: #ffffff !important; font-weight: 700; padding: 14px 28px; border-radius: 10px; text-decoration: none; display: inline-block; font-size: 14px; }
          .footer { border-top: 1px solid #e2e8f0; padding: 20px 32px; font-size: 12px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="badge">Super Admin Approval Required</span>
            <div class="title">New Event Notification Schedule</div>
            <div style="font-size: 13px; opacity: 0.9;">A user or AI Concierge requested an automated event dispatch</div>
          </div>
          <div class="body">
            <p>Hello <strong>Devendra</strong>,</p>
            <p>A new email notification campaign has been scheduled and requires your review before it is dispatched to platform subscribers.</p>
            
            <div class="info-box">
              <div class="meta-item">
                <div class="meta-label">Target Event / Topic</div>
                <div class="meta-value">${params.eventTitle}</div>
              </div>
              ${params.eventDate ? `
              <div class="meta-item">
                <div class="meta-label">Event Date & Venue</div>
                <div class="meta-value">${params.eventDate} ${params.eventVenue ? `· ${params.eventVenue}` : ''}</div>
              </div>` : ''}
              ${params.city ? `
              <div class="meta-item">
                <div class="meta-label">Regional Hub</div>
                <div class="meta-value">${params.city.toUpperCase()}</div>
              </div>` : ''}
              <div class="meta-item" style="margin-bottom: 0;">
                <div class="meta-label">Target Subscribers</div>
                <div class="meta-value">${params.recipientsCount} recipient(s) (${params.recipientSample.slice(0, 3).join(', ')}${params.recipientSample.length > 3 ? '...' : ''})</div>
              </div>
            </div>

            <p>To approve, inspect the email preview, or cancel this schedule, please open the <strong>Super Admin Console</strong> in your PulseMeet dashboard.</p>

            <div class="btn-container">
              <a href="http://localhost:3000" class="btn">Open Super Admin Console to Approve</a>
            </div>
          </div>
          <div class="footer">
            PulseMeet Automated Notification Engine · Super Admin Devendra (devendrs2313@gmail.com)
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: SUPER_ADMIN_EMAIL,
    subject,
    html
  });
}

/**
 * Send Event Notification Email to Subscriber
 */
export async function sendSubscriberEventNotificationEmail(params: {
  recipientEmail: string;
  recipientName?: string;
  eventTitle: string;
  eventDate: string;
  eventTime?: string;
  eventVenue: string;
  eventVenueUrl?: string;
  rsvpUrl: string;
  tagline?: string;
  organizerName: string;
  categories: string[];
}): Promise<SendEmailResult> {
  const subject = `⚡ [PulseMeet Alert] New Gathering: ${params.eventTitle}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fafafa; margin: 0; padding: 24px; color: #18181b; }
          .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
          .header { background: #4f46e5; color: #ffffff; padding: 28px 28px 24px; }
          .tag { display: inline-block; background: rgba(255,255,255,0.2); font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 9999px; margin-bottom: 8px; }
          .body { padding: 28px; }
          .detail-row { display: flex; margin-bottom: 12px; font-size: 14px; }
          .detail-label { width: 100px; color: #71717a; font-weight: 600; flex-shrink: 0; }
          .detail-val { font-weight: 700; color: #09090b; }
          .btn { background: #4f46e5; color: #ffffff !important; font-weight: 700; padding: 12px 24px; border-radius: 12px; text-decoration: none; display: inline-block; font-size: 14px; margin-top: 16px; }
          .footer { padding: 20px 28px; border-top: 1px solid #f4f4f5; font-size: 12px; color: #a1a1aa; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="tag">Event Radar Notification</span>
            <h2 style="margin: 0; font-size: 22px; font-weight: 800;">${params.eventTitle}</h2>
            ${params.tagline ? `<p style="margin: 8px 0 0; font-size: 13px; opacity: 0.9;">${params.tagline}</p>` : ''}
          </div>
          <div class="body">
            <p>Hi ${params.recipientName || 'there'},</p>
            <p>A gathering matching your automated radar preferences is scheduled:</p>

            <div style="background: #f4f4f5; padding: 18px; border-radius: 14px; margin: 18px 0;">
              <div style="margin-bottom: 8px; font-size: 13px;"><strong>📅 Date & Time:</strong> ${params.eventDate} ${params.eventTime ? `· ${params.eventTime}` : ''}</div>
              <div style="margin-bottom: 8px; font-size: 13px;"><strong>📍 Venue:</strong> ${params.eventVenue} ${params.eventVenueUrl ? `(<a href="${params.eventVenueUrl}" style="color: #4f46e5;">View Map</a>)` : ''}</div>
              <div style="margin-bottom: 0; font-size: 13px;"><strong>👥 Organizer:</strong> ${params.organizerName}</div>
            </div>

            <div style="text-align: center;">
              <a href="${params.rsvpUrl}" class="btn">View & RSVP on Event Page ↗</a>
            </div>
          </div>
          <div class="footer">
            Sent via PulseMeet · Automated Event Discovery Radar
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: params.recipientEmail,
    subject,
    html
  });
}

/**
 * DIRECT EVENT DETAILS EMAIL (NO APPROVAL REQUIRED)
 * Sent directly & immediately to the user with full event details and RSVP link.
 */
export async function sendDirectEventDetailsEmail(params: {
  recipientEmail: string;
  recipientName?: string;
  eventTitle: string;
  eventDate: string;
  eventTime?: string;
  eventVenue: string;
  eventVenueUrl?: string;
  rsvpUrl: string;
  tagline?: string;
  description?: string;
  organizerName: string;
  agenda?: string[];
  speakers?: Array<{ name: string; role: string }>;
}): Promise<SendEmailResult> {
  const subject = `📍 [PulseMeet Details] ${params.eventTitle}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #312e81 100%); color: #ffffff; padding: 32px 28px 24px; }
          .tag { display: inline-block; background: rgba(255,255,255,0.2); font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 9999px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
          .body { padding: 28px; }
          .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin: 20px 0; }
          .btn { background: #4f46e5; color: #ffffff !important; font-weight: 700; padding: 14px 28px; border-radius: 12px; text-decoration: none; display: inline-block; font-size: 14px; margin-top: 10px; }
          .footer { padding: 20px 28px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="tag">Event Details & RSVP</span>
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; line-height: 1.3;">${params.eventTitle}</h1>
            ${params.tagline ? `<p style="margin: 8px 0 0; font-size: 13px; opacity: 0.9;">${params.tagline}</p>` : ''}
          </div>
          <div class="body">
            <p>Hi <strong>${params.recipientName || 'there'}</strong>,</p>
            <p>Here are the complete gathering details and direct RSVP link you requested:</p>

            <div class="box">
              <div style="margin-bottom: 10px; font-size: 14px;"><strong>📅 Date & Time:</strong> ${params.eventDate} ${params.eventTime ? `· ${params.eventTime}` : ''}</div>
              <div style="margin-bottom: 10px; font-size: 14px;"><strong>📍 Venue:</strong> ${params.eventVenue} ${params.eventVenueUrl ? `(<a href="${params.eventVenueUrl}" style="color: #4f46e5; text-decoration: underline;">View Google Map ↗</a>)` : ''}</div>
              <div style="margin-bottom: 0; font-size: 14px;"><strong>👥 Community Host:</strong> ${params.organizerName}</div>
            </div>

            ${params.description ? `
              <div style="margin-bottom: 20px; font-size: 13px; line-height: 1.6; color: #475569;">
                <p><strong>About this event:</strong> ${params.description}</p>
              </div>
            ` : ''}

            ${params.agenda && params.agenda.length > 0 ? `
              <div style="margin-bottom: 20px;">
                <h4 style="margin: 0 0 8px; font-size: 13px; text-transform: uppercase; color: #64748b;">Agenda:</h4>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #334155;">
                  ${params.agenda.map(item => `<li style="margin-bottom: 4px;">${item}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            <div style="text-align: center; margin: 24px 0 10px;">
              <a href="${params.rsvpUrl}" class="btn">Proceed to Official RSVP Page ↗</a>
            </div>
          </div>
          <div class="footer">
            Sent by Devendra (${SUPER_ADMIN_EMAIL}) via PulseMeet · Automated Event Discovery Radar
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: params.recipientEmail,
    subject,
    html
  });
}

/**
 * CATEGORY / REGIONAL ALERT CONFIRMATION EMAIL (SENT IMMEDIATELY TO USER)
 * Informs the user that their alerts for PM, AI/ML, Finance, etc. in their area are confirmed.
 */
export async function sendCategoryAlertConfirmationEmail(params: {
  recipientEmail: string;
  recipientName?: string;
  categories: string[];
  city: string;
  timing?: string;
}): Promise<SendEmailResult> {
  const catList = params.categories.length > 0 ? params.categories.join(', ') : 'All Tech & Product Categories';
  const cityName = params.city.toUpperCase();
  const subject = `⚡ [PulseMeet] Radar Alerts Configured for ${cityName}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
          .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: #0f172a; color: #ffffff; padding: 30px 28px; }
          .badge { display: inline-block; background: #10b981; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 9999px; margin-bottom: 10px; text-transform: uppercase; }
          .body { padding: 28px; font-size: 14px; line-height: 1.6; color: #334155; }
          .pref-box { background: #f1f5f9; border-left: 4px solid #10b981; border-radius: 8px; padding: 16px 20px; margin: 20px 0; }
          .footer { padding: 20px 28px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="badge">Alerts Active</span>
            <h2 style="margin: 0; font-size: 22px; font-weight: 800;">Your Radar Alerts Are Configured!</h2>
          </div>
          <div class="body">
            <p>Hi <strong>${params.recipientName || 'there'}</strong>,</p>
            <p>Your automated PulseMeet notification preferences have been successfully configured. You'll receive email updates whenever a new gathering is listed in your selected categories and area:</p>

            <div class="pref-box">
              <div style="margin-bottom: 8px;"><strong>📍 Regional Hub:</strong> ${cityName}</div>
              <div style="margin-bottom: 8px;"><strong>🎯 Categories:</strong> ${catList}</div>
              <div style="margin-bottom: 0;"><strong>⚡ Notification Frequency:</strong> ${params.timing === 'weekly' ? 'Weekly Digest' : 'Instant when listed'}</div>
            </div>

            <p>No further action is required from you. Sit back and we'll alert you the moment exciting new meetups, summits, or workshops are published!</p>
          </div>
          <div class="footer">
            Sent by Devendra (${SUPER_ADMIN_EMAIL}) via PulseMeet · Automated Event Discovery Radar
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: params.recipientEmail,
    subject,
    html
  });
}

/**
 * ADMIN DISPATCH & APPROVAL REPORT EMAIL (SENT TO devendrs2313@gmail.com)
 * Sent when new events arrive with a breakdown of matched subscribers for approval.
 */
export async function sendAdminNewEventsMatchReportEmail(params: {
  reportId: string;
  newEventsCount: number;
  newEvents: Array<{ title: string; date: string; venue: string; categories: string[]; city: string }>;
  matchedSubscribersCount: number;
  subscriberSample: string[];
}): Promise<SendEmailResult> {
  const subject = `[PulseMeet Admin Report] ${params.newEventsCount} New Events Detected · ${params.matchedSubscribersCount} Subscribers Queued`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
          .card { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
          .header { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color: #ffffff; padding: 30px; }
          .badge { display: inline-block; background: #f59e0b; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px; text-transform: uppercase; }
          .body { padding: 30px; font-size: 14px; line-height: 1.6; }
          .table-container { background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 14px; margin: 20px 0; }
          .btn { background: #4f46e5; color: #ffffff !important; font-weight: 700; padding: 14px 28px; border-radius: 12px; text-decoration: none; display: inline-block; font-size: 14px; }
          .footer { padding: 20px 30px; border-top: 1px solid #f1f5f9; font-size: 12px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="badge">Super Admin Ingestion Report</span>
            <h2 style="margin: 0; font-size: 22px; font-weight: 800;">New Events Ingestion & Match Report</h2>
            <p style="margin: 8px 0 0; font-size: 13px; opacity: 0.85;">Report ID: #${params.reportId.slice(-6)} · Dispatch Approval Required</p>
          </div>
          <div class="body">
            <p>Hello <strong>Devendra</strong>,</p>
            <p>Our automated event ingestion pipeline detected <strong>${params.newEventsCount} new gathering(s)</strong> across platform feeds. As per active user alert subscriptions, <strong>${params.matchedSubscribersCount} user(s)</strong> are queued to receive these notifications.</p>

            <div class="table-container">
              <h4 style="margin: 0 0 12px; font-size: 13px; text-transform: uppercase; color: #475569;">Newly Listed Events:</h4>
              ${params.newEvents.map(e => `
                <div style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                  <strong style="color: #0f172a; font-size: 14px;">${e.title}</strong>
                  <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                    📍 ${e.city.toUpperCase()} · 📅 ${e.date} · 🏷️ ${e.categories.join(', ')}
                  </div>
                </div>
              `).join('')}
            </div>

            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px;">
              <strong style="color: #166534; font-size: 13px;">Queued Subscribers (${params.matchedSubscribersCount}):</strong>
              <div style="font-size: 12px; color: #15803d; margin-top: 4px;">
                ${params.subscriberSample.slice(0, 5).join(', ')}${params.subscriberSample.length > 5 ? ` and ${params.subscriberSample.length - 5} more...` : ''}
              </div>
            </div>

            <p style="font-size: 13px; color: #475569;">
              Users have not been notified yet. Please review and click below to approve and dispatch these emails via Resend.
            </p>

            <div style="text-align: center; margin: 28px 0 10px;">
              <a href="http://localhost:3000" class="btn">Approve & Broadcast via Admin Console ↗</a>
            </div>
          </div>
          <div class="footer">
            PulseMeet Automated Scheduler & Admin Control · Devendra (${SUPER_ADMIN_EMAIL})
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: SUPER_ADMIN_EMAIL,
    subject,
    html
  });
}

/**
 * SUBSCRIBER BROADCAST EMAIL (SENT AFTER ADMIN APPROVAL)
 * Clean, seamless event drop email. User does not know about any internal admin review.
 */
export async function sendSubscriberNewEventBroadcastEmail(params: {
  recipientEmail: string;
  recipientName?: string;
  eventTitle: string;
  eventDate: string;
  eventTime?: string;
  eventVenue: string;
  eventVenueUrl?: string;
  rsvpUrl: string;
  tagline?: string;
  organizerName: string;
  category: string;
  city: string;
}): Promise<SendEmailResult> {
  const subject = `⚡ [PulseMeet] New ${params.category} Gathering in ${params.city.toUpperCase()}: ${params.eventTitle}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fafafa; margin: 0; padding: 24px; color: #18181b; }
          .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e4e4e7; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
          .header { background: #4f46e5; color: #ffffff; padding: 28px; }
          .tag { display: inline-block; background: rgba(255,255,255,0.2); font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 9999px; margin-bottom: 8px; }
          .body { padding: 28px; font-size: 14px; }
          .box { background: #f4f4f5; padding: 18px; border-radius: 14px; margin: 18px 0; }
          .btn { background: #4f46e5; color: #ffffff !important; font-weight: 700; padding: 12px 24px; border-radius: 12px; text-decoration: none; display: inline-block; font-size: 14px; }
          .footer { padding: 20px 28px; border-top: 1px solid #f4f4f5; font-size: 12px; color: #a1a1aa; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="tag">${params.category} Radar Drop</span>
            <h2 style="margin: 0; font-size: 22px; font-weight: 800;">${params.eventTitle}</h2>
            ${params.tagline ? `<p style="margin: 8px 0 0; font-size: 13px; opacity: 0.9;">${params.tagline}</p>` : ''}
          </div>
          <div class="body">
            <p>Hi <strong>${params.recipientName || 'there'}</strong>,</p>
            <p>A brand new gathering has just dropped matching your radar preferences for <strong>${params.category}</strong> in <strong>${params.city.toUpperCase()}</strong>:</p>

            <div class="box">
              <div style="margin-bottom: 8px;"><strong>📅 Date & Time:</strong> ${params.eventDate} ${params.eventTime ? `· ${params.eventTime}` : ''}</div>
              <div style="margin-bottom: 8px;"><strong>📍 Venue:</strong> ${params.eventVenue} ${params.eventVenueUrl ? `(<a href="${params.eventVenueUrl}" style="color: #4f46e5;">View Map</a>)` : ''}</div>
              <div style="margin-bottom: 0;"><strong>👥 Host:</strong> ${params.organizerName}</div>
            </div>

            <div style="text-align: center; margin: 24px 0 10px;">
              <a href="${params.rsvpUrl}" class="btn">View & RSVP on Event Page ↗</a>
            </div>
          </div>
          <div class="footer">
            Sent by Devendra (${SUPER_ADMIN_EMAIL}) via PulseMeet · Automated Event Discovery Radar
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: params.recipientEmail,
    subject,
    html
  });
}

