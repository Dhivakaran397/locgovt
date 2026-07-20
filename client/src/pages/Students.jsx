import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import ServiceCard from '../components/ServiceCard';

const STREAMS = {
  school: [
    {
      id: 'science',
      label: { en: 'Bio-Maths / Science Stream', ta: 'உயிரியல்-கணிதம் / அறிவியல் குரூப்', hi: 'बायो-मैथ्स / विज्ञान वर्ग' },
      scope: {
        en: 'Engineering (BE/BTech), Medicine (MBBS/BDS), Agriculture (BSc Agri), Veterinary Science, Pure Sciences (BSc Physics/Chemistry).',
        ta: 'பொறியியல் (BE/BTech), மருத்துவம் (MBBS/BDS), விவசாயம் (BSc Agri), கால்நடை மருத்துவம், மற்றும் இயற்பியல்/வேதியியல் அறிவியல் படிப்புகள்.',
        hi: 'इंजीनियरिंग (BE/BTech), चिकित्सा (MBBS/BDS), कृषि (BSc Agri), पशु चिकित्सा विज्ञान, और शुद्ध विज्ञान (BSc भौतिकी/रसायन विज्ञान)।'
      }
    },
    {
      id: 'computer',
      label: { en: 'Computer Science Stream', ta: 'கணினி அறிவியல் குரூப்', hi: 'कंप्यूटर विज्ञान वर्ग' },
      scope: {
        en: 'Computer Applications (BCA/BSc CS), Information Technology, Engineering, Artificial Intelligence & Data Science.',
        ta: 'கணினிப் பயன்பாடுகள் (BCA/BSc CS), தகவல் தொழில்நுட்பம் (IT), பொறியியல், மற்றும் செயற்கை நுண்ணறிவு & தரவு அறிவியல்.',
        hi: 'कंप्यूटर अनुप्रयोग (BCA/BSc CS), सूचना प्रौद्योगिकी, इंजीनियरिंग, आर्टिफिशियल इंटेलिजेंस और डेटा साइंस।'
      }
    },
    {
      id: 'commerce',
      label: { en: 'Commerce & Accounts', ta: 'வணிகவியல் & கணக்குப்பதிவியல்', hi: 'वाणिज्य और लेखा' },
      scope: {
        en: 'Chartered Accountancy (CA), Cost Accounting (ICWA), Company Secretary (CS), Business Administration (BBA), Commerce (BCom), Economics.',
        ta: 'சார்டர்ட் அக்கவுண்டன்சி (CA), காஸ்ட் அக்கவுண்டிங் (ICWA), கம்பெனி செகரட்டரி (CS), வணிக மேலாண்மை (BBA), மற்றும் வணிகவியல் (BCom) படிப்புகள்.',
        hi: 'चार्टर्ड अकाउंटेंसी (CA), कॉस्ट अकाउंटिंग (ICWA), कंपनी सेक्रेटरी (CS), बिजनेस एडमिनिस्ट्रेशन (BBA), कॉमर्स (BCom), अर्थशास्त्र।'
      }
    },
    {
      id: 'arts',
      label: { en: 'Arts & Humanities', ta: 'கலை & மனிதநேயப் பிரிவு', hi: 'कला और मानविकी' },
      scope: {
        en: 'Law (BA LLB), Civil Services preparation (UPSC/TNPSC), Literature (BA English/Tamil), Journalism & Mass Comm, Fine Arts.',
        ta: 'சட்டம் (BA LLB), குடிமைப்பணிகள் தேர்வுத் தயாரிப்பு (UPSC/TNPSC), இலக்கியம் (BA தமிழ்/ஆங்கிலம்), மற்றும் இதழியல் & ஊடகவியல் படிப்புகள்.',
        hi: 'कानून (BA LLB), सिविल सेवा तैयारी (UPSC/TNPSC), साहित्य (BA अंग्रेजी/तमिल), पत्रकारिता और जनसंचार, ललित कला।'
      }
    }
  ],
  college: [
    {
      id: 'engineering',
      label: { en: 'Engineering & Technology', ta: 'பொறியியல் & தொழில்நுட்பம்', hi: 'इंजीनियरिंग और प्रौद्योगिकी' },
      scope: {
        en: 'Core engineering fields, software development, research, skill training programs like Naan Mudhalvan.',
        ta: 'பொறியியல் துறைகள், மென்பொருள் மேம்பாடு, ஆராய்ச்சி, மற்றும் நான் முதல்வன் போன்ற திறன் மேம்பாட்டுப் பயிற்சிகள்.',
        hi: 'मुख्य इंजीनियरिंग क्षेत्र, सॉफ्टवेयर विकास, अनुसंधान, और नान मुधलवन जैसे कौशल प्रशिक्षण कार्यक्रम।'
      }
    },
    {
      id: 'arts_sci',
      label: { en: 'Arts & Science', ta: 'கலை & அறிவியல்', hi: 'कला और विज्ञान' },
      scope: {
        en: 'Postgraduate studies, teaching professions, private sectors, public sector bank exams, state public service commissions.',
        ta: 'முதுகலை படிப்புகள், கற்பித்தல் பணி, தனியார் மற்றும் வங்கித் தேர்வுகள், மற்றும் அரசுப் பணியாளர் தேர்வாணையத் தேர்வுகள்.',
        hi: 'स्नातकोत्तर अध्ययन, शिक्षण पेशे, निजी क्षेत्र, सार्वजनिक क्षेत्र की बैंक परीक्षाएं, राज्य लोक सेवा आयोग।'
      }
    },
    {
      id: 'medicine',
      label: { en: 'Medicine & Allied Health', ta: 'மருத்துவம் & துணை மருத்துவப் படிப்புகள்', hi: 'चिकित्सा और संबद्ध स्वास्थ्य' },
      scope: {
        en: 'Clinical practice, hospital management, pharmaceutical research, nursing, physiotherapy.',
        ta: 'மருத்துவப் பயிற்சி, மருத்துவமனை நிர்வாகம், மருந்து ஆராய்ச்சி, செவிலியர் படிப்பு, மற்றும் உடற்பயிற்சி சிகிச்சை.',
        hi: 'नैदानिक ​​अभ्यास, अस्पताल प्रबंधन, दवा अनुसंधान, नर्सिंग, फिजियोथेरेपी।'
      }
    },
    {
      id: 'diploma',
      label: { en: 'Diploma & ITI / Vocational', ta: 'டிப்ளமோ & ITI / தொழிற்கல்வி', hi: 'डिप्लोमा और आईटीआई / व्यावसायिक' },
      scope: {
        en: 'Technical supervisor roles, industrial manufacturing, apprenticeships, direct lateral entry to engineering 2nd year.',
        ta: 'தொழில்நுட்ப மேற்பார்வையாளர் பணிகள், தொழில்துறை உற்பத்தி, மற்றும் பொறியியல் இரண்டாம் ஆண்டில் நேரடிச் சேர்க்கை.',
        hi: 'तकनीकी पर्यवेक्षक भूमिकाएं, औद्योगिक विनिर्माण, प्रशिक्षुता, इंजीनियरिंग द्वितीय वर्ष में सीधी लेटरल एंट्री।'
      }
    }
  ]
};

