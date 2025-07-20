

export type Language = 'en' | 'hi' | 'es' | 'fr';

export const supportedLanguages: { code: Language; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

// Using a simplified key structure for easier management
const translations: Record<string, Record<Language, string>> = {
    // General
    'audit': { en: 'Audit', hi: 'ऑडिट', es: 'Auditar', fr: 'Auditer' },
    'downloadReport': { en: 'Download Report', hi: 'रिपोर्ट डाउनलोड करें', es: 'Descargar Informe', fr: 'Télécharger le Rapport' },
    'getStarted': { en: 'Get Started', hi: 'शुरू हो जाओ', es: 'Empezar', fr: 'Commencer' },
    'backToFeatures': { en: 'Back to Features', hi: 'विशेषताओं पर वापस', es: 'Volver a Funcionalidades', fr: 'Retour aux Fonctionnalités' },
    'analyze': { en: 'Analyze', hi: 'विश्लेषण', es: 'Analizar', fr: 'Analyser' },
    'useTool': { en: 'Use Tool', hi: 'टूल का प्रयोग करें', es: 'Usar Herramienta', fr: 'Utiliser l\'outil' },
    'submit': { en: 'Submit', hi: 'प्रस्तुत', es: 'Enviar', fr: 'Soumettre' },
    'sending': { en: 'Sending...', hi: 'भेज रहा है...', es: 'Enviando...', fr: 'Envoi en cours...' },

    // Errors
    'error.url.enter': { en: 'Please enter a YouTube channel URL.', hi: 'कृपया एक यूट्यूब चैनल यूआरएल दर्ज करें।', es: 'Por favor, introduce una URL de canal de YouTube.', fr: 'Veuillez entrer une URL de chaîne YouTube.' },
    'error.url.valid': { en: 'Please enter a valid YouTube channel URL.', hi: 'कृपया एक मान्य यूट्यूब चैनल यूआरएल दर्ज करें।', es: 'Por favor, introduce una URL de canal de YouTube válida.', fr: 'Veuillez entrer une URL de chaîne YouTube valide.' },
    'error.unknown': { en: 'An unknown error occurred.', hi: 'एक अज्ञात त्रुटि हुई।', es: 'Ocurrió un error desconocido.', fr: 'Une erreur inconnue est survenue.' },
    'error.allFields': { en: 'Please fill out all fields.', hi: 'कृपया सभी फ़ील्ड भरें।', es: 'Por favor, rellena todos los campos.', fr: 'Veuillez remplir tous les champs.' },
    
    // Header
    'header.home': { en: 'Home', hi: 'होम', es: 'Inicio', fr: 'Accueil' },
    'header.features': { en: 'Features', hi: 'विशेषताएँ', es: 'Características', fr: 'Fonctionnalités' },
    'header.whatYouGet': { en: 'What You Get', hi: 'आपको क्या मिलता है', es: 'Qué Obtienes', fr: 'Ce que vous obtenez' },
    'header.howItWorks': { en: 'How It Works', hi: 'यह काम किस प्रकार करता है', es: 'Cómo Funciona', fr: 'Comment ça marche' },
    'header.pricing': { en: 'Pricing', hi: 'मूल्य-निर्धारण', es: 'Precios', fr: 'Tarifs' },
    'header.faq': { en: 'FAQ', hi: 'सामान्य प्रश्न', es: 'Preguntas Frecuentes', fr: 'FAQ' },

    // Homepage
    'homepage.main.title': { en: 'AI-Powered YouTube Growth Suite', hi: 'एआई-संचालित यूट्यूब ग्रोथ सूट', es: 'Suite de Crecimiento de YouTube Potenciada por IA', fr: 'Suite de Croissance YouTube par IA' },
    'homepage.main.subtitle': { en: 'Now It\'s Your Turn To Grow Your Channel', hi: 'अब आपके चैनल को बढ़ाने की आपकी बारी है।', es: 'Ahora es tu turno para hacer crecer tu canal.', fr: 'C\'est maintenant à votre tour de développer votre chaîne.' },
    'homepage.main.placeholder': { en: 'Enter YouTube Channel URL', hi: 'यूट्यूब चैनल यूआरएल दर्ज करें', es: 'Introduce la URL del canal de YouTube', fr: 'Entrez l\'URL de la chaîne YouTube' },
    'homepage.features.header': { en: 'Start Here', hi: 'यहां से शुरू करें', es: 'Empieza Aquí', fr: 'Commencez ici' },
    'homepage.features.title': { en: 'Your Core AI Toolkit', hi: 'आपकी कोर एआई टूलकिट', es: 'Tu Kit de Herramientas de IA Principal', fr: 'Votre Boîte à Outils IA Principale' },
    'homepage.features.subtitle': { en: 'Begin with our most popular tools to fast-track your channel\'s growth and engagement.', hi: 'अपने चैनल के विकास और जुड़ाव को तेजी से ट्रैक करने के लिए हमारे सबसे लोकप्रिय टूल के साथ शुरुआत करें।', es: 'Comienza con nuestras herramientas más populares para acelerar el crecimiento y la participación de tu canal.', fr: 'Commencez avec nos outils les plus populaires pour accélérer la croissance et l\'engagement de votre chaîne.' },
    'homepage.features.viewAll': { en: 'View All Features →', hi: 'सभी सुविधाएँ देखें →', es: 'Ver Todas las Características →', fr: 'Voir Toutes les Fonctionnalités →' },
    
    // Contact Form
    'contact.title': { en: 'Contact Us', hi: 'संपर्क करें', es: 'Contáctanos', fr: 'Contactez-nous' },
    'contact.subtitle': { en: 'Have a question or suggestion? Drop us a line!', hi: 'कोई प्रश्न या सुझाव है? हमें एक संदेश भेजें!', es: '¿Tienes una pregunta o sugerencia? ¡Escríbenos!', fr: 'Une question ou une suggestion? Écrivez-nous!' },
    'contact.name': { en: 'Name', hi: 'नाम', es: 'Nombre', fr: 'Nom' },
    'contact.email': { en: 'Email', hi: 'ईमेल', es: 'Correo Electrónico', fr: 'Email' },
    'contact.message': { en: 'Your message...', hi: 'आपका संदेश...', es: 'Tu mensaje...', fr: 'Votre message...' },
    'contact.success': { en: 'Thank you for your message!', hi: 'आपके संदेश के लिए धन्यवाद!', es: '¡Gracias por tu mensaje!', fr: 'Merci pour votre message!' },
    'contact.button': { en: 'Contact / Support', hi: 'संपर्क / सहायता', es: 'Contacto / Soporte', fr: 'Contact / Support' },

    // History Panel
    'history.title': { en: 'Audit History', hi: 'ऑडिट इतिहास', es: 'Historial de Auditorías', fr: 'Historique des Audits' },
    'history.clear': { en: 'Clear History', hi: 'इतिहास साफ़ करें', es: 'Limpiar Historial', fr: 'Effacer l\'Historique' },
    'history.view': { en: 'View', hi: 'देखें', es: 'Ver', fr: 'Voir' },
    'history.empty': { en: 'No audit history found.', hi: 'कोई ऑडिट इतिहास नहीं मिला।', es: 'No se encontró historial de auditorías.', fr: 'Aucun historique d\'audit trouvé.' },
    'history.confirmClear': { en: 'Are you sure you want to clear your entire audit history? This cannot be undone.', hi: 'क्या आप वाकई अपना पूरा ऑडिट इतिहास साफ़ करना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।', es: '¿Estás seguro de que quieres borrar todo tu historial de auditorías? Esta acción no se puede deshacer.', fr: 'Êtes-vous sûr de vouloir effacer tout votre historique d\'audit? Cette action ne peut pas être annulée.' },

    // Generic Tool texts
    'tool.channelUrl.placeholder': { en: 'Enter YouTube Channel URL to analyze', hi: 'विश्लेषण करने के लिए यूट्यूब चैनल यूआरएल दर्ज करें', es: 'Introduce la URL del canal de YouTube para analizar', fr: 'Entrez l\'URL de la chaîne YouTube à analyser' },
    'tool.analyzeAnother': { en: 'Analyze Another', hi: 'दूसरा विश्लेषण करें', es: 'Analizar Otro', fr: 'Analyser un autre' },

    // Chatbot
    'chatbot.button': { en: 'CreatorTune Buddy', hi: 'क्रिएटरट्यून बडी', es: 'CreatorTune Buddy', fr: 'CreatorTune Buddy' },
};

export const getTranslator = (lang: Language) => {
    const t = (key: string): string => {
        if (key in translations) {
            return translations[key][lang] || translations[key]['en'];
        }
        console.warn(`Translation key "${key}" not found.`);
        return key;
    };
    return t;
};

export const detectInitialLanguage = (): Language => {
    const savedLang = localStorage.getItem('creator-tune-language');
    if (savedLang && supportedLanguages.some(l => l.code === savedLang)) {
        return savedLang as Language;
    }

    const browserLang = navigator.language.split('-')[0];
    if (supportedLanguages.some(l => l.code === browserLang)) {
        return browserLang as Language;
    }
    
    return 'en';
};

export const getLanguageName = (code: Language): string => {
    return supportedLanguages.find(l => l.code === code)?.name || 'English';
}