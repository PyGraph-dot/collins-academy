"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Download, BookOpen, AlertCircle, ShoppingBag, Play, Headphones, X, Lock, ShieldCheck, Video, Music, KeyRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";

// Vault Player Component (Unchanged)
const VaultPlayer = ({ type, url, title, onClose }: { type: string, url: string, title: string, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-border bg-background/50">
           <div>
             <span className="text-[10px] text-gold font-bold uppercase tracking-widest">{type === 'video' ? 'Masterclass' : 'Audio Drill'}</span>
             <h3 className="font-serif text-foreground text-lg">{title}</h3>
           </div>
           <button onClick={onClose} className="p-2 bg-white/5 hover:bg-red-500 hover:text-white rounded-full transition-colors">
              <X size={20} />
           </button>
        </div>
        
        <div className="bg-black w-full aspect-video flex items-center justify-center relative">
           {type === 'video' ? (
              <video src={url} controls controlsList="nodownload" className="w-full h-full object-contain" autoPlay />
           ) : (
              <div className="w-full p-12 flex flex-col items-center">
                 <div className="w-32 h-32 rounded-full border-4 border-gold shadow-[0_0_50px_rgba(212,175,55,0.3)] animate-[spin_20s_linear_infinite] mb-8 overflow-hidden relative bg-gray-900">
                    <Headphones size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gold/50" />
                 </div>
                 <audio src={url} controls controlsList="nodownload" className="w-full max-w-md" autoPlay />
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default function LibraryPage() {
  const [authStep, setAuthStep] = useState<'email' | 'otp' | 'unlocked' | 'loading_session'>('loading_session');
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<any[] | null>(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [activeMedia, setActiveMedia] = useState<{url: string, title: string, type: string} | null>(null);

  // THE MEMORY ENGINE: Check for saved token on page load
  useEffect(() => {
    const savedEmail = localStorage.getItem("vault_email");
    const savedToken = localStorage.getItem("vault_token");

    if (savedEmail && savedToken) {
        setEmail(savedEmail);
        autoUnlockVault(savedEmail, savedToken);
    } else {
        setAuthStep('email');
    }
  }, []);

  const autoUnlockVault = async (savedEmail: string, savedToken: string) => {
      try {
          const res = await fetch("/api/library", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: savedEmail, token: savedToken }),
          });
          const data = await res.json();
          
          if (res.ok && data.books) {
              setBooks(data.books);
              setAuthStep('unlocked');
          } else {
              // Token expired or invalid, wipe it and ask for email
              localStorage.removeItem("vault_token");
              localStorage.removeItem("vault_email");
              setAuthStep('email');
          }
      } catch (err) {
          setAuthStep('email');
      }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true); setError("");

    try {
      const res = await fetch("/api/library/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (res.ok) setAuthStep('otp');
      else setError(data.error || "Failed to send code.");
    } catch (err) {
      setError("Network Error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) return setError("Please enter the 6-digit code.");
    setLoading(true); setError(""); setBooks(null);

    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }), 
      });
      const data = await res.json();
      if (res.ok && data.books) {
          // SAVE THE SESSION FOR NEXT TIME
          if (data.token) {
              localStorage.setItem("vault_token", data.token);
              localStorage.setItem("vault_email", email);
          }
          setBooks(data.books);
          setAuthStep('unlocked'); 
      } else {
          setError(data.error || "Invalid code.");
      }
    } catch (err) {
      setError("Network Error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const lockVault = () => {
      localStorage.removeItem("vault_token");
      localStorage.removeItem("vault_email");
      setBooks(null);
      setCode("");
      setAuthStep('email');
  };

  const handleDownloadPDF = async (url: string, title: string) => {
    try {
      setDownloading(title);
      const secureUrl = `/api/secure-download?file=${encodeURIComponent(url)}&orderId=library_access`;
      const link = document.createElement('a');
      link.href = secureUrl;
      const cleanTitle = title.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.setAttribute('download', `${cleanTitle}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert("Download failed.");
    } finally {
      setDownloading(null);
    }
  };

  if (authStep === 'loading_session') {
      return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-gold" size={40} /></div>;
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-20 px-6 transition-colors duration-300">
      <Header />
      
      {activeMedia && (
         <VaultPlayer type={activeMedia.type} url={activeMedia.url} title={activeMedia.title} onClose={() => setActiveMedia(null)} />
      )}

      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-12">
          <span className="text-gold text-xs font-bold tracking-widest uppercase mb-3 block">Secured Access</span>
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">The Student Vault.</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Your private library of resources and masterclasses.
          </p>
        </div>

        {/* STEP 1: EMAIL FORM */}
        {authStep === 'email' && (
            <div className="max-w-md mx-auto mb-16 animate-in fade-in duration-300">
              <form onSubmit={handleRequestOtp} className="relative shadow-2xl">
                <input 
                  type="email" placeholder="Enter purchase email..." value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-card border border-border p-4 pl-12 rounded-xl text-foreground outline-none focus:border-gold transition-colors placeholder:text-muted-foreground"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <button type="submit" disabled={loading || !email} className="absolute right-2 top-2 bottom-2 bg-gold hover:bg-white text-black font-bold px-6 rounded-lg transition-colors disabled:opacity-50 text-xs uppercase tracking-widest">
                  {loading ? <Loader2 className="animate-spin" /> : "Access"}
                </button>
              </form>
              {error && <div className="flex items-center gap-2 justify-center mt-4 text-red-500 text-xs font-bold uppercase tracking-wide bg-red-500/10 py-2 rounded-lg border border-red-500/20"><AlertCircle size={14} /> {error}</div>}
            </div>
        )}

        {/* STEP 2: OTP FORM */}
        {authStep === 'otp' && (
            <div className="max-w-md mx-auto mb-16 bg-card border border-border p-8 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-right-4 duration-300 text-center">
                <div className="w-12 h-12 bg-gold/10 text-gold rounded-full flex items-center justify-center mx-auto mb-4 border border-gold/20"><KeyRound size={24} /></div>
                <h3 className="text-xl font-serif text-foreground mb-2">Check your email</h3>
                <p className="text-xs text-muted-foreground mb-6">We sent a 6-digit access code to <span className="font-bold text-foreground">{email}</span></p>
                
                <form onSubmit={handleVerifyOtp}>
                    <input 
                        type="text" placeholder="------" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-background border border-border p-4 rounded-xl text-center text-2xl font-mono tracking-[1em] text-gold outline-none focus:border-gold transition-colors mb-4"
                    />
                    <button type="submit" disabled={loading || code.length !== 6} className="w-full py-4 bg-gold hover:bg-white text-black font-bold rounded-xl transition-colors disabled:opacity-50 text-xs uppercase tracking-widest flex justify-center items-center gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : "Unlock Vault"}
                    </button>
                </form>
                
                <div className="mt-6 flex justify-between text-xs text-muted-foreground">
                    <button onClick={() => setAuthStep('email')} className="hover:text-gold transition-colors underline">Change Email</button>
                    <button onClick={handleRequestOtp} className="hover:text-gold transition-colors underline">Resend Code</button>
                </div>
                {error && <div className="flex items-center gap-2 justify-center mt-4 text-red-500 text-xs font-bold uppercase tracking-wide"><AlertCircle size={14} /> {error}</div>}
            </div>
        )}

        {/* STEP 3: VAULT UNLOCKED */}
        {authStep === 'unlocked' && books && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex flex-col md:flex-row justify-between items-center bg-card border border-gold/20 p-4 rounded-xl mb-12 shadow-[0_0_30px_rgba(212,175,55,0.05)]">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 border border-green-500/20">
                         <ShieldCheck size={20} />
                     </div>
                     <div className="text-left">
                         <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Vault Active For</p>
                         <p className="text-sm font-bold text-foreground font-mono">{email}</p>
                     </div>
                 </div>
                 <button onClick={lockVault} className="mt-4 md:mt-0 px-4 py-2 bg-background border border-border rounded-lg text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-red-400 hover:border-red-400/50 transition-colors flex items-center gap-2">
                    <Lock size={14} /> Lock Vault
                 </button>
             </div>

            <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
               <h3 className="text-foreground font-serif text-xl md:text-2xl">Your Collection</h3>
               <span className="bg-background border border-border px-3 py-1 rounded-full text-xs text-muted-foreground">{books.length} Asset{books.length !== 1 && 's'}</span>
            </div>

            {books.length === 0 ? (
               <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card">
                 <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground"><Lock size={24} /></div>
                 <h3 className="text-lg font-serif text-foreground mb-2">Vault is Empty</h3>
                 <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8">No purchases found linked to this email.</p>
                 <Link href="/shop" className="inline-flex items-center gap-2 bg-gold text-black px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors">
                    <ShoppingBag size={16} /> Visit Academy Shop
                 </Link>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {books.map((book) => {
                  const type = book.productType || 'ebook'; 
                  return (
                  <div key={book._id} className="bg-card border border-border p-5 rounded-2xl flex items-center gap-5 group hover:border-gold/50 transition-all shadow-md">
                    <div className="w-20 h-24 md:h-28 bg-black rounded-lg overflow-hidden border border-border flex-shrink-0 relative flex items-center justify-center">
                       {book.image ? (
                         <>
                           <Image src={book.image} alt={book.title} fill className={`object-cover ${type !== 'ebook' ? 'opacity-50' : ''}`} />
                           {type === 'video' && <Play size={24} className="text-white z-10" fill="white" />}
                           {type === 'audio' && <Headphones size={24} className="text-white z-10" />}
                         </>
                       ) : (
                         <div className="text-muted-foreground">
                           {type === 'video' ? <Video size={24}/> : type === 'audio' ? <Music size={24}/> : <BookOpen size={24}/>}
                         </div>
                       )}
                    </div>
                    <div className="flex-1">
                      <div className="flex gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${type === 'video' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : type === 'audio' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>{type}</span>
                      </div>
                      <h4 className="text-base md:text-lg font-serif text-foreground mb-1 leading-tight line-clamp-2">{book.title}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4">Unlocked: {new Date(book.purchasedDate).toLocaleDateString()}</p>
                      
                      {book.fileUrl ? (
                        <>
                          {type === 'ebook' ? (
                            <button onClick={() => handleDownloadPDF(book.fileUrl, book.title)} disabled={downloading === book.title} className="inline-flex items-center gap-2 bg-gold/10 text-gold text-xs font-bold uppercase tracking-widest transition-colors border border-gold/20 px-4 py-2 rounded-lg hover:bg-gold hover:text-black disabled:opacity-50">
                              {downloading === book.title ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
                              <span>{downloading === book.title ? "Saving..." : "Download"}</span>
                            </button>
                          ) : (
                            <button onClick={() => setActiveMedia({url: book.fileUrl, title: book.title, type: type})} className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors border px-5 py-2.5 rounded-lg shadow-sm ${type === 'video' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500 hover:text-white' : 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500 hover:text-white'}`}>
                              {type === 'video' ? <Play size={14} fill="currentColor" /> : <Headphones size={14} />}
                              <span>{type === 'video' ? 'Watch Course' : 'Listen Now'}</span>
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-[10px] text-red-500 bg-red-500/10 px-2 py-1 rounded-full font-bold uppercase">Processing...</span>
                      )}
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}