const LABELS = {
  en: {
    hubTitle: 'STUDENT GUIDANCE & ELIGIBILITY HUB',
    hubDesc: 'Select your academic profile to instantly identify career pathways, eligibility parameters (like 7.5% quota), and matching welfare schemes.',
    stageLabel: 'Current Academic Stage',
    school: 'School Student',
    college: 'College / Higher Ed',
    selectGroup: 'Select Your School Stream / Group',
    selectCourse: 'Select Your Current College Course',
    specialFilters: 'Special Eligibility Checkbox',
    govtSchoolLabel: 'Studied in TN Govt School (Class 6 to 12)',
    firstGradLabel: 'I am the First Graduate in my family',
    scopeTitle: 'RECOMMENDED CAREER SCOPE',
    benefitsTitle: 'SCHEME ELIGIBILITY & BENEFITS (TAMIL NADU POLICIES)',
    recommendedTitle: 'RECOMMENDED PORTALS FOR YOU',
  },
  ta: {
    hubTitle: 'மாணவர் வழிகாட்டி & தகுதி கண்டறியும் மையம்',
    hubDesc: 'உங்களின் கல்விப் பின்னணியைத் தேர்ந்தெடுத்து, அதற்கான தொழில் வாய்ப்புகள், அரசுச் சலுகைகள் (7.5% இடஒதுக்கீடு போன்றவை) மற்றும் தகுதியான உதவித்தொகைகளைக் கண்டறியவும்.',
    stageLabel: 'தற்போதைய கல்வி நிலை',
    school: 'பள்ளி மாணவர்',
    college: 'கல்லூரி மாணவர்',
    selectGroup: 'உங்கள் பள்ளிப் பிரிவு / குரூப்பைத் தேர்ந்தெடுக்கவும்',
    selectCourse: 'உங்கள் தற்போதைய கல்லூரிப் படிப்பைத் தேர்ந்தெடுக்கவும்',
    specialFilters: 'சிறப்புத் தகுதி சரிபார்ப்புப் பெட்டிகள்',
    govtSchoolLabel: 'அரசுப் பள்ளியில் படித்தேன் (6 முதல் 12 ஆம் வகுப்பு வரை)',
    firstGradLabel: 'நான் எனது குடும்பத்தில் முதல் பட்டதாரி',
    scopeTitle: 'பரிந்துரைக்கப்படும் தொழில் வாய்ப்புகள்',
    benefitsTitle: 'திட்டத் தகுதிகள் & அரசுச் சலுகைகள் (தமிழ்நாடு அரசு கொள்கைகள்)',
    recommendedTitle: 'உங்களுக்கான பரிந்துரைக்கப்பட்ட போர்ட்டல்கள்',
  },
  hi: {
    hubTitle: 'छात्र मार्गदर्शन और पात्रता केंद्र',
    hubDesc: 'करियर पथ, योजना पात्रता (जैसे 7.5% आरक्षण) और उपयुक्त छात्रवृत्ति योजनाओं की तुरंत पहचान करने के लिए अपनी शैक्षणिक प्रोफ़ाइल चुनें।',
    stageLabel: 'वर्तमान शैक्षणिक स्तर',
    school: 'स्कूली छात्र',
    college: 'कॉलेज / उच्च शिक्षा',
    selectGroup: 'अपने स्कूल स्ट्रीम / ग्रुप का चयन करें',
    selectCourse: 'अपने वर्तमान कॉलेज कोर्स का चयन करें',
    specialFilters: 'विशेष पात्रता चेकबॉक्स',
    govtSchoolLabel: 'सरकारी स्कूल में पढ़ाई की (कक्षा 6 से 12 तक)',
    firstGradLabel: 'मैं अपने परिवार में पहला स्नातक हूं',
    scopeTitle: 'अनुशंसित करियर क्षेत्र',
    benefitsTitle: 'योजना पात्रता और लाभ (तमिलनाडु सरकारी नीतियां)',
    recommendedTitle: 'आपके लिए अनुशंसित पोर्टल',
  }
};

