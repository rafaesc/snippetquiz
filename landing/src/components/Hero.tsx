
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, Chrome, Play } from "lucide-react";

// Environment variables
const EXTENSION_URL = import.meta.env.VITE_EXTENSION_URL;

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [lottieData, setLottieData] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile on mount and when window resizes
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Skip effect on mobile
    if (isMobile) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !imageRef.current) return;
      
      const {
        left,
        top,
        width,
        height
      } = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;

      imageRef.current.style.transform = `perspective(1000px) rotateY(${x * 2.5}deg) rotateX(${-y * 2.5}deg) scale3d(1.02, 1.02, 1.02)`;
    };
    
    const handleMouseLeave = () => {
      if (!imageRef.current) return;
      imageRef.current.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)`;
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }
    
    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [isMobile]);
  
  useEffect(() => {
    // Skip parallax on mobile
    if (isMobile) return;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const elements = document.querySelectorAll('.parallax');
      elements.forEach(el => {
        const element = el as HTMLElement;
        const speed = parseFloat(element.dataset.speed || '0.1');
        const yPos = -scrollY * speed;
        element.style.setProperty('--parallax-y', `${yPos}px`);
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);
  
  return (
    <section 
      className="overflow-hidden relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" 
      id="hero" 
      style={{
        padding: isMobile ? '100px 12px 40px' : '120px 20px 60px'
      }}
    >
      <div className="absolute -top-[10%] -right-[5%] w-1/2 h-[70%] bg-turquoise-gradient opacity-20 blur-3xl rounded-full"></div>
      <div className="absolute -bottom-[10%] -left-[5%] w-1/3 h-[50%] bg-mustard-400/10 opacity-30 blur-3xl rounded-full"></div>
      
      <div className="container px-4 sm:px-6 lg:px-8" ref={containerRef}>
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          
          <h1 
            className="section-title text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight opacity-0 animate-fade-in text-white font-display font-bold mb-6" 
            style={{ animationDelay: "0.3s" }}
          >
            Turn Any Content Into Interactive
            <span className="text-transparent bg-gradient-to-r from-turquoise-400 to-mustard-400 bg-clip-text"> Quizzes</span>
          </h1>
          
          <p 
            style={{ animationDelay: "0.5s" }} 
            className="section-subtitle mb-8 leading-relaxed opacity-0 animate-fade-in text-gray-300 font-normal text-base sm:text-lg max-w-2xl"
          >
            SnippetQuiz transforms articles, videos, and web content into personalized AI-generated quizzes. Save content, let AI tag topics, and practice with intelligent quizzes that adapt to your learning style.
          </p>
          
          <div 
            className="mb-12 opacity-0 animate-fade-in" 
            style={{ animationDelay: "0.7s" }}
          >
            <a 
              href={EXTENSION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-turquoise-400 hover:bg-turquoise-500 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] group"
            >
              <Chrome className="mr-3 w-5 h-5" />
              Install Extension
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          <div className="w-full max-w-3xl relative">
            <div className="relative z-10 animate-fade-in" style={{ animationDelay: "0.9s" }}>
              {/* Demo Video Container */}
              <div className="relative bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
                <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center border border-gray-600/50">
                  <div className="text-center text-white/80">
                    <Play className="w-16 h-16 mx-auto mb-4 text-turquoise-400" />
                    <p className="text-lg font-medium">Demo Video</p>
                    <p className="text-sm text-gray-400 mt-2">See SnippetQuiz in action</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: "1.1s" }}>
              <p className="text-gray-300 text-lg leading-relaxed">
                Watch how SnippetQuiz transforms any web content into interactive learning experiences that adapt to your pace and style
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="hidden lg:block absolute bottom-0 left-1/4 w-64 h-64 bg-turquoise-100/30 rounded-full blur-3xl -z-10 parallax" data-speed="0.05"></div>
    </section>
  );
};

export default Hero;
