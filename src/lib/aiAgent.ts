/**
 * PulseAI Agent Engine: Context Grounding, Cadence Forecasting & Dynamic Gemini LLM Integration
 */

import { EventItem, Community } from '../types/event';
import { EVENTS_DATA, COMMUNITIES_DATA } from '../data/mockData';
import { filterActiveUpcomingEvents } from './dateUtils';

export interface AgentForecastResult {
  community: Community;
  frequencyText: string;
  predictedWindow: string;
  confidenceScore: string;
  recommendation: 'register_now' | 'wait_for_drop';
  activeEvent?: EventItem;
}

export interface AgentWidgetData {
  type: 'event_card' | 'community_forecast' | 'alert_scheduler';
  event?: EventItem;
  forecast?: AgentForecastResult;
  suggestedCategory?: string;
  suggestedCity?: string;
}

export interface AgentResponse {
  messageText: string;
  widgets?: AgentWidgetData[];
  suggestedPrompts?: string[];
}

export interface ChatHistoryItem {
  role: 'user' | 'model';
  text: string;
}

const GEMINI_STORAGE_KEY = 'pulse_gemini_api_key';
export const DEFAULT_GEMINI_KEY = '';

// Tested and resilient Gemini model endpoints supporting generateContent
const GEMINI_MODELS = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];

