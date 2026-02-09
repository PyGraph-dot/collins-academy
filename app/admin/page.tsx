"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, DollarSign, Package } from "lucide-react";
import Link from "next/link";
import { Product } from "@/store/cart";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Products on Load
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setProducts([]);
        setLoading(false);
      });
  }, []);

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    // Optimistic UI Update
    // We filter out the item whether it uses 'id' or '_id'
    setProducts(products.filter((p) => (p._id || p.id) !== id));

    // Send delete request
    await fetch(`/api/products?id=${id}`, { method: "DELETE" });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 md:p-12">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-serif text-white">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your empire.</p>
        </div>
        <Link href="/admin/add">
          <button className="bg-[#d4af37] text-black font-bold px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-white transition-colors">
            <Plus size={18} /> Add Product
          </button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#111] p-6 rounded-xl border border-white/5">
          <div className="flex items-center gap-4 mb-2 text-gray-400">
            <Package size={20} /> Total Products
          </div>
          <div className="text-3xl font-bold text-white">{products.length}</div>
        </div>
        <div className="bg-[#111] p-6 rounded-xl border border-white/5">
          <div className="flex items-center gap-4 mb-2 text-gray-400">
            <DollarSign size={20} /> Total Revenue
          </div>
          <div className="text-3xl font-bold text-[#d4af37]">$0.00</div>
          <div className="text-xs text-gray-600 mt-1">Stripe & Paystack Connected</div>
        </div>
      </div>

      {/* Products Grid */}
      <h2 className="text-xl font-serif mb-6 text-gray-300">Inventory</h2>
      
      {loading ? (
        <div className="text-gray-500">Loading inventory...</div>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <motion.div 
              key={product._id || product.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#111] p-4 rounded-lg border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-white/20 transition-all"
            >
              {/* Left Side: Image & Text */}
              <div className="flex items-center gap-4">
                {/* Image Preview */}
                <div className="w-12 h-12 bg-gray-800 rounded-md overflow-hidden flex-shrink-0">
                  {product.image ? (
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">IMG</div>
                  )}
                </div>
                
                <div className="min-w-0">
                  <h3 className="font-medium text-white truncate pr-4">{product.title}</h3>
                  <div className="text-xs text-gray-500 flex gap-3 mt-1">
                    <span className="text-[#d4af37]">₦{product.priceNGN?.toLocaleString()}</span>
                    <span>${product.priceUSD}</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Actions (Full width on mobile, auto on desktop) */}
              <div className="flex gap-2 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                <Link href={`/admin/edit/${product._id || product.id}`}>
                  <button className="flex-1 md:flex-none py-2 px-4 text-xs font-bold bg-white/5 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                    <Edit size={14} /> Edit
                  </button>
                </Link>
                <button 
                  onClick={() => deleteProduct(product._id || product.id)}
                  className="flex-1 md:flex-none py-2 px-4 text-xs font-bold bg-red-500/10 rounded text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
          
          {products.length === 0 && (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-xl text-gray-500">
              No products found. Add your first one!
            </div>
          )}
        </div>
      )}
    </div>
  );
}