"use client";

import { useState } from "react";
import { Search, Loader2, Download, BookOpen, AlertCircle, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LibraryPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<any[] | null>(null);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");
    setBooks(null);

    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.books) {
        setBooks(data.books);
      } else {
        // Fallback error, though we handle empty array below
        setError("No purchases found for this email.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Force Download Function (Same as Success Page) ---
  const handleDownload = async (url: string, title: string) => {
    try {
      setDownloading(title);
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      window.open(url, '_blank');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-[#d4af37] text-xs font-bold tracking-widest uppercase mb-3 block">Guest Access</span>
          <h1 className="text-4xl font-serif text-white mb-4">My Digital Library.</h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Enter the email address you used during checkout to access your complete purchase history and redownload files.
          </p>
        </div>

        {/* Search Box */}
        <div className="max-w-md mx-auto mb-16">
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="email" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#111] border border-white/10 p-4 pl-12 rounded-xl text-white outline-none focus:border-[#d4af37] transition-colors"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <button 
              type="submit"
              disabled={loading || !email}
              className="absolute right-2 top-2 bottom-2 bg-[#d4af37] hover:bg-white text-black font-bold px-4 rounded-lg transition-colors disabled:opacity-50 text-xs uppercase tracking-wider"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Access"}
            </button>
          </form>
          {error && (
            <div className="flex items-center gap-2 justify-center mt-4 text-red-400 text-xs">
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>

        {/* Results Grid */}
        {books && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/5">
               <h3 className="text-white font-serif text-xl">Found {books.length} Item{books.length !== 1 && 's'}</h3>
            </div>

            {books.length === 0 ? (
               // --- NEW: Better "Empty State" UI ---
               <div className="text-center py-16 border border-dashed border-white/10 rounded-xl bg-white/5">
                 <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                    <BookOpen size={24} />
                 </div>
                 <h3 className="text-lg font-serif text-white mb-2">No library found</h3>
                 <p className="text-gray-500 text-sm max-w-xs mx-auto mb-8">
                   We couldn't find any purchased books for <span className="text-white font-mono">{email}</span>.
                 </p>
                 <Link href="/shop" className="inline-flex items-center gap-2 bg-[#d4af37] text-black px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors">
                    <ShoppingBag size={16} /> Browse Store
                 </Link>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {books.map((book) => (
                  <div key={book._id} className="bg-[#111] border border-white/5 p-4 rounded-xl flex items-center gap-6 group hover:border-[#d4af37]/30 transition-colors">
                    
                    {/* Image */}
                    <div className="w-20 h-28 bg-black rounded-lg overflow-hidden border border-white/10 flex-shrink-0 relative">
                       {book.image ? (
                         <Image src={book.image} alt={book.title} fill className="object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-700">
                           <BookOpen size={24} />
                         </div>
                       )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <h4 className="text-lg font-serif text-white mb-1">{book.title}</h4>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">
                        Purchased: {new Date(book.purchasedDate).toLocaleDateString()}
                      </p>
                      
                      {book.fileUrl ? (
                        <button 
                          onClick={() => handleDownload(book.fileUrl, book.title)}
                          disabled={downloading === book.title}
                          className="inline-flex items-center gap-2 text-[#d4af37] text-xs font-bold uppercase tracking-widest hover:text-white transition-colors border border-[#d4af37]/20 px-4 py-2 rounded-lg hover:bg-[#d4af37] hover:text-black disabled:opacity-50"
                        >
                          {downloading === book.title ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
                          <span>{downloading === book.title ? "Saving..." : "Download PDF"}</span>
                        </button>
                      ) : (
                        <span className="text-xs text-red-500">File Unavailable</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
      </div>
    </div>
  );
}