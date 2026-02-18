"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Package, ExternalLink, DollarSign, ShoppingBag, Loader2, Mic, Save, CheckCircle, Video, BookOpen, Music, Search } from "lucide-react";
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
  const [filter, setFilter] = useState<'all' | 'video' | 'audio' | 'ebook'>('all');
  const [search, setSearch] = useState("");

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

  // POLY-FORMAT FIX: Treat legacy "undefined" items as ebooks so they don't disappear
  const filteredProducts = products.filter(product => {
    const type = product.productType || 'ebook'; 
    const matchesType = filter === 'all' || type === filter;
    const matchesSearch = product.title.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><Loader2 className="animate-spin text-[#d4af37]" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div><h1 className="text-3xl font-serif text-white">Command Center</h1><p className="text-gray-400 text-sm mt-1">Manage your digital empire.</p></div>
          <Link href="/admin/add" className="flex items-center gap-2 bg-[#d4af37] text-black px-6 py-3 rounded-full font-bold hover:bg-white transition-colors"><Plus size={18} /> New Product</Link>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12">
          <div className="bg-[#111] border border-white/10 p-5 rounded-xl flex items-center gap-4"><div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500"><Package size={24} /></div><div><p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Library Size</p><h3 className="text-3xl font-serif text-white">{stats.totalProducts}</h3></div></div>
          <div className="bg-[#111] border border-white/10 p-5 rounded-xl flex items-center gap-4"><div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-500"><DollarSign size={24} /></div><div><p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Total Revenue</p><h3 className="text-3xl font-serif text-white">₦{stats.totalRevenue.toLocaleString()}</h3></div></div>
          <div className="bg-[#111] border border-white/10 p-5 rounded-xl flex items-center gap-4"><div className="w-12 h-12 bg-[#d4af37]/10 rounded-full flex items-center justify-center text-[#d4af37]"><ShoppingBag size={24} /></div><div><p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Total Students</p><h3 className="text-3xl font-serif text-white">{stats.totalOrders}</h3></div></div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-[#111] border border-white/10 rounded-xl text-white focus:border-[#d4af37] outline-none transition-colors"/>
            </div>
            <div className="flex overflow-x-auto bg-[#111] p-1 rounded-xl border border-white/10 hide-scrollbar">
                {[{ id: 'all', label: 'All', icon: Package }, { id: 'video', label: 'Courses', icon: Video }, { id: 'audio', label: 'Audio', icon: Music }, { id: 'ebook', label: 'Books', icon: BookOpen }].map((tab) => (
                    <button key={tab.id} onClick={() => setFilter(tab.id as any)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all ${filter === tab.id ? "bg-[#d4af37] text-black" : "text-gray-500 hover:text-white hover:bg-white/5"}`}><tab.icon size={14} /><span>{tab.label}</span></button>
                ))}
            </div>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block bg-[#111] rounded-xl border border-white/10 overflow-hidden min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead><tr className="bg-white/5 text-gray-400 text-xs uppercase"><th className="p-4">Content</th><th className="p-4">Type</th><th className="p-4">Price</th><th className="p-4 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-white/10">
              {filteredProducts.map((product) => {
                  const type = product.productType || 'ebook';
                  return (
                  <tr key={product._id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4"><div className="flex items-center gap-4"><div className="w-10 h-14 bg-gray-800 rounded overflow-hidden relative border border-white/5">{product.image ? <Image src={product.image} alt={product.title} fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">IMG</div>}</div><span className="font-medium text-white">{product.title}</span></div></td>
                    <td className="p-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${type === 'video' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : type === 'audio' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>{type === 'video' && <Video size={10} />}{type === 'audio' && <Music size={10} />}{type === 'ebook' && <BookOpen size={10} />}{type}</span></td>
                    <td className="p-4 font-mono text-gray-300">₦{product.priceNGN.toLocaleString()}</td>
                    <td className="p-4 text-right"><div className="flex items-center justify-end gap-2">{product.fileUrl && (<a href={product.fileUrl} target="_blank" className="p-2 text-blue-400 hover:bg-blue-400/10 rounded transition" title="Preview"><ExternalLink size={16} /></a>)}<Link href={`/admin/edit/${product._id}`} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition"><Edit size={16} /></Link><button onClick={() => deleteProduct(product._id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded transition"><Trash2 size={16} /></button></div></td>
                  </tr>
                )})}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS (THE FIX) */}
        <div className="md:hidden space-y-4">
          {filteredProducts.length === 0 ? (
             <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-xl">No products found.</div>
          ) : (
            filteredProducts.map((product) => {
              const type = product.productType || 'ebook';
              return (
              <div key={product._id} className="bg-[#111] border border-white/10 rounded-xl p-4 flex gap-4">
                 <div className="w-20 h-28 bg-black rounded-lg overflow-hidden border border-white/5 flex-shrink-0 relative">
                     {product.image && <Image src={product.image} alt={product.title} fill className="object-cover" />}
                 </div>
                 <div className="flex-1 flex flex-col justify-between">
                    <div>
                       <div className="flex justify-between items-start mb-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide ${type === 'video' ? 'bg-purple-500/10 text-purple-400' : type === 'audio' ? 'bg-blue-500/10 text-blue-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{type}</span>
                       </div>
                       <h3 className="font-serif text-white text-sm leading-tight mb-2 line-clamp-2">{product.title}</h3>
                       <div className="text-xs text-gray-400 font-mono">₦{product.priceNGN.toLocaleString()}</div>
                    </div>
                    <div className="flex gap-2 mt-3">
                       <Link href={`/admin/edit/${product._id}`} className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2"><Edit size={14} /> Edit</Link>
                       <button onClick={() => deleteProduct(product._id)} className="bg-red-500/10 text-red-400 py-2 px-3 rounded-lg"><Trash2 size={14} /></button>
                    </div>
                 </div>
              </div>
            )})
          )}
        </div>

      </div>
    </div>
  );
}