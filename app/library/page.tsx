"use client";

import { useState } from "react";
import { Search, Loader2, Download, BookOpen, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function LibraryPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<any[] | null>(null);
  const [error, setError] = useState("");

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
        setError("No purchases found for this email.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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
               <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                 <p className="text-gray-500">No books found for this email.</p>
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
                        <a 
                          href={book.fileUrl} 
                          target="_blank" 
                          className="inline-flex items-center gap-2 text-[#d4af37] text-xs font-bold uppercase tracking-widest hover:text-white transition-colors border border-[#d4af37]/20 px-4 py-2 rounded-lg hover:bg-[#d4af37] hover:text-black"
                        >
                          <Download size={14} /> Download PDF
                        </a>
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