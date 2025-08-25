import React, { useMemo, useRef, useState, useEffect } from 'react';

// Lightweight floating chatbot with canned Q&A and typing effect
const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]); // {role:'bot'|'user', text:string}
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  const faqs = useMemo(() => [
    {
      q: 'How do I change my booking?',
      a: 'Go to My Bookings, select your trip, and choose Change Flight. Fees may apply depending on fare rules.'
    },
    {
      q: 'What is the baggage allowance?',
      a: 'Allowance varies by route and cabin. You can view exact limits during booking and in your confirmation email.'
    },
    {
      q: 'When does online check-in open?',
      a: 'Online check-in opens 24–48 hours before departure depending on the route.'
    },
    {
      q: 'Do you offer student discounts?',
      a: 'We frequently run promotions and special fares. Subscribe to our newsletter for alerts.'
    },
    {
      q: 'What payment methods are accepted?',
      a: 'We accept major cards and UPI. All transactions are encrypted and secure.'
    }
  ], []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  const sendUser = (text) => {
    setMessages((m) => [...m, { role: 'user', text }]);
    setTyping(true);
    // Simulate thinking + typing effect
    setTimeout(() => {
      const found = faqs.find((f) => f.q === text);
      const answer = found?.a || "I can help with bookings, baggage, check-in, and payments. Choose a question above.";
      setMessages((m) => [...m, { role: 'bot', text: answer }]);
      setTyping(false);
    }, 900);
  };

  const toggle = () => {
    setOpen((o) => !o);
    if (!open && messages.length === 0) {
      // Seed a greeting only once
      setMessages([{ role: 'bot', text: 'Hi! I\'m your travel assistant. Pick a question to get started.' }]);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Panel */}
      {open && (
        <div className="mb-3 w-80 sm:w-96 max-h-[60vh] rounded-2xl shadow-2xl ring-1 ring-black/5 bg-white text-gray-900 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <p className="font-semibold">Travel Assistant</p>
            </div>
            <button onClick={() => setOpen(false)} className="opacity-90 hover:opacity-100">✕</button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="px-4 py-3 space-y-3 overflow-y-auto max-h-[38vh]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'} px-3 py-2 rounded-xl max-w-[85%]`}>
                  <p className="text-sm leading-relaxed">{m.text}</p>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-3 py-2 rounded-xl inline-flex items-center gap-2">
                  <span className="inline-flex -space-x-1">
                    <span className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-.2s]"></span>
                    <span className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="h-1.5 w-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:.2s]"></span>
                  </span>
                  <span className="text-xs text-gray-600">typing…</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick questions */}
          <div className="px-3 pb-3 pt-2 border-t border-gray-200">
            <p className="px-1 text-xs font-semibold text-gray-500 mb-2">Quick questions</p>
            <div className="flex flex-wrap gap-2">
              {faqs.map((f, idx) => (
                <button
                  key={idx}
                  onClick={() => sendUser(f.q)}
                  className="px-3 py-1.5 text-sm rounded-full bg-white text-indigo-700 ring-1 ring-black/5 hover:bg-indigo-50"
                >
                  {f.q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        aria-label="Open chatbot"
        onClick={toggle}
        className="h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white flex items-center justify-center ring-1 ring-black/5 hover:scale-105 active:scale-95 transition-transform"
      >
        <span className="text-2xl">🤖</span>
      </button>
    </div>
  );
};

export default Chatbot;
