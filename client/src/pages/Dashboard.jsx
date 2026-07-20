import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import LevelWidget from '../components/LevelWidget';
import ServiceCard from '../components/ServiceCard';

const StatTile = ({ label, value, unit, color, icon, bg }) => (
  <div
    className="glass-card p-5 flex items-center gap-4 hover:scale-[1.01] transition-transform"
    style={{ borderLeftWidth: '4px', borderLeftColor: color }}
  >
    <div
      className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 text-xl shadow-sm border border-slate-200"
      style={{ background: bg }}
    >
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-500 uppercase font-display tracking-wider">{label}</p>
      <p className="text-xl font-bold font-display text-gov-navy mt-0.5">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span className="text-xs text-slate-500 font-normal ml-1">{unit}</span>}
      </p>
    </div>
  </div>
);

const QuickAction = ({ to, icon, label, desc, bg, border }) => (
  <Link
    to={to}
    className="glass-card p-5 flex items-start gap-4 transition-all hover:-translate-y-0.5"
    style={{ borderColor: border }}
  >
    <div
      className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-xl shadow-sm border border-slate-200"
      style={{ background: bg }}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold font-display text-gov-navy uppercase tracking-wider">{label}</p>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
    </div>
    <svg className="w-4 h-4 text-slate-400 self-center flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
    </svg>
  </Link>
);

