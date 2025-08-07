import React from "react";
import { ArrowRight, Chrome, Sparkles } from "lucide-react";

// Environment variables
const EXTENSION_URL = import.meta.env.VITE_EXTENSION_URL;

const FinalCTA = () => {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden" id="final-cta">
      {/* Background Elements */}
      <div className="absolute -top-[20%] -right-[10%] w-1/2 h-[80%] bg-turquoise-gradient opacity-20 blur-3xl rounded-full"></div>
      <div className="absolute -bottom-[20%] -left-[10%] w-1/3 h-[60%] bg-mustard-400/10 opacity-30 blur-3xl rounded-full"></div>
      
      <div className="section-container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="quiz-chip mx-auto mb-6 bg-turquoise-400/20 text-turquoise-300 border-turquoise-400/30">
            <Sparkles className="w-4 h-4 mr-2" />
            <span>Get Started Today</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-6">
            Turn Your Inspiration
            <br className="hidden sm:inline" />
            <span className="text-transparent bg-gradient-to-r from-turquoise-400 to-mustard-400 bg-clip-text">Into Action</span>
          </h2>
          
          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Stop passively consuming content. Start actively learning with SnippetQuiz's AI-powered quiz generation. Your future self will thank you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href={EXTENSION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-turquoise-400 hover:bg-turquoise-500 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] group text-lg"
            >
              <Chrome className="mr-3 w-6 h-6" />
              Install Chrome Extension
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </a>
            
            <div className="flex items-center text-gray-400 text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              Free to install • No credit card required
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-700/50">
            <p className="text-gray-400 text-sm">
              Join over <span className="text-turquoise-400 font-semibold">10,000+</span> learners who have already transformed their study habits
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;