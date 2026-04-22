import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Download, Shield, Zap, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Format {
  quality: string;
  label: string;
  type: 'free' | 'premium';
}

interface VideoData {
  title: string;
  thumbnail: string;
  formats: Format[];
}

export default function Home({ user, userData }: { user: any, userData: any }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<VideoData | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setError('');
    setData(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const result = await res.json();
      if (res.ok) {
        setData(result);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to analyze video. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (format: Format) => {
    if (format.type === 'premium' && !userData?.isPremium) {
      navigate('/premium');
      return;
    }
    
    // Trigger mock download
    window.location.href = `/api/download?quality=${format.quality}&url=${encodeURIComponent(url)}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-12">
        <motion.h1 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-4xl sm:text-6xl font-bold text-white mb-4 tracking-tight"
        >
          Download Any Video <span className="text-indigo-500">Fast</span>
        </motion.h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          The ultimate downloader for everyone. Support for 1080p, multiple formats, and blazing fast speeds.
        </p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 p-2 rounded-2xl shadow-2xl backdrop-blur-sm mb-12">
        <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Paste video URL here (e.g. YouTube, Vimeo...)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 outline-none rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 transition-all font-medium"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 min-w-[140px]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze'}
          </button>
        </form>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3 mb-8"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </motion.div>
      )}

      {data && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-8"
        >
          <div className="space-y-4">
            <div className="aspect-video rounded-2xl overflow-hidden border border-slate-800 shadow-2xl group">
              <img 
                src={data.thumbnail} 
                alt="Thumbnail" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <h2 className="text-xl font-bold text-white line-clamp-2">{data.title}</h2>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Safe & Secure Download Verified</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Available Qualities</h3>
            <div className="grid gap-3">
              {data.formats.map((f, i) => (
                <button
                  key={i}
                  onClick={() => handleDownload(f)}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all group ${
                    f.type === 'premium' 
                      ? 'bg-indigo-500/5 border-indigo-500/20 hover:bg-indigo-500/10' 
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {f.type === 'premium' ? <Zap className="w-4 h-4 text-indigo-400 fill-indigo-400" /> : <Download className="w-4 h-4 text-slate-400" />}
                    <span className="font-bold text-slate-200">{f.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {f.type === 'premium' && !userData?.isPremium && (
                      <span className="bg-indigo-600 text-white text-[10px] uppercase font-black px-2 py-0.5 rounded flex items-center gap-1 group-hover:scale-110 transition-transform">
                        <Lock className="w-2.5 h-2.5" /> PRO
                      </span>
                    )}
                    <span className={`text-xs font-medium ${f.type === 'premium' ? 'text-indigo-400' : 'text-emerald-500'}`}>
                      {f.type === 'premium' && !userData?.isPremium ? 'Unlock' : 'Download Now'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {!data && !loading && (
        <div className="grid sm:grid-cols-3 gap-6 opacity-60">
          <FeatureCard 
            icon={<Zap className="w-6 h-6 text-indigo-500" />} 
            title="Max Speed" 
            desc="No limits on download speed for anyone." 
          />
          <FeatureCard 
            icon={<Shield className="w-6 h-6 text-emerald-500" />} 
            title="Secure" 
            desc="Zero ads, zero trackers, 100% privacy." 
          />
          <FeatureCard 
            icon={<Lock className="w-6 h-6 text-amber-500" />} 
            title="Premium" 
            desc="Highest resolution up to 4K available." 
          />
        </div>
      )}
    </motion.div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/50">
      <div className="mb-4">{icon}</div>
      <h3 className="font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
