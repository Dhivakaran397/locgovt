const mongoose = require('mongoose');
require('dotenv').config();

const GovtService = require('./models/GovtService');

const SEED_SERVICES = [
  {
    serviceName: 'Tamil Nadu Free Laptop Scheme for Students',
    category: 'Education & Scholarships',
    officialUrl: 'https://www.tn.gov.in',
    description: 'Free laptops provided by the Government of Tamil Nadu to school and college students to support digital learning and career preparation.',
    globalClickCount: 3100,
    districtWiseClicks: { 'Chennai': 610, 'Coimbatore': 520, 'Madurai': 480 },
    currentStatus: { indicator: 'UP', downVotesCount: 0 },
    guidelines: {
      en: [
        'Must be a student of Class 11, Class 12, or studying in government/government-aided colleges in Tamil Nadu.',
        'Must have completed schooling in a government or government-aided school in Tamil Nadu.',
        'Submit application through your school or college head of institution.',
        'Required documents: School identity card, Aadhaar card, and family income certificate.'
      ],
      ta: [
        'தமிழ்நாட்டில் உள்ள அரசு அல்லது அரசு உதவி பெறும் பள்ளி மற்றும் கல்லூரி மாணவராக இருக்க வேண்டும்.',
        'பள்ளி அல்லது கல்லூரி முதல்வர் மூலம் விண்ணப்பத்தை சமர்ப்பிக்க வேண்டும்.',
        'தேவையான ஆவணங்கள்: பள்ளி அடையாள அட்டை, ஆதார் அட்டை மற்றும் குடும்ப வருமான சான்றிதழ்.'
      ],
      hi: [
        'तमिलनाडु के सरकारी या सरकारी सहायता प्राप्त स्कूल/कॉलेज का छात्र होना चाहिए।',
        'आवेदन स्कूल या कॉलेज के प्रधान के माध्यम से जमा किया जाना चाहिए।',
        'आवश्यक दस्तावेज: स्कूल पहचान पत्र, आधार कार्ड और परिवार का आय प्रमाण पत्र।'
      ]
    }
  },
  {
    serviceName: 'Kalaignar Sports Kit Scheme',
    category: 'Social Welfare',
    officialUrl: 'https://www.tn.gov.in',
    description: 'Distribution of comprehensive sports kits to village panchayats in Tamil Nadu to promote rural sports talent and youth health.',
    globalClickCount: 1750,
    districtWiseClicks: { 'Salem': 290, 'Trichy': 240, 'Tirunelveli': 210 },
    currentStatus: { indicator: 'UP', downVotesCount: 0 },
    guidelines: {
      en: [
        'Sports kits will be distributed directly to registered youth clubs and village panchayat representatives.',
        'Contact the block development officer (BDO) or district sports officer to check allocation.',
        'Required: Registration details of local youth sports association and village panchayat approval.'
      ],
      ta: [
        'விளையாட்டு உபகரணங்கள் நேரடியாக பதிவு செய்யப்பட்ட இளைஞர் மன்றங்கள் மற்றும் ஊராட்சி பிரதிநிதிகளுக்கு வழங்கப்படும்.',
        'வட்டார வளர்ச்சி அலுவலர் (BDO) அல்லது மாவட்ட விளையாட்டு அலுவலரை தொடர்பு கொள்ளவும்.',
        'தேவை: உள்ளூர் இளைஞர் விளையாட்டு சங்கத்தின் பதிவு மற்றும் ஊராட்சி ஒப்புதல்.'
      ],
      hi: [
        'खेल किट सीधे पंजीकृत युवा क्लबों और ग्राम पंचायत प्रतिनिधियों को वितरित किए जाएंगे।',
        'आवंटन की जांच के लिए ब्लॉक विकास अधिकारी (BDO) या जिला खेल अधिकारी से संपर्क करें।'
      ]
    }
  },
  {
    serviceName: 'PM Kisan Samman Nidhi Yojana',
    category: 'Agriculture & Farming',
    officialUrl: 'https://pmkisan.gov.in',
    description: 'Central government income support of ₹6,000 per year in three equal installments to landholding farmer families across India.',
    globalClickCount: 2980,
    districtWiseClicks: { 'Erode': 510, 'Thanjavur': 490, 'Cuddalore': 380 },
    currentStatus: { indicator: 'UP', downVotesCount: 0 },
    guidelines: {
      en: [
        'Open to all landholding farmer families across the country.',
        'Institutional landholders and high-income taxpayers are excluded.',
        'Applicant details must match land records and Aadhaar linked bank accounts.',
        'Register online via PM-Kisan portal or e-Sevai centers.'
      ],
      ta: [
        'நாடு முழுவதும் உள்ள நிலம் வைத்திருக்கும் அனைத்து விவசாயி குடும்பங்களுக்கும் பொருந்தும்.',
        'விண்ணப்பதாரர் விவரங்கள் நில ஆவணங்கள் மற்றும் ஆதார் இணைக்கப்பட்ட வங்கிக் கணக்குடன் பொருந்த வேண்டும்.',
        'PM-Kisan இணையதளம் அல்லது இ-சேவை மையங்கள் மூலம் ஆன்லைனில் பதிவு செய்யவும்.'
      ],
      hi: [
        'देश भर के सभी भूमिधारक किसान परिवारों के लिए खुला है।',
        'संस्थागत भूमिधारक और उच्च आय वाले करदाता बाहर रखे गए हैं।',
        'आवेदक का विवरण भूमि रिकॉर्ड और आधार से जुड़े बैंक खाते से मेल खाना चाहिए।'
      ]
    }
  },
  {
    serviceName: 'PM Vishwakarma Scheme',
    category: 'Social Welfare',
    officialUrl: 'https://pmvishwakarma.gov.in',
    description: 'Skill training, toolkit incentives up to ₹15,000, and collateral-free loan support for traditional artisans and craftspeople.',
    globalClickCount: 2200,
    districtWiseClicks: { 'Chennai': 420, 'Madurai': 380, 'Coimbatore': 310 },
    currentStatus: { indicator: 'UP', downVotesCount: 0 },
    guidelines: {
      en: [
        'Artisan must be working in one of the 18 specified family-based traditional trades (e.g. carpenter, blacksmith, potter).',
        'Minimum age of applicant must be 18 years.',
        'Benefit is restricted to one member per family.',
        'Register through Common Service Centers (CSC) with Aadhaar and bank details.'
      ],
      ta: [
        'கைவினைஞர் குறிப்பிடப்பட்ட 18 பாரம்பரிய தொழில்களில் (தச்சர், கொல்லர், குயவர் போன்றவை) ஈடுபட்டிருக்க வேண்டும்.',
        'விண்ணப்பதாரரின் குறைந்தபட்ச வயது 18 ஆக இருக்க வேண்டும்.',
        'குடும்பத்தில் ஒருவருக்கு மட்டுமே இத்திட்டத்தின் கீழ் பயன் கிடைக்கும்.',
        'பொது சேவை மையங்கள் (CSC) மூலம் ஆதார் மற்றும் வங்கி விவரங்களுடன் பதிவு செய்யவும்.'
      ],
      hi: [
        'कारीगर को 18 निर्दिष्ट परिवार-आधारित पारंपरिक व्यवसायों में से एक में काम करना चाहिए।',
        'आवेदक की न्यूनतम आयु 18 वर्ष होनी चाहिए।',
        'लाभ प्रति परिवार एक सदस्य तक सीमित है।'
      ]
    }
  },
  {
    serviceName: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
    category: 'Health & Medical',
    officialUrl: 'https://pmjay.gov.in',
    description: 'Health coverage up to ₹5 Lakhs per family per year for secondary and tertiary care hospitalization to poor and vulnerable families.',
    globalClickCount: 3400,
    districtWiseClicks: { 'Chennai': 750, 'Salem': 420, 'Coimbatore': 380 },
    currentStatus: { indicator: 'UP', downVotesCount: 0 },
    guidelines: {
      en: [
        'Families identified in the Socio-Economic Caste Census (SECC) database are eligible.',
        'No limit on family size, age, or gender.',
        'Cashless and paperless access to healthcare services at empaneled hospitals.',
        'Bring PMJAY golden card or e-card along with Aadhaar to hospital.'
      ],
      ta: [
        'சமூக-பொருளாதார சாதி கணக்கெடுப்பு (SECC) தரவுத்தளத்தில் உள்ள குடும்பங்கள் தகுதியானவை.',
        'குடும்ப உறுப்பினர்களின் எண்ணிக்கை, வயது அல்லது பாலினத்திற்கு எந்த வரம்பும் இல்லை.',
        'அங்கீகரிக்கப்பட்ட மருத்துவமனைகளில் பணம் மற்றும் காகிதமில்லா சிகிச்சை பெறலாம்.',
        'சிகிச்சையின் போது ஆதார் அட்டையுடன் PMJAY அட்டை அல்லது மின்-அட்டையை எடுத்துச் செல்லவும்.'
      ],
      hi: [
        'सामाजिक-आर्थिक जाति जनगणना (SECC) डेटाबेस में पहचाने गए परिवार पात्र हैं।',
        'परिवार के आकार, आयु या लिंग की कोई सीमा नहीं है।',
        'सूचीबद्ध अस्पतालों में स्वास्थ्य सेवाओं तक कैशलेस और पेपरलेस पहुंच।'
      ]
    }
  },
  {
    serviceName: 'Tamil Nadu Free Bicycle Scheme for Students',
    category: 'Education & Scholarships',
    officialUrl: 'https://www.tn.gov.in',
    description: 'Free bicycles distributed to government and government-aided school students of Class 11 and 12 to assist their daily travel.',
    globalClickCount: 2600,
    districtWiseClicks: { 'Trichy': 380, 'Madurai': 340, 'Vellore': 310 },
    currentStatus: { indicator: 'UP', downVotesCount: 0 },
    guidelines: {
      en: [
        'Must be studying in Class 11 or Class 12 in a Government or Government-aided school in Tamil Nadu.',
        'Applies to students from all social categories.',
        'Distribution is managed internally by the school headmasters.',
        'Submit active student registration details through the EMIS portal.'
      ],
      ta: [
        'தமிழ்நாட்டில் உள்ள அரசு அல்லது அரசு உதவி பெறும் பள்ளியில் 11 அல்லது 12 ஆம் வகுப்பு படித்துக் கொண்டிருக்க வேண்டும்.',
        'அனைத்து சமூகப் பிரிவைச் சேர்ந்த மாணவர்களுக்கும் இது பொருந்தும்.',
        'பள்ளித் தலைமையாசிரியர்களால் விநியோகம் நேரடியாக நிர்வகிக்கப்படும்.',
        'EMIS இணையதளம் மூலம் மாணவர் பதிவு விவரங்களை சமர்ப்பிக்கவும்.'
      ],
      hi: [
        'तमिलनाडु के सरकारी या सरकारी सहायता प्राप्त स्कूल में कक्षा 11 या 12 में पढ़ रहा होना चाहिए।',
        'सभी सामाजिक श्रेणियों के छात्रों पर लागू होता है।',
        'वितरण का प्रबंधन स्कूल के प्रधानाध्यापकों द्वारा किया जाता है।'
      ]
    }
  },
  // ── Recent Tamil Nadu Chief Minister Schemes ──────────────────────
  {
    serviceName: 'Pudhumai Penn Scheme — Higher Education Assurance for Girls',
    category: 'Education & Scholarships',
    officialUrl: 'https://www.penkalvi.tn.gov.in',
    description: 'Financial assistance of ₹1,000/month for government school girl students pursuing higher education in Tamil Nadu.',
    globalClickCount: 2450,
    districtWiseClicks: { 'Chennai': 480, 'Coimbatore': 420, 'Madurai': 350 },
    currentStatus: { indicator: 'UP', downVotesCount: 0 },
    videoUrl: 'https://www.youtube.com/watch?v=kU_Ua0B1LGs',
    guidelines: {
      en: [
        'Eligible only for girl students who studied in Government schools in Tamil Nadu from Class 6 to 12.',
        'Must be enrolled in a recognized higher education course (Degree, Diploma, ITI, or Professional course).',
        'Upload your Class 6-12 Government school transfer certificate (TC) and active bank details.',
        'The ₹1,000 monthly allowance will be directly credited to the student bank account.'
      ],
      ta: [
        'தமிழ்நாடு அரசுப் பள்ளிகளில் 6 முதல் 12 ஆம் வகுப்பு வரை படித்த மாணவிகள் மட்டுமே இத்திட்டத்திற்குத் தகுதியானவர்கள்.',
        'அங்கீகரிக்கப்பட்ட உயர்கல்வி படிப்பில் (பட்டப்படிப்பு, டிப்ளமோ, ITI) சேர்ந்திருக்க வேண்டும்.',
        'அரசுப் பள்ளி மாற்றுச் சான்றிதழ் (TC) மற்றும் வங்கி கணக்கு விவரங்களை இணையதளத்தில் பதிவேற்ற வேண்டும்.',
        'மாதாந்திர ஊக்கத்தொகையான ₹1,000 நேரடியாக மாணவியின் வங்கிக் கணக்கில் செலுத்தப்படும்.'
      ],
      hi: [
        'केवल तमिलनाडु के सरकारी स्कूलों में कक्षा 6 से 12 तक पढ़ने वाली छात्राओं के लिए पात्र।',
        'मान्यता प्राप्त उच्च शिक्षा पाठ्यक्रम (डिग्री, डिप्लोमा, आईटीआई) में नामांकित होना चाहिए।',
        'कक्षा 6-12 का सरकारी स्कूल ट्रांसफर सर्टिफिकेट (टीसी) और बैंक विवरण अपलोड करें।',
        '₹1,000 का मासिक भत्ता सीधे छात्रा के बैंक खाते में जमा किया जाएगा।'
      ]
    }
  },
  {
    serviceName: 'Tamil Pudhalvan Scheme — Higher Education Assurance for Boys',
    category: 'Education & Scholarships',
    officialUrl: 'https://www.tn.gov.in',
    description: 'Financial assistance of ₹1,000/month for government school boy students pursuing higher education in Tamil Nadu.',
    globalClickCount: 1980,
    districtWiseClicks: { 'Chennai': 390, 'Coimbatore': 350, 'Salem': 290 },
    currentStatus: { indicator: 'UP', downVotesCount: 0 },
    guidelines: {
      en: [
        'Eligible only for boy students who studied in Government schools in Tamil Nadu from Class 6 to 12.',
        'Must be enrolled in a recognized degree, diploma, or ITI course in Tamil Nadu.',
        'Upload your government school study certificate and active Aadhaar-linked bank details.',
        'The monthly financial assistance of ₹1,000 will be credited directly to the student bank account.'
      ],
      ta: [
        'தமிழ்நாடு அரசுப் பள்ளிகளில் 6 முதல் 12 ஆம் வகுப்பு வரை படித்த மாணவர்கள் மட்டுமே இத்திட்டத்திற்குத் தகுதியானவர்கள்.',
        'அங்கீகரிக்கப்பட்ட உயர்கல்வி படிப்பில் (பட்டப்படிப்பு, டிப்ளமோ, ITI) சேர்ந்திருக்க வேண்டும்.',
        'அரசுப் பள்ளி படிப்புச் சான்றிதழ் மற்றும் ஆதார் இணைக்கப்பட்ட வங்கிக் கணக்கை சமர்ப்பிக்க வேண்டும்.',
        'மாதாந்திர உதவித்தொகையான ₹1,000 நேரடியாக மாணவரின் வங்கிக் கணக்கில் செலுத்தப்படும்.'
      ],
      hi: [
        'केवल तमिलनाडु के सरकारी स्कूलों में कक्षा 6 से 12 तक पढ़ने वाले छात्रों के लिए पात्र।',
        'मान्यता प्राप्त डिग्री, डिप्लोमा या आईटीआई पाठ्यक्रम में नामांकित होना चाहिए।',
        'सरकारी स्कूल का अध्ययन प्रमाण पत्र और आधार-लिंक्ड बैंक विवरण अपलोड करें।',
        '₹1,000 की मासिक वित्तीय सहायता सीधे छात्र के बैंक खाते में जमा किया जाएगी।'
      ]
    }
  },
  {
    serviceName: 'Kalaignar Magalir Urimai Thogai Scheme',
    category: 'Social Welfare',
    officialUrl: 'https://kmut.tn.gov.in',
    description: 'Monthly basic income assistance of ₹1,000 for eligible women heads of households in Tamil Nadu.',
    globalClickCount: 3120,
    districtWiseClicks: { 'Chennai': 680, 'Coimbatore': 590, 'Madurai': 510 },
    currentStatus: { indicator: 'UP', downVotesCount: 0 },
    guidelines: {
      en: [
        'The applicant must be a woman head of the household in Tamil Nadu (aged 21 or above).',
        'Annual family income must be less than ₹2.5 Lakhs.',
        'The household annual electricity consumption must be less than 3,600 units.',
        'The family must own less than 5 acres of dry land or 2.5 acres of wet land.'
      ],
      ta: [
        'விண்ணப்பதாரர் தமிழ்நாட்டைச் சேர்ந்த குடும்பத் தலைவியாக (21 வயது அல்லது அதற்கு மேற்பட்டவர்) இருக்க வேண்டும்.',
        'குடும்பத்தின் ஆண்டு வருமானம் ₹2.5 லட்சத்திற்கும் குறைவாக இருக்க வேண்டும்.',
        'குடும்பத்தின் ஆண்டு மின்சார நுகர்வு 3,600 யூனிட்டுகளுக்கும் குறைவாக இருக்க வேண்டும்.',
        'குடும்பத்திற்கு 5 ஏக்கருக்கும் குறைவான புன்செய் நிலம் அல்லது 2.5 ஏக்கருக்கும் குறைவான நன்செய் நிலம் இருக்க வேண்டும்.'
      ],
      hi: [
        'आवेदक तमिलनाडु में परिवार की महिला मुखिया (21 वर्ष या उससे अधिक आयु) होनी चाहिए।',
        'पारिवारिक वार्षिक आय ₹2.5 लाख से कम होनी चाहिए।',
        'परिवार की वार्षिक बिजली खपत 3,600 यूनिट से कम होनी चाहिए।',
        'परिवार के पास 5 एकड़ से कम सूखी भूमि या 2.5 एकड़ से कम गीली भूमि होनी चाहिए।'
      ]
    }
  },
  {
    serviceName: 'Chief Ministers Breakfast Scheme (Kaalai Unavu Thittam)',
    category: 'Social Welfare',
    officialUrl: 'https://www.tn.gov.in',
    description: 'Free nutritious breakfast program for primary school children studying in government schools in Tamil Nadu.',
    globalClickCount: 1540,
    districtWiseClicks: { 'Chennai': 310, 'Coimbatore': 280, 'Tiruchirappalli': 210 },
    currentStatus: { indicator: 'UP', downVotesCount: 0 },
    guidelines: {
      en: [
        'Applicable only for primary school students (Class 1 to 5) in Tamil Nadu.',
        'Must be studying in a government or local body primary school.',
        'Provides nutritious hot breakfast on all school working days free of cost.',
        'Enrollment is automatically processed through the school admission register.'
      ],
      ta: [
        'தமிழ்நாட்டின் தொடக்கப்பள்ளி மாணவர்களுக்கு (வகுப்பு 1 முதல் 5 வரை) மட்டுமே இத்திட்டம் பொருந்தும்.',
        'அரசு அல்லது உள்ளாட்சித் தொடக்கப் பள்ளிகளில் படிக்கும் மாணவராக இருக்க வேண்டும்.',
        'பள்ளி வேலைநாட்கள் அனைத்திலும் சத்தான காலை உணவு இலவசமாக வழங்கப்படும்.',
        'பள்ளி சேர்க்கைப் பதிவேட்டின் மூலம் சேர்க்கை தானாகவே நடைபெறும்.'
      ],
      hi: [
        'केवल तमिलनाडु में प्राथमिक विद्यालय के छात्रों (कक्षा 1 से 5) के लिए लागू।',
        'सरकारी या स्थानीय निकाय प्राथमिक विद्यालय में पढ़ रहा होना चाहिए।',
        'सभी स्कूल कार्य दिवसों में मुफ्त पौष्टिक गर्म नाश्ता प्रदान किया जाता है।',
        'नामांकन स्कूल प्रवेश रजिस्टर के माध्यम से स्वचालित रूप से किया जाता है।'
      ]
    }
  },
  {
    serviceName: 'Naan Mudhalvan Scheme — Skill Enhancement Initiative',
    category: 'Education & Scholarships',
    officialUrl: 'https://www.naanmudhalvan.tn.gov.in',
    description: 'Free dynamic skill enhancement, technology training, and career guidance courses for college students in Tamil Nadu.',
    globalClickCount: 1620,
    districtWiseClicks: { 'Chennai': 380, 'Coimbatore': 320, 'Trichy': 240 },
    currentStatus: { indicator: 'UP', downVotesCount: 0 },
    guidelines: {
      en: [
        'Open to college students studying in arts, science, engineering, and polytechnic colleges in Tamil Nadu.',
        'Offers free certified online training courses in Coding, Cloud Computing, Electronics, and languages.',
        'Access career assessment tools and placement support through the portal.',
        'Log in with your academic credentials provided by your institution.'
      ],
      ta: [
        'தமிழ்நாட்டில் உள்ள கலை, அறிவியல், பொறியியல் மற்றும் பாலிடெக்னிக் கல்லூரிகளில் பயிலும் மாணவர்களுக்குப் பொருந்தும்.',
        'கோடிங், கிளவுட் கம்ப்யூட்டிங், எலக்ட்ரானிக்ஸ் மற்றும் பிற மொழிகளில் இலவச சான்றிதழ் படிப்புகள் வழங்கப்படும்.',
        'இணையதளம் வழியாக தொழில் வழிகாட்டுதல் மதிப்பீடுகள் மற்றும் வேலைவாய்ப்பு ஆதரவைப் பெறலாம்.',
        'உங்கள் கல்லூரி வழங்கிய கல்விச் சான்றுகளைக் கொண்டு உள்நுழையவும்.'
      ],
      hi: [
        'तमिलनाडु के कला, विज्ञान, engineering और पॉलिटेक्निक कॉलेजों में पढ़ने वाले कॉलेज छात्रों के लिए उपलब्ध।',
        'कोडिंग, क्लाउड कंप्यूटिंग, इलेक्ट्रॉनिक्स और भाषाओं में मुफ्त प्रमाणित ऑनलाइन प्रशिक्षण पाठ्यक्रम प्रदान करता है।',
        'पोर्टल के माध्यम से करियर मार्गदर्शन उपकरण और प्लेसमेंट सहायता प्राप्त करें।',
        'अपने संस्थान द्वारा प्रदान किए गए शैक्षणिक क्रेडेंशियल्स के साथ लॉग इन करें।'
      ]
    }
  },
  {
    serviceName: 'Makkalai Thedi Maruthuvam — Healthcare at Doorsteps',
    category: 'Health & Medical',
    officialUrl: 'https://www.tn.gov.in',
    description: 'Chief Minister\'s flagship healthcare initiative delivering medical screenings and essential drugs directly to citizens\' homes.',
    globalClickCount: 1350,
    districtWiseClicks: { 'Chennai': 290, 'Coimbatore': 260, 'Madurai': 190 },
    currentStatus: { indicator: 'UP', downVotesCount: 0 },
    guidelines: {
      en: [
        'Focuses on door-to-door screenings for non-communicable diseases like Hypertension and Diabetes.',
        'Delivers necessary life-saving medicines directly to citizens\' doorsteps free of cost.',
        'Covers citizens aged 45 and above, and those with restricted mobility.',
        'Field workers and nurses perform diagnostic tests and record status dynamically.'
      ],
      ta: [
        'இரத்த அழுத்தம், சர்க்கரை நோய் போன்ற தொற்றாத நோய்களுக்கான வீட்டு வாசலில் பரிசோதனைகளில் கவனம் செலுத்துகிறது.',
        'தேவையான அத்தியாவசிய மருந்துகளை நேரடியாக மக்களின் வீடுகளுக்கே இலவசமாக விநியோகிக்கிறது.',
        '45 வயது மற்றும் அதற்கு மேற்பட்டவர்கள், மற்றும் உடல்நலம் பாதிக்கப்பட்டவர்களை உள்ளடக்கியது.',
        'சுகாதாரப் பணியாளர்கள் மற்றும் செவிலியர்கள் பரிசோதனைகளை மேற்கொண்டு விவரங்களைப் பதிவு செய்வர்.'
      ],
      hi: [
        'उच्च रक्तचाप और मधुमेह जैसी गैर-संचारी बीमारियों के लिए घर-घर जाकर जांच करने पर ध्यान केंद्रित करता है।',
        'नागरिकों के घरों पर मुफ्त में आवश्यक जीवन रक्षक दवाएं वितरित की जाती हैं।',
        '45 वर्ष और उससे अधिक आयु के नागरिकों तथा कम गतिशीलता वाले लोगों के लिए लागू।',
        'स्वास्थ्य कार्यकर्ता और नर्सें नैदानिक परीक्षण करते हैं और स्थिति दर्ज करते हैं।'
      ]
    }
  },
  {
    serviceName: 'Illam Thedi Kalvi — Education at Doorsteps',
    category: 'Education & Scholarships',
    officialUrl: 'https://illamthedikalvi.tn.gov.in',
    description: 'Volunteer-led local after-school learning program helping primary and middle school students in Tamil Nadu.',
    globalClickCount: 1150,
    districtWiseClicks: { 'Chennai': 180, 'Coimbatore': 150, 'Salem': 120 },
    currentStatus: { indicator: 'UP', downVotesCount: 0 },
    guidelines: {
      en: [
        'Designed for school children from Class 1 to 8 to bridge learning gaps.',
        'Conducted by registered local volunteers in community spaces in the evenings.',
        'Absolutely free of cost for all students in government and municipal schools.',
        'Parents can register their children directly through the volunteer app or portal.'
      ],
      ta: [
        'கற்றல் இடைவெளிகளைக் குறைக்க 1 முதல் 8 ஆம் வகுப்பு வரையிலான பள்ளி குழந்தைகளுக்கு வடிவமைக்கப்பட்டுள்ளது.',
        'பதிவுசெய்யப்பட்ட உள்ளூர் தன்னார்வலர்களால் மாலை நேரங்களில் பொது இடங்களில் நடத்தப்படுகிறது.',
        'அரசு மற்றும் நகராட்சிப் பள்ளிகளில் படிக்கும் அனைத்து மாணவர்களுக்கும் முற்றிலும் இலவசம்.',
        'பெற்றோர்கள் தங்கள் குழந்தைகளை தன்னார்வலர் செயலி அல்லது இணையதளம் மூலம் நேரடியாகப் பதிவு செய்யலாம்.'
      ],
      hi: [
        'कक्षा 1 से 8 तक के स्कूल बच्चों के सीखने के अंतराल को कम करने के लिए डिज़ाइन किया गया।',
        'पंजीकृत स्थानीय स्वयंसेवकों द्वारा शाम को सामुदायिक स्थानों पर संचालित किया जाता है।',
        'सरकारी और नगरपालिका स्कूलों के सभी छात्रों के लिए बिल्कुल मुफ्त।',
        'अभिभावक स्वयंसेवक ऐप या पोर्टल के माध्यम से अपने बच्चों का पंजीकरण कर सकते हैं।'
      ]
    }
  },
  {
    serviceName: 'Kalaignar Kanavu Illam — Rural Concrete Housing Scheme',
    category: 'Housing & Infrastructure',
    officialUrl: 'https://www.tn.gov.in',
    description: 'Financial subsidy assistance scheme for building permanent concrete houses for poor families in rural Tamil Nadu.',
    globalClickCount: 1720,
    districtWiseClicks: { 'Chennai': 240, 'Coimbatore': 210, 'Tiruppur': 180 },
    currentStatus: { indicator: 'UP', downVotesCount: 0 },
    guidelines: {
      en: [
        'Aims to construct concrete houses in rural areas to replace hutments.',
        'Provides a state financial subsidy grant of ₹3.5 Lakhs per house.',
        'Beneficiary must own the building site and be classified as a rural poor household.',
        'Funds are released in installments linked to construction stages.'
      ],
      ta: [
        'கிராமப்புறங்களில் குடிசை வீடுகளுக்குப் பதிலாக கான்கிரீட் வீடுகளைக் கட்டுவதை நோக்கமாகக் கொண்டுள்ளது.',
        'ஒரு வீட்டிற்கு ₹3.5 லட்சம் வரையிலான மாநில நிதி மானியம் வழங்கப்படுகிறது.',
        'விண்ணப்பதாரர் சொந்தமாக மனை நிலம் வைத்திருக்க வேண்டும் மற்றும் கிராமப்புற ஏழைக் குடும்பமாக இருக்க வேண்டும்.',
        'கட்டுமான நிலைகளின் அடிப்படையில் தவணை முறையில் நிதியுதவி வெளியிடப்படும்.'
      ],
      hi: [
        'ग्रामीण क्षेत्रों में झोपड़ियों के स्थान पर पक्के कंक्रीट के मकान बनाने का उद्देश्य।',
        'प्रति घर ₹3.5 लाख की राज्य वित्तीय सब्सिडी अनुदान प्रदान करता है।',
        'लाभार्थी के पास स्वयं का भूखंड होना चाहिए और वह ग्रामीण गरीब परिवार होना चाहिए।',
        'निर्माण चरणों के अनुसार किस्तों में धनराशि जारी की जाती है।'
      ]
    }
  },
  {
    serviceName: 'Mudhalvarin Mugavari — CM Helpline & Grievance Redressal',
    category: 'Social Welfare',
    officialUrl: 'https://gdp.tn.gov.in',
    description: 'Chief Minister\'s official unified portal for public grievance registration and feedback tracking in Tamil Nadu.',
    globalClickCount: 1480,
    districtWiseClicks: { 'Chennai': 340, 'Coimbatore': 290, 'Madurai': 210 },
    currentStatus: { indicator: 'UP', downVotesCount: 0 },
    guidelines: {
      en: [
        'Register using your mobile number and email to create a persistent petitioner account.',
        'Submit detailed grievance petitions to relevant government departments directly online.',
        'Upload supporting documents (PDF/JPEG up to 2MB) validating your grievance query.',
        'Track grievance processing status, target officer assignment, and dynamic updates online.'
      ],
      ta: [
        'பெட்டிஷனர் கணக்கை உருவாக்க உங்கள் கைபேசி எண் மற்றும் மின்னஞ்சல் கொண்டு பதிவு செய்யவும்.',
        'உங்களது கோரிக்கை மனுக்களை நேரடியாக சம்பந்தப்பட்ட அரசு துறைகளுக்கு இணையவழியில் சமர்ப்பிக்கலாம்.',
        'புகாருக்கு ஆதாரமான கோப்புகளை (PDF/JPEG 2MB வரை) இணையதளத்தில் பதிவேற்றலாம்.',
        'உங்கள் மனு மீதான நடவடிக்கை, பொறுப்பு அதிகாரி நியமனம் மற்றும் இறுதி முடிவுகளை ஆன்லைனில் கண்காணிக்கலாம்.'
      ],
      hi: [
        'एक स्थायी याचिकाकर्ता खाता बनाने के लिए अपने मोबाइल नंबर और ईमेल का उपयोग करके पंजीकरण करें।',
        'संबंधित सरकारी विभागों को सीधे ऑनलाइन विस्तृत शिकायत याचिकाएं प्रस्तुत करें।',
        'अपनी शिकायत को सत्यापित करने वाले सहायक दस्तावेज़ (2MB तक पीडीएफ/जेपीईजी) अपलोड करें।',
        'शिकायत प्रसंस्करण स्थिति, अधिकारी असाइनमेंट और नवीनतम अपडेट को ऑनलाइन ट्रैक करें।'
      ]
    }
  },
  {
    serviceName: 'IFHRMS — TN Pensioners Portal',
    category: 'Employment & Pensions',
    officialUrl: 'https://karuvoolam.tn.gov.in',
    description: 'Integrated Financial and Human Resources Management System portal for government pensioners to view and download slips.',
    globalClickCount: 1190,
    districtWiseClicks: { 'Chennai': 250, 'Coimbatore': 230, 'Salem': 170 },
    currentStatus: { indicator: 'UP', downVotesCount: 0 },
    guidelines: {
      en: [
        'Log in with your Pensioner ID / Employee ID and password issued by the treasury office.',
        'View and download monthly pension slips, annual pension statements, and tax sheets.',
        'Submit digital life certificates or physical certificate verification status online.',
        'Update personal bank details, nominee changes, or contact information securely.'
      ],
      ta: [
        'கருவூல அலுவலகம் வழங்கிய ஓய்வூதியதாரர் ஐடி (Pensioner ID) மற்றும் கடவுச்சொல் கொண்டு உள்நுழையவும்.',
        'மாதாந்திர ஓய்வூதியச் சீட்டுகள் (pension slips) மற்றும் ஆண்டு ஓய்வூதிய அறிக்கைகளை பதிவிறக்கலாம்.',
        'டிஜிட்டல் ஆயுள் சான்றிதழ் அல்லது நேரடி சரிபார்ப்பு விவரங்களை இணையவழியில் சமர்ப்பிக்கவும்.',
        'வங்கி கணக்கு விவரங்கள், வாரிசு நியமனம் அல்லது தொடர்புத் தகவலைப் பாதுகாப்பாக மாற்றியமைக்கலாம்.'
      ],
      hi: [
        'ट्रेजरी कार्यालय द्वारा जारी अपने पेंशनभोगी आईडी और पासवर्ड के साथ लॉग इन करें।',
        'मासिक पेंशन पर्ची, वार्षिक पेंशन विवरण और कर पत्रक देखें और डाउनलोड करें।',
        'डिजिटल जीवन प्रमाण पत्र या भौतिक सत्यापन स्थिति ऑनलाइन जमा करें।',
        'व्यक्तिगत बैंक विवरण, नामांकित व्यक्ति परिवर्तन या संपर्क जानकारी सुरक्षित रूप से अपडेट करें।'
      ]
    }
  },
  {
    serviceName: 'PMRY — Pradhan Mantri Rozgar Yojana Loan Scheme',
    category: 'Employment & Pensions',
    officialUrl: 'https://www.msme.gov.in',
    description: 'Central subsidy scheme providing self-employment business loans to educated unemployed youth.',
    globalClickCount: 1260,
    districtWiseClicks: { 'Chennai': 190, 'Coimbatore': 180, 'Trichy': 140 },
    currentStatus: { indicator: 'UP', downVotesCount: 0 },
    guidelines: {
      en: [
        'Open to educated unemployed youth aged 18 to 35 years (relaxed for SC/ST/Women).',
        'Minimum educational qualification is Class 8 pass certificate.',
        'Family income should not exceed ₹24,000 per annum to qualify for low-interest loans.',
        'Provides financial subsidy up to 15% of project cost for setting up small businesses.'
      ],
      ta: [
        '18 முதல் 35 வயதுடைய படித்த வேலைவாய்ப்பற்ற இளைஞர்கள் விண்ணப்பிக்கலாம் (SC/ST/பெண்களுக்கு தளர்வு உண்டு).',
        'குறைந்தபட்ச கல்வித் தகுதியாக எட்டாம் வகுப்பு தேர்ச்சி பெற்றிருக்க வேண்டும்.',
        'ஆண்டு குடும்ப வருமானம் ₹24,000க்கு மிகாமல் இருக்க வேண்டும்.',
        'சிறு தொழில் தொடங்க திட்ட மதிப்பீட்டில் 15% வரை அரசு மானியத்துடன் கூடிய நிதியுதவி வழங்குகிறது.'
      ],
      hi: [
        '18 से 35 वर्ष की आयु के शिक्षित बेरोजगार युवाओं के लिए खुला (एससी/एसटी/महिलाओं के लिए छूट)।',
        'न्यूनतम शैक्षणिक योग्यता कक्षा 8 उत्तीर्ण प्रमाण पत्र है।',
        'कम ब्याज वाले ऋण के लिए पारिवारिक आय प्रति वर्ष ₹24,000 से अधिक नहीं होनी चाहिए।',
        'छोटे व्यवसाय स्थापित करने के लिए परियोजना लागत का 15% तक वित्तीय सब्सिडी प्रदान करता है।'
      ]
    }
  },
  {
    serviceName: 'TN Employment Portal — Velaivaaippu Registration',
    category: 'Employment & Pensions',
    officialUrl: 'https://tnvelaivaaippu.gov.in',
    description: 'Official online state employment exchange portal for registration, renewal, and job postings in Tamil Nadu.',
    globalClickCount: 1590,
    districtWiseClicks: { 'Chennai': 390, 'Coimbatore': 320, 'Vellore': 210 },
    currentStatus: { indicator: 'UP', downVotesCount: 0 },
    guidelines: {
      en: [
        'Register your educational profiles online using valid school/college transfer certificates.',
        'Log in to renew your employment registration card every 3 years to maintain state seniority.',
        'Add newly acquired qualifications or certifications dynamically to your profile.',
        'View government recruitment notifications and private sector job fair updates.'
      ],
      ta: [
        'பள்ளி/கல்லூரி மாற்றுச் சான்றிதழ் விவரங்களைச் சமர்ப்பித்து வேலைவாய்ப்புப் பதிவை மேற்கொள்ளவும்.',
        'முதுநிலையைத் தக்கவைக்க 3 ஆண்டுகளுக்கு ஒருமுறை வேலைவாய்ப்புப் பதிவு அட்டையைப் புதுப்பிக்கவும்.',
        'கூடுதலாகப் பெற்ற புதிய தகுதிகள் அல்லது பட்டங்களை உங்கள் சுயவிவரத்தில் சேர்க்கலாம்.',
        'அரசு வேலைவாய்ப்பு அறிவிப்புகள் மற்றும் தனியார் வேலைவாய்ப்பு முகாம் விவரங்களைப் பெறலாம்.'
      ],
      hi: [
        'वैध स्कूल/कॉलेज ट्रांसफर सर्टिफिकेट का उपयोग करके अपनी शैक्षणिक प्रोफाइल ऑनलाइन पंजीकृत करें।',
        'राज्य वरिष्ठता बनाए रखने के लिए हर 3 साल में अपने रोजगार पंजीकरण कार्ड को नवीनीकृत करें।',
        'अपनी प्रोफाइल में गतिशील रूप से नई प्राप्त योग्यताएं या प्रमाणपत्र जोड़ें।',
        'सरकारी भर्ती सूचनाएं और निजी क्षेत्र के जॉब फेयर अपडेट देखें।'
      ]
    }
  },
  {
    serviceName: 'National Youth Parliament Scheme (NYPS)',
    category: 'Education & Scholarships',
    officialUrl: 'https://nyps.mpa.gov.in',
    description: 'Central Ministry initiative fostering democratic ideals and debating skills among school and college students.',
    globalClickCount: 1040,
    districtWiseClicks: { 'Delhi': 240, 'Coimbatore': 110, 'Kolkata': 90 },
    currentStatus: { indicator: 'UP', downVotesCount: 0 },
    guidelines: {
      en: [
        'Participate through registered schools or colleges affiliated with the ministry.',
        'Provides digital training resources, mock parliament sessions, and debate layouts.',
        'Students get recognized participation certificates signed by ministry representatives.',
        'Access national-level debate competitions and legislative simulation programs.'
      ],
      ta: [
        'மத்திய அமைச்சகத்துடன் பதிவுசெய்யப்பட்ட பள்ளிகள் அல்லது கல்லூரிகள் மூலம் பங்கேற்கவும்.',
        'நாடாளுமன்ற மாதிரி அமர்வுகள், விவாத பயிற்சிகள் மற்றும் பயிற்சி பொருட்கள் வழங்கப்படும்.',
        'பங்கேற்கும் மாணவர்களுக்கு அமைச்சகத்தால் சான்றளிக்கப்பட்ட டிஜிட்டல் சான்றிதழ்கள் வழங்கப்படும்.',
        'தேசிய அளவிலான விவாதப் போட்டிகள் மற்றும் நாடாளுமன்ற உருவகப்படுத்துதலில் பங்கேற்கலாம்.'
      ],
      hi: [
        'मंत्रालय से संबद्ध पंजीकृत स्कूलों या कॉलेजों के माध्यम से भाग लें।',
        'डिजिटल प्रशिक्षण संसाधन, मॉक संसद सत्र और वाद-विवाद प्रारूप प्रदान करता है।',
        'छात्रों को मंत्रालय के प्रतिनिधियों द्वारा हस्ताक्षरित भागीदारी प्रमाण पत्र प्राप्त होता है।',
        'राष्ट्रीय स्तर की वाद-विवाद प्रतियोगिताओं और विधायी सिमुलेशन कार्यक्रमों में भाग लें।'
      ]
    }
  },
  {
    serviceName: 'e-Pathshala — NCERT Digital Textbooks',
    category: 'Education & Scholarships',
    officialUrl: 'https://epathshala.nic.in',
    description: 'Official digital learning repository by NCERT providing free access to school textbooks and educational resources.',
    globalClickCount: 1320,
    districtWiseClicks: { 'Delhi': 310, 'Coimbatore': 190, 'Mumbai': 160 },
    currentStatus: { indicator: 'UP', downVotesCount: 0 },
    guidelines: {
      en: [
        'Access free digitized NCERT school textbooks from Class 1 to 12 in multiple languages.',
        'Read flipbooks, download chapter PDFs, or access educational audio/video content.',
        'No login required for general student textbook access or offline content reading.',
        'Available via web portal or dedicated mobile applications for learning on the go.'
      ],
      ta: [
        'ஒன்றாம் வகுப்பு முதல் 12 ஆம் வகுப்பு வரையிலான NCERT பள்ளிப் பாடப்புத்தகங்களை இலவசமாகப் பெறலாம்.',
        'ஃபிளிப்புக்ஸ், பாடம் வாரியான PDF கோப்புகள் மற்றும் கல்வி ஆடியோ/வீடியோக்களை அணுகலாம்.',
        'பாடப்புத்தகங்கள் மற்றும் பதிவிறக்கம் செய்ய பொதுவான மாணவர்களுக்கு லாகின் தேவையில்லை.',
        'இணையதளம் அல்லது மொபைல் செயலி மூலம் எங்கு வேண்டுமானாலும் பாடங்களைப் படிக்கலாம்.'
      ],
      hi: [
        'कक्षा 1 से 12 तक की मुफ्त डिजिटल एनसीईआरटी स्कूल पाठ्यपुस्तकों को कई भाषाओं में प्राप्त करें।',
        'फ्लिपबुक पढ़ें, अध्यायवार पीडीएफ डाउनलोड करें, या शैक्षणिक ऑडियो/वीडियो सामग्री देखें।',
        'सामान्य छात्र पाठ्यपुस्तक पहुंच या ऑफ़लाइन पढ़ने के लिए किसी लॉगिन की आवश्यकता नहीं है।',
        'वेब पोर्टल या समर्पित मोबाइल ऐप के माध्यम से सीखने के लिए उपलब्ध।'
      ]
    }
  },
  {
    serviceName: 'PM Vishwakarma Scheme — Artisan Support Initiative',
    category: 'Employment & Pensions',
    officialUrl: 'https://pmvishwakarma.gov.in',
    description: 'Central incentive scheme offering skill certification, toolkits, and collateral-free business credit to traditional artisans.',
    globalClickCount: 1710,
    districtWiseClicks: { 'Chennai': 280, 'Coimbatore': 250, 'Salem': 190 },
    currentStatus: { indicator: 'UP', downVotesCount: 0 },
    guidelines: {
      en: [
        'Open to traditional craftspeople and artisans engaged in 18 specified manual trades.',
        'Provides formal PM Vishwakarma certification, skill assessment, and basic training.',
        'Artisans receive a toolkit incentive of ₹15,000 to upgrade their trade tools.',
        'Access collateral-free enterprise development loans up to ₹3 Lakhs at 5% interest.'
      ],
      ta: [
        'குறிப்பிடப்பட்ட 18 பாரம்பரிய கைவினைத் தொழில்களில் ஈடுபடும் கலைஞர்கள் விண்ணப்பிக்கலாம்.',
        'அதிகாரப்பூர்வ கைவினைஞர் சான்றிதழ், திறன் மதிப்பீடு மற்றும் அடிப்படைப் பயிற்சிகள் வழங்கப்படும்.',
        'கைவினை உபகரணங்களை மேம்படுத்த ₹15,000 மதிப்பிலான கருவித்தொகுப்பு ஊக்கத்தொகை வழங்கப்படுகிறது.',
        'சிறு தொழில் கடனாக ₹3 லட்சம் வரை 5% வட்டி விகிதத்தில் பிணையின்றி பெறலாம்.'
      ],
      hi: [
        'निर्दिष्ट 18 पारंपरिक हस्तशिल्प व्यवसायों में लगे पारंपरिक कारीगरों के लिए खुला।',
        'औपचारिक पीएम विश्वकर्मा प्रमाणन, कौशल मूल्यांकन और बुनियादी प्रशिक्षण प्रदान करता है।',
        'कारीगरों को उनके व्यापारिक उपकरणों को उन्नत करने के लिए ₹15,000 का टूलकिट प्रोत्साहन मिलता है।',
        '5% ब्याज पर ₹3 लाख तक का संपार्श्विक-मुक्त उद्यम विकास ऋण प्राप्त करें।'
      ]
    }
  },
  // ── Identity & Documents ──────────────────────────────────────────
  {
    serviceName: 'DigiLocker — National Digital Document Wallet',
    category: 'Identity & Documents',
    officialUrl: 'https://digilocker.gov.in',
    description: 'Access, store, and share government-issued documents digitally. No physical copies needed.',
    globalClickCount: 2840,
    districtWiseClicks: { 'Delhi': 420, 'Mumbai': 310, 'Bengaluru': 280, 'Coimbatore': 450 },
    currentStatus: { indicator: 'UP', downVotesCount: 0 },
    guidelines: {
      en: [
        'Register on DigiLocker using your Aadhaar card number and linked mobile OTP.',
        'Access the "Issued Documents" tab to fetch verifiable documents from standard departments (e.g. CBSE, Income Tax).',
        'You can also upload personal documents in the "Drive" section (up to 1GB storage).',
        'Do not upload password-protected PDFs to your drive to ensure smooth viewing.'
      ],
      ta: [
        'உங்கள் ஆதார் எண் மற்றும் பதிவு செய்யப்பட்ட மொபைல் எண்ணிற்கு வரும் OTP ஐப் பயன்படுத்தி DigiLocker இல் பதிவு செய்யவும்.',
        'CBSE, வருமான வரித்துறை போன்ற துறைகளில் இருந்து உங்கள் அதிகாரப்பூர்வ ஆவணங்களைப் பெற "Issued Documents" பிரிவைப் பயன்படுத்தவும்.',
        'உங்களது தனிப்பட்ட ஆவணங்களை "Drive" பிரிவில் பதிவேற்றலாம் (1GB வரை சேமிக்கலாம்).',
        'தடையற்ற பார்வைக்கு, பாஸ்வேர்ட் போடப்பட்ட PDF கோப்புகளை பதிவேற்ற வேண்டாம்.'
      ],
      hi: [
        'अपने आधार कार्ड नंबर और लिंक किए गए मोबाइल ओटीपी का उपयोग करके डिजिलॉकर पर पंजीकरण करें।',
        'सीबीएसई, आयकर जैसे सरकारी विभागों से सत्यापित दस्तावेज प्राप्त करने के लिए "Issued Documents" टैब पर जाएं।',
        'आप "Drive" अनुभाग में अपने व्यक्तिगत दस्तावेज़ भी अपलोड कर सकते हैं (1GB तक)।',
        'सुचारू रूप से देखने के लिए अपने ड्राइव पर पासवर्ड-सुरक्षित पीडीएफ अपलोड न करें।'
      ]
    },
  },
  {
    serviceName: 'e-Aadhaar — Download Aadhaar Online (UIDAI)',
    category: 'Identity & Documents',
    officialUrl: 'https://myaadhaar.uidai.gov.in',
    description: 'Download your official password-protected e-Aadhaar card online using your Aadhaar number or Enrollment ID.',
    globalClickCount: 1950,
    districtWiseClicks: { 'Delhi': 310, 'Chennai': 240, 'Hyderabad': 200, 'Coimbatore': 520 },
    currentStatus: { indicator: 'UP', downVotesCount: 0 },
    videoUrl: 'https://youtu.be/oNFAbvzfsNQ',
    guidelines: {
      en: [
        'Verify that your mobile number is linked to Aadhaar to receive the 6-digit verification OTP.',
        'Enter your 12-digit Aadhaar Number, 28-digit Enrollment ID (EID), or 16-digit Virtual ID (VID).',
        'Choose if you want a masked Aadhaar (hides first 8 digits) or regular e-Aadhaar.',
        'The downloaded PDF is password-protected. The password is: first 4 letters of your name in CAPITAL + birth year (e.g. KART1998).'
      ],
      ta: [
        '6 இலக்க சரிபார்ப்பு OTP ஐப் பெற உங்கள் மொபைல் எண் ஆதாருடன் இணைக்கப்பட்டுள்ளதா என்பதை உறுதிப்படுத்தவும்.',
        'உங்கள் 12 இலக்க ஆதார் எண், 28 இலக்க பதிவு ஐடி (EID) அல்லது 16 இலக்க மெய்நிகர் ஐடி (VID) ஐ உள்ளிடவும்.',
        'நீங்கள் முகமூடி அணிந்த ஆதார் (முதல் 8 எண்களை மறைக்கும்) அல்லது சாதாரண இ-ஆதார் வேண்டுமா என்பதைத் தேர்ந்தெடுக்கவும்.',
        'பதிவிறக்கம் செய்யப்பட்ட PDF பாஸ்வேர்ட் மூலம் பாதுகாக்கப்படுகிறது. பாஸ்வேர்ட்: உங்கள் பெயரின் முதல் 4 எழுத்துக்கள் கேப்பிட்டல் எழுத்தில் + பிறந்த வருடம் (எ.கா. KART1998).'
      ],
      hi: [
        '6-अंकीय सत्यापन ओटीपी प्राप्त करने के लिए सत्यापित करें कि आपका मोबाइल नंबर आधार से लिंक है।',
        'अपना 12-अंकीय आधार नंबर, 28-अंकीय नामांकन आईडी (EID), या 16-अंकीय वर्चुअल आईडी (VID) दर्ज करें।',
        'चुनें कि क्या आप मास्क वाला आधार (पहले 8 अंक छुपाता है) या नियमित ई-आधार डाउनलोड करना चाहते हैं।',
        'डाउनलोड की गई पीडीएफ पासवर्ड-सुरक्षित है। पासवर्ड है: आपके नाम के पहले 4 अक्षर कैपिटल में + जन्म वर्ष (जैसे KART1998)।'
      ]
    },
  },
  {
    serviceName: 'TN e-Sevai Portal — Tamil Nadu Citizen Services (TNeGA)',
    category: 'Identity & Documents',
    officialUrl: 'https://www.tnesevai.tn.gov.in',
    description: 'Apply for and download official e-certificates (Community, Income, Nativity, First Graduate) issued by the Government of Tamil Nadu.',
    globalClickCount: 1890,
    districtWiseClicks: { 'Chennai': 580, 'Coimbatore': 420, 'Madurai': 310 },
    currentStatus: { indicator: 'UP', downVotesCount: 0 },
    guidelines: {
      en: [
        'Click on "Citizen Login" and register by providing name, mobile number, and creating credentials.',
        'To apply for any certificate, you first need a valid CAN (Citizen Access Number) registration.',
        'Fill in the application details, upload required supporting documents (Aadhaar, photos, signature), and pay the minor fee online.',
        'Once processed, track status and download the digitally signed certificate directly from the dashboard.'
      ],
      ta: [
        '"Citizen Login" என்பதை கிளிக் செய்து பெயர், மொபைல் எண் வழங்கி உங்கள் கணக்கை உருவாக்கவும்.',
        'எந்தவொரு சான்றிதழுக்கும் விண்ணப்பிக்க, முதலில் உங்களுக்கு சரியான CAN (குடிமகன் அணுகல் எண்) பதிவு தேவை.',
        'விண்ணப்ப விவரங்களை நிரப்பவும், தேவையான ஆவணங்களை (ஆதார், புகைப்படம், கையொப்பம்) பதிவேற்றவும், ஆன்லைனில் கட்டணத்தை செலுத்தவும்.',
        'விண்ணப்பம் அங்கீகரிக்கப்பட்டதும், உங்கள் இ-சான்றிதழை நேரடியாக டேஷ்போர்டிலிருந்து பதிவிறக்கம் செய்யலாம்.'
      ],
      hi: [
        '"Citizen Login" पर क्लिक करें और नाम, मोबाइल नंबर देकर अपना खाता पंजीकृत करें।',
        'किसी भी प्रमाणपत्र के लिए आवेदन करने के लिए, आपको पहले एक वैध CAN (नागरिक पहुंच संख्या) पंजीकरण की आवश्यकता होगी।',
        'आवेदन विवरण भरें, आवश्यक सहायक दस्तावेज (आधार, फोटो, हस्ताक्षर) अपलोड करें और शुल्क का भुगतान ऑनलाइन करें।',
        'प्रसंस्करण के बाद, स्थिति को ट्रैक करें और सीधे डैशबोर्ड से डिजिटल रूप से हस्ताक्षरित प्रमाणपत्र डाउनलोड करें।'
      ]
    },
  },
  {
    serviceName: 'TN e-District — Official e-Certificate Download & Verification',
    category: 'Identity & Documents',
    officialUrl: 'https://tnedistrict.tn.gov.in/tneda/',
    description: 'Verify and download e-certificates issued by the Tamil Nadu Revenue Department using the Certificate Number.',
    globalClickCount: 1450,
    districtWiseClicks: { 'Chennai': 410, 'Coimbatore': 380, 'Salem': 290 },
    currentStatus: { indicator: 'UP', downVotesCount: 0 },
    guidelines: {
      en: [
        'Access the portal and locate the "Verify Certificate" section on the right side.',
        'Input the unique Certificate Number (typically formatted like TN-XXXXXXXXXXXX).',
        'Input the security captcha displayed on the screen and click "Submit".',
        'If authentic, the verified certificate details will display. Click "Download Certificate" to save the official copy.'
      ],
      ta: [
        'மின்-மாவட்ட போர்ட்டலை அணுகி, வலது பக்கத்தில் உள்ள "Verify Certificate" பிரிவைக் கண்டறியவும்.',
        'தனித்துவமான சான்றிதழ் எண்ணை உள்ளிடவும் (பொதுவாக TN-XXXXXXXXXXXX போன்ற வடிவம்).',
        'திரையில் காட்டப்படும் கேப்ட்சா குறியீட்டை உள்ளிட்டு "Submit" என்பதை கிளிக் செய்யவும்.',
        'சான்றிதழ் உண்மையானது எனில், விவரங்கள் தோன்றும். சான்றிதழைச் சேமிக்க "Download Certificate" என்பதை கிளிக் செய்யவும்.'
      ],
      hi: [
        'पोर्टल पर जाएं और दाईं ओर "Verify Certificate" अनुभाग ढूंढें।',
        'अद्वितीय प्रमाणपत्र संख्या दर्ज करें (आमतौर पर TN-XXXXXXXXXXXX की तरह स्वरूपित)।',
        'स्क्रीन पर प्रदर्शित सुरक्षा कैप्चा दर्ज करें और "Submit" पर क्लिक करें।',
        'यदि प्रामाणिक है, तो सत्यापित प्रमाणपत्र विवरण प्रदर्शित होगा। आधिकारिक प्रति सहेजने के लिए "Download Certificate" पर क्लिक करें।'
      ]
    },
  },
  {
    serviceName: 'Passport Seva — Online Passport Application',
    category: 'Identity & Documents',
    officialUrl: 'https://www.passportindia.gov.in',
    description: 'Apply for new passport, renewal, police clearance certificate. Book appointments at PSK.',
    globalClickCount: 2210,
    districtWiseClicks: { 'Delhi': 390, 'Mumbai': 320, 'Kolkata': 180 },
    currentStatus: { indicator: 'UP', downVotesCount: 1 },
    guidelines: {
      en: [
        'Create a user account, select your location-specific Passport Office, and fill Form 1.',
        'Check details carefully as changes are not allowed once submitted.',
        'Pay the processing fee online and book an appointment slot at a Passport Seva Kendra (PSK).',
        'Carry your printed receipt, Aadhaar card, proof of birth, and docs to the appointment.'
      ],
      ta: [
        'பயனர் கணக்கை உருவாக்கி, உங்கள் இருப்பிடத்திற்கு அருகிலுள்ள கடவுச்சீட்டு அலுவலகத்தைத் தேர்ந்தெடுத்து, படிவம் 1 ஐ நிரப்பவும்.',
        'விவரங்களைச் சமர்ப்பிக்கும் முன் கவனமாகச் சரிபார்க்கவும், சமர்ப்பித்த பின் மாற்றங்கள் செய்ய முடியாது.',
        'ஆன்லைனில் கட்டணத்தை செலுத்தி, பாஸ்போர்ட் சேவை கேந்திராவில் (PSK) சந்திப்பு நேரத்தை முன்பதிவு செய்யவும்.',
        'சந்திப்பு நாளின் போது அச்சிடப்பட்ட ரசீது, ஆதார் அட்டை, பிறந்த தேதிக்கான சான்று மற்றும் ஆவணங்களை எடுத்துச் செல்லவும்.'
      ],
      hi: [
        'एक उपयोगकर्ता खाता बनाएं, अपने स्थान-विशिष्ट पासपोर्ट कार्यालय का चयन करें और फॉर्म 1 भरें।',
        'विवरण की सावधानीपूर्वक जांच करें क्योंकि एक बार सबमिट करने के बाद बदलाव की अनुमति नहीं है।',
        'ऑनलाइन प्रसंस्करण शुल्क का भुगतान करें और पासपोर्ट सेवा केंद्र (PSK) में अपॉइंटमेंट स्लॉट बुक करें।',
        'अपॉइंटमेंट पर अपनी मुद्रित रसीद, आधार कार्ड, जन्म प्रमाण और दस्तावेज साथ ले जाएं।'
      ]
    },
  },
  {
    serviceName: 'PAN Card Application & Correction — NSDL',
    category: 'Finance & Banking',
    officialUrl: 'https://www.onlineservices.nsdl.com',
    description: 'Apply for a new PAN card or make corrections to existing PAN details online.',
    globalClickCount: 1720,
    districtWiseClicks: { 'Mumbai': 380, 'Delhi': 290, 'Pune': 210 },
    currentStatus: { indicator: 'UP', downVotesCount: 0 },
    guidelines: {
      en: [
        'Select Application Type (New PAN - Form 49A or Correction - Form 49AA).',
        'Fill in the application details and make payment online.',
        'Authenticate details using Aadhaar e-KYC (instant) or mail physical prints to NSDL.',
        'E-PAN will be emailed within 3-5 days; physical card is mailed in 15 days.'
      ],
      ta: [
        'விண்ணப்ப வகையைத் தேர்ந்தெடுக்கவும் (புதிய பான் - படிவம் 49A அல்லது திருத்தம் - படிவம் 49AA).',
        'விண்ணப்ப விவரங்களை நிரப்பி, ஆன்லைனில் கட்டணம் செலுத்தவும்.',
        'ஆதார் e-KYC ஐப் பயன்படுத்தி விவரங்களைச் சரிபார்க்கவும் அல்லது அச்சிடப்பட்ட நகல்களை NSDL அலுவலகத்திற்கு அனுப்பவும்.',
        'ஈ-பான் 3-5 நாட்களுக்குள் மின்னஞ்சல் செய்யப்படும்; பிசிகல் கார்டு 15 நாட்களுக்குள் முகவரிக்கு அனுப்பப்படும்.'
      ],
      hi: [
        'आवेदन प्रकार चुनें (नया पैन - फॉर्म 49A या सुधार - फॉर्म 49AA)।',
        'आवेदन विवरण भरें और ऑनलाइन भुगतान करें।',
        'आधार ई-केवाईसी (तत्काल) का उपयोग करके विवरण प्रमाणित करें या भौतिक दस्तावेज एनएसडीएल को भेजें।',
        'ई-पैन 3-5 दिनों के भीतर ई-मेल किया जाएगा; भौतिक कार्ड 15 दिनों में डाक से भेजा जाएगा।'
      ]
    },
  },
];

