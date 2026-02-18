"use client";

import { useState } from "react";
import { Search, Loader2, Download, BookOpen, AlertCircle, ShoppingBag, Play, Headphones, X, Lock, Video, Music } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";

// New Player Component to handle secure streaming
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
        
        <div className="bg-black w-full aspect-video flex items-center justify-center">
           {type === 'video' ? (
              <video 
                src={url} 
                controls 
                controlsList="nodownload" // Basic deterrent
                className="w-full h-full object-contain"
                autoPlay
              />
           ) : (
              <div className="w-full p-12 flex flex-col items-center">
                 <div className="w-32 h-32 rounded-full border-4 border-gold shadow-[0_0_50px_rgba(212,175,55,0.3)] animate-[spin_20s_linear_infinite] mb-8 overflow-hidden relative bg-gray-900">
                    <Headphones size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gold/50" />
                 </div>
                 <audio 
                    src={url} 
                    controls 
                    controlsList="nodownload" 
                    className="w-full max-w-md"
                    autoPlay
                 />
              </div>
           )}
        </div>
      </div>
    </div>
  );
};


export default function LibraryPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<any[] | null>(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);
  
  // State for the Active Player
  const [activeMedia, setActiveMedia] = useState<{url: string, title: string, type: string} | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true); setError(""); setBooks(null);

    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.books) setBooks(data.books);
      else setError("No purchases found for this email.");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Secure Downloader (Now ONLY for PDFs)
  const handleDownloadPDF = async (url: string, title: string) => {
    try {
      setDownloading(title);
      // Construct proxy URL to hide source
      const secureUrl = `/api/secure-download?file=${encodeURIComponent(url)}&orderId=library_access`;
      
      const link = document.createElement('a');
      link.href = secureUrl;
      
      // Clean title and force .pdf
      const cleanTitle = title.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.setAttribute('download', `${cleanTitle}.pdf`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Download failed");
      alert("Download failed. Please contact support.");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-20 px-6 transition-colors duration-300">
      <Header />
      
      {/* RENDER SECURE PLAYER IF ACTIVE */}
      {activeMedia && (
         <VaultPlayer 
           type={activeMedia.type} 
           url={activeMedia.url} 
           title={activeMedia.title} 
           onClose={() => setActiveMedia(null)} 
         />
      )}

      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-gold text-xs font-bold tracking-widest uppercase mb-3 block">Secured Access</span>
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">The Student Vault.</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Enter the email address used during checkout to unlock your private library.
          </p>
        </div>

        {/* Search Box */}
        <div className="max-w-md mx-auto mb-16">
          <form onSubmit={handleSearch} className="relative shadow-2xl">
            <input 
              type="email" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-card border border-border p-4 pl-12 rounded-xl text-foreground outline-none focus:border-gold transition-colors placeholder:text-muted-foreground"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <button 
              type="submit"
              disabled={loading || !email}
              className="absolute right-2 top-2 bottom-2 bg-gold hover:bg-white text-black font-bold px-6 rounded-lg transition-colors disabled:opacity-50 text-xs uppercase tracking-widest"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Unlock"}
            </button>
          </form>
          {error && (
            <div className="flex items-center gap-2 justify-center mt-4 text-red-500 text-xs font-bold uppercase tracking-wide bg-red-500/10 py-2 rounded-lg border border-red-500/20">
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>

        {/* Results Grid */}
        {books && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-border">
               <h3 className="text-foreground font-serif text-xl md:text-2xl">Your Collection</h3>
               <span className="bg-background border border-border px-3 py-1 rounded-full text-xs text-muted-foreground">{books.length} Asset{books.length !== 1 && 's'}</span>
            </div>

            {books.length === 0 ? (
               <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-card">
                 <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                   <Lock size={24} />
                 </div>
                 <h3 className="text-lg font-serif text-foreground mb-2">Vault is Empty</h3>
                 <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8">
                   No purchases found linked to <span className="text-foreground font-mono">{email}</span>.
                 </p>
                 <Link href="/shop" className="inline-flex items-center gap-2 bg-gold text-black px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors">
                    <ShoppingBag size={16} /> Visit Academy Shop
                 </Link>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {books.map((book) => {
                  const type = book.productType || 'ebook'; // Default to ebook for legacy
                  
                  return (
                  <div key={book._id} className="bg-card border border-border p-5 rounded-2xl flex items-center gap-5 group hover:border-gold/50 transition-all shadow-md">
                    
                    {/* Dynamic Thumbnail */}
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

                    {/* Metadata */}
                    <div className="flex-1">
                      <div className="flex gap-2 mb-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${type === 'video' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : type === 'audio' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                             {type}
                          </span>
                      </div>
                      <h4 className="text-base md:text-lg font-serif text-foreground mb-1 leading-tight line-clamp-2">{book.title}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4">
                        Unlocked: {new Date(book.purchasedDate).toLocaleDateString()}
                      </p>
                      
                      {/* Dynamic Interaction Button */}
                      {book.fileUrl ? (
                        <>
                          {type === 'ebook' ? (
                            <button 
                              onClick={() => handleDownloadPDF(book.fileUrl, book.title)}
                              disabled={downloading === book.title}
                              className="inline-flex items-center gap-2 bg-gold/10 text-gold text-xs font-bold uppercase tracking-widest transition-colors border border-gold/20 px-4 py-2 rounded-lg hover:bg-gold hover:text-black disabled:opacity-50"
                            >
                              {downloading === book.title ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
                              <span>{downloading === book.title ? "Saving..." : "Download"}</span>
                            </button>
                          ) : (
                            // Player Trigger for Audio/Video
                            <button 
                              onClick={() => setActiveMedia({url: book.fileUrl, title: book.title, type: type})}
                              className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors border px-5 py-2.5 rounded-lg shadow-sm
                                ${type === 'video' 
                                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500 hover:text-white' 
                                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500 hover:text-white'}`}
                            >
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