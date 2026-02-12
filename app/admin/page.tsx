"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Package, ExternalLink, DollarSign, ShoppingBag, Loader2, Mic, Save, CheckCircle, Video, BookOpen, Music, Filter, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; 
import { UploadButton } from "@/lib/uploadthing";

interface Product {
  _id: string;
  title: string;
  priceNGN: number;
  priceUSD: number;
  image: string;
  productType: 'ebook' | 'audio' | 'video';
  fileUrl: string;
  isPublished: boolean;
}

interface Stats {
  totalProducts: number;
  totalRevenue: number;
  totalOrders: number;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, totalRevenue: 0, totalOrders: 0 });
  const [loading, setLoading] = useState(true);
  
  // --- NEW: SMART FILTERS ---
  const [filter, setFilter] = useState<'all' | 'video' | 'audio' | 'ebook'>('all');
  const [search, setSearch] = useState("");

  // --- DAILY DROP STATE ---
  const [dailyWord, setDailyWord] = useState("");
  const [dailyAudio, setDailyAudio] = useState("");
  const [dailySaving, setDailySaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [prodRes, statsRes] = await Promise.all([
        fetch("/api/products", { cache: "no-store" }),
        fetch("/api/admin/stats", { cache: "no-store" })
      ]);

      const prodData = await prodRes.json();
      const statsData = await statsRes.json();

      if (Array.isArray(prodData)) setProducts(prodData);
      if (statsData) setStats(statsData);

    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter((p) => p._id !== id));
        setStats(prev => ({ ...prev, totalProducts: prev.totalProducts - 1 }));
      }
    } catch (error) {
      alert("Error deleting product");
    }
  }

  async function saveDailyDrop() {
    if (!dailyWord || !dailyAudio) return alert("Please enter a word and upload audio.");
    setDailySaving(true);
    try {
        await fetch("/api/daily", {
            method: "POST",
            body: JSON.stringify({ word: dailyWord, audioUrl: dailyAudio })
        });
        alert("Daily Drop Updated!");
        setDailyWord("");
        setDailyAudio("");
    } catch (e) {
        alert("Network Error");
    } finally {
        setDailySaving(false);
    }
  }

  // --- FILTER LOGIC ---
  const filteredProducts = products.filter(product => {
    const matchesType = filter === 'all' || product.productType === filter;
    const matchesSearch = product.title.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <Loader2 className="animate-spin text-[#d4af37]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-serif text-white">Command Center</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your digital empire.</p>
          </div>
          
          <Link 
            href="/admin/add" 
            className="flex items-center gap-2 bg-[#d4af37] text-black px-6 py-3 rounded-full font-bold hover:bg-white transition-colors"
          >
            <Plus size={18} /> New Product
          </Link>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
          {/* Total Products */}
          <div className="bg-[#111] border border-white/10 p-5 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
              <Package size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Library Size</p>
              <h3 className="text-3xl font-serif text-white">{stats.totalProducts}</h3>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-[#111] border border-white/10 p-5 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Total Revenue</p>
              <h3 className="text-3xl font-serif text-white">₦{stats.totalRevenue.toLocaleString()}</h3>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-[#111] border border-white/10 p-5 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 bg-[#d4af37]/10 rounded-full flex items-center justify-center text-[#d4af37]">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Total Students</p>
              <h3 className="text-3xl font-serif text-white">{stats.totalOrders}</h3>
            </div>
          </div>
        </div>

        {/* --- DAILY DROP --- */}
        <div className="mb-12 bg-[#111] border border-[#d4af37]/30 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 blur-[80px] rounded-full pointer-events-none" />
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#d4af37]/10 rounded-full text-[#d4af37]"><Mic size={24} /></div>
                <h2 className="text-xl font-serif text-white">Daily Pronunciation</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500">Word</label>
                    <input value={dailyWord} onChange={(e) => setDailyWord(e.target.value)} placeholder="e.g. Entrepreneur" className="w-full bg-black border border-white/10 p-3 rounded-lg outline-none focus:border-[#d4af37]" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500">Audio</label>
                    {dailyAudio ? (
                        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 p-3 rounded-lg text-green-500 text-sm"><CheckCircle size={16} /> Uploaded <button onClick={() => setDailyAudio("")} className="ml-auto underline">Change</button></div>
                    ) : (
                        <div className="bg-black border border-white/10 rounded-lg p-1"><UploadButton endpoint="productFile" onClientUploadComplete={(res) => setDailyAudio(res[0].url)} /></div>
                    )}
                </div>
                <button onClick={saveDailyDrop} disabled={dailySaving} className="h-[50px] bg-[#d4af37] text-black font-bold rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2">{dailySaving ? <Loader2 className="animate-spin" /> : "Publish"}</button>
            </div>
        </div>

        {/* --- SMART FILTERS & SEARCH --- */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#111] border border-white/10 rounded-xl text-white focus:border-[#d4af37] outline-none transition-colors"
                />
            </div>

            {/* Filter Tabs */}
            <div className="flex bg-[#111] p-1 rounded-xl border border-white/10">
                {[
                    { id: 'all', label: 'All Assets', icon: Package },
                    { id: 'video', label: 'Courses', icon: Video },
                    { id: 'audio', label: 'Audio', icon: Music },
                    { id: 'ebook', label: 'Books', icon: BookOpen },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                            filter === tab.id 
                            ? "bg-[#d4af37] text-black shadow-lg" 
                            : "text-gray-500 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        <tab.icon size={14} />
                        <span className="hidden md:inline">{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* --- FILTERED PRODUCTS TABLE --- */}
        <div className="hidden md:block bg-[#111] rounded-xl border border-white/10 overflow-hidden min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-xs uppercase">
                <th className="p-4">Content</th>
                <th className="p-4">Type</th>
                <th className="p-4">Price</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredProducts.length === 0 ? (
                  <tr><td colSpan={4} className="p-10 text-center text-gray-500">No matching products found.</td></tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-14 bg-gray-800 rounded overflow-hidden relative border border-white/5">
                          {product.image ? <Image src={product.image} alt={product.title} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">IMG</div>}
                        </div>
                        <span className="font-medium text-white">{product.title}</span>
                      </div>
                    </td>
                    <td className="p-4">
                        {/* VISUAL BADGES */}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border
                            ${product.productType === 'video' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                              product.productType === 'audio' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                              'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                            {product.productType === 'video' && <Video size={10} />}
                            {product.productType === 'audio' && <Music size={10} />}
                            {product.productType === 'ebook' && <BookOpen size={10} />}
                            {product.productType === 'ebook' ? 'PDF Guide' : product.productType === 'video' ? 'Course' : 'Audio'}
                        </span>
                    </td>
                    <td className="p-4 font-mono text-gray-300">₦{product.priceNGN.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {product.fileUrl && (
                          <a href={product.fileUrl} target="_blank" className="p-2 text-blue-400 hover:bg-blue-400/10 rounded transition" title="Preview"><ExternalLink size={16} /></a>
                        )}
                        <Link href={`/admin/edit/${product._id}`} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition"><Edit size={16} /></Link>
                        <button onClick={() => deleteProduct(product._id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded transition"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}