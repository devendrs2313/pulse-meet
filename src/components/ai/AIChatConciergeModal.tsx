import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { queryAIAgent, AgentWidgetData, ChatHistoryItem } from '../../lib/aiAgent';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  RotateCcw,
  Clock,
  Bookmark,
  Check,
  Compass
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  widgets?: AgentWidgetData[];
  suggestedPrompts?: string[];
}

export const AIChatConciergeModal: React.FC = () => {
  const { 
    isAIConciergeOpen, 
    setIsAIConciergeOpen, 
    events, 
    currentUser,
    selectedCity,
    setActiveEventDetail,
    setNotifyToast,
    toggleSaveEvent,
    savedEventIds,
    scanRegion,
    setSelectedCategory
  } = useApp();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcoming message with initial dynamic suggestions
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'msg_welcome',
          sender: 'ai',
          text: `Hi ${currentUser?.name ? currentUser.name.split(' ')[0] : 'there'}! 👋 I'm **PulseAI**, powered by real-time Gemini Intelligence.\n\nAsk me anything about upcoming events, community rhythms, venues, or networking recommendations across **Delhi NCR, Bengaluru, Mumbai, Pune, and Remote**.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedPrompts: [
            'Upcoming AI / ML in Delhi NCR',
            'FinTech & Founder mixers in Bengaluru',
            'What events are happening this weekend?',
            'Forecast next community drop'
          ]
        }
      ]);
    }
  }, [currentUser]);

  useEffect(() => {
    if (isAIConciergeOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAIConciergeOpen]);

  if (!isAIConciergeOpen) return null;

  const handleSend = async (userText: string) => {
    if (!userText.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsTyping(true);

    // Build conversational context for Gemini
    const history: ChatHistoryItem[] = nextMessages
      .filter(m => m.id !== 'msg_welcome')
      .slice(-6)
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text
      }));

    try {
      const response = await queryAIAgent({
        prompt: userText,
        events,
        userCity: selectedCity,
        history
      });

      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: response.messageText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          widgets: response.widgets,
          suggestedPrompts: response.suggestedPrompts
        }
      ]);
    } catch (e) {
      console.error('[AI Agent Error]:', e);
      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: `Here are the active community gatherings currently on radar for **${(selectedCity || 'all hubs').toUpperCase()}**.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          widgets: [
            {
              type: 'alert_scheduler',
              suggestedCategory: 'All Fields',
              suggestedCity: selectedCity
            }
          ],
          suggestedPrompts: [
            'Filter radar for AI / ML',
            'Upcoming weekend meetups',
            'Explore top founder events'
          ]
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    const lower = prompt.toLowerCase();

    // Check if user clicked a direct filter action
    if (lower.startsWith('filter') || lower.includes('radar for')) {
      if (lower.includes('delhi')) scanRegion('delhi-ncr');
      else if (lower.includes('bengaluru') || lower.includes('bangalore')) scanRegion('bengaluru');
      else if (lower.includes('mumbai')) scanRegion('mumbai');

      if (lower.includes('ai') || lower.includes('ml')) setSelectedCategory('AI / ML');
      else if (lower.includes('fintech')) setSelectedCategory('Finance / FinTech');
      else if (lower.includes('product')) setSelectedCategory('Product Management');
      else if (lower.includes('rust')) setSelectedCategory('Rust & Systems');

      setNotifyToast(`🎯 Applied filter from suggestion: "${prompt}"`);
    }

    // Automatically send suggestion to chat to get dynamic follow-up answers
    handleSend(prompt);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm sm:backdrop-blur-none sm:bg-transparent flex items-center justify-center sm:block p-3 sm:p-0 pointer-events-none">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="pointer-events-auto bg-white rounded-3xl sm:rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-md sm:w-[450px] max-h-[92vh] sm:max-h-[680px] h-[620px] flex flex-col overflow-hidden sm:fixed sm:bottom-6 sm:right-6 transition-all"
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 text-white flex items-center justify-between flex-shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm flex items-center gap-1.5">
                <span>PulseAI Copilot</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-300 font-semibold px-1.5 py-0.2 bg-emerald-950/40 rounded">
                  Gemini Flash Live
                </span>
              </div>
              <div className="text-[11px] text-indigo-100 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                <span>Contextual Event & Cadence Intelligence</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'msg_welcome',
                    sender: 'ai',
                    text: `Hi ${currentUser?.name ? currentUser.name.split(' ')[0] : 'there'}! 👋 Ready for another search. What kind of gatherings are you looking for?`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    suggestedPrompts: [
                      'Upcoming AI / ML in Delhi NCR',
                      'FinTech & Founder mixers in Bengaluru',
                      'What events are happening this weekend?',
                      'Forecast next community drop'
                    ]
                  }
                ]);
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-indigo-100 hover:text-white transition-colors cursor-pointer"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsAIConciergeOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-indigo-100 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`space-y-2.5 max-w-[88%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Text Bubble */}
                <div 
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-zinc-900 text-white rounded-tr-xs shadow-xs' 
                      : 'bg-white border border-zinc-200/90 text-zinc-800 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>

                {/* Interactive Dynamic Widgets */}
                {msg.widgets && msg.widgets.length > 0 && (
                  <div className="space-y-2.5 w-full">
                    {msg.widgets.map((widget, widx) => {
                      const widgetKey = `${msg.id}_widget_${widx}`;

                      // WIDGET 1: Event Card with Direct Details Button
                      if (widget.type === 'event_card' && widget.event) {
                        const evt = widget.event;
                        const isSaved = savedEventIds.includes(evt.id);

                        return (
                          <div 
                            key={widgetKey}
                            className="p-3 bg-white border border-zinc-200 rounded-2xl shadow-xs hover:border-indigo-300 transition-all space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                {evt.categories[0]}
                              </span>
                              <button
                                type="button"
                                onClick={() => setActiveEventDetail(evt)}
                                className="text-[11px] text-zinc-500 hover:text-indigo-600 font-semibold flex items-center gap-0.5 cursor-pointer"
                              >
                                <span>Overview</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="font-bold text-zinc-900 text-xs leading-snug">
                              {evt.title}
                            </div>

                            <div className="text-[11px] text-zinc-500 space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3 h-3 text-zinc-400" />
                                <span>{evt.date} {evt.time ? `· ${evt.time}` : ''}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3 h-3 text-zinc-400" />
                                <span>{evt.venue || evt.city}</span>
                              </div>
                            </div>

                            <div className="pt-1.5 border-t border-zinc-100 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleSaveEvent(evt.id)}
                                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                                  isSaved
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                    : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                                }`}
                              >
                                {isSaved ? <Check className="w-3 h-3 text-emerald-600" /> : <Bookmark className="w-3 h-3 text-zinc-400" />}
                                <span>{isSaved ? 'Saved' : 'Save'}</span>
                              </button>

                              <a
                                href={evt.rsvpUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold rounded-xl flex items-center justify-center gap-1 shadow-2xs transition-colors"
                              >
                                <span>Book ↗</span>
                              </a>
                            </div>
                          </div>
                        );
                      }

                      // WIDGET 2: Community Cadence & Drop Forecast
                      if (widget.type === 'community_forecast' && widget.forecast) {
                        const fc = widget.forecast;
                        return (
                          <div 
                            key={widgetKey}
                            className="p-3.5 bg-gradient-to-br from-amber-50/90 to-orange-50/60 border border-amber-200 rounded-2xl space-y-2 shadow-2xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded">
                                Community Rhythm Forecast
                              </span>
                              <span className="text-[10px] font-bold text-amber-800">
                                {fc.confidenceScore}
                              </span>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <img 
                                src={fc.community.avatar} 
                                alt={fc.community.name} 
                                className="w-8 h-8 rounded-full ring-1 ring-amber-300 object-cover flex-shrink-0"
                              />
                              <div>
                                <div className="font-bold text-xs text-zinc-900 leading-tight">
                                  {fc.community.name}
                                </div>
                                <div className="text-[11px] text-amber-800 mt-0.5 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>{fc.frequencyText}</span>
                                </div>
                              </div>
                            </div>

                            <div className="p-2 bg-white/80 rounded-xl border border-amber-200/80 text-[11px] text-zinc-700 space-y-1">
                              <div><strong>Next Forecast:</strong> {fc.predictedWindow}</div>
                              <p className="text-[10px] text-zinc-500">
                                This community typically announces their upcoming edition 10-14 days in advance.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (fc.community.topics[0]) setSelectedCategory(fc.community.topics[0]);
                                if (fc.community.city) scanRegion(fc.community.city);
                                setIsAIConciergeOpen(false);
                                setNotifyToast(`🎯 Radar locked on ${fc.community.name}!`);
                              }}
                              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Explore {fc.community.name} on Radar</span>
                            </button>
                          </div>
                        );
                      }

                      // WIDGET 3: Radar Category Focus
                      if (widget.type === 'alert_scheduler') {
                        const targetCat = widget.suggestedCategory || 'Product Management';
                        const targetCity = widget.suggestedCity || selectedCity || 'delhi-ncr';

                        return (
                          <div 
                            key={widgetKey}
                            className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-2xl flex items-center justify-between gap-2 shadow-2xs"
                          >
                            <div className="text-[11px] text-indigo-950 font-medium">
                              Focus Radar on <strong>{targetCat}</strong> ({targetCity.toUpperCase()})
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCategory(targetCat);
                                scanRegion(targetCity);
                                setIsAIConciergeOpen(false);
                                setNotifyToast(`🎯 Radar locked onto ${targetCat} in ${targetCity.toUpperCase()}!`);
                              }}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[11px] flex items-center gap-1 shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
                            >
                              <Compass className="w-3 h-3" />
                              <span>Apply Filter</span>
                            </button>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                )}

                {/* Additional Action Suggestions */}
                {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                  <div className="pt-1.5 space-y-1.5 w-full">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <span>Suggested Actions:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedPrompts.map((suggestion, sidx) => (
                        <button
                          key={sidx}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-2.5 py-1 rounded-xl bg-white hover:bg-indigo-50 border border-zinc-200/90 hover:border-indigo-300 text-zinc-700 hover:text-indigo-700 text-[11px] font-medium transition-all shadow-2xs flex items-center gap-1.5 group text-left cursor-pointer active:scale-98"
                        >
                          <span>{suggestion}</span>
                          <ArrowRight className="w-2.5 h-2.5 text-zinc-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`text-[10px] text-zinc-400 px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-zinc-200 text-zinc-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2.5 justify-start items-center">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-white border border-zinc-200 rounded-2xl rounded-tl-xs shadow-2xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-zinc-200 flex items-center gap-2 flex-shrink-0">
          <input
            type="text"
            placeholder="Ask anything (e.g. AI events in Delhi, tech meetups this weekend)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend(input);
              }
            }}
            className="flex-1 px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />

          <button
            type="button"
            disabled={!input.trim() || isTyping}
            onClick={() => handleSend(input)}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-colors shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