const Students = () => {
  const { user, isLoggedIn } = useUser();
  const { locale, t }        = useLanguage();
  const { addToast }         = useToast();

  const [schemes,  setSchemes]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [sort,      setSort]      = useState('popular');
  const [page,      setPage]      = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,     setTotal]     = useState(0);
  const [layout,    setLayout]    = useState('grid');

  // Guidance Hub States
  const [stage, setStage] = useState('school'); // 'school' or 'college'
  const [selectedStream, setSelectedStream] = useState('science');
  const [isGovtSchool, setIsGovtSchool] = useState(false);
  const [isFirstGrad, setIsFirstGrad] = useState(false);
  const [show75Reqs, setShow75Reqs] = useState(false);
  const [showFGReqs, setShowFGReqs] = useState(false);
  const [gender, setGender] = useState('female'); // 'female' or 'male'

  const LIMIT = 12;

  useEffect(() => {
    setSelectedStream(stage === 'school' ? 'science' : 'engineering');
  }, [stage]);

  const fetchStudentSchemes = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT, sort, type: 'students' };
      if (search.trim()) params.search = search.trim();

      const res = await axios.get('/api/services', { params });
      setSchemes(res.data?.data || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
      setTotal(res.data?.pagination?.totalRecords || 0);
    } catch {
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  }, [search, sort, page]);

  useEffect(() => { fetchStudentSchemes(); }, [fetchStudentSchemes]);

  useEffect(() => { setPage(1); }, [search, sort]);

  const handleSearchSubmit = (e) => { e.preventDefault(); fetchStudentSchemes(); };

  const SORT_OPTIONS = [
    { value: 'popular',  label: 'Most Popular'  },
    { value: 'rating',   label: 'Highest Rated' },
    { value: 'newest',   label: 'Newest First'  },
    { value: 'name',     label: 'A → Z'         },
  ];

  const getPageTitle = () => {
    if (t('navHome') === 'முகப்பு') return 'மாணவர் நலத்திட்டங்கள் & உதவித்தொகைகள்';
    if (t('navHome') === 'होम') return 'छात्र कल्याण योजनाएं और छात्रवृत्ति';
    return 'STUDENT SCHEMES & SCHOLARSHIPS';
  };

  const getPageDesc = () => {
    if (t('navHome') === 'முகப்பு') return 'மாணவ, மாணவிகளுக்கான உயர்கல்வி உதவித்தொகைகள், இலவச திறன் மேம்பாட்டுப் பயிற்சிகள் மற்றும் கல்விச் சேவைகளை இங்கு காணலாம்.';
    if (t('navHome') === 'होम') return 'छात्रों के लिए उच्च शिक्षा छात्रवृत्ति, मुफ्त कौशल विकास पाठ्यक्रम और शैक्षणिक पोर्टल खोजें।';
    return 'Access official higher education scholarships, free technology training courses, and student utility portals.';
  };

  const getPlaceholder = () => {
    if (t('navHome') === 'முகப்பு') return 'உதவித்தொகை அல்லது படிப்பின் பெயரை உள்ளிடவும்...';
    if (t('navHome') === 'होम') return 'छात्रवृत्ति या पाठ्यक्रम का नाम दर्ज करें...';
    return 'Enter scholarship or course name...';
  };

  const getSearchBtnText = () => {
    if (t('navHome') === 'முகப்பு') return 'தேடுக';
    if (t('navHome') === 'होम') return 'खोजें';
    return 'SEARCH';
  };

  const getResetBtnText = () => {
    if (t('navHome') === 'முகப்பு') return 'மாணவர் அடைவை மீட்டமை';
    if (t('navHome') === 'होम') return 'छात्र निर्देशिका रीसेट करें';
    return 'RESET STUDENT DIRECTORY';
  };

  const getNoResultsText = () => {
    if (t('navHome') === 'முகப்பு') return 'மாணவர்களுக்கான தேடலில் எந்த திட்டங்களும் கிடைக்கவில்லை.';
    if (t('navHome') === 'होम') return 'आपकी खोज से मेल खाती कोई छात्र योजना नहीं मिली।';
    return 'No student schemes or scholarships match your query.';
  };

  return (
    <main className="page-wrapper space-y-6 animate-slide-up">

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <section
        className="rounded-xl p-8 bg-white border border-slate-200 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gov-navy" />
        <div className="space-y-2">
          <p className="section-label">🎓 {t('navStudents') || 'Students'}</p>
          <h1 className="font-display font-black text-2xl text-gov-navy">
            {getPageTitle()}
          </h1>
          <p className="text-slate-500 text-xs max-w-xl leading-relaxed">
            {getPageDesc()}
            {isLoggedIn && ` ${t('servicesDescUser', { district: user.district, state: user.state })}`}
          </p>
        </div>
      </section>

      {/* ── INTERACTIVE STUDENT GUIDANCE & ELIGIBILITY HUB ───────────────────── */}
      <section className="glass-card p-6 space-y-6 shadow-sm border border-slate-200 bg-white/70 relative overflow-hidden rounded-xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gov-navy" />
        <div className="space-y-1.5">
          <h2 className="font-display font-black text-xs text-gov-navy tracking-wide uppercase flex items-center gap-1.5">
            <svg className="w-4 h-4 text-gov-navy shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/>
            </svg>
            <span>{LABELS[locale]?.hubTitle || LABELS.en.hubTitle}</span>
          </h2>
          <p className="text-slate-500 text-[11px] leading-relaxed max-w-2xl">
            {LABELS[locale]?.hubDesc || LABELS.en.hubDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Controls Panel */}
          <div className="space-y-4 bg-slate-50/50 p-4 border border-slate-100 rounded-lg">
            
            {/* Stage Selector */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold font-mono tracking-widest text-slate-400 uppercase block">
                {LABELS[locale]?.stageLabel || LABELS.en.stageLabel}
              </label>
              <div className="flex gap-2">
                {[
                  {
                    id: 'school',
                    label: LABELS[locale]?.school || LABELS.en.school,
                    icon: (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                      </svg>
                    )
                  },
                  {
                    id: 'college',
                    label: LABELS[locale]?.college || LABELS.en.college,
                    icon: (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/>
                      </svg>
                    )
                  }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStage(s.id)}
                    className={`flex-1 py-2 px-3 rounded-lg border font-display text-[10px] font-black tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                      stage === s.id
                        ? 'bg-gov-navy border-gov-navy text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {s.icon}
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stream Selector */}
            <div className="space-y-1.5">
              <label htmlFor="stream-select" className="text-[9px] font-bold font-mono tracking-widest text-slate-400 uppercase block">
                {stage === 'school' 
                  ? (LABELS[locale]?.selectGroup || LABELS.en.selectGroup) 
                  : (LABELS[locale]?.selectCourse || LABELS.en.selectCourse)}
              </label>
              <select
                id="stream-select"
                value={selectedStream}
                onChange={(e) => setSelectedStream(e.target.value)}
                className="w-full bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-lg px-3 py-2 outline-none cursor-pointer hover:bg-slate-50 transition-all"
              >
                {(STREAMS[stage] || []).map((stream) => (
                  <option key={stream.id} value={stream.id}>
                    {stream.label[locale] || stream.label.en}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender Selector */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold font-mono tracking-widest text-slate-400 uppercase block">
                {locale === 'ta' ? 'பாலினம்' : locale === 'hi' ? 'लिंग' : 'Gender'}
              </label>
              <div className="flex gap-2">
                {[
                  {
                    id: 'female',
                    label: locale === 'ta' ? 'மாணவி' : locale === 'hi' ? 'छात्रा' : 'Female Student',
                    icon: (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )
                  },
                  {
                    id: 'male',
                    label: locale === 'ta' ? 'மாணவன்' : locale === 'hi' ? 'छात्र' : 'Male Student',
                    icon: (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )
                  }
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGender(g.id)}
                    className={`flex-1 py-2 px-3 rounded-lg border font-display text-[10px] font-black tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                      gender === g.id
                        ? 'bg-gov-navy border-gov-navy text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {g.icon}
                    <span>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Special Eligibility Filters */}
            <div className="space-y-2.5 pt-2 border-t border-slate-200/60">
              <label className="text-[9px] font-bold font-mono tracking-widest text-slate-400 uppercase block">
                {LABELS[locale]?.specialFilters || LABELS.en.specialFilters}
              </label>
              <div className="space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isGovtSchool}
                    onChange={(e) => setIsGovtSchool(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-gov-navy focus:ring-gov-navy w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-800 transition-colors leading-tight">
                    {LABELS[locale]?.govtSchoolLabel || LABELS.en.govtSchoolLabel}
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isFirstGrad}
                    onChange={(e) => setIsFirstGrad(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-gov-navy focus:ring-gov-navy w-4 h-4 cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-800 transition-colors leading-tight">
                    {LABELS[locale]?.firstGradLabel || LABELS.en.firstGradLabel}
                  </span>
                </label>
              </div>
            </div>

          </div>

          {/* Results Panel */}
          <div className="space-y-4">
            
            {/* Scope Box */}
            <div className="glass-card p-4 border border-slate-200 bg-white/40 shadow-sm rounded-lg space-y-2">
              <span className="text-[9px] font-bold font-mono text-gov-blue tracking-wider flex items-center gap-1.5 uppercase">
                <svg className="w-3.5 h-3.5 text-gov-blue shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9"/>
                  <circle cx="12" cy="12" r="5"/>
                  <circle cx="12" cy="12" r="1"/>
                </svg>
                <span>{LABELS[locale]?.scopeTitle || LABELS.en.scopeTitle}</span>
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                {STREAMS[stage]?.find(s => s.id === selectedStream)?.scope[locale] || STREAMS[stage]?.find(s => s.id === selectedStream)?.scope.en}
              </p>
            </div>

            {/* Policy & Concessions Box */}
            <div className="glass-card p-4 border border-indigo-100 bg-indigo-50/20 shadow-sm rounded-lg space-y-2.5">
              <span className="text-[9px] font-bold font-mono text-indigo-600 tracking-wider flex items-center gap-1.5 uppercase">
                <svg className="w-3.5 h-3.5 text-indigo-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
                <span>{LABELS[locale]?.benefitsTitle || LABELS.en.benefitsTitle}</span>
              </span>
              
              <div className="space-y-3">
                {/* 7.5% Quota */}
                {isGovtSchool ? (
                  (stage === 'school' && (selectedStream === 'science' || selectedStream === 'computer')) ||
                  (stage === 'college' && (selectedStream === 'engineering' || selectedStream === 'medicine')) ? (
                    <div className="flex gap-2 items-start border-l-2 border-indigo-500 pl-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-indigo-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5 .5a9.5 9.5 0 11-19 0 9.5 9.5 0 0119 0z"/>
                            </svg>
                            <span>{locale === 'ta' ? '7.5% அரசுப் பள்ளி சிறப்பு இடஒதுக்கீடு (பொருந்தும்)' : locale === 'hi' ? '7.5% सरकारी स्कूल विशेष आरक्षण (लागू)' : '7.5% Government School Special Reservation (Eligible)'}</span>
                          </h4>
                          
                          <div className="flex gap-1.5 shrink-0">
                            <a
                              href="https://www.youtube.com/results?search_query=how+to+avail+7.5+government+school+reservation+tamil+nadu"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-0.5 rounded bg-red-50 hover:bg-red-100 text-red-600 font-display text-[9px] font-bold tracking-wider uppercase transition-all flex items-center gap-1 border border-red-100"
                            >
                              <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                              <span>Video</span>
                            </a>
                            <button
                              onClick={() => setShow75Reqs(!show75Reqs)}
                              className={`px-2 py-0.5 rounded font-display text-[9px] font-bold tracking-wider uppercase transition-all flex items-center gap-1 border ${
                                show75Reqs 
                                  ? 'bg-slate-700 border-slate-700 text-white'
                                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                              }`}
                            >
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                              </svg>
                              <span>{locale === 'ta' ? 'தேவைப்படுபவை' : locale === 'hi' ? 'दस्तावेज' : 'Requirements'}</span>
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 leading-relaxed mt-1.5 font-medium">
                          {locale === 'ta' 
                            ? 'வொகேஷனல், இன்ஜினியரிங், மெடிக்கல், அக்ரி போன்ற தொழிற்கல்வி படிப்புகளில் 7.5% முன்னுரிமை இடங்கள். முழு கல்விக்கட்டணம், விடுதிக்கட்டணம் மற்றும் கலந்தாய்வுக் கட்டணங்களை அரசே செலுத்தும்!'
                            : locale === 'hi'
                            ? 'व्यावसायिक, इंजीनियरिंग, मेडिकल, कृषि आदि पाठ्यक्रमों में 7.5% आरक्षण। सरकार ट्यूशन, हॉस्टल और काउंसलिंग शुल्क का 100% भुगतान करेगी!'
                            : '7.5% preferential seats in professional streams. The Government pays 100% of your tuition, hostel, and counselling fees!'}
                        </p>

                        {/* Expanded Guidelines */}
                        {show75Reqs && (
                          <div className="mt-2.5 bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 space-y-1 animate-slide-up">
                            <span className="text-[9px] font-bold font-mono text-slate-400 block uppercase">
                              {locale === 'ta' ? 'தேவையான ஆவணங்கள் & வழிகாட்டி:' : locale === 'hi' ? 'आवश्यक दस्तावेज और गाइड:' : 'Required Documents & Guidelines:'}
                            </span>
                            <ul className="list-disc pl-4 text-[10px] text-slate-600 space-y-1 font-display font-semibold">
                              {locale === 'ta' ? (
                                <>
                                  <li>பள்ளித் தலைமையாசிரியரின் போனாஃபைட் சான்றிதழ் (6 முதல் 12 ஆம் வகுப்பு வரை)</li>
                                  <li>முதன்மை கல்வி அலுவலரின் (CEO) கையொப்பம் பெற்றிருக்க வேண்டும்</li>
                                  <li>ஆதார் அட்டை மற்றும் சாதிச் சான்றிதழ் நகல்</li>
                                  <li>10 மற்றும் 12 ஆம் வகுப்பு மதிப்பெண் சான்றிதழ்கள்</li>
                                </>
                              ) : locale === 'hi' ? (
                                <>
                                  <li>स्कूल प्रधानाध्यापक से बोनाफाइड प्रमाणपत्र (कक्षा 6 से 12 तक)</li>
                                  <li>सीईओ (मुख्य शिक्षा अधिकारी) के प्रतिहस्ताक्षर होने चाहिए</li>
                                  <li>आधार कार्ड की प्रति और समुदाय प्रमाणपत्र</li>
                                  <li>कक्षा 10 और 12 की अंकतालिका</li>
                                </>
                              ) : (
                                <>
                                  <li>Bonafide Certificate from School Headmaster (Class 6 to 12)</li>
                                  <li>Counter-signature of CEO (Chief Educational Officer) is mandatory</li>
                                  <li>Aadhaar Card copy & Community Certificate</li>
                                  <li>Class 10 & 12 Official Marksheets</li>
                                </>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 items-start border-l-2 border-amber-500 pl-3">
                      <div>
                        <h4 className="text-xs font-black text-amber-700 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-amber-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                          </svg>
                          <span>{locale === 'ta' ? '7.5% இடஒதுக்கீடு (பொது கலை/வணிக படிப்புகளுக்குப் பொருந்தாது)' : locale === 'hi' ? '7.5% आरक्षण (सामान्य कला/वाणिज्य पाठ्यक्रमों पर लागू नहीं)' : '7.5% Quota (Not Applicable for General Arts/Commerce)'}</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-medium">
                          {locale === 'ta' 
                            ? '7.5% கட்டணமில்லா சிறப்பு இடஒதுக்கீடு தொழில்முறை படிப்புகளுக்கு மட்டுமே (பொறியியல், மருத்துவம், சட்டம், விவசாயம்) பொருந்தும். சாதாரண B.Com, BA, B.Sc படிப்புகளுக்கு இது பொருந்தாது. இருப்பினும், நீங்கள் புதுமைப் பெண் (மாணவிகள்) அல்லது தமிழ் புதல்வன் (மாணவர்கள்) மாதாந்திர உதவித்தொகை பெற தகுதியுடையவர்!'
                            : locale === 'hi'
                            ? '7.5% मुफ्त आरक्षण केवल व्यावसायिक पाठ्यक्रमों (इंजीनियरिंग, चिकित्सा, कानून, कृषि) पर लागू होता है। यह सामान्य बी.कॉम, बीए या बीएससी पाठ्यक्रमों पर लागू नहीं होता है। हालांकि, आप मासिक वित्तीय सहायता प्राप्त कर सकते हैं!'
                            : 'The 7.5% free quota applies only to professional courses (Engineering, Medical, Law, Agriculture). It is not applicable to standard B.Com, BA, or BSc courses. However, you qualify for Pudhumai Penn / Tamil Pudhalvan monthly assistance!'}
                        </p>
                      </div>
                    </div>
                  )
                ) : (
                  <p className="text-[10px] text-slate-400 italic">
                    {locale === 'ta' 
                      ? 'அரசுப் பள்ளி சலுகைகளைக் காண செக்பாக்ஸை தேர்வு செய்யவும்.' 
                      : locale === 'hi'
                      ? 'सरकारी स्कूल लाभ देखने के लिए चेकबॉक्स चुनें।'
                      : 'Check government school status to view special reservation details.'}
                  </p>
                )}

                {/* First Graduate */}
                {isFirstGrad ? (
                  <div className="flex gap-2 items-start border-l-2 border-emerald-500 pl-3 pt-1">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5 .5a9.5 9.5 0 11-19 0 9.5 9.5 0 0119 0z"/>
                          </svg>
                          <span>{locale === 'ta' ? 'முதல் பட்டதாரி உதவித்தொகை (First Graduate)' : locale === 'hi' ? 'प्रथम स्नातक रियायत (First Graduate)' : 'First Graduate Fee Waiver Concession'}</span>
                        </h4>

                        <div className="flex gap-1.5 shrink-0">
                          <a
                            href="https://www.youtube.com/results?search_query=how+to+apply+first+graduate+certificate+tamil+nadu"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-0.5 rounded bg-red-50 hover:bg-red-100 text-red-600 font-display text-[9px] font-bold tracking-wider uppercase transition-all flex items-center gap-1 border border-red-100"
                          >
                            <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                            <span>Video</span>
                          </a>
                          <button
                            onClick={() => setShowFGReqs(!showFGReqs)}
                            className={`px-2 py-0.5 rounded font-display text-[9px] font-bold tracking-wider uppercase transition-all flex items-center gap-1 border ${
                              showFGReqs 
                                ? 'bg-slate-700 border-slate-700 text-white'
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                            }`}
                          >
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                            </svg>
                            <span>{locale === 'ta' ? 'தேவைப்படுபவை' : locale === 'hi' ? 'दस्तावेज' : 'Requirements'}</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed mt-1.5 font-medium">
                        {locale === 'ta'
                          ? 'குடும்பத்தில் முதல் பட்டதாரி மாணவர்களுக்கு பொறியியல் (BE/BTech) படிப்பில் ₹25,000 வரை கல்விக்கட்டணச் சலுகை மற்றும் ஒற்றைச் சாளர சேர்க்கையில் கட்டணக் குறைப்பு.'
                          : locale === 'hi'
                          ? 'परिवार के पहले स्नातक के लिए इंजीनियरिंग में ₹25,000 तक की ट्यूशन फीस रियायत और काउंसलिंग में विशेष शुल्क छूट।'
                          : 'Up to ₹25,000 tuition fee concession for BE/BTech courses and counselling fee waivers for first graduates.'}
                      </p>

                      {/* Expanded Guidelines */}
                      {showFGReqs && (
                        <div className="mt-2.5 bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 space-y-1 animate-slide-up">
                          <span className="text-[9px] font-bold font-mono text-slate-400 block uppercase">
                            {locale === 'ta' ? 'தேவையான ஆவணங்கள் & வழிகாட்டி:' : locale === 'hi' ? 'आवश्यक दस्तावेज और गाइड:' : 'Required Documents & Guidelines:'}
                          </span>
                          <ul className="list-disc pl-4 text-[10px] text-slate-600 space-y-1 font-display font-semibold">
                            {locale === 'ta' ? (
                              <>
                                <li>குடும்பத்தில் யாரும் இதுவரை பட்டப்படிப்பு (Degree) முடித்திருக்கக் கூடாது</li>
                                <li>உடன்பிறந்தவர்கள் இதற்கு முன் இச்சலுகையைப் பெற்றிருக்கக் கூடாது</li>
                                <li>குடும்ப அட்டை (Ration Card) & பெற்றோரின் பள்ளி மாற்றுச் சான்றிதழ் (TC)</li>
                                <li>தமிழ்நாடு இ-சேவை போர்டல் அல்லது இ-சேவை மையம் மூலம் விண்ணப்பிக்க வேண்டும்</li>
                              </>
                            ) : locale === 'hi' ? (
                              <>
                                <li>परिवार के किसी भी सदस्य ने स्नातक की डिग्री प्राप्त न की हो</li>
                                <li>भाई-बहनों ने पहले इस रियायत का लाभ न उठाया हो</li>
                                <li>राशन कार्ड और माता-पिता का स्कूल टीसी या स्व-घोषणा</li>
                                <li>तमिलनाडु ई-सेवाई पोर्टल या स्थानीय सीएससी पर ऑनलाइन आवेदन करें</li>
                              </>
                            ) : (
                              <>
                                <li>No family member should have obtained a graduation degree</li>
                                <li>Siblings must not have availed this concession previously</li>
                                <li>Ration Card (Smart Card) & Parents' School TC or self-declaration</li>
                                <li>Apply online on TN e-Sevai portal or local CSC</li>
                              </>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Recommendations List */}
            <div className="glass-card p-4 border border-slate-200 bg-white/40 shadow-sm rounded-lg space-y-2">
              <span className="text-[9px] font-bold font-mono text-gov-navy tracking-wider flex items-center gap-1.5 uppercase">
                <svg className="w-3.5 h-3.5 text-gov-navy shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                </svg>
                <span>{LABELS[locale]?.recommendedTitle || LABELS.en.recommendedTitle}</span>
              </span>
              
              <div className="flex flex-wrap gap-2 pt-1">
                {/* Pudhumai Penn vs Tamil Pudhalvan Recommendation */}
                {isGovtSchool && (
                  gender === 'female' ? (
                    <button
                      onClick={() => {
                        setSearch('Pudhumai Penn');
                        addToast({ type: 'info', message: 'Filtering: Pudhumai Penn Scheme' });
                      }}
                      className="badge badge-purple font-mono cursor-pointer hover:scale-105 active:scale-95 transition-all text-[10px] py-1.5 px-2.5 flex items-center gap-1.5 font-bold"
                    >
                      <svg className="w-3.5 h-3.5 text-purple-700 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/>
                      </svg>
                      <span>Pudhumai Penn Scheme (₹1,000/mo)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSearch('Tamil Pudhalvan');
                        addToast({ type: 'info', message: 'Filtering: Tamil Pudhalvan Scheme' });
                      }}
                      className="badge badge-purple font-mono cursor-pointer hover:scale-105 active:scale-95 transition-all text-[10px] py-1.5 px-2.5 flex items-center gap-1.5 font-bold"
                    >
                      <svg className="w-3.5 h-3.5 text-purple-700 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/>
                      </svg>
                      <span>Tamil Pudhalvan Scheme (₹1,000/mo)</span>
                    </button>
                  )
                )}

                {/* Naan Mudhalvan */}
                <button
                  onClick={() => {
                    setSearch('Naan Mudhalvan');
                    addToast({ type: 'info', message: 'Filtering: Naan Mudhalvan' });
                  }}
                  className="badge badge-cyan font-mono cursor-pointer hover:scale-105 active:scale-95 transition-all text-[10px] py-1.5 px-2.5 flex items-center gap-1.5 font-bold"
                >
                  <svg className="w-3.5 h-3.5 text-cyan-700 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                  </svg>
                  <span>Naan Mudhalvan Scheme</span>
                </button>

                {/* National Scholarship */}
                <button
                  onClick={() => {
                    setSearch('National Scholarship Portal');
                    addToast({ type: 'info', message: 'Filtering: National Scholarship Portal' });
                  }}
                  className="badge badge-glass font-mono cursor-pointer hover:scale-105 active:scale-95 transition-all text-[10px] py-1.5 px-2.5 flex items-center gap-1.5 font-bold"
                >
                  <svg className="w-3.5 h-3.5 text-slate-700 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/>
                  </svg>
                  <span>National Scholarship Portal</span>
                </button>

                {/* PM-USP */}
                <button
                  onClick={() => {
                    setSearch('PM-USP');
                    addToast({ type: 'info', message: 'Filtering: PM-USP' });
                  }}
                  className="badge badge-glass font-mono cursor-pointer hover:scale-105 active:scale-95 transition-all text-[10px] py-1.5 px-2.5 flex items-center gap-1.5 font-bold"
                >
                  <svg className="w-3.5 h-3.5 text-slate-700 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4 1.253"/>
                  </svg>
                  <span>PM-USP Scholarship</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SEARCH BAR ─────────────────────────────────────────────── */}
      <form onSubmit={handleSearchSubmit} className="flex gap-3" role="search" aria-label="Search student schemes">
        <div className="relative flex-1">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-4"
            placeholder={getPlaceholder()}
            id="students-search"
            aria-label="Search student schemes"
          />
        </div>
        <button type="submit" className="btn-cyan px-5 font-display tracking-widest text-[10px]" id="students-search-btn">
          {getSearchBtnText()}
        </button>
      </form>

      {/* ── FILTER CHIPS & LAYOUT TOGGLE ───────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-3 py-1">
          🏫 {t('navStudents') || 'Students'} → Education & Scholarships
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
              id="students-sort-select"
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
            onClick={() => { setSearch(''); }}
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

export default Students;
