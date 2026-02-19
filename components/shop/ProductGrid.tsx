"use client";

import { useState } from "react";
import Book3D from "@/components/ui/Book3D";
import { useCart } from "@/store/cart";
import { Video, BookOpen, Music, Package } from "lucide-react";

export default function ProductGrid({ products }: { products: any[] }) {
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'audio' | 'ebook'>('all');

  const filtered = products.filter(p => {
    const type = p.productType || 'ebook';
    return activeTab === 'all' || type === activeTab;
  });

  return (
    <div>
      {/* NETFLIX TABS */}
      <div className="flex justify-center mb-8 md:mb-12">
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
                    className={`flex items-center gap-1.5 md:gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${
                        activeTab === tab.id 
                        ? "bg-gold text-black shadow-md" 
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    }`}
                >
                    <tab.icon size={14} className="md:w-4 md:h-4" />
                    <span className="hidden md:inline">{tab.label}</span>
                </button>
            ))}
        </div>
      </div>

      {/* 4-COLUMN DESKTOP / 2-COLUMN MOBILE GRID */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-2xl">
            No resources found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8 lg:gap-10">
          {filtered.map((product) => (
            <Book3D key={product._id} book={product} addItem={addItem} currency="NGN" />
          ))}
        </div>
      )}
    </div>
  );
}