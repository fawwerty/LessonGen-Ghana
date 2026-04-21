import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { 
  GraduationCap, 
  Code, 
  ShieldCheck, 
  Building2, 
  HardHat, 
  Globe2,
  Award
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-transparent transition-colors">
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-20 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white font-serif mb-6 leading-tight">
              Bridging Classrooms <br /> 
              & <span className="text-emerald-600 dark:text-emerald-400">Code.</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
              MEET THE FOUNDER: A professional educator and software engineer dedicated to modernizing Ghanaian education through scalable AI systems.
            </p>
          </div>

          {/* Story Grid */}
          <div className="grid md:grid-cols-2 gap-12 mb-32 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-widest">
                The Founder's Journey
              </div>
              <h2 className="text-3xl font-bold font-serif text-gray-900 dark:text-white">From the Chalkboard to the Codebase.</h2>
              <p className="text-gray-700 dark:text-gray-400 leading-relaxed">
                Since February 2020, I have served as a **Basic School Teacher** in Ghana. My daily experience in the classroom revealed a critical gap: teachers spend hours on manual paperwork that could be automated by technology.
              </p>
              <p className="text-gray-700 dark:text-gray-400 leading-relaxed">
                To solve this, I transitioned into deep software engineering. Having attended **Accra College of Education (2017-2020)** and currently pursuing a BSc. in Computer Science at **Accra Institute of Technology (2023-2026)**, I built LessonGen Ghana to be the bridge between traditional pedagogy and the future of AI.
              </p>
            </div>
            <div className="relative group">
               <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition"></div>
                <div className="relative aspect-square bg-white dark:bg-white/5 rounded-3xl border border-white/20 dark:border-white/10 overflow-hidden shadow-2xl flex flex-col items-center justify-center p-8 text-center ring-1 ring-emerald-500/10">
                   <div className="w-24 h-24 bg-emerald-700/10 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-emerald-500/20">
                      <Globe2 size={48} className="text-emerald-600" strokeWidth={1.5} />
                   </div>
                   <h3 className="text-2xl font-black text-gray-900 dark:text-white font-serif tracking-tight">Fawwerty</h3>
                   <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 font-bold uppercase tracking-widest text-[10px]">Founder & Lead Engineer</p>
                  <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                     <div className="p-3 bg-gray-50 dark:bg-black/40 rounded-xl border border-gray-100 dark:border-white/5">
                        <div className="text-xs text-emerald-600 font-bold">4+ Years</div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold mt-1">Teaching</div>
                     </div>
                     <div className="p-3 bg-gray-50 dark:bg-black/40 rounded-xl border border-gray-100 dark:border-white/5">
                        <div className="text-xs text-blue-600 font-bold">ML/Dev</div>
                        <div className="text-[10px] text-gray-400 uppercase font-bold mt-1">Specialization</div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Expert Experience */}
          <div className="mb-32">
            <h2 className="text-3xl font-bold font-serif text-gray-900 dark:text-white mb-12 text-center">Engineering Portfolio</h2>
             <div className="grid md:grid-cols-3 gap-6">
               <div className="p-8 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm hover:scale-105 transition cursor-default group">
                 <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 transition">
                   <ShieldCheck size={24} strokeWidth={2.5} />
                 </div>
                 <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">CyberShield-AI</h4>
                 <p className="text-sm text-gray-500 dark:text-gray-400">ML-powered intrusion detection system using Isolation Forest & Deep Autoencoders.</p>
               </div>
               <div className="p-8 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm hover:scale-105 transition cursor-default group">
                 <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 transition">
                   <Building2 size={24} strokeWidth={2.5} />
                 </div>
                 <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Bankly App</h4>
                 <p className="text-sm text-gray-500 dark:text-gray-400">Secure React Native mobile banking solution with encrypted JWT auth and RBAC.</p>
               </div>
               <div className="p-8 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm hover:scale-105 transition cursor-default group">
                 <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 transition">
                   <HardHat size={24} strokeWidth={2.5} />
                 </div>
                 <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">SecureX (GRC)</h4>
                 <p className="text-sm text-gray-500 dark:text-gray-400">Enterprise Cybersecurity & Risk Management platform tailored for African firms.</p>
               </div>
             </div>
          </div>

          {/* Call to Action */}
          <div className="p-12 bg-gray-900 dark:bg-emerald-950 rounded-[3rem] text-center text-white relative overflow-hidden shadow-3xl">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>
             <h2 className="text-3xl font-serif font-bold mb-6">Experience the Teacher's Advantage</h2>
             <p className="text-gray-400 mb-10 max-w-xl mx-auto">Build lesson notes that truly comply with NaCCA standards, designed by someone who actually teaches.</p>
             <Link to="/register" className="inline-block px-10 py-4 bg-white text-gray-900 rounded-2xl font-extrabold shadow-2xl hover:bg-emerald-50 transition active:scale-95">
                Start Generating for Free
             </Link>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
