"use client";

import { useState } from "react";
import Book3D from "@/components/ui/Book3D";
import { useCart } from "@/store/cart";
import { Video, BookOpen, Music, Package } from "lucide-react";

export default function ProductGrid({ products }: { products: any[] }) {
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'audio' | 'ebook'>('all');

  // Intelligent filter that respects legacy files (undefined = ebook)
  const filtered = products.filter(p => {
    const type = p.productType || 'ebook';
    return activeTab === 'all' || type === activeTab;
  });

  return (
    <div>
      {/* NETFLIX TABS */}
      <div className="flex justify-center mb-12">
        <div className="flex bg-card p-1.5 rounded-full border border-border shadow-sm overflow-x-auto hide-scrollbar max-w-full">
            {[
                { id: 'all', label: 'All Resources', icon: Package },
                { id: 'video', label: 'Masterclasses', icon: Video },
                { id: 'audio', label: 'Audio Drills', icon: Music },
                { id: 'ebook', label: 'PDF Guides', icon: BookOpen },
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${
                        activeTab === tab.id 
                        ? "bg-gold text-black shadow-md" 
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    }`}
                >
                    <tab.icon size={16} />
                    <span className="hidden md:inline">{tab.label}</span>
                </button>
            ))}
        </div>
      </div>

      {/* DYNAMIC GRID */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-2xl">
            No resources found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {filtered.map((product) => (
            <Book3D key={product._id} book={product} addItem={addItem} currency="NGN" />
          ))}
        </div>
      )}
    </div>
  );
}