const PostPreview = ({ post }) => (
  <div className="glass-card p-4 hover:border-slate-300 transition-all">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gov-navy line-clamp-2 leading-relaxed">{post.title}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="badge badge-glass text-[9px]">
            {post.category}
          </span>
          <span className="text-[10px] text-slate-500 font-mono font-bold flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>
            {post.upvotes?.length || 0}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">@{post.author?.username || 'citizen'}</span>
        </div>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user, isLoggedIn } = useUser();
  const { addToast }         = useToast();
  const { t }                = useLanguage();

  const [recs,    setRecs]    = useState([]);
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (isLoggedIn && user.district) params.district = user.district;

      const [recRes, postRes] = await Promise.all([
        axios.get('/api/services/recommendations', { params }),
        axios.get('/api/community', { params: { limit: 4, sort: 'popular' } }),
      ]);

      setRecs(recRes.data?.data  || []);
      setPosts(postRes.data?.data || []);
    } catch {
      addToast({ type: 'error', title: 'LOAD ERROR', message: 'Could not fetch dashboard analytics.' });
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, user?.district, addToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const xp       = user?.citizenXP     || 0;
  const level    = user?.currentLevel  || 1;
  const posts_n  = user?.stats?.postsCreated    || 0;
  const services_n = user?.stats?.servicesVisited || 0;
  const feedbacks_n = user?.stats?.feedbackGiven || 0;

  const QUICK_ACTIONS = [
    {
      to: '/services',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
        </svg>
      ),
      label: t('navServices'),
      desc: t('dashGateServicesDesc'),
      bg: '#f0f9ff',
      border: '#bae6fd'
    },
    {
      to: '/community',
      icon: (
        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/>
        </svg>
      ),
      label: t('navForum'),
      desc: t('dashGateForumDesc'),
      bg: '#faf5ff',
      border: '#e9d5ff'
    },
    {
      to: '/documents',
      icon: (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/>
        </svg>
      ),
      label: t('navDocs'),
      desc: t('dashGateDocsDesc'),
      bg: '#f0fdf4',
      border: '#bbf7d0'
    },
    {
      to: '/profile',
      icon: (
        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      ),
      label: t('navProfile'),
      desc: t('dashGateProfileDesc'),
      bg: '#fffbeb',
      border: '#fde68a'
    },
  ];

  return (
    <main className="page-wrapper space-y-8 animate-slide-up">

      {/* ── FLAG BRANDING & HERO ──────────────────────────────────────── */}
      <section
        className="rounded-xl p-8 bg-white border border-slate-200 shadow-sm relative overflow-hidden"
      >
        {/* Saffron and green border ribbons */}
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{
          background: 'linear-gradient(90deg, #ff9933 0%, #ff9933 50%, #138808 50%, #138808 100%)'
        }} />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pt-2">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2">
              <span className="status-dot status-up" />
              <span className="text-[10px] font-bold text-gov-green font-mono uppercase tracking-wider">{t('dashLive')}</span>
            </div>

            <div>
              <p className="section-label mb-1">{t('dashGateway')}</p>
              <h1 className="font-display font-black text-2xl md:text-3xl text-gov-navy leading-none">
                LocGovt
              </h1>
              <p className="text-slate-500 text-sm mt-3 max-w-xl leading-relaxed font-medium">
                {isLoggedIn
                  ? t('dashWelcomeUser', { username: user.username, district: user.district, state: user.state })
                  : t('dashWelcomeGuest')}
              </p>
            </div>

            {!isLoggedIn && (
              <div className="pt-2">
                <Link to="/profile" className="btn-cyan btn-lg font-display tracking-widest text-[11px]">
                  ⚡ {t('navConnect')}
                </Link>
              </div>
            )}
          </div>

          {/* XP Widget for logged in */}
          {isLoggedIn && (
            <div className="w-full md:w-52 flex-shrink-0">
              <LevelWidget xp={xp} />
            </div>
          )}
        </div>
      </section>

      {/* ── STATS ROW (logged in) ─────────────────────────────────────── */}
      {isLoggedIn && (
        <section aria-label="Citizen statistics">
          <p className="section-label mb-3">{t('dashStatsTitle')}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatTile
              label={t('dashStatsXp')}
              value={xp}
              color="#0f294a"
              bg="#f1f5f9"
              icon={
                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              }
            />
            <StatTile
              label={t('dashStatsLvl')}
              value={level}
              color="#7c3aed"
              bg="#faf5ff"
              icon={
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm-2 2h4M5 8h14v5a7 7 0 01-14 0V8z"/>
                </svg>
              }
            />
            <StatTile
              label={t('dashStatsVisited')}
              value={services_n}
              color="#16a34a"
              bg="#f0fdf4"
              icon={
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              }
            />
            <StatTile
              label={t('dashStatsFeedback')}
              value={feedbacks_n}
              color="#d97706"
              bg="#fffbeb"
              icon={
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                </svg>
              }
            />
          </div>
        </section>
      )}

      {/* ── QUICK ACTIONS ─────────────────────────────────────────────── */}
      <section aria-label="Quick navigation links">
        <p className="section-label mb-3">{t('dashGateways')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUICK_ACTIONS.map((a) => (
            <QuickAction key={a.to} {...a} />
          ))}
        </div>
      </section>

      {/* ── RECOMMENDED SERVICES ──────────────────────────────────────── */}
      <section aria-label="Regional recommendations">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="section-label">
              {isLoggedIn ? t('dashPopularLocal', { district: user.district.toUpperCase() }) : t('dashTrendingPortals')}
            </p>
          </div>
          <Link to="/services" className="btn-ghost btn-sm font-display tracking-widest text-[9px]">
            {t('dashViewDirectory')}
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-48" />
            ))}
          </div>
        ) : recs.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            {recs.map((s) => (
              <ServiceCard key={s._id} service={s} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-10 text-center">
            <p className="text-slate-500 text-xs font-mono">{t('dashNoRecs')}</p>
            <Link to="/services" className="btn-cyan mt-4 font-display text-[10px]">
              {t('dashExploreAll')}
            </Link>
          </div>
        )}
      </section>

      {/* ── COMMUNITY DISCUSSIONS ────────────────────────────────────────── */}
      {posts.length > 0 && (
        <section aria-label="Active community discussions">
          <div className="flex items-center justify-between mb-4">
            <p className="section-label-purple">{t('dashForumTitle')}</p>
            <Link to="/community" className="btn-ghost btn-sm font-display tracking-widest text-[9px]">
              {t('dashEnterBoard')}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {posts.map((p) => (
              <PostPreview key={p._id} post={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── MISSION STATEMENT ────────────────────────────────────────── */}
      <section
        className="rounded-xl p-8 text-center space-y-3 bg-white border border-slate-200 shadow-sm"
      >
        <p className="font-display font-extrabold text-[10px] tracking-wider text-gov-navy uppercase">{t('dashCharterTitle')}</p>
        <p className="text-slate-600 text-xs leading-relaxed max-w-2xl mx-auto font-display">
          {t('dashCharterDesc')}
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          {['Official Schemes', 'District Specific Analytics', 'GDPR Guidelines', 'Local File Tools'].map((tag) => (
            <span key={tag} className="badge badge-glass text-[9px] font-mono">{tag}</span>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
