import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../locales/translations';
import FeedbackModal from './FeedbackModal';

const getLocalizedName = (name, locale) => {
  return translations[locale]?.serviceNames?.[name] || name;
};

const CAT_STYLES = {
  'Identity & Documents':  { border: '#bae6fd', bg: '#f0f9ff', badge: 'badge-cyan' },
  'Health & Medical':      { border: '#bbf7d0', bg: '#f0fdf4', badge: 'badge-green' },
  'Education & Scholarships': { border: '#e9d5ff', bg: '#faf5ff', badge: 'badge-purple' },
  'Agriculture & Farming': { border: '#fde68a', bg: '#fffbeb', badge: 'badge-amber' },
  'Finance & Banking':     { border: '#fed7aa', bg: '#fff7ed', badge: 'badge-glass' },
  'Housing & Infrastructure': { border: '#fbcfe8', bg: '#fdf2f8', badge: 'badge-red' },
  'Employment & Pensions': { border: '#c5f6fa', bg: '#ecfeff', badge: 'badge-cyan' },
  'Transport & Vehicle':   { border: '#ffd8a8', bg: '#fffaf0', badge: 'badge-glass' },
  'Social Welfare':        { border: '#bae6fd', bg: '#faf5ff', badge: 'badge-purple' },
  default:                 { border: '#e2e8f0', bg: '#ffffff', badge: 'badge-glass' },
};

const getStyle = (cat) => CAT_STYLES[cat] || CAT_STYLES.default;

