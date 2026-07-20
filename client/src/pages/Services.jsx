import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import ServiceCard from '../components/ServiceCard';

const CATEGORIES = [
  'All',
  'Identity & Documents',
  'Health & Medical',
  'Finance & Banking',
  'Housing & Infrastructure',
  'Transport & Vehicle',
  'Emergency Helplines',
];

const HELPLINES = [
  {
    number: '1100',
    title: 'CM Helpline & Grievance',
    titleTa: 'முதல்வரின் முகவரி உதவி எண்',
    titleHi: 'मुख्यमंत्री हेल्पलाइन',
    desc: 'Tamil Nadu Government Chief Minister helpline for general grievance filing and status monitoring.',
    descTa: 'பொது மக்கள் குறைதீர்க்கும் மற்றும் மனுக்களின் நிலையை அறிய முதல்வரின் முகவரி உதவி மையம்.',
    descHi: 'सामान्य शिकायत दर्ज करने और स्थिति की निगरानी के लिए तमिलनाडु सरकार मुख्यमंत्री हेल्पलाइन।',
    hours: '24/7 Support',
    hoursTa: '24/7 சேவை',
    hoursHi: '24/7 सहायता',
    type: 'State Helpline',
    typeTa: 'மாநில உதவி எண்',
    typeHi: 'राज्य हेल्पलाइन',
    color: '#0f294a',
    icon: '📞'
  },
  {
    number: '104',
    title: 'Health & Medical Helpline',
    titleTa: 'சுகாதாரம் & மருத்துவ உதவி',
    titleHi: 'स्वास्थ्य हेल्पलाइन',
    desc: 'Government health advisory service, medical counseling, and grievance redressal helpline.',
    descTa: 'அரசு சுகாதார ஆலோசனை, மருத்துவ ஆலோசனைகள் மற்றும் புகார்களைத் தெரிவிக்கும் உதவி எண்.',
    descHi: 'सरकारी स्वास्थ्य सलाहकार सेवा, चिकित्सा परामर्श और शिकायत निवारण हेल्पलाइन।',
    hours: '24/7 Support',
    hoursTa: '24/7 சேவை',
    hoursHi: '24/7 सहायता',
    type: 'Emergency Health',
    typeTa: 'சுகாதார அவசர உதவி',
    typeHi: 'आपातकालीन स्वास्थ्य',
    color: '#16a34a',
    icon: '🏥'
  },
  {
    number: '108',
    title: 'Emergency Ambulance Service',
    titleTa: 'அவசர ஆம்புலன்ஸ் சேவை',
    titleHi: 'आपातकालीन एम्बुलेंस सेवा',
    desc: 'Immediate emergency response team for critical healthcare incidents, accident rescues, and hospital transfers.',
    descTa: 'அபாயகரமான சுகாதார நிகழ்வுகள் மற்றும் விபத்து மீட்புகளுக்கான உடனடி அவசர ஆம்புலன்ஸ் சேவை.',
    descHi: 'गंभीर स्वास्थ्य घटनाओं, दुर्घटना बचाव और अस्पताल स्थानांतरण के लिए तत्काल आपातकालीन प्रतिक्रिया दल।',
    hours: '24/7 Support',
    hoursTa: '24/7 சேவை',
    hoursHi: '24/7 सहायता',
    type: 'Critical Emergency',
    typeTa: 'அதி அவசர உதவி',
    typeHi: 'गंभीर आपातकाल',
    color: '#dc2626',
    icon: ' Ambul'
  },
  {
    number: '181',
    title: 'Women Helpline',
    titleTa: 'பெண்கள் உதவி எண்',
    titleHi: 'महिला हेल्पलाइन',
    desc: 'Confidential support, protection assistance, counseling, and crisis intervention services for women.',
    descTa: 'பெண்களுக்கான இரகசிய பாதுகாப்பு ஆதரவு, ஆலோசனைகள் மற்றும் அவசர உதவிச் சேவைகள்.',
    descHi: 'महिलाओं के लिए गोपनीय सहायता, सुरक्षा सहायता, परामर्श और संकट हस्तक्षेप सेवाएं।',
    hours: '24/7 Support',
    hoursTa: '24/7 சேவை',
    hoursHi: '24/7 सहायता',
    type: 'Social Safety',
    typeTa: 'சமூகப் பாதுகாப்பு',
    typeHi: 'सामाजिक सुरक्षा',
    color: '#d97706',
    icon: '🛡️'
  },
  {
    number: '1098',
    title: 'Childline (Child Protection)',
    titleTa: 'குழந்தைகள் உதவி எண் (சைல்ட்லைன்)',
    titleHi: 'चाइल्डलाइन (बाल संरक्षण)',
    desc: 'National 24-hour free emergency phone outreach service for children in need of care and protection.',
    descTa: 'பராமரிப்பு மற்றும் பாதுகாப்பு தேவைப்படும் குழந்தைகளுக்கான 24 மணி நேர இலவச அவசர தொலைபேசி சேவை.',
    descHi: 'देखभाल और संरक्षण की आवश्यकता वाले बच्चों के लिए राष्ट्रीय 24 घंटे मुफ्त आपातकालीन फोन सेवा।',
    hours: '24/7 Support',
    hoursTa: '24/7 சேவை',
    hoursHi: '24/7 सहायता',
    type: 'Child Protection',
    typeTa: 'குழந்தைகள் பாதுகாப்பு',
    typeHi: 'बाल संरक्षण',
    color: '#7c3aed',
    icon: '👶'
  },
  {
    number: '100',
    title: 'Police Emergency Control',
    titleTa: 'காவல்துறை அவசரக் கட்டுப்பாடு',
    titleHi: 'पुलिस आपातकालीन नियंत्रण',
    desc: 'Direct dispatch line to the local police department for reporting crimes, disturbances, or law issues.',
    descTa: 'குற்றங்கள், ஒழுங்கு மீறல்கள் அல்லது சட்டப் புகார்களைப் பதிவு செய்ய காவல்துறை அவசரக் கட்டுப்பாட்டு அறை.',
    descHi: 'अपराधों, अशांति या कानून के मुद्दों की रिपोर्ट करने के लिए स्थानीय पुलिस विभाग को सीधे कॉल करें।',
    hours: '24/7 Support',
    hoursTa: '24/7 சேவை',
    hoursHi: '24/7 सहायता',
    type: 'Law Enforcement',
    typeTa: 'காவல்துறை பாதுகாப்பு',
    typeHi: 'कानून प्रवर्तन',
    color: '#2563eb',
    icon: '🚓'
  },
  {
    number: '101',
    title: 'Fire & Rescue Services',
    titleTa: 'தீயணைப்பு & மீட்புப் பணிகள்',
    titleHi: 'अग्निशमन और बचाव सेवाएं',
    desc: 'Emergency response for firefighting, rescue operations, disaster response, and hazard containment.',
    descTa: 'தீ விபத்துகள், மீட்புப் பணிகள் மற்றும் பேரிடர் அவசர காலத் தேவைகளுக்கான மீட்புச் சேவை.',
    descHi: 'अग्निशमन, बचाव कार्यों, आपदा प्रतिक्रिया और खतरे की रोकथाम के लिए आपातकालीन प्रतिक्रिया।',
    hours: '24/7 Support',
    hoursTa: '24/7 சேவை',
    hoursHi: '24/7 सहायता',
    type: 'Disaster & Fire',
    typeTa: 'தீயணைப்பு & மீட்பு',
    typeHi: 'आपदा और आग',
    color: '#ea580c',
    icon: '🚒'
  },
  {
    number: '1912',
    title: 'TANGEDCO Electricity Complaint',
    titleTa: 'மின்சார வாரியப் புகார் எண்',
    titleHi: 'बिजली शिकायत हेल्पलाइन',
    desc: 'Register complaints regarding power outages, voltage fluctuations, cable damage, or billing queries.',
    descTa: 'மின் தடை, மின்னழுத்த மாறுபாடு, கம்பிகள் சேதம் அல்லது மின் கட்டணக் குறைபாடுகள் குறித்த புகார்களைப் பதிவு செய்ய.',
    descHi: 'बिजली कटौती, वोल्टेज में उतार-चढ़ाव, केबल क्षति या बिलिंग प्रश्नों के संबंध में शिकायतें दर्ज करें।',
    hours: '24/7 Support',
    hoursTa: '24/7 சேவை',
    hoursHi: '24/7 सहायता',
    type: 'Electricity Utility',
    typeTa: 'மின்சாரப் பயன்பாடு',
    typeHi: 'बिजली उपयोगिता',
    color: '#0891b2',
    icon: '⚡'
  }
];

