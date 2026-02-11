"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Volume2, ArrowRight } from "lucide-react";
import MagneticButton from "@/components/ui/MagneticButton";

const textContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const textItem = {
  hidden: { y: 100, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1, 
    transition: { 
      duration: 1, 
      ease: [0.22, 1, 0.36, 1] as any 
    } 
  },
};

export default function Hero() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [dailyContent, setDailyContent] = useState<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function fetchDaily() {
      try {
        const res = await fetch("/api/daily");
        const data = await res.json();
        if (data && data.audioUrl) {
           setDailyContent(data);
        }
      } catch (err) {
        console.error("Failed to load daily audio");
      }
    }
    fetchDaily();
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current || !dailyContent?.audioUrl) return; 

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  return (
    // UPDATED: Theme variables
    <section className="relative min-h-[100dvh] w-full flex flex-col justify-center items-center overflow-hidden bg-background transition-colors duration-500 py-32">
      {dailyContent && (
        <audio 
           ref={audioRef}
           src={dailyContent.audioUrl} 
           onPlay={() => setIsPlaying(true)}
           onPause={() => setIsPlaying(false)}
           onEnded={() => setIsPlaying(false)}
        />
      )}
      
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-gold opacity-5 blur-[100px] md:blur-[150px] rounded-full" />

      <div className="z-10 text-center px-6 max-w-5xl mx-auto flex flex-col items-center">
        
        <motion.h1 
          variants={textContainer}
          initial="hidden"
          animate="show"
          className="text-5xl md:text-8xl font-serif font-medium leading-[1.1] md:leading-[0.95] tracking-tight text-foreground mb-8 md:mb-10"
        >
          <div className="overflow-hidden"><motion.span variants={textItem} className="block">The Art of</motion.span></div>
          <div className="overflow-hidden"><motion.span variants={textItem} className="block italic text-gold">Articulation.</motion.span></div>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="text-muted-foreground text-base md:text-xl font-sans max-w-md md:max-w-lg mx-auto mb-10 md:mb-12 leading-relaxed"
        >
          Don't just speak. Command the room. <br className="hidden md:block" />
          Join 170,000+ students mastering the nuance of English.
        </motion.p>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="flex flex-col md:flex-row gap-6 md:gap-8 justify-center items-center w-full"
        >
          <MagneticButton>
            <button 
              onClick={toggleAudio}
              className={`group relative flex items-center gap-4 px-2 py-2 pr-6 rounded-full border transition-all duration-500 ${
                isPlaying 
                  ? 'border-gold/50 bg-gold/10' 
                  : 'border-border bg-card/5 hover:bg-card/10'
              }`}
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-500 ${isPlaying ? 'bg-gold text-black' : 'bg-foreground text-background'}`}>
                {isPlaying ? <Volume2 size={20} className="animate-pulse" /> : <Play size={20} className="ml-1" />}
              </div>

              <div className="text-left flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                  {isPlaying ? "Listening..." : "Hear the difference"}
                </span>
                <span className="text-sm font-serif text-foreground whitespace-nowrap">
                  {isPlaying ? "Speaking with Authority" : "Play Pronunciation Demo"}
                </span>
              </div>
            </button>
          </MagneticButton>

          <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer group py-2">
            <span>Explore Library</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 hidden md:flex"
      >
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-muted-foreground to-transparent" />
      </motion.div>

    </section>
  );
}