

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { runYouTubeAudit } from './services/geminiService';
import { saveAuditToHistory } from './services/historyService';
import { getTranslator, detectInitialLanguage, Language } from './services/localization';
import type { AuditData, HistoryItem, User } from './types';
import AuditResult from './components/AuditResult';
import LoadingSpinner from './components/LoadingSpinner';
import { SearchIcon } from './components/icons';
import HomepageFeatures from './components/HomepageFeatures';
import TitleThumbnailOptimizer from './components/TitleThumbnailOptimizer';
import ContentStrategyAnalyzer from './components/ContentStrategyAnalyzer';
import AudienceAnalyzer from './components/AudienceAnalyzer';
import ContentCalendarGenerator from './components/ContentCalendarGenerator';
import BrandingReviewAnalyzer from './components/BrandingReviewAnalyzer';
import EngagementHacksAnalyzer from './components/EngagementHacksAnalyzer';
import ScriptGenerator from './components/ScriptGenerator';
import ABTester from './components/ABTester';
import ChannelPositioningMap from './components/ChannelPositioningMap';
import { RetentionAnalyzer } from './components/RetentionAnalyzer';
import AboutSectionAnalyzer from './components/AboutSectionAnalyzer';
import HowItWorks from './components/HowItWorks';
import Header from './components/Header';
import FeaturesPage from './components/FeaturesPage';
import PricingPage from './components/PricingPage';
import FAQPage from './components/FAQPage';
import Footer from './components/Footer';
import TermsOfServicePage from './components/TermsOfServicePage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import ThankYouPage from './components/ThankYouPage';
import ThumbnailLibrary from './components/ThumbnailLibrary';
import BenefitsPage from './components/BenefitsPage';
import ContactForm from './components/ContactForm';
import ChatBot from './components/ChatBot';

type View = 'main' | 'features' | 'pricing' | 'faq' | 'tos' | 'privacy' | 'thank-you' | 'thumbnails' | 'what-you-get';

// Mock User Data for demonstration
const mockUsers: (User | null)[] = [
    null, // Logged out
    { name: 'Satyam Yadav', email: 'satyam.yadav@example.com', role: 'standard', hasNotifications: true },
    { name: 'Priya Sharma', email: 'priya.sharma@example.com', avatarUrl: 'https://i.pravatar.cc/150?u=priya', role: 'premium', hasNotifications: false },
    { name: 'Admin User', email: 'admin@creators.com', role: 'admin', hasNotifications: true },
];

