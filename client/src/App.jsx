import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider }  from './context/UserContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar            from './components/Navbar';
import Toast             from './components/Toast';
import DocumentProcessor from './components/DocumentProcessor';
import AIChatWidget      from './components/AIChatWidget';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Services  = React.lazy(() => import('./pages/Services'));
const Schemes   = React.lazy(() => import('./pages/Schemes'));
const Students  = React.lazy(() => import('./pages/Students'));
const Community = React.lazy(() => import('./pages/Community'));
const Profile   = React.lazy(() => import('./pages/Profile'));

/* ── Government Portal Loading Spinner ───────────────────────────────── */
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4 animate-fade-in">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 text-gov-navy animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
      <div className="text-center space-y-1">
        <p className="text-xs font-bold text-gov-navy tracking-widest font-display">LocGovt</p>
        <p className="text-[10px] text-slate-400 font-mono">LOADING OFFICIAL RESOURCES...</p>
      </div>
    </div>
  </div>
);

const DocumentsPage = () => (
  <main className="page-wrapper">
    <DocumentProcessor />
  </main>
);

const App = () => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <LanguageProvider>
      <UserProvider>
        <ToastProvider>
          <Toast />

          <div className="min-h-screen flex flex-col bg-[#f4f6f9]">
          {/* Flag Ribbon at very top of screen */}
          <div className="tricolor-ribbon" />

          {/* Navigation Bar */}
          <Navbar />

          <div className="flex-1">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/"          element={<Dashboard />}   />
                <Route path="/services"  element={<Services />}    />
                <Route path="/schemes"   element={<Schemes />}     />
                <Route path="/students"  element={<Students />}    />
                <Route path="/community" element={<Community />}   />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/profile"   element={<Profile />}     />
                <Route path="*"          element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>

          {/* ── Official Government Footer ──────────────────────────────── */}
          <footer className="border-t border-slate-200 bg-white mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
                
                {/* Logo & Seal */}
                <div className="flex items-center gap-3">
                  <img
                    src="/ai-logo.png"
                    alt="LocGovt Logo Footer"
                    className="w-10 h-10 rounded-full object-cover shadow-sm select-none"
                  />
                  <div>
                    <p className="font-display font-bold text-gov-navy text-sm tracking-wider">LocGovt</p>
                    <p className="text-[9px] text-slate-500 font-mono tracking-widest uppercase">National Citizen Portal</p>
                  </div>
                </div>

                {/* Tricolor Note */}
                <div className="text-center">
                  <p className="text-xs text-slate-500 leading-relaxed font-mono">
                    🇮🇳 An official initiative for localized governance analytics.
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    Secure local client processing. Zero data leaks.
                  </p>
                </div>

                {/* Copyright info */}
                <div className="text-right text-xs text-slate-500 font-mono">
                  <p>© {new Date().getFullYear()} LocGovt</p>
                  <p className="text-[10px] text-gov-navy font-bold mt-1">Developed by @Dhivakaran</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">MeitY Guidelines Compliant</p>
                </div>

              </div>
            </div>
          </footer>
          <AIChatWidget />
        </div>
      </ToastProvider>
    </UserProvider>
    </LanguageProvider>
  </BrowserRouter>
);

export default App;
