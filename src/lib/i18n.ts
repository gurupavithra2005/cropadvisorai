import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      appName: "Smart Crop Advisory",
      tagline: "AI advice for your farm",
      nav: { home: "Home", crops: "Crops", fertilizer: "Fertilizer", pest: "Pest Scan", weather: "Weather", market: "Market" },
      auth: {
        signIn: "Sign In", signUp: "Sign Up", email: "Email", password: "Password", name: "Full name",
        phone: "Phone", continue: "Continue", google: "Continue with Google",
        haveAccount: "Have an account?", noAccount: "New here?",
        welcome: "Welcome, farmer", intro: "Get personalized crop, fertilizer, weather and market advice — in your language.",
      },
      home: {
        hello: "Namaste, {{name}}", today: "Today", quickActions: "Quick actions",
        askAdvisor: "Ask Advisor", recentAlerts: "Recent alerts", noAlerts: "No alerts right now.",
        loadingWeather: "Loading weather…",
      },
      profile: {
        title: "Your Farm", village: "Village", district: "District", state: "State",
        landSize: "Land size (acres)", landType: "Land type", irrigation: "Irrigation",
        language: "Language", save: "Save profile", detectLocation: "Detect my location",
        dry: "Dry land", wet: "Wet land", garden: "Garden land",
        borewell: "Borewell", canal: "Canal", rainfed: "Rainfed", drip: "Drip", sprinkler: "Sprinkler",
      },
      crops: {
        title: "Crop Recommendation", subtitle: "Best crops for your soil & season",
        n: "Nitrogen (N)", p: "Phosphorus (P)", k: "Potassium (K)", ph: "Soil pH",
        season: "Season", kharif: "Kharif (Jun–Oct)", rabi: "Rabi (Nov–Mar)", zaid: "Zaid (Apr–Jun)",
        get: "Get recommendation", saving: "Thinking…", top: "Top crops for you",
      },
      fert: {
        title: "Fertilizer Advisor", subtitle: "Right nutrients, right dose", crop: "Crop planned",
        get: "Get fertilizer plan",
      },
      pest: {
        title: "Pest & Disease Scan", subtitle: "Photograph the affected leaf",
        upload: "Upload photo", capture: "Capture photo", scanning: "Diagnosing…",
        diagnosis: "Diagnosis", severity: "Severity", treatment: "Treatment", history: "Past scans",
      },
      weather: { title: "Weather", forecast: "5-day forecast", alerts: "Alerts" },
      market: {
        title: "Market Prices", add: "Add commodity", commodity: "Commodity", market: "Market",
        min: "Min", max: "Max", modal: "Modal", noneYet: "No commodities tracked yet.",
      },
      chat: { title: "Advisor", placeholder: "Ask about crops, pests, weather…", send: "Send", listening: "Listening…" },
      common: { back: "Back", cancel: "Cancel", loading: "Loading…", error: "Something went wrong.", tryAgain: "Try again", listen: "Listen", speak: "Speak", or: "or" },
    },
  },
  hi: {
    translation: {
      appName: "स्मार्ट फसल सलाहकार",
      tagline: "आपके खेत के लिए एआई सलाह",
      nav: { home: "मुख्य", crops: "फसलें", fertilizer: "खाद", pest: "कीट जाँच", weather: "मौसम", market: "बाज़ार" },
      auth: {
        signIn: "साइन इन", signUp: "पंजीकरण", email: "ईमेल", password: "पासवर्ड", name: "पूरा नाम",
        phone: "फ़ोन", continue: "आगे", google: "Google से जारी रखें",
        haveAccount: "पहले से खाता है?", noAccount: "नए हैं?",
        welcome: "स्वागत है, किसान भाई", intro: "फसल, खाद, मौसम और बाज़ार की सलाह — आपकी भाषा में।",
      },
      home: {
        hello: "नमस्ते, {{name}}", today: "आज", quickActions: "जल्दी उपाय",
        askAdvisor: "सलाहकार से पूछें", recentAlerts: "हाल की चेतावनी", noAlerts: "अभी कोई चेतावनी नहीं।",
        loadingWeather: "मौसम लोड हो रहा है…",
      },
      profile: {
        title: "आपका खेत", village: "गाँव", district: "ज़िला", state: "राज्य",
        landSize: "खेत का आकार (एकड़)", landType: "भूमि प्रकार", irrigation: "सिंचाई",
        language: "भाषा", save: "सहेजें", detectLocation: "स्थान पहचानें",
        dry: "सूखी भूमि", wet: "गीली भूमि", garden: "बागान भूमि",
        borewell: "बोरवेल", canal: "नहर", rainfed: "वर्षा", drip: "ड्रिप", sprinkler: "फव्वारा",
      },
      crops: {
        title: "फसल सुझाव", subtitle: "आपकी मिट्टी व मौसम के लिए बेहतरीन फसलें",
        n: "नाइट्रोजन (N)", p: "फॉस्फोरस (P)", k: "पोटाश (K)", ph: "मिट्टी pH",
        season: "मौसम", kharif: "खरीफ़ (जून–अक्टू)", rabi: "रबी (नव–मार्च)", zaid: "ज़ायद (अप्रैल–जून)",
        get: "सुझाव पाएँ", saving: "सोच रहा है…", top: "आपके लिए बेहतरीन फसलें",
      },
      fert: { title: "खाद सलाहकार", subtitle: "सही पोषण, सही मात्रा", crop: "योजित फसल", get: "खाद योजना पाएँ" },
      pest: {
        title: "कीट व रोग जाँच", subtitle: "प्रभावित पत्ती की तस्वीर लें",
        upload: "फ़ोटो अपलोड", capture: "फ़ोटो लें", scanning: "जाँच हो रही है…",
        diagnosis: "निदान", severity: "गंभीरता", treatment: "उपचार", history: "पुरानी जाँच",
      },
      weather: { title: "मौसम", forecast: "5-दिन का पूर्वानुमान", alerts: "चेतावनी" },
      market: {
        title: "बाज़ार भाव", add: "फसल जोड़ें", commodity: "फसल", market: "मंडी",
        min: "न्यून", max: "अधि", modal: "औसत", noneYet: "अभी कोई फसल नहीं।",
      },
      chat: { title: "सलाहकार", placeholder: "फसल, कीट, मौसम पूछें…", send: "भेजें", listening: "सुन रहा हूँ…" },
      common: { back: "वापस", cancel: "रद्द", loading: "लोड हो रहा है…", error: "कुछ गड़बड़ हुई।", tryAgain: "पुनः प्रयास", listen: "सुनें", speak: "बोलें", or: "या" },
    },
  },
  ta: {
    translation: {
      appName: "ஸ்மார்ட் பயிர் ஆலோசகர்",
      tagline: "உங்கள் விவசாயத்திற்கான AI ஆலோசனை",
      nav: { home: "முகப்பு", crops: "பயிர்கள்", fertilizer: "உரம்", pest: "பூச்சி ஸ்கேன்", weather: "வானிலை", market: "சந்தை" },
      auth: {
        signIn: "உள்நுழை", signUp: "பதிவு செய்", email: "மின்னஞ்சல்", password: "கடவுச்சொல்", name: "முழு பெயர்",
        phone: "தொலைபேசி", continue: "தொடர்க", google: "Google உடன் தொடர்க",
        haveAccount: "ஏற்கனவே கணக்கு உள்ளதா?", noAccount: "புதியவரா?",
        welcome: "வணக்கம், விவசாய நண்பரே", intro: "பயிர், உரம், வானிலை, சந்தை ஆலோசனை — உங்கள் மொழியில்.",
      },
      home: {
        hello: "வணக்கம், {{name}}", today: "இன்று", quickActions: "விரைவு செயல்கள்",
        askAdvisor: "ஆலோசகரிடம் கேளுங்கள்", recentAlerts: "சமீபத்திய எச்சரிக்கை", noAlerts: "தற்போது எச்சரிக்கை இல்லை.",
        loadingWeather: "வானிலை ஏற்றப்படுகிறது…",
      },
      profile: {
        title: "உங்கள் நிலம்", village: "கிராமம்", district: "மாவட்டம்", state: "மாநிலம்",
        landSize: "நில அளவு (ஏக்கர்)", landType: "நில வகை", irrigation: "நீர்ப்பாசனம்",
        language: "மொழி", save: "சேமி", detectLocation: "இடம் கண்டறி",
        dry: "வறட்சி நிலம்", wet: "நன்செய்", garden: "தோட்ட நிலம்",
        borewell: "கிணறு", canal: "கால்வாய்", rainfed: "மழை", drip: "சொட்டு", sprinkler: "தெளிப்பு",
      },
      crops: {
        title: "பயிர் பரிந்துரை", subtitle: "உங்கள் மண் & பருவத்திற்கு சிறந்த பயிர்கள்",
        n: "நைட்ரஜன் (N)", p: "பாஸ்பரஸ் (P)", k: "பொட்டாசியம் (K)", ph: "மண் pH",
        season: "பருவம்", kharif: "காரீஃப் (ஜூன்–அக்)", rabi: "ரபி (நவ–மார்)", zaid: "ஜைத் (ஏப்–ஜூன்)",
        get: "பரிந்துரை பெறு", saving: "சிந்திக்கிறது…", top: "உங்களுக்கான சிறந்த பயிர்கள்",
      },
      fert: { title: "உர ஆலோசகர்", subtitle: "சரியான ஊட்டம், சரியான அளவு", crop: "திட்டமிடப்பட்ட பயிர்", get: "உர திட்டம் பெறு" },
      pest: {
        title: "பூச்சி & நோய் ஸ்கேன்", subtitle: "பாதிக்கப்பட்ட இலையை புகைப்படம் எடுக்கவும்",
        upload: "புகைப்படம் பதிவேற்று", capture: "புகைப்படம் எடு", scanning: "பரிசோதிக்கிறது…",
        diagnosis: "நோயறிதல்", severity: "தீவிரம்", treatment: "சிகிச்சை", history: "முந்தைய ஸ்கேன்கள்",
      },
      weather: { title: "வானிலை", forecast: "5-நாள் முன்னறிவிப்பு", alerts: "எச்சரிக்கை" },
      market: {
        title: "சந்தை விலைகள்", add: "பயிரை சேர்", commodity: "பயிர்", market: "சந்தை",
        min: "குறை", max: "அதி", modal: "சராசரி", noneYet: "இதுவரை எந்த பயிரும் இல்லை.",
      },
      chat: { title: "ஆலோசகர்", placeholder: "பயிர், பூச்சி, வானிலை கேளுங்கள்…", send: "அனுப்பு", listening: "கேட்கிறேன்…" },
      common: { back: "பின்", cancel: "ரத்து", loading: "ஏற்றுகிறது…", error: "ஏதோ தவறு.", tryAgain: "மீண்டும் முயற்சி", listen: "கேளு", speak: "பேசு", or: "அல்லது" },
    },
  },
};

const saved = typeof window !== "undefined" ? localStorage.getItem("lang") : null;

i18n.use(initReactI18next).init({
  resources,
  lng: saved || "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export const LANGS = [
  { code: "en", label: "English", speech: "en-IN" },
  { code: "hi", label: "हिन्दी", speech: "hi-IN" },
  { code: "ta", label: "தமிழ்", speech: "ta-IN" },
] as const;

export function setLang(code: string) {
  i18n.changeLanguage(code);
  localStorage.setItem("lang", code);
}

export default i18n;
