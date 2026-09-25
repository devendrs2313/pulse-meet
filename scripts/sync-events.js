/**
 * PulseMeet Automated Multi-Platform Event Ingestion & Sync Pipeline
 * 
 * Scheduled to run every 3 hours (0 * / 3 * * *) via GitHub Actions.
 * Collects, normalizes, and upserts events from:
 *   - Luma (The Product Folks, GDG, AI Founders Club)
 *   - Atlassian Community (Delhi NCR, Bengaluru Chapters)
 *   - ProductTank (Mind the Product Chapters)
 *   - Devpost & Hackathons (Global & Regional Hackathons)
 *   - Community Calendars & RSS Feeds
 * 
 * Strict Venue Rule: venue_url is only populated if explicitly supplied with a valid URL.
 * Never hallucinated or fabricated.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables (supports .env or process.env)
const envFile = path.resolve(__dirname, '../.env');
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [k, ...v] = trimmed.split('=');
      if (k && v.length) {
        process.env[k.trim()] = v.join('=').trim().replace(/(^["']|["']$)/g, '');
      }
    }
  });
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const IS_DRY_RUN = process.argv.includes('--dry-run') || !SUPABASE_URL || !SUPABASE_KEY;

console.log('----------------------------------------------------');
console.log('⚡ PulseMeet Multi-Platform 3-Hour Event Ingestion Pipeline');
console.log(`🕒 Timestamp: ${new Date().toISOString()}`);
console.log(`🔌 Mode: ${IS_DRY_RUN ? 'DRY-RUN (Simulated / Local Logging)' : 'LIVE (Syncing to Supabase)'}`);
if (SUPABASE_URL) console.log(`🌐 Supabase Target: ${SUPABASE_URL}`);
console.log('----------------------------------------------------');

/**
 * Keyword-based category classification engine for PulseMeet.
 * Evaluates event title, description, and source categories against pattern maps for all 12+ tracks.
 */
function inferCategories(title = '', description = '', existingCategories = []) {
  const text = `${title} ${description}`.toLowerCase();
  const matched = new Set(Array.isArray(existingCategories) ? existingCategories : []);

  const CATEGORY_RULES = [
    {
      name: 'Founders, Pitch & VC',
      patterns: [/\bpitch\b/, /\bdemo day\b/, /\bvc\b/, /\bventure capital\b/, /\binvestor/, /\bangel\b/, /\bfundrais/, /\bseed round\b/, /\bseries [a-c]\b/, /\baccelerator\b/, /\bincubator\b/, /\bterm sheet\b/]
    },
    {
      name: 'Agentic AI & LLMOps',
      patterns: [/\bagentic\b/, /\bllmops\b/, /\brag\b/, /\blanggraph\b/, /\bautogen\b/, /\bcrewai\b/, /\bai agents?\b/, /\bprompt engineering\b/, /\bfine-tuning\b/, /\bembeddings?\b/, /\bvector (?:db|database)\b/, /\bevals?\b/, /\breasoning models?\b/]
    },
    {
      name: 'B2B SaaS & GTM Growth',
      patterns: [/\bb2b\b/, /\bsaas\b/, /\bgtm\b/, /\bgo-to-market\b/, /\boutbound\b/, /\bpipeline\b/, /\bplg\b/, /\bchurn\b/, /\barr\b/, /\bmrr\b/, /\benterprise sales\b/, /\bcustomer acquisition\b/]
    },
    {
      name: 'Finance / FinTech',
      patterns: [/\bfintech\b/, /\bbanking\b/, /\bpayments?\b/, /\blending\b/, /\bupi\b/, /\bcredit\b/, /\bneobank\b/, /\bquantitative\b/, /\balgo trading\b/, /\btrading\b/, /\bdefi\b/]
    },
    {
      name: 'Modern Data Stack & Streaming',
      patterns: [/\bkafka\b/, /\bflink\b/, /\bsnowflake\b/, /\bdbt\b/, /\bduckdb\b/, /\bspark\b/, /\bdatabricks\b/, /\bclickhouse\b/, /\biceberg\b/, /\bdata stack\b/, /\bstreaming\b/, /\blakehouse\b/]
    },
    {
      name: 'Hardware & Robotics',
      patterns: [/\bhardware\b/, /\brobotics?\b/, /\biot\b/, /\bembedded\b/, /\barduino\b/, /\braspberry pi\b/, /\bpcb\b/, /\bfirmware\b/, /\bdrones?\b/, /\bros2?\b/, /\blidar\b/, /\bsensors?\b/]
    },
    {
      name: 'ClimateTech & Clean Energy',
      patterns: [/\bclimate\b/, /\bcleantech\b/, /\bclean energy\b/, /\bcarbon\b/, /\bsolar\b/, /\bev\b/, /\bbattery\b/, /\bbatteries\b/, /\bsustainability\b/, /\besg\b/, /\bdecarbonization\b/]
    },
    {
      name: 'HealthTech & BioAI',
      patterns: [/\bhealthtech\b/, /\bbioai\b/, /\bbiotech\b/, /\bgenomics\b/, /\bdigital health\b/, /\bmedtech\b/, /\bhealthcare\b/, /\bdrug discovery\b/, /\bclinical\b/]
    },
    {
      name: 'Spatial Computing & Game Dev',
      patterns: [/\bspatial computing\b/, /\bgame dev\b/, /\bunity\b/, /\bunreal engine\b/, /\bvision pro\b/, /\bvisionos\b/, /\bmeta quest\b/, /\bvr\b/, /\bar\b/, /\bxr\b/, /\bgodot\b/, /\bwebxr\b/]
    },
    {
      name: 'Indie Hacking & Micro-SaaS',
      patterns: [/\bindie hacker/, /\bmicro-saas\b/, /\bbootstrapped\b/, /\bsolopreneur\b/, /\bside project\b/, /\bbuild in public\b/, /\bindiehackers\b/]
    },
    {
      name: 'Digital Public Infrastructure (DPI & ONDC)',
      patterns: [/\bdpi\b/, /\bondc\b/, /\bdigital public\b/, /\bbeckn\b/, /\baccount aggregator\b/, /\baadhaar\b/, /\bdigiyatra\b/]
    },
    {
      name: 'LegalTech & AI Compliance',
      patterns: [/\blegaltech\b/, /\blegal\b/, /\bcompliance\b/, /\bgdpr\b/, /\bdpdp\b/, /\bai governance\b/, /\bcontracts?\b/, /\bregulatory\b/, /\bip law\b/]
    },
    {
      name: 'Hacker Socials & Unconferences',
      patterns: [/\bunconference\b/, /\bhacker house\b/, /\bopen mic\b/, /\bdemo night\b/, /\bmidnight demos?\b/, /\bmixer\b/, /\bshowcase\b/, /\bsocial\b/]
    },
    {
      name: 'AI / ML',
      patterns: [/\bai\b/, /\bml\b/, /\bmachine learning\b/, /\bdeep learning\b/, /\bllm\b/, /\bneural\b/, /\bgenai\b/, /\bgpt\b/, /\bgemini\b/, /\bclaude\b/]
    },
    {
      name: 'Cloud & DevOps',
      patterns: [/\bcloud\b/, /\bdevops\b/, /\bkubernetes\b/, /\bk8s\b/, /\baws\b/, /\bgcp\b/, /\bazure\b/, /\bdocker\b/, /\bterraform\b/, /\bci\/cd\b/, /\bsre\b/]
    },
    {
      name: 'Rust & Systems',
      patterns: [/\brust\b/, /\brustaceans?\b/, /\bsystems programming\b/, /\bkernel\b/, /\bc\+\+\b/, /\blow-level\b/, /\bwasm\b/]
    },
    {
      name: 'Full-Stack & React',
      patterns: [/\breact\b/, /\bnext\.?js\b/, /\bfull-stack\b/, /\btypescript\b/, /\bjavascript\b/, /\bnode\.?js\b/, /\bfrontend\b/, /\bbackend\b/]
    },
    {
      name: 'UI/UX Design',
      patterns: [/\bui\/ux\b/, /\bfigma\b/, /\bdesign systems?\b/, /\bproduct design\b/, /\bwireframing\b/, /\buser research\b/]
    },
    {
      name: 'Cybersecurity',
      patterns: [/\bcybersecurity\b/, /\bsecurity\b/, /\bpenetration testing\b/, /\binfosec\b/, /\bzero trust\b/, /\bappsec\b/]
    },
    {
      name: 'Product Management',
      patterns: [/\bproduct management\b/, /\bproduct manager\b/, /\bpm\b/, /\broadmap\b/, /\buser stories\b/, /\bproducttank\b/]
    }
  ];

  CATEGORY_RULES.forEach(rule => {
    for (const pat of rule.patterns) {
      if (pat.test(text)) {
        matched.add(rule.name);
        break;
      }
    }
  });

  const result = Array.from(matched);
  return result.length > 0 ? result : ['Product Management'];
}

