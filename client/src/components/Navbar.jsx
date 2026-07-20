import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';

const NAV_LINKS = [
  {
    to: '/',
    labelKey: 'navHome',
    icon: (className = "w-4 h-4") => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>
    )
  },
  {
    to: '/services',
    labelKey: 'navServices',
    icon: (className = "w-4 h-4") => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
      </svg>
    )
  },
  {
    to: '/schemes',
    labelKey: 'navSchemes',
    icon: (className = "w-4 h-4") => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
      </svg>
    )
  },
  {
    to: '/students',
    labelKey: 'navStudents',
    icon: (className = "w-4 h-4") => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/>
      </svg>
    )
  },
  {
    to: '/community',
    labelKey: 'navForum',
    icon: (className = "w-4 h-4") => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/>
      </svg>
    )
  },
  {
    to: '/documents',
    labelKey: 'navDocs',
    icon: (className = "w-4 h-4") => (
      <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/>
      </svg>
    )
  },
];

const XPDisplay = ({ xp, level }) => (
  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded bg-slate-100 border border-slate-200">
    <span className="font-display text-gov-navy text-xs font-bold">{level}</span>
    <div className="w-px h-4 bg-slate-300" />
    <span className="font-mono text-[10px] text-slate-500 font-bold">{xp.toLocaleString()} XP</span>
  </div>
);

const Navbar = () => {
  const { user, isLoggedIn, logout } = useUser();
  const { locale, setLocale, t }     = useLanguage();
  const location                     = useLocation();
  const [isMenuOpen, setMenuOpen]    = useState(false);
  const [isUserOpen, setUserOpen]    = useState(false);
  const [scrolled, setScrolled]      = useState(false);
  const userRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => { setMenuOpen(false); setUserOpen(false); }, [location.pathname]);

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white border-b border-slate-200 shadow-md'
          : 'bg-white/95 border-b border-slate-200/60'
      }`}
      aria-label={t('navAria')}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo & Title ────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0" aria-label="LocGovt Home">
            <img
              src="/ai-logo.png"
              alt="LocGovt Logo"
              className="w-9 h-9 rounded-full object-cover shadow-sm select-none"
            />
            <div>
              <p className="font-display text-gov-navy text-sm font-black tracking-wider leading-none">
                LocGovt
              </p>
              <p className="text-gov-saffron text-[9px] font-bold font-mono tracking-widest uppercase mt-0.5 leading-none">
                {t('navHome') === 'Home' ? 'CITIZEN PORTAL' : t('navProfile') === 'குடிமகன் சுயவிவரம்' ? 'குடிமக்கள் போர்டல்' : 'नागरिक पोर्टल'}
              </p>
            </div>
          </Link>

          {/* ── Desktop Links ───────────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-1" role="list">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                role="listitem"
                className={`flex items-center gap-1.5 px-3 py-2 rounded text-xs font-bold tracking-wider uppercase transition-all ${
                  isActive(link.to)
                    ? 'bg-slate-100 text-gov-navy border-b-2 border-gov-navy'
                    : 'text-slate-600 hover:text-gov-navy hover:bg-slate-50'
                }`}
                aria-current={isActive(link.to) ? 'page' : undefined}
              >
                <span>{link.icon()}</span>
                <span className="font-display">{t(link.labelKey)}</span>
              </Link>
            ))}
          </div>

          {/* ── Right Navigation Section ────────────────────────────── */}
          <div className="flex items-center gap-3">
            
            {/* Language Select Dropdown */}
            <div className="relative hidden md:block">
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded px-2.5 py-1.5 outline-none font-bold cursor-pointer hover:bg-slate-100 transition-all"
                aria-label="Language Selector"
                id="language-selector"
              >
                <option value="en">English</option>
                <option value="ta">தமிழ்</option>
                <option value="hi">हिंदी</option>
              </select>
            </div>

            {isLoggedIn ? (
              <>
                <XPDisplay xp={user.citizenXP || 0} level={`LEVEL ${user.currentLevel || 1}`} />

                {/* Clerk User Button and Profile Link */}
                <div className="flex items-center gap-3">
                  <Link
                    to="/profile"
                    className="p-2 text-slate-500 hover:text-gov-navy transition-all font-bold text-xs"
                    title={t('navProfile')}
                  >
                    👤
                  </Link>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <button className="btn-cyan btn-sm font-display tracking-widest text-[9px] uppercase" id="clerk-signin-btn">
                    ⚡ {locale === 'ta' ? 'உள்நுழைக' : locale === 'hi' ? 'लॉगिन' : 'Sign In'}
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded font-display tracking-widest text-[9px] uppercase font-bold transition-all shadow-sm" id="clerk-signup-btn">
                    ✨ {locale === 'ta' ? 'பதிவு செய்க' : locale === 'hi' ? 'रजिस्टर' : 'Sign Up'}
                  </button>
                </SignUpButton>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden p-2 rounded hover:bg-slate-100 transition-all"
              aria-label="Toggle mobile menu"
              aria-expanded={isMenuOpen}
            >
              <div className="w-5 flex flex-col gap-1">
                <span className={`block h-0.5 bg-slate-700 transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`block h-0.5 bg-slate-700 transition-all ${isMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 bg-slate-700 transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>

        </div>

        {/* ── Mobile menu items ─────────────────────────────────────── */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-3 space-y-1 bg-white animate-slide-up">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-2.5 rounded text-xs font-bold tracking-wider uppercase transition-all ${
                  isActive(link.to)
                    ? 'bg-slate-100 text-gov-navy'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{link.icon("w-5 h-5")}</span>
                <span>{t(link.labelKey)}</span>
              </Link>
            ))}
            {/* Mobile Language Selector */}
            <div className="border-t border-slate-100 pt-3 px-4 flex items-center justify-between gap-4 mt-2">
              <span className="text-[10px] font-bold text-slate-500 font-mono">LANGUAGE / மொழி:</span>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded px-2.5 py-1.5 outline-none font-bold cursor-pointer hover:bg-slate-100 transition-all"
                aria-label="Language Selector Mobile"
                id="language-selector-mobile"
              >
                <option value="en">English</option>
                <option value="ta">தமிழ்</option>
                <option value="hi">हिंदी</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
