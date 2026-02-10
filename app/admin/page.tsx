"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Package, ExternalLink, DollarSign, ShoppingBag, Loader2, Mic, Save, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; 
import { UploadButton } from "@/lib/uploadthing"; // IMPORT UPLOADTHING

interface Product {
  _id: string;
  title: string;
  priceNGN: number;
  priceUSD: number;
  image: string;
  category: string;
  isPublished: boolean;
  fileUrl?: string;
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
      const res = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts(products.filter((p) => p._id !== id));
        setStats(prev => ({ ...prev, totalProducts: prev.totalProducts - 1 }));
      } else {
        alert("Failed to delete");
      }
    } catch (error) {
      alert("Error deleting product");
    }
  }

  // --- SAVE DAILY DROP FUNCTION ---
  async function saveDailyDrop() {
    if (!dailyWord || !dailyAudio) {
        alert("Please enter a word and upload audio first.");
        return;
    }
    setDailySaving(true);
    try {
        const res = await fetch("/api/daily", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ word: dailyWord, audioUrl: dailyAudio })
        });
        if (res.ok) {
            alert("Daily Drop Updated Successfully!");
            setDailyWord("");
            setDailyAudio("");
        } else {
            alert("Failed to update.");
        }
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
            <h1 className="text-3xl font-serif text-white">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your books and products</p>
          </div>
          
          <Link 
            href="/admin/add" 
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#d4af37] text-black px-6 py-3 rounded-xl md:rounded-full font-bold hover:bg-white transition-colors"
          >
            <Plus size={18} /> Add New Product
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
              <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Total Products</p>
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
              <h3 className="text-3xl font-serif text-white">
                 ₦{stats.totalRevenue.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-[#111] border border-white/10 p-5 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 bg-[#d4af37]/10 rounded-full flex items-center justify-center text-[#d4af37]">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Total Orders</p>
              <h3 className="text-3xl font-serif text-white">{stats.totalOrders}</h3>
            </div>
          </div>
        </div>

        {/* --- NEW SECTION: DAILY DROP MANAGER --- */}
        <div className="mb-12 bg-[#111] border border-[#d4af37]/30 rounded-xl p-6 md:p-8 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#d4af37]/10 rounded-full text-[#d4af37]">
                    <Mic size={24} />
                </div>
                <h2 className="text-xl font-serif text-white">Update Daily Pronunciation</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                {/* 1. Word Input */}
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-gray-500">Word of the Day</label>
                    <input 
                        value={dailyWord}
                        onChange={(e) => setDailyWord(e.target.value)}
                        placeholder="e.g. Entrepreneur"
                        className="w-full bg-black border border-white/10 p-3 rounded-lg outline-none focus:border-[#d4af37] transition-colors"
                    />
                </div>

                {/* 2. Audio Upload */}
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
                                endpoint="productFile" // Reusing the same endpoint is fine
                                onClientUploadComplete={(res) => {
                                    setDailyAudio(res[0].url);
                                    alert("Audio Uploaded!");
                                }}
                                onUploadError={(error: Error) => alert(`Error: ${error.message}`)}
                                appearance={{
                                    button: "bg-white/10 text-white hover:bg-[#d4af37] hover:text-black text-xs px-4 py-2"
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* 3. Save Button */}
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
                <th className="p-4">Product</th>
                <th className="p-4">Price (NGN)</th>
                <th className="p-4">Price (USD)</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">No products found. Add your first one!</td>
                </tr>
              ) : (
                products.map((product) => (
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
                    <td className="p-4 font-mono text-gray-300">₦{product.priceNGN.toLocaleString()}</td>
                    <td className="p-4 font-mono text-gray-300">${product.priceUSD}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {product.fileUrl && (
                          <a href={product.fileUrl} target="_blank" className="p-2 text-blue-400 hover:bg-blue-400/10 rounded transition" title="View PDF">
                            <ExternalLink size={16} />
                          </a>
                        )}
                        <Link href={`/admin/edit/${product._id}`} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded transition">
                          <Edit size={16} />
                        </Link>
                        <button 
                          onClick={() => deleteProduct(product._id)}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- MOBILE CARD VIEW --- */}
        <div className="md:hidden space-y-4">
          {products.length === 0 ? (
             <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-xl">No products found.</div>
          ) : (
            products.map((product) => (
              <div key={product._id} className="bg-[#111] border border-white/10 rounded-xl p-4 flex gap-4">
                 <div className="w-20 h-28 bg-black rounded-lg overflow-hidden border border-white/5 flex-shrink-0 relative">
                     {product.image && <Image src={product.image} alt={product.title} fill className="object-cover" />}
                 </div>

                 <div className="flex-1 flex flex-col justify-between">
                    <div>
                       <h3 className="font-serif text-white text-lg leading-tight mb-2 line-clamp-2">{product.title}</h3>
                       <div className="flex gap-3 text-sm text-gray-400 font-mono">
                          <span>₦{product.priceNGN.toLocaleString()}</span>
                          <span className="w-px h-4 bg-gray-700"></span>
                          <span>${product.priceUSD}</span>
                       </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                       <Link href={`/admin/edit/${product._id}`} className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                          <Edit size={14} /> Edit
                       </Link>
                       <button onClick={() => deleteProduct(product._id)} className="bg-red-500/10 text-red-400 py-2 px-3 rounded-lg hover:bg-red-500/20 transition-colors">
                          <Trash2 size={14} />
                       </button>
                    </div>
                 </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}