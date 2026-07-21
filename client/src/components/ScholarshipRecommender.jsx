import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const SCHOLARSHIPS_DB = [
  {
    id: 'pudhumai-penn',
    name: { en: 'Moovalur Ramamirtham Pudhumai Penn Scheme', ta: 'மூவலூர் ராமாமிர்தம் புதுமைப் பெண் திட்டம்', hi: 'पुधुमई पेन योजना' },
    amount: { en: '₹1,000 / month', ta: '₹1,000 / மாதம்', hi: '₹1,000 / महीना' },
    eligibility: { gender: ['female'], govtSchool: true, level: ['ug', 'diploma', 'pg'] },
    desc: {
      en: 'Financial assistance of ₹1000/month for girl students who studied in Govt schools from 6th to 12th pursuing higher education.',
      ta: '6 முதல் 12 ஆம் வகுப்பு வரை அரசுப் பள்ளிகளில் பயின்று உயர்கல்வி பயிலும் மாணவிகளுக்கு மாதம் ₹1000 உதவித்தொகை.',
      hi: 'सरकारी स्कूलों में कक्षा 6 से 12 तक पढ़ने वाली और उच्च शिक्षा प्राप्त करने वाली छात्राओं के लिए ₹1000/माह।'
    },
    url: 'https://pudhumaipenn.tn.gov.in/'
  },
  {
    id: 'tamil-pudhalvan',
    name: { en: 'Tamil Pudhalvan Scheme', ta: 'தமிழ் புதல்வன் திட்டம்', hi: 'तमिल पुधलवन योजना' },
    amount: { en: '₹1,000 / month', ta: '₹1,000 / மாதம்', hi: '₹1,000 / महीना' },
    eligibility: { gender: ['male'], govtSchool: true, level: ['ug', 'diploma', 'pg'] },
    desc: {
      en: 'Financial assistance of ₹1000/month for boy students who studied in Govt schools from 6th to 12th pursuing higher education.',
      ta: '6 முதல் 12 ஆம் வகுப்பு வரை அரசுப் பள்ளிகளில் பயின்று உயர்கல்வி பயிலும் மாணவர்களுக்கு மாதம் ₹1000 உதவித்தொகை.',
      hi: 'सरकारी स्कूलों में पढ़ने वाले लड़कों के लिए उच्च शिक्षा के लिए ₹1000/माह।'
    },
    url: 'https://tamilpudhalvan.tn.gov.in/'
  },
  {
    id: 'first-graduate',
    name: { en: 'First Graduate Fee Concession', ta: 'முதல் பட்டதாரி கட்டணச் சலுகை', hi: 'प्रथम स्नातक शुल्क रियायत' },
    amount: { en: 'Full Tuition Fee Waiver', ta: 'முழு கல்விக் கட்டண விலக்கு', hi: 'पूरी ट्यूशन फीस माफ़ी' },
    eligibility: { firstGrad: true, level: ['ug', 'diploma'] },
    desc: {
      en: 'Tuition fee concession for students who are the first in their family to pursue graduation.',
      ta: 'குடும்பத்தில் முதல் முறையாக பட்டப்படிப்பு படிக்கும் மாணவர்களுக்கு முழு கல்விக் கட்டண சலுகை.',
      hi: 'परिवार में स्नातक करने वाले पहले छात्र के लिए ट्यूशन फीस में छूट।'
    },
    url: 'https://www.tneaonline.org/'
  },
  {
    id: 'post-matric-scst',
    name: { en: 'Post Matric Scholarship for SC/ST/SCC', ta: 'SC/ST/SCC போஸ்ட் மெட்ரிக் கல்வி உதவித்தொகை', hi: 'SC/ST के लिए पोस्ट मैट्रिक छात्रवृत्ति' },
    amount: { en: 'Maintenance Allowance + Fee', ta: 'பராமரிப்பு படி + கல்விக் கட்டணம்', hi: 'रखरखाव भत्ता + शुल्क' },
    eligibility: { community: ['sc', 'st', 'scc'], level: ['school_11_12', 'ug', 'pg', 'diploma'] },
    desc: {
      en: 'Scholarship for SC/ST/SCC students to pursue higher education from class 11 to Post Graduation.',
      ta: '11 ஆம் வகுப்பு முதல் முதுகலை வரை படிக்கும் SC/ST/SCC மாணவர்களுக்கான கல்வி உதவித்தொகை.',
      hi: 'कक्षा 11 से स्नातकोत्तर तक के SC/ST छात्रों के लिए छात्रवृत्ति।'
    },
    url: 'https://ssp.tn.gov.in/'
  },
  {
    id: 'bcmbc-scholarship',
    name: { en: 'BC/MBC/DNC Scholarship', ta: 'BC/MBC/DNC கல்வி உதவித்தொகை', hi: 'BC/MBC छात्रवृत्ति' },
    amount: { en: 'Variable based on course', ta: 'படிப்பைப் பொறுத்து மாறுபடும்', hi: 'पाठ्यक्रम के आधार पर' },
    eligibility: { community: ['bc', 'mbc'], level: ['school_11_12', 'ug', 'pg', 'diploma'] },
    desc: {
      en: 'State scholarship for Backward and Most Backward class students pursuing higher education.',
      ta: 'பிற்படுத்தப்பட்ட மற்றும் மிகவும் பிற்படுத்தப்பட்ட வகுப்பு மாணவர்களுக்கான மாநில கல்வி உதவித்தொகை.',
      hi: 'उच्च शिक्षा प्राप्त करने वाले पिछड़े वर्ग के छात्रों के लिए राज्य छात्रवृत्ति।'
    },
    url: 'https://bcmbcmw.tn.gov.in/'
  },
  {
    id: 'nmms',
    name: { en: 'National Means-cum-Merit Scholarship', ta: 'தேசிய வருவாய் வழி மற்றும் திறன் படிப்புதவித் திட்டம் (NMMS)', hi: 'राष्ट्रीय साधन-सह-योग्यता छात्रवृत्ति' },
    amount: { en: '₹12,000 / year', ta: '₹12,000 / வருடம்', hi: '₹12,000 / वर्ष' },
    eligibility: { level: ['school_9_10', 'school_11_12'] },
    desc: {
      en: 'Financial assistance for meritorious students of economically weaker sections to arrest dropouts at class 8.',
      ta: 'பொருளாதாரத்தில் பின்தங்கிய திறமையான மாணவர்களுக்கு (9-12 ஆம் வகுப்பு) வழங்கப்படும் உதவித்தொகை.',
      hi: 'आर्थिक रूप से कमजोर वर्ग के मेधावी छात्रों के लिए वित्तीय सहायता।'
    },
    url: 'https://scholarships.gov.in/'
  },
  {
    id: 'aicte-pragati',
    name: { en: 'AICTE Pragati Scholarship for Girls', ta: 'AICTE பிரகதி கல்வி உதவித்தொகை (மாணவிகளுக்கு)', hi: 'प्रगति छात्रवृत्ति' },
    amount: { en: '₹50,000 / year', ta: '₹50,000 / வருடம்', hi: '₹50,000 / वर्ष' },
    eligibility: { gender: ['female'], level: ['ug', 'diploma'] },
    desc: {
      en: 'Scholarship by AICTE providing financial assistance for advancement of girls pursuing Technical Education.',
      ta: 'தொழில்நுட்பக் கல்வி (Engineering/Diploma) பயிலும் மாணவிகளை ஊக்குவிப்பதற்கான AICTE உதவித்தொகை.',
      hi: 'तकनीकी शिक्षा प्राप्त करने वाली लड़कियों की उन्नति के लिए AICTE छात्रवृत्ति।'
    },
    url: 'https://scholarships.gov.in/'
  },
  {
    id: 'ugc-single-girl',
    name: { en: 'UGC Indira Gandhi Scholarship for Single Girl Child', ta: 'UGC இந்திரா காந்தி ஒற்றைப் பெண் குழந்தை உதவித்தொகை', hi: 'यूजीसी एकल बालिका छात्रवृत्ति' },
    amount: { en: '₹36,200 / year', ta: '₹36,200 / வருடம்', hi: '₹36,200 / वर्ष' },
    eligibility: { gender: ['female'], level: ['pg'] },
    desc: {
      en: 'Financial assistance to single girl child for pursuing Post Graduate courses to promote girl education.',
      ta: 'பெண் கல்வியை ஊக்குவிக்க, குடும்பத்தின் ஒரே பெண் குழந்தையாக இருந்து முதுகலை பயிலும் மாணவிகளுக்கு உதவித்தொகை.',
      hi: 'एकल बालिका के लिए स्नातकोत्तर पाठ्यक्रम करने के लिए वित्तीय सहायता।'
    },
    url: 'https://scholarships.gov.in/'
  },
  {
    id: 'csss-merit',
    name: { en: 'Central Sector Scheme of Scholarship (CSSS)', ta: 'மத்திய அரசின் கல்வி உதவித்தொகை (CSSS)', hi: 'केंद्रीय क्षेत्र छात्रवृत्ति योजना' },
    amount: { en: '₹12,000 - ₹20,000 / year', ta: '₹12,000 - ₹20,000 / வருடம்', hi: '₹12,000 - ₹20,000 / वर्ष' },
    eligibility: { level: ['ug', 'pg'] },
    desc: {
      en: 'Merit-based scholarship for college and university students belonging to low income families.',
      ta: 'குறைந்த வருமானம் கொண்ட குடும்பங்களைச் சேர்ந்த கல்லூரியில் அதிக மதிப்பெண் பெறும் மாணவர்களுக்கு தகுதி அடிப்படையிலான உதவித்தொகை.',
      hi: 'कॉलेज और विश्वविद्यालय के छात्रों के लिए योग्यता आधारित छात्रवृत्ति।'
    },
    url: 'https://scholarships.gov.in/'
  },
  {
    id: 'pre-matric-minority',
    name: { en: 'Pre-Matric Scholarship for Minorities', ta: 'சிறுபான்மையினருக்கான ப்ரீ-மெட்ரிக் கல்வி உதவித்தொகை', hi: 'अल्पसंख्यकों के लिए प्री-मैट्रिक छात्रवृत्ति' },
    amount: { en: 'Admission Fee + Maintenance', ta: 'சேர்க்கைக் கட்டணம் + பராமரிப்பு படி', hi: 'प्रवेश शुल्क + रखरखाव' },
    eligibility: { level: ['school_9_10'] },
    desc: {
      en: 'Scholarship for students belonging to minority communities studying in classes 9 to 10.',
      ta: '9 மற்றும் 10 ஆம் வகுப்புகளில் பயிலும் சிறுபான்மையின (இஸ்லாமியர், கிறித்துவர், சீக்கியர்) மாணவர்களுக்கான உதவித்தொகை.',
      hi: 'अल्पसंख्यक समुदायों के छात्रों के लिए कक्षा 9 से 10 तक अध्ययन करने के लिए।'
    },
    url: 'https://scholarships.gov.in/'
  },
  {
    id: 'inspire-she',
    name: { en: 'INSPIRE Scholarship for Higher Education (SHE)', ta: 'உயர்கல்விக்கான INSPIRE உதவித்தொகை', hi: 'इंस्पायर छात्रवृत्ति (SHE)' },
    amount: { en: '₹80,000 / year', ta: '₹80,000 / வருடம்', hi: '₹80,000 / वर्ष' },
    eligibility: { level: ['ug', 'pg'] },
    desc: {
      en: 'Scholarship offered by the Dept of Science & Technology for students pursuing Basic/Natural Sciences at UG & PG levels.',
      ta: 'இளங்கலை மற்றும் முதுகலையில் அறிவியல் படிப்புகளை (B.Sc/M.Sc) படிக்கும் தலைசிறந்த மாணவர்களுக்கு மத்திய அறிவியல் துறை வழங்கும் மாபெரும் உதவித்தொகை.',
      hi: 'विज्ञान और प्रौद्योगिकी विभाग द्वारा प्राकृतिक विज्ञान में यूजी/पीजी करने वाले छात्रों के लिए।'
    },
    url: 'https://online-inspire.gov.in/'
  },
  {
    id: 'cm-award-scst',
    name: { en: 'Chief Minister Award for SC/ST/SCC', ta: 'முதலமைச்சர் விருது உதவித்தொகை (SC/ST/SCC)', hi: 'मुख्यमंत्री पुरस्कार' },
    amount: { en: '₹3,000 / year', ta: '₹3,000 / வருடம்', hi: '₹3,000 / वर्ष' },
    eligibility: { community: ['sc', 'st', 'scc'], level: ['ug', 'pg'] },
    desc: {
      en: 'Award for SC/ST/SCC students who secure high marks in the 12th standard public examination.',
      ta: '12 ஆம் வகுப்பு பொதுத் தேர்வில் அதிக மதிப்பெண் பெற்ற SC/ST/SCC மாணவர்களுக்கு அரசால் வழங்கப்படும் உதவித்தொகை.',
      hi: '12वीं कक्षा में उच्च अंक प्राप्त करने वाले SC/ST छात्रों के लिए।'
    },
    url: 'https://ssp.tn.gov.in/'
  },
  {
    id: 'aicte-saksham',
    name: { en: 'AICTE Saksham Scholarship', ta: 'AICTE சக்‌ஷம் கல்வி உதவித்தொகை (மாற்றுத்திறனாளிகள்)', hi: 'सक्षम छात्रवृत्ति' },
    amount: { en: '₹50,000 / year', ta: '₹50,000 / வருடம்', hi: '₹50,000 / वर्ष' },
    eligibility: { level: ['ug', 'diploma'] },
    desc: {
      en: 'Financial support to Specially-abled students to pursue Technical Education (Degree/Diploma).',
      ta: 'தொழில்நுட்பக் கல்வி பயிலும் மாற்றுத்திறனாளி மாணவர்களை ஊக்குவிப்பதற்காக AICTE வழங்கும் சிறப்பு உதவித்தொகை.',
      hi: 'तकनीकी शिक्षा प्राप्त करने वाले विशेष रूप से विकलांग छात्रों के लिए वित्तीय सहायता।'
    },
    url: 'https://scholarships.gov.in/'
  }
];

