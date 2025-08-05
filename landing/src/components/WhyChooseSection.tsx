import React from "react";
import { Zap, Target, Users, BarChart3, Sparkles, Clock } from "lucide-react";

const WhyChooseSection = () => {
  const benefits = [
    {
      icon: Zap,
      title: "AI-Powered Intelligence",
      description: "Advanced AI analyzes your content and generates contextually relevant quizzes tailored to your learning objectives."
    },
    {
      icon: Target,
      title: "Personalized Learning",
      description: "Adaptive quiz generation based on your learning patterns, difficulty preferences, and topic interests."
    },
    {
      icon: Users,
      title: "Chrome Extension Integration",
      description: "Seamlessly capture content from any website with our powerful Chrome extension for effortless learning material collection."
    },
    {
      icon: BarChart3,
      title: "Progress Analytics",
      description: "Comprehensive analytics track your learning progress with detailed charts, performance metrics, and improvement insights."
    },
    {
      icon: Sparkles,
      title: "Smart Topic Tagging",
      description: "Automatic content categorization with intelligent topic suggestions to keep your learning materials perfectly organized."
    },
    {
      icon: Clock,
      title: "Global AI Instructions",
      description: "Customize how the AI behaves with global instructions that guide question generation, difficulty levels, and learning objectives."
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-gray-900" id="why-choose">
      <div className="section-container">
        <div className="text-center mb-12 lg:mb-16">
          <div className="quiz-chip mx-auto mb-6 bg-turquoise-400/20 text-turquoise-300 border-turquoise-400/30">
            <span>Benefits</span>
          </div>
          <h2 className="section-title text-white mb-6">
            Why Choose
            <br className="hidden sm:inline" />
            <span className="text-transparent bg-gradient-to-r from-turquoise-400 to-mustard-400 bg-clip-text">QuizMaster?</span>
          </h2>
          <p className="section-subtitle text-gray-300 mx-auto">
            Discover the features that make QuizMaster the ultimate learning companion for students, professionals, and lifelong learners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-turquoise-400/30 transition-all duration-300 group hover:transform hover:scale-[1.02]"
            >
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-turquoise-400/20 to-mustard-400/20 border border-turquoise-400/20 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-7 h-7 text-turquoise-400" />
                </div>
              </div>
              
              <h3 className="text-lg font-display font-semibold text-white mb-3">
                {benefit.title}
              </h3>
              
              <p className="text-gray-400 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;