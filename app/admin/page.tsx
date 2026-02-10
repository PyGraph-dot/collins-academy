"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Package, ExternalLink, DollarSign, ShoppingBag, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; 

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
  totalRevenue: number; // <--- Changed from activeProducts
  totalOrders: number;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, totalRevenue: 0, totalOrders: 0 });
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <Loader2 className="animate-spin text-[#d4af37]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-serif text-white">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your books and products</p>
          </div>
          
          <Link 
            href="/admin/new" 
            className="flex items-center gap-2 bg-[#d4af37] text-black px-6 py-3 rounded-full font-bold hover:bg-white transition-colors"
          >
            <Plus size={18} /> Add New Product
          </Link>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Total Products */}
          <div className="bg-[#111] border border-white/10 p-6 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
              <Package size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Total Products</p>
              <h3 className="text-3xl font-serif text-white">{stats.totalProducts}</h3>
            </div>
          </div>

          {/* Card 2: Revenue (UPDATED) */}
          <div className="bg-[#111] border border-white/10 p-6 rounded-xl flex items-center gap-4">
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

          {/* Card 3: Total Orders */}
          <div className="bg-[#111] border border-white/10 p-6 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 bg-[#d4af37]/10 rounded-full flex items-center justify-center text-[#d4af37]">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold tracking-widest uppercase">Total Orders</p>
              <h3 className="text-3xl font-serif text-white">{stats.totalOrders}</h3>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-[#111] rounded-xl border border-white/10 overflow-hidden">
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
                        <div className="w-12 h-16 bg-gray-800 rounded overflow-hidden relative">
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
      </div>
    </div>
  );
}