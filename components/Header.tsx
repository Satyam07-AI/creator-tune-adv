

import React, { useState, useEffect, useRef } from 'react';
import type { HistoryItem, User } from '../types';
import { FolderIcon } from './icons';
import HistoryDropdown from './HistoryPanel';
import LanguageSelector from './LanguageSelector';
import type { Language } from '../services/localization';
import UserProfile from './UserProfile';


interface HeaderProps {
  onGoHome: () => void; 
  onShowFeaturesPage: () => void;
  onShowPricingPage: () => void;
  onShowFAQPage: () => void;
  onShowPrivacyPolicyPage: () => void;
  onShowWhatYouGetPage: () => void;
  onScrollTo: (selector: string) => void;
  onRevisit: (item: HistoryItem) => void;
  theme?: 'dark' | 'light';
  t: (key: string) => string;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

const Header = ({ 
    onGoHome, 
    onShowFeaturesPage, 
    onShowPricingPage, 
    onShowFAQPage, 
    onShowPrivacyPolicyPage, 
    onShowWhatYouGetPage, 
    onScrollTo, 
    onRevisit, 
    theme = 'dark',
    t,
    language,
    onLanguageChange,
    user,
    onLogin,
    onLogout
}: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node)) {
        setIsHistoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isLight = theme === 'light';

  const menuItems = [
    { name: t('header.home'), href: '/', action: onGoHome },
    { name: t('header.features'), href: '/features', action: onShowFeaturesPage },
    { name: t('header.whatYouGet'), href: '/benefits', action: onShowWhatYouGetPage },
    { name: t('header.howItWorks'), href: '#how-it-works', action: () => onScrollTo('#how-it-works') },
    { name: t('header.pricing'), href: '/pricing', action: onShowPricingPage },
    { name: t('header.faq'), href: '/faq', action: onShowFAQPage },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, action?: () => void) => {
    e.preventDefault();
    if (action) {
      action();
    }
    setIsMenuOpen(false);
  };
  
  const headerClasses = isLight 
    ? "bg-white/80 backdrop-blur-md border-gray-200"
    : "bg-[#111827]/80 backdrop-blur-md border-gray-800";
    
  const logoClasses = isLight ? "text-purple-600" : "text-purple-400";
  
  const linkClasses = isLight ? "text-gray-600 hover:text-black" : "text-gray-300 hover:text-white";

  const mobileMenuButtonClasses = isLight ? "text-gray-500 hover:bg-gray-100" : "text-gray-400 hover:bg-gray-800";

  const mobileMenuBgClasses = isLight ? "bg-white" : "bg-gray-900";

  const HistoryButton = ({ className = '' }: { className?: string }) => (
    <button
      onClick={() => {
        setIsHistoryOpen(prev => !prev);
        setIsMenuOpen(false);
      }}
      className={`p-2 rounded-full transition-colors duration-200 ${linkClasses} ${className}`}
      aria-label="View audit history"
    >
      <FolderIcon className="w-6 h-6" />
    </button>
  );

  return (
    <header className={`sticky top-0 z-50 w-full transition-colors duration-300 ${headerClasses}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" onClick={(e) => handleLinkClick(e, onGoHome)} className="flex items-center" aria-label="Creator Tune Home">
               <h1 className={`text-3xl font-bold italic ${logoClasses}`} style={{fontFamily: "'Poppins', sans-serif"}}>CreatorTune</h1>
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <div className="flex items-center space-x-8">
                {menuItems.map((item) => (
                <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleLinkClick(e, item.action)}
                    className={`transition-colors duration-200 font-medium ${linkClasses}`}
                >
                    {item.name}
                </a>
                ))}
            </div>
            <div className="relative flex items-center gap-2 pl-4">
                 <div ref={historyRef} className="flex items-center">
                    {user && <HistoryButton />}
                    <HistoryDropdown 
                        isOpen={isHistoryOpen} 
                        onClose={() => setIsHistoryOpen(false)}
                        onRevisit={(item) => {
                            onRevisit(item);
                            setIsHistoryOpen(false);
                        }} 
                        t={t}
                    />
                </div>
                <LanguageSelector currentLanguage={language} onLanguageChange={onLanguageChange} theme={theme} />
                 <UserProfile user={user} onLogin={onLogin} onLogout={onLogout} theme={theme} />
                {!user && (
                    <a
                        href="#"
                        onClick={(e) => handleLinkClick(e, onShowPricingPage)}
                        className="bg-purple-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-lg ml-2"
                    >
                        {t('getStarted')}
                    </a>
                )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {user && <HistoryButton />}
            <LanguageSelector currentLanguage={language} onLanguageChange={onLanguageChange} theme={theme} />
            <UserProfile user={user} onLogin={onLogin} onLogout={onLogout} theme={theme} />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 ${mobileMenuButtonClasses}`}
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger Icon */}
              <svg className={`h-6 w-6 ${isMenuOpen ? 'hidden' : 'block'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              {/* Close Icon */}
              <svg className={`h-6 w-6 ${isMenuOpen ? 'block' : 'hidden'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden border-t ${isLight ? 'border-gray-200' : 'border-gray-800'}`} id="mobile-menu">
        <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 ${mobileMenuBgClasses}`}>
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => handleLinkClick(e, item.action)}
              className={`${linkClasses} block px-3 py-2 rounded-md text-base font-medium`}
            >
              {item.name}
            </a>
          ))}
          {!user && (
            <div className="pt-4 px-1">
                <a
                href="#"
                onClick={(e) => handleLinkClick(e, onShowPricingPage)}
                className="bg-purple-600 text-white font-semibold block w-full text-center px-5 py-3 rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-lg"
                >
                {t('getStarted')}
                </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;