const getHelplineIcon = (number) => {
  switch (number) {
    case '1100': // CM Helpline (Phone/Receiver)
      return (
        <svg className="w-8 h-8 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      );
    case '104': // Health (Heart Rate/Pulse)
      return (
        <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    case '108': // Ambulance (Hospital/Medical Bag)
      return (
        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      );
    case '181': // Women (Shield)
      return (
        <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case '1098': // Childline (Academic Cap / Graduation / Family / Users)
      return (
        <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case '100': // Police (Badge/Lock/Shield/Star)
      return (
        <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    case '101': // Fire (Fire Extinguisher / Flame / Spark)
      return (
        <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case '1912': // TANGEDCO (Lightning Bolt)
      return (
        <svg className="w-8 h-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    default:
      return null;
  }
};

const Services = () => {
  const { user, isLoggedIn } = useUser();
  const { locale, t }        = useLanguage();

  const [services,  setServices]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [category,  setCategory]  = useState('All');
  const [search,    setSearch]    = useState('');
  const [sort,      setSort]      = useState('popular');
  const [page,      setPage]      = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,     setTotal]     = useState(0);
  const [layout,    setLayout]    = useState('grid');

  const LIMIT = 12;

  const fetchServices = useCallback(async () => {
    if (category === 'Emergency Helplines') {
      setLoading(false);
      setTotal(HELPLINES.length);
      setTotalPages(1);
      return;
    }
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, sort, type: 'services' };
      if (category !== 'All') params.category = category;
      if (search.trim())      params.search    = search.trim();

      const res = await axios.get('/api/services', { params });
      setServices(res.data?.data || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
      setTotal(res.data?.pagination?.totalRecords || 0);
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [category, search, sort, page]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  useEffect(() => { setPage(1); }, [category, search, sort]);

  const handleSearchSubmit = (e) => { e.preventDefault(); fetchServices(); };

  const SORT_OPTIONS = [
    { value: 'popular',  label: 'Most Popular'  },
    { value: 'rating',   label: 'Highest Rated' },
    { value: 'newest',   label: 'Newest First'  },
    { value: 'name',     label: 'A → Z'         },
  ];

  return (
    <main className="page-wrapper space-y-6 animate-slide-up">

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <section
        className="rounded-xl p-8 bg-white border border-slate-200 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gov-navy" />
        <div className="space-y-2">
          <p className="section-label">{t('servicesDirectory')}</p>
          <h1 className="font-display font-black text-2xl text-gov-navy">
            {t('servicesTitle')}
          </h1>
          <p className="text-slate-500 text-xs max-w-xl leading-relaxed">
            {t('servicesDesc')}
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
            placeholder={t('servicesSearchPlaceholder')}
            id="services-search"
            aria-label="Search schemes"
          />
        </div>
        <button type="submit" className="btn-cyan px-5 font-display tracking-widest text-[10px]" id="services-search-btn">
          {t('servicesSearchBtn')}
        </button>

        {/* Layout toggle */}
        <div className="flex rounded border border-slate-200 overflow-hidden bg-white">
          <button
            type="button"
            onClick={() => setLayout('grid')}
            className={`px-3 py-2 transition-all ${layout === 'grid' ? 'bg-slate-100 text-gov-navy' : 'text-slate-400 hover:text-slate-600'}`}
            aria-label="Grid view"
            id="layout-grid-btn"
          >
            ⬡
          </button>
          <button
            type="button"
            onClick={() => setLayout('list')}
            className={`px-3 py-2 transition-all ${layout === 'list' ? 'bg-slate-100 text-gov-navy' : 'text-slate-400 hover:text-slate-600'}`}
            aria-label="List view"
            id="layout-list-btn"
          >
            ☰
          </button>
        </div>
      </form>

      {/* ── CATEGORY TABS ──────────────────────────────────────────── */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1" role="tablist" aria-label="Directories">
        {CATEGORIES.map((cat) => {
          let displayName = cat;
          if (cat === 'All') {
            displayName = t('navHome') === 'Home' ? 'ALL CATEGORIES' : t('navHome') === 'முகப்பு' ? 'அனைத்து பிரிவுகள்' : 'सभी श्रेणियां';
          } else {
            // Check translation mapping
            displayName = t('navServices') === 'Services' ? cat : t('navServices') === 'சேவைகள்' ? t('ta') || cat : cat;
            if (t('navServices') === 'சேவைகள்') {
              const taMap = {
                'Identity & Documents': 'அடையாளம் & ஆவணங்கள்',
                'Health & Medical': 'சுகாதாரம் & மருத்துவம்',
                'Education & Scholarships': 'கல்வி & கல்வித்தொகை',
                'Agriculture & Farming': 'விவசாயம் & பண்ணை',
                'Finance & Banking': 'நிதி & வங்கிச்சேவை',
                'Housing & Infrastructure': 'வீட்டுவசதி & உள்கட்டமைப்பு',
                'Employment & Pensions': 'வேலைவாய்ப்பு & ஓய்வூதியம்',
                'Transport & Vehicle': 'போக்குவரத்து & வாகனம்',
                'Social Welfare': 'சமூக நலன்',
                'Emergency Helplines': 'அவசர உதவி எண்கள்',
              };
              displayName = taMap[cat] || cat;
            } else if (t('navServices') === 'सेवाएं') {
              const hiMap = {
                'Identity & Documents': 'पहचान और दस्तावेज़',
                'Health & Medical': 'स्वास्थ्य और चिकित्सा',
                'Education & Scholarships': 'शिक्षा और छात्रवृत्ति',
                'Agriculture & Farming': 'कृषि और खेती',
                'Finance & Banking': 'वित्त और बैंकिंग',
                'Housing & Infrastructure': 'आवास और बुनियादी ढांचा',
                'Employment & Pensions': 'रोजगार और पेंशन',
                'Transport & Vehicle': 'परिवहन और वाहन',
                'Social Welfare': 'समाज कल्याण',
                'Emergency Helplines': 'आपातकालीन हेल्पलाइन',
              };
              displayName = hiMap[cat] || cat;
            }
          }
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={category === cat}
              onClick={() => setCategory(cat)}
              className="px-3.5 py-2 rounded font-mono text-[9px] font-extrabold tracking-wider flex-shrink-0 border transition-all hover:bg-slate-100 hover:text-gov-navy"
              style={{
                background:  category === cat ? 'var(--gov-navy)' : '#f8fafc',
                borderColor: category === cat ? 'var(--gov-navy)' : '#94a3b8',
                color:       category === cat ? '#ffffff'          : '#0f172a',
              }}
              id={`cat-tab-${cat.replace(/\s+/g, '-').toLowerCase()}`}
            >
              {displayName.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* ── SORT OPTION ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs font-mono text-slate-500 font-bold">
          {loading ? 'Processing...' : t('servicesCount', { count: total })}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold font-mono text-slate-400">{t('servicesSort')}</span>
          <div className="flex gap-1 bg-white p-0.5 rounded border border-slate-200">
            {SORT_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => setSort(s.value)}
                className="px-2.5 py-1 rounded-[4px] text-[9px] font-mono font-bold transition-all"
                style={{
                  background: sort === s.value ? 'var(--gov-navy)' : 'transparent',
                  color:      sort === s.value ? '#ffffff'          : '#64748b',
                }}
                id={`sort-${s.value}`}
              >
                {s.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── DIRECTORY GRID ────────────────────────────────────────── */}
      {category === 'Emergency Helplines' ? (
        (() => {
          const filteredHelplines = HELPLINES.filter(h => {
            if (!search.trim()) return true;
            const s = search.toLowerCase();
            const matchesTitle = h.title.toLowerCase().includes(s) || (h.titleTa && h.titleTa.toLowerCase().includes(s)) || (h.titleHi && h.titleHi.toLowerCase().includes(s));
            const matchesNum = h.number.includes(s);
            return matchesTitle || matchesNum;
          });

          if (filteredHelplines.length === 0) {
            return (
              <div className="glass-card p-12 text-center">
                <p className="font-bold text-slate-600 text-sm">{t('servicesNoResults')}</p>
                <button
                  onClick={() => { setSearch(''); }}
                  className="btn-cyan mt-4 font-display text-[9px] tracking-widest"
                  id="helpline-reset-btn"
                >
                  {t('servicesResetBtn')}
                </button>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredHelplines.map((h) => {
                const displayTitle = locale === 'ta' ? h.titleTa : locale === 'hi' ? h.titleHi : h.title;
                const displayDesc = locale === 'ta' ? h.descTa : locale === 'hi' ? h.descHi : h.desc;
                const displayHours = locale === 'ta' ? h.hoursTa : locale === 'hi' ? h.hoursHi : h.hours;
                const displayType = locale === 'ta' ? h.typeTa : locale === 'hi' ? h.typeHi : h.type;
                const iconVal = h.icon === ' Ambul' ? '🚑' : h.icon;
                
                return (
                  <div 
                    key={h.number}
                    className="glass-card p-5 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group border border-slate-200 bg-white"
                    style={{ borderTop: `4px solid ${h.color}` }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded" style={{ color: h.color, backgroundColor: `${h.color}15` }}>
                          {displayType.toUpperCase()}
                        </span>
                        <span className="flex items-center gap-1 text-[9px] font-bold text-gov-green font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-gov-green animate-pulse" />
                          {displayHours.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center border border-slate-200/80 shadow-sm bg-slate-50/50">
                          {getHelplineIcon(h.number)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-gov-navy font-display truncate leading-tight">
                            {displayTitle}
                          </h3>
                          <p className="text-xl font-black text-slate-800 font-mono tracking-tight mt-0.5">
                            {h.number}
                          </p>
                        </div>
                      </div>
                      <p className="text-slate-500 text-[10px] leading-relaxed line-clamp-3">
                        {displayDesc}
                      </p>
                    </div>
                    <a
                      href={`tel:${h.number}`}
                      className="btn-cyan w-full text-center flex items-center justify-center gap-2 mt-5 py-2 font-display text-[9px] tracking-widest"
                      id={`dial-${h.number}`}
                      onClick={(e) => {
                        if (!window.confirm(`${locale === 'ta' ? 'அழைக்க விரும்புகிறீர்களா' : 'Do you want to dial'} ${h.number}?`)) {
                          e.preventDefault();
                        }
                      }}
                    >
                      📞 {locale === 'ta' ? 'அழைக்க' : locale === 'hi' ? 'कॉल करें' : 'CALL NOW'}
                    </a>
                  </div>
                );
              })}
            </div>
          );
        })()
      ) : loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <div key={i} className="skeleton h-44" />
          ))}
        </div>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
          {services.map((s) => {
            // Localize category labels on service cards dynamically
            let localizedCat = s.category;
            if (t('navServices') === 'சேவைகள்') {
              const taMap = {
                'Identity & Documents': 'அடையாளம் & ஆவணங்கள்',
                'Health & Medical': 'சுகாதாரம் & மருத்துவம்',
                'Education & Scholarships': 'கல்வி & கல்வித்தொகை',
                'Agriculture & Farming': 'விவசாயம் & பண்ணை',
                'Finance & Banking': 'நிதி & வங்கிச்சேவை',
                'Housing & Infrastructure': 'வீட்டுவசதி & உள்கட்டமைப்பு',
                'Employment & Pensions': 'வேலைவாய்ப்பு & ஓய்வூதியம்',
                'Transport & Vehicle': 'போக்குவரத்து & வாகனம்',
                'Social Welfare': 'சமூக நலன்',
              };
              localizedCat = taMap[s.category] || s.category;
            } else if (t('navServices') === 'सेवाएं') {
              const hiMap = {
                'Identity & Documents': 'पहचान और दस्तावेज़',
                'Health & Medical': 'स्वास्थ्य और चिकित्सा',
                'Education & Scholarships': 'शिक्षा और छात्रवृत्ति',
                'Agriculture & Farming': 'कृषि और खेती',
                'Finance & Banking': 'वित्त और बैंकिंग',
                'Housing & Infrastructure': 'आवास और बुनियादी ढांचा',
                'Employment & Pensions': 'रोजगार और पेंशन',
                'Transport & Vehicle': 'परिवहन और वाहन',
                'Social Welfare': 'समाज कल्याण',
              };
              localizedCat = hiMap[s.category] || s.category;
            }
            return (
              <ServiceCard key={s._id} service={{ ...s, category: localizedCat }} />
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <p className="font-bold text-slate-600 text-sm">{t('servicesNoResults')}</p>
          <button
            onClick={() => { setSearch(''); setCategory('All'); setSort('popular'); }}
            className="btn-cyan mt-4 font-display text-[9px] tracking-widest"
            id="services-reset-btn"
          >
            {t('servicesResetBtn')}
          </button>
        </div>
      )}

      {/* ── PAGINATION ──────────────────────────────────────────── */}
      {!loading && totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-ghost btn-sm font-mono text-[9px]"
            id="prev-page-btn"
          >
            {t('servicesPrev')}
          </button>
          <span className="text-[10px] font-mono text-slate-500 font-bold">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-ghost btn-sm font-mono text-[9px]"
            id="next-page-btn"
          >
            {t('servicesNext')}
          </button>
        </nav>
      )}
    </main>
  );
};

export default Services;
