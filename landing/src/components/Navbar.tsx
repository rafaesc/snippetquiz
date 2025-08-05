
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu, X, Github, Chrome } from "lucide-react";

// Environment variables
const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL;
const EXTENSION_URL = import.meta.env.VITE_EXTENSION_URL;

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Prevent background scrolling when menu is open
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Close mobile menu if open
    if (isMenuOpen) {
      setIsMenuOpen(false);
      document.body.style.overflow = '';
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-2 sm:py-3 md:py-4 transition-all duration-300",
        isScrolled 
          ? "bg-gray-900/95 backdrop-blur-md shadow-lg" 
          : "bg-gray-900/80 backdrop-blur-md"
      )}
    >
      <div className="container flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <a 
          href="#" 
          className="flex items-center space-x-2"
          onClick={(e) => {
            e.preventDefault();
            scrollToTop();
          }}
          aria-label="QuizMaster"
        >
          <h1 className="text-xl font-display font-bold text-white">QuizMaster</h1>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <a href="https://github.com/rafaesc/quizmaster" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-turquoise-400 transition-colors p-2">
            <Github size={20} />
          </a>
          <div className="flex items-center space-x-3">
            <a href={EXTENSION_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center bg-turquoise-400 hover:bg-turquoise-500 text-white font-medium py-2 px-4 rounded-full transition-all duration-300 shadow-md hover:shadow-lg text-sm">
              <Chrome size={16} className="mr-2" />
              Install Extension
            </a>
            <a href={DASHBOARD_URL} className="bg-mustard-400 hover:bg-mustard-500 text-white font-medium py-2 px-4 rounded-full transition-all duration-300 text-sm">
              Go to Dashboard
            </a>
          </div>
        </div>

        {/* Mobile menu button - increased touch target */}
        <button 
          className="md:hidden text-white hover:text-turquoise-400 p-3 focus:outline-none transition-colors" 
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation - improved for better touch experience */}
      <div className={cn(
        "fixed inset-0 z-40 bg-gray-900 flex flex-col pt-16 px-6 md:hidden transition-all duration-300 ease-in-out",
        isMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
      )}>
        <nav className="flex flex-col space-y-6 items-center mt-8">
          <a href="https://github.com/rafaesc/quizmaster" target="_blank" rel="noopener noreferrer" className="flex items-center py-3 px-6 text-white/80 hover:text-turquoise-400 transition-colors text-lg font-medium">
            <Github size={20} className="mr-2" />
            GitHub
          </a>
          <a href={EXTENSION_URL} target="_blank" rel="noopener noreferrer" className="flex items-center bg-turquoise-400 hover:bg-turquoise-500 text-white font-medium py-3 px-6 rounded-full transition-all duration-300 text-lg w-fit">
            <Chrome size={20} className="mr-2" />
            Install Extension
          </a>
          <a href={DASHBOARD_URL} target="_blank" rel="noopener noreferrer" className="bg-mustard-400 hover:bg-mustard-500 text-white font-medium py-3 px-6 rounded-full transition-all duration-300 text-lg">
            Go to Dashboard
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