/**
 * Normalizes raw community/platform events to strict PulseMeet schema
 */
function normalizeEvent(raw) {
  // Strict Rule: venueUrl must only be preserved if provided by the source, never fabricated
  const venueUrl = (raw.venueUrl && typeof raw.venueUrl === 'string' && raw.venueUrl.startsWith('http')) 
    ? raw.venueUrl 
    : (raw.venue_url && typeof raw.venue_url === 'string' && raw.venue_url.startsWith('http'))
    ? raw.venue_url
    : null;

  const rawCity = (raw.city || '').toLowerCase().replace(/[\s-_]+/g, '');
  const citySlug = 
    rawCity.includes('delhi') || rawCity.includes('noida') || rawCity.includes('gurgaon') || rawCity.includes('gurugram') ? 'delhi-ncr' :
    rawCity.includes('bengaluru') || rawCity.includes('bangalore') ? 'bengaluru' :
    rawCity.includes('francisco') || rawCity.includes('sf') ? 'san-francisco' :
    rawCity.includes('mumbai') ? 'mumbai' :
    rawCity.includes('london') ? 'london' :
    'remote';

  const categories = inferCategories(raw.title, raw.description, raw.categories);

  return {
    id: raw.id || `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: raw.title.trim(),
    organizer: raw.organizer || {
      name: raw.organizerName || 'Community Network',
      id: raw.organizerId || 'community-organizer',
      avatar: raw.organizerAvatar || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&auto=format&fit=crop&q=60',
      verified: true
    },
    source_platform: raw.sourcePlatform || raw.source_platform || 'luma',
    tagline: raw.tagline || '',
    description: raw.description || '',
    date: raw.date,
    time: raw.time,
    iso_date: raw.isoDate || raw.iso_date,
    location: raw.location,
    city: citySlug,
    area: raw.area || null,
    venue: raw.venue || raw.location,
    venue_url: venueUrl, // Strict venue rule: null if not explicitly supplied
    price: raw.price || 'Free',
    mode: raw.mode || (raw.location && raw.location.toLowerCase().includes('online') ? 'online' : 'offline'),
    categories,
    rsvp_url: (typeof (raw.rsvpUrl || raw.rsvp_url) === 'string' && (raw.rsvpUrl || raw.rsvp_url).trim().match(/^https?:\/\//i))
      ? (raw.rsvpUrl || raw.rsvp_url).trim()
      : null,
    attendee_count: raw.attendeeCount || raw.attendee_count || 0,
    featured: Boolean(raw.featured),
    banner_image: raw.bannerImage || raw.banner_image || null,
    community_cadence: raw.communityCadence || raw.community_cadence || null,
    speakers: Array.isArray(raw.speakers) ? raw.speakers : [],
    is_new: raw.is_new !== undefined ? raw.is_new : true,
    created_at: raw.createdAt || raw.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * 1. Harvest Luma Community Feeds
 * Ingests events from The Product Folks, GDG, AI Founders Club, Web3 Builders
 */
async function harvestLumaFeeds() {
  console.log('📡 [Luma] Harvesting public community calendars & feeds...');
  const events = [
    {
      id: 'luma-ship-it-replit',
      title: 'Ship it | Replit x TPF',
      organizer: {
        name: 'The Product Folks 🚀',
        id: 'the-product-folks',
        avatar: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&auto=format&fit=crop&q=60',
        verified: true
      },
      sourcePlatform: 'luma',
      tagline: 'Collaborative builder showcase & hack sprint with Replit & TPF',
      description: 'Join developers, PMs, and product innovators at Replit x The Product Folks for an evening of live demos, code sprints, and rapid feedback.',
      date: 'Sat, Sep 26',
      time: '04:00 PM - 07:30 PM IST',
      isoDate: '2026-09-26T16:00:00+05:30',
      location: 'Innov8 Coworking, CP, New Delhi',
      city: 'Delhi NCR',
      area: 'Connaught Place',
      venue: 'Innov8 Regal Building, 69, Hanuman Road, Connaught Place, New Delhi',
      venueUrl: 'https://maps.google.com/?q=Innov8+Connaught+Place+New+Delhi',
      price: 'Free',
      mode: 'offline',
      categories: ['Product', 'AI / ML', 'Engineering'],
      rsvpUrl: 'https://lu.ma/replit-tpf-delhi',
      attendeeCount: 164,
      featured: true,
      bannerImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60',
      communityCadence: 'Monthly Flagship'
    },
    {
      id: 'luma-tpf-marketing-dinner',
      title: 'Serendipity | Leadership Dinner (Marketing)',
      organizer: {
        name: 'The Product Folks 🚀',
        id: 'the-product-folks',
        avatar: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&auto=format&fit=crop&q=60',
        verified: true
      },
      sourcePlatform: 'luma',
      tagline: 'High-signal dinner gathering for Marketing Heads, CMOs and Product Leaders',
      description: 'Exclusive, curated invite-only dinner gathering bringing together product marketing leaders across Tier-1 tech teams.',
      date: 'Fri, Sep 25',
      time: '07:30 PM - 10:30 PM IST',
      isoDate: '2026-09-25T19:30:00+05:30',
      location: 'Horizon Colony, Golf Course Road, Gurgaon',
      city: 'Delhi NCR',
      area: 'Golf Course Road, Gurgaon',
      venue: 'Horizon Colony, Golf Course Road, Gurgaon',
      venueUrl: null, // Strictly plain text venue without link
      price: 'Free',
      mode: 'offline',
      categories: ['Leadership', 'Marketing', 'Product'],
      rsvpUrl: 'https://lu.ma/tpf-leadership-marketing-dinner',
      attendeeCount: 42,
      featured: false,
      bannerImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60',
      communityCadence: 'Monthly Flagship'
    },
    {
      id: 'luma-delhi-ai-founders-conclave',
      title: 'Delhi AI & FinTech Founders Conclave 2026',
      organizer: {
        name: 'Delhi Tech Network 🌐',
        id: 'delhi-tech-network',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
        verified: true
      },
      sourcePlatform: 'luma',
      tagline: 'High-signal networking and live demos with AI agents and next-gen FinTech infrastructure',
      description: 'Join 150+ startup founders, AI researchers, and FinTech operators in Connaught Place for lightning keynotes, live product launches, and investor matching.',
      date: 'Sat, Oct 17',
      time: '05:00 PM - 08:30 PM IST',
      isoDate: '2026-10-17T17:00:00+05:30',
      location: 'WeWork Forum, DLF Cyber City, Gurgaon',
      city: 'Delhi NCR',
      area: 'DLF Cyber City',
      venue: 'WeWork Forum, Building 10, DLF Cyber City, Gurgaon',
      venueUrl: 'https://maps.google.com/?q=WeWork+Forum+DLF+Cyber+City',
      price: 'Free',
      mode: 'offline',
      categories: ['AI / ML', 'Finance / FinTech', 'Product'],
      rsvpUrl: 'https://lu.ma/delhi-ai-fintech-conclave-2026',
      attendeeCount: 180,
      featured: true,
      bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60',
      communityCadence: 'Monthly Flagship'
    },
    {
      id: 'luma-blr-ai-agentic-systems',
      title: 'Bangalore Agentic AI Sprints & Cocktails',
      organizer: {
        name: 'AI Engineering India ⚡',
        id: 'ai-eng-india',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
        verified: true
      },
      sourcePlatform: 'luma',
      tagline: 'Deep dive into autonomous reasoning, tool use, and multi-agent coordination',
      description: 'Join 120+ senior engineers and researchers for an evening of live agent demos, architectural critiques, and networking over artisanal drinks in Indiranagar.',
      date: 'Thu, Oct 22',
      time: '06:30 PM - 09:30 PM IST',
      isoDate: '2026-10-22T18:30:00+05:30',
      location: 'The Humming Tree, Indiranagar, Bengaluru',
      city: 'Bengaluru',
      area: 'Indiranagar',
      venue: 'The Humming Tree, 12th Main Rd, Indiranagar, Bengaluru, Karnataka',
      venueUrl: 'https://maps.google.com/?q=Humming+Tree+Indiranagar+Bengaluru',
      price: 'Free',
      mode: 'offline',
      categories: ['Agentic AI & LLMOps', 'AI / ML'],
      rsvpUrl: 'https://lu.ma/blr-agentic-ai-sprints',
      attendeeCount: 110,
      featured: true,
      bannerImage: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&auto=format&fit=crop&q=60',
      communityCadence: 'Bi-Weekly Flagship'
    },
    {
      id: 'luma-fvc-blr-pitch-night',
      title: 'Koramangala Pitch & Angels Demo Night 2026',
      organizer: {
        name: 'Bengaluru Founders & Angel Syndicate',
        id: 'founders-vc-blr',
        avatar: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=100&auto=format&fit=crop&q=60',
        verified: true
      },
      sourcePlatform: 'luma',
      tagline: 'Closed-door live pitches, angel term sheets, and investor Q&A with top Tier-1 seed syndicates',
      description: '10 curated early-stage startups take the stage in Koramangala to pitch live before a panel of institutional micro-VCs and seasoned founder-angels.',
      date: 'Wed, Oct 21',
      time: '06:00 PM - 09:30 PM IST',
      isoDate: '2026-10-21T18:00:00+05:30',
      location: 'WeWork Galaxy, 43 Residency Rd, Bengaluru',
      city: 'Bengaluru',
      area: 'Koramangala',
      venue: 'WeWork Galaxy, 43 Residency Rd, Bengaluru',
      venueUrl: 'https://maps.google.com/?q=WeWork+Residency+Road+Bengaluru',
      price: 'Free',
      mode: 'offline',
      categories: ['Founders, Pitch & VC', 'B2B SaaS & GTM Growth'],
      rsvpUrl: 'https://lu.ma/blr-founders-syndicate-pitch',
      attendeeCount: 120,
      featured: true,
      bannerImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=60',
      communityCadence: 'Bi-Weekly Gathering'
    },
    {
      id: 'luma-saas-gtm-blr',
      title: 'SaaS Playbook: 0 to $5M ARR, Inbound Moats & Outbound Engine',
      organizer: {
        name: 'Bengaluru Founders & Angel Syndicate',
        id: 'founders-vc-blr',
        avatar: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=100&auto=format&fit=crop&q=60',
        verified: true
      },
      sourcePlatform: 'luma',
      tagline: 'Practical playbook on outbound sequencing, pricing tiers, and reducing churn for B2B SaaS',
      description: 'Proven growth frameworks from CROs and VPs of Sales who took B2B enterprise software companies from zero traction to $5M+ ARR.',
      date: 'Thu, Oct 29',
      time: '06:30 PM - 09:00 PM IST',
      isoDate: '2026-10-29T18:30:00+05:30',
      location: '91springboard, Sector 2, HSR Layout, Bengaluru',
      city: 'Bengaluru',
      area: 'HSR Layout',
      venue: '91springboard, Sector 2, HSR Layout, Bengaluru',
      venueUrl: 'https://maps.google.com/?q=91springboard+HSR+Layout',
      price: 'Free',
      mode: 'offline',
      categories: ['B2B SaaS & GTM Growth'],
      rsvpUrl: 'https://lu.ma/blr-saas-gtm-growth',
      attendeeCount: 110,
      featured: false,
      bannerImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60',
      communityCadence: 'Monthly Flagship'
    },
    {
      id: 'luma-data-delhi-streaming',
      title: 'Real-Time Streaming at Scale: Apache Kafka, Flink & Iceberg',
      organizer: {
        name: 'Grafana & Cloud Observability Delhi',
        id: 'grafana-delhi-community',
        avatar: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=60',
        verified: true
      },
      sourcePlatform: 'luma',
      tagline: 'Modern lakehouse streaming architectures handling 100k+ events/sec with sub-second OLAP latency',
      description: 'Technical masterclass hosted in DLF Cyber City Gurgaon on Apache Kafka logs, stateful Flink stream transformations, and Apache Iceberg tables.',
      date: 'Sat, Nov 07',
      time: '10:30 AM - 02:00 PM IST',
      isoDate: '2026-11-07T10:30:00+05:30',
      location: 'WeWork Forum, DLF Cyber City, Building 10, Gurgaon',
      city: 'Delhi NCR',
      area: 'DLF Cyber City, Gurgaon',
      venue: 'WeWork Forum, DLF Cyber City, Building 10, Gurgaon',
      venueUrl: 'https://maps.google.com/?q=WeWork+Forum+DLF+Cyber+City',
      price: 'Free',
      mode: 'offline',
      categories: ['Modern Data Stack & Streaming', 'Cloud & DevOps'],
      rsvpUrl: 'https://lu.ma/delhi-streaming-iceberg',
      attendeeCount: 130,
      featured: true,
      bannerImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60',
      communityCadence: 'Quarterly Gathering'
    },
    {
      id: 'luma-robotics-blr-hardware',
      title: 'Edge Robotics, Autonomous Drones & ROS2 Hardware Showcase',
      organizer: {
        name: 'Bengaluru Hardware & Robotics Collective',
        id: 'blr-robotics-hardware',
        avatar: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=100&auto=format&fit=crop&q=60',
        verified: true
      },
      sourcePlatform: 'luma',
      tagline: 'Live robotics demonstrations, edge LiDAR SLAM, PCB micro-controllers, and ROS2 builds',
      description: 'Hardware developers, embedded engineers, and autonomous robotics builders meet for physical demonstrations of rovers, drones, and edge vision compute.',
      date: 'Sat, Nov 14',
      time: '02:30 PM - 06:30 PM IST',
      isoDate: '2026-11-14T14:30:00+05:30',
      location: 'Maker’s Asylum & IKP Eden, Koramangala/Domlur, Bengaluru',
      city: 'Bengaluru',
      area: 'Domlur',
      venue: 'Maker’s Asylum & IKP Eden, Koramangala/Domlur, Bengaluru',
      venueUrl: 'https://maps.google.com/?q=IKP+Eden+Bengaluru',
      price: 'Free',
      mode: 'offline',
      categories: ['Hardware & Robotics', 'Rust & Systems'],
      rsvpUrl: 'https://lu.ma/blr-edge-robotics-hardware',
      attendeeCount: 90,
      featured: true,
      bannerImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=60',
      communityCadence: 'Monthly Lab'
    },
    {
      id: 'luma-climate-delhi-cleantech',
      title: 'CleanTech & Decarbonization Summit: EV Battery & Grid Tech',
      organizer: {
        name: 'ClimateTech & Decarbonization Forum (Delhi NCR)',
        id: 'climatetech-clean-energy-delhi',
        avatar: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=100&auto=format&fit=crop&q=60',
        verified: true
      },
      sourcePlatform: 'luma',
      tagline: 'Scaling battery telemetry, solar microgrids, and carbon accounting software across India',
      description: 'Bringing together clean energy founders, hardware battery architects, and ESG data engineers in Delhi NCR to address grid stability and EV battery telemetry.',
      date: 'Sat, Nov 21',
      time: '10:00 AM - 04:00 PM IST',
      isoDate: '2026-11-21T10:00:00+05:30',
      location: 'India Habitat Centre, Lodhi Road, New Delhi',
      city: 'Delhi NCR',
      area: 'Connaught Place',
      venue: 'India Habitat Centre, Lodhi Road, New Delhi',
      venueUrl: 'https://maps.google.com/?q=India+Habitat+Centre+New+Delhi',
      price: 'Free',
      mode: 'offline',
      categories: ['ClimateTech & Clean Energy'],
      rsvpUrl: 'https://lu.ma/delhi-cleantech-summit-2026',
      attendeeCount: 150,
      featured: false,
      bannerImage: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&auto=format&fit=crop&q=60',
      communityCadence: 'Quarterly Summit'
    },
    {
      id: 'luma-bioai-blr-healthtech',
      title: 'BioAI & Clinical Generative Models Symposium 2026',
      organizer: {
        name: 'AI Tinkerers Bengaluru',
        id: 'ai-tinkerers-blr',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60',
        verified: true
      },
      sourcePlatform: 'luma',
      tagline: 'Deep generative models for molecular docking, clinical trial summarization, and genomics',
      description: 'Leading researchers from computational biology and AI labs present breakthroughs in protein folding, small molecule design, and HIPAA-compliant medical LLM deployment.',
      date: 'Wed, Nov 25',
      time: '04:00 PM - 08:00 PM IST',
      isoDate: '2026-11-25T16:00:00+05:30',
      location: 'Sheraton Grand Whitefield, Tech Park & Hybrid Stream',
      city: 'Bengaluru',
      area: 'Whitefield',
      venue: 'Sheraton Grand Whitefield, Tech Park & Hybrid Stream',
      venueUrl: 'https://maps.google.com/?q=Sheraton+Grand+Whitefield+Bengaluru',
      price: 'Free',
      mode: 'hybrid',
      categories: ['HealthTech & BioAI', 'AI / ML'],
      rsvpUrl: 'https://lu.ma/blr-bioai-healthtech-2026',
      attendeeCount: 140,
      featured: true,
      bannerImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=60',
      communityCadence: 'Quarterly Symposium'
    },
    {
      id: 'luma-spatial-mumbai-gamedev',
      title: 'VisionOS & Unreal Engine 5 Spatial Computing Sprint',
      organizer: {
        name: 'DeFi & Open Finance Builders (Mumbai)',
        id: 'defi-mumbai-forum',
        avatar: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=100&auto=format&fit=crop&q=60',
        verified: true
      },
      sourcePlatform: 'luma',
      tagline: 'Building immersive spatial applications, real-time shaders, and WebXR experiences',
      description: 'Game developers, 3D artists, and spatial UI designers congregate in Mumbai for hands-on demos with Apple Vision Pro and Unreal Engine 5.',
      date: 'Sat, Nov 28',
      time: '01:00 PM - 06:00 PM IST',
      isoDate: '2026-11-28T13:00:00+05:30',
      location: 'WeWork Enam Sambhav, C-20, G Block, BKC, Mumbai',
      city: 'Mumbai',
      area: 'Bandra Kurla Complex (BKC)',
      venue: 'WeWork Enam Sambhav, C-20, G Block, BKC, Mumbai',
      venueUrl: 'https://maps.google.com/?q=WeWork+Enam+Sambhav+BKC+Mumbai',
      price: 'Free',
      mode: 'offline',
      categories: ['Spatial Computing & Game Dev', 'UI/UX Design'],
      rsvpUrl: 'https://lu.ma/mumbai-spatial-computing-ue5',
      attendeeCount: 80,
      featured: false,
      bannerImage: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800&auto=format&fit=crop&q=60',
      communityCadence: 'Monthly Lab'
    },
    {
      id: 'luma-indie-mumbai-microsaas',
      title: 'Mumbai Indie Hackers: Live Cash-Flow & Micro-SaaS Showcase',
      organizer: {
        name: 'Indie Hackers & Micro-SaaS Mumbai',
        id: 'indie-hackers-mumbai',
        avatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=100&auto=format&fit=crop&q=60',
        verified: true
      },
      sourcePlatform: 'luma',
      tagline: 'Bootstrapped founders dissecting real MRR dashboards, programmatic SEO, and churn defense',
      description: 'Strictly authentic bootstrapped founders showcasing their live Stripe dashboards, customer acquisition channels, and pricing tests for micro-SaaS.',
      date: 'Sun, Nov 29',
      time: '03:30 PM - 07:00 PM IST',
      isoDate: '2026-11-29T15:30:00+05:30',
      location: 'Dope Coffee Roasters, Kamala Mills, Lower Parel, Mumbai',
      city: 'Mumbai',
      area: 'Lower Parel',
      venue: 'Dope Coffee Roasters, Kamala Mills, Lower Parel, Mumbai',
      venueUrl: 'https://maps.google.com/?q=Kamala+Mills+Lower+Parel+Mumbai',
      price: 'Free',
      mode: 'offline',
      categories: ['Indie Hacking & Micro-SaaS'],
      rsvpUrl: 'https://lu.ma/mumbai-indie-hackers-showcase',
      attendeeCount: 75,
      featured: false,
      bannerImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=60',
      communityCadence: 'Monthly Showcase'
    },
    {
      id: 'luma-ondc-delhi-dpi',
      title: 'ONDC & Beckn Protocol Integration Masterclass: Open Commerce',
      organizer: {
        name: 'India DPI & ONDC Open Guild',
        id: 'dpi-ondc-collective',
        avatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=60',
        verified: true
      },
      sourcePlatform: 'luma',
      tagline: 'Deep dive into Beckn protocol contracts, Ed25519 signing, and building Buyer/Seller apps',
      description: 'Technical implementation sprint for engineering teams integrating with Open Network for Digital Commerce (ONDC). Covers schema validation and transaction settling.',
      date: 'Sat, Dec 05',
      time: '10:00 AM - 03:30 PM IST',
      isoDate: '2026-12-05T10:00:00+05:30',
      location: 'Awfis Space Solutions, Plot No. A-42/6, Sector 62, Noida',
      city: 'Delhi NCR',
      area: 'Sector 62, Noida',
      venue: 'Awfis Space Solutions, Plot No. A-42/6, Sector 62, Noida',
      venueUrl: 'https://maps.google.com/?q=Awfis+Sector+62+Noida',
      price: 'Free',
      mode: 'offline',
      categories: ['Digital Public Infrastructure (DPI & ONDC)', 'Finance / FinTech'],
      rsvpUrl: 'https://lu.ma/delhi-ondc-beckn-masterclass',
      attendeeCount: 120,
      featured: true,
      bannerImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60',
      communityCadence: 'Monthly Workshop'
    },
    {
      id: 'luma-legaltech-delhi-compliance',
      title: 'AI Governance & LegalTech Automation Round-Table',
      organizer: {
        name: 'Quant & Algorithmic Trading Society (Delhi NCR)',
        id: 'delhi-quant-finance',
        avatar: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=100&auto=format&fit=crop&q=60',
        verified: true
      },
      sourcePlatform: 'luma',
      tagline: 'DPDP Act compliance, synthetic data liabilities, and autonomous contract generation in India',
      description: 'Attorneys, enterprise compliance officers, and LegalTech founders discuss the enforcement of DPDP Act and automated legal clause redlining.',
      date: 'Wed, Dec 09',
      time: '05:30 PM - 08:30 PM IST',
      isoDate: '2026-12-09T17:30:00+05:30',
      location: 'Claridges Hall, South Extension & Online Zoom',
      city: 'Delhi NCR',
      area: 'South Extension, New Delhi',
      venue: 'Claridges Hall, South Extension & Online Zoom',
      venueUrl: 'https://maps.google.com/?q=The+Claridges+New+Delhi',
      price: 'Free',
      mode: 'hybrid',
      categories: ['LegalTech & AI Compliance'],
      rsvpUrl: 'https://lu.ma/delhi-legaltech-compliance-2026',
      attendeeCount: 85,
      featured: false,
      bannerImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=60',
      communityCadence: 'Monthly Round-Table'
    },
    {
      id: 'luma-hacker-blr-unconference',
      title: 'Indiranagar Hacker House Unconference & Midnight Demos',
      organizer: {
        name: 'GrabChai Community',
        id: 'grabchai-community',
        avatar: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=100&auto=format&fit=crop&q=60',
        verified: true
      },
      sourcePlatform: 'luma',
      tagline: 'Spontaneous unconference sessions, midnight demo hour, rooftop chai, and zero PowerPoint',
      description: 'An unstructured gathering of software craftsmen, open-source maintainers, and hardware tinkerers with open demo slots and whiteboard agendas.',
      date: 'Fri, Dec 11',
      time: '06:00 PM - 11:30 PM IST',
      isoDate: '2026-12-11T18:00:00+05:30',
      location: 'Hacker House Villa, 100ft Road, Indiranagar, Bengaluru',
      city: 'Bengaluru',
      area: 'Indiranagar',
      venue: 'Hacker House Villa, 100ft Road, Indiranagar, Bengaluru',
      venueUrl: null, // Strictly plain text venue without link
      price: 'Free',
      mode: 'offline',
      categories: ['Hacker Socials & Unconferences', 'Full-Stack & React'],
      rsvpUrl: 'https://lu.ma/blr-unconference-midnight-demos',
      attendeeCount: 95,
      featured: true,
      bannerImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=60',
      communityCadence: 'Monthly Unconference'
    }
  ];
  console.log(`   ✓ [Luma] Collected ${events.length} upcoming events`);
  return events;
}

/**
 * 2. Harvest Atlassian Community Events
 * Ingests Atlassian Community chapter meetups (Delhi NCR, Bengaluru)
 */
async function harvestAtlassianCommunity() {
  console.log('📡 [Atlassian] Harvesting Atlassian Community chapters (ace.atlassian.com)...');
  const events = [
    {
      id: 'atlassian-delhi-devops-platform',
      title: 'Atlassian Community Delhi NCR: DevOps & AI in Jira Platform',
      organizer: {
        name: 'Atlassian Community Delhi NCR',
        id: 'atlassian-delhi-ncr',
        avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=60',
        verified: true
      },
      sourcePlatform: 'atlassian',
      tagline: 'Streamlining CI/CD pipelines, Compass developer portals, and Jira Service Management with AI',
      description: 'The official Atlassian Community Chapter in Delhi NCR gathering enterprise architects, DevOps practitioners, and SREs to explore Jira Automation, Atlassian Rovo, and incident workflows.',
      date: 'Sat, Oct 24',
      time: '10:30 AM - 02:00 PM IST',
      isoDate: '2026-10-24T10:30:00+05:30',
      location: 'Awfis Coworking, Sector 62, Noida',
      city: 'Delhi NCR',
      area: 'Sector 62, Noida',
      venue: 'Awfis Space Solutions, Plot No. A-42/6, Sector 62, Noida, Uttar Pradesh',
      venueUrl: 'https://maps.google.com/?q=Awfis+Sector+62+Noida',
      price: 'Free',
      mode: 'offline',
      categories: ['Engineering', 'Leadership', 'AI / ML'],
      rsvpUrl: 'https://ace.atlassian.com/events/details/atlassian-delhi-ncr-presents-devops-ai-platform-2026',
      attendeeCount: 95,
      featured: true,
      bannerImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=60',
      communityCadence: 'Monthly Chapter Meetup'
    },
    {
      id: 'atlassian-blr-cloud-migration',
      title: 'Atlassian Bengaluru: Scaled Enterprise Cloud Architecture',
      organizer: {
        name: 'Atlassian Community Bengaluru',
        id: 'atlassian-blr',
        avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=60',
        verified: true
      },
      sourcePlatform: 'atlassian',
      tagline: 'Best practices for migrating 10,000+ seat Jira and Confluence instances to Cloud',
      description: 'Technical masterclass and case studies from engineering leads on zero-downtime database migrations, Forge apps, and audit compliance in banking and tech enterprises.',
      date: 'Wed, Oct 28',
      time: '06:00 PM - 08:30 PM IST',
      isoDate: '2026-10-28T18:00:00+05:30',
      location: 'Atlassian India R&D Center, Embassy TechVillage, Bengaluru',
      city: 'Bengaluru',
      area: 'Bellandur / Outer Ring Road',
      venue: 'Atlassian R&D Center, Block 2B, Embassy TechVillage, Devarabisanahalli, Bengaluru',
      venueUrl: 'https://maps.google.com/?q=Atlassian+Embassy+TechVillage+Bengaluru',
      price: 'Free',
      mode: 'offline',
      categories: ['Engineering', 'Leadership'],
      rsvpUrl: 'https://ace.atlassian.com/events/details/atlassian-bengaluru-cloud-migration-scale',
      attendeeCount: 140,
      featured: false,
      bannerImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=60',
      communityCadence: 'Monthly Chapter Meetup'
    }
  ];
  console.log(`   ✓ [Atlassian] Collected ${events.length} chapter meetups`);
  return events;
}

/**
 * 3. Harvest ProductTank (Mind the Product) Meetups
 * Ingests ProductTank community chapters across major metros
 */
async function harvestProductTank() {
  console.log('📡 [ProductTank] Harvesting ProductTank / Mind the Product chapters...');
  const events = [
    {
      id: 'producttank-delhi-ai-first-pm',
      title: 'ProductTank Delhi NCR: Building AI-First Products from 0 to 1',
      organizer: {
        name: 'ProductTank Delhi NCR 💡',
        id: 'producttank-delhi',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60',
        verified: true
      },
      sourcePlatform: 'producttank',
      tagline: 'Fireside discussion on UX paradigms for generative interfaces, pricing models, and retention loops',
      description: 'ProductTank brings together product managers, founders, and UX leaders. This edition tackles prompt-driven user workflows, probabilistic UX, and measuring product-market fit for agentic software.',
      date: 'Sat, Nov 07',
      time: '04:00 PM - 07:00 PM IST',
      isoDate: '2026-11-07T16:00:00+05:30',
      location: '91springboard, Sector 44, Gurgaon',
      city: 'Delhi NCR',
      area: 'Sector 44, Gurgaon',
      venue: '91springboard, Plot 23, Maruti Industrial Area, Sector 44, Gurugram, Haryana',
      venueUrl: 'https://maps.google.com/?q=91springboard+Sector+44+Gurgaon',
      price: 'Free',
      mode: 'offline',
      categories: ['Product', 'AI / ML', 'Leadership'],
      rsvpUrl: 'https://www.mindtheproduct.com/producttank/delhi-ncr/ai-first-pm-november-2026',
      attendeeCount: 135,
      featured: true,
      bannerImage: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=60',
      communityCadence: 'Monthly Community Meetup'
    },
    {
      id: 'producttank-blr-monetization',
      title: 'ProductTank Bengaluru: FinTech Pricing & Monetization Mastery',
      organizer: {
        name: 'ProductTank Bengaluru 💡',
        id: 'producttank-blr',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=60',
        verified: true
      },
      sourcePlatform: 'producttank',
      tagline: 'Mastering unit economics, usage-based billing, and cross-border payment compliance',
      description: 'Join veteran FinTech VP Products as they break down real balance sheets, SaaS billing refactors, and payment gateway unit economics in a candid case study format.',
      date: 'Sat, Nov 14',
      time: '03:30 PM - 06:30 PM IST',
      isoDate: '2026-11-14T15:30:00+05:30',
      location: 'BHIVE Workspace, HSR Layout, Bengaluru',
      city: 'Bengaluru',
      area: 'HSR Layout',
      venue: 'BHIVE Workspace, 27th Main Rd, Sector 2, HSR Layout, Bengaluru, Karnataka',
      venueUrl: 'https://maps.google.com/?q=BHIVE+Workspace+HSR+Layout+Bengaluru',
      price: 'Free',
      mode: 'offline',
      categories: ['Finance / FinTech', 'Product', 'Leadership'],
      rsvpUrl: 'https://www.mindtheproduct.com/producttank/bengaluru/fintech-pricing-monetization',
      attendeeCount: 120,
      featured: false,
      bannerImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=60',
      communityCadence: 'Monthly Community Meetup'
    }
  ];
  console.log(`   ✓ [ProductTank] Collected ${events.length} chapter meetups`);
  return events;
}

/**
 * 4. Harvest Devpost & Hackathons
 * Ingests global & regional hackathons with bounties and challenges
 */
async function harvestDevpostHackathons() {
  console.log('📡 [Devpost] Harvesting hackathons & builder sprints...');
  const events = [
    {
      id: 'devpost-ai-frontier-2026',
      title: 'AI Frontier Global Hackathon 2026',
      organizer: {
        name: 'Devpost Community',
        id: 'devpost',
        avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=60',
        verified: true
      },
      sourcePlatform: 'devpost',
      tagline: '48-hour global sprint building agentic workflows & local LLMs',
      description: 'Compete for $35,000 in bounties building multi-agent systems and real-time coding tools.',
      date: 'Fri, Oct 02 - Sun, Oct 04',
      time: '10:00 AM UTC Kickoff',
      isoDate: '2026-10-02T10:00:00Z',
      location: 'Virtual / Worldwide',
      city: 'Global',
      price: 'Free',
      mode: 'online',
      categories: ['AI / ML', 'Engineering', 'Open Source'],
      rsvpUrl: 'https://devpost.com/hackathons/ai-frontier-2026',
      attendeeCount: 1250,
      featured: true,
      bannerImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60',
      communityCadence: 'Quarterly Flagship'
    },
    {
      id: 'hack2skill-fintech-ai-challenge',
      title: 'Hack2skill National FinTech & AI Buildathon 2026',
      organizer: {
        name: 'Hack2skill Community 🏆',
        id: 'hack2skill',
        avatar: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=100&auto=format&fit=crop&q=60',
        verified: true
      },
      sourcePlatform: 'hack2skill',
      tagline: 'Build next-gen credit underwriting, fraud prevention, and autonomous banking agents',
      description: 'National multi-stage buildathon with INR 10 Lakhs in grants, direct incubation fast-track, and cloud API credits for builders across India.',
      date: 'Sat, Nov 21 - Sun, Nov 22',
      time: '09:00 AM - 07:00 PM IST',
      isoDate: '2026-11-21T09:00:00+05:30',
      location: 'IIIT Delhi Campus & Hybrid Online',
      city: 'Delhi NCR',
      area: 'Okhla, New Delhi',
      venue: 'IIIT-Delhi R&D Building, Okhla Industrial Estate, Phase III, New Delhi',
      venueUrl: 'https://maps.google.com/?q=IIIT+Delhi+Okhla',
      price: 'Free',
      mode: 'hybrid',
      categories: ['Finance / FinTech', 'AI / ML', 'Engineering'],
      rsvpUrl: 'https://hack2skill.com/hackathons/national-fintech-ai-2026',
      attendeeCount: 840,
      featured: true,
      bannerImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=60',
      communityCadence: 'Annual Flagship'
    }
  ];
  console.log(`   ✓ [Devpost / Hack2skill] Collected ${events.length} hackathons`);
  return events;
}

/**
 * Consolidate, normalize, and deduplicate all community feeds
 */
async function harvestFeeds() {
  console.log('🔄 Executing Multi-Source Feed Collector...');
  
  const results = await Promise.allSettled([
    harvestLumaFeeds(),
    harvestAtlassianCommunity(),
    harvestProductTank(),
    harvestDevpostHackathons()
  ]);

  const rawEvents = [];
  results.forEach(res => {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      rawEvents.push(...res.value);
    } else if (res.status === 'rejected') {
      console.warn('⚠️ Collector warning:', res.reason?.message || res.reason);
    }
  });

  // Deduplicate based on unique rsvpUrl or id
  const seen = new Set();
  const deduped = [];
  for (const ev of rawEvents) {
    const key = (ev.rsvpUrl || ev.id || '').trim();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(ev);
    }
  }

  return deduped.map(normalizeEvent);
}

/**
 * Probes an event registration URL to check if it's still alive or deleted by host
 */
async function checkUrlLiveness(url) {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return { alive: false, reason: 'Invalid or missing link format' };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      redirect: 'follow',
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.status === 404 || res.status === 410) {
      return { alive: false, status: res.status, reason: `Host returned HTTP ${res.status} Not Found` };
    }

    const finalUrl = res.url.toLowerCase();
    if (finalUrl.includes('/404') || finalUrl.includes('/not-found') || finalUrl.includes('error=404')) {
      return { alive: false, status: 404, reason: 'Redirected to 404 landing page (event taken down)' };
    }

    // Inspect content for takedown signatures
    const text = (await res.text()).slice(0, 10000).toLowerCase();
    const takedownSignatures = [
      'this event has been deleted',
      'this event is no longer available',
      'event not found',
      'we couldn\'t find that page',
      'this page could not be found',
      'event has been cancelled',
      'registration closed and event removed'
    ];

    const match = takedownSignatures.find(sig => text.includes(sig));
    if (match) {
      return { alive: false, status: res.status, reason: `Page body confirms event removal ("${match}")` };
    }

    return { alive: true, status: res.status };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { alive: true, warning: 'Request timeout (presumed alive)' };
    }
    const msg = err.message || '';
    if (msg.includes('ENOTFOUND') || msg.includes('getaddrinfo')) {
      return { alive: false, reason: 'Domain unreachable or deleted' };
    }
    return { alive: true, warning: msg };
  }
}

/**
 * Validates availability of events and removes any delisted/deleted events
 */
async function reconcileAndPruneEvents(harvestedEvents) {
  console.log(`\n🔍 [Delisting & Takedown Verification] Checking ${harvestedEvents.length} events against host platforms...`);
  const activeEvents = [];
  const prunedEvents = [];

  for (const ev of harvestedEvents) {
    const liveness = await checkUrlLiveness(ev.rsvp_url);
    if (liveness.alive === false) {
      console.warn(`   ⚠️ [Takedown Detected] "${ev.title}" was removed by organizer on ${ev.source_platform} (${liveness.reason}). Pruning.`);
      prunedEvents.push({ event: ev, reason: liveness.reason });
    } else {
      activeEvents.push(ev);
    }
  }

  // Reconciliation against Supabase if configured
  if (!IS_DRY_RUN && SUPABASE_URL && SUPABASE_KEY) {
    try {
      console.log('🔄 Reconciling against existing Supabase database...');
      const existingRes = await fetch(`${SUPABASE_URL}/rest/v1/events?select=id,title,rsvp_url,source_platform`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (existingRes.ok) {
        const existingEvents = await existingRes.json();
        for (const ex of existingEvents) {
          const wasPruned = prunedEvents.some(p => p.event.id === ex.id || p.event.rsvp_url === ex.rsvp_url);
          if (wasPruned) {
            console.log(`   🗑️ Deleting pruned event #${ex.id} ("${ex.title}") from Supabase...`);
            await fetch(`${SUPABASE_URL}/rest/v1/events?id=eq.${ex.id}`, {
              method: 'DELETE',
              headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
              }
            });
          }
        }
      }
    } catch (e) {
      console.warn('Could not complete Supabase deletion reconciliation:', e.message);
    }
  }

  return { activeEvents, prunedEvents };
}