// Fallback generator helper to populate other services in seed array easily
const enrichRemainingServices = () => {
  const categories = [
    {
      serviceName: 'National Portal of India',
      category: 'Identity & Documents',
      officialUrl: 'https://www.india.gov.in',
      description: 'The single-point access to information and services provided by various Indian government entities.',
      globalClickCount: 1200,
      districtWiseClicks: { 'Delhi': 400, 'Mumbai': 180, 'Coimbatore': 110 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'Voter Portal (Election Commission of India)',
      category: 'Identity & Documents',
      officialUrl: 'https://voters.eci.gov.in',
      description: 'Register as a new voter, search name in voter list, download digital e-EPIC card.',
      globalClickCount: 1560,
      districtWiseClicks: { 'Delhi': 290, 'Chennai': 230, 'Coimbatore': 140 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'Birth & Death Registration Portal (CRS)',
      category: 'Identity & Documents',
      officialUrl: 'https://crsorgi.gov.in',
      description: 'Official unified portal for registration of birth and death records in Indian states.',
      globalClickCount: 780,
      districtWiseClicks: { 'Lucknow': 90, 'Patna': 80, 'Bhopal': 70 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'Ayushman Bharat — PMJAY Health Scheme',
      category: 'Health & Medical',
      officialUrl: 'https://pmjay.gov.in',
      description: 'Check eligibility, find empanelled hospitals, and access health coverage up to ₹5 lakh per family.',
      globalClickCount: 1870,
      districtWiseClicks: { 'Lucknow': 290, 'Patna': 260, 'Bhopal': 220 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'Cowin — COVID-19 Vaccination Certificate',
      category: 'Health & Medical',
      officialUrl: 'https://www.cowin.gov.in',
      description: 'Download vaccination certificate, check vaccination status, and book appointment.',
      globalClickCount: 1540,
      districtWiseClicks: { 'Delhi': 280, 'Mumbai': 250, 'Hyderabad': 190 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'PM Jan Aushadhi (PMBJP) — Generic Medicines',
      category: 'Health & Medical',
      officialUrl: 'https://janaushadhi.gov.in',
      description: 'Find nearby Jan Aushadhi Kendras, search generic medicine prices and alternatives.',
      globalClickCount: 1100,
      districtWiseClicks: { 'Delhi': 150, 'Pune': 120, 'Coimbatore': 90 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'National Digital Health Mission (ABDM)',
      category: 'Health & Medical',
      officialUrl: 'https://abdm.gov.in',
      description: 'Generate your Ayushman Bharat Health Account (ABHA) number and manage digital health records.',
      globalClickCount: 960,
      districtWiseClicks: { 'Delhi': 200, 'Mumbai': 160, 'Bengaluru': 140 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'UGC — University Grants Commission Portal',
      category: 'Education & Scholarships',
      officialUrl: 'https://www.ugc.gov.in',
      description: 'Access NET results, fellowship details, approved college lists, and UGC regulations.',
      globalClickCount: 980,
      districtWiseClicks: { 'Delhi': 190, 'Bengaluru': 150, 'Pune': 130 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'SWAYAM — Free Online Education Portal',
      category: 'Education & Scholarships',
      officialUrl: 'https://swayam.gov.in',
      description: 'Access free university level courses led by top IIT, IISc, and IIM professors online.',
      globalClickCount: 1450,
      districtWiseClicks: { 'Bengaluru': 340, 'Chennai': 290, 'Coimbatore': 210 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'AICTE — Technical Education Portal',
      category: 'Education & Scholarships',
      officialUrl: 'https://www.aicte-india.org',
      description: 'Check approved institutes, engineering curriculum models, Prime Minister Special Scholarship Scheme (PMSSS).',
      globalClickCount: 880,
      districtWiseClicks: { 'Delhi': 150, 'Pune': 90, 'Coimbatore': 60 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'PM Kisan Samman Nidhi — Status Check',
      category: 'Agriculture & Farming',
      officialUrl: 'https://pmkisan.gov.in',
      description: 'Check PM-KISAN payment status, register as a new beneficiary, and update bank account.',
      globalClickCount: 2090,
      districtWiseClicks: { 'Lucknow': 350, 'Patna': 310, 'Bhopal': 270 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'e-NAM — National Agriculture Market',
      category: 'Agriculture & Farming',
      officialUrl: 'https://www.enam.gov.in',
      description: 'Official unified trading portal for agricultural commodities across Mandis in India.',
      globalClickCount: 1150,
      districtWiseClicks: { 'Jaipur': 180, 'Bhopal': 150, 'Pune': 120 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'Soil Health Card Portal',
      category: 'Agriculture & Farming',
      officialUrl: 'https://www.soilhealth.dac.gov.in',
      description: 'Track soil health status, print test reports, and download crop-wise fertilizer recommendations.',
      globalClickCount: 840,
      districtWiseClicks: { 'Jaipur': 110, 'Bhopal': 90, 'Patna': 70 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      category: 'Agriculture & Farming',
      officialUrl: 'https://pmfby.gov.in',
      description: 'Calculate crop insurance premium, apply for crop insurance policy, and track claim status.',
      globalClickCount: 1420,
      districtWiseClicks: { 'Lucknow': 220, 'Bhopal': 190, 'Jaipur': 170 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'Income Tax e-Filing Portal',
      category: 'Finance & Banking',
      officialUrl: 'https://www.incometax.gov.in',
      description: 'File your Income Tax Return (ITR) online, check refund status, and view tax credits.',
      globalClickCount: 3100,
      districtWiseClicks: { 'Delhi': 510, 'Mumbai': 460, 'Bengaluru': 390 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'GST Portal — Goods and Services Tax Network',
      category: 'Finance & Banking',
      officialUrl: 'https://www.gst.gov.in',
      description: 'Register for GSTIN, file GST monthly returns (GSTR-1, GSTR-3B), and generate e-way bills.',
      globalClickCount: 2650,
      districtWiseClicks: { 'Mumbai': 520, 'Delhi': 440, 'Bengaluru': 320, 'Coimbatore': 290 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'Pradhan Mantri Mudra Yojana (PMMY) Loan',
      category: 'Finance & Banking',
      officialUrl: 'https://www.mudra.org.in',
      description: 'Access Mudra loan schemes (Shishu, Kishor, Tarun) up to ₹10 Lakhs for micro-enterprises.',
      globalClickCount: 1350,
      districtWiseClicks: { 'Delhi': 220, 'Mumbai': 180, 'Coimbatore': 110 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'BHIM UPI — National Payments Portal',
      category: 'Finance & Banking',
      officialUrl: 'https://www.bhimupi.org.in',
      description: 'Official unified payments interface app details, secure transaction limits, and bank lists.',
      globalClickCount: 990,
      districtWiseClicks: { 'Delhi': 180, 'Mumbai': 140, 'Coimbatore': 90 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'BhuNaksha — Land Records & Cadastral Maps',
      category: 'Housing & Infrastructure',
      officialUrl: 'https://bhunaksha.nic.in',
      description: 'View and download cadastral maps, plot details, and land records for your district.',
      globalClickCount: 1120,
      districtWiseClicks: { 'Jaipur': 190, 'Lucknow': 160, 'Bhopal': 140 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'RERA — Real Estate Regulatory Authority',
      category: 'Housing & Infrastructure',
      officialUrl: 'https://rera.gov.in',
      description: 'Search RERA-registered projects and agents, file complaints, and check project status.',
      globalClickCount: 890,
      districtWiseClicks: { 'Mumbai': 180, 'Delhi': 150, 'Pune': 120 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'Pradhan Mantri Awas Yojana (PMAY) Housing',
      category: 'Housing & Infrastructure',
      officialUrl: 'https://pmaymis.gov.in',
      description: 'Check beneficiary lists, apply for credit linked subsidy scheme (CLSS) for affordable housing.',
      globalClickCount: 1550,
      districtWiseClicks: { 'Lucknow': 280, 'Patna': 240, 'Bhopal': 210 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'Swachh Bharat Mission (Grameen) Portal',
      category: 'Housing & Infrastructure',
      officialUrl: 'https://swachhbharatmission.gov.in',
      description: 'Check individual household latrine (IHHL) incentive application status and open defecation reports.',
      globalClickCount: 780,
      districtWiseClicks: { 'Patna': 120, 'Bhopal': 90, 'Jaipur': 80 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'EPFO — Employee Provident Fund Services',
      category: 'Employment & Pensions',
      officialUrl: 'https://www.epfindia.gov.in',
      description: 'Claim EPF, check PF balance, transfer provident fund, and update KYC details.',
      globalClickCount: 2450,
      districtWiseClicks: { 'Mumbai': 410, 'Delhi': 380, 'Hyderabad': 310 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'MSME Udyam Registration Portal',
      category: 'Employment & Pensions',
      officialUrl: 'https://udyamregistration.gov.in',
      description: 'Register your Micro, Small, or Medium Enterprise (MSME) and get Udyam Certificate.',
      globalClickCount: 1090,
      districtWiseClicks: { 'Mumbai': 200, 'Delhi': 180, 'Surat': 150 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'e-Shram — Unorganised Workers Registration',
      category: 'Employment & Pensions',
      officialUrl: 'https://eshram.gov.in',
      description: 'Register as an unorganised worker, get UAN card, and access social security benefits.',
      globalClickCount: 1340,
      districtWiseClicks: { 'Lucknow': 230, 'Patna': 200, 'Kolkata': 180 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'National Career Service (NCS) Portal',
      category: 'Employment & Pensions',
      officialUrl: 'https://www.ncs.gov.in',
      description: 'Search and apply for jobs, find job fairs, and connect with verified private/public recruiters.',
      globalClickCount: 1120,
      districtWiseClicks: { 'Delhi': 190, 'Mumbai': 160, 'Coimbatore': 110 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'PM Shram Yogi Maandhan (PMSYM) Pension',
      category: 'Employment & Pensions',
      officialUrl: 'https://maandhan.in',
      description: 'Voluntary self-contribution pension scheme for unorganised workers. Assured ₹3000/month after age 60.',
      globalClickCount: 920,
      districtWiseClicks: { 'Lucknow': 150, 'Patna': 130, 'Bhopal': 110 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'Sarathi — Driving Licence & Vehicle Services',
      category: 'Transport & Vehicle',
      officialUrl: 'https://sarathi.parivahan.gov.in',
      description: 'Apply for learner licence, driving licence renewal, RC smart card, and international driving permit.',
      globalClickCount: 1680,
      districtWiseClicks: { 'Delhi': 290, 'Mumbai': 250, 'Chennai': 200 },
      currentStatus: { indicator: 'UP', downVotesCount: 2 },
    },
    {
      serviceName: 'Vahan — Vehicle Registration Services',
      category: 'Transport & Vehicle',
      officialUrl: 'https://vahan.parivahan.gov.in',
      description: 'Check vehicle registration details, pay road tax, NOC, transfer ownership, and fitness certificate.',
      globalClickCount: 1430,
      districtWiseClicks: { 'Delhi': 240, 'Mumbai': 210, 'Bengaluru': 190 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'FASTag Portal (IHMCL) — Electronic Toll',
      category: 'Transport & Vehicle',
      officialUrl: 'https://ihmcl.co.in',
      description: 'Buy FASTag online, recharge tag wallets, check balance, and raise dispute claims.',
      globalClickCount: 1100,
      districtWiseClicks: { 'Delhi': 210, 'Mumbai': 180, 'Coimbatore': 150 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'Ujjwala Yojana — LPG Connection for BPL',
      category: 'Social Welfare',
      officialUrl: 'https://pmuy.gov.in',
      description: 'Apply for free LPG connection under PM Ujjwala Yojana for BPL households.',
      globalClickCount: 1260,
      districtWiseClicks: { 'Patna': 220, 'Lucknow': 190, 'Bhopal': 170 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'National Food Security — Ration Card Portal',
      category: 'Social Welfare',
      officialUrl: 'https://nfsa.gov.in',
      description: 'Check ration card status, find fair price shops, and view NFSA entitlements.',
      globalClickCount: 1580,
      districtWiseClicks: { 'Patna': 270, 'Lucknow': 250, 'Bhopal': 220 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'WCD — Anganwadi & ICDS Services',
      category: 'Social Welfare',
      officialUrl: 'https://wcd.nic.in',
      description: 'Access Anganwadi services, ICDS nutritional programs, and child welfare schemes.',
      globalClickCount: 760,
      districtWiseClicks: { 'Patna': 130, 'Bhopal': 110, 'Jaipur': 90 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'DigiLocker Portal — Cloud Document Storage',
      category: 'Identity & Documents',
      officialUrl: 'https://www.digilocker.gov.in',
      description: 'Access authentic digital documents in your digital locker, compliant with IT Act.',
      globalClickCount: 1850,
      districtWiseClicks: { 'Chennai': 340, 'Coimbatore': 290, 'Delhi': 410 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
      videoUrl: 'https://www.youtube.com/watch?v=kYJv8y0-a_Q',
    },
    {
      serviceName: 'PM Kisan Samman Nidhi Portal',
      category: 'Agriculture & Farming',
      officialUrl: 'https://pmkisan.gov.in',
      description: 'Direct income support of ₹6,000 per year in three equal installments to small farmers.',
      globalClickCount: 2150,
      districtWiseClicks: { 'Patna': 380, 'Lucknow': 450, 'Salem': 210 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
      videoUrl: 'https://www.youtube.com/watch?v=F0f5rX7n-3s',
    },
    {
      serviceName: 'National Scholarship Portal (NSP)',
      category: 'Education & Scholarships',
      officialUrl: 'https://scholarships.gov.in',
      description: 'One-stop solution for student application registration, processing, and scholarship disbursement.',
      globalClickCount: 1980,
      districtWiseClicks: { 'Chennai': 410, 'Coimbatore': 320, 'Bengaluru': 280 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
      videoUrl: 'https://www.youtube.com/watch?v=kU_Ua0B1LGs',
    },
    {
      serviceName: 'National Pension Scheme (NPS) — NSDL',
      category: 'Employment & Pensions',
      officialUrl: 'https://www.npscra.nsdl.co.in',
      description: 'Contributory pension system designed to enable systematic savings during working life.',
      globalClickCount: 1420,
      districtWiseClicks: { 'Mumbai': 320, 'Delhi': 290, 'Chennai': 180 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
      videoUrl: 'https://www.youtube.com/watch?v=Z5gC-C3g7_g',
    },
    {
      serviceName: 'Centralized Public Grievance Redress System (CPGRAMS)',
      category: 'Other',
      officialUrl: 'https://pgportal.gov.in',
      description: 'Register public grievances online regarding Central and State Government departments.',
      globalClickCount: 1100,
      districtWiseClicks: { 'Delhi': 280, 'Chennai': 120, 'Coimbatore': 90 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
      videoUrl: 'https://www.youtube.com/watch?v=38e3s98yDco',
    },
    {
      serviceName: 'Pradhan Mantri Awas Yojana — Urban (PMAY-U)',
      category: 'Housing & Infrastructure',
      officialUrl: 'https://pmay-urban.gov.in',
      description: 'Housing for All mission by Government of India providing affordable houses to urban poor.',
      globalClickCount: 1250,
      districtWiseClicks: { 'Mumbai': 180, 'Chennai': 150, 'Patna': 110 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'Pradhan Mantri Awas Yojana — Gramin (PMAY-G)',
      category: 'Housing & Infrastructure',
      officialUrl: 'https://pmayg.nic.in',
      description: 'Social welfare program providing affordable housing to rural EWS/LIG families.',
      globalClickCount: 1380,
      districtWiseClicks: { 'Lucknow': 250, 'Patna': 310, 'Salem': 120 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'Integrated Road Accident Database (iRAD)',
      category: 'Transport & Vehicle',
      officialUrl: 'https://irad.parivahan.gov.in',
      description: 'Centralized road accident database and analytics portal for safety improvements.',
      globalClickCount: 820,
      districtWiseClicks: { 'Delhi': 90, 'Chennai': 80, 'Coimbatore': 60 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'Unified Mobile App for New-age Governance (UMANG)',
      category: 'Other',
      officialUrl: 'https://web.umang.gov.in',
      description: 'Access central and state government services from a single unified portal/app.',
      globalClickCount: 1780,
      districtWiseClicks: { 'Delhi': 420, 'Mumbai': 310, 'Chennai': 240 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'National Health Authority (NHA) — PM-JAY',
      category: 'Health & Medical',
      officialUrl: 'https://pmjay.gov.in',
      description: 'Avail cashless healthcare benefits up to ₹5 Lakhs per family per year.',
      globalClickCount: 2240,
      districtWiseClicks: { 'Delhi': 490, 'Patna': 340, 'Chennai': 210 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'Janaushadhi Pariyojana — Affordable Quality Medicines',
      category: 'Health & Medical',
      officialUrl: 'https://janaushadhi.gov.in',
      description: 'Locate generic medicine stores offering quality medicines at highly affordable prices.',
      globalClickCount: 1350,
      districtWiseClicks: { 'Chennai': 180, 'Coimbatore': 140, 'Lucknow': 110 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'Soil Health Card Portal (SHC)',
      category: 'Agriculture & Farming',
      officialUrl: 'https://soilhealth.dac.gov.in',
      description: 'Get structural soil analysis and fertilizer recommendations for agricultural fields.',
      globalClickCount: 940,
      districtWiseClicks: { 'Patna': 120, 'Bhopal': 90, 'Salem': 70 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'PM-USP Scholarship Portal (Ministry of Education)',
      category: 'Education & Scholarships',
      officialUrl: 'https://www.education.gov.in',
      description: 'Central sector scholarship scheme for college and university students.',
      globalClickCount: 1120,
      districtWiseClicks: { 'Chennai': 180, 'Coimbatore': 150, 'Delhi': 110 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'National Portal for Transgender Persons',
      category: 'Identity & Documents',
      officialUrl: 'https://transgender.dosje.gov.in',
      description: 'Apply online for transgender identity certificate and ID cards securely.',
      globalClickCount: 880,
      districtWiseClicks: { 'Delhi': 90, 'Chennai': 80, 'Mumbai': 70 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'TANGEDCO — Online Electricity Bill & Services',
      category: 'Housing & Infrastructure',
      officialUrl: 'https://www.tangedco.org',
      description: 'Official portal to pay Tamil Nadu electricity bills, apply for new power connections, and track status.',
      globalClickCount: 2500,
      districtWiseClicks: { 'Chennai': 850, 'Coimbatore': 620, 'Madurai': 430 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'TN Police e-Services & Complaints',
      category: 'Identity & Documents',
      officialUrl: 'https://eservices.tnpolice.gov.in',
      description: 'Submit online complaints, request character verification, and download official verification certificates.',
      globalClickCount: 1950,
      districtWiseClicks: { 'Chennai': 610, 'Coimbatore': 480, 'Trichy': 310 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
    {
      serviceName: 'CAMS — Citizen Affairs Monitoring System',
      category: 'Social Welfare',
      officialUrl: 'https://www.tn.gov.in',
      description: 'Official system to file state citizen monitoring requests, submit feedback, and view welfare analytics.',
      globalClickCount: 1540,
      districtWiseClicks: { 'Salem': 320, 'Trichy': 280, 'Chennai': 240 },
      currentStatus: { indicator: 'UP', downVotesCount: 0 },
    },
  ];

  categories.forEach((c) => {
    // Populate standard localized guidelines for other services dynamically
    c.guidelines = {
      en: [
        `Visit the official landing link for ${c.serviceName}.`,
        'Register or log in using credentials or active mobile OTP authentication.',
        'Keep necessary documents like Aadhaar Card and photo scans ready before applying.',
        'Submit details and download digitally signed files once processing completes.'
      ],
      ta: [
        `${c.serviceName} இன் அதிகாரப்பூர்வ இணையதளத்தைப் பார்வையிடவும்.`,
        'மொபைல் OTP அல்லது கணக்கு விவரங்களை உள்ளிட்டு உள்நுழையவும்.',
        'விண்ணப்பிக்கும் முன் தேவையான ஆவணங்களை (ஆதார் அட்டை, புகைப்படங்கள்) தயார் நிலையில் வைக்கவும்.',
        'விவரங்களைச் சமர்ப்பித்து, ஒப்புதல் பெற்ற பிறகு கோப்புகளைப் பதிவிறக்கவும்.'
      ],
      hi: [
        `${c.serviceName} के आधिकारिक लिंक पर जाएं।`,
        'मोबाइल ओटीपी या खाता विवरण दर्ज करके लॉगिन करें।',
        'आवेदन करने से पहले आवश्यक दस्तावेज (आधार कार्ड, फोटो) तैयार रखें।',
        'विवरण सबमिट करें और प्रक्रिया पूरी होने के बाद आधिकारिक फाइल डाउनलोड करें।'
      ]
    };
    SEED_SERVICES.push(c);
  });
};

enrichRemainingServices();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅  Connected to MongoDB');

    // Drop existing services to avoid duplicates on re-seed
    const deleted = await GovtService.deleteMany({});
    console.log(`🗑️   Cleared ${deleted.deletedCount} existing service(s)`);

    // Reset click counts programmatically so only original/real user views are shown starting from 0
    SEED_SERVICES.forEach((s) => {
      s.globalClickCount = 0;
      s.districtWiseClicks = {};
    });

    const inserted = await GovtService.insertMany(SEED_SERVICES);
    console.log(`🌱  Seeded ${inserted.length} government services successfully!\n`);

    inserted.slice(0, 10).forEach((s, i) => {
      console.log(`  ${i + 1}. [${s.category}] ${s.serviceName}`);
    });
    console.log(`  ... and ${inserted.length - 10} more portals.`);

    console.log('\n🚀  LocGovt database is ready. Start your server with: npm run dev');
  } catch (err) {
    console.error('❌  Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌  Disconnected from MongoDB');
    process.exit(0);
  }
};

seed();