export default function ScholarshipRecommender() {
  const { t, locale } = useLanguage();
  const [formData, setFormData] = useState({
    gender: 'any',
    community: 'any',
    level: 'any',
    govtSchool: false,
    firstGrad: false
  });
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);

    setTimeout(() => {
      const matched = SCHOLARSHIPS_DB.filter(s => {
        if (s.eligibility.gender && formData.gender !== 'any' && !s.eligibility.gender.includes(formData.gender)) return false;
        if (s.eligibility.community && formData.community !== 'any' && !s.eligibility.community.includes(formData.community)) return false;
        if (s.eligibility.level && formData.level !== 'any' && !s.eligibility.level.includes(formData.level)) return false;
        if (s.eligibility.govtSchool && !formData.govtSchool) return false;
        if (s.eligibility.firstGrad && !formData.firstGrad) return false;
        return true;
      });
      setResults(matched);
      setIsSearching(false);
    }, 800);
  };

  const getLabel = (loc, en, ta, hi) => {
    if (loc === 'ta') return ta;
    if (loc === 'hi') return hi;
    return en;
  };

  return (
    <div className="space-y-6 animate-slide-up mt-8">
      <div className="bg-gradient-to-br from-gov-navy to-blue-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg>
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-black font-display mb-2">
            {getLabel(locale, 'AI Scholarship Recommender', 'AI கல்வி உதவித்தொகை பரிந்துரை', 'एआई छात्रवृत्ति खोजकर्ता')}
          </h2>
          <p className="text-blue-100 text-sm">
            {getLabel(locale, 'Enter your profile details below to instantly find government scholarships you are eligible for.', 'உங்கள் விவரங்களை உள்ளிட்டு, உங்களுக்குத் தகுதியான அரசு உதவித்தொகைகளை உடனடியாகத் தெரிந்துகொள்ளுங்கள்.', 'पात्र सरकारी छात्रवृत्ति तुरंत खोजने के लिए अपना विवरण दर्ज करें।')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <form onSubmit={handleSearch} className="glass-card p-5 space-y-4 shadow-sm border border-slate-200 rounded-xl sticky top-24">
            <h3 className="font-bold text-gov-navy border-b border-slate-100 pb-2 mb-3">
              {getLabel(locale, 'Student Profile', 'மாணவர் விவரங்கள்', 'छात्र प्रोफ़ाइल')}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {getLabel(locale, 'Education Level', 'கல்வி நிலை', 'शिक्षा स्तर')}
                </label>
                <select 
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  value={formData.level}
                  onChange={e => setFormData({...formData, level: e.target.value})}
                >
                  <option value="any">{getLabel(locale, 'Select Level', 'தேர்ந்தெடுக்கவும்', 'चुनें')}</option>
                  <option value="school_9_10">9th - 10th Std</option>
                  <option value="school_11_12">11th - 12th Std</option>
                  <option value="ug">UG Degree (Arts/Sci/Engg)</option>
                  <option value="diploma">Diploma / ITI</option>
                  <option value="pg">PG Degree</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {getLabel(locale, 'Gender', 'பாலினம்', 'लिंग')}
                </label>
                <select 
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  value={formData.gender}
                  onChange={e => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="any">{getLabel(locale, 'Any', 'ஏதேனும்', 'कोई भी')}</option>
                  <option value="male">{getLabel(locale, 'Male', 'ஆண்', 'पुरुष')}</option>
                  <option value="female">{getLabel(locale, 'Female', 'பெண்', 'महिला')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {getLabel(locale, 'Community', 'வகுப்பு (Community)', 'समुदाय')}
                </label>
                <select 
                  className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  value={formData.community}
                  onChange={e => setFormData({...formData, community: e.target.value})}
                >
                  <option value="any">{getLabel(locale, 'Any', 'ஏதேனும்', 'कोई भी')}</option>
                  <option value="bc">BC / BCM</option>
                  <option value="mbc">MBC / DNC</option>
                  <option value="sc">SC / SCC</option>
                  <option value="st">ST</option>
                  <option value="general">General (OC)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    checked={formData.govtSchool}
                    onChange={e => setFormData({...formData, govtSchool: e.target.checked})}
                  />
                  <span className="text-xs font-bold text-slate-700">
                    {getLabel(locale, 'Studied in TN Govt School (6th-12th)', 'அரசுப் பள்ளியில் படித்தவர் (6-12ஆம் வகுப்பு)', 'TN सरकारी स्कूल में अध्ययन किया')}
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    checked={formData.firstGrad}
                    onChange={e => setFormData({...formData, firstGrad: e.target.checked})}
                  />
                  <span className="text-xs font-bold text-slate-700">
                    {getLabel(locale, 'First Graduate in Family', 'குடும்பத்தில் முதல் பட்டதாரி', 'परिवार में प्रथम स्नातक')}
                  </span>
                </label>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSearching}
              className="w-full mt-4 py-2.5 bg-gov-navy hover:bg-blue-800 text-white text-sm font-bold font-display rounded-lg transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isSearching ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  {getLabel(locale, 'Analyzing Matches...', 'தேடப்படுகிறது...', 'खोजा जा रहा है...')}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  {getLabel(locale, 'Find My Scholarships', 'எனக்கான உதவித்தொகைகளைத் தேடு', 'मेरी छात्रवृत्ति खोजें')}
                </>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {results === null ? (
            <div className="glass-card p-10 text-center flex flex-col items-center justify-center min-h-[300px] border border-slate-200 rounded-xl">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                {getLabel(locale, 'Discover Eligible Scholarships', 'உதவித்தொகைகளைக் கண்டறியுங்கள்', 'पात्र छात्रवृत्ति खोजें')}
              </h3>
              <p className="text-sm text-slate-500 max-w-md">
                {getLabel(locale, 'Fill out the profile form on the left and hit search. We will analyze Tamil Nadu and Central Govt schemes to find the best matches for you.', 'இடதுபுறம் உள்ள படிவத்தை நிரப்பி தேடவும். உங்களுக்குப் பொருந்தக்கூடிய மாநில மற்றும் மத்திய அரசு திட்டங்களை AI கண்டறியும்.', 'बाईं ओर फॉर्म भरें और खोजें।')}
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="glass-card p-8 text-center border border-amber-100 bg-amber-50/30 rounded-xl">
              <span className="text-4xl mb-3 block">😕</span>
              <h3 className="font-bold text-amber-900 mb-1">
                {getLabel(locale, 'No exact matches found', 'பொருத்தமான உதவித்தொகைகள் கிடைக்கவில்லை', 'कोई सटीक मेल नहीं मिला')}
              </h3>
              <p className="text-sm text-amber-700/80">
                {getLabel(locale, 'Try adjusting your filters (e.g. set level or community to "Any").', 'தேடல் விவரங்களை மாற்றி அமைத்து மீண்டும் முயற்சிக்கவும்.', 'कृपया अपने फ़िल्टर समायोजित करने का प्रयास करें।')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="font-bold text-slate-700 text-sm">
                  {getLabel(locale, 'Recommended For You', 'உங்களுக்கான பரிந்துரைகள்', 'आपके लिए अनुशंसित')}
                </h3>
                <span className="badge badge-cyan font-bold">
                  {results.length} {getLabel(locale, 'Matches', 'திட்டங்கள்', 'मेल')}
                </span>
              </div>
              
              <div className="grid gap-4 animate-fade-in">
                {results.map((item, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:bg-cyan-400 transition-colors" />
                    
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <h4 className="font-black font-display text-gov-navy text-base leading-tight">
                        {item.name[locale] || item.name.en}
                      </h4>
                      <span className="shrink-0 bg-green-50 text-green-700 border border-green-200 text-[10px] font-black px-2 py-1 rounded font-mono uppercase tracking-wider">
                        {item.amount[locale] || item.amount.en}
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-600 mb-4 leading-relaxed font-medium">
                      {item.desc[locale] || item.desc.en}
                    </p>
                    
                    <div className="flex justify-end">
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-gov-navy text-gov-navy hover:text-white border border-slate-200 hover:border-transparent text-xs font-bold rounded-lg transition-colors"
                      >
                        {getLabel(locale, 'Apply Now', 'விண்ணப்பிக்க', 'अभी आवेदन करें')} ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
