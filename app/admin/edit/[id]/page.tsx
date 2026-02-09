"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, Save, UploadCloud, X } from "lucide-react";
import Link from "next/link";
import { UploadButton } from "@/lib/uploadthing"; // Import UploadThing

export default function EditProduct() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priceNGN: "",
    priceUSD: "",
    image: "",
    fileUrl: "", // Stores the PDF/Audio file
    category: "book",
  });

  // 1. Fetch Existing Data
  useEffect(() => {
    fetch(`/api/products?id=${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          ...data,
          priceNGN: data.priceNGN || "",
          priceUSD: data.priceUSD || "",
          fileUrl: data.fileUrl || "" // Ensure it doesn't crash if empty
        });
        setLoading(false);
      })
      .catch((err) => alert("Failed to load product"));
  }, [params.id]);

  // 2. Handle Update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const res = await fetch(`/api/products?id=${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        priceNGN: Number(formData.priceNGN),
        priceUSD: Number(formData.priceUSD),
      }),
    });

    if (res.ok) {
      alert("Product Updated!");
      router.push("/admin");
    } else {
      alert("Update failed.");
    }
    setSaving(false);
  };

  if (loading) return <div className="p-12 text-white text-center">Loading product...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 md:p-12 flex justify-center">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-serif">Edit Product</h1>
        </div>

        <form onSubmit={handleUpdate} className="space-y-8">
          
          {/* Title & Description */}
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-500">Title</label>
              <input 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-[#111] border border-white/10 p-4 rounded-lg mt-2 text-white"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-500">Description</label>
              <textarea 
                value={formData.description} 
                rows={4}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-[#111] border border-white/10 p-4 rounded-lg mt-2 text-white"
              />
            </div>
          </div>

          {/* COVER IMAGE */}
          <div className="bg-[#111] border border-dashed border-white/20 rounded-xl p-6">
            <label className="block text-xs uppercase tracking-wider text-[#d4af37] mb-4">Cover Image</label>
            
            {formData.image ? (
              <div className="relative w-fit group">
                <img src={formData.image} alt="Cover" className="h-32 rounded-lg border border-white/10" />
                {/* Delete Button */}
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, image: ""})}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:scale-110 transition-transform"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <UploadButton
                endpoint="productImage"
                onClientUploadComplete={(res) => {
                  setFormData({ ...formData, image: res[0].url });
                }}
                onUploadError={(error: Error) => alert(`Error: ${error.message}`)}
                appearance={{
                  button: "bg-white/10 text-white hover:bg-[#d4af37] hover:text-black transition-all px-4 py-2 text-sm"
                }}
              />
            )}
          </div>

          {/* DIGITAL FILE */}
          <div className="bg-[#111] border border-dashed border-white/20 rounded-xl p-6">
            <label className="block text-xs uppercase tracking-wider text-[#d4af37] mb-4">
              Digital File (PDF / Audio)
            </label>
            
            {formData.fileUrl ? (
              <div className="flex items-center gap-3 bg-green-500/10 p-3 rounded-lg border border-green-500/20 text-green-500 text-sm">
                <UploadCloud size={16} /> 
                <span className="truncate max-w-[200px]">{formData.fileUrl.split('/').pop()}</span>
                <span className="text-xs opacity-50 ml-2">(File Active)</span>
                
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, fileUrl: ""})} 
                  className="ml-auto hover:text-white bg-black/20 p-1 rounded-full"
                >
                  <X size={14}/>
                </button>
              </div>
            ) : (
              <UploadButton
                endpoint="productFile"
                onClientUploadComplete={(res) => {
                  setFormData({ ...formData, fileUrl: res[0].url });
                  alert("New File Uploaded!");
                }}
                onUploadError={(error: Error) => alert(`Error: ${error.message}`)}
                appearance={{
                  button: "bg-white/10 text-white hover:bg-[#d4af37] hover:text-black transition-all px-4 py-2 text-sm"
                }}
              />
            )}
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-xs text-gray-500">Price (NGN)</label>
              <input 
                type="number" 
                value={formData.priceNGN} 
                onChange={(e) => setFormData({...formData, priceNGN: e.target.value})}
                className="w-full bg-[#111] border border-white/10 p-4 rounded-lg mt-2 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Price (USD)</label>
              <input 
                type="number" 
                value={formData.priceUSD} 
                onChange={(e) => setFormData({...formData, priceUSD: e.target.value})}
                className="w-full bg-[#111] border border-white/10 p-4 rounded-lg mt-2 text-white"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-[#d4af37] text-black font-bold py-4 rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}