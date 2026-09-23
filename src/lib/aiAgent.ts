/**
 * PulseAI Agent Engine: Context Grounding, Cadence Forecasting & Gemini LLM Integration
 */

import { EventItem, Community } from '../types/event';
import { EVENTS_DATA, COMMUNITIES_DATA } from '../data/mockData';

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

const GEMINI_STORAGE_KEY = 'pulse_gemini_api_key';

export function getGeminiApiKey(): string {
  return (
    localStorage.getItem(GEMINI_STORAGE_KEY) ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    ''
  );
}

export function saveGeminiApiKey(key: string): void {
  localStorage.setItem(GEMINI_STORAGE_KEY, key.trim());
}

/**
 * Community Cadence & Frequency Intelligence Calculator
 * Computes historical cadence, forecast probability, and whether user should wait for an upcoming drop.
 */
export function calculateCommunityCadence(
  community: Community,
  events: EventItem[]
): AgentForecastResult {
  const activeEvent = events.find(
    e => e.organizer.id === community.id || e.organizer.name.toLowerCase().includes(community.name.toLowerCase())
  );

  let frequencyText = community.cadence || 'Meets regularly';
  let predictedWindow = community.nextForecast || 'Forecast: Next 2-3 weeks';
  let confidenceScore = community.consistencyScore ? community.consistencyScore.split('·')[0].trim() : '92% Reliability';

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
 * Primary Agent reasoning dispatcher: Uses live Gemini 1.5 Flash if API key is present,
 * or grounded contextual agent reasoning engine.
 */
export async function queryAIAgent(params: {
  prompt: string;
  events: EventItem[];
  userCity?: string;
  userEmail?: string;
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
  }

  // 3. Match relevant events
  const matchedEvents = params.events.filter(e => {
    const cityMatch = !targetCity || targetCity === 'all' || e.city.toLowerCase() === targetCity.toLowerCase();
    const catMatch = !targetCategory || e.categories.some(c => c.toLowerCase().includes(targetCategory!.toLowerCase()));
    const textMatch = lower.split(' ').some(w => w.length > 3 && (e.title.toLowerCase().includes(w) || e.description.toLowerCase().includes(w)));
    return (cityMatch && catMatch) || textMatch;
  }).slice(0, 3);

  // 4. Calculate Community Cadence & Forecasts
  const communityForecasts = findCommunityForecasts(
    targetCategory || lower,
    targetCity,
    params.events
  );

  // If Gemini API Key is configured, attempt live LLM inference with grounding
  if (apiKey) {
    try {
      const geminiResponse = await callGeminiLLM({
        apiKey,
        prompt: params.prompt,
        events: matchedEvents,
        forecasts: communityForecasts,
        targetCity,
        targetCategory
      });
      if (geminiResponse) {
        return buildAgentResponseWithWidgets(geminiResponse, matchedEvents, communityForecasts, targetCategory, targetCity);
      }
    } catch (e) {
      console.warn('[Gemini LLM Call Error, falling back to Grounded Engine]:', e);
    }
  }

  // Grounded Deterministic Agent Response with rich cadence calculation
  return generateGroundedAgentResponse({
    prompt: params.prompt,
    events: matchedEvents,
    forecasts: communityForecasts,
    targetCity: targetCity || 'all hubs',
    targetCategory: targetCategory || 'Tech'
  });
}

/**
 * Call Gemini API endpoint
 */
async function callGeminiLLM(params: {
  apiKey: string;
  prompt: string;
  events: EventItem[];
  forecasts: AgentForecastResult[];
  targetCity?: string;
  targetCategory?: string;
}): Promise<string | null> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${params.apiKey}`;

  const eventsContext = params.events.map(e => 
    `- "${e.title}" | Date: ${e.date} | City: ${e.city} | Venue: ${e.venue || 'Virtual'} | RSVP: ${e.rsvpUrl} | Organizer: ${e.organizer.name}`
  ).join('\n');

  const forecastContext = params.forecasts.map(f => 
    `- Community "${f.community.name}" (${f.community.city}): Cadence is "${f.frequencyText}". Consistency: ${f.confidenceScore}. Next Forecast: "${f.predictedWindow}". Status: ${f.recommendation === 'register_now' ? 'Active event available' : 'No open RSVP right now; likely planning next edition soon this month'}.`
  ).join('\n');

  const systemInstruction = `
You are PulseAI, an expert Event & Community Intelligence AI Agent for tech builders, PMs, engineers, and finance professionals in India (Delhi NCR, Bengaluru, Mumbai) and Remote.
Your role:
1. Provide actionable guidance on events currently open for RSVP.
2. Explain community meeting frequencies and calculate when upcoming editions are expected to be announced this month based on historical cadence.
3. Guide users to schedule direct email alerts so they are notified the moment a community drops its next event or receive instant event details.
Keep responses professional, concise (2-3 short paragraphs max), and proactive.
`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `
User Question: "${params.prompt}"

Live Grounding Data:
[Open Events]:
${eventsContext || 'No currently open events found for this specific query.'}

[Community Cadence & AI Forecasts]:
${forecastContext || 'No community forecasts available.'}

Please answer the user's question, reference any active gatherings or expected community drops this month, and explain how they can automate email alerts.
`
          }
        ]
      }
    ],
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 600
    }
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.warn('[Gemini API HTTP Error]:', errorData);
    return null;
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || null;
}

/**
 * Generate rich Grounded Agent response with cadence calculations & interactive widgets
 */
function generateGroundedAgentResponse(params: {
  prompt: string;
  events: EventItem[];
  forecasts: AgentForecastResult[];
  targetCity: string;
  targetCategory: string;
}): AgentResponse {
  const lower = params.prompt.toLowerCase();
  const widgets: AgentWidgetData[] = [];
  let messageText = '';

  const hasEvents = params.events.length > 0;
  const hasForecasts = params.forecasts.length > 0;

  if (hasEvents) {
    messageText += `I located **${params.events.length} gathering(s)** matching **${params.targetCategory}** in **${params.targetCity.toUpperCase()}** with active RSVP access.\n\n`;
    
    // Add event card widgets
    params.events.slice(0, 2).forEach(e => {
      widgets.push({
        type: 'event_card',
        event: e
      });
    });
  }

  // Community Cadence & Forecast Intelligence
  if (hasForecasts) {
    const pendingDrops = params.forecasts.filter(f => f.recommendation === 'wait_for_drop');
    
    if (pendingDrops.length > 0) {
      messageText += `💡 **Cadence Forecast:** Based on our community tracking algorithms, **${pendingDrops[0].community.name}** (${pendingDrops[0].frequencyText}) is currently planning their next gathering. Their forecast window indicates a drop **${pendingDrops[0].predictedWindow}**.\n\n`;
      
      widgets.push({
        type: 'community_forecast',
        forecast: pendingDrops[0]
      });
    } else if (!hasEvents) {
      widgets.push({
        type: 'community_forecast',
        forecast: params.forecasts[0]
      });
    }
  }

  // If user asked to alert/schedule or no events found, offer alert scheduler widget
  if (lower.includes('alert') || lower.includes('notify') || lower.includes('mail') || lower.includes('schedule') || !hasEvents) {
    widgets.push({
      type: 'alert_scheduler',
      suggestedCategory: params.targetCategory,
      suggestedCity: params.targetCity
    });

    if (!hasEvents) {
      messageText = `There are no open RSVPs for that specific search in **${params.targetCity.toUpperCase()}** today, but multiple tech & product communities host recurring editions here. \n\nI can configure an automated radar alert so you receive an instant email notification the second a new gathering is announced!`;
    }
  }

  return {
    messageText,
    widgets,
    suggestedPrompts: [
      `Upcoming FinTech in Delhi NCR`,
      `Forecast AI/ML meetups this month`,
      `Product Management in Bengaluru`,
      `Alert me for trading systems & Rust`
    ]
  };
}

/**
 * Combine Gemini LLM text with interactive platform widgets
 */
function buildAgentResponseWithWidgets(
  llmText: string,
  events: EventItem[],
  forecasts: AgentForecastResult[],
  category?: string,
  city?: string
): AgentResponse {
  const widgets: AgentWidgetData[] = [];

  events.slice(0, 2).forEach(e => {
    widgets.push({
      type: 'event_card',
      event: e
    });
  });

  const pendingDrop = forecasts.find(f => f.recommendation === 'wait_for_drop');
  if (pendingDrop) {
    widgets.push({
      type: 'community_forecast',
      forecast: pendingDrop
    });
  }

  widgets.push({
    type: 'alert_scheduler',
    suggestedCategory: category || 'Tech Gatherings',
    suggestedCity: city || 'all hubs'
  });

  return {
    messageText: llmText,
    widgets,
    suggestedPrompts: [
      `Forecast next gathering drops`,
      `Schedule FinTech alerts`,
      `Delhi NCR Product meetups`
    ]
  };
}