const App = () => {
  const [url, setUrl] = useState<string>('');
  const [auditResult, setAuditResult] = useState<AuditData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [view, setView] = useState<View>('main');

  // Language state
  const [language, setLanguage] = useState<Language>(detectInitialLanguage());
  const t = useMemo(() => getTranslator(language), [language]);
  
  // Contact Form state
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);

  // User state for demonstration
  const [userIndex, setUserIndex] = useState(0);
  const currentUser = useMemo(() => mockUsers[userIndex], [userIndex]);

  const cycleUser = () => setUserIndex((prev) => (prev + 1) % mockUsers.length);
  const handleLogin = () => setUserIndex(1); // Log in as standard user
  const handleLogout = () => setUserIndex(0); // Log out

  const [showOptimizer, setShowOptimizer] = useState<boolean>(false);
  const [showContentStrategy, setShowContentStrategy] = useState<boolean>(false);
  const [showAudienceAnalyzer, setShowAudienceAnalyzer] = useState<boolean>(false);
  const [showContentCalendar, setShowContentCalendar] = useState<boolean>(false);
  const [showBrandingReview, setShowBrandingReview] = useState<boolean>(false);
  const [showEngagementHacks, setShowEngagementHacks] = useState<boolean>(false);
  const [showScriptGenerator, setShowScriptGenerator] = useState<boolean>(false);
  const [showABTester, setShowABTester] = useState<boolean>(false);
  const [showPositioningMap, setShowPositioningMap] = useState<boolean>(false);
  const [showRetentionAnalyzer, setShowRetentionAnalyzer] = useState<boolean>(false);
  const [showAboutSectionAnalyzer, setShowAboutSectionAnalyzer] = useState<boolean>(false);

  const handleLanguageChange = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('creator-tune-language', lang);
  }, []);

  const clearFeatureStates = (isAuditing: boolean = false) => {
    if (!isAuditing) {
        setAuditResult(null);
        setError(null);
        setUrl('');
    }
    setShowOptimizer(false);
    setShowContentStrategy(false);
    setShowAudienceAnalyzer(false);
    setShowContentCalendar(false);
    setShowBrandingReview(false);
    setShowEngagementHacks(false);
    setShowScriptGenerator(false);
    setShowABTester(false);
    setShowPositioningMap(false);
    setShowRetentionAnalyzer(false);
    setShowAboutSectionAnalyzer(false);
  };

  const handleAudit = useCallback(async () => {
    if (!url.trim()) {
      setError(t('error.url.enter'));
      return;
    }
    
    try {
        new URL(url);
        if (!url.toLowerCase().includes('youtube.com') && !url.toLowerCase().includes('youtu.be')) {
            throw new Error('Invalid URL');
        }
    } catch(_) {
        setError(t('error.url.valid'));
        return;
    }

    clearFeatureStates(true);
    setIsLoading(true);
    setError(null);
    setAuditResult(null);

    try {
      const result = await runYouTubeAudit(url, language);
      setAuditResult(result);
      if (currentUser) {
          saveAuditToHistory(url, result);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('error.unknown'));
    } finally {
      setIsLoading(false);
    }
  }, [url, language, t, currentUser]);

  const handleRevisit = useCallback((item: HistoryItem) => {
    clearFeatureStates(true);
    setUrl(item.url);
    setAuditResult(item.data);
    setError(null);
    setIsLoading(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleGoHome = useCallback(() => {
    clearFeatureStates(false);
    setView('main');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleShowFeaturesPage = useCallback(() => {
    clearFeatureStates(false);
    setView('features');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleShowPricingPage = useCallback(() => {
    clearFeatureStates(false);
    setView('pricing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  const handleShowFAQPage = useCallback(() => {
    clearFeatureStates(false);
    setView('faq');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleShowTOSPage = useCallback(() => {
    clearFeatureStates(false);
    setView('tos');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleShowPrivacyPolicyPage = useCallback(() => {
    clearFeatureStates(false);
    setView('privacy');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleShowThankYouPage = useCallback(() => {
    clearFeatureStates(false);
    setView('thank-you');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

  const handleShowThumbnailLibrary = useCallback(() => {
    clearFeatureStates(false);
    setView('thumbnails');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  const handleShowWhatYouGetPage = useCallback(() => {
    clearFeatureStates(false);
    setView('what-you-get');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleScrollTo = useCallback((selector: string) => {
    setView('main');
    setTimeout(() => {
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        handleGoHome();
        setTimeout(() => {
          document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }, 0);
  }, [handleGoHome]);


  const createToolHandler = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    return useCallback(() => {
        clearFeatureStates();
        setView('main');
        setter(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [setter]);
  };

  const handleOptimizerClick = createToolHandler(setShowOptimizer);
  const handleContentStrategyClick = createToolHandler(setShowContentStrategy);
  const handleAudienceAnalysisClick = createToolHandler(setShowAudienceAnalyzer);
  const handleContentCalendarClick = createToolHandler(setShowContentCalendar);
  const handleBrandingReviewClick = createToolHandler(setShowBrandingReview);
  const handleEngagementHacksClick = createToolHandler(setShowEngagementHacks);
  const handleScriptGeneratorClick = createToolHandler(setShowScriptGenerator);
  const handleABTesterClick = createToolHandler(setShowABTester);
  const handlePositioningMapClick = createToolHandler(setShowPositioningMap);
  const handleRetentionAnalysisClick = createToolHandler(setShowRetentionAnalyzer);
  const handleAboutSectionAnalyzerClick = createToolHandler(setShowAboutSectionAnalyzer);
  
  const createBackHandler = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
      return useCallback(() => {
          setter(false);
          setError(null);
      }, [setter]);
  };

  const handleBackFromOptimizer = createBackHandler(setShowOptimizer);
  const handleBackFromContentStrategy = createBackHandler(setShowContentStrategy);
  const handleBackFromAudienceAnalyzer = createBackHandler(setShowAudienceAnalyzer);
  const handleBackFromContentCalendar = createBackHandler(setShowContentCalendar);
  const handleBackFromBrandingReview = createBackHandler(setShowBrandingReview);
  const handleBackFromEngagementHacks = createBackHandler(setShowEngagementHacks);
  const handleBackFromScriptGenerator = createBackHandler(setShowScriptGenerator);
  const handleBackFromABTester = createBackHandler(setShowABTester);
  const handleBackFromPositioningMap = createBackHandler(setShowPositioningMap);
  const handleBackFromRetentionAnalysis = createBackHandler(setShowRetentionAnalyzer);
  const handleBackFromAboutSectionAnalyzer = createBackHandler(setShowAboutSectionAnalyzer);


  const renderActiveComponent = () => {
    if (showOptimizer) {
      return <TitleThumbnailOptimizer onBack={handleBackFromOptimizer} t={t} language={language} />;
    }
    if (showContentStrategy) {
      return <ContentStrategyAnalyzer onBack={handleBackFromContentStrategy} t={t} language={language} />;
    }
    if (showAudienceAnalyzer) {
        return <AudienceAnalyzer onBack={handleBackFromAudienceAnalyzer} t={t} language={language} />;
    }
    if (showContentCalendar) {
        return <ContentCalendarGenerator onBack={handleBackFromContentCalendar} t={t} language={language} />;
    }
    if (showBrandingReview) {
        return <BrandingReviewAnalyzer onBack={handleBackFromBrandingReview} t={t} language={language} />;
    }
    if (showAboutSectionAnalyzer) {
        return <AboutSectionAnalyzer onBack={handleBackFromAboutSectionAnalyzer} t={t} language={language} />;
    }
    if (showEngagementHacks) {
        return <EngagementHacksAnalyzer onBack={handleBackFromEngagementHacks} t={t} language={language} />;
    }
    if (showScriptGenerator) {
        return <ScriptGenerator onBack={handleBackFromScriptGenerator} t={t} language={language} />;
    }
    if (showABTester) {
        return <ABTester onBack={handleBackFromABTester} t={t} language={language} />;
    }
    if (showRetentionAnalyzer) {
        return <RetentionAnalyzer onBack={handleBackFromRetentionAnalysis} t={t} language={language} />;
    }
    if (showPositioningMap) {
        return <ChannelPositioningMap onBack={handleBackFromPositioningMap} t={t} language={language} />;
    }
    return (
        <HomepageFeatures
            onOptimizerClick={handleOptimizerClick}
            onContentStrategyClick={handleContentStrategyClick}
            onAudienceAnalysisClick={handleAudienceAnalysisClick}
            onContentCalendarClick={handleContentCalendarClick}
            onAboutSectionAnalyzerClick={handleAboutSectionAnalyzerClick}
            onEngagementHacksClick={handleEngagementHacksClick}
            onShowFeaturesPage={handleShowFeaturesPage}
            t={t}
        />
    );
  }

  const renderMainView = () => (
    <>
        <div className="w-full max-w-4xl text-center mt-12 sm:mt-16">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-shadow-lg bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500">
            {t('homepage.main.title')}
            </h1>
            <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
            {t('homepage.main.subtitle')}
            </p>

            <div className="mt-10 max-w-2xl w-full mx-auto">
            <div className="flex items-center gap-2 rounded-full bg-gray-800/50 border border-gray-700 p-2 shadow-lg focus-within:ring-2 focus-within:ring-purple-500 transition-all">
                <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleAudit()}
                placeholder={t('homepage.main.placeholder')}
                className="flex-grow bg-transparent text-white placeholder-gray-400 focus:outline-none px-4 text-lg"
                disabled={isLoading}
                />
                <button
                onClick={handleAudit}
                disabled={isLoading}
                className="flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-full px-6 py-3 transition-all duration-300 ease-in-out hover:scale-105 disabled:bg-gray-500/50 disabled:text-white/70 disabled:cursor-not-allowed"
                >
                {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                    <>
                    <SearchIcon className="w-5 h-5 mr-2" />
                    {t('audit')}
                    </>
                )}
                </button>
            </div>
            </div>
        </div>
        
        <div className="w-full mt-6">
            {isLoading && <LoadingSpinner />}
            {error && <div className="text-center bg-red-500/50 text-white font-semibold p-4 rounded-xl max-w-md mx-auto">{error}</div>}
            {auditResult && <AuditResult data={auditResult} channelUrl={url} t={t} />}
            {!isLoading && !auditResult && renderActiveComponent()}
        </div>

        <div id="how-it-works">
            <HowItWorks t={t} />
        </div>
    </>
  )
  
  const renderCurrentView = () => {
    const activeToolComponent = [
        showOptimizer, showContentStrategy, showAudienceAnalyzer,
        showContentCalendar, showBrandingReview, showAboutSectionAnalyzer,
        showEngagementHacks, showScriptGenerator, showABTester,
        showPositioningMap, showRetentionAnalyzer
    ].some(Boolean) ? renderActiveComponent() : null;

    if (view === 'main' && activeToolComponent) {
        return activeToolComponent;
    }
      
    switch (view) {
        case 'main':
            return renderMainView();
        case 'features':
            return (
                <FeaturesPage
                    onOptimizerClick={handleOptimizerClick} 
                    onContentStrategyClick={handleContentStrategyClick}
                    onAudienceAnalysisClick={handleAudienceAnalysisClick}
                    onContentCalendarClick={handleContentCalendarClick}
                    onBrandingReviewClick={handleBrandingReviewClick}
                    onAboutSectionAnalyzerClick={handleAboutSectionAnalyzerClick}
                    onEngagementHacksClick={handleEngagementHacksClick}
                    onScriptGeneratorClick={handleScriptGeneratorClick}
                    onABTesterClick={handleABTesterClick}
                    onRetentionAnalysisClick={handleRetentionAnalysisClick}
                    onPositioningMapClick={handlePositioningMapClick}
                    t={t}
                />
            );
        case 'what-you-get':
            return <BenefitsPage t={t} />;
        case 'thumbnails':
            return <ThumbnailLibrary t={t} />;
        case 'pricing':
            return <PricingPage onPaymentSuccess={handleShowThankYouPage} t={t} />;
        case 'faq':
            return <FAQPage t={t} />;
        case 'tos':
            return <TermsOfServicePage t={t} />;
        case 'privacy':
            return <PrivacyPolicyPage t={t} />;
        case 'thank-you':
            return <ThankYouPage onGoHome={handleGoHome} t={t} />;
        default:
            return renderMainView();
    }
  }

  const isLightTheme = view === 'pricing' || view === 'faq' || view === 'tos' || view === 'privacy' || view === 'thank-you';

  const anyToolActive = [
    showOptimizer, showContentStrategy, showAudienceAnalyzer,
    showContentCalendar, showBrandingReview, showAboutSectionAnalyzer,
    showEngagementHacks, showScriptGenerator, showABTester,
    showPositioningMap, showRetentionAnalyzer
  ].some(Boolean);

  const finalTheme = isLightTheme && !anyToolActive ? 'light' : 'dark';
  const finalBg = finalTheme === 'light' ? 'bg-gray-50' : 'bg-[#111827]';

  return (
    <div className={`min-h-screen w-full text-white flex flex-col transition-colors duration-300 ${finalBg}`}>
      {/* DEMO BUTTON - REMOVE IN PRODUCTION */}
      <button 
        onClick={cycleUser}
        className="fixed bottom-5 left-5 z-50 bg-yellow-500 text-black font-bold text-xs px-3 py-1 rounded-full shadow-lg"
      >
        Cycle User (Dev)
      </button>

      <Header 
        onGoHome={handleGoHome} 
        onShowFeaturesPage={handleShowFeaturesPage} 
        onShowPricingPage={handleShowPricingPage}
        onShowFAQPage={handleShowFAQPage}
        onShowPrivacyPolicyPage={handleShowPrivacyPolicyPage}
        onShowWhatYouGetPage={handleShowWhatYouGetPage}
        onScrollTo={handleScrollTo}
        onRevisit={handleRevisit}
        theme={finalTheme}
        t={t}
        language={language}
        onLanguageChange={handleLanguageChange}
        user={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <main className="w-full flex flex-col items-center p-4 sm:p-6 lg:p-8 flex-grow">
        {renderCurrentView()}
      </main>
      <Footer
        onGoHome={handleGoHome}
        onShowFeaturesPage={handleShowFeaturesPage}
        onShowPricingPage={handleShowPricingPage}
        onShowFAQPage={handleShowFAQPage}
        onShowTOSPage={handleShowTOSPage}
        onShowPrivacyPolicyPage={handleShowPrivacyPolicyPage}
        onShowWhatYouGetPage={handleShowWhatYouGetPage}
        onScrollTo={handleScrollTo}
        t={t}
      />
      <ContactForm isOpen={isContactFormOpen} onClose={() => setIsContactFormOpen(false)} t={t} />
      <ChatBot onTalkToHuman={() => setIsContactFormOpen(true)} t={t} />
    </div>
  );
};

export default App;