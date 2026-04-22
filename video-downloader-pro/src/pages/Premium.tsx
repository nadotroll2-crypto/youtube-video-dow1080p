import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { Zap, CheckCircle2, QrCode as QrIcon, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const UPI_ID = "saifkhan1@fam";
const AMOUNT = 99;
const UPI_URL = `upi://pay?pa=${UPI_ID}&pn=Saif%20Khan&am=${AMOUNT}&cu=INR`;

export default function Premium({ user, userData }: { user: any, userData: any }) {
  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'none' | 'pending' | 'approved'>('none');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (userData?.isPremium) {
      setStatus('approved');
    } else {
      // Check for existing pending payments
      const checkPayments = async () => {
        setLoading(true);
        try {
          const q = query(
            collection(db, 'payments'), 
            where('userId', '==', user.uid),
            where('status', '==', 'pending')
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            setStatus('pending');
          }
        } catch (err) {
          console.error("Error checking payments:", err);
        } finally {
          setLoading(false);
        }
      };
      checkPayments();
    }
  }, [user, userData, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utr || utr.length < 6) {
      setError('Please enter a valid Transaction ID (UTR)');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await addDoc(collection(db, 'payments'), {
        userId: user.uid,
        userEmail: user.email,
        transactionId: utr,
        amount: AMOUNT,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setStatus('pending');
    } catch (err) {
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      {status === 'approved' ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Premium Unlocked!</h2>
          <p className="text-slate-400 mb-8">Enjoy unlimited 1080p downloads and maximum speeds.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all"
          >
            Start Downloading
          </button>
        </div>
      ) : status === 'pending' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Payment Submitted</h2>
          <p className="text-slate-400 mb-8 max-w-sm mx-auto">
            Our admin team is verifying your Transaction ID. This usually takes 5-15 minutes.
          </p>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 inline-flex items-center gap-2 text-sm text-amber-400">
            <AlertCircle className="w-4 h-4" />
            <span>Check back soon to enjoy Premium features!</span>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white fill-white" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Upgrade to Pro</h2>
              </div>
              <ul className="space-y-4">
                <PricingFeature text="Unlock 1080p Quality" />
                <PricingFeature text="Maximum Download Speed" />
                <PricingFeature text="Priority Support" />
                <PricingFeature text="Ad-free Experience" />
                <PricingFeature text="Multi-device Access" />
              </ul>
              <div className="mt-8 pt-8 border-t border-slate-800 flex items-end gap-2">
                <span className="text-4xl font-black text-white">₹{AMOUNT}</span>
                <span className="text-slate-500 font-medium mb-1">One-time payment</span>
              </div>
            </div>
            
            <div className="bg-indigo-600/10 border border-indigo-600/20 p-4 rounded-2xl flex gap-3 text-indigo-400 text-sm">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <p>Safe and secure payment verified. Manual approval ensures 100% reliability.</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 flex flex-col items-center">
            <h3 className="text-slate-900 font-bold mb-4 uppercase tracking-widest text-xs">Scan & Pay ₹{AMOUNT}</h3>
            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 mb-6 group cursor-pointer hover:border-indigo-200 transition-colors">
              <QRCodeSVG 
                value={UPI_URL} 
                size={200}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="text-slate-900 font-bold mb-2">UPI ID: <span className="text-indigo-600">{UPI_ID}</span></p>
            <p className="text-slate-500 text-[10px] text-center mb-8 uppercase font-bold tracking-tighter">Google Pay • PhonePe • Paytm • FamPay</p>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div className="space-y-1">
                <input 
                  type="text" 
                  value={utr}
                  onChange={(e) => setUtr(e.target.value)}
                  placeholder="Enter Transaction ID (UTR)"
                  className="w-full bg-slate-100 border border-slate-200 focus:border-indigo-500 outline-none rounded-xl py-3 px-4 text-slate-900 placeholder:text-slate-400 font-bold transition-all text-center"
                />
                <p className="text-[10px] text-slate-400 font-bold text-center italic">12-digit number found in payment details</p>
              </div>

              {error && <p className="text-rose-500 text-center text-xs font-bold">{error}</p>}

              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><QrIcon className="w-5 h-5" /> Submit UTR</>}
              </button>
            </form>
            
            <p className="mt-6 text-[10px] text-slate-400 text-center uppercase tracking-widest font-black leading-relaxed">
              FAKE ENTRIES WILL BE<br />PERMANENTLY BANNED
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function PricingFeature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-slate-300">
      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      <span className="font-medium">{text}</span>
    </li>
  );
}
