import { EventItem, Community } from '../types/event';

export interface CityInfo {
  id: string;
  name: string;
  country: string;
  activeEvents: number;
  communitiesCount: number;
  lat: number;
  lng: number;
}

export const CITIES: CityInfo[] = [
  { id: 'bengaluru', name: 'Bengaluru', country: 'India', activeEvents: 12, communitiesCount: 10, lat: 12.9716, lng: 77.5946 },
  { id: 'san-francisco', name: 'San Francisco', country: 'USA', activeEvents: 8, communitiesCount: 6, lat: 37.7749, lng: -122.4194 },
  { id: 'delhi-ncr', name: 'Delhi NCR', country: 'India', activeEvents: 9, communitiesCount: 4, lat: 28.6139, lng: 77.2090 },
  { id: 'mumbai', name: 'Mumbai', country: 'India', activeEvents: 4, communitiesCount: 4, lat: 19.0760, lng: 72.8777 },
  { id: 'london', name: 'London', country: 'UK', activeEvents: 5, communitiesCount: 4, lat: 51.5074, lng: -0.1278 },
  { id: 'remote', name: 'Global Virtual', country: 'Worldwide', activeEvents: 10, communitiesCount: 8, lat: 0, lng: 0 },
];

export const TECH_CATEGORIES = [
  'All Fields',
  'Product Management',
  'AI / ML',
  'Finance / FinTech',
  'Cloud & DevOps',
  'Rust & Systems',
  'Web3 & Blockchain',
  'Full-Stack & React',
  'UI/UX Design',
  'Cybersecurity',
  'Mobile & Flutter'
];

