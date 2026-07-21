import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

const CATEGORIES = [
  'All', 'General', 'Infrastructure', 'Education', 'Health',
  'Agriculture', 'Finance', 'Employment', 'Environment', 'Governance',
];

const PostCard = ({ post, onUpvote, currentUserId }) => {
  const upvotedList = post.upvotedBy || post.upvotes || [];
  const hasUpvoted = upvotedList.includes(currentUserId);
  
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <article
      className="glass-card p-5 space-y-3"
      aria-label={`Discussion: ${post.title}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className="badge badge-glass text-[8px] font-mono mb-1">
            {(post.category || 'General').toUpperCase()}
          </span>
          <h3 className="text-sm font-bold text-slate-800 leading-snug">{post.title}</h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{post.content}</p>
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-2 text-[10px] font-mono text-slate-400">
        {post.tags?.slice(0, 2).map((t) => (
          <span key={t} className="badge badge-glass text-[8px]">#{t}</span>
        ))}
        <span className="ml-auto">
          @{post.author?.username || 'citizen'} · {timeAgo(post.createdAt)}
        </span>
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-slate-100 mt-2">
        <button
          onClick={() => onUpvote(post._id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-[9px] font-bold border transition-all"
          style={{
            background: hasUpvoted ? 'var(--gov-navy)' : '#ffffff',
            borderColor: hasUpvoted ? 'var(--gov-navy)' : '#cbd5e1',
            color: hasUpvoted ? '#ffffff' : '#475569',
          }}
          aria-pressed={hasUpvoted}
          id={`upvote-btn-${post._id}`}
        >
          <svg className={`w-3.5 h-3.5 ${hasUpvoted ? 'text-white' : 'text-slate-500'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>
          {post.upvotesCount || 0}
        </button>

        <span className="text-[10px] font-mono text-slate-400 font-bold uppercase flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          {[post.district, post.state].filter(Boolean).join(' · ')}
        </span>
      </div>
    </article>
  );
};

const Community = () => {
  const { user, isLoggedIn } = useUser();
  const { addToast }         = useToast();
  const { t }                = useLanguage();

  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [sort,    setSort]    = useState('latest');
  const [page,    setPage]    = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'General', tags: '' });
  const [posting, setPosting] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, sort };
      if (category !== 'All') params.category = category;
      const res = await axios.get('/api/community', { params });
      setPosts(res.data?.data || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [category, sort, page]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => { setPage(1); }, [category, sort]);

  const handleUpvote = async (postId) => {
    if (!isLoggedIn) {
      addToast({ type: 'info', message: 'Please sign in to upvote discussions.' });
      return;
    }
    try {
      const res = await axios.post(`/api/community/${postId}/upvote`, { userId: user._id });
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                upvotedBy:    res.data?.data?.upvotedBy || p.upvotedBy,
                upvotesCount: res.data?.data?.upvotesCount || p.upvotesCount,
              }
            : p
        )
      );
    } catch {
      addToast({ type: 'error', message: 'Failed to complete upvote.' });
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      addToast({ type: 'info', message: 'All text inputs are required.' });
      return;
    }
    setPosting(true);
    try {
      const tagsArr = form.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
      await axios.post('/api/community', {
        title:      form.title.trim(),
        content:    form.content.trim(),
        category:   form.category,
        tags:       tagsArr,
        userId:     user?._id || user?.id || user?.username || 'anonymous_user',
        username:   user?.username || 'Citizen',
        authorName: user?.username || 'Citizen',
        district:   user?.district || 'Chennai',
        state:      user?.state || 'Tamil Nadu',
      });
      setForm({ title: '', content: '', category: 'General', tags: '' });
      setShowForm(false);
      addToast({ type: 'xp', message: 'Discussion posted successfully. +15 XP earned.' });
      fetchPosts();
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Discussion post failed.' });
    } finally {
      setPosting(false);
    }
  };

  return (
    <main className="page-wrapper space-y-6 animate-slide-up">

      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <section
        className="rounded-xl p-8 bg-white border border-slate-200 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gov-navy" />
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <p className="section-label">{t('forumTitle') === 'குடிமக்கள் மன்றம்' ? 'குடிமக்கள் மன்றம்' : t('forumTitle') === 'नागरिक फोरम' ? 'नागरिक फोरम' : 'CITIZEN ENGAGEMENT BOARD'}</p>
            <h1 className="font-display font-black text-2xl text-gov-navy">
              {t('forumTitle')}
            </h1>
            <p className="text-slate-500 text-xs max-w-lg">
              {t('forumDesc')}
            </p>
          </div>
          {isLoggedIn ? (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="btn-cyan font-display tracking-widest text-[9px]"
              id="create-post-btn"
            >
              {showForm ? '✕ CANCEL' : t('forumNewBtn')}
            </button>
          ) : (
            <p className="text-xs font-mono text-slate-400 italic">{t('forumGuestMsg')}</p>
          )}
        </div>
      </section>

      {/* ── CREATE FORM ─────────────────────────────────────────────── */}
      {showForm && isLoggedIn && (
        <form
          onSubmit={handleCreatePost}
          className="glass-card p-6 space-y-4 animate-slide-up"
          aria-label="New discussion form"
        >
          <p className="section-label">{t('forumNewTitle')}</p>

          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            className="input-field"
            placeholder={t('forumInputTitle')}
            maxLength={120}
            required
            id="post-title"
          />

          <textarea
            rows={3}
            value={form.content}
            onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
            className="input-field resize-none text-xs"
            placeholder={t('forumInputContent')}
            maxLength={2000}
            required
            id="post-content"
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-widest">{t('forumInputCategory')}</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="input-field text-xs"
                id="post-category"
              >
                {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-widest">{t('forumInputTags')}</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                className="input-field text-xs"
                placeholder="tag1, tag2"
                id="post-tags"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={posting}
              className="flex-1 btn-cyan py-2.5 font-display tracking-widest text-[9px]"
              id="post-submit-btn"
            >
              {posting ? 'PUBLISHING...' : t('forumPublishBtn')}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-ghost px-4 py-2.5 font-display text-[9px]">
              {t('forumCancelBtn')}
            </button>
          </div>
        </form>
      )}

      {/* ── FILTERS ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar" role="tablist" aria-label="Filters">
          {CATEGORIES.map((cat) => {
            let catName = cat;
            if (cat === 'All') catName = t('navHome') === 'Home' ? 'ALL' : t('navHome') === 'முகப்பு' ? 'அனைத்தும்' : 'सभी';
            else {
              if (t('navServices') === 'சேவைகள்') {
                const taMap = {
                  'General': 'பொதுவானவை',
                  'Infrastructure': 'உள்கட்டமைப்பு',
                  'Education': 'கல்வி',
                  'Health': 'சுகாதாரம்',
                  'Agriculture': 'விவசாயம்',
                  'Finance': 'நிதி',
                  'Employment': 'வேலைவாய்ப்பு',
                  'Environment': 'சுற்றுச்சூழல்',
                  'Governance': 'ஆளுகை',
                };
                catName = taMap[cat] || cat;
              } else if (t('navServices') === 'सेवाएं') {
                const hiMap = {
                  'General': 'सामान्य',
                  'Infrastructure': 'बुनियादी ढांचा',
                  'Education': 'शिक्षा',
                  'Health': 'स्वास्थ्य',
                  'Agriculture': 'कृषि',
                  'Finance': 'वित्त',
                  'Employment': 'रोजगार',
                  'Environment': 'पर्यावरण',
                  'Governance': 'शासन',
                };
                catName = hiMap[cat] || cat;
              }
            }
            return (
              <button
                key={cat}
                role="tab"
                aria-selected={category === cat}
                onClick={() => setCategory(cat)}
                className="px-3 py-1.5 rounded font-mono text-[9px] font-extrabold border transition-all hover:bg-slate-100 hover:text-gov-navy"
                style={{
                  background:  category === cat ? 'var(--gov-navy)' : '#f8fafc',
                  borderColor: category === cat ? 'var(--gov-navy)' : '#94a3b8',
                  color:       category === cat ? '#ffffff'          : '#0f172a',
                }}
                id={`community-cat-${cat}`}
              >
                {catName.toUpperCase()}
              </button>
            );
          })}
        </div>
        <div className="flex gap-1 flex-shrink-0 bg-white p-0.5 rounded border border-slate-200">
          {[['latest','LATEST'],['popular','POPULAR']].map(([v,l]) => {
            let label = l;
            if (t('navHome') === 'முகப்பு') {
              label = v === 'latest' ? 'புதியவை' : 'பிரபலமானவை';
            } else if (t('navHome') === 'होम') {
              label = v === 'latest' ? 'नवीनतम' : 'लोकप्रिय';
            }
            return (
              <button
                key={v}
                onClick={() => setSort(v)}
                className="px-3 py-1.5 rounded font-mono text-[9px] font-bold transition-all"
                style={{
                  background: sort === v ? 'var(--gov-navy)' : 'transparent',
                  color:      sort === v ? '#ffffff'          : '#64748b',
                }}
                id={`sort-${v}-btn`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── POSTS LIST ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-32" />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((p) => {
            // Localize category labels on posts dynamically
            const rawCat = p.category || 'General';
            let localizedCat = rawCat;
            if (t('navServices') === 'சேவைகள்') {
              const taMap = {
                'General': 'பொதுவானவை',
                'Infrastructure': 'உள்கட்டமைப்பு',
                'Education': 'கல்வி',
                'Health': 'சுகாதாரம்',
                'Agriculture': 'விவசாயம்',
                'Finance': 'நிதி',
                'Employment': 'வேலைவாய்ப்பு',
                'Environment': 'சுற்றுச்சூழல்',
                'Governance': 'ஆளுகை',
              };
              localizedCat = taMap[rawCat] || rawCat;
            } else if (t('navServices') === 'सेवाएं') {
              const hiMap = {
                'General': 'सामान्य',
                'Infrastructure': 'बुनियादी ढांचा',
                'Education': 'शिक्षा',
                'Health': 'स्वास्थ्य',
                'Agriculture': 'कृषि',
                'Finance': 'वित्त',
                'Employment': 'रोजगार',
                'Environment': 'पर्यावरण',
                'Governance': 'शासन',
              };
              localizedCat = hiMap[rawCat] || rawCat;
            }
            return (
              <PostCard
                key={p._id}
                post={{ ...p, category: localizedCat }}
                onUpvote={handleUpvote}
                currentUserId={user?._id || user?.username}
              />
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-12 text-center space-y-2">
          <p className="font-bold text-slate-600 text-sm">{t('forumNoPosts')}</p>
        </div>
      )}

      {/* ── PAGINATION ──────────────────────────────────────────── */}
      {!loading && totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-ghost btn-sm font-mono text-[9px]"
            id="community-prev-btn"
          >
            {t('forumPrev')}
          </button>
          <span className="text-[10px] font-mono text-slate-500 font-bold">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-ghost btn-sm font-mono text-[9px]"
            id="community-next-btn"
          >
            {t('forumNext')}
          </button>
        </nav>
      )}
    </main>
  );
};

export default Community;
