'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Student, FacultyStaff, Expense, AIChatMessage } from '../lib/types';
import { processAIQuery } from '../lib/ai-engine';
import { BotIcon, SparklesIcon } from './Icons';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  faculty: FacultyStaff[];
  expenses: Expense[];
  onNavigateTab: (tab: any, searchQuery?: string) => void;
  onSelectStudent: (student: Student) => void;
}

export default function AICopilotDrawer({
  isOpen,
  onClose,
  students,
  faculty,
  expenses,
  onNavigateTab,
  onSelectStudent,
}: AICopilotDrawerProps) {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: `🏥 **Assalam-o-Alaikum! Main Medical College Campus AI Copilot hoon.**\n\nMain aap ke financial data, student fee ledgers, defaulters tracking, aur administrative policies ka tajzia kar sakta hoon.\n\n📌 **Aap mujh se yeh pooch sakte hain:**\n- *"Kaun se 30 students ne fee nahi di?"*\n- *"Un 35 students ki list do jinhon ne March ya August ki fee miss ki hai."*\n- *"Muhammad Ahmed Khan ka 2-year fee ledger check karo."*\n- *"Is maheene ki total collection aur expenses kitne hain?"*\n- *"Defaulter students ke liye warning notice banao."*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    '30 Pending Fee Defaulters ki list dikhao',
    '35 students jinhon ne March ya August miss kiya',
    'Muhammad Ahmed Khan ka fee ledger',
    'Monthly Collection vs Faculty Payroll Expense',
    'Official Defaulter Notice Letter template',
    'PMDC Fee & Exam Rules',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: AIChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const response = processAIQuery(query, students, faculty, expenses);
      const aiMsg: AIChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        content: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);

      if (response.filterAction?.tab) {
        // Optional automated switch or suggestion
      }
    }, 450);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-slideLeft">
      {/* Top Header */}
      <div className="p-4 bg-gradient-to-r from-slate-900 to-teal-950 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
            <BotIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold flex items-center gap-1.5">
              <span>Campus LLM AI Copilot</span>
              <span className="bg-teal-500 text-[9px] font-black text-slate-950 px-1.5 py-0.2 rounded">
                LIVE
              </span>
            </h2>
            <p className="text-[10px] text-teal-200">Financial Insights & Student Query Model</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-xs"
        >
          ✕
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-2.5 bg-slate-50 border-b border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-thin">
        <div className="flex gap-1.5">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-[10px] px-2.5 py-1 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:border-teal-500 hover:text-teal-700 shadow-2xs transition-all shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 text-xs">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] p-3.5 rounded-2xl shadow-sm text-xs leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-teal-700 text-white rounded-tr-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                }`}
              >
                {m.content}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 px-1">
                {m.timestamp}
              </span>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-1.5 p-3 bg-white border border-slate-200 rounded-2xl w-24 text-slate-400">
            <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce delay-100"></span>
            <span className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce delay-200"></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask anything about fees, defaulters, students..."
            className="flex-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white text-slate-800 placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="p-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold disabled:opacity-40 transition-all shadow-md shadow-teal-700/10"
          >
            Send
          </button>
        </form>
        <div className="text-[9px] text-slate-400 text-center mt-1.5">
          Trained on live campus student fee database & PMDC guidelines.
        </div>
      </div>
    </div>
  );
}
