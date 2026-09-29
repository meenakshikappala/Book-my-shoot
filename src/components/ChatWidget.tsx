import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  ArrowUpRight,
  Calendar,
  UserCheck,
} from 'lucide-react';
import {
  PHOTOGRAPHERS,
  PHOTOGRAPHY_CATEGORIES,
  Photographer,
  PhotographyCategory,
} from '../data/photographers';

const N8N_PROD_WEBHOOK_URL =
  'https://meenakshikappala.app.n8n.cloud/webhook/ecbc31cb-05bf-44d5-95ac-82b1d98cf03e/chat';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  recommendedPhotographers?: Photographer[];
}

interface ChatWidgetProps {
  onSelectPhotographerProfile?: (photographer: Photographer) => void;
  onBookPhotographer?: (photographer: Photographer) => void;
}

const QUICK_PROMPTS = [
  'Which photographers specialize in Wedding shoots?',
  'Compare pricing packages for Julian Vance',
  'Who is available in Los Angeles or New York?',
  'What are the 8 photography categories?',
  'Who is your most affordable photographer?',
];

function createSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

function isErrorLikeReply(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes('unable to reach') ||
    lower.includes('is not registered') ||
    lower.includes('workflow must be active') ||
    lower.includes('error in workflow') ||
    lower.includes('internal server error') ||
    lower.includes('webhook responded with status')
  );
}

function extractReplyFromN8n(data: unknown): string | null {
  if (typeof data === 'string' && data.trim()) {
    const trimmed = data.trim();
    return isErrorLikeReply(trimmed) ? null : trimmed;
  }
  if (Array.isArray(data) && data.length > 0) {
    return extractReplyFromN8n(data[0]);
  }
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const candidateKeys = ['output', 'text', 'response', 'message', 'data', 'reply'];
    for (const key of candidateKeys) {
      const val = obj[key];
      if (typeof val === 'string' && val.trim() && !isErrorLikeReply(val.trim())) {
        return val.trim();
      }
    }
  }
  return null;
}

/**
 * Intelligent knowledge engine grounded in the complete Atelier Lumière website data.
 */
