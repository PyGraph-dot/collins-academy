"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, DollarSign, Package, ExternalLink } from "lucide-react";
import Link from "next/link";
// FIX: Import CartItem instead of Product
import { CartItem } from "@/store/cart"; 

export default function AdminDashboard() {
  // FIX: Use CartItem[] here too
  const [products, setProducts] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchProducts(); // Refresh list
    } catch (error) {
      alert("Failed to delete");
    }
  }

  if (loading) return <div className="p-10 text-white">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-serif text-white">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your books and products</p>
          </div>
          
          <Link 
            href="/admin/add" 
            className="flex items-center gap-2 bg-[#d4af37] text-black px-6 py-3 rounded-full font-bold hover:bg-white transition-colors"
          >
            <Plus size={18} /> Add New Product
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#111] p-6 rounded-xl border border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><Package /></div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider">Total Products</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#111] p-6 rounded-xl border border-white/10">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-green-500/10 rounded-lg text-green-400"><DollarSign /></div>
               <div>
                 <p className="text-gray-400 text-xs uppercase tracking-wider">Active</p>
                 <p className="text-2xl font-bold">{products.length}</p>
               </div>
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
                        <div className="w-12 h-16 bg-gray-800 rounded overflow-hidden">
                          {product.image ? (
                            <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs">IMG</div>
                          )}
                        </div>
                        <span className="font-medium">{product.title}</span>
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