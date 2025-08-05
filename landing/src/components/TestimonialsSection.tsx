import React from "react";
import { Star } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Dr. Sarah Chen",
      role: "Medical Researcher",
      avatar: "/lovable-uploads/22d31f51-c174-40a7-bd95-00e4ad00eaf3.png",
      content: "QuizMaster has revolutionized how I process research papers. I can now turn complex medical studies into digestible quizzes that help me retain critical information for my work.",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Computer Science Student",
      avatar: "/lovable-uploads/af412c03-21e4-4856-82ff-d1a975dc84a9.png", 
      content: "The Chrome extension is a game-changer! I save programming tutorials and articles, then QuizMaster creates perfect practice questions. My coding skills have improved dramatically.",
      rating: 5
    },
    {
      name: "Elena Rodriguez",
      role: "Content Creator & Educator",
      avatar: "/lovable-uploads/c3d5522b-6886-4b75-8ffc-d020016bb9c2.png",
      content: "As someone who consumes a lot of educational content, QuizMaster helps me actually retain what I learn. The AI-generated quizzes are incredibly intelligent and contextually relevant.",
      rating: 5
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-white" id="testimonials">
      <div className="section-container">
        <div className="text-center mb-12 lg:mb-16">
          <div className="quiz-chip mx-auto mb-6 bg-turquoise-100 text-turquoise-600 border-turquoise-200">
            <span>Testimonials</span>
          </div>
          <h2 className="section-title text-gray-900 mb-6">
            Loved by Creators
            <br className="hidden sm:inline" />
            <span className="text-transparent bg-gradient-to-r from-turquoise-500 to-mustard-500 bg-clip-text">& Researchers</span>
          </h2>
          <p className="section-subtitle text-gray-600 mx-auto">
            Join thousands of learners who have transformed their study habits with QuizMaster's intelligent quiz generation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group"
            >
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-mustard-400 fill-current" />
                ))}
              </div>
              
              {/* Content */}
              <p className="text-gray-700 leading-relaxed mb-6 italic">
                "{testimonial.content}"
              </p>
              
              {/* Author */}
              <div className="flex items-center">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-turquoise-100"
                />
                <div>
                  <h4 className="font-display font-semibold text-gray-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;