const CategoryBanner = ({ category, name }) => {
  const nameLower = name.toLowerCase();

  const getUrl = () => {
    // 1. Official Indian Government Portal Logos & Uploaded Visual Assets (Local Assets)
    if (nameLower.includes('aadhaar')) {
      return '/logo-aadhaar.svg';
    }
    if (nameLower.includes('digilocker')) {
      return '/logo-digilocker.svg';
    }
    if (nameLower.includes('passport')) {
      return '/logo-passport.svg';
    }
    if (nameLower.includes('ayushman') || nameLower.includes('jan arogya') || nameLower.includes('pm-jay')) {
      return '/logo-ayushman-card.png';
    }
    if (nameLower.includes('voter')) {
      return '/logo-voter.svg';
    }
    if (nameLower.includes('birth') || nameLower.includes('death')) {
      return '/logo-birth-death.png';
    }
    if (nameLower.includes('national portal')) {
      return '/logo-national-portal.png';
    }
    if (nameLower.includes('e-district')) {
      return '/logo-e-district.png';
    }
    if (nameLower.includes('e-sevai') || nameLower.includes('tnega')) {
      return '/logo-e-sevai.png';
    }
    if (nameLower.includes('pan card') || nameLower.includes('nsdl')) {
      return '/logo-pan-card.png';
    }
    if (nameLower.includes('makkalai') || nameLower.includes('doorsteps')) {
      return '/logo-makkalai-thedi.png';
    }
    if (nameLower.includes('cowin') || nameLower.includes('covid')) {
      return '/logo-cowin.png';
    }
    if (nameLower.includes('aushadhi') || nameLower.includes('pmbjp')) {
      return '/logo-pmbjp.png';
    }
    if (nameLower.includes('abdm') || nameLower.includes('digital health mission')) {
      return '/logo-abdm.png';
    }
    if (nameLower.includes('income tax')) {
      return '/logo-income-tax.png';
    }
    if (nameLower.includes('gst')) {
      return '/logo-gst.png';
    }
    if (nameLower.includes('mudra')) {
      return '/logo-mudra.png';
    }
    if (nameLower.includes('bhim') || nameLower.includes('upi')) {
      return '/logo-bhim.png';
    }
    if (nameLower.includes('kanavu illam')) {
      return '/logo-kanavu-illam.png';
    }
    if (nameLower.includes('bhunaksha') || nameLower.includes('naksha')) {
      return '/logo-bhunaksha.png';
    }
    if (nameLower.includes('rera')) {
      return '/logo-rera.png';
    }
    if (nameLower.includes('pmay-u') || nameLower.includes('urban')) {
      return '/logo-pmay-u.png';
    }
    if (nameLower.includes('pmay') || nameLower.includes('awas yojana')) {
      return '/logo-pmay.png';
    }
    if (nameLower.includes('swachh bharat') || nameLower.includes('swachh')) {
      return '/logo-swachh-bharat.png';
    }
    if (nameLower.includes('sarathi') || nameLower.includes('driving licence') || nameLower.includes('license')) {
      return '/logo-sarathi.png';
    }
    if (nameLower.includes('vahan') || nameLower.includes('vehicle registration')) {
      return '/logo-vahan.png';
    }
    if (nameLower.includes('fastag')) {
      return '/logo-fastag.png';
    }
    if (nameLower.includes('irad') || nameLower.includes('accident database')) {
      return '/logo-irad.png';
    }
    if (nameLower.includes('vishwakarma')) {
      return '/logo-vishwakarma.png';
    }
    if (nameLower.includes('sports kit')) {
      return '/logo-sports-kit.png';
    }
    if (nameLower.includes('kisan') || nameLower.includes('pm-kisan')) {
      return '/logo-pm-kisan.png';
    }
    if (nameLower.includes('pudhumai') || nameLower.includes('penn scheme')) {
      return '/logo-pudhumai-penn.png';
    }
    if (nameLower.includes('pudhalvan') || nameLower.includes('pudhalvan scheme')) {
      return '/logo-pudhalvan.png';
    }
    if (nameLower.includes('magalir urimai') || nameLower.includes('urimai thogai')) {
      return '/logo-magalir-urimai.png';
    }
    if (nameLower.includes('naan mudhalvan') || nameLower.includes('mudhalvan scheme')) {
      return '/logo-naan-mudhalvan.png';
    }
    if (nameLower.includes('illam thedi') || nameLower.includes('thedi kalvi')) {
      return '/logo-illam-thedi.png';
    }
    if (nameLower.includes('enam') || nameLower.includes('national agriculture market')) {
      return '/logo-enam.png';
    }
    if (nameLower.includes('pmfby') || nameLower.includes('fasal bima')) {
      return '/logo-pmfby.png';
    }
    if (nameLower.includes('soil health') || nameLower.includes('soil card')) {
      return '/logo-soil-card.png';
    }
    if (nameLower.includes('pmry') || nameLower.includes('rozgar yojana')) {
      return '/logo-pmry.png';
    }
    if (nameLower.includes('employment portal') || nameLower.includes('velaivaaippu') || nameLower.includes('employment registration')) {
      return '/logo-tn-employment.png';
    }
    if (nameLower.includes('epfo') || nameLower.includes('provident fund')) {
      return '/logo-epfo.png';
    }
    if (nameLower.includes('msme') || nameLower.includes('udyam')) {
      return '/logo-msme.png';
    }
    if (nameLower.includes('eshram') || nameLower.includes('shram')) {
      return '/logo-eshram.png';
    }
    if (nameLower.includes('national career service') || nameLower.includes('ncs portal')) {
      return '/logo-ncs.png';
    }
    if (nameLower.includes('pmsym') || nameLower.includes('shram yogi') || nameLower.includes('maandhan')) {
      return '/logo-pmsym.png';
    }
    if (nameLower.includes('national scholarship') || nameLower.includes('scholarship portal')) {
      return '/logo-nsp.png';
    }
    if (nameLower.includes('mudhalvarin mugavari') || nameLower.includes('cm helpline') || nameLower.includes('grievance redressal')) {
      return '/logo-mugavari.png';
    }
    if (nameLower.includes('swayam')) {
      return '/logo-swayam.png';
    }
    if (nameLower.includes('ugc') || nameLower.includes('university grants')) {
      return '/logo-ugc.png';
    }
    if (nameLower.includes('aicte') || nameLower.includes('technical education portal')) {
      return '/logo-aicte.png';
    }
    if (nameLower.includes('nyps') || nameLower.includes('youth parliament')) {
      return '/logo-nyps.png';
    }
    if (nameLower.includes('tangedco')) {
      return '/logo-tangedco.png';
    }
    if (nameLower.includes('tn police') || nameLower.includes('police e-services') || nameLower.includes('police e-services & complaints')) {
      return '/logo-tnpolice.png';
    }
    if (nameLower.includes('cams') || nameLower.includes('audit management') || nameLower.includes('citizen affairs monitoring')) {
      return '/logo-cams.png';
    }

    // 2. Keyword fallback images (Unsplash)
    if (nameLower.includes('laptop')) {
      return '/logo-tn-laptop.png';
    }
    if (nameLower.includes('bicycle') || nameLower.includes('cycle')) {
      return '/logo-bicycle.png';
    }
    if (nameLower.includes('sports') || nameLower.includes('football') || nameLower.includes('cricket') || nameLower.includes('kit')) {
      return 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=400&h=180&q=80';
    }
    if (nameLower.includes('breakfast') || nameLower.includes('food') || nameLower.includes('unavu')) {
      return '/logo-breakfast.png';
    }
    if (nameLower.includes('women') || nameLower.includes('penn') || nameLower.includes('urimai')) {
      return 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=180&q=80';
    }

    const mapping = {
      'Identity & Documents':      'https://images.unsplash.com/photo-1562564055-71e051d33c19?auto=format&fit=crop&w=400&h=180&q=80',
      'Health & Medical':          'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&h=180&q=80',
      'Education & Scholarships':  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=400&h=180&q=80',
      'Agriculture & Farming':     'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=400&h=180&q=80',
      'Finance & Banking':         'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=400&h=180&q=80',
      'Housing & Infrastructure':  'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&h=180&q=80',
      'Employment & Pensions':     'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&h=180&q=80',
      'Transport & Vehicle':       'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&h=180&q=80',
      'Social Welfare':            'https://images.unsplash.com/photo-1559027615-cd4487df3492?auto=format&fit=crop&w=400&h=180&q=80',
    };
    return mapping[category] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&h=180&q=80';
  };

  const isOfficialLogo = nameLower.includes('aadhaar') || nameLower.includes('digilocker') || nameLower.includes('passport') || nameLower.includes('ayushman') || nameLower.includes('jan arogya') || nameLower.includes('pm-jay') || nameLower.includes('voter') || nameLower.includes('birth') || nameLower.includes('death') || nameLower.includes('national portal') || nameLower.includes('e-district') || nameLower.includes('e-sevai') || nameLower.includes('tnega') || nameLower.includes('pan card') || nameLower.includes('nsdl') || nameLower.includes('makkalai') || nameLower.includes('doorsteps') || nameLower.includes('cowin') || nameLower.includes('covid') || nameLower.includes('aushadhi') || nameLower.includes('pmbjp') || nameLower.includes('abdm') || nameLower.includes('digital health mission') || nameLower.includes('income tax') || nameLower.includes('gst') || nameLower.includes('mudra') || nameLower.includes('bhim') || nameLower.includes('upi') || nameLower.includes('kanavu illam') || nameLower.includes('bhunaksha') || nameLower.includes('naksha') || nameLower.includes('rera') || nameLower.includes('pmay') || nameLower.includes('awas yojana') || nameLower.includes('swachh') || nameLower.includes('sarathi') || nameLower.includes('driving licence') || nameLower.includes('license') || nameLower.includes('vahan') || nameLower.includes('vehicle registration') || nameLower.includes('fastag') || nameLower.includes('irad') || nameLower.includes('accident database') || nameLower.includes('laptop') || nameLower.includes('vishwakarma') || nameLower.includes('sports kit') || nameLower.includes('kisan') || nameLower.includes('pm-kisan') || nameLower.includes('bicycle') || nameLower.includes('cycle') || nameLower.includes('pudhumai') || nameLower.includes('penn scheme') || nameLower.includes('pudhalvan') || nameLower.includes('magalir urimai') || nameLower.includes('urimai thogai') || nameLower.includes('breakfast') || nameLower.includes('food') || nameLower.includes('unavu') || nameLower.includes('naan mudhalvan') || nameLower.includes('illam thedi') || nameLower.includes('thedi kalvi') || nameLower.includes('enam') || nameLower.includes('national agriculture market') || nameLower.includes('pmfby') || nameLower.includes('fasal bima') || nameLower.includes('soil health') || nameLower.includes('soil card') || nameLower.includes('ifhrms') || nameLower.includes('pensioners') || nameLower.includes('pmry') || nameLower.includes('rozgar yojana') || nameLower.includes('employment portal') || nameLower.includes('velaivaaippu') || nameLower.includes('employment registration') || nameLower.includes('epfo') || nameLower.includes('provident fund') || nameLower.includes('msme') || nameLower.includes('udyam') || nameLower.includes('eshram') || nameLower.includes('shram') || nameLower.includes('national career service') || nameLower.includes('ncs portal') || nameLower.includes('pmsym') || nameLower.includes('shram yogi') || nameLower.includes('maandhan') || nameLower.includes('national scholarship') || nameLower.includes('scholarship portal') || nameLower.includes('mudhalvarin mugavari') || nameLower.includes('cm helpline') || nameLower.includes('grievance redressal') || nameLower.includes('swayam') || nameLower.includes('ugc') || nameLower.includes('university grants') || nameLower.includes('aicte') || nameLower.includes('technical education portal') || nameLower.includes('nyps') || nameLower.includes('youth parliament') || nameLower.includes('tangedco') || nameLower.includes('tn police') || nameLower.includes('police e-services') || nameLower.includes('cams') || nameLower.includes('audit management') || nameLower.includes('citizen affairs monitoring');

  if (isOfficialLogo) {
    return (
      <div className="h-28 w-full bg-white flex items-center justify-center relative overflow-hidden shrink-0 border-b border-slate-100/60 p-2">
        <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]" />
        <img
          src={getUrl()}
          alt={name}
          className="h-full w-full object-contain select-none"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="h-28 w-full overflow-hidden relative border-b border-slate-100/60 shrink-0">
      <img
        src={getUrl()}
        alt={name}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 select-none"
        loading="lazy"
      />
    </div>
  );
};