export const COMMUNITIES_DATA: Community[] = [
  // BENGALURU
  {
    id: 'gdg-bengaluru',
    name: 'Google Developer Group Bengaluru',
    avatar: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=150&auto=format&fit=crop&q=80',
    description: 'Premier developer community in India focusing on Android, Cloud, Web, and Gemini AI APIs.',
    city: 'bengaluru',
    topics: ['AI / ML', 'Cloud & DevOps', 'Full-Stack & React', 'Mobile & Flutter'],
    cadence: 'Meets 2nd Saturday monthly',
    cadenceType: 'monthly',
    consistencyScore: '98% Reliability · 12/12 Months Active',
    nextForecast: 'Next Edition: 2nd Saturday next month',
    activityScore: '⚡ Very Active: 5 events in last 60 days',
    memberCount: 14200,
    upcomingCount: 2,
    pastEditions: [
      { id: 'gdg-past-1', title: 'Google I/O Extended Bengaluru 2026', date: 'Jul 11, 2026', attendees: 650, keyTakeaways: 'Gemini 1.5 Pro deep dive, Project Astra multi-modal demos, and Android 15 developer changes.', venueOrPlatform: 'Chowdiah Memorial Hall' },
      { id: 'gdg-past-2', title: 'Web & Cloud DevFest Sprint', date: 'Jun 13, 2026', attendees: 280, keyTakeaways: 'WebAssembly, Next-gen Chrome DevTools, and Serverless Cloud Run patterns.', venueOrPlatform: 'Google Developer Space, Indiranagar' }
    ],
    externalUrl: 'https://gdg.community.dev/gdg-bangalore/'
  },
  {
    id: 'aws-ug-bengaluru',
    name: 'AWS User Group Bengaluru',
    avatar: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=150&auto=format&fit=crop&q=80',
    description: 'Deep architectural sessions, serverless patterns, and hands-on AWS workshops.',
    city: 'bengaluru',
    topics: ['Cloud & DevOps', 'AI / ML', 'Cybersecurity'],
    cadence: 'Meets last Saturday monthly',
    cadenceType: 'monthly',
    consistencyScore: '95% Reliability · 11/12 Months Active',
    nextForecast: 'Next Edition: Last Saturday of current month',
    activityScore: '⚡ Active: 3 events hosted recently',
    memberCount: 11800,
    upcomingCount: 1,
    pastEditions: [
      { id: 'aws-past-1', title: 'AWS Community Day Bengaluru 2025', date: 'Mar 22, 2026', attendees: 1200, keyTakeaways: 'Bedrock agent evaluation, cost optimization on Graviton4, and multi-region resilience.', venueOrPlatform: 'Sheraton Grand, Whitefield' }
    ],
    externalUrl: 'https://awsugblr.in/'
  },
  {
    id: 'pydata-bengaluru',
    name: 'PyData & Bangalore Python Users Group',
    avatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80',
    description: 'Data science, numerical computing, machine learning, and Python ecosystem engineering.',
    city: 'bengaluru',
    topics: ['AI / ML', 'Python', 'Data Science'],
    cadence: 'Meets 3rd Sunday monthly',
    cadenceType: 'monthly',
    consistencyScore: '96% Reliability · Regular monthly chapter',
    nextForecast: 'Next Edition: 3rd Sunday of current month',
    activityScore: '⚡ Regular: Monthly chapter cadence',
    memberCount: 9400,
    upcomingCount: 1,
    pastEditions: [
      { id: 'pydata-past-1', title: 'Vector DBs & Embeddings Deep Dive', date: 'Aug 16, 2026', attendees: 140, keyTakeaways: 'HNSW indexing benchmarks, quantization tradeoffs, and cross-encoder rerankers.', venueOrPlatform: 'Microsoft Reactor' }
    ],
    externalUrl: 'https://pydata.org/'
  },
  {
    id: 'rust-bangalore',
    name: 'Bangalore Rustaceans',
    avatar: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&auto=format&fit=crop&q=80',
    description: 'Systems programming, memory safety, WASM, and async concurrency with Rust.',
    city: 'bengaluru',
    topics: ['Rust & Systems', 'Cloud & DevOps'],
    cadence: 'Meets bi-weekly Thursday evenings',
    cadenceType: 'bi-weekly',
    consistencyScore: '99% Reliability · 24 editions/year',
    nextForecast: 'Next Edition: Alternate Thursday 6:30 PM',
    activityScore: '⚡ Hyper Active: Bi-weekly rhythm',
    memberCount: 4100,
    upcomingCount: 2,
    pastEditions: [
      { id: 'rust-past-1', title: 'io_uring & High-Throughput Networking in Linux', date: 'Aug 27, 2026', attendees: 90, keyTakeaways: 'Kernel ring buffers, zero-copy packet processing, and Tokio runtime profiling.', venueOrPlatform: 'WeWork Koramangala' }
    ],
    externalUrl: 'https://rustlang-in.github.io/'
  },
  {
    id: 'hack2skill-community',
    name: 'Hack2skill Innovation Guild',
    avatar: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=150&auto=format&fit=crop&q=80',
    description: 'Organizing premier national hackathons, builder sprints, and bootcamp incubators.',
    city: 'bengaluru',
    topics: ['AI / ML', 'Web3 & Blockchain', 'Full-Stack & React'],
    cadence: 'Quarterly Mega Hackathons + Monthly Sprints',
    cadenceType: 'quarterly',
    consistencyScore: '100% Reliability · 4/4 Quarters Active',
    nextForecast: 'Next Edition: Expected late October 2026',
    activityScore: '🏆 Elite Host: 10k+ participants yearly',
    memberCount: 28500,
    upcomingCount: 2,
    pastEditions: [
      { id: 'h2s-past-1', title: 'Autonomous Agent Hackathon Q2 2026', date: 'Jun 20, 2026', attendees: 800, keyTakeaways: '$20k in bounties awarded for autonomous research agents and developer tool assistants.', venueOrPlatform: 'KTPO Whitefield & Global Discord' }
    ],
    externalUrl: 'https://hack2skill.com/'
  },
  {
    id: 'react-bangalore',
    name: 'React & Next.js Bangalore',
    avatar: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150&auto=format&fit=crop&q=80',
    description: 'Modern frontend architecture, React Server Components, Tailwind, and performance optimization.',
    city: 'bengaluru',
    topics: ['Full-Stack & React', 'UI/UX Design'],
    cadence: 'Meets 1st Saturday monthly',
    cadenceType: 'monthly',
    consistencyScore: '95% Reliability · 10+ editions hosted',
    nextForecast: 'Next Edition: 1st Saturday of next month',
    activityScore: '⚡ Active: High attendance meetups',
    memberCount: 8900,
    upcomingCount: 1,
    externalUrl: 'https://www.meetup.com/find/?keywords=React'
  },
  {
    id: 'the-product-folks',
    name: 'The Product Folks',
    avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80',
    description: "India's largest volunteer-driven product management community. Teardowns, PM cohorts, AMAs, and Product Winter.",
    city: 'bengaluru',
    topics: ['Product Management', 'UI/UX Design', 'AI / ML'],
    cadence: 'Meets alternate Saturdays (Bi-weekly)',
    cadenceType: 'bi-weekly',
    consistencyScore: '98% Reliability · 50+ sessions held',
    nextForecast: 'Next Edition: 2nd Saturday next month',
    activityScore: '⚡ Hyper Active: 145k+ PM network',
    memberCount: 145000,
    upcomingCount: 2,
    pastEditions: [
      { id: 'tpf-past-1', title: 'Product Teardown: Quick Commerce & Swiggy Instamart', date: 'Aug 29, 2026', attendees: 180, keyTakeaways: 'Cart conversion economics, 10-minute slot allocation, and search drop-off analysis.', venueOrPlatform: 'WeWork Galaxy' },
      { id: 'tpf-past-2', title: 'Product Winter 2025 Cohort Demo Day', date: 'Jan 10, 2026', attendees: 500, keyTakeaways: 'Graduation pitches from 40 early-stage PM Fellows presenting real capstone PRDs.', venueOrPlatform: 'Virtual Livestream' }
    ],
    externalUrl: 'https://www.theproductfolks.com/'
  },
  {
    id: 'grabchai-community',
    name: 'GrabChai Community',
    avatar: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=150&auto=format&fit=crop&q=80',
    description: 'Informal weekend chai & coffee walks for product managers, founders, designers, and operators across Bengaluru.',
    city: 'bengaluru',
    topics: ['Product Management', 'UI/UX Design'],
    cadence: 'Weekly Ritual (Every Sunday morning 8:30 AM)',
    cadenceType: 'weekly',
    consistencyScore: '100% Reliability · Every single Sunday',
    nextForecast: 'Next Edition: This coming Sunday 8:30 AM',
    activityScore: '☕ Weekly Ritual: 50+ chai meetups',
    memberCount: 18200,
    upcomingCount: 2,
    pastEditions: [
      { id: 'gc-past-1', title: 'GrabChai Sunday Stroll #49', date: 'Sep 13, 2026', attendees: 38, keyTakeaways: 'Unfiltered discussion on managing leadership expectations and avoiding PM burnout.', venueOrPlatform: 'Cubbon Park' },
      { id: 'gc-past-2', title: 'GrabChai Koramangala Breakfast #48', date: 'Sep 06, 2026', attendees: 44, keyTakeaways: 'Conversations on AI prototyping tools (v0, Claude Artifacts) for PMs.', venueOrPlatform: 'Third Wave Coffee' }
    ],
    externalUrl: 'https://grabchai.com/'
  },
  {
    id: 'producttank-bengaluru',
    name: 'ProductTank Bengaluru',
    avatar: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&auto=format&fit=crop&q=80',
    description: 'The official Bengaluru chapter of Mind the Product. Curated product leadership keynotes, teardowns, and networking.',
    city: 'bengaluru',
    topics: ['Product Management', 'UI/UX Design'],
    cadence: 'Quarterly Flagship (Every ~90 days)',
    cadenceType: 'quarterly',
    consistencyScore: '96% Reliability · 4/4 Quarters Active',
    nextForecast: 'Next Edition: Expected mid-November 2026',
    activityScore: '⚡ Active: Global Mind the Product network',
    memberCount: 12800,
    upcomingCount: 1,
    pastEditions: [
      { id: 'pt-past-1', title: 'Q2 Summit: Moving from Feature Teams to Outcome Squads', date: 'Jun 18, 2026', attendees: 160, keyTakeaways: 'OKRs that actually work, executive roadmap buy-in, and customer discovery cadences.', venueOrPlatform: 'Microsoft Reactor' },
      { id: 'pt-past-2', title: 'Q1 Summit: Designing Trust in Autonomous AI Products', date: 'Mar 19, 2026', attendees: 140, keyTakeaways: 'Transparency UI patterns, graceful failure states, and user confidence metrics.', venueOrPlatform: 'WeWork Galaxy' }
    ],
    externalUrl: 'https://www.mindtheproduct.com/producttank/bengaluru/'
  },
  {
    id: 'lennys-community-blr',
    name: "Lenny's Community Bengaluru",
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    description: "Local chapter for readers and subscribers of Lenny's Newsletter & Podcast. Growth, retention, and PLG discussions.",
    city: 'bengaluru',
    topics: ['Product Management', 'Full-Stack & React'],
    cadence: 'Meets monthly Tuesday evenings',
    cadenceType: 'monthly',
    consistencyScore: '94% Reliability · Monthly community dinners',
    nextForecast: 'Next Edition: Expected 2nd Tuesday of next month',
    activityScore: '⚡ Active: High-density PM discussions',
    memberCount: 6500,
    upcomingCount: 1,
    pastEditions: [
      { id: 'lenny-past-1', title: 'Pricing & Packaging Secrets for B2B SaaS', date: 'Aug 18, 2026', attendees: 65, keyTakeaways: 'Deconstructed usage-based pricing vs seat-based tiers with case studies from Stripe and Figma.', venueOrPlatform: 'Indiqube Alpha, Bellandur' },
      { id: 'lenny-past-2', title: 'Product-Led Growth (PLG) Teardowns', date: 'Jul 14, 2026', attendees: 70, keyTakeaways: 'Analyzed activation metrics and self-serve onboarding funnels.', venueOrPlatform: 'WeWork Galaxy' }
    ],
    externalUrl: 'https://www.lennysnewsletter.com/'
  },
  {
    id: 'atlassian-community-blr',
    name: 'Atlassian Community Bengaluru (ACE)',
    avatar: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=150&auto=format&fit=crop&q=80',
    description: 'Official chapter for Jira, Confluence, Loom, and Atlassian Intelligence. Bi-monthly hybrid talks & online masterclasses.',
    city: 'bengaluru',
    topics: ['Product Management', 'Cloud & DevOps', 'AI / ML'],
    cadence: 'Meets bi-monthly + monthly online webinars',
    cadenceType: 'monthly',
    consistencyScore: '97% Reliability · 15+ editions hosted',
    nextForecast: 'Next Edition: Late October 2026',
    activityScore: '⚡ Active: Hybrid R&D center sessions',
    memberCount: 16200,
    upcomingCount: 2,
    pastEditions: [
      { id: 'ace-past-1', title: 'Jira Product Discovery & Agile Roadmapping at Scale', date: 'Aug 20, 2026', attendees: 210, keyTakeaways: 'How product teams map customer insights directly to delivery epics with Jira Product Discovery.', venueOrPlatform: 'Atlassian Ecoworld R&D Center & Zoom' },
      { id: 'ace-past-2', title: 'Atlassian Intelligence & Rovo AI Live Lab', date: 'Jun 12, 2026', attendees: 180, keyTakeaways: 'Hands-on session deploying enterprise search agents across Confluence and Slack.', venueOrPlatform: 'Online Livestream' }
    ],
    externalUrl: 'https://ace.atlassian.com/bangalore/'
  },
  {
    id: 'ai-tinkerers-blr',
    name: 'AI Tinkerers Bengaluru',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    description: 'Strictly hands-on technical community for AI researchers and builders. Zero pitch decks, only live running code and local models.',
    city: 'bengaluru',
    topics: ['AI / ML', 'Rust & Systems'],
    cadence: 'Meets 3rd Wednesday monthly',
    cadenceType: 'monthly',
    consistencyScore: '99% Reliability · Sold out in 15 mins',
    nextForecast: 'Next Edition: Expected mid-November 2026',
    activityScore: '⚡ Hyper Active: Elite AI builder network',
    memberCount: 5800,
    upcomingCount: 1,
    pastEditions: [
      { id: 'ait-past-1', title: 'Local LLMs & Quantized Inference on Apple Silicon', date: 'Aug 19, 2026', attendees: 95, keyTakeaways: 'Live demonstrations of llama.cpp, vLLM, and low-latency local embedding pipelines.', venueOrPlatform: 'BHIVE Indiranagar' },
      { id: 'ait-past-2', title: 'Multi-Agent Consensus Protocols with Gemini & Claude', date: 'Jul 15, 2026', attendees: 110, keyTakeaways: 'Code walkthrough of dynamic agent routing and state reconciliation.', venueOrPlatform: 'WeWork Galaxy' }
    ],
    externalUrl: 'https://bengaluru.tinkerers.ai/'
  },
  {
    id: 'kcd-bengaluru',
    name: 'CNCF & Kubernetes Community Days (KCD)',
    avatar: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=150&auto=format&fit=crop&q=80',
    description: 'Cloud Native Computing Foundation chapter hosting flagship Kubernetes conferences, eBPF, and cloud infrastructure.',
    city: 'bengaluru',
    topics: ['Cloud & DevOps', 'Cybersecurity', 'Rust & Systems'],
    cadence: 'Quarterly Flagship Summits',
    cadenceType: 'quarterly',
    consistencyScore: '100% Reliability · 4/4 Quarters Active',
    nextForecast: 'Next Edition: Expected late November 2026',
    activityScore: '🏆 Flagship Chapter: 800+ conference attendees',
    memberCount: 19500,
    upcomingCount: 1,
    pastEditions: [
      { id: 'kcd-past-1', title: 'KCD Bengaluru Annual Summit 2025', date: 'May 10, 2026', attendees: 850, keyTakeaways: 'Enterprise Kubernetes migration patterns, GitOps at scale, and Cilium mesh architecture.', venueOrPlatform: 'NIMHANS Convention Centre' },
      { id: 'kcd-past-2', title: 'eBPF & Cilium Microservice Security Workshop', date: 'Jan 24, 2026', attendees: 220, keyTakeaways: 'Hands-on lab replacing kube-proxy with eBPF dynamic packet filters.', venueOrPlatform: 'Microsoft Reactor' }
    ],
    externalUrl: 'https://community.cncf.io/bangalore/'
  },

  // SAN FRANCISCO
  {
    id: 'ai-engineer-sf',
    name: 'AI Engineer Foundation SF',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    description: 'The premier Silicon Valley hub for AI engineers, foundation model builders, and agents.',
    city: 'san-francisco',
    topics: ['AI / ML', 'Cloud & DevOps'],
    cadence: 'Meets 1st & 3rd Wednesday monthly',
    cadenceType: 'bi-weekly',
    consistencyScore: '99% Reliability · Continuous Rhythm',
    nextForecast: 'Next Edition: Expected Next Wednesday',
    activityScore: '⚡ Very Active: 4 events monthly',
    memberCount: 22000,
    upcomingCount: 3,
    pastEditions: [
      { id: 'aief-past-1', title: 'Autonomous Agent Frameworks Benchmarking', date: 'Feb 18, 2026', attendees: 320, keyTakeaways: 'Multi-agent orchestration in production, evaluation metrics, and latency mitigation.', venueOrPlatform: 'Mission Bay Hub, SF' }
    ],
    externalUrl: 'https://lu.ma/explore'
  },
  {
    id: 'sf-python',
    name: 'SF Python & PyBay',
    avatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80',
    description: 'San Francisco Python community organizing monthly project nights and technical talks.',
    city: 'san-francisco',
    topics: ['AI / ML', 'Full-Stack & React'],
    cadence: 'Meets 2nd Wednesday monthly',
    cadenceType: 'monthly',
    consistencyScore: '96% Reliability · Active Monthly',
    nextForecast: 'Next Edition: 2nd Wednesday next month',
    activityScore: '⚡ Regular monthly chapter',
    memberCount: 16500,
    upcomingCount: 2,
    pastEditions: [
      { id: 'sfpy-past-1', title: 'Python 3.13 JIT Compiler Deep Dive', date: 'Feb 12, 2026', attendees: 240, keyTakeaways: 'Benchmarks of free-threaded Python and GIL removal on data processing workloads.', venueOrPlatform: 'Y Combinator HQ' }
    ],
    externalUrl: 'https://sfpython.org/'
  },
  {
    id: 'bay-area-rust',
    name: 'Bay Area Rustaceans',
    avatar: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&auto=format&fit=crop&q=80',
    description: 'San Francisco & Silicon Valley engineers working with Rust in production.',
    city: 'san-francisco',
    topics: ['Rust & Systems'],
    cadence: 'Meets last Tuesday monthly',
    cadenceType: 'monthly',
    consistencyScore: '95% Reliability · Active Monthly',
    nextForecast: 'Next Edition: Last Tuesday next month',
    activityScore: '⚡ Active: Monthly deep dives',
    memberCount: 8300,
    upcomingCount: 1,
    pastEditions: [
      { id: 'barust-past-1', title: 'Zero-Copy Networking in Rust', date: 'Jan 28, 2026', attendees: 180, keyTakeaways: 'Writing high-throughput proxies with Tokio and io_uring.', venueOrPlatform: 'Cloudflare SF' }
    ],
    externalUrl: 'https://www.meetup.com/find/?keywords=Rust'
  },

  // DELHI NCR
  {
    id: 'gdg-new-delhi',
    name: 'Google Developer Group New Delhi',
    avatar: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=150&auto=format&fit=crop&q=80',
    description: 'Leading developer community across Delhi NCR covering web, cloud, and generative AI.',
    city: 'delhi-ncr',
    topics: ['AI / ML', 'Full-Stack & React', 'Cloud & DevOps'],
    cadence: 'Meets 3rd Saturday monthly',
    cadenceType: 'monthly',
    consistencyScore: '97% Reliability · 12 Chapters / Year',
    nextForecast: 'Next Edition: 3rd Saturday next month',
    activityScore: '⚡ Active: Monthly chapters',
    memberCount: 12500,
    upcomingCount: 2,
    pastEditions: [
      { id: 'gdgdel-past-1', title: 'Gemini Multimodal Live API Buildathon', date: 'Feb 14, 2026', attendees: 310, keyTakeaways: 'Building bidirectional audio-vision assistants with Gemini 2.0 Flash.', venueOrPlatform: 'IIT Delhi Innovation Park' }
    ],
    externalUrl: 'https://gdg.community.dev/gdg-new-delhi/'
  },
  {
    id: 'pydelhi',
    name: 'PyDelhi Community',
    avatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80',
    description: 'Delhi NCR Python Community hosting bi-weekly technical meetups and workshops.',
    city: 'delhi-ncr',
    topics: ['AI / ML', 'Full-Stack & React'],
    cadence: 'Meets alternate Saturdays',
    cadenceType: 'bi-weekly',
    consistencyScore: '98% Reliability · Bi-Weekly Cadence',
    nextForecast: 'Next Edition: Alternate Saturday',
    activityScore: '⚡ Regular bi-weekly schedule',
    memberCount: 7800,
    upcomingCount: 2,
    pastEditions: [
      { id: 'pydel-past-1', title: 'FastAPI & Async Task Architecture', date: 'Feb 21, 2026', attendees: 160, keyTakeaways: 'Celery vs ARQ vs Temporal for background job queuing in Python.', venueOrPlatform: 'Invest India Hall' }
    ],
    externalUrl: 'https://pydelhi.org/'
  },
  {
    id: 'tpf-delhi-ncr',
    name: 'The Product Folks',
    avatar: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=150&auto=format&fit=crop&q=80',
    description: "Asia's largest product community's Delhi NCR chapter. Executive leadership dinners, PM teardowns, and growth strategy meetups across Gurgaon and Noida.",
    city: 'delhi-ncr',
    topics: ['Product Management', 'AI / ML', 'UI/UX Design'],
    cadence: 'Monthly Chapter (Last weekend monthly)',
    cadenceType: 'monthly',
    consistencyScore: '99% Reliability · 12/12 Months Active',
    nextForecast: 'Next Edition: Expected Late October 2026',
    activityScore: '⚡ Very Active: 450+ PMs in NCR',
    memberCount: 38000,
    upcomingCount: 3,
    pastEditions: [
      { id: 'tpf-del-past-1', title: 'B2B AI Monetization & Pricing Models', date: 'Aug 28, 2026', attendees: 180, keyTakeaways: 'How top enterprise SaaS companies structure consumption-based vs seat-based AI billing.', venueOrPlatform: 'WeWork Cyber City, Gurgaon' }
    ],
    externalUrl: 'https://theproductfolks.com/'
  },
  {
    id: 'grafana-delhi-community',
    name: 'Grafana & Cloud Observability Delhi',
    avatar: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80',
    description: 'Specialized engineering guild for site reliability engineers, platform teams, and DevOps practitioners managing high-scale telemetry in Delhi NCR.',
    city: 'delhi-ncr',
    topics: ['Cloud & DevOps', 'Rust & Systems'],
    cadence: 'Quarterly Flagship (~90-day cycle)',
    cadenceType: 'quarterly',
    consistencyScore: '96% Reliability · 4/4 Quarters Active',
    nextForecast: 'Next Edition: Expected Mid-November 2026',
    activityScore: '⚡ Active: Enterprise telemetry guild',
    memberCount: 6100,
    upcomingCount: 1,
    pastEditions: [
      { id: 'graf-past-1', title: 'Distributed Tracing with OpenTelemetry & Loki', date: 'Jun 20, 2026', attendees: 140, keyTakeaways: 'Optimizing trace retention, sampling strategies, and reducing Prometheus storage costs by 40%.', venueOrPlatform: 'Paytm Campus, Noida' }
    ],
    externalUrl: 'https://lu.ma/explore'
  },

  // MUMBAI
  {
    id: 'gdg-mumbai',
    name: 'Google Developer Group Mumbai',
    avatar: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=150&auto=format&fit=crop&q=80',
    description: 'Mumbai tech community connecting developers, students, and startups across the city.',
    city: 'mumbai',
    topics: ['AI / ML', 'Cloud & DevOps', 'Mobile & Flutter'],
    cadence: 'Meets 2nd Sunday monthly',
    cadenceType: 'monthly',
    consistencyScore: '96% Reliability · Active Monthly',
    nextForecast: 'Next Edition: 2nd Sunday next month',
    activityScore: '⚡ Regular monthly chapter',
    memberCount: 9800,
    upcomingCount: 2,
    pastEditions: [
      { id: 'gdgmum-past-1', title: 'Modern Flutter & Firebase Genkit at Scale', date: 'Feb 8, 2026', attendees: 220, keyTakeaways: 'State management patterns and offline-first syncing with Cloud Firestore.', venueOrPlatform: 'WeWork BKC, Mumbai' }
    ],
    externalUrl: 'https://gdg.community.dev/gdg-mumbai/'
  },
  {
    id: 'fintech-india-blr',
    name: 'FinTech India Circle (Bengaluru)',
    avatar: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=80',
    description: 'Premier network of product managers, founders, and engineers building UPI, lending stacks, and neo-banking platforms across India.',
    city: 'bengaluru',
    topics: ['Finance / FinTech', 'Product Management', 'AI / ML'],
    cadence: 'Meets 3rd Saturday monthly',
    cadenceType: 'monthly',
    consistencyScore: '98% Reliability · Active Monthly',
    nextForecast: 'Next Edition: 3rd Saturday next month',
    activityScore: '⚡ Highly engaged community',
    memberCount: 7400,
    upcomingCount: 1,
    pastEditions: [
      { id: 'ftblr-past-1', title: 'Open Banking Protocols & Account Aggregator Scalability', date: 'Jan 24, 2026', attendees: 180, keyTakeaways: 'Handling 10k TPS on RBI Account Aggregator rails.', venueOrPlatform: 'WeWork Galaxy, Residency Road' }
    ],
    externalUrl: 'https://fintechcircle.in'
  },
  {
    id: 'delhi-quant-finance',
    name: 'Quant & Algorithmic Trading Society (Delhi NCR)',
    avatar: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=150&auto=format&fit=crop&q=80',
    description: 'High-frequency algorithmic traders, quantitative analysts, and systems engineers discussing market microstructure, low-latency execution, and alpha modeling.',
    city: 'delhi-ncr',
    topics: ['Finance / FinTech', 'AI / ML', 'Rust & Systems'],
    cadence: 'Meets every other Thursday',
    cadenceType: 'bi-weekly',
    consistencyScore: '95% Reliability · Consistent',
    nextForecast: 'Next Session: Thursday 6:30 PM',
    activityScore: '🔥 Active Weekly Discussions',
    memberCount: 5200,
    upcomingCount: 2,
    pastEditions: [
      { id: 'delquant-past-1', title: 'Building Sub-Millisecond Matching Engines in Rust', date: 'Feb 12, 2026', attendees: 140, keyTakeaways: 'Lock-free memory ring buffers and kernel bypass networking.', venueOrPlatform: 'Innov8 Cyber Hub, DLF Cyber City, Gurugram' }
    ],
    externalUrl: 'https://delhiquant.org'
  },
  {
    id: 'defi-mumbai-forum',
    name: 'DeFi & Open Finance Builders (Mumbai)',
    avatar: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=150&auto=format&fit=crop&q=80',
    description: 'Mumbai community focusing on decentralized finance, tokenized real-world assets (RWA), automated market makers, and institutional crypto treasury.',
    city: 'mumbai',
    topics: ['Finance / FinTech', 'Web3 & Blockchain'],
    cadence: 'Meets monthly on Fridays',
    cadenceType: 'monthly',
    consistencyScore: '92% Reliability · Active Monthly',
    nextForecast: 'Next Edition: Last Friday this month',
    activityScore: '⚡ Growing rapidly',
    memberCount: 4100,
    upcomingCount: 1,
    pastEditions: [
      { id: 'defimum-past-1', title: 'Tokenized Treasury Bills & Compliant DeFi Stacks', date: 'Jan 16, 2026', attendees: 110, keyTakeaways: 'On-chain liquidity pools and institutional custody frameworks.', venueOrPlatform: 'WeWork Enam Sambhav, BKC, Mumbai' }
    ],
    externalUrl: 'https://defimumbai.xyz'
  }
];

