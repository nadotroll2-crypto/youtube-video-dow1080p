import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, Clock, Search, ExternalLink, ShieldAlert, Loader2, User } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, doc, updateDoc, where, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Admin({ user, userData }: { user: any, userData: any }) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (userData?.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchPayments = async () => {
      try {
        const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setPayments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching payments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [userData, navigate]);

  const handleAction = async (paymentId: string, userId: string, status: 'approved' | 'rejected') => {
    setActioning(paymentId);
    try {
      // 1. Update payment status
      await updateDoc(doc(db, 'payments', paymentId), { status });
      
      // 2. If approved, update user premium status
      if (status === 'approved') {
        await updateDoc(doc(db, 'users', userId), { isPremium: true });
      }

      setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status } : p));
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setActioning(null);
    }
  };

  if (loading) return null;

  const pending = payments.filter(p => p.status === 'pending');
  const history = payments.filter(p => p.status !== 'pending');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-500">Manage premium requests and verify payments.</p>
        </div>
        <div className="flex gap-4">
          <StatBox label="Total Sales" value={`₹${payments.filter(p => p.status === 'approved').length * 99}`} />
          <StatBox label="Pending" value={pending.length.toString()} />
        </div>
      </div>

      <Section 
        title="Pending Approvals" 
        data={pending} 
        renderItem={(p) => (
          <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 font-bold mb-1">
                <User className="w-4 h-4" />
                <span>{p.userEmail}</span>
              </div>
              <div className="text-white text-xl font-mono font-black tracking-tighter">UTR: {p.transactionId}</div>
              <div className="text-slate-500 text-xs flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span>{p.createdAt?.toDate().toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => handleAction(p.id, p.userId, 'approved')}
                disabled={!!actioning}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                {actioning === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Approve
              </button>
              <button 
                onClick={() => handleAction(p.id, p.userId, 'rejected')}
                disabled={!!actioning}
                className="bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
              >
                {actioning === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Reject
              </button>
            </div>
          </div>
        )}
      />

      <Section 
        title="Transaction History" 
        data={history} 
        renderItem={(p) => (
          <div key={p.id} className="bg-slate-950/50 border border-slate-900 rounded-xl p-4 flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${p.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                {p.status === 'approved' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-white font-bold text-sm">{p.userEmail}</div>
                <div className="text-slate-500 text-[10px] font-mono tracking-widest">{p.transactionId}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-black text-sm">₹{p.amount}</div>
              <div className="text-slate-700 text-[10px] uppercase font-bold tracking-tighter">{p.status}</div>
            </div>
          </div>
        )}
      />
    </motion.div>
  );
}

function StatBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 px-6 py-4 rounded-2xl">
      <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</div>
      <div className="text-2xl font-black text-white tracking-tighter">{value}</div>
    </div>
  );
}

function Section({ title, data, renderItem }: { title: string, data: any[], renderItem: (item: any) => React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-black text-slate-600 uppercase tracking-[0.2em]">{title} ({data.length})</h2>
      <div className="grid gap-4">
        {data.length > 0 ? data.map(renderItem) : (
          <div className="text-center py-12 border-2 border-dashed border-slate-900 rounded-3xl text-slate-600 flex flex-col items-center gap-3">
            <ShieldAlert className="w-10 h-10" />
            <p className="font-bold">No entries found in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