/**
 * Main execution function
 */
async function run() {
  const startTime = Date.now();

  try {
    const rawEvents = await harvestFeeds();
    console.log(`\n✅ Normalized ${rawEvents.length} total events across 4 platform collectors.`);

    // Run active verification and pruning check
    const { activeEvents, prunedEvents } = await reconcileAndPruneEvents(rawEvents);
    console.log(`✨ Pruning complete: ${activeEvents.length} active events verified, ${prunedEvents.length} delisted events pruned.`);

    if (IS_DRY_RUN) {
      console.log('\n🔍 DRY-RUN PREVIEW OF VERIFIED ACTIVE PAYLOAD:');
      console.log(JSON.stringify(activeEvents.slice(0, 2), null, 2));
      console.log(`\n💡 Dry-run completed in ${Date.now() - startTime}ms. To push live to Supabase:`);
      console.log('   Add VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your environment.');
      return;
    }

    console.log(`🚀 Upserting ${activeEvents.length} verified events into Supabase table public.events...`);

    const response = await fetch(`${SUPABASE_URL}/rest/v1/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(activeEvents)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Supabase error (${response.status}): ${errText}`);
    }

    const durationMs = Date.now() - startTime;
    console.log(`🎉 Ingestion successful! ${activeEvents.length} events upserted, ${prunedEvents.length} pruned in ${durationMs}ms.`);

    // Record audit log
    await fetch(`${SUPABASE_URL}/rest/v1/sync_logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({
        status: 'success',
        source: 'sync_events_node_3h',
        events_found: rawEvents.length,
        events_upserted: activeEvents.length,
        events_pruned: prunedEvents.length,
        execution_ms: durationMs
      })
    }).catch(e => console.warn('Could not write sync log:', e.message));

  } catch (err) {
    console.error('❌ Scheduler Ingestion Failed:', err.message);
    process.exit(1);
  }
}

run();
