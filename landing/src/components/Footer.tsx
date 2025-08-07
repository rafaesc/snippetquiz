
import React from "react";
import { Github, Mail, Shield, Info } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-900 py-12 border-t border-gray-800">
      <div className="section-container">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-display font-bold text-white mb-2">SnippetQuiz</h3>
            <p className="text-gray-400 text-sm">Transform content into knowledge</p>
          </div>
          
          <div className="flex items-center space-x-6">
            <a href="https://github.com/rafaesc/snippetquiz" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-turquoise-400 transition-colors">
              <Github size={20} />
            </a>
            <a href="#privacy" className="text-gray-400 hover:text-turquoise-400 transition-colors text-sm">Privacy</a>
            <a href="#contact" className="text-gray-400 hover:text-turquoise-400 transition-colors text-sm">Contact</a>
            <a href="#about" className="text-gray-400 hover:text-turquoise-400 transition-colors text-sm">About</a>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm">© 2025 SnippetQuiz. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
