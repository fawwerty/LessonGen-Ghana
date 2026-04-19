import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-gray-200 dark:border-white/10 pt-12 pb-8 mt-16 transition-colors duration-500">
      <div className="mx-auto w-full px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-10 pb-10 border-b border-gray-100 dark:border-white/5 text-center md:text-left justify-items-center md:justify-items-start">
          
          <div className="flex flex-col items-center md:items-start col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-900 border border-white/20 flex items-center justify-center">
                 <span className="text-white font-bold font-serif text-lg leading-none">L</span>
               </div>
               <span className="font-serif font-bold text-xl text-gray-900 dark:text-white">LessonGen</span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
              Ghana's premier NaCCA-aligned lesson note generation platform for teachers.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4 uppercase text-[10px] tracking-wider">Features</h4>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li><Link to="/register" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">SaaS Dashboard</Link></li>
              <li><Link to="/register" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">Termly Scheme Parsing</Link></li>
              <li><Link to="/register" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">Batch Generation Wizard</Link></li>
              <li><Link to="/register" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">B&W Print Ready DOCX</Link></li>
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4 uppercase text-[10px] tracking-wider">Resources</h4>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li><Link to="/curriculum" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">NaCCA Curriculum DB</Link></li>
              <li><a href="#" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">Help Center</a></li>
              <li><a href="#" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">Video Tutorials</a></li>
              <li><a href="#" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">Community Forum</a></li>
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4 uppercase text-[10px] tracking-wider">Company</h4>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link to="/about" className="text-[11px] leading-relaxed mb-4 italic hover:text-emerald-700 dark:hover:text-emerald-400 transition text-center md:text-left block">
                  Founded by <span className="font-bold">Fawwerty</span>, a BSc. Computer Science graduate (AIT) and Basic School Teacher who knows exactly what educators need.
                </Link>
              </li>
              <li><Link to="/contact" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">Contact Us</Link></li>
              <li><Link to="/privacy" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition">Privacy Policy</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-gray-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            © {new Date().getFullYear()} LessonGen Ghana. All rights reserved.
          </p>
          <div className="flex gap-4 text-gray-400 dark:text-gray-500">
            <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Twitter</a>
            <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">Facebook</a>
            <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
