import React from "react";
import { FileText, Brain, Play } from "lucide-react";

const StepsSection = () => {
  const steps = [
    {
      icon: FileText,
      number: "01",
      title: "Create Content Bank",
      description: "Save articles, videos, and web content using our Chrome extension. Organize your learning materials in personalized content banks."
    },
    {
      icon: Brain,
      number: "02", 
      title: "Include Content Entries",
      description: "Add diverse learning materials from any source. Our AI automatically analyzes and tags content with relevant topics for easy organization."
    },
    {
      icon: Play,
      number: "03",
      title: "Create AI Quizzes",
      description: "Generate intelligent, personalized quizzes from your content. Customize quiz styles with global instruction prompts and practice effectively."
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-gray-50" id="steps">
      <div className="section-container">
        <div className="text-center mb-12 lg:mb-16">
          <div className="quiz-chip mx-auto mb-6 bg-turquoise-100 text-turquoise-600 border-turquoise-200">
            <span>How It Works</span>
          </div>
          <h2 className="section-title text-gray-900 mb-6">
            Three Simple Steps to
            <br className="hidden sm:inline" />
            <span className="text-transparent bg-gradient-to-r from-turquoise-500 to-mustard-500 bg-clip-text">Smarter Learning</span>
          </h2>
          <p className="section-subtitle text-gray-600 mx-auto">
            Transform your browsing habits into powerful learning sessions with SnippetQuiz's intuitive three-step process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
            >
              <div className="absolute -top-4 left-8">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-turquoise-400 to-mustard-400 text-white text-sm font-bold">
                  {step.number}
                </div>
              </div>
              
              <div className="mb-6 pt-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-turquoise-50 to-mustard-50 border border-turquoise-100 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-8 h-8 text-turquoise-500" />
                </div>
              </div>
              
              <h3 className="text-xl font-heading font-semibold text-gray-900 mb-4">
                {step.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StepsSection;