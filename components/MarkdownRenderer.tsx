
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const renderContent = (text: string) => {
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // الجداول (تحسين بسيط)
      .replace(/\|(.+)\|/g, (match) => `<div class="overflow-x-auto"><table class="min-w-full border border-gray-700 my-2"><tr>${match.split('|').filter(i => i.trim()).map(c => `<td class="border border-gray-700 p-2">${c}</td>`).join('')}</tr></table></div>`)
      // العناوين
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
      // الخط العريض
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // كتل البرمجة
      .replace(/```(\w+)?([\s\S]*?)```/g, (_, lang, code) => `
        <div class="relative group my-4">
          <div class="flex justify-between items-center bg-[#2f2f2f] px-4 py-1 text-xs text-gray-400 rounded-t-lg border-b border-gray-700">
            <span>${lang || 'code'}</span>
            <button onclick="navigator.clipboard.writeText(\`${code.trim()}\`)" class="hover:text-white transition-colors">Copy</button>
          </div>
          <pre class="!mt-0 !rounded-t-none shadow-xl"><code class="language-${lang}">${code.trim()}</code></pre>
        </div>
      `)
      // الكود المضمن
      .replace(/`(.*?)`/g, '<code class="bg-[#383838] px-1.5 py-0.5 rounded text-pink-400 font-mono text-sm">$1</code>')
      // الروابط
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-blue-400 hover:underline">$1</a>')
      // القوائم
      .replace(/^\s*[-*+]\s+(.*)$/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^\s*\d+\.\s+(.*)$/gm, '<li class="ml-4 list-decimal">$1</li>')
      // الأسطر الجديدة
      .replace(/\n/g, '<br />');

    return { __html: html };
  };

  return (
    <div 
      className="prose prose-invert max-w-none text-sm md:text-base leading-relaxed text-gray-200"
      dangerouslySetInnerHTML={renderContent(content)}
    />
  );
};

export default MarkdownRenderer;
