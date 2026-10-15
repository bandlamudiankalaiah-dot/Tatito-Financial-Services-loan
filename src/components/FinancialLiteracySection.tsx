import React, { useState } from 'react';
import { 
  BookOpen, 
  Clock, 
  User, 
  ArrowRight, 
  Search, 
  Tag, 
  Share2, 
  Bookmark, 
  CheckCircle2, 
  X,
  Sparkles
} from 'lucide-react';
import { BlogPost } from '../types';
import { storageService } from '../services/storage';

export const FinancialLiteracySection: React.FC = () => {
  const blogs = storageService.getBlogs();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePost, setActivePost] = useState<BlogPost | null>(null);

  const categories = ['all', 'Loans & EMI', 'Wealth & Savings', 'Gold Loan', 'Credit & CIBIL', 'Home Loan'];

  const filteredBlogs = blogs.filter((post) => {
    const matchesCategory = selectedCategory === 'all' || post.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="financial-literacy-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Financial Literacy &amp; Rayalaseema Advisory
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Expert guides on loan amortisation, reducing balance interest, SIP wealth creation, and CIBIL optimization
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search financial guides..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer capitalize ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? 'All Guides' : cat}
          </button>
        ))}
      </div>

      {/* Blogs Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {filteredBlogs.map((post) => (
          <article
            key={post.id}
            onClick={() => setActivePost(post)}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group cursor-pointer hover:-translate-y-1"
          >
            <div>
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-emerald-400 text-[10px] font-extrabold px-2.5 py-1 rounded-lg">
                  {post.category}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-2">
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {post.readTime}
                  </span>
                  <span>•</span>
                  <span>{new Date(post.publishedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition leading-snug">
                  {post.title}
                </h3>

                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {post.summary}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between mt-4">
              <span className="text-[11px] font-bold text-slate-600">
                By {post.author}
              </span>
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Read Article <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Detail Reader Modal */}
      {activePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            {/* Modal Cover Image */}
            <div className="relative h-56 w-full">
              <img
                src={activePost.coverImage}
                alt={activePost.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setActivePost(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-lg">
                {activePost.category}
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 text-xs text-slate-500 pb-3 border-b border-slate-100">
                <span className="font-semibold text-slate-800">By {activePost.author}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {activePost.readTime}
                </span>
                <span>•</span>
                <span>{new Date(activePost.publishedAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-4 leading-tight">
                {activePost.title}
              </h2>

              <p className="text-sm font-semibold text-emerald-800 bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100 mt-4 leading-relaxed">
                💡 {activePost.summary}
              </p>

              {/* Formatted Content */}
              <div className="mt-6 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {activePost.content}
              </div>

              {/* Reader Footer */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500 font-medium">
                  Published by <strong className="text-slate-800">Tatito Advisory Desk</strong>, Kadapa
                </div>
                <button
                  type="button"
                  onClick={() => setActivePost(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                >
                  Close Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
