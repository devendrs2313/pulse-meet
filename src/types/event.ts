export type EventMode = 'all' | 'offline' | 'online' | 'both';
export type FormatType = 'offline' | 'online';

export type VibeType = 'all' | 'hands-on' | 'casual-coffee' | 'deep-tech' | 'career-pitching';

export type EventType = 'meetup' | 'bootcamp' | 'hackathon' | 'conference' | 'workshop';

export interface Organizer {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  cadenceBadge: string;
  cadenceDescription?: string;
  memberCount: number;
}

export interface Speaker {
  name: string;
  role: string;
  avatar: string;
}

export type TimeHorizon = 'all' | 'this-week' | 'this-month' | 'later';

export interface EventItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  mode: 'offline' | 'online' | 'both';
  eventType: EventType;
  vibe: VibeType;
  categories: string[];
  date: string;
  time: string;
  isoDate: string; // for calendar generation
  city: string;
  area?: string; // e.g. Indiranagar, Koramangala
  venue?: string; // e.g. Google Reactor, WeWork Galaxy
  venueUrl?: string; // e.g. Google Maps link if provided by organizer
  virtualPlatform?: string; // Zoom, Google Meet, YouTube Live
  rsvpUrl: string;
  sourcePlatform: 'Luma' | 'Meetup' | 'Devpost' | 'Commudle' | 'Eventbrite' | 'LinkedIn' | 'Official';
  price: 'Free' | string;
  organizer: Organizer;
  seats?: {
    total: number;
    filled: number;
  };
  speakers?: Speaker[];
  agenda?: string[];
  bannerUrl?: string;
}

export interface PastEdition {
  id: string;
  title: string;
  date: string;
  attendees: number;
  keyTakeaways: string;
  venueOrPlatform: string;
}

export interface Community {
  id: string;
  name: string;
  avatar: string;
  coverImage?: string;
  description: string;
  city: string;
  topics: string[];
  cadence: string; // e.g. "Meets 2nd Saturday monthly"
  cadenceType?: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'ad-hoc';
  consistencyScore?: string; // e.g. "98% Reliability · 4/4 Quarters Active"
  nextForecast?: string; // e.g. "Next Edition: Expected late Nov 2026"
  activityScore: string; // e.g. "⚡ High: 4 events in last 45 days"
  memberCount: number;
  upcomingCount: number;
  pastEditions?: PastEdition[];
  featuredEventId?: string;
  externalUrl: string;
}

export interface BookingTicket {
  ticketId: string;
  eventId: string;
  eventTitle: string;
  attendeeName: string;
  attendeeEmail: string;
  bookingDate: string;
  qrCodeUrl: string;
}

export interface UserPreferences {
  city: string;
  cityName: string;
  mode: 'offline' | 'online' | 'both';
  vibe: VibeType;
  interests: string[];
  radiusKm: number;
  emailAlerts: boolean;
  telegramAlerts: boolean;
}
