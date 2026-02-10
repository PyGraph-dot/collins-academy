"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // We use redirect: false so the page doesn't refresh, allowing us to catch errors
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, 
      });

      if (result?.error) {
        alert("Login Failed: " + result.error); // <--- THIS WILL TELL US THE REASON
        setLoading(false);
      } else if (result?.ok) {
        // Success! Go to Admin
        router.push("/admin");
        router.refresh();
      } else {
        alert("Unknown error occurred.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("System Error. Check console.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#111] border border-white/10 p-8 rounded-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#d4af37]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#d4af37]">
            <Lock size={24} />
          </div>
          <h1 className="text-2xl font-serif text-white">Admin Access</h1>
          <p className="text-gray-500 text-sm mt-2">Restricted area. Authorized personnel only.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-500 mb-2 block">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 p-3 rounded text-white focus:border-[#d4af37] outline-none transition-colors"
              placeholder="admin@collins.com"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-gray-500 mb-2 block">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 p-3 rounded text-white focus:border-[#d4af37] outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#d4af37] hover:bg-white text-black font-bold py-3 rounded transition-colors flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Enter Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}