const StarRating = ({ value = 0 }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map((s) => (
      <svg key={s} className="w-3 h-3" fill={s <= Math.round(value) ? '#f59e0b' : 'none'} viewBox="0 0 24 24" stroke="#f59e0b" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ))}
  </div>
);

const GuidelinesModal = ({ service, onClose, t }) => {
  const overlayRef = useRef(null);

  // Default to global site language on modal open
  const [guideLocale, setGuideLocale] = useState(() => {
    return t('navHome') === 'முகப்பு' ? 'ta' : t('navHome') === 'होम' ? 'hi' : 'en';
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const getHeader = (loc) => {
    if (loc === 'ta') return 'வழிமுறைகள் & குறிப்புகள்';
    if (loc === 'hi') return 'दिशा-निर्देश और निर्देश';
    return 'GUIDELINES & INSTRUCTIONS';
  };

  const getButtonText = (loc) => {
    if (loc === 'ta') return 'புரிந்தது';
    if (loc === 'hi') return 'समझ गए';
    return 'UNDERSTOOD';
  };

  const guidelinesList = service.guidelines?.[guideLocale] || service.guidelines?.en || [];

  return (
    <div
      ref={overlayRef}
      className="modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-title"
    >
      <div className="modal-content max-w-md w-full p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="badge badge-cyan text-[8px] font-mono mb-1 font-bold">
              {getHeader(guideLocale)}
            </span>
            <h2 id="guide-title" className="text-slate-800 font-bold text-sm leading-snug">
              {getLocalizedName(service.serviceName, guideLocale)}
            </h2>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Modal-specific language selector */}
            <select
              value={guideLocale}
              onChange={(e) => setGuideLocale(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-[10px] rounded px-2 py-1 outline-none font-bold cursor-pointer hover:bg-slate-100 transition-all"
              aria-label="Modal Language Selector"
              id={`modal-lang-${service._id}`}
            >
              <option value="en">EN</option>
              <option value="ta">தமிழ்</option>
              <option value="hi">हिंदी</option>
            </select>

            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-sm pl-1" id="guide-close-btn">
              ✕
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3 space-y-4">
          {/* Full description display */}
          <div className="bg-slate-50 border border-slate-200 rounded p-3">
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {service.description}
            </p>
          </div>

          {/* Video Tutorial Section */}
          <div className="bg-red-50/60 border border-red-100 rounded-lg p-3.5 flex items-center justify-between gap-3 shadow-sm">
            <div className="min-w-0">
              <span className="text-[9px] font-bold font-mono text-red-500 tracking-wider block uppercase mb-1">
                {guideLocale === 'ta' ? 'விண்ணப்ப வீடியோ வழிகாட்டி' : guideLocale === 'hi' ? 'आवेदन வீடியோ गाइड' : 'VIDEO TUTORIAL GUIDE'}
              </span>
              <p className="text-slate-800 font-bold text-[11px] truncate leading-tight">
                {guideLocale === 'ta' ? 'விண்ணப்பிப்பது எப்படி என்ற வீடியோ விளக்கம்' : guideLocale === 'hi' ? 'आवेदन करने की चरण-दर-चरण प्रक्रिया' : 'Step-by-step application walkthrough'}
              </p>
            </div>
            <a
              href={
                service.videoUrl ||
                `https://www.youtube.com/results?search_query=${encodeURIComponent(
                  (service.serviceName || '').replace(/—|-|\(.*?\)/g, ' ').replace(/\s+/g, ' ').trim() + ' how to apply step by step tutorial'
                )}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded font-display text-[9px] font-black tracking-wider uppercase transition-all shadow-sm shrink-0"
              id={`video-tutorial-btn-${service._id}`}
            >
              {/* Premium Inline YouTube Play Icon SVG */}
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span>{guideLocale === 'ta' ? 'வீடியோவை பார்க்க' : guideLocale === 'hi' ? 'वीडियो देखें' : 'WATCH TUTORIAL'}</span>
            </a>
          </div>

          <div className="border-t border-slate-100 pt-3">
            <span className="text-[10px] font-bold font-mono text-slate-400 block mb-2">
              {getHeader(guideLocale)}
            </span>
            {guidelinesList && guidelinesList.length > 0 ? (
              <ul className="space-y-2.5 text-xs text-slate-600 list-disc pl-4 leading-relaxed font-display">
                {guidelinesList.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">No specific instructions recorded for this portal.</p>
            )}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="btn-cyan px-6 py-2 font-display text-[9px] tracking-widest"
            id="guide-done-btn"
          >
            {getButtonText(guideLocale)}
          </button>
        </div>
      </div>
    </div>
  );
};

const ServiceCard = ({ service }) => {
  const { user, isLoggedIn } = useUser();
  const { addToast }         = useToast();
  const { locale, t }        = useLanguage();
  const [isClicking, setClicking] = useState(false);
  const [localClicks, setLocalClicks] = useState(service.globalClickCount || 0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showGuide, setShowGuide]       = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  // Dynamic status tracking
  const [statusIndicator, setStatusIndicator] = useState(service.currentStatus?.indicator || 'UP');
  const [downVotes, setDownVotes]             = useState(service.currentStatus?.downVotesCount || 0);

  const style = getStyle(service.category);
  const score = parseFloat(service.averageRating || 0).toFixed(1);
  const count = service.totalFeedback || 0;

  const handleVisit = () => {
    if (!isLoggedIn) {
      addToast({
        type: 'info',
        message: t('cardVisitGate')
      });
      return;
    }

    // Open link immediately and synchronously to guarantee bypassing browser popup blocker
    window.open(service.officialUrl, '_blank', 'noopener,noreferrer');

    // Fire click tracking in background without yielding event loop
    axios.post(`/api/services/${service._id}/click`, { district: user.district })
      .then(() => setLocalClicks((p) => p + 1))
      .catch(() => {});
  };

  const handleReportDown = async () => {
    try {
      const res = await axios.post(`/api/services/${service._id}/report-down`);
      if (res.data?.success) {
        const { indicator, downVotesCount } = res.data.data.currentStatus;
        setStatusIndicator(indicator);
        setDownVotes(downVotesCount);
        addToast({
          type: indicator === 'DOWN' ? 'error' : 'success',
          message: `Report recorded. Downvotes: ${downVotesCount}/5. ${indicator === 'DOWN' ? 'Portal is now flagged as DOWN.' : 'Thanks for reporting.'}`
        });
      }
    } catch {
      addToast({ type: 'error', message: 'Failed to submit issue report.' });
    }
  };

  return (
    <>
      <article
        className="glass-card flex flex-col justify-between overflow-hidden"
        style={{ borderColor: style.border }}
        aria-label={`${getLocalizedName(service.serviceName, locale)} portal`}
      >
        {/* Flag line color accents */}
        <div className="h-1 bg-gov-navy opacity-70" />

        {/* Scheme Graphic Banner */}
        <CategoryBanner category={service.category} name={service.serviceName} />

        <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className={`badge ${style.badge} text-[8px] font-mono tracking-wider mb-1`}>
                  {service.category.toUpperCase()}
                </span>
                <h3 className="text-xs font-bold text-slate-800 leading-snug line-clamp-2">
                  {getLocalizedName(service.serviceName, locale)}
                </h3>
              </div>
              <div className="flex-shrink-0 flex items-center gap-1">
                <span className={`status-dot ${statusIndicator === 'UP' ? 'status-up' : 'status-down'}`} />
                <span className="text-[9px] font-bold text-slate-500 font-mono">
                  {statusIndicator === 'UP' ? t('cardStatusUp') : t('cardStatusDown')} {downVotes > 0 && statusIndicator === 'UP' && `(${downVotes})`}
                </span>
              </div>
            </div>

            {/* Description */}
            <p
              onClick={() => setDescExpanded(!descExpanded)}
              className={`text-xs text-slate-500 leading-relaxed cursor-pointer select-none transition-all duration-300 hover:text-slate-700 ${descExpanded ? '' : 'line-clamp-2'}`}
              title={t('navHome') === 'முகப்பு' ? 'முழு விளக்கத்தைக் காண கிளிக் செய்க' : t('navHome') === 'होम' ? 'पूरा विवरण देखने के लिए क्लिक करें' : 'Click to toggle full description'}
            >
              {service.description || 'Access official citizen utility links directly.'}
            </p>
          </div>

          {/* Rating stats */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
            <div className="flex items-center gap-1.5">
              <StarRating value={parseFloat(score)} />
              <span className="text-[10px] font-mono text-slate-500 font-bold">
                {t('cardRatingCount', { score, count })}
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              {localClicks.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Action row */}
        <div className="px-5 pb-5 pt-1 grid grid-cols-2 gap-2">
          <button
            onClick={handleVisit}
            disabled={isClicking}
            className="col-span-1 btn-cyan btn-sm font-display tracking-widest text-[9px] py-2 w-full flex items-center justify-center"
            id={`visit-btn-${service._id}`}
          >
            {isClicking ? t('cardLoading') : t('cardOpen')}
          </button>

          {/* Guidelines Guide */}
          <button
            onClick={() => setShowGuide(true)}
            className="col-span-1 py-1.5 rounded border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-600 transition-all text-xs flex items-center justify-center gap-1.5 px-2 w-full"
            title="Show Guidelines"
            id={`guide-btn-${service._id}`}
          >
            <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider truncate">
              {locale === 'ta' ? 'வழிமுறை' : locale === 'hi' ? 'गाइड' : 'Guide'}
            </span>
          </button>
          
          {/* Rate/Feedback */}
          <button
            onClick={() => {
              if (!isLoggedIn) {
                addToast({ type: 'info', message: t('cardVisitGate') });
                return;
              }
              setShowFeedback(true);
            }}
            className="col-span-1 py-1.5 rounded border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-500 transition-all text-xs flex items-center justify-center gap-1.5 px-2 w-full"
            title="Rate service"
            id={`rate-btn-${service._id}`}
          >
            <svg className="w-3.5 h-3.5 text-amber-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider truncate">
              {locale === 'ta' ? 'மதிப்பு' : locale === 'hi' ? 'रेट' : 'Rate'}
            </span>
          </button>
 
          {/* Report issue */}
          <button
            onClick={handleReportDown}
            className="col-span-1 py-1.5 rounded border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition-all text-xs flex items-center justify-center gap-1.5 px-2 w-full"
            title="Report portal as DOWN"
            id={`down-btn-${service._id}`}
          >
            <svg className="w-3.5 h-3.5 text-red-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider truncate">
              {locale === 'ta' ? 'புகார்' : locale === 'hi' ? 'रिपोर्ट' : 'Report'}
            </span>
          </button>
        </div>
      </article>

      {showFeedback && (
        <FeedbackModal
          service={service}
          onClose={() => setShowFeedback(false)}
        />
      )}

      {showGuide && (
        <GuidelinesModal
          service={service}
          onClose={() => setShowGuide(false)}
          t={t}
        />
      )}
    </>
  );
};

export default ServiceCard;
