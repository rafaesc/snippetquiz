import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Chrome, Menu, Bookmark, Share2, Zap, Users, Star, ArrowRight } from "lucide-react"

export default function Home() {
  return (<div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-900">Quizmaster</h1>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-colors bg-transparent"
              >
                <Link href="/dashboard">
                Go to Dashboard
                </Link>
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                <Chrome className="w-4 h-4 mr-2" />
                Install Extension
              </Button>
            </div>
            <div className="md:hidden flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-blue-600">
                <Link href="/dashboard">
                Dashboard
                </Link>
              </Button>
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-32 relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 via-indigo-900/50 to-gray-900/50"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Transform Web Content Into
              <span className="text-blue-400 block">Shareable Inspiration</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Capture meaningful content from the web, organize it into inspiration boards, and transform your insights
              into engaging content that grows your audience.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
                <Chrome className="w-5 h-5 mr-3" />
                Install Chrome Extension
              </Button>
            </div>

            {/* Demo Video */}
            <div className="max-w-3xl mx-auto mb-8">
              <div className="relative aspect-video bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
                <video className="w-full h-full object-cover" poster="/placeholder.svg?height=400&width=700" controls>
                  <source src="/placeholder-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                  <div className="bg-white/90 rounded-full p-4">
                    <div className="w-0 h-0 border-l-[20px] border-l-blue-600 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"></div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-400 text-lg max-w-2xl mx-auto italic">
              "Share meaningful content with your audience and gain more visibility, engagement, and followers — even on
              platforms like Facebook."
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-blue-900 mb-4">How It Works</h2>
            <p className="text-xl text-blue-600 max-w-2xl mx-auto">
              Three simple steps to transform your web browsing into content creation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bookmark className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-blue-900 mb-4">1. Capture</h3>
              <p className="text-blue-700 leading-relaxed">
                Save meaningful content, quotes, and insights from any website with a single click using our Chrome
                extension.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-semibold text-blue-900 mb-4">2. Organize</h3>
              <p className="text-blue-700 leading-relaxed">
                Create custom inspiration boards to categorize and organize your saved content by topics, projects, or
                themes.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Share2 className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-blue-900 mb-4">3. Share</h3>
              <p className="text-blue-700 leading-relaxed">
                Transform your curated insights into engaging posts and content that resonates with your audience across
                all platforms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose BrainFuel */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-blue-900 mb-4">Why Choose BrainFuel?</h2>
            <p className="text-xl text-blue-600 max-w-2xl mx-auto">
              Unique benefits that set you apart from the competition
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-blue-900 mb-3">Saves Time</h3>
                <p className="text-blue-700">
                  Stop losing great ideas. Capture and organize content instantly while browsing, eliminating the need
                  to search for inspiration later.
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-blue-900 mb-3">Boosts Creativity</h3>
                <p className="text-blue-700">
                  Transform scattered web content into organized inspiration boards that spark new ideas and creative
                  connections.
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-blue-900 mb-3">Increases Visibility</h3>
                <p className="text-blue-700">
                  Share meaningful, curated content that engages your audience and builds your reputation as a thought
                  leader in your field.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-blue-900 mb-4">Loved by Creators & Researchers</h2>
            <p className="text-xl text-blue-600 max-w-2xl mx-auto">See what our users are saying about BrainFuel</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-blue-700 mb-4 italic">
                  "BrainFuel has completely transformed how I create content. I can now easily capture insights and turn
                  them into engaging posts that my audience loves."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">SM</span>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">Sarah Martinez</p>
                    <p className="text-blue-600 text-sm">Content Creator</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-blue-700 mb-4 italic">
                  "As a researcher, BrainFuel helps me organize my findings and share valuable insights with my network.
                  It's become an essential part of my workflow."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-indigo-600 font-semibold">DJ</span>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">Dr. James Wilson</p>
                    <p className="text-blue-600 text-sm">Academic Researcher</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-blue-700 mb-4 italic">
                  "The inspiration boards feature is genius! I can now keep track of trends and create content that
                  really resonates with my target audience."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">AL</span>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900">Alex Liu</p>
                    <p className="text-blue-600 text-sm">Digital Marketer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Ready to Fuel Your Creativity?</h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join thousands of creators, researchers, and marketers who are already using BrainFuel to transform
              inspiration into engaging content.
            </p>
            <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg">
              <Chrome className="w-5 h-5 mr-3" />
              Install Chrome Extension
              <ArrowRight className="w-5 h-5 ml-3" />
            </Button>
            <p className="text-blue-200 mt-4">Free to install • Works on all websites • No signup required</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-2xl font-bold">BrainFuel</h3>
              <p className="text-blue-200 mt-1">Transform inspiration into content</p>
            </div>
            <div className="flex space-x-8">
              <Link href="/privacy" className="text-blue-200 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/contact" className="text-blue-200 hover:text-white transition-colors">
                Contact
              </Link>
              <Link href="/about" className="text-blue-200 hover:text-white transition-colors">
                About
              </Link>
            </div>
          </div>
          <div className="border-t border-blue-800 mt-8 pt-8 text-center">
            <p className="text-blue-300">© {new Date().getFullYear()} BrainFuel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
