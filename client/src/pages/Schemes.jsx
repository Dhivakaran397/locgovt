import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import ServiceCard from '../components/ServiceCard';

const CATEGORIES = [
  'All',
  'Social Welfare',
  'Education & Scholarships',
  'Agriculture & Farming',
  'Employment & Pensions',
];

const Schemes = () => {
  const { user, isLoggedIn } = useUser();
  const { t }                = useLanguage();

  const [schemes,  setSchemes]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [category,  setCategory]  = useState('All');
  const [search,    setSearch]    = useState('');
  const [sort,      setSort]      = useState('popular');
  const [page,      setPage]      = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,     setTotal]     = useState(0);
  const [layout,    setLayout]    = useState('grid');

  const LIMIT = 12;

  const fetchSchemes = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, sort, type: 'schemes' };
      if (category !== 'All') params.category = category;
      if (search.trim())      params.search    = search.trim();

      const res = await axios.get('/api/services', { params });
      setSchemes(res.data?.data || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
      setTotal(res.data?.pagination?.totalRecords || 0);
    } catch {
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  }, [category, search, sort, page]);

  useEffect(() => { fetchSchemes(); }, [fetchSchemes]);

  useEffect(() => { setPage(1); }, [category, search, sort]);

  const handleSearchSubmit = (e) => { e.preventDefault(); fetchSchemes(); };

  const SORT_OPTIONS = [
    { value: 'popular',  label: 'Most Popular'  },
    { value: 'rating',   label: 'Highest Rated' },
    { value: 'newest',   label: 'Newest First'  },
    { value: 'name',     label: 'A → Z'         },
  ];

  const getPageTitle = () => {
    if (t('navHome') === 'முகப்பு') return 'அரசு நலத்திட்டங்கள்';
    if (t('navHome') === 'होम') return 'सरकारी कल्याणकारी योजनाएं';
    return 'WELFARE SCHEMES DIRECTORY';
  };

  const getPageDesc = () => {
    if (t('navHome') === 'முகப்பு') return 'மத்திய மற்றும் மாநில அரசின் தகுதியுள்ள நலத்திட்டங்கள், உதவித்தொகைகள் மற்றும் விவசாய மானிய முகவரிகளைத் தேடுங்கள்.';
    if (t('navHome') === 'होम') return 'केंद्रीय और राज्य कल्याणकारी योजनाओं, छात्रवृत्तियों और कृषि सब्सिडी पोर्टलों की खोज करें।';
    return 'Search official national and state welfare schemes, student scholarships, and agricultural subsidies.';
  };

  const getPlaceholder = () => {
    if (t('navHome') === 'முகப்பு') return 'திட்டத்தின் பெயர், துறை அல்லது முக்கிய வார்த்தையை உள்ளிடவும்...';
    if (t('navHome') === 'होम') return 'योजना का नाम, विभाग या कीवर्ड दर्ज करें...';
    return 'Enter scheme name, department or keyword...';
  };

  const getSearchBtnText = () => {
    if (t('navHome') === 'முகப்பு') return 'தேடுக';
    if (t('navHome') === 'होम') return 'खोजें';
    return 'SEARCH';
  };

  const getResetBtnText = () => {
    if (t('navHome') === 'முகப்பு') return 'திட்டங்கள் அடைவை மீட்டமை';
    if (t('navHome') === 'होम') return 'योजना निर्देशिका रीसेट करें';
    return 'RESET SCHEME DIRECTORY';
  };

  const getNoResultsText = () => {
    if (t('navHome') === 'முகப்பு') return 'உங்கள் தேடலுக்கு எந்த திட்டங்களும் கிடைக்கவில்லை.';
    if (t('navHome') === 'होम') return 'आपकी खोज से मेल खाती कोई योजना नहीं मिली।';
    return 'No welfare schemes match your query.';
  };

  const getCategoryLabel = (cat) => {
    if (t('navHome') === 'முகப்பு') {
      const taCat = {
        'All': 'அனைத்தும்',
        'Social Welfare': 'சமூக நலம்',
        'Education & Scholarships': 'கல்வி & உதவித்தொகை',
        'Agriculture & Farming': 'விவசாயம் & பண்ணை',
        'Employment & Pensions': 'வேலைவாய்ப்பு & ஓய்வூதியம்',
      };
      return taCat[cat] || cat;
    }
    if (t('navHome') === 'होम') {
      const hiCat = {
        'All': 'सभी',
        'Social Welfare': 'समाज कल्याण',
        'Education & Scholarships': 'शिक्षा और छात्रवृत्ति',
        'Agriculture & Farming': 'कृषि और खेती',
        'Employment & Pensions': 'रोजगार और पेंशन',
      };
      return hiCat[cat] || cat;
    }
    return cat;
  };

  return (
    <main className="page-wrapper space-y-6 animate-slide-up">

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <section
        className="rounded-xl p-8 bg-white border border-slate-200 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gov-navy" />
        <div className="space-y-2">
          <p className="section-label">🌟 {t('navSchemes') || 'Schemes'}</p>
          <h1 className="font-display font-black text-2xl text-gov-navy">
            {getPageTitle()}
          </h1>
          <p className="text-slate-500 text-xs max-w-xl leading-relaxed">
            {getPageDesc()}
            {isLoggedIn && ` ${t('servicesDescUser', { district: user.district, state: user.state })}`}
          </p>
        </div>
      </section>

      {/* ── SEARCH BAR ─────────────────────────────────────────────── */}
      <form onSubmit={handleSearchSubmit} className="flex gap-3" role="search" aria-label="Search schemes">
        <div className="relative flex-1">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-4"
            placeholder={getPlaceholder()}
            id="schemes-search"
            aria-label="Search schemes"
          />
        </div>
        <button type="submit" className="btn-cyan px-5 font-display tracking-widest text-[10px]" id="schemes-search-btn">
          {getSearchBtnText()}
        </button>
      </form>

      {/* ── FILTER CHIPS & LAYOUT TOGGLE ───────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Categories scroll container */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 max-w-full sm:max-w-[70%]">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`
                px-3.5 py-2 rounded font-mono text-[9px] font-extrabold tracking-wider whitespace-nowrap transition-all duration-200
                ${category === cat
                  ? 'bg-gov-navy text-white border border-gov-navy shadow-sm'
                  : 'bg-[#f8fafc] border border-[#94a3b8] text-[#0f172a] hover:bg-slate-100 hover:text-gov-navy'
                }
              `}
              id={`cat-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            >
              {getCategoryLabel(cat).toUpperCase()}
            </button>
          ))}
        </div>

        {/* Sorting & Layout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono mr-1">
              {t('servicesSort')}
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded px-2.5 py-1.5 outline-none cursor-pointer hover:bg-slate-50 transition-all"
              id="schemes-sort-select"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center border border-slate-200 rounded p-0.5 bg-white">
            <button
              onClick={() => setLayout('grid')}
              className={`p-1.5 rounded ${layout === 'grid' ? 'bg-slate-100 text-gov-navy' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
              aria-label="Grid layout"
            >
              📊
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`p-1.5 rounded ${layout === 'list' ? 'bg-slate-100 text-gov-navy' : 'text-slate-400 hover:text-slate-600'}`}
              title="List View"
              aria-label="List layout"
            >
              📝
            </button>
          </div>
        </div>
      </div>

      {/* ── SERVICE LISTINGS ───────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="skeleton h-48" />
          ))}
        </div>
      ) : schemes.length > 0 ? (
        <>
          <div className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">
            {t('servicesCount', { count: total })}
          </div>

          <div
            className={
              layout === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'flex flex-col gap-4'
            }
          >
            {schemes.map((sch) => (
              <ServiceCard key={sch._id} service={sch} />
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 p-16 text-center space-y-4 max-w-md mx-auto">
          <div className="text-4xl">🔍</div>
          <p className="font-bold text-slate-700 text-sm">{getNoResultsText()}</p>
          <button
            onClick={() => { setCategory('All'); setSearch(''); }}
            className="btn-cyan px-4 py-2 font-display text-[9px] tracking-widest"
          >
            {getResetBtnText()}
          </button>
        </div>
      )}

      {/* ── PAGINATION ────────────────────────────────────────────── */}
      {!loading && totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 pt-6" aria-label="Pagination">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3.5 py-1.5 rounded border border-slate-200 bg-white text-xs font-bold hover:bg-slate-50 disabled:opacity-40 transition-all"
          >
            {t('servicesPrev')}
          </button>
          <span className="text-xs font-bold text-slate-600 px-2 font-mono">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3.5 py-1.5 rounded border border-slate-200 bg-white text-xs font-bold hover:bg-slate-50 disabled:opacity-40 transition-all"
          >
            {t('servicesNext')}
          </button>
        </nav>
      )}

    </main>
  );
};

export default Schemes;
