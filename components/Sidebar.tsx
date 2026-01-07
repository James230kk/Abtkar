
import React from 'react';
import { ChatSession } from '../types';
import { Plus, Trash2, MessageSquare, Menu, X, Command } from 'lucide-react';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  currentSessionId, 
  onNewChat, 
  onSelectSession, 
  onDeleteSession,
  isOpen,
  onToggle
}) => {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={onToggle}
        />
      )}
      
      <aside 
        className={`${
          isOpen ? 'translate-x-0 w-72' : 'translate-x-full w-0'
        } fixed inset-y-0 right-0 z-50 bg-[#171717] transition-all duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col border-l border-white/5 overflow-hidden`}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg text-white">
             <Command size={20} className="text-emerald-400" />
             <span>ابتكار AI</span>
          </div>
          <button onClick={onToggle} className="md:hidden p-2 hover:bg-white/5 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="px-3 mb-2">
          <button 
            onClick={onNewChat}
            className="w-full flex items-center gap-3 px-3 py-3 bg-[#2f2f2f] hover:bg-[#383838] rounded-xl transition-all text-sm font-medium border border-white/5 active:scale-[0.98]"
          >
            <Plus size={18} />
            <span>محادثة جديدة</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-2 space-y-1">
          {sessions.length > 0 && (
            <div className="text-[10px] font-bold text-gray-500 px-3 mb-2 uppercase tracking-[0.2em]">الأرشيف</div>
          )}
          
          {sessions.map(session => (
            <div 
              key={session.id}
              className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                currentSessionId === session.id 
                  ? 'bg-[#2f2f2f] text-white' 
                  : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => {
                onSelectSession(session.id);
                if (window.innerWidth < 768) onToggle();
              }}
            >
              <div className="flex items-center gap-3 truncate">
                <MessageSquare size={16} className={currentSessionId === session.id ? 'text-emerald-400' : 'text-gray-500'} />
                <span className="text-sm truncate font-medium">{session.title}</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className={`p-1 hover:text-red-400 transition-all rounded-md hover:bg-white/10 ${
                  currentSessionId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/5 bg-[#171717]">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center text-xs font-bold text-white shadow-xl">U</div>
            <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate text-white">مستخدم ابتكار</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">النسخة الاحترافية</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
