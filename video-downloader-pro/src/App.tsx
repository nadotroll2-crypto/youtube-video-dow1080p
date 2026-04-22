import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  Gamepad2, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  QrCode,
  LayoutDashboard
} from 'lucide-react';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Premium from './pages/Premium';
import Admin from './pages/Admin';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            // New user init
            const newUserData = {
              email: user.email,
              isPremium: false,
              role: user.email === 'newsofusa786@gmail.com' ? 'admin' : 'user',
              createdAt: new Date()
            };
            await setDoc(docRef, newUserData);
            setUserData(newUserData);
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#0a0a0b] text-slate-200 font-sans selection:bg-indigo-500/30">
        <Navbar user={user} userData={userData} />
        
        <main className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home user={user} userData={userData} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/premium" element={<Premium user={user} userData={userData} />} />
              <Route path="/admin" element={<Admin user={user} userData={userData} />} />
            </Routes>
          </AnimatePresence>
        </main>

        <footer className="border-t border-slate-800/50 mt-auto py-8">
          <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
            <p>© 2026 Video Downloader Pro. For educational purposes only.</p>
            <p className="mt-2 text-xs opacity-50">Experimental Build • Secure UPI Integration</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

function Navbar({ user, userData }: { user: User | null, userData: any }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="border-b border-slate-800/50 bg-[#0a0a0b]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Downloader<span className="text-indigo-500">Pro</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {userData?.role === 'admin' && (
            <Link to="/admin" className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800/50">
              <LayoutDashboard className="w-5 h-5" />
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/premium" className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${userData?.isPremium ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500 hover:text-white'}`}>
                {userData?.isPremium ? (
                  <><CheckCircle2 className="w-3.5 h-3.5" /> Premium</>
                ) : (
                  <><Zap className="w-3.5 h-3.5" /> Upgrade</>
                )}
              </Link>
              <button 
                onClick={handleLogout}
                className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link 
              to="/login"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-500/20"
            >
              Get Started
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
