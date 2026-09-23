import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { sendDirectEventDetails, subscribeToCategoryAlerts } from '../../lib/notificationQueue';
import { queryAIAgent, AgentWidgetData } from '../../lib/aiAgent';
import { EventItem } from '../../types/event';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Bell, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw,
  Mail,
  Clock,
  Radio
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  widgets?: AgentWidgetData[];
}

export const AIChatConciergeModal: React.FC = () => {
  const { 
    isAIConciergeOpen, 
    setIsAIConciergeOpen, 
    events, 
    currentUser,
    selectedCity,
    setActiveEventDetail,
    setNotifyToast
  } = useApp();

  const [input, setInput] = useState('');
  const [sessionEmail, setSessionEmail] = useState(currentUser?.email || '');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeActions, setActiveActions] = useState<Record<string, 'loading' | 'success' | 'idle'>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser?.email) {
      setSessionEmail(currentUser.email);
    }
  }, [currentUser]);

  // Initialize welcoming message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'msg_welcome',
          sender: 'ai',
          text: `Hi ${currentUser?.name ? currentUser.name.split(' ')[0] : 'there'}! 👋 I'm **PulseAI**, your real-time Event & Community Cadence Intelligence Agent.\n\nI calculate community meeting frequencies, forecast upcoming event drops this month across **Delhi NCR, Bengaluru, Mumbai**, and can directly schedule email notifications for you.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await queryAIAgent({
        prompt: userText,
        events,
        userCity: selectedCity,
        userEmail: sessionEmail
      });

      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: response.messageText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          widgets: response.widgets
        }
      ]);
    } catch (e) {
      console.error('[AI Agent Error]:', e);
      setMessages(prev => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: `I'm analyzing our live radar feeds. Would you like me to configure an email alert for your preferred categories and city?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          widgets: [
            {
              type: 'alert_scheduler',
              suggestedCategory: 'All Fields',
              suggestedCity: selectedCity
            }
          ]
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // 1-Click: Direct Event Details Email (NO APPROVAL REQUIRED)
  const handleSendDirectDetails = async (widgetKey: string, event: EventItem) => {
    const emailToUse = (sessionEmail || 'devendrs2313@gmail.com').trim().toLowerCase();
    setActiveActions(prev => ({ ...prev, [widgetKey]: 'loading' }));

    await sendDirectEventDetails({
      event,
      recipientEmail: emailToUse,
      recipientName: currentUser?.name
    });

    setActiveActions(prev => ({ ...prev, [widgetKey]: 'success' }));
    setNotifyToast(`✉️ Event details sent directly to ${emailToUse}!`);
  };

  // 1-Click: Community Drop Alert Subscription (CONFIRMATION SENT TO USER)
  const handleSubscribeCommunityDrop = async (widgetKey: string, communityName: string, category: string, city: string) => {
    const emailToUse = (sessionEmail || 'devendrs2313@gmail.com').trim().toLowerCase();
    setActiveActions(prev => ({ ...prev, [widgetKey]: 'loading' }));

    await subscribeToCategoryAlerts({
      email: emailToUse,
      name: currentUser?.name,
      categories: [category, communityName],
      city: city,
      timing: 'immediate'
    });

    setActiveActions(prev => ({ ...prev, [widgetKey]: 'success' }));
    setNotifyToast(`🎉 Drop alerts active for ${communityName}! Confirmation sent to ${emailToUse}.`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm sm:backdrop-blur-none sm:bg-transparent flex items-center justify-center sm:block p-3 sm:p-0 pointer-events-none">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="pointer-events-auto bg-white rounded-3xl sm:rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-md sm:w-[420px] max-h-[90vh] sm:max-h-[660px] h-[600px] flex flex-col overflow-hidden sm:fixed sm:bottom-6 sm:right-6 transition-all"
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 text-white flex items-center justify-between flex-shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm flex items-center gap-1.5">
                <span>PulseAI Agent</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-300 font-medium">Online</span>
              </div>
              <div className="text-[11px] text-indigo-100 flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-300 animate-pulse" />
                <span>Event Discovery & Community Radar</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setMessages([])}
              className="p-1.5 rounded-lg hover:bg-white/10 text-indigo-100 hover:text-white transition-colors"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsAIConciergeOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-indigo-100 hover:text-white transition-colors"
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

              <div className={`space-y-2.5 max-w-[86%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
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
                      const actionStatus = activeActions[widgetKey] || 'idle';

                      // WIDGET 1: Event Card with Direct Details Button
                      if (widget.type === 'event_card' && widget.event) {
                        const evt = widget.event;
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
                                className="text-[11px] text-zinc-500 hover:text-indigo-600 font-semibold flex items-center gap-0.5"
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
                              {actionStatus === 'success' ? (
                                <div className="w-full py-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 border border-emerald-200">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Details Dispatched to Your Email!</span>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  disabled={actionStatus === 'loading'}
                                  onClick={() => handleSendDirectDetails(widgetKey, evt)}
                                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                                >
                                  <Mail className="w-3 h-3" />
                                  <span>{actionStatus === 'loading' ? 'Sending Details...' : 'Email Me Details & RSVP'}</span>
                                </button>
                              )}
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

                            {actionStatus === 'success' ? (
                              <div className="p-2 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Subscribed to Next Community Drop!</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                disabled={actionStatus === 'loading'}
                                onClick={() => handleSubscribeCommunityDrop(
                                  widgetKey, 
                                  fc.community.name, 
                                  fc.community.topics[0] || 'Tech', 
                                  fc.community.city
                                )}
                                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                              >
                                <Bell className="w-3.5 h-3.5" />
                                <span>Alert Me The Second They Drop Next Event</span>
                              </button>
                            )}
                          </div>
                        );
                      }

                      // WIDGET 3: Radar Alert Scheduler
                      if (widget.type === 'alert_scheduler') {
                        const targetCat = widget.suggestedCategory || 'Product Management';
                        const targetCity = widget.suggestedCity || selectedCity || 'delhi-ncr';

                        return (
                          <div 
                            key={widgetKey}
                            className="p-3.5 bg-indigo-50 border border-indigo-200/90 rounded-2xl space-y-2.5 shadow-2xs"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 font-bold text-indigo-950 text-xs">
                                <Bell className="w-3.5 h-3.5 text-indigo-600" />
                                <span>Automate Email Notifications</span>
                              </div>
                              {!currentUser && (
                                <span className="text-[10px] text-amber-700 bg-amber-100 font-semibold px-1.5 py-0.5 rounded">
                                  Guest Ready
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-indigo-900 leading-snug">
                              Tracking: <strong>{targetCat}</strong> in <strong>{targetCity.toUpperCase()}</strong>
                            </div>

                            {actionStatus === 'success' ? (
                              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-bold flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                <span>Radar alerts active! Confirmation sent to your inbox.</span>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <input
                                  type="email"
                                  placeholder="Enter your email (e.g. name@example.com)"
                                  value={sessionEmail}
                                  onChange={(e) => setSessionEmail(e.target.value)}
                                  className="w-full px-3 py-1.5 text-xs bg-white border border-indigo-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />

                                <button
                                  type="button"
                                  disabled={actionStatus === 'loading'}
                                  onClick={async () => {
                                    const emailToUse = (sessionEmail || 'devendrs2313@gmail.com').trim().toLowerCase();
                                    setActiveActions(prev => ({ ...prev, [widgetKey]: 'loading' }));

                                    await subscribeToCategoryAlerts({
                                      email: emailToUse,
                                      name: currentUser?.name,
                                      categories: [targetCat],
                                      city: targetCity,
                                      timing: 'immediate'
                                    });

                                    setActiveActions(prev => ({ ...prev, [widgetKey]: 'success' }));
                                    setNotifyToast(`🎉 Radar alerts active for ${targetCat}! Confirmation sent to ${emailToUse}.`);
                                  }}
                                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Activate Instant Email Alerts</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      }

                      return null;
                    })}
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
            <div className="flex gap-2 items-center text-zinc-500 text-xs italic">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
              <span>PulseAI is computing community rhythms & gatherings...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="px-3 py-1.5 bg-white border-t border-zinc-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
          <button
            type="button"
            onClick={() => handleSend('When is the next FinTech or trading meetup in Delhi NCR?')}
            className="px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-600 text-zinc-600 text-[10px] font-medium whitespace-nowrap transition-colors"
          >
            📈 FinTech in Delhi NCR
          </button>
          <button
            type="button"
            onClick={() => handleSend('Forecast AI/ML events and community drops this month')}
            className="px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-600 text-zinc-600 text-[10px] font-medium whitespace-nowrap transition-colors"
          >
            🤖 Forecast AI Drops
          </button>
          <button
            type="button"
            onClick={() => handleSend('What Product Management gatherings are planned in Bengaluru?')}
            className="px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-600 text-zinc-600 text-[10px] font-medium whitespace-nowrap transition-colors"
          >
            🎯 Bengaluru PM Gatherings
          </button>
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="p-2.5 sm:p-3 bg-white border-t border-zinc-200 flex items-center gap-2 flex-shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI: 'When will FinTech India drop their next event?'"
            className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-colors shadow-2xs flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
