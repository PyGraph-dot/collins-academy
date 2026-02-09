"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, UploadCloud, X } from "lucide-react";
import Link from "next/link";
import { UploadButton } from "@/lib/uploadthing"; // IMPORT THIS

export default function AddProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priceNGN: "",
    priceUSD: "",
    image: "",      // This will now store the Uploaded URL
    fileUrl: "",    // This stores the actual Book/Audio URL
    category: "book",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          priceNGN: Number(formData.priceNGN),
          priceUSD: Number(formData.priceUSD),
          isPublished: true
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Product Created Successfully!");
        router.push("/admin");
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (error) {
      alert("Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 md:p-12 flex justify-center">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="p-2 hover:bg-white/10 rounded-full transition-colors"><ArrowLeft size={20} /></Link>
          <h1 className="text-2xl font-serif">Add New Product</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. PRODUCT DETAILS */}
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-500">Title</label>
              <input 
                required 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-[#111] border border-white/10 p-4 rounded-lg mt-2"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-500">Description</label>
              <textarea 
                required rows={3}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-[#111] border border-white/10 p-4 rounded-lg mt-2"
              />
            </div>
          </div>

          {/* 2. UPLOAD COVER IMAGE */}
          <div className="bg-[#111] border border-dashed border-white/20 rounded-xl p-6">
            <label className="block text-xs uppercase tracking-wider text-[#d4af37] mb-4">Cover Image (Required)</label>
            
            {formData.image ? (
              <div className="relative w-fit">
                <img src={formData.image} alt="Cover" className="h-32 rounded-lg border border-white/10" />
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, image: ""})}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <UploadButton
                endpoint="productImage"
                onClientUploadComplete={(res) => {
                  setFormData({ ...formData, image: res[0].url });
                  alert("Image Uploaded!");
                }}
                onUploadError={(error: Error) => alert(`Error: ${error.message}`)}
                appearance={{
                  button: "bg-white/10 text-white hover:bg-[#d4af37] hover:text-black transition-all px-4 py-2 text-sm"
                }}
              />
            )}
          </div>

          {/* 3. UPLOAD DIGITAL FILE */}
          <div className="bg-[#111] border border-dashed border-white/20 rounded-xl p-6">
            <label className="block text-xs uppercase tracking-wider text-[#d4af37] mb-4">
              Digital File (PDF / MP3 / Video)
            </label>
            
            {formData.fileUrl ? (
              <div className="flex items-center gap-3 bg-green-500/10 p-3 rounded-lg border border-green-500/20 text-green-500 text-sm">
                <UploadCloud size={16} /> File Ready to Sell
                <button type="button" onClick={() => setFormData({...formData, fileUrl: ""})} className="ml-auto hover:text-white"><X size={16}/></button>
              </div>
            ) : (
              <UploadButton
                endpoint="productFile"
                onClientUploadComplete={(res) => {
                  setFormData({ ...formData, fileUrl: res[0].url });
                  alert("File Uploaded Successfully!");
                }}
                onUploadError={(error: Error) => alert(`Error: ${error.message}`)}
                appearance={{
                  button: "bg-white/10 text-white hover:bg-[#d4af37] hover:text-black transition-all px-4 py-2 text-sm"
                }}
              />
            )}
          </div>

          {/* 4. PRICING & CATEGORY */}
          <div className="grid grid-cols-2 gap-6">
             <div>
              <label className="text-xs text-gray-500">Price (NGN)</label>
              <input type="number" required onChange={(e) => setFormData({...formData, priceNGN: e.target.value})} className="w-full bg-[#111] border border-white/10 p-4 rounded-lg mt-2"/>
             </div>
             <div>
              <label className="text-xs text-gray-500">Price (USD)</label>
              <input type="number" required onChange={(e) => setFormData({...formData, priceUSD: e.target.value})} className="w-full bg-[#111] border border-white/10 p-4 rounded-lg mt-2"/>
             </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#d4af37] text-black font-bold py-4 rounded-lg hover:bg-white transition-colors">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : "Create Product"}
          </button>

        </form>
      </div>
    </div>
  );
}