export function getGeminiApiKey(): string {
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ? import.meta.env.VITE_GEMINI_API_KEY : '';
  if (envKey && envKey.trim()) return envKey.trim();

  try {
    const saved = localStorage.getItem(GEMINI_STORAGE_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch {}

  return '';
}

export function saveGeminiApiKey(key: string): void {
  if (key.trim()) {
    localStorage.setItem(GEMINI_STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(GEMINI_STORAGE_KEY);
  }
}

/**
 * Community Cadence & Frequency Intelligence Calculator
 */
export function calculateCommunityCadence(
  community: Community,
  events: EventItem[]
): AgentForecastResult {
  const activeEvent = events.find(
    e => {
      const orgId = typeof e.organizer === 'object' && e.organizer?.id ? e.organizer.id : '';
      const orgName = typeof e.organizer === 'object' && e.organizer?.name ? e.organizer.name : (typeof e.organizer === 'string' ? e.organizer : '');
      return orgId === community.id || orgName.toLowerCase().includes(community.name.toLowerCase());
    }
  );

  const frequencyText = community.cadence || 'Meets regularly';
  const predictedWindow = community.nextForecast || 'Forecast: Next 2-3 weeks';
  const confidenceScore = community.consistencyScore ? community.consistencyScore.split('·')[0].trim() : '92% Reliability';

  return {
    community,
    frequencyText,
    predictedWindow,
    confidenceScore,
    recommendation: activeEvent ? 'register_now' : 'wait_for_drop',
    activeEvent
  };
}

/**
 * Search platform communities with cadence forecasting
 */
export function findCommunityForecasts(
  query: string,
  city?: string,
  events: EventItem[] = EVENTS_DATA
): AgentForecastResult[] {
  const q = query.toLowerCase();
  
  const matched = COMMUNITIES_DATA.filter(c => {
    const matchesCity = !city || city === 'all' || c.city.toLowerCase() === city.toLowerCase();
    const matchesTopic = c.topics.some(t => t.toLowerCase().includes(q) || q.includes(t.toLowerCase()));
    const matchesName = c.name.toLowerCase().includes(q) || q.includes(c.name.toLowerCase());
    return matchesCity && (matchesTopic || matchesName);
  });

  return matched.slice(0, 3).map(c => calculateCommunityCadence(c, events));
}

/**
 * Primary Agent reasoning dispatcher: Uses live Gemini LLM with grounding & conversation memory,
 * or grounded contextual agent fallback.
 */
export async function queryAIAgent(params: {
  prompt: string;
  events: EventItem[];
  userCity?: string;
  history?: ChatHistoryItem[];
}): Promise<AgentResponse> {
  const apiKey = getGeminiApiKey();
  const lower = params.prompt.toLowerCase();

  // 1. Detect target city
  let targetCity = params.userCity;
  if (lower.includes('bengaluru') || lower.includes('bangalore')) targetCity = 'bengaluru';
  else if (lower.includes('delhi') || lower.includes('gurugram') || lower.includes('ncr') || lower.includes('noida')) targetCity = 'delhi-ncr';
  else if (lower.includes('mumbai') || lower.includes('bkc')) targetCity = 'mumbai';
  else if (lower.includes('pune')) targetCity = 'pune';
  else if (lower.includes('hyderabad')) targetCity = 'hyderabad';
  else if (lower.includes('virtual') || lower.includes('remote') || lower.includes('online')) targetCity = 'remote';

  // 2. Detect target category / domain
  let targetCategory: string | undefined;
  if (lower.includes('fintech') || lower.includes('finance') || lower.includes('trading') || lower.includes('defi') || lower.includes('upi')) {
    targetCategory = 'Finance / FinTech';
  } else if (lower.includes('ai') || lower.includes('ml') || lower.includes('llm') || lower.includes('agent')) {
    targetCategory = 'AI / ML';
  } else if (lower.includes('product') || lower.includes('pm') || lower.includes('growth')) {
    targetCategory = 'Product Management';
  } else if (lower.includes('cloud') || lower.includes('devops') || lower.includes('kubernetes')) {
    targetCategory = 'Cloud & DevOps';
  } else if (lower.includes('rust') || lower.includes('systems')) {
    targetCategory = 'Rust & Systems';
  } else if (lower.includes('web3') || lower.includes('blockchain')) {
    targetCategory = 'Web3 & Blockchain';
  } else if (lower.includes('founder') || lower.includes('pitch') || lower.includes('vc') || lower.includes('startup')) {
    targetCategory = 'Founders, Pitch & VC';
  } else if (lower.includes('saas') || lower.includes('gtm')) {
    targetCategory = 'B2B SaaS & GTM Growth';
  } else if (lower.includes('robot') || lower.includes('hardware')) {
    targetCategory = 'Hardware & Robotics';
  }

  // Filter out any events that have already started, completed, or closed registration
  const activeEvents = filterActiveUpcomingEvents(params.events);

  // 3. Match relevant events from active catalog
  const matchedEvents = activeEvents.filter(e => {
    const cityMatch = !targetCity || targetCity === 'all' || e.city.toLowerCase() === targetCity.toLowerCase();
    const catMatch = !targetCategory || e.categories.some(c => c.toLowerCase().includes(targetCategory!.toLowerCase()));
    const textMatch = lower.split(' ').some(w => w.length > 3 && (e.title.toLowerCase().includes(w) || e.description.toLowerCase().includes(w)));
    return (cityMatch && catMatch) || textMatch;
  }).slice(0, 4);

  // 4. Calculate Community Cadence & Forecasts
  const communityForecasts = findCommunityForecasts(
    targetCategory || lower,
    targetCity,
    activeEvents
  );

  // If Gemini API Key is configured, attempt live LLM inference with grounding & fallback
  if (apiKey) {
    try {
      const geminiResult = await callGeminiWithFallback({
        apiKey,
        prompt: params.prompt,
        history: params.history,
        events: activeEvents,
        matchedEvents,
        forecasts: communityForecasts,
        targetCity,
        targetCategory
      });

      if (geminiResult) {
        return parseAndBuildResponse(geminiResult, matchedEvents, communityForecasts, targetCategory, targetCity);
      }
    } catch (e) {
      console.warn('[Gemini LLM Call Error, falling back to Grounded Engine]:', e);
    }
  }

  // Grounded Deterministic Agent Fallback
  return generateGroundedAgentResponse({
    prompt: params.prompt,
    events: matchedEvents,
    forecasts: communityForecasts,
    targetCity: targetCity || 'all hubs',
    targetCategory: targetCategory || 'Tech'
  });
}

/**
 * Call Gemini with multi-model fallback chain
 */
async function callGeminiWithFallback(params: {
  apiKey: string;
  prompt: string;
  history?: ChatHistoryItem[];
  events: EventItem[];
  matchedEvents: EventItem[];
  forecasts: AgentForecastResult[];
  targetCity?: string;
  targetCategory?: string;
}): Promise<string | null> {
  for (const model of GEMINI_MODELS) {
    try {
      const text = await executeGeminiRequest(model, params);
      if (text) return text;
    } catch (err) {
      console.warn(`[Gemini model ${model} failed, trying next]:`, err);
    }
  }
  return null;
}

/**
 * Executes a single generateContent request to a specific Gemini model
 */
async function executeGeminiRequest(
  model: string,
  params: {
    apiKey: string;
    prompt: string;
    history?: ChatHistoryItem[];
    events: EventItem[];
    matchedEvents: EventItem[];
    forecasts: AgentForecastResult[];
    targetCity?: string;
    targetCategory?: string;
  }
): Promise<string | null> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${params.apiKey}`;

  // Grounding context: Live events data
  const sampleEvents = (params.matchedEvents.length > 0 ? params.matchedEvents : params.events.slice(0, 8)).map(e => {
    const orgName = typeof e.organizer === 'object' && e.organizer?.name ? e.organizer.name : (typeof e.organizer === 'string' ? e.organizer : 'Community Host');
    const categoriesList = Array.isArray(e.categories) ? e.categories.join(', ') : 'Tech';
    return `- [ID: ${e.id}] "${e.title}" | City: ${e.city} | Date: ${e.date} | Mode: ${e.mode} | Venue: ${e.venue || 'Virtual'} | Price: ${e.price || 'Free'} | Categories: ${categoriesList} | Host: ${orgName} | RSVP: ${e.rsvpUrl}`;
  }).join('\n');

  const forecastContext = params.forecasts.map(f => 
    `- Community "${f.community.name}" (${f.community.city}): Cadence: "${f.frequencyText}". Next window: "${f.predictedWindow}". Status: ${f.recommendation === 'register_now' ? 'Open RSVP' : 'Planning next drop'}.`
  ).join('\n');

  const systemInstruction = `
You are PulseAI, the intelligent real-time Event & Community Cadence Copilot for builders, founders, PMs, and software engineers in India (Delhi NCR, Bengaluru, Mumbai, Pune, Hyderabad, Remote).

STRICT RULES:
1. DIRECTNESS: Answer ONLY what is required by the user's question directly, accurately, and concisely. No unnecessary conversational preamble, no greetings on every turn, and no generic filler.
2. LIVE GROUNDING: When events or communities are asked for, reference the verified live events and community rhythms from the Grounding Data.
3. ADVICE & KNOWLEDGE: If the user asks general or technical questions (e.g. tech stacks, best meetups for networking, founder tips, event timing), answer dynamically and intelligently.
4. ACTIONABLE SUGGESTIONS: At the very end of every answer, ALWAYS add a single new line starting with "[SUGGESTIONS]" followed by 2 to 4 concise, clickable follow-up action options separated by pipes ("|").

Format example:
Yes, there is an upcoming Generative AI builders summit this Saturday in Cyber City, Gurgaon. It features hands-on LLMOps workshops and starts at 10:00 AM.

[SUGGESTIONS] Filter Delhi Radar | Upcoming Weekend Meetups | Book on Host Platform | Forecast AI Drops
`;

  // Build conversational contents with multi-turn history
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  if (params.history && params.history.length > 0) {
    // Include last 6 turns for context
    const recentHistory = params.history.slice(-6);
    for (const h of recentHistory) {
      contents.push({
        role: h.role,
        parts: [{ text: h.text }]
      });
    }
  }

  // Current user turn with grounding context
  const userContent = `
[Grounding Context - Live Open Events]:
${sampleEvents}

[Grounding Context - Community Cadence & Rhythms]:
${forecastContext || 'Active community tracking enabled.'}

User Inquiry: ${params.prompt}
`;

  contents.push({
    role: 'user',
    parts: [{ text: userContent }]
  });

  const requestBody = {
    contents,
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 650
    }
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.warn(`[Gemini API ${model} Error]:`, errorData);
    return null;
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || null;
}

/**
 * Parses Gemini output, splits out suggested action chips, and builds interactive widgets
 */
function parseAndBuildResponse(
  rawText: string,
  matchedEvents: EventItem[],
  forecasts: AgentForecastResult[],
  category?: string,
  city?: string
): AgentResponse {
  let messageText = rawText.trim();
  let suggestedPrompts: string[] = [];

  // Parse [SUGGESTIONS]
  const suggestionIndex = messageText.indexOf('[SUGGESTIONS]');
  if (suggestionIndex !== -1) {
    const suggestionsPart = messageText.slice(suggestionIndex + '[SUGGESTIONS]'.length).trim();
    messageText = messageText.slice(0, suggestionIndex).trim();

    suggestedPrompts = suggestionsPart
      .split('|')
      .map(s => s.trim().replace(/^[-*•\d.]+\s*/, ''))
      .filter(s => s.length > 1 && s.length < 50);
  }

  // Default suggested actions if none returned
  if (suggestedPrompts.length === 0) {
    suggestedPrompts = [
      city ? `Filter radar for ${city.toUpperCase()}` : 'Weekend events in Delhi NCR',
      category ? `Top ${category} gatherings` : 'Upcoming AI / ML meetups',
      'Forecast next community drop'
    ];
  }

  const widgets: AgentWidgetData[] = [];

  // Add event card widgets if matched
  if (matchedEvents.length > 0) {
    matchedEvents.slice(0, 2).forEach(e => {
      widgets.push({
        type: 'event_card',
        event: e
      });
    });
  }

  // Add community rhythm forecast widget if relevant
  const pendingDrop = forecasts.find(f => f.recommendation === 'wait_for_drop');
  if (pendingDrop && matchedEvents.length === 0) {
    widgets.push({
      type: 'community_forecast',
      forecast: pendingDrop
    });
  }

  // Add category focus widget if specific category targeted
  if (category && category !== 'Tech') {
    widgets.push({
      type: 'alert_scheduler',
      suggestedCategory: category,
      suggestedCity: city || 'delhi-ncr'
    });
  }

  return {
    messageText,
    widgets,
    suggestedPrompts
  };
}

/**
 * Fallback Grounded Agent response with rich cadence calculations
 */
function generateGroundedAgentResponse(params: {
  prompt: string;
  events: EventItem[];
  forecasts: AgentForecastResult[];
  targetCity: string;
  targetCategory: string;
}): AgentResponse {
  const widgets: AgentWidgetData[] = [];
  let messageText = '';

  const hasEvents = params.events.length > 0;
  const hasForecasts = params.forecasts.length > 0;

  if (hasEvents) {
    messageText = `Found **${params.events.length} event(s)** matching **${params.targetCategory}** in **${params.targetCity.toUpperCase()}** open for booking:`;
    
    params.events.slice(0, 2).forEach(e => {
      widgets.push({
        type: 'event_card',
        event: e
      });
    });
  } else if (hasForecasts) {
    const pendingDrops = params.forecasts.filter(f => f.recommendation === 'wait_for_drop');
    if (pendingDrops.length > 0) {
      messageText = `No open RSVPs right now in **${params.targetCity.toUpperCase()}**, but **${pendingDrops[0].community.name}** (${pendingDrops[0].frequencyText}) is planning their next drop around **${pendingDrops[0].predictedWindow}**.`;
      widgets.push({
        type: 'community_forecast',
        forecast: pendingDrops[0]
      });
    } else {
      messageText = `Exploring live feeds for **${params.targetCategory}** in **${params.targetCity.toUpperCase()}**.`;
    }
  } else {
    messageText = `Here are the active community gatherings currently on radar for **${params.targetCity.toUpperCase()}**.`;
  }

  widgets.push({
    type: 'alert_scheduler',
    suggestedCategory: params.targetCategory,
    suggestedCity: params.targetCity
  });

  return {
    messageText,
    widgets,
    suggestedPrompts: [
      `Filter radar for ${params.targetCategory}`,
      `Weekend events in ${params.targetCity.toUpperCase()}`,
      `Forecast next gathering drops`,
      `Show in-person tech meetups`
    ]
  };
}
