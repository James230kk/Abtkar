
import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Trash2, User, Bot, Menu, X, Command, MessageSquare, SquarePen, LogOut } from 'lucide-react';
import { streamChatResponse } from './services/geminiService';
import MarkdownRenderer from './components/MarkdownRenderer';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import { Role, Message, ChatSession } from './types';

export default function App() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages, isLoading]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = Math.min(textAreaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleLogin = (userData: { email: string }) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setSessions([]);
    setCurrentSessionId(null);
  };

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'محادثة جديدة',
      messages: [],
      createdAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) setCurrentSessionId(null);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    let sessionId = currentSessionId;
    if (!sessionId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: input.slice(0, 30),
        messages: [],
        createdAt: Date.now()
      };
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      sessionId = newSession.id;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: input,
      timestamp: Date.now()
    };

    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { 
        ...s, 
        messages: [...s.messages, userMessage],
        title: s.messages.length === 0 ? input.slice(0, 30) : s.title
      } : s
    ));
    
    setInput('');
    setIsLoading(true);

    const modelMessageId = (Date.now() + 1).toString();
    const modelPlaceholder: Message = {
      id: modelMessageId,
      role: Role.MODEL,
      content: '',
      timestamp: Date.now()
    };

    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, messages: [...s.messages, modelPlaceholder] } : s
    ));

    try {
      const sessionMessages = sessions.find(s => s.id === sessionId)?.messages || [];
      const history = [...sessionMessages, userMessage].map(m => ({
        role: m.role === Role.USER ? 'user' as const : 'model' as const,
        parts: [{ text: m.content }]
      }));

      let fullContent = '';
      await streamChatResponse(history, (chunk) => {
        fullContent += chunk;
        setSessions(prev => prev.map(s => 
          s.id === sessionId ? {
            ...s,
            messages: s.messages.map(m => 
              m.id === modelMessageId ? { ...m, content: fullContent } : m
            )
          } : s
        ));
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-[#212121] text-gray-200 overflow-hidden font-sans select-none" dir="rtl">
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={createNewChat}
        onSelectSession={setCurrentSessionId}
        onDeleteSession={deleteSession}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onLogout={handleLogout}
        userEmail={user.email}
      />

      <div className="flex-1 flex flex-col relative min-w-0 h-full">
        <header className="flex md:hidden items-center justify-between px-4 h-14 bg-[#212121] border-b border-white/5 shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -mr-2">
            <Menu size={20} />
          </button>
          <span className="font-semibold text-sm truncate max-w-[200px]">
            {currentSession?.title || 'ابتكار AI'}
          </span>
          <button onClick={createNewChat} className="p-2 -ml-2">
            <SquarePen size={20} />
          </button>
        </header>

        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="hidden md:flex absolute right-4 top-4 z-40 p-2 bg-[#2f2f2f] hover:bg-[#3f3f3f] rounded-lg border border-white/10 transition-all shadow-lg"
          >
            <Menu size={20} />
          </button>
        )}

        <main className="flex-1 overflow-y-auto custom-scrollbar relative">
          {!currentSession || currentSession.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
              <div className="w-16 h-16 bg-[#2f2f2f] rounded-2xl flex items-center justify-center shadow-2xl mb-6 ring-1 ring-white/10">
                <Command size={32} className="text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">أهلاً بك، {user.email.split('@')[0]}</h2>
              <p className="text-gray-400 max-w-sm mx-auto leading-relaxed">مساعدك الذكي المبدع جاهز للعمل.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-10 w-full max-w-xl">
                {["خطة تسويقية لمنتج جديد", "اكتب لي قصة قصيرة", "شرح الفيزياء ببساطة", "أفضل طرق تعلم اللغات"].map((hint, i) => (
                  <button key={i} onClick={() => setInput(hint)} className="p-4 text-right bg-[#2f2f2f] hover:bg-[#383838] border border-white/5 rounded-xl text-sm text-gray-300 transition-all">
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full py-8 space-y-10 px-4">
              {currentSession.messages.map((msg, idx) => (
                <div key={msg.id} className="flex gap-4 md:gap-6 message-enter">
                  <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${msg.role === Role.USER ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                    {msg.role === Role.USER ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-gray-500 mb-1 uppercase tracking-wide">
                      {msg.role === Role.USER ? 'أنت' : 'ابتكار'}
                    </div>
                    <div className="text-gray-100 leading-7">
                      <MarkdownRenderer content={msg.content} />
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} className="h-20" />
            </div>
          )}
        </main>

        <div className="p-4 md:p-8 shrink-0">
          <div className="max-w-3xl mx-auto relative">
            <div className="relative flex flex-col w-full bg-[#2f2f2f] border border-white/10 rounded-2xl shadow-2xl focus-within:border-emerald-500/50 transition-all">
              <textarea
                ref={textAreaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                placeholder="اسأل ابتكار..."
                className="w-full bg-transparent text-white py-4 pr-4 pl-14 resize-none outline-none text-base max-h-[200px]"
                rows={1}
              />
              <button 
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className={`absolute left-2 bottom-2 p-2 rounded-xl transition-all ${input.trim() && !isLoading ? 'bg-white text-black' : 'bg-[#404040] text-gray-500'}`}
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-black/20 border-t-emerald-500 rounded-full animate-spin" /> : <Send size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
