"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, UploadCloud, X, CheckCircle, Video, BookOpen, Music, ChevronRight } from "lucide-react";
import Link from "next/link";
import { UploadButton } from "@/lib/uploadthing";

// Define the steps for the Wizard
const STEPS = [
  { id: 1, name: "Type" },
  { id: 2, name: "Media" },
  { id: 3, name: "Details" },
];

export default function AddProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1, 2, or 3
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priceNGN: "",
    priceUSD: "",
    image: "",      
    fileUrl: "",    
    productType: "ebook", // Default
    duration: "",         // e.g. "150 pages" or "2h 30m"
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.fileUrl || !formData.image) {
        alert("Please fill in all required fields and uploads.");
        return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          priceNGN: Number(formData.priceNGN),
          priceUSD: Number(formData.priceUSD),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Product Created Successfully!");
        router.push("/admin");
      } else {
        alert(`Failed: ${data.error || data.details}`);
      }
    } catch (error) {
      alert("Network Error");
    } finally {
      setLoading(false);
    }
  };

  // Helper to Render Step Indicators
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-4 mb-8">
        {STEPS.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= s.id ? "bg-[#d4af37] text-black" : "bg-white/10 text-gray-500"}`}>
                    {step > s.id ? <CheckCircle size={14} /> : s.id}
                </div>
                <span className={`text-xs uppercase tracking-widest ${step >= s.id ? "text-white" : "text-gray-600"}`}>{s.name}</span>
                {s.id !== 3 && <div className="w-8 h-px bg-white/10" />}
            </div>
        ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 flex flex-col items-center">
      
      {/* HEADER */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-8">
         <Link href="/admin" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={18} /> <span className="text-sm">Cancel</span>
         </Link>
         <h1 className="font-serif text-xl">New Product Wizard</h1>
         <div className="w-16" /> {/* Spacer */}
      </div>

      <StepIndicator />

      <div className="w-full max-w-2xl bg-[#111] border border-white/10 rounded-2xl p-8 shadow-2xl">
        
        {/* === STEP 1: PRODUCT TYPE === */}
        {step === 1 && (
            <div className="space-y-6">
                <h2 className="text-2xl font-serif text-center mb-6">What are you creating?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { id: 'ebook', icon: BookOpen, label: "E-Book (PDF)" },
                        { id: 'audio', icon: Music, label: "Audio Drill" },
                        { id: 'video', icon: Video, label: "Video Course" }
                    ].map((type) => (
                        <button 
                            key={type.id}
                            onClick={() => setFormData({...formData, productType: type.id})}
                            className={`p-6 rounded-xl border flex flex-col items-center gap-3 transition-all ${formData.productType === type.id ? "border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]" : "border-white/10 hover:bg-white/5 text-gray-400"}`}
                        >
                            <type.icon size={32} />
                            <span className="text-sm font-bold uppercase tracking-widest">{type.label}</span>
                        </button>
                    ))}
                </div>
                <button onClick={() => setStep(2)} className="w-full mt-4 bg-white text-black font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors">
                    Next Step <ChevronRight size={18} />
                </button>
            </div>
        )}

        {/* === STEP 2: UPLOADS === */}
        {step === 2 && (
            <div className="space-y-6">
                <h2 className="text-2xl font-serif text-center mb-6">Upload Assets</h2>
                
                {/* Cover Image */}
                <div className="bg-black/40 border border-dashed border-white/20 rounded-xl p-6 text-center">
                    <label className="block text-xs uppercase tracking-wider text-[#d4af37] mb-4">1. Cover Image</label>
                    {formData.image ? (
                        <div className="relative w-32 h-40 mx-auto">
                            <img src={formData.image} className="w-full h-full object-cover rounded-lg border border-white/20" />
                            <button onClick={() => setFormData({...formData, image: ""})} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"><X size={12}/></button>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <UploadButton endpoint="productImage" onClientUploadComplete={(res) => setFormData({...formData, image: res[0].url})} />
                        </div>
                    )}
                </div>

                {/* Digital File */}
                <div className="bg-black/40 border border-dashed border-white/20 rounded-xl p-6 text-center">
                    <label className="block text-xs uppercase tracking-wider text-[#d4af37] mb-4">
                        2. The {formData.productType === 'video' ? 'Video File' : formData.productType === 'audio' ? 'Audio File' : 'PDF File'}
                    </label>
                    {formData.fileUrl ? (
                        <div className="flex items-center justify-center gap-3 bg-green-500/10 p-4 rounded-lg border border-green-500/20 text-green-500">
                             <CheckCircle size={20} /> File Uploaded Successfully
                             <button onClick={() => setFormData({...formData, fileUrl: ""})} className="ml-2 hover:text-white"><X size={16}/></button>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                             <UploadButton endpoint="productFile" onClientUploadComplete={(res) => setFormData({...formData, fileUrl: res[0].url})} />
                        </div>
                    )}
                </div>

                <div className="flex gap-4 mt-4">
                    <button onClick={() => setStep(1)} className="flex-1 py-4 text-gray-400 hover:text-white">Back</button>
                    <button onClick={() => setStep(3)} className="flex-[2] bg-white text-black font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200">
                        Next: Details <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        )}

        {/* === STEP 3: DETAILS & PRICING === */}
        {step === 3 && (
            <div className="space-y-4">
                <h2 className="text-2xl font-serif text-center mb-6">Final Details</h2>
                
                <div>
                    <label className="text-xs text-gray-500 uppercase">Product Title</label>
                    <input 
                        value={formData.title} // CONTROLLED INPUT
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full bg-[#0a0a0a] border border-white/10 p-4 rounded-lg mt-2 focus:border-[#d4af37] outline-none"
                        placeholder="e.g. British Accent Masterclass"
                    />
                </div>

                <div>
                    <label className="text-xs text-gray-500 uppercase">Description</label>
                    <textarea 
                        value={formData.description} // CONTROLLED INPUT
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={4}
                        className="w-full bg-[#0a0a0a] border border-white/10 p-4 rounded-lg mt-2 focus:border-[#d4af37] outline-none"
                        placeholder="What will students learn?"
                    />
                </div>

                {/* Dynamic Metadata Field */}
                <div>
                     <label className="text-xs text-gray-500 uppercase">
                        {formData.productType === 'ebook' ? 'Number of Pages' : 'Duration (Minutes)'}
                     </label>
                     <input 
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        className="w-full bg-[#0a0a0a] border border-white/10 p-4 rounded-lg mt-2 focus:border-[#d4af37] outline-none"
                        placeholder={formData.productType === 'ebook' ? "e.g. 150 Pages" : "e.g. 45 Mins"}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-500 uppercase">Price (NGN)</label>
                        <input type="number" value={formData.priceNGN} onChange={(e) => setFormData({...formData, priceNGN: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 p-4 rounded-lg mt-2 focus:border-[#d4af37] outline-none" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 uppercase">Price (USD)</label>
                        <input type="number" value={formData.priceUSD} onChange={(e) => setFormData({...formData, priceUSD: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 p-4 rounded-lg mt-2 focus:border-[#d4af37] outline-none" />
                    </div>
                </div>

                <div className="flex gap-4 mt-6">
                    <button onClick={() => setStep(2)} className="flex-1 py-4 text-gray-400 hover:text-white">Back</button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={loading} 
                        className="flex-[2] bg-[#d4af37] text-black font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-white transition-colors"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : "Publish Product"}
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}