export const EVENTS_DATA: EventItem[] = [
  // =================== FINANCE / FINTECH EVENTS ===================
  {
    id: 'event-blr-fintech-01',
    title: 'NextGen FinTech & Digital Banking Summit 2026',
    tagline: 'Scalable UPI rails, Account Aggregator protocols, and neo-banking architecture at scale',
    description: 'Join leading FinTech product architects and engineering leaders as they discuss the next decade of India Stack, 100k TPS payment processing, credit-line-on-UPI integrations, and secure financial data exchange.',
    mode: 'offline',
    eventType: 'conference',
    vibe: 'deep-tech',
    categories: ['Finance / FinTech', 'Product Management'],
    date: 'Saturday, Oct 3, 2026',
    time: '10:00 AM – 4:30 PM IST',
    isoDate: '2026-10-03T10:00:00+05:30',
    city: 'bengaluru',
    area: 'Koramangala',
    venue: 'WeWork Galaxy, 43 Residency Road, Bengaluru',
    venueUrl: 'https://maps.google.com/?q=WeWork+Galaxy+Bengaluru',
    rsvpUrl: 'https://lu.ma/fintech-summit-blr',
    sourcePlatform: 'Luma',
    price: 'Free',
    bannerUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80',
    organizer: {
      id: 'fintech-india-blr',
      name: 'FinTech India Circle 💳',
      avatar: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets 3rd Saturday monthly',
      memberCount: 7400
    },
    seats: { total: 280, filled: 245 },
    speakers: [
      { name: 'Sameer Nigam', role: 'Head of Payments Architecture @ Razorpay', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
      { name: 'Ananya Roy', role: 'VP of Product @ BharatPe', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' }
    ],
    agenda: [
      '10:00 AM - Registration & Financial Networking',
      '11:00 AM - Keynote: Scaling UPI & Real-time Settlement Rails',
      '01:30 PM - Panel: Account Aggregator Ecosystem & Lending Innovation'
    ]
  },
  {
    id: 'event-del-fintech-01',
    title: 'Algorithmic Trading & High-Frequency Systems Workshop',
    tagline: 'Sub-millisecond market microstructure, low-latency Rust engines & automated alpha execution',
    description: 'An intensive technical workshop for quantitative developers, financial engineers, and algorithmic traders. Covers tick data processing, FPGA accelerations, order book dynamics, and backtesting strategies on Indian and global exchanges.',
    mode: 'offline',
    eventType: 'workshop',
    vibe: 'deep-tech',
    categories: ['Finance / FinTech', 'AI / ML', 'Rust & Systems'],
    date: 'Thursday, Oct 8, 2026',
    time: '6:00 PM – 9:00 PM IST',
    isoDate: '2026-10-08T18:00:00+05:30',
    city: 'delhi-ncr',
    area: 'DLF Phase 2, Gurugram',
    venue: 'Innov8 Cyber Hub, DLF Cyber City, Gurugram',
    venueUrl: 'https://maps.google.com/?q=Innov8+Cyber+Hub+Gurugram',
    rsvpUrl: 'https://lu.ma/delhi-quant-trading',
    sourcePlatform: 'Luma',
    price: 'Free',
    bannerUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80',
    organizer: {
      id: 'delhi-quant-finance',
      name: 'Quant & Algorithmic Trading Society 📈',
      avatar: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=100&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets biweekly',
      memberCount: 5200
    },
    seats: { total: 160, filled: 138 },
    speakers: [
      { name: 'Kunal Malhotra', role: 'Quantitative Portfolio Manager @ AlphaCraft', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
      { name: 'Dr. Siddharth Jain', role: 'Former HFT Systems Lead @ Tower Research', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80' }
    ],
    agenda: [
      '6:00 PM - Market Microstructure & Order Matching Internals',
      '7:15 PM - Code Walkthrough: Zero-Copy Market Feeds in Rust',
      '8:30 PM - Live Simulation & Alpha Backtesting Demo'
    ]
  },
  {
    id: 'event-del-fintech-02',
    title: 'Founders Roundtable: Building Regulated FinTech & Lending in India',
    tagline: 'Navigating RBI regulations, digital lending compliance, and credit underwriting AI models',
    description: 'An exclusive peer discussion for fintech founders, compliance heads, and lending product leaders. Dive into regulatory sandboxes, NBFC partnership models, and deploying ML for risk grading.',
    mode: 'offline',
    eventType: 'meetup',
    vibe: 'casual-coffee',
    categories: ['Finance / FinTech', 'Product Management'],
    date: 'Saturday, Oct 17, 2026',
    time: '4:00 PM – 7:30 PM IST',
    isoDate: '2026-10-17T16:00:00+05:30',
    city: 'delhi-ncr',
    area: 'Okhla Phase 3',
    venue: '91springboard, Okhla Phase 3, New Delhi',
    rsvpUrl: 'https://lu.ma/delhi-fintech-roundtable',
    sourcePlatform: 'Luma',
    price: 'Free',
    bannerUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=600&auto=format&fit=crop&q=80',
    organizer: {
      id: 'fintech-india-blr',
      name: 'FinTech India Circle 💳',
      avatar: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets monthly',
      memberCount: 7400
    },
    seats: { total: 95, filled: 80 },
    speakers: [
      { name: 'Vikram Chawla', role: 'Co-Founder & CEO @ CrediFlow', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80' },
      { name: 'Megha Singhal', role: 'Regulatory & FinTech Partner @ Khaitan & Co', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80' }
    ],
    agenda: [
      '4:00 PM - Welcome & Peer Introductions',
      '4:45 PM - Fireside: Regulatory Sandboxes & Digital Lending Guidelines',
      '6:15 PM - Open Q&A & Mixer'
    ]
  },
  {
    id: 'event-mum-fintech-01',
    title: 'Decentralized Finance (DeFi) & Real World Assets (RWA) Forum',
    tagline: 'Tokenized treasury bills, institutional liquidity pools, and compliant DeFi protocols',
    description: 'Explore the convergence of traditional capital markets with decentralized finance. Discussing tokenized private credit, real-world asset collateralization, smart contract security, and institutional custody solutions.',
    mode: 'offline',
    eventType: 'conference',
    vibe: 'deep-tech',
    categories: ['Finance / FinTech', 'Web3 & Blockchain'],
    date: 'Friday, Oct 23, 2026',
    time: '5:30 PM – 9:00 PM IST',
    isoDate: '2026-10-23T17:30:00+05:30',
    city: 'mumbai',
    area: 'Bandra Kurla Complex (BKC)',
    venue: 'WeWork Enam Sambhav, C-20, G Block BKC, Mumbai',
    venueUrl: 'https://maps.google.com/?q=WeWork+Enam+Sambhav+BKC+Mumbai',
    rsvpUrl: 'https://lu.ma/defi-rwa-mumbai',
    sourcePlatform: 'Luma',
    price: 'Free',
    bannerUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=600&auto=format&fit=crop&q=80',
    organizer: {
      id: 'defi-mumbai-forum',
      name: 'DeFi & Open Finance Builders (Mumbai) 🌐',
      avatar: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=100&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets monthly',
      memberCount: 4100
    },
    seats: { total: 190, filled: 162 },
    speakers: [
      { name: 'Arjun Nambiar', role: 'Head of RWA Strategies @ Centrifuge Protocol', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80' },
      { name: 'Pooja Deshmukh', role: 'Lead Smart Contract Auditor @ ConsenSys', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' }
    ],
    agenda: [
      '5:30 PM - Institutional DeFi & Treasury Tokenization',
      '7:00 PM - Smart Contract Auditing & Security Standards',
      '8:15 PM - Networking & Cocktails'
    ]
  },
  {
    id: 'event-rem-fintech-01',
    title: 'AI in Wealth Management, Fraud Detection & Risk Modeling',
    tagline: 'Real-time transaction anomaly detection and automated portfolio optimization with ML',
    description: 'Global virtual masterclass demonstrating live machine learning architectures for high-throughput fraud prevention, graph neural networks for AML tracing, and automated generative reports for retail wealth clients.',
    mode: 'online',
    eventType: 'workshop',
    vibe: 'hands-on',
    categories: ['Finance / FinTech', 'AI / ML'],
    date: 'Wednesday, Oct 28, 2026',
    time: '7:00 PM – 8:30 PM IST',
    isoDate: '2026-10-28T19:00:00+05:30',
    city: 'remote',
    virtualPlatform: 'Zoom Live Interactive Broadcast',
    rsvpUrl: 'https://lu.ma/ai-fintech-wealth-masterclass',
    sourcePlatform: 'Luma',
    price: 'Free',
    bannerUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80',
    organizer: {
      id: 'fintech-india-blr',
      name: 'FinTech India Circle 💳',
      avatar: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets 3rd Saturday monthly',
      memberCount: 7400
    },
    seats: { total: 540, filled: 455 },
    speakers: [
      { name: 'Dr. Evelyn Zhang', role: 'Principal ML Researcher @ Stripe', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80' },
      { name: 'Nikhil Kashyap', role: 'VP Data & AI @ Zerodha', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' }
    ],
    agenda: [
      '7:00 PM - Keynote: High-Throughput Anomaly Detection at Scale',
      '7:45 PM - Live Demo: Graph Neural Networks for Risk Modeling',
      '8:15 PM - Interactive Q&A with Stripe & Zerodha Leads'
    ]
  },

  // =================== BENGALURU EVENTS ===================
  {
    id: 'event-blr-01',
    title: 'Autonomous LLM Agents & Tool-Calling Sprint',
    tagline: 'Hands-on architectural workshop building Multi-Agent Workflows with Gemini 1.5 & LangGraph',
    description: 'A deep-dive Saturday bootcamp where engineering leads and AI practitioners build production-grade agentic systems with human-in-the-loop validation, function execution, and state persistence. Bring your laptop and your API keys.',
    mode: 'offline',
    eventType: 'bootcamp',
    vibe: 'hands-on',
    categories: ['AI / ML', 'Full-Stack & React'],
    date: 'Saturday, Sep 26, 2026',
    time: '10:00 AM – 3:30 PM IST',
    isoDate: '2026-09-26T10:00:00+05:30',
    city: 'bengaluru',
    area: 'Indiranagar',
    venue: 'Google Developer Space, 100ft Road, Indiranagar',
    rsvpUrl: 'https://lu.ma/explore',
    sourcePlatform: 'Luma',
    price: 'Free',
    organizer: {
      id: 'gdg-bengaluru',
      name: 'GDG Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets 2nd Saturday monthly',
      memberCount: 14200
    },
    seats: { total: 80, filled: 68 },
    speakers: [
      { name: 'Arjun Swaminathan', role: 'Staff ML Engineer @ TechScale', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
      { name: 'Priya Sharma', role: 'DevRel Advocate, Google Cloud', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80' }
    ],
    agenda: [
      '10:00 AM - Registration & High-Protein Coffee',
      '10:30 AM - Multi-Agent Architecture: Router vs Consensus Models',
      '11:45 AM - Live Lab: Function Calling & MCP Client Integration',
      '01:30 PM - Lunch & Peer Networking',
      '02:15 PM - Show & Tell: 3-Minute Lightning Demos'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-blr-02',
    title: 'Zero-Overhead Async Rust & Kernel Concurrency',
    tagline: 'Deep engineering talk on io_uring, async runtime internals, and memory profiling',
    description: 'Join the Bangalore Rustaceans for an evening of technical rigor. We will unpack Tokio thread-pool balancing, low-overhead network primitives, and real production war stories from high-throughput trading engines.',
    mode: 'both',
    eventType: 'meetup',
    vibe: 'deep-tech',
    categories: ['Rust & Systems', 'Cloud & DevOps'],
    date: 'Thursday, Oct 1, 2026',
    time: '6:30 PM – 9:00 PM IST',
    isoDate: '2026-10-01T18:30:00+05:30',
    city: 'bengaluru',
    area: 'Koramangala',
    venue: 'WeWork Salarpuria Symbiosis & Zoom Livestream',
    virtualPlatform: 'Zoom / YouTube Live',
    rsvpUrl: 'https://www.meetup.com/find/?keywords=Rust',
    sourcePlatform: 'Meetup',
    price: 'Free',
    organizer: {
      id: 'rust-bangalore',
      name: 'Bangalore Rustaceans',
      avatar: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets bi-weekly',
      memberCount: 4100
    },
    seats: { total: 120, filled: 112 },
    speakers: [
      { name: 'Karthik Raman', role: 'Principal Systems Architect @ Zerodha', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' }
    ],
    agenda: [
      '06:30 PM - Welcome & Chai',
      '07:00 PM - Deconstructing io_uring in Linux 6.x',
      '08:00 PM - Panel: Moving microservices from Go to Rust'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-blr-03',
    title: 'Founder & Tech Lead Weekend Coffee Mixer',
    tagline: 'Low-pressure Sunday morning coffee for tech founders, CTOs, and angel operators',
    description: 'No PowerPoint slides, no corporate pitches. Just 25 founders and tech leads sharing unfiltered stories over artisan filter brew and specialty roasts. Curated attendees strictly limited.',
    mode: 'offline',
    eventType: 'meetup',
    vibe: 'casual-coffee',
    categories: ['UI/UX Design', 'Full-Stack & React'],
    date: 'Sunday, Oct 4, 2026',
    time: '9:30 AM – 12:00 PM IST',
    isoDate: '2026-10-04T09:30:00+05:30',
    city: 'bengaluru',
    area: 'Church Street',
    venue: 'Blue Tokai Coffee Roasters, Church Street',
    rsvpUrl: 'https://lu.ma/explore',
    sourcePlatform: 'Luma',
    price: 'Free',
    organizer: {
      id: 'hack2skill-community',
      name: 'Hack2skill Guild',
      avatar: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets alternate Sundays',
      memberCount: 28500
    },
    seats: { total: 25, filled: 22 },
    speakers: [],
    agenda: [
      '09:30 AM - Casual arrivals & pour-over tasting',
      '10:15 AM - Open circle: The hardest technical pivot we made this quarter',
      '11:30 AM - 1-on-1 walk and talks'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-blr-04',
    title: 'HackTheFuture 48H National Hackathon',
    tagline: 'Build next-gen autonomous agent solutions with $25,000 prize pool and investor demo day',
    description: 'The premier national builder showdown organized by Hack2skill. 48 hours of intense hacking, mentor reviews from leading venture funds, compute credits, and direct fast-track interviews for top 10 finalists.',
    mode: 'both',
    eventType: 'hackathon',
    vibe: 'hands-on',
    categories: ['AI / ML', 'Web3 & Blockchain', 'Cloud & DevOps'],
    date: 'Oct 9 – Oct 11, 2026',
    time: 'Starts Friday 5:00 PM IST',
    isoDate: '2026-10-09T17:00:00+05:30',
    city: 'bengaluru',
    area: 'Whitefield',
    venue: 'KTPO Exhibition Center, Whitefield & Global Discord',
    virtualPlatform: 'Devpost & Discord Stage',
    rsvpUrl: 'https://hack2skill.com/',
    sourcePlatform: 'Devpost',
    price: 'Free',
    organizer: {
      id: 'hack2skill-community',
      name: 'Hack2skill Innovation Guild',
      avatar: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Quarterly Mega Hackathon',
      memberCount: 28500
    },
    seats: { total: 500, filled: 410 },
    speakers: [
      { name: 'Sameer Verma', role: 'Managing Partner @ Apex Ventures', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
      { name: 'Dr. Neha Kulkarni', role: 'VP AI Research @ CloudScale', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80' }
    ],
    agenda: [
      'Day 1: Keynote, Problem Statements Release & Team Forming',
      'Day 2: 24h Non-stop Build & Mentor Sprint Checkpoints',
      'Day 3: Final Jury Pitches & Award Ceremony'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-blr-05',
    title: 'Cloud-Native Kubernetes & eBPF Observability Masterclass',
    tagline: 'Deep dive into low-overhead kernel tracing and microservice security mesh',
    description: 'Learn how modern cloud platforms are replacing iptables with eBPF for lightning-fast container packet filtering, dynamic network policies, and real-time security observability without sidecars.',
    mode: 'online',
    eventType: 'workshop',
    vibe: 'deep-tech',
    categories: ['Cloud & DevOps', 'Cybersecurity'],
    date: 'Wednesday, Oct 14, 2026',
    time: '7:00 PM – 9:00 PM IST',
    isoDate: '2026-10-14T19:00:00+05:30',
    city: 'bengaluru',
    virtualPlatform: 'Google Meet Livestream',
    rsvpUrl: 'https://awsugblr.in/',
    sourcePlatform: 'Luma',
    price: 'Free',
    organizer: {
      id: 'aws-ug-bengaluru',
      name: 'AWS User Group Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets last Saturday monthly',
      memberCount: 11800
    },
    seats: { total: 300, filled: 185 },
    speakers: [
      { name: 'Vikram Joshi', role: 'Staff SRE @ Kubernetes Contributor', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80' }
    ],
    agenda: [
      '07:00 PM - Why sidecars are hitting performance ceilings',
      '07:45 PM - Writing and compiling our first eBPF bytecode probe',
      '08:30 PM - Real-time metrics visualization with Grafana'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-blr-06',
    title: 'Show & Pitch: 5-Minute Early Stage Demos',
    tagline: 'Founders and indie-hackers showcase live prototypes to senior engineers & angel scouts',
    description: 'Open demo night! 8 handpicked indie developers and stealth founders showcase live products in 5-minute timed slots, followed by rigorous 3-minute technical Q&A. Networking over pizza included.',
    mode: 'offline',
    eventType: 'meetup',
    vibe: 'career-pitching',
    categories: ['Full-Stack & React', 'AI / ML'],
    date: 'Friday, Oct 16, 2026',
    time: '6:00 PM – 8:30 PM IST',
    isoDate: '2026-10-16T18:00:00+05:30',
    city: 'bengaluru',
    area: 'HSR Layout',
    venue: 'BHIVE Workspace, Sector 6, HSR Layout',
    rsvpUrl: 'https://lu.ma/explore',
    sourcePlatform: 'Luma',
    price: 'Free',
    organizer: {
      id: 'react-bangalore',
      name: 'React & Next.js Bangalore',
      avatar: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets 1st Saturday monthly',
      memberCount: 8900
    },
    seats: { total: 60, filled: 55 },
    speakers: [],
    agenda: [
      '06:00 PM - Check-in & Artisan Pizza',
      '06:30 PM - 8 Live Demos (5 min demo + 3 min Q&A)',
      '07:45 PM - Audience Poll & Networking'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-blr-pm-tpf-vibe-sprint',
    title: 'The Product Folks: Vibe Sprint – Ship AI Products with Cursor & Claude',
    tagline: 'Hands-on Saturday sprint: PMs build and ship functional AI micro-apps in 4 hours',
    description: 'Hosted by The Product Folks (TPF) on Luma. Join 80+ product managers, founders, and designers. We deconstruct vibe coding, prompt chaining, Cursor IDE workflows, and how PMs are shipping functional prototypes directly without waiting for engineering sprints.',
    mode: 'offline',
    eventType: 'workshop',
    vibe: 'hands-on',
    categories: ['Product Management', 'AI / ML', 'Full-Stack & React'],
    date: 'Saturday, Sep 27, 2026',
    time: '10:30 AM – 2:30 PM IST',
    isoDate: '2026-09-27T10:30:00+05:30',
    city: 'bengaluru',
    area: 'Indiranagar',
    venue: 'Third Wave Coffee & Community Lounge, 100ft Road, Indiranagar, Bengaluru',
    rsvpUrl: 'https://lu.ma/productfolks',
    sourcePlatform: 'Luma',
    price: 'Free',
    organizer: {
      id: 'the-product-folks',
      name: 'The Product Folks (TPF)',
      avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets alternate Saturdays',
      memberCount: 145000
    },
    seats: { total: 80, filled: 74 },
    speakers: [
      { name: 'Suhas Motwani', role: 'Founder @ The Product Folks', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
      { name: 'Nikhil Gupta', role: 'AI Product Lead @ Cursor Community', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' }
    ],
    agenda: [
      '10:30 AM - Check-in & Artisan Filter Coffee',
      '11:00 AM - Live Teardown: Cursor + Claude 3.7 Vibe Coding Architecture for PMs',
      '12:00 PM - 2-Hour Building Sprint (PRD to Live Deploy)',
      '02:00 PM - Showcase & Peer Feedback'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-blr-pm-01',
    title: 'AI-Native Product Teardown: Re-imagining SaaS Workflows',
    tagline: 'Hands-on teardown session with The Product Folks dissecting agentic UX and multi-modal onboarding',
    description: 'Join 120+ Product Managers, Heads of Product, and designers at TPF Bengaluru. We will deconstruct how top AI products structure agent latency, user trust loops, model evaluation metrics, and monetization.',
    mode: 'offline',
    eventType: 'meetup',
    vibe: 'hands-on',
    categories: ['Product Management', 'AI / ML', 'UI/UX Design'],
    date: 'Saturday, Oct 10, 2026',
    time: '11:00 AM – 2:30 PM IST',
    isoDate: '2026-10-10T11:00:00+05:30',
    city: 'bengaluru',
    area: 'Residency Road',
    venue: 'WeWork Galaxy, 43 Residency Road, Bengaluru',
    rsvpUrl: 'https://lu.ma/productfolks',
    sourcePlatform: 'Luma',
    price: 'Free',
    organizer: {
      id: 'the-product-folks',
      name: 'The Product Folks (TPF)',
      avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets alternate Saturdays',
      memberCount: 145000
    },
    seats: { total: 120, filled: 104 },
    speakers: [
      { name: 'Suhas Motwani', role: 'Founder @ The Product Folks', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
      { name: 'Rhea Chakraborty', role: 'Group PM @ Swiggy', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80' }
    ],
    agenda: [
      '11:00 AM - Chai, Filter Coffee & Registration',
      '11:30 AM - Live Teardown: 3 Breakout AI Products and Their Funnels',
      '01:00 PM - Frameworks for Measuring LLM Feature Retention',
      '01:45 PM - Networking & Group Mentorship Circles'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-blr-pm-tpf-career-ama',
    title: 'The Product Folks: Breaking into AI PM & Career Navigation AMA',
    tagline: 'Unfiltered online masterclass with leading CPOs & Suhas Motwani on technical PM career paths',
    description: 'Live virtual masterclass and open Q&A organized by The Product Folks on LinkedIn & Luma. Learn how hiring teams evaluate AI product acumen, PRD quality, and how non-technical PMs transition into AI-native squads.',
    mode: 'online',
    eventType: 'workshop',
    vibe: 'career-pitching',
    categories: ['Product Management', 'AI / ML'],
    date: 'Wednesday, Oct 21, 2026',
    time: '7:00 PM – 8:30 PM IST',
    isoDate: '2026-10-21T19:00:00+05:30',
    city: 'bengaluru',
    virtualPlatform: 'Zoom & Luma Live',
    rsvpUrl: 'https://www.linkedin.com/company/theproductfolks/',
    sourcePlatform: 'LinkedIn',
    price: 'Free',
    organizer: {
      id: 'the-product-folks',
      name: 'The Product Folks (TPF)',
      avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets alternate Saturdays',
      memberCount: 145000
    },
    seats: { total: 500, filled: 412 },
    speakers: [
      { name: 'Suhas Motwani', role: 'Founder @ The Product Folks', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' }
    ],
    agenda: [
      '07:00 PM - The Changing Landscape of PM Hiring in 2026',
      '07:30 PM - Live PRD Review & AI Feature Teardown',
      '08:00 PM - Audience AMA & Open Mic'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-blr-pm-tpf-unconf',
    title: 'The Product Folks (UN)CONFERENCE 2026: Asia’s Flagship Product Summit',
    tagline: '1,500+ Product Leaders, VPs of Product, and AI founders gathered for unconference tracks and teardowns',
    description: 'The annual marquee mega-summit by The Product Folks. Features unconference-style open circles, unscripted product teardowns, CPO panels, and the annual Product 50 honors. Hybrid access with offline passes at Bengaluru and global livestream.',
    mode: 'both',
    eventType: 'conference',
    vibe: 'career-pitching',
    categories: ['Product Management', 'AI / ML', 'UI/UX Design'],
    date: 'Saturday, Nov 14, 2026',
    time: '9:00 AM – 6:30 PM IST',
    isoDate: '2026-11-14T09:00:00+05:30',
    city: 'bengaluru',
    area: 'Hosur Road',
    venue: 'NIMHANS Convention Centre, Hosur Main Road, Bengaluru & Global Livestream',
    virtualPlatform: 'Zoom & YouTube Live Stream',
    rsvpUrl: 'https://www.theproductfolks.com/',
    sourcePlatform: 'Official',
    price: 'Free',
    organizer: {
      id: 'the-product-folks',
      name: 'The Product Folks (TPF)',
      avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Quarterly / Annual Flagship',
      memberCount: 145000
    },
    seats: { total: 1500, filled: 1240 },
    speakers: [
      { name: 'Suhas Motwani', role: 'Founder @ The Product Folks', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
      { name: 'Tarun Davuluri', role: 'VP of Product @ Razorpay', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' }
    ],
    agenda: [
      '09:00 AM - Check-in, Breakfast & Opening Keynote',
      '10:30 AM - Unconference Track 1: AI Agents & Automated Roadmaps',
      '01:00 PM - Networking Lunch & Founder Mixers',
      '02:30 PM - Unconference Track 2: Monetization in B2B AI',
      '05:00 PM - Closing Panel & Product 50 Awards'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-blr-pm-02',
    title: 'GrabChai × The Product Folks: Morning PM & Founder Coffee Mixer',
    tagline: 'Low-pressure Sunday morning filter coffee & chai mixer for PMs and product builders on Luma',
    description: 'Organized in partnership with The Product Folks (TPF). No formal presentations or elevator pitches. Grab your hot cup of chai, stroll around the park, and chat about real product challenges, zero-to-one launches, roadmap trade-offs, and career transitions with fellow PMs.',
    mode: 'offline',
    eventType: 'meetup',
    vibe: 'casual-coffee',
    categories: ['Product Management', 'UI/UX Design'],
    date: 'Sunday, Oct 11, 2026',
    time: '8:30 AM – 10:30 AM IST',
    isoDate: '2026-10-11T08:30:00+05:30',
    city: 'bengaluru',
    area: 'Cubbon Park / Koramangala',
    venue: 'Cubbon Park Metro Plaza & Third Wave Coffee, Bengaluru',
    rsvpUrl: 'https://lu.ma/grabchai',
    sourcePlatform: 'Luma',
    price: 'Free (Order your chai)',
    organizer: {
      id: 'grabchai-community',
      name: 'GrabChai (Powered by The Product Folks)',
      avatar: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets every Sunday morning',
      memberCount: 18200
    },
    seats: { total: 35, filled: 30 },
    speakers: [],
    agenda: [
      '08:30 AM - Meet at the steps & grab chai/coffee',
      '09:00 AM - 45-minute stroll: Unfiltered discussion on PM burnout & prioritization',
      '10:00 AM - Open circle introductions & peer connections'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-blr-pm-03',
    title: 'ProductTank Bengaluru: 0-to-1 PM vs Scaling to 10M MAU',
    tagline: 'Senior VP of Product keynotes followed by unscripted Q&A on product-market fit and retention loops',
    description: 'Curated evening with ProductTank and Mind the Product. Two candid talks examining the transition from finding PMF in stealth mode to managing complex multi-squad backlogs and metrics governance at scale.',
    mode: 'both',
    eventType: 'meetup',
    vibe: 'deep-tech',
    categories: ['Product Management'],
    date: 'Thursday, Oct 15, 2026',
    time: '6:30 PM – 9:00 PM IST',
    isoDate: '2026-10-15T18:30:00+05:30',
    city: 'bengaluru',
    area: 'Koramangala',
    venue: 'Microsoft Reactor, 80ft Road, Koramangala & Zoom Livestream',
    virtualPlatform: 'Zoom / YouTube Live',
    rsvpUrl: 'https://www.mindtheproduct.com/producttank/bengaluru/',
    sourcePlatform: 'Meetup',
    price: 'Free',
    organizer: {
      id: 'producttank-bengaluru',
      name: 'ProductTank Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets 3rd Thursday monthly',
      memberCount: 12800
    },
    seats: { total: 100, filled: 88 },
    speakers: [
      { name: 'Naveen Kumar', role: 'VP of Product @ Razorpay', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' }
    ],
    agenda: [
      '06:30 PM - Welcome & Networking Bites',
      '07:00 PM - Keynote: De-risking 0-to-1 Bets Before Writing Code',
      '07:50 PM - Fireside Chat: Aligning Engineering, Design & Execs',
      '08:30 PM - Open Q&A'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-blr-pm-04',
    title: 'Product Growth & Experimentation Demo Night',
    tagline: '5 PMs present their live product experiments, conversion win stories, and UX redesigns',
    description: 'Rapid-fire demo night organized with Lenny’s Community Bengaluru. Product managers showcase the real A/B test data behind their highest-impact experiments. Learn what worked, what failed, and how they drove growth.',
    mode: 'offline',
    eventType: 'meetup',
    vibe: 'career-pitching',
    categories: ['Product Management', 'Full-Stack & React'],
    date: 'Friday, Oct 23, 2026',
    time: '6:00 PM – 8:30 PM IST',
    isoDate: '2026-10-23T18:00:00+05:30',
    city: 'bengaluru',
    area: 'Bellandur',
    venue: 'Indiqube Alpha, Outer Ring Road, Bellandur, Bengaluru',
    rsvpUrl: 'https://lu.ma/explore',
    sourcePlatform: 'Luma',
    price: 'Free',
    organizer: {
      id: 'lennys-community-blr',
      name: "Lenny's Community Bengaluru",
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets monthly Tuesday evenings',
      memberCount: 6500
    },
    seats: { total: 75, filled: 68 },
    speakers: [],
    agenda: [
      '06:00 PM - Artisan Pizza & Networking',
      '06:30 PM - 5 Live Case Studies (10 mins each + 5 mins Q&A)',
      '07:45 PM - Community Voting & Wrap-up'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80'
  },

  // =================== SAN FRANCISCO EVENTS ===================
  {
    id: 'event-sf-01',
    title: 'Silicon Valley AI Founders & Agentic Architecture Summit',
    tagline: 'Deep dive into Claude 3.5 Sonnet tool use, reasoning pipelines, and seed capital demos',
    description: 'Gathering of top AI engineers and YC founders in SoMa. Keynotes on context caching, agent state machines, and fine-tuning with open models.',
    mode: 'offline',
    eventType: 'conference',
    vibe: 'hands-on',
    categories: ['AI / ML', 'Full-Stack & React'],
    date: 'Saturday, Oct 3, 2026',
    time: '10:00 AM – 4:00 PM PST',
    isoDate: '2026-10-03T10:00:00-07:00',
    city: 'san-francisco',
    area: 'SoMa',
    venue: 'SHACK15, Ferry Building, San Francisco',
    rsvpUrl: 'https://lu.ma/explore',
    sourcePlatform: 'Luma',
    price: 'Free',
    organizer: {
      id: 'ai-engineer-sf',
      name: 'AI Engineer Foundation SF',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets bi-weekly',
      memberCount: 22000
    },
    seats: { total: 150, filled: 135 },
    speakers: [
      { name: 'Elena Rostova', role: 'Head of Agents @ Anthropic Ecosystem', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' }
    ],
    agenda: [
      '10:00 AM - Continental Breakfast & AI Matchmaking',
      '11:00 AM - State Machines in Production Agents',
      '01:00 PM - Live Coding Sandbox'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-sf-02',
    title: 'SF Python Project Night & Lightning Talks',
    tagline: 'Collaborative code reviews, FastAPI performance profiling, and lightning demos',
    description: 'Bring your laptop and join 100+ Python developers at Yelp HQ. Mentors will be on site to review open-source PRs, benchmark async IO, and help debug data pipelines.',
    mode: 'offline',
    eventType: 'meetup',
    vibe: 'hands-on',
    categories: ['AI / ML', 'Full-Stack & React'],
    date: 'Wednesday, Oct 7, 2026',
    time: '6:30 PM – 9:00 PM PST',
    isoDate: '2026-10-07T18:30:00-07:00',
    city: 'san-francisco',
    area: 'Mission District',
    venue: 'Yelp Headquarters, Mission St, SF',
    rsvpUrl: 'https://sfpython.org/',
    sourcePlatform: 'Meetup',
    price: 'Free',
    organizer: {
      id: 'sf-python',
      name: 'SF Python & PyBay',
      avatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets 2nd Wednesday monthly',
      memberCount: 16500
    },
    seats: { total: 100, filled: 88 },
    speakers: [],
    agenda: [
      '06:30 PM - Food & Beverage reception',
      '07:15 PM - 5 Lightning Talks (5 mins each)',
      '08:00 PM - Open Project Hacking'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80'
  },

  // =================== DELHI NCR EVENTS ===================
  {
    id: 'event-del-01',
    title: 'Delhi GenAI & Kubernetes Developer Day',
    tagline: 'Scaling distributed LLM inference on Kubernetes with vLLM & Ray on AWS',
    description: 'Join GDG New Delhi and cloud engineers for an in-person technical symposium on hosting open-weight models (Llama 3, Gemma) efficiently on Kubernetes clusters.',
    mode: 'offline',
    eventType: 'meetup',
    vibe: 'deep-tech',
    categories: ['AI / ML', 'Cloud & DevOps'],
    date: 'Saturday, Oct 10, 2026',
    time: '10:30 AM – 3:00 PM IST',
    isoDate: '2026-10-10T10:30:00+05:30',
    city: 'delhi-ncr',
    area: 'Connaught Place',
    venue: 'India Habitat Centre, Lodhi Road, New Delhi',
    rsvpUrl: 'https://gdg.community.dev/gdg-new-delhi/',
    sourcePlatform: 'Luma',
    price: 'Free',
    organizer: {
      id: 'gdg-new-delhi',
      name: 'GDG New Delhi',
      avatar: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets 3rd Saturday monthly',
      memberCount: 12500
    },
    seats: { total: 120, filled: 94 },
    speakers: [],
    agenda: [
      '10:30 AM - Welcome & Networking Tea',
      '11:15 AM - High-Throughput Model Serving with vLLM',
      '01:00 PM - Lunch & Open Discussion'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-del-02',
    title: 'PyDelhi Open Source & Python Sprint',
    tagline: 'Hands-on sprint contributing to popular Python libraries and data tooling',
    description: 'Community sprint organized by PyDelhi. Novice and seasoned contributors pair together to solve open issues on Python libraries.',
    mode: 'offline',
    eventType: 'workshop',
    vibe: 'hands-on',
    categories: ['Full-Stack & React', 'AI / ML'],
    date: 'Saturday, Oct 17, 2026',
    time: '11:00 AM – 4:00 PM IST',
    isoDate: '2026-10-17T11:00:00+05:30',
    city: 'delhi-ncr',
    area: 'Noida',
    venue: '91springboard Coworking, Sector 63, Noida',
    rsvpUrl: 'https://pydelhi.org/',
    sourcePlatform: 'Commudle',
    price: 'Free',
    organizer: {
      id: 'pydelhi',
      name: 'PyDelhi Community',
      avatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets alternate Saturdays',
      memberCount: 7800
    },
    seats: { total: 70, filled: 52 },
    speakers: [],
    agenda: [
      '11:00 AM - Sprint Introductions & First-Timers Guide',
      '12:00 PM - Pair Programming Sessions',
      '03:30 PM - Pull Request Celebrations'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-del-03',
    title: 'Serendipity - Leadership Dinner',
    tagline: 'Curated evening for senior product leaders and tech founders',
    description: 'An exclusive leadership dinner hosted by The Product Folks bringing together VP of Products, founders, and engineering executives to discuss scaling challenges, AI product roadmaps, and org dynamics in a private setting.',
    mode: 'offline',
    eventType: 'meetup',
    vibe: 'career-pitching',
    categories: ['Product Management', 'AI / ML'],
    date: 'Friday, Sep 25, 2026',
    time: '7:00 PM – 10:30 PM IST',
    isoDate: '2026-09-25T19:00:00+05:30',
    city: 'delhi-ncr',
    area: 'Gurgaon',
    venue: 'Horizon Colony, Golf Course Road, Gurgaon',
    rsvpUrl: 'https://lu.ma/productfolks',
    sourcePlatform: 'Luma',
    price: 'Invite Only',
    organizer: {
      id: 'the-product-folks',
      name: 'The Product Folks 🚀',
      avatar: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Curated Leader Circle',
      memberCount: 145000
    },
    seats: { total: 30, filled: 28 },
    speakers: [],
    agenda: [
      '07:00 PM - Cocktail Welcome & Executive Introductions',
      '08:00 PM - Closed-Door Roundtable: Monetizing AI in B2B',
      '09:30 PM - Curated Dinner & Strategic Connections'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-del-serendipity-marketing',
    title: 'Serendipity - Marketing & Growth Leaders Dinner',
    tagline: 'Curated closed-door evening for Heads of Growth, CMOs & Marketing VPs',
    description: 'An intimate executive dinner hosted by The Product Folks bringing together growth leaders, CMOs, and marketing executives to discuss retention funnels, performance scaling, and AI acquisition loops.',
    mode: 'offline',
    eventType: 'meetup',
    vibe: 'career-pitching',
    categories: ['Product Management', 'UI/UX Design'],
    date: 'Friday, Sep 25, 2026',
    time: '7:00 PM – 10:30 PM IST',
    isoDate: '2026-09-25T19:00:00+05:30',
    city: 'delhi-ncr',
    area: 'Gurgaon',
    venue: 'Horizon Colony, Golf Course Road, Gurgaon',
    rsvpUrl: 'https://lu.ma/productfolks',
    sourcePlatform: 'Luma',
    price: 'Invite Only',
    organizer: {
      id: 'the-product-folks',
      name: 'The Product Folks 🚀',
      avatar: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Curated Leader Circle',
      memberCount: 145000
    },
    seats: { total: 30, filled: 26 },
    speakers: [],
    agenda: [
      '07:00 PM - Welcome Cocktails & Private Mixer',
      '08:00 PM - Roundtable: Acquisition Playbooks & AI Search Shift',
      '09:30 PM - Curated Dinner'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-del-ship-it-replit',
    title: 'Ship it | Replit x TPF',
    tagline: 'Hands-on builder sprint building & shipping full-stack AI apps on Replit Agent',
    description: 'Learn, build, and ship real products in a high-energy Saturday sprint co-hosted by Replit and The Product Folks. Bring your laptop and build alongside PMs, designers, and full-stack builders.',
    mode: 'offline',
    eventType: 'hackathon',
    vibe: 'hands-on',
    categories: ['Product Management', 'Full-Stack & React', 'AI / ML'],
    date: 'Saturday, Sep 26, 2026',
    time: '11:00 AM – 3:30 PM IST',
    isoDate: '2026-09-26T11:00:00+05:30',
    city: 'delhi-ncr',
    area: 'Gurgaon',
    venue: 'ThoughtWorks / Replit Space, Cyber City, Gurgaon',
    rsvpUrl: 'https://lu.ma/productfolks',
    sourcePlatform: 'Luma',
    price: 'Free',
    organizer: {
      id: 'replit-tpf',
      name: 'The Product Folks 🚀, Syed Adil, Yash Jobanputra & Ish Kapoor',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Builder Sprint Series',
      memberCount: 145000
    },
    seats: { total: 75, filled: 68 },
    speakers: [],
    agenda: [
      '11:00 AM - Registration & Keynote: Prototyping with Replit Agent',
      '11:45 AM - Build Sprint: Turn PRDs into Deployed Apps',
      '02:30 PM - Live Demos & Audience Votes',
      '03:15 PM - High-Fives & Prizes'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-del-04',
    title: 'Build with SwytchCode: Gurgaon Edition',
    tagline: 'Intensive code lab building high-scale developer workflows & cloud-native tooling',
    description: 'Join fellow builders, full-stack engineers, and cloud architects for a Saturday hack edition hosted at ThoughtWorks. Deep dive into modern reactive pipelines, event-driven backends, and micro-services.',
    mode: 'offline',
    eventType: 'workshop',
    vibe: 'hands-on',
    categories: ['Full-Stack & React', 'Cloud & DevOps'],
    date: 'Saturday, Sep 26, 2026',
    time: '9:00 AM – 2:00 PM IST',
    isoDate: '2026-09-26T09:00:00+05:30',
    city: 'delhi-ncr',
    area: 'Gurgaon',
    venue: 'ThoughtWorks Technologies, DLF Cyber City, Gurgaon',
    rsvpUrl: 'https://lu.ma/explore',
    sourcePlatform: 'Luma',
    price: 'Free',
    organizer: {
      id: 'swytchcode-delhi',
      name: 'Aryan Jangra, Mohd Kafeel Khan & Abdullah Sha...',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Bi-Weekly Hack Series',
      memberCount: 3400
    },
    seats: { total: 60, filled: 42 },
    speakers: [],
    agenda: [
      '09:00 AM - Breakfast & Setup',
      '09:45 AM - Architecture Teardown: Reactive Pipelines',
      '11:00 AM - Live Pairing Lab',
      '01:30 PM - Demos & Networking'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-del-05',
    title: 'Delhi Startup Founders Baithak By Bizowl',
    tagline: 'Grassroots founders meetup on 0-to-1 PMF, angel syndicates, and unit economics',
    description: 'A candid, community-driven gathering of early-stage founders and product operators sharing actionable playbooks, GTM lessons, and investor relations over tea and coffee.',
    mode: 'offline',
    eventType: 'meetup',
    vibe: 'casual-coffee',
    categories: ['Product Management', 'UI/UX Design'],
    date: 'Saturday, Sep 26, 2026',
    time: '2:00 PM – 6:00 PM IST',
    isoDate: '2026-09-26T14:00:00+05:30',
    city: 'delhi-ncr',
    area: 'Noida',
    venue: 'Atta Market, Sector 18, Noida',
    rsvpUrl: 'https://lu.ma/explore',
    sourcePlatform: 'Luma',
    price: 'Free',
    organizer: {
      id: 'bizowl-community',
      name: 'Prashant Sirohi, Adarsh Singh, Sujay Sanyal & Ak...',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Weekly Founders Baithak',
      memberCount: 5200
    },
    seats: { total: 45, filled: 43 },
    speakers: [],
    agenda: [
      '02:00 PM - Chai & Informal Catchups',
      '03:00 PM - Founder War Stories: Pitching Angels & Staying Alive',
      '04:30 PM - Open Microphones for Product Teardowns'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-del-06',
    title: 'Observability | Insights | Impact Sep 2026 Grafana meetup',
    tagline: 'Deep dive into Prometheus metrics, OpenTelemetry traces, and Grafana Loki',
    description: 'Hands-on technical sessions covering enterprise-grade observability stacks, distributed tracing with OpenTelemetry, and SLO alert routing at scale.',
    mode: 'offline',
    eventType: 'meetup',
    vibe: 'deep-tech',
    categories: ['Cloud & DevOps', 'Rust & Systems'],
    date: 'Sunday, Sep 27, 2026',
    time: '10:00 AM – 2:00 PM IST',
    isoDate: '2026-09-27T10:00:00+05:30',
    city: 'delhi-ncr',
    area: 'Noida',
    venue: 'Paytm Campus, Sector 137, Noida',
    rsvpUrl: 'https://lu.ma/explore',
    sourcePlatform: 'Luma',
    price: 'Free',
    organizer: {
      id: 'grafana-delhi',
      name: 'Tauqeer Ahmad, Umesh Pawar & Grafana and Fri...',
      avatar: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Monthly Observability Guild',
      memberCount: 6100
    },
    seats: { total: 100, filled: 82 },
    speakers: [],
    agenda: [
      '10:00 AM - Welcome & Registration',
      '10:30 AM - OpenTelemetry Zero-Code Instrumentation in Production',
      '11:45 AM - High-Cardinality Prometheus Storage with Mimir',
      '01:15 PM - Networking Lunch hosted by Paytm'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80'
  },

  // =================== MUMBAI EVENTS ===================
  {
    id: 'event-mum-01',
    title: 'Mumbai Tech Founders & FinTech Architecture Mixer',
    tagline: 'Engineering high-resilience payment switches, UPI scale, and distributed ledgers',
    description: 'Curated gathering of FinTech CTOs, staff engineers, and founders in BKC discussing fault-tolerant transactional architectures.',
    mode: 'offline',
    eventType: 'meetup',
    vibe: 'deep-tech',
    categories: ['Cloud & DevOps', 'Web3 & Blockchain'],
    date: 'Saturday, Oct 24, 2026',
    time: '5:00 PM – 8:00 PM IST',
    isoDate: '2026-10-24T17:00:00+05:30',
    city: 'mumbai',
    area: 'Bandra Kurla Complex (BKC)',
    venue: 'WeWork Enam Sambhav, BKC, Mumbai',
    rsvpUrl: 'https://gdg.community.dev/gdg-mumbai/',
    sourcePlatform: 'Luma',
    price: 'Free',
    organizer: {
      id: 'gdg-mumbai',
      name: 'GDG Mumbai',
      avatar: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets 2nd Sunday monthly',
      memberCount: 9800
    },
    seats: { total: 80, filled: 65 },
    speakers: [],
    agenda: [
      '05:00 PM - Arrivals & Networking',
      '06:00 PM - Case Study: Surviving 100k TPS during flash sales',
      '07:30 PM - Mixer & Drinks'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop&q=80'
  },

  // =================== GLOBAL VIRTUAL EVENTS ===================
  {
    id: 'event-virt-01',
    title: 'Global AI Agent Builder Hackathon 2026',
    tagline: 'Build autonomous coding assistants and research agents over 72 hours online',
    description: 'Worldwide virtual hackathon hosted on Devpost. Access free compute credits, live mentorship stages on Discord, and $50k in cash prizes.',
    mode: 'online',
    eventType: 'hackathon',
    vibe: 'hands-on',
    categories: ['AI / ML', 'Full-Stack & React'],
    date: 'Nov 6 – Nov 8, 2026',
    time: 'Virtual Stage · 24/7 Global',
    isoDate: '2026-11-06T00:00:00Z',
    city: 'remote',
    virtualPlatform: 'Devpost & Discord Global Stage',
    rsvpUrl: 'https://hack2skill.com/',
    sourcePlatform: 'Devpost',
    price: 'Free',
    organizer: {
      id: 'hack2skill-community',
      name: 'Hack2skill Innovation Guild',
      avatar: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Quarterly Global Hackathon',
      memberCount: 28500
    },
    seats: { total: 2000, filled: 1420 },
    speakers: [],
    agenda: [
      'Day 1: Global Kickoff & API Access Keys',
      'Day 2: Office Hours with Core Maintainers',
      'Day 3: Final Demos & Livestream Finale'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-blr-atlassian-01',
    title: 'Atlassian Community: Jira Product Discovery & Confluence AI Masterclass',
    tagline: 'Hands-on workshop configuring idea prioritization matrices, roadmaps, and Rovo AI workflows',
    description: 'Join Atlassian community leaders, product managers, and agile coaches for an interactive evening at the Atlassian R&D Center in Bengaluru and streamed globally. Explore how Atlassian Intelligence (AI) and Jira Product Discovery are reshaping product backlog prioritization and automated release summaries.',
    mode: 'both',
    eventType: 'workshop',
    vibe: 'hands-on',
    categories: ['Product Management', 'AI / ML', 'Cloud & DevOps'],
    date: 'Wednesday, Oct 28, 2026',
    time: '6:00 PM – 8:30 PM IST',
    isoDate: '2026-10-28T18:00:00+05:30',
    city: 'bengaluru',
    area: 'Bellandur',
    venue: 'Atlassian R&D Center, Campus 5B, RMZ Ecoworld, Bellandur, Bengaluru & Zoom Webinar',
    virtualPlatform: 'Zoom Webinar',
    rsvpUrl: 'https://ace.atlassian.com/bangalore/',
    sourcePlatform: 'Luma',
    price: 'Free',
    organizer: {
      id: 'atlassian-community-blr',
      name: 'Atlassian Community Bengaluru (ACE)',
      avatar: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets bi-monthly + monthly webinars',
      memberCount: 16200
    },
    seats: { total: 150, filled: 128 },
    speakers: [
      { name: 'Kavita Menon', role: 'Principal Product Manager @ Atlassian', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80' },
      { name: 'Rahul Chawla', role: 'DevOps & Agile Lead @ Atlassian Community', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' }
    ],
    agenda: [
      '06:00 PM - Welcome High Tea & Networking at Ecoworld',
      '06:30 PM - Live Demo: Transforming Customer Signal into Jira Epics with Atlassian Intelligence',
      '07:30 PM - Hands-on Discovery Matrix Setup & Open Q&A'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-virt-atlassian-02',
    title: 'Atlassian Developer Day: Building Rovo AI Agents & Forge Extensions',
    tagline: 'Technical virtual code-along building custom enterprise AI agents with Atlassian Forge',
    description: 'Deep dive for software engineers and technical product managers. Learn to construct custom Rovo AI agents that synthesize customer feedback from Jira tickets and automatically draft PRDs in Confluence.',
    mode: 'online',
    eventType: 'workshop',
    vibe: 'deep-tech',
    categories: ['AI / ML', 'Full-Stack & React', 'Cloud & DevOps'],
    date: 'Thursday, Nov 5, 2026',
    time: '7:00 PM – 9:00 PM IST',
    isoDate: '2026-11-05T19:00:00+05:30',
    city: 'remote',
    virtualPlatform: 'Atlassian Developer Portal Livestream',
    rsvpUrl: 'https://developer.atlassian.com/',
    sourcePlatform: 'Luma',
    price: 'Free',
    organizer: {
      id: 'atlassian-community-blr',
      name: 'Atlassian Community Bengaluru (ACE)',
      avatar: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets monthly virtual masterclasses',
      memberCount: 16200
    },
    seats: { total: 500, filled: 310 },
    speakers: [],
    agenda: [
      '07:00 PM - Architecture of Atlassian Rovo & Context Graphs',
      '07:45 PM - Hands-on Lab: Writing your first Forge Action & Trigger',
      '08:30 PM - Live Testing in Jira & Confluence'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-blr-aitinkerers-01',
    title: 'AI Tinkerers BLR: Reasoning Models, Local Agents & Live Code Only',
    tagline: 'Strictly no pitch decks — 6 builders demonstrate real open-source AI projects and tool chains',
    description: 'AI Tinkerers brings together hardcore AI researchers, engineers, and technical founders. Each speaker has 5 minutes to show running terminal code, local model benchmarks, or agent architectures.',
    mode: 'offline',
    eventType: 'meetup',
    vibe: 'hands-on',
    categories: ['AI / ML', 'Rust & Systems'],
    date: 'Wednesday, Nov 11, 2026',
    time: '6:30 PM – 9:00 PM IST',
    isoDate: '2026-11-11T18:30:00+05:30',
    city: 'bengaluru',
    area: 'Indiranagar',
    venue: 'BHIVE Workspace, 100ft Road, Indiranagar, Bengaluru',
    rsvpUrl: 'https://lu.ma/explore',
    sourcePlatform: 'Luma',
    price: 'Free',
    organizer: {
      id: 'ai-tinkerers-blr',
      name: 'AI Tinkerers Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets 3rd Wednesday monthly',
      memberCount: 5800
    },
    seats: { total: 80, filled: 74 },
    speakers: [],
    agenda: [
      '06:30 PM - Doors Open & Live Audio/Video Demos',
      '07:00 PM - 6 Live Technical Showcases (Strictly Running Code)',
      '08:15 PM - Open Networking & Model Benchmarking'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-blr-kcd-01',
    title: 'CNCF & Kubernetes Community Days: Cloud-Native Summit',
    tagline: 'Quarterly flagship gathering on eBPF, Platform Engineering, and GitOps at scale',
    description: 'Premier quarterly cloud-native conference hosted by KCD Bengaluru. Featuring technical case studies from engineers operating clusters running millions of pods across hybrid cloud.',
    mode: 'both',
    eventType: 'conference',
    vibe: 'deep-tech',
    categories: ['Cloud & DevOps', 'Cybersecurity', 'Rust & Systems'],
    date: 'Saturday, Nov 21, 2026',
    time: '9:00 AM – 5:30 PM IST',
    isoDate: '2026-11-21T09:00:00+05:30',
    city: 'bengaluru',
    area: 'Outer Ring Road',
    venue: 'NIMHANS Convention Centre & YouTube Live',
    virtualPlatform: 'CNCF Community Livestream',
    rsvpUrl: 'https://community.cncf.io/bangalore/',
    sourcePlatform: 'Commudle',
    price: 'Free',
    organizer: {
      id: 'kcd-bengaluru',
      name: 'CNCF & Kubernetes Community Days (KCD)',
      avatar: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Quarterly Flagship Summit',
      memberCount: 19500
    },
    seats: { total: 450, filled: 390 },
    speakers: [],
    agenda: [
      '09:00 AM - Keynote: The Future of Cloud-Native Infrastructure',
      '10:30 AM - eBPF vs Sidecars in Production Mesh',
      '02:00 PM - Interactive Platform Engineering BoF (Birds of a Feather)'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-blr-hasgeek-systems',
    title: 'Bengaluru Systems Meetup: LSM-Trees, Storage Engines & Consensus',
    tagline: 'Deep technical evening exploring storage engine internals, RocksDB vs Pebble, and Raft consensus',
    description: 'Organized by HasGeek. A gathering of systems engineers, database architects, and distributed computing practitioners in Indiranagar. Unpack storage layout tradeoffs, write amplification, and consensus under network partitions.',
    mode: 'offline',
    eventType: 'meetup',
    vibe: 'deep-tech',
    categories: ['Rust & Systems', 'Cloud & DevOps'],
    date: 'Saturday, Oct 17, 2026',
    time: '4:00 PM – 7:30 PM IST',
    isoDate: '2026-10-17T16:00:00+05:30',
    city: 'bengaluru',
    area: 'Indiranagar',
    venue: 'HasGeek House, 2nd Cross, Domlur / Indiranagar, Bengaluru',
    rsvpUrl: 'https://hasgeek.com/',
    sourcePlatform: 'Official',
    price: 'Free',
    organizer: {
      id: 'hasgeek-systems',
      name: 'HasGeek Bengaluru Systems',
      avatar: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets 3rd Saturday monthly',
      memberCount: 11400
    },
    seats: { total: 60, filled: 52 },
    speakers: [
      { name: 'Kiran Jonnalagadda', role: 'Founder @ HasGeek', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' }
    ],
    agenda: [
      '04:00 PM - Filter Coffee & Systems Architecture Teardown',
      '04:30 PM - Pebble vs RocksDB: LSM Compaction Strategies in High-Throughput KV Stores',
      '06:00 PM - Multi-Raft Partitioning in Modern Cloud Databases',
      '07:00 PM - Open Benchmarks & Peer Networking'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-blr-aws-bedrock',
    title: 'AWS Community Day: Generative AI on AWS & Bedrock Architecture Summit',
    tagline: 'Hands-on labs building enterprise RAG pipelines with Amazon Bedrock, Knowledge Bases & OpenSearch',
    description: 'Organized by AWS User Group Bengaluru. Learn directly from AWS Community Heroes and Solutions Architects. Dive into guardrails for Amazon Bedrock, multi-agent evaluation, and cost-effective model serving on AWS Inferentia.',
    mode: 'offline',
    eventType: 'conference',
    vibe: 'hands-on',
    categories: ['Cloud & DevOps', 'AI / ML'],
    date: 'Saturday, Oct 31, 2026',
    time: '9:30 AM – 5:00 PM IST',
    isoDate: '2026-10-31T09:30:00+05:30',
    city: 'bengaluru',
    area: 'Mahadevapura',
    venue: 'Amazon Development Centre, Taurus Building, Bagmane World Technology Centre, Bengaluru',
    rsvpUrl: 'https://awsugblr.in/',
    sourcePlatform: 'Meetup',
    price: 'Free',
    organizer: {
      id: 'aws-ug-bengaluru',
      name: 'AWS User Group Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets last Saturday monthly',
      memberCount: 21000
    },
    seats: { total: 300, filled: 275 },
    speakers: [
      { name: 'Prashanth H', role: 'AWS Serverless Community Hero', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80' }
    ],
    agenda: [
      '09:30 AM - Keynote: Modern Enterprise Architectures with Bedrock Agents',
      '11:00 AM - Productionizing OpenSearch Vector Databases with Milvus on EKS',
      '01:00 PM - Community Networking Lunch',
      '02:30 PM - Cost Optimization on Graviton4 & Inferentia2',
      '04:30 PM - Ask the Solutions Architects Panel'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-blr-devfolio-hackathon',
    title: 'Devfolio Build India: Agentic AI 48-Hour National Hackathon',
    tagline: '₹5,00,000 in bounties for teams shipping autonomous multi-agent workflows and developer tools',
    description: 'Join 250+ top engineers and builders in Bengaluru or compete online nationwide. 48 hours to conceptualize, design, and ship production-grade agentic tools with mentors from Google, Anthropic, and YC startups.',
    mode: 'both',
    eventType: 'hackathon',
    vibe: 'hands-on',
    categories: ['AI / ML', 'Full-Stack & React', 'Product Management'],
    date: 'Friday, Oct 23 – Sunday, Oct 25, 2026',
    time: '6:00 PM Friday – 5:00 PM Sunday IST',
    isoDate: '2026-10-23T18:00:00+05:30',
    city: 'bengaluru',
    area: 'Residency Road',
    venue: 'WeWork Galaxy, 43 Residency Road, Bengaluru & Virtual Devfolio Discord',
    virtualPlatform: 'Devfolio Live Stream & Discord',
    rsvpUrl: 'https://devfolio.co/',
    sourcePlatform: 'Devpost',
    price: 'Free',
    organizer: {
      id: 'hack2skill-community',
      name: 'Hack2skill & Devfolio',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Bi-Weekly National Hackathons',
      memberCount: 185000
    },
    seats: { total: 250, filled: 220 },
    speakers: [],
    agenda: [
      'Friday 06:00 PM - Team Matchmaking & Opening Ceremony',
      'Saturday 10:00 AM - Mentor Checkpoints & API Sprints',
      'Sunday 02:00 PM - Project Submissions & Top 10 Live Demos',
      'Sunday 04:30 PM - Winner Felicitation & Grants'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-blr-huggingface-lab',
    title: 'GenAI Collective & HuggingFace: Local LLM Fine-Tuning & Quantization Lab',
    tagline: 'Hands-on workshop: Parameter-efficient fine-tuning (QLoRA, Unsloth) and vLLM deployment',
    description: 'Community workshop hosted with HuggingFace India. Learn how to curate high-quality synthetic datasets, fine-tune open-weight reasoning models like DeepSeek-R1 and Llama-3.3, and deploy with high token throughput using vLLM and TensorRT-LLM.',
    mode: 'both',
    eventType: 'workshop',
    vibe: 'deep-tech',
    categories: ['AI / ML', 'Rust & Systems'],
    date: 'Saturday, Nov 07, 2026',
    time: '10:00 AM – 3:30 PM IST',
    isoDate: '2026-11-07T10:00:00+05:30',
    city: 'bengaluru',
    area: 'Koramangala',
    venue: 'Microsoft Reactor, 80ft Road, Koramangala, Bengaluru & Global Zoom Stream',
    virtualPlatform: 'Zoom & YouTube Live',
    rsvpUrl: 'https://lu.ma/explore',
    sourcePlatform: 'Luma',
    price: 'Free',
    organizer: {
      id: 'ai-tinkerers-blr',
      name: 'AI Tinkerers & GenAI Collective',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets 1st Saturday monthly',
      memberCount: 14200
    },
    seats: { total: 120, filled: 112 },
    speakers: [
      { name: 'Arjun Sen', role: 'Open Source ML Researcher', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' }
    ],
    agenda: [
      '10:00 AM - Synthetic Data Generation & Cleaning Pipeline with Distilabel',
      '11:30 AM - QLoRA & Unsloth 2x Faster Fine-Tuning on Single GPU',
      '01:30 PM - Quantization Techniques (AWQ, EXL2, GGUF)',
      '02:30 PM - Serving 100+ Requests/Sec with vLLM PagedAttention'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-blr-ace-rovo-cloud',
    title: 'Atlassian Community Bengaluru (ACE): Jira Cloud Migration & Rovo AI Showcase',
    tagline: 'In-person meetup at Atlassian R&D Center on automating team velocity and AI context search',
    description: 'Join the official Atlassian Community Events Bengaluru chapter at the Atlassian EGL Campus. Engineering and product teams share real enterprise case studies migrating Jira Server/Data Center to Cloud and activating Atlassian Intelligence and Rovo search across enterprise silos.',
    mode: 'offline',
    eventType: 'meetup',
    vibe: 'deep-tech',
    categories: ['Product Management', 'Cloud & DevOps', 'AI / ML'],
    date: 'Thursday, Nov 12, 2026',
    time: '6:00 PM – 8:30 PM IST',
    isoDate: '2026-11-12T18:00:00+05:30',
    city: 'bengaluru',
    area: 'Domlur',
    venue: 'Atlassian India R&D Campus, Embassy GolfLinks (EGL), Domlur, Bengaluru',
    rsvpUrl: 'https://ace.atlassian.com/bengaluru/',
    sourcePlatform: 'Official',
    price: 'Free',
    organizer: {
      id: 'atlassian-community-blr',
      name: 'Atlassian Community Bengaluru (ACE)',
      avatar: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Official Atlassian Community Chapter',
      memberCount: 16200
    },
    seats: { total: 150, filled: 132 },
    speakers: [
      { name: 'Deepak Sharma', role: 'Head of Developer Experience @ Atlassian ACE', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' }
    ],
    agenda: [
      '06:00 PM - Registration & Networking Snacks at Atlassian Cafeteria',
      '06:30 PM - Zero-Downtime Jira Data Center to Cloud Migration Strategies',
      '07:30 PM - Live Demo: Rovo AI Multi-Silo Search & Automated Release Notes',
      '08:15 PM - Community Q&A and Giveaways'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'event-blr-producttank-exec',
    title: 'ProductTank Executive: AI PRD Governance & Roadmap Strategy at Scale',
    tagline: 'Fireside discussion with Chief Product Officers on balancing AI experimental bets with core revenue',
    description: 'Quarterly executive session by ProductTank Bengaluru. Leading CPOs and VPs of Product discuss how product squads structure AI feature governance, customer feedback triage, and metric accountability when probabilistic AI features don’t behave like deterministic software.',
    mode: 'both',
    eventType: 'meetup',
    vibe: 'career-pitching',
    categories: ['Product Management', 'UI/UX Design'],
    date: 'Thursday, Nov 19, 2026',
    time: '6:30 PM – 9:00 PM IST',
    isoDate: '2026-11-19T18:30:00+05:30',
    city: 'bengaluru',
    area: 'Koramangala',
    venue: 'WeWork Salarpuria Symbiosis, Bannerghatta Main Rd & Zoom Livestream',
    virtualPlatform: 'Zoom Livestream',
    rsvpUrl: 'https://www.mindtheproduct.com/producttank/bengaluru/',
    sourcePlatform: 'Meetup',
    price: 'Free',
    organizer: {
      id: 'producttank-bengaluru',
      name: 'ProductTank Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=150&auto=format&fit=crop&q=80',
      verified: true,
      cadenceBadge: 'Meets monthly quarterly flagships',
      memberCount: 12800
    },
    seats: { total: 100, filled: 84 },
    speakers: [
      { name: 'Naveen Kumar', role: 'VP of Product @ Razorpay', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
      { name: 'Aditi Rao', role: 'CPO @ Enterprise SaaS', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80' }
    ],
    agenda: [
      '06:30 PM - High Tea & Executive Networking',
      '07:00 PM - Fireside: Measuring Return on Investment for Generative Features',
      '08:00 PM - Interactive Teardown: How 3 Enterprises Dealt with AI Hallucination Crises',
      '08:45 PM - Open Mixer'
    ],
    bannerUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80'
  }
];