function generateConciergeAnswer(
  queryText: string,
  turnCount: number
): { text: string; photographers?: Photographer[] } {
  const q = queryText.toLowerCase().trim();

  // 1. Specific photographer lookup
  const matchedPhotog = PHOTOGRAPHERS.find((p) => {
    const parts = p.name.toLowerCase().split(' ');
    return (
      q.includes(p.name.toLowerCase()) ||
      parts.some((part) => part.length > 3 && q.includes(part))
    );
  });

  if (matchedPhotog) {
    const pkgSummary = matchedPhotog.packages
      .map(
        (pkg) =>
          `• ${pkg.name}: $${pkg.price.toLocaleString()} (${pkg.recommendedHours} hrs · ${pkg.editedCount} edited stills · ${pkg.turnaround})`
      )
      .join('\n');

    if (
      q.includes('package') ||
      q.includes('price') ||
      q.includes('cost') ||
      q.includes('rate') ||
      q.includes('compare')
    ) {
      return {
        text: `${matchedPhotog.name} (${matchedPhotog.location}) charges $${matchedPhotog.hourlyRate}/hr or offers three all-inclusive packages:\n\n${pkgSummary}\n\nAvailable days: ${matchedPhotog.availabilityDays.join(', ')} (${matchedPhotog.availableTimeSlots.join(', ')}).`,
        photographers: [matchedPhotog],
      };
    }

    return {
      text: `${matchedPhotog.name} — ${matchedPhotog.title}\n• Location: ${matchedPhotog.location}\n• Specializations: ${matchedPhotog.specializations.join(', ')}\n• Rating: ★ ${matchedPhotog.rating.toFixed(1)} (${matchedPhotog.reviewCount} reviews) · ${matchedPhotog.experienceYears} yrs experience\n• Pricing: $${matchedPhotog.hourlyRate}/hr (Packages from $${matchedPhotog.startingPackagePrice})\n• Gear: ${matchedPhotog.equipmentSummary}\n• Packages:\n${pkgSummary}`,
      photographers: [matchedPhotog],
    };
  }

  // 2. All 8 categories overview
  if (
    q.includes('categories') ||
    q.includes('category') ||
    q.includes('types') ||
    q.includes('8 ') ||
    q.includes('services') ||
    q.includes('offer')
  ) {
    const catList = PHOTOGRAPHY_CATEGORIES.map(
      (c, i) => `0${i + 1}. ${c.name} (from $${c.startingRate}/hr) — ${c.tagline}`
    ).join('\n');
    return {
      text: `We offer 8 specialized photography categories at Atelier Lumière:\n\n${catList}\n\nTell me which category you are planning for and I will match you with our top specialists.`,
    };
  }

  // 3. Specific category lookup
  const matchedCategory = PHOTOGRAPHY_CATEGORIES.find((cat) => {
    const catLower = cat.name.toLowerCase();
    if (catLower === 'pre-wedding') {
      return (
        q.includes('pre-wedding') ||
        q.includes('pre wedding') ||
        q.includes('engagement')
      );
    }
    if (catLower === 'product photography') {
      return q.includes('product');
    }
    if (catLower === 'travel photography') {
      return q.includes('travel') || q.includes('destination') || q.includes('hotel');
    }
    return q.includes(catLower.replace(' photography', ''));
  });

  if (matchedCategory) {
    const specialists = PHOTOGRAPHERS.filter((p) =>
      p.specializations.includes(matchedCategory.name as PhotographyCategory)
    );
    const listText = specialists
      .map(
        (p) =>
          `• ${p.name} (${p.location}) — ★ ${p.rating.toFixed(1)} · $${p.hourlyRate}/hr (Packages from $${p.startingPackagePrice})`
      )
      .join('\n');

    return {
      text: `For ${matchedCategory.name} (${matchedCategory.deliverablesSummary}), we have ${specialists.length} vetted specialists:\n\n${listText}\n\nClick any photographer below to inspect their optical portfolio or book directly.`,
      photographers: specialists.slice(0, 3),
    };
  }

  // 4. City / Location lookup
  const cityKeywords: { keyword: string; matchCity: string }[] = [
    { keyword: 'new york', matchCity: 'New York' },
    { keyword: 'nyc', matchCity: 'New York' },
    { keyword: 'manhattan', matchCity: 'New York' },
    { keyword: 'los angeles', matchCity: 'Los Angeles' },
    { keyword: 'la', matchCity: 'Los Angeles' },
    { keyword: 'san francisco', matchCity: 'San Francisco' },
    { keyword: 'chicago', matchCity: 'Chicago' },
    { keyword: 'seattle', matchCity: 'Seattle' },
    { keyword: 'austin', matchCity: 'Austin' },
    { keyword: 'boston', matchCity: 'Boston' },
    { keyword: 'miami', matchCity: 'Miami' },
  ];

  const matchedCities = cityKeywords.filter((ck) => {
    if (ck.keyword === 'la') {
      return /\bla\b/.test(q);
    }
    return q.includes(ck.keyword);
  });

  if (
    matchedCities.length > 0 ||
    q.includes('location') ||
    q.includes('city') ||
    q.includes('cities') ||
    q.includes('where') ||
    q.includes('available in')
  ) {
    const cityNames = Array.from(new Set(matchedCities.map((c) => c.matchCity)));
    const foundByCity =
      cityNames.length > 0
        ? PHOTOGRAPHERS.filter((p) =>
            cityNames.some((cn) =>
              p.location.toLowerCase().includes(cn.toLowerCase())
            )
          )
        : PHOTOGRAPHERS;

    const lines = foundByCity
      .map(
        (p) =>
          `• ${p.name} — ${p.location} (${p.specializations.join(', ')}) · $${p.hourlyRate}/hr · ★ ${p.rating.toFixed(1)}`
      )
      .join('\n');

    return {
      text:
        cityNames.length > 0
          ? `Here are our photographers based in ${cityNames.join(' & ')}:\n\n${lines}`
          : `Our 8 principal photographers operate across major US cities:\n\n${lines}`,
      photographers: foundByCity.slice(0, 3),
    };
  }

  // 5. Pricing / Affordable / Packages lookup
  if (
    q.includes('price') ||
    q.includes('pricing') ||
    q.includes('cost') ||
    q.includes('affordable') ||
    q.includes('cheap') ||
    q.includes('budget') ||
    q.includes('rate') ||
    q.includes('package')
  ) {
    const sortedByPrice = [...PHOTOGRAPHERS].sort(
      (a, b) => a.hourlyRate - b.hourlyRate
    );
    const overview = sortedByPrice
      .map(
        (p) =>
          `• ${p.name} (${p.location}): $${p.hourlyRate}/hr · Packages from $${p.startingPackagePrice} (${p.primaryCategory})`
      )
      .join('\n');

    return {
      text: `Our hourly rates range from $160/hr to $310/hr, and all-inclusive packages start at $320:\n\n${overview}\n\nEvery photographer offers three package tiers: Essential Session, Editorial Signature, and Full Archive Production.`,
      photographers: sortedByPrice.slice(0, 3),
    };
  }

  // 6. Ratings / Reviews / Best photographers
  if (
    q.includes('best') ||
    q.includes('top') ||
    q.includes('rating') ||
    q.includes('review') ||
    q.includes('who') ||
    q.includes('photographer')
  ) {
    const sortedByRating = [...PHOTOGRAPHERS].sort(
      (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount
    );
    const topList = sortedByRating
      .slice(0, 5)
      .map(
        (p) =>
          `• ${p.name} (${p.location}) — ★ ${p.rating.toFixed(1)} (${p.reviewCount} reviews) · $${p.hourlyRate}/hr · ${p.specializations.join(', ')}`
      )
      .join('\n');

    return {
      text: `Here are our top-rated photographers at Atelier Lumière:\n\n${topList}`,
      photographers: sortedByRating.slice(0, 3),
    };
  }

  // 7. Booking / Rescheduling / Contact instructions
  if (
    q.includes('book') ||
    q.includes('schedule') ||
    q.includes('cancel') ||
    q.includes('how') ||
    q.includes('contact') ||
    q.includes('phone') ||
    q.includes('email')
  ) {
    return {
      text: `How to Book or Manage Your Photo Shoot:\n1. Select a Photographer & Package in the "Book Your Photo Shoot" section.\n2. Pick your Shoot Date, Call Time Slot, Duration (1–12 hrs), and Location.\n3. Click "Confirm Photo Shoot Booking" to receive your instant Call Sheet reference.\n4. Visit "My Bookings" anytime to reschedule dates/times or cancel.\n\nDirect Concierge Desk: concierge@atelierlumiere.studio · +1 (212) 555-0194 (SoHo Studio, 482 Broome St, NY).`,
      photographers: [PHOTOGRAPHERS[0], PHOTOGRAPHERS[3]],
    };
  }

  // 8. Varied conversational responses so it never repeats the same message
  const generalResponses = [
    {
      text: `Hello! I can help you compare our 8 photographers across Wedding, Pre-Wedding, Birthday, Portrait, Fashion, Events, Product, and Travel photography. Tell me what type of shoot, city, or budget you have in mind!`,
      photographers: [PHOTOGRAPHERS[0], PHOTOGRAPHERS[1]],
    },
    {
      text: `Here are three of our featured photographers you can explore right now:\n• Julian Vance (New York, NY) — Wedding & Pre-Wedding ($280/hr)\n• Clara Moreau (Los Angeles, CA) — Fashion & Portrait ($310/hr)\n• Amara Okonkwo (Chicago, IL) — Events & Birthday ($190/hr)\n\nClick "Profile" or "Book" below, or ask me about another city or category!`,
      photographers: [PHOTOGRAPHERS[0], PHOTOGRAPHERS[1], PHOTOGRAPHERS[3]],
    },
    {
      text: `Looking for coastal, travel, or portrait specialists? Consider:\n• Mateo Silva (San Francisco, CA) — Product & Travel ($240/hr)\n• Hana Takahashi (Seattle, WA) — Pre-Wedding & Portrait ($210/hr)\n• Devon Brooks (Miami, FL) — Birthday & Wedding ($160/hr)\n\nAsk me for package details on any photographer!`,
      photographers: [PHOTOGRAPHERS[2], PHOTOGRAPHERS[4], PHOTOGRAPHERS[7]],
    },
  ];

  return generalResponses[turnCount % generalResponses.length];
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  onSelectPhotographerProfile,
  onBookPhotographer,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => createSessionId());
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [n8nAvailable, setN8nAvailable] = useState<boolean>(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_1',
      sender: 'bot',
      text: 'Welcome to Atelier Lumière. Ask me about our 8 photographers, pricing packages, locations, or how to book your photo shoot.',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const tryN8nWebhook = async (textToSend: string): Promise<string | null> => {
    if (!n8nAvailable) return null;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    try {
      const response = await fetch(N8N_PROD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/plain, */*',
        },
        body: JSON.stringify({
          action: 'sendMessage',
          sessionId,
          chatInput: textToSend,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        setN8nAvailable(false);
        return null;
      }

      const rawText = await response.text();
      if (!rawText || !rawText.trim()) return null;

      try {
        const parsed = JSON.parse(rawText);
        return extractReplyFromN8n(parsed);
      } catch {
        const trimmed = rawText.trim();
        return isErrorLikeReply(trimmed) ? null : trimmed;
      }
    } catch {
      setN8nAvailable(false);
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isSending) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const nextTurnCount = messages.filter((m) => m.sender === 'user').length;
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const remoteReply = await tryN8nWebhook(trimmed);
      const localAnswer = generateConciergeAnswer(trimmed, nextTurnCount);

      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: remoteReply || localAnswer.text,
          recommendedPhotographers: localAnswer.photographers,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleResetChat = () => {
    setSessionId(createSessionId());
    setN8nAvailable(true);
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: 'bot',
        text: 'Conversation reset. Ask me about any photographer, category, city, or package price!',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {isOpen && (
        <div
          className="mb-3 w-[360px] sm:w-[410px] max-w-[calc(100vw-2.5rem)] h-[540px] max-h-[calc(100vh-7rem)] bg-[#F4F4F0] text-[#141413] border border-[#141413]/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          role="dialog"
          aria-label="Atelier Lumière Concierge Chat"
        >
          {/* Header */}
          <div className="bg-[#141413] text-[#F4F4F0] px-5 py-4 flex items-center justify-between shrink-0">
            <div>
              <p className="text-[11px] text-[#C84B31] font-medium tracking-wide">
                Atelier Lumière · Concierge Desk
              </p>
              <h3 className="font-editorial text-xl font-semibold text-white leading-tight">
                Booking & Portfolio Assistant
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-2 rounded-lg text-[#A8A49C] hover:text-white hover:bg-white/10 transition-colors"
                title="Reset conversation"
                aria-label="Reset conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-[#A8A49C] hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-[#141413] text-white'
                      : 'bg-white text-[#141413] border border-[#DCD9D0]'
                  }`}
                >
                  {msg.text}

                  {msg.recommendedPhotographers &&
                    msg.recommendedPhotographers.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-[#EAE8E1] space-y-2">
                        {msg.recommendedPhotographers.map((photog) => (
                          <div
                            key={photog.id}
                            className="p-2 rounded-lg bg-[#F4F4F0] flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-[#141413] truncate">
                                {photog.name}
                              </p>
                              <p className="text-[11px] text-[#57554F] font-mono-tabular truncate">
                                {photog.location} · ${photog.hourlyRate}/hr
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {onSelectPhotographerProfile && (
                                <button
                                  type="button"
                                  onClick={() => onSelectPhotographerProfile(photog)}
                                  className="px-2 py-1 text-[11px] font-medium bg-white border border-[#DCD9D0] hover:border-[#141413] text-[#141413] rounded-md transition-colors flex items-center gap-1 whitespace-nowrap"
                                >
                                  <UserCheck className="w-3 h-3" />
                                  <span>Profile</span>
                                </button>
                              )}
                              {onBookPhotographer && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onBookPhotographer(photog);
                                    setIsOpen(false);
                                  }}
                                  className="px-2 py-1 text-[11px] font-medium bg-[#C84B31] hover:bg-[#B03E26] text-white rounded-md transition-colors flex items-center gap-1 whitespace-nowrap"
                                >
                                  <Calendar className="w-3 h-3" />
                                  <span>Book</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
                <span className="text-[10px] font-mono-tabular text-[#6E6B64] mt-1 px-1">
                  {msg.sender === 'user' ? 'You' : 'Concierge'} · {msg.timestamp}
                </span>
              </div>
            ))}

            {isSending && (
              <div className="flex items-start">
                <div className="bg-white border border-[#DCD9D0] rounded-xl px-4 py-2.5 text-xs text-[#57554F] font-mono-tabular">
                  Concierge is composing a response...
                </div>
              </div>
            )}

            {!isSending && messages.length <= 2 && (
              <div className="pt-1 space-y-1.5">
                <p className="text-[11px] text-[#6E6B64] px-1">
                  Suggested questions:
                </p>
                <div className="flex flex-col gap-1.5">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="text-left text-xs px-3 py-2 rounded-lg bg-[#EAE8E1] hover:bg-[#DFDDD4] text-[#141413] transition-colors flex items-center justify-between gap-2"
                    >
                      <span className="truncate">{prompt}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#C84B31] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleFormSubmit}
            className="p-3 bg-white border-t border-[#DCD9D0] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about photographers, rates, or cities..."
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-[#F4F4F0] border border-[#D4D1C7] rounded-lg text-[#141413] focus:outline-none focus:border-[#141413]"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="px-3.5 py-2 bg-[#C84B31] hover:bg-[#B03E26] disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="px-4 py-3 rounded-full bg-[#141413] hover:bg-[#C84B31] text-white shadow-lg transition-colors flex items-center gap-2.5 text-xs font-medium whitespace-nowrap"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <>
            <X className="w-4 h-4" />
            <span>Close Concierge</span>
          </>
        ) : (
          <>
            <MessageSquare className="w-4 h-4 text-[#C84B31]" />
            <span>Ask Concierge</span>
          </>
        )}
      </button>
    </div>
  );
};
