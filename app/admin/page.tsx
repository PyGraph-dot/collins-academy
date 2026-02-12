"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Package, ExternalLink, DollarSign, ShoppingBag, Loader2, Mic, Save, CheckCircle, Video, BookOpen, Music } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; 
import { UploadButton } from "@/lib/uploadthing";

// Define the shape of our new "Academy Product"
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

  // --- SAVE DAILY DROP ---
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
            <h1 className="text-3xl font-serif text-white">Academy Command Center</h1>
            <p className="text-gray-400 text-sm mt-1">Manage Courses, Audios & Ebooks</p>
          </div>
          
          <Link 
            href="/admin/add" 
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#d4af37] text-black px-6 py-3 rounded-xl md:rounded-full font-bold hover:bg-white transition-colors"
          >
            <Plus size={18} /> Create New Product
          </Link>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
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
              <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Students Enrolled</p>
              <h3 className="text-3xl font-serif text-white">{stats.totalOrders}</h3>
            </div>
          </div>
        </div>

        {/* --- DAILY DROP MANAGER --- */}
        <div className="mb-12 bg-[#111] border border-[#d4af37]/30 rounded-xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#d4af37]/10 rounded-full text-[#d4af37]">
                    <Mic size={24} />
                </div>
                <h2 className="text-xl font-serif text-white">Daily Pronunciation Drill</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500">Word of the Day</label>
                    <input 
                        value={dailyWord}
                        onChange={(e) => setDailyWord(e.target.value)}
                        placeholder="e.g. Entrepreneur"
                        className="w-full bg-black border border-white/10 p-3 rounded-lg outline-none focus:border-[#d4af37] transition-colors"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500">Audio File (MP3)</label>
                    {dailyAudio ? (
                        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 p-3 rounded-lg text-green-500 text-sm">
                            <CheckCircle size={16} />
                            <span className="truncate max-w-[150px]">Audio Uploaded</span>
                            <button onClick={() => setDailyAudio("")} className="ml-auto text-xs underline hover:text-white">Change</button>
                        </div>
                    ) : (
                        <div className="bg-black border border-white/10 rounded-lg p-1">
                             <UploadButton
                                endpoint="productFile"
                                onClientUploadComplete={(res) => setDailyAudio(res[0].url)}
                                onUploadError={(error: Error) => alert(`Error: ${error.message}`)}
                                appearance={{ button: "bg-white/10 text-white hover:bg-[#d4af37] hover:text-black text-xs px-4 py-2" }}
                            />
                        </div>
                    )}
                </div>

                <button 
                    onClick={saveDailyDrop}
                    disabled={dailySaving}
                    className="h-[50px] bg-[#d4af37] text-black font-bold rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2"
                >
                    {dailySaving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Publish to Homepage</>}
                </button>
            </div>
        </div>

        {/* --- PRODUCTS TABLE (DESKTOP) --- */}
        <div className="hidden md:block bg-[#111] rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-400 text-xs uppercase">
                <th className="p-4">Content</th>
                <th className="p-4">Type</th>
                <th className="p-4">Price (NGN)</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {products.map((product) => (
                  <tr key={product._id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 bg-gray-800 rounded overflow-hidden relative border border-white/5">
                          {product.image ? (
                            <Image src={product.image} alt={product.title} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs">IMG</div>
                          )}
                        </div>
                        <span className="font-medium text-white">{product.title}</span>
                      </div>
                    </td>
                    <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide
                            ${product.productType === 'video' ? 'bg-purple-500/10 text-purple-400' : 
                              product.productType === 'audio' ? 'bg-blue-500/10 text-blue-400' : 
                              'bg-yellow-500/10 text-yellow-400'}`}>
                            {product.productType === 'video' && <Video size={12} />}
                            {product.productType === 'audio' && <Music size={12} />}
                            {product.productType === 'ebook' && <BookOpen size={12} />}
                            {product.productType}
                        </span>
                    </td>
                    <td className="p-4 font-mono text-gray-300">₦{product.priceNGN.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {product.fileUrl && (
                          <a href={product.fileUrl} target="_blank" className="p-2 text-blue-400 hover:bg-blue-400/10 rounded transition" title="Preview File">
                            <ExternalLink size={16} />
                          </a>
                        )}
                        <Link href={`/admin/edit/${product._id}`} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => deleteProduct(product._id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded transition">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}