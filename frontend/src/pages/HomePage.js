import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { 
  Rocket, 
  Printer, 
  BookOpen, 
  CheckCircle2, 
  ShieldCheck, 
  Clock,
  ArrowRight
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center relative overflow-hidden">
       {/* Hero Section Container - NO CARD BOUNDARY */}
       <div className="px-4 w-full flex flex-col items-center pt-24 pb-12">
          <div className="relative z-10 max-w-2xl mx-auto space-y-8 animate-fade-in py-12 px-6 rounded-[3rem] bg-white/5 dark:bg-black/5 backdrop-blur-[2px]">
            
            <h1 className="text-4xl md:text-6xl font-black text-gray-950 dark:text-white font-serif leading-tight tracking-tight drop-shadow-[0_4px_12px_rgba(255,255,255,0.8)] dark:drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                Smarter Lesson Notes <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-400">
                  In Seconds.
                </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-950 dark:text-white max-w-xl mx-auto font-black leading-relaxed drop-shadow-[0_2px_12px_rgba(255,255,255,1)] dark:drop-shadow-[0_2px_12px_rgba(0,0,0,1)]">
                The ultimate SaaS tool for Ghanaian teachers. Batch generate NaCCA-compliant lesson notes from your termly scheme and export print-ready DOCX files instantly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Link to="/register" className="w-full sm:w-auto px-8 py-3.5 bg-emerald-700 text-white rounded-2xl font-black shadow-[0_20px_40px_-10px_rgba(5,150,105,0.4)] hover:bg-emerald-800 hover:scale-105 hover:-translate-y-1 transition-all text-base ring-offset-2 focus:ring-2 focus:ring-emerald-500">
                  Start Generating Free
                </Link>
                <Link to="/login" className="w-full sm:w-auto px-8 py-3.5 bg-white/80 dark:bg-white/10 text-gray-950 dark:text-white rounded-2xl font-black shadow-lg border border-white dark:border-white/10 backdrop-blur-md hover:bg-white dark:hover:bg-white/20 transition-all text-base">
                  Login to Dashboard
                </Link>
            </div>

          </div>
       </div>

       {/* Features Section Container */}
       <div className="px-4 w-full">
          <div id="features" className="relative z-10 w-full max-w-4xl mx-auto mt-24 px-8 py-16 bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-3xl border border-white/50 dark:border-white/10 shadow-xl text-left">
            <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-12 text-center">Platform Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
                <div 
                  onClick={() => navigate('/generate')}
                  className="p-10 bg-white dark:bg-white/5 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 group hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm">
                    <Rocket size={32} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Insta-Generate</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed mb-10 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                    Convert Termly Schemes into standardized Weekly Lesson notes in a matter of seconds with AI.
                  </p>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm group-hover:gap-4 transition-all">
                    Start Generating <ArrowRight size={18} />
                  </div>
                </div>
                <div 
                  onClick={() => navigate('/scheme')}
                  className="p-10 bg-white dark:bg-white/5 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 group hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-sm">
                    <Printer size={32} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">B&W Print Ready</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed mb-10 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                    Download raw DOCX files instantly, formatted automatically to minimize ink usage for low-cost printing.
                  </p>
                  <div className="flex items-center gap-2 text-amber-600 font-bold text-sm group-hover:gap-4 transition-all">
                    Upload Scheme <ArrowRight size={18} />
                  </div>
                </div>
                <div 
                  onClick={() => navigate('/about')}
                  className="p-10 bg-white dark:bg-white/5 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 group hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm">
                    <ShieldCheck size={32} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">NaCCA Approved</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-[15px] leading-relaxed mb-10 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                    Pre-loaded with accurate Ministry standards for KG through JHS 3, verified by professional educators.
                  </p>
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-sm group-hover:gap-4 transition-all">
                    Learn More <ArrowRight size={18} />
                  </div>
                </div>
            </div>
          </div>
       </div>

       {/* How it Works Section Container */}
       <div className="px-4 w-full">
          <div id="how-it-works" className="relative z-10 w-full max-w-4xl mx-auto mt-24 px-8 py-16 bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-3xl border border-white/50 dark:border-white/10 shadow-xl text-left">
            <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-16 text-center">How It Works</h2>
            <div className="space-y-16">
                <div className="flex flex-col md:flex-row items-center gap-12">
                  <div className="w-20 h-20 bg-gray-900 dark:bg-emerald-600 text-white rounded-full flex items-center justify-center text-3xl font-bold shrink-0 shadow-lg">1</div>
                  <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Upload Your Scheme</h3>
                      <p className="text-gray-700 dark:text-gray-400 text-lg">Simply upload your PDF or DOCX termly scheme of work. Our AI automatically parses the structure and prepares your weekly breakdowns.</p>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-12">
                  <div className="w-20 h-20 bg-gray-900 dark:bg-emerald-600 text-white rounded-full flex items-center justify-center text-3xl font-bold shrink-0 shadow-lg">2</div>
                  <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Configure Your Basket</h3>
                      <p className="text-gray-700 dark:text-gray-400 text-lg">Select the subjects you teach, specify the number of days and periods, and let the generator do the heavy lifting.</p>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-12">
                  <div className="w-20 h-20 bg-gray-900 dark:bg-emerald-600 text-white rounded-full flex items-center justify-center text-3xl font-bold shrink-0 shadow-lg">3</div>
                  <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Download & Print</h3>
                      <p className="text-gray-700 dark:text-gray-400 text-lg">Export your generated lessons as a single, combined DOCX file. It's strictly black-and-white and ready for the printer.</p>
                  </div>
                </div>
            </div>
          </div>
       </div>

       {/* Pricing Section Container */}
       <div className="px-4 w-full">
          <div id="pricing" className="relative z-10 w-full max-w-4xl mx-auto mt-24 px-8 py-16 bg-white/80 dark:bg-black/60 backdrop-blur-md rounded-3xl border border-white/50 dark:border-white/10 shadow-xl text-center">
            <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-12 max-w-xl mx-auto text-lg leading-relaxed">Get started for free or upgrade to Pro for unlimited generation and batch exports.</p>
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                <div className="p-10 bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm flex flex-col">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free Plan</h3>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white mb-8 font-serif">GH₵ 0 <span className="text-sm font-medium">/ mo</span></p>
                  <ul className="text-left space-y-5 mb-10 text-base text-gray-600 dark:text-gray-400">
                      <li className="flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        Limited Generation
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        Standard Templates
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        Online Preview
                      </li>
                  </ul>
                  <Link to="/register" className="mt-auto py-4 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-white/20 transition">Get Started</Link>
                </div>
                <div className="p-10 bg-white dark:bg-white/5 rounded-3xl border-2 border-emerald-500 shadow-xl flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl">Recommended</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pro Plan</h3>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white mb-8 font-serif">GH₵ 50 <span className="text-sm font-medium">/ mo</span></p>
                  <ul className="text-left space-y-5 mb-10 text-base text-gray-600 dark:text-gray-400">
                      <li className="flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        Unlimited Note Generation
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        Batch Multi-Subject Export
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        Termly Scheme Parsing
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        Priority Support
                      </li>
                  </ul>
                  <Link to="/register" className="mt-auto py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 transition">Upgrade to Pro</Link>
                </div>
            </div>
          </div>
       </div>

       {/* CTA Section Container */}
       <div className="px-4 w-full">
          <div className="relative z-10 w-full max-w-4xl mx-auto mt-24 px-8 py-20 bg-gradient-to-br from-emerald-900 to-emerald-700 rounded-[3rem] text-center text-white shadow-3xl">
            <h2 className="text-3xl md:text-5xl font-serif font-black mb-6">Ready to save hours of planning?</h2>
            <p className="text-emerald-100 mb-12 max-w-2xl mx-auto text-xl font-medium">Join thousands of Ghanaian teachers using AI to focus more on teaching and less on paperwork.</p>
            <Link to="/register" className="inline-block px-12 py-6 bg-white text-emerald-900 rounded-2xl font-black text-2xl shadow-2xl hover:bg-emerald-50 transition-all hover:scale-105">
                Create or Use Free Account
            </Link>
          </div>
       </div>

       {/* Footer - Edge to Edge */}
       <div className="w-full mt-32 relative z-10 text-left">
           <Footer />
       </div>

    </div>
  );
}
