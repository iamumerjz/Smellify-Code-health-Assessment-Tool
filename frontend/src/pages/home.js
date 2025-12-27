import React from 'react';
import { Video, TrendingUp, Bug } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BugTrackingHero() {
    const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <h1 className="text-6xl font-bold leading-tight text-gray-900">
              We help MERN devs{' '}
              <span style={{ color: '#5A33FF' }}>
                detect code smells faster
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
              Track, manage, and squash MERN stack code smells with ease so your code stays rock solid and your users stay happy.
            </p>
            
            <div className="flex gap-4 items-center pt-4">
              <button 
                onClick={() => handleNavigation('/register')}
                style={{ backgroundColor: '#5A33FF' }}
                className="px-8 py-4 text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Started
              </button>
              
              <button className="px-6 py-4 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2 border border-gray-200">
                <Video size={20} />
                Watch Video
              </button>
            </div>
          </div>
          
          {/* Right Illustration */}
          <div className="relative h-[500px] flex items-center justify-center">
            {/* Floating Decorative Elements */}
            <div 
              style={{ backgroundColor: '#5A33FF' }}
              className="absolute top-12 right-20 w-16 h-16 rounded-full opacity-80 animate-pulse"
            />
            <div className="absolute top-4 right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce" 
                 style={{ animationDuration: '3s' }} 
            />
            <div className="absolute top-32 left-8 w-6 h-6 bg-yellow-300 rounded-full" />
            <div className="absolute bottom-32 left-4 w-5 h-5 border-2 border-gray-300 rounded-full" />
            <div className="absolute bottom-20 right-32 w-10 h-10 border-2 border-gray-200 rounded-full" />
            <div 
              style={{ borderColor: '#5A33FF' }}
              className="absolute bottom-48 right-4 w-8 h-8 border-3 rounded-full"
            />
            
            {/* Main Laptop Mockup */}
            <div className="relative z-10 transform hover:scale-105 transition-transform duration-300">
              {/* Screen */}
              <div className="bg-white rounded-t-xl shadow-2xl p-3 w-[380px] h-64 border-8 border-gray-800">
                {/* Browser Chrome */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                </div>
                
                {/* Content Area */}
                <div className="space-y-4 px-2">
                  {/* Color Dots Row 1 */}
                  <div className="flex gap-2 items-center">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#5A33FF' }} />
                    <div className="w-3 h-3 bg-green-400 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                    <div className="w-3 h-3 bg-pink-400 rounded-full" />
                    <div className="w-3 h-3 bg-blue-400 rounded-full" />
                    <div className="w-3 h-3 bg-red-400 rounded-full" />
                  </div>
                  
                  {/* Content Lines */}
                  <div className="space-y-2.5 pt-2">
                    <div className="h-2 bg-gray-200 rounded-full w-5/6" />
                    <div className="h-2 bg-gray-200 rounded-full w-3/4" />
                    <div className="h-2 bg-gray-200 rounded-full w-4/5" />
                  </div>
                  
                  {/* Color Dots Row 2 */}
                  <div className="flex gap-2 justify-end pt-4">
                    <div className="w-3 h-3 bg-blue-400 rounded-full" />
                    <div className="w-3 h-3 bg-green-400 rounded-full" />
                    <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                    <div className="w-3 h-3 bg-red-400 rounded-full" />
                    <div className="w-3 h-3 bg-purple-400 rounded-full" />
                  </div>
                </div>
              </div>
              
              {/* Laptop Base */}
              <div className="h-4 bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-xl shadow-lg" />
              <div className="h-2.5 bg-gradient-to-b from-gray-600 via-gray-700 to-gray-800 mx-auto" 
                   style={{ width: '450px', borderRadius: '0 0 8px 8px' }} 
              />
            </div>
            
            {/* Trending Badge */}
            <div 
              className="absolute bottom-8 right-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-5 shadow-2xl z-20 transform hover:scale-110 transition-transform"
              style={{ width: '90px', height: '90px' }}
            >
              <TrendingUp className="text-white w-full h-full" strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Featured In Section */}
      <div className="border-t border-gray-100 bg-white py-16">
        <div className="max-w-7xl mx-auto px-8">
          <p className="text-center text-gray-400 text-sm font-bold mb-12 tracking-widest uppercase">
            Featured In
          </p>
          
          <div className="flex justify-center items-center gap-32 flex-wrap">
            {/* YouTube */}
            <div className="flex items-center gap-3 opacity-50 hover:opacity-70 transition-opacity">
              <div className="w-11 h-11 bg-gray-700 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-600">YouTube</span>
            </div>
            
            {/* GitHub */}
            <div className="flex items-center gap-3 opacity-50 hover:opacity-70 transition-opacity">
              <div className="w-11 h-11 bg-gray-700 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-600">GitHub</span>
            </div>
            
            {/* Reddit */}
            <div className="flex items-center gap-3 opacity-50 hover:opacity-70 transition-opacity">
              <div className="w-11 h-11 bg-gray-700 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-600">reddit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <div className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-5xl font-bold text-center text-gray-900 mb-16">
            Key Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bug Tracking */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <div className="mb-6">
                <svg 
                  style={{ color: '#5A33FF' }}
                  className="w-12 h-12" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Code Smells Detection
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Efficiently detect code smells.
              </p>
            </div>

            {/* Real-time Alerts */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <div className="mb-6">
                <svg 
                  style={{ color: '#5A33FF' }}
                  className="w-12 h-12" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Real time Alerts
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Stay updated with instant dashboard notifications on smells status.
              </p>
            </div>

            {/* Comprehensive Reports */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
              <div className="mb-6">
                <svg 
                  style={{ color: '#5A33FF' }}
                  className="w-12 h-12" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Comprehensive Reports
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Generate detailed code smells reports for better analysis.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-5xl font-bold text-center text-gray-900 mb-20">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div 
                style={{ backgroundColor: '#5A33FF' }}
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Upload
              </h3>
              <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                Upload your MERN stack project
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div 
                style={{ backgroundColor: '#5A33FF' }}
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Analysis
              </h3>
              <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                A detailed static analysis is done to detect code smells.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div 
                style={{ backgroundColor: '#5A33FF' }}
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Reports
              </h3>
              <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                Comprehensive reports with steps to fix are shown to you.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div 
        style={{ backgroundColor: '#5A33FF' }}
        className="py-24"
      >
        <div className="max-w-4xl mx-auto px-8 text-center">
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Experience seamless code smell tracking and management with our platform.
          </p>
          <button 
          onClick={() => handleNavigation('/register')}
          className="bg-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
                  
                  style={{ color: '#5A33FF' }}>
            Sign Up Now
          </button>
        </div>
      </div>
    </div>
  );
}