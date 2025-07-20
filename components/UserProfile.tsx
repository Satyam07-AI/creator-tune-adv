
import React, { useState, useEffect, useRef } from 'react';
import type { User } from '../types';
import { UserCircleIcon, Cog8ToothIcon, ArrowLeftStartOnRectangleIcon, WrenchScrewdriverIcon, StarIcon, FolderIcon } from './icons';

interface UserProfileProps {
    user: User | null;
    onLogin: () => void;
    onLogout: () => void;
    theme?: 'dark' | 'light';
}

const UserProfile = ({ user, onLogin, onLogout, theme = 'dark' }: UserProfileProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showEasterEgg, setShowEasterEgg] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const easterEggTimer = useRef<number | null>(null);

    const isLight = theme === 'light';
    const textColor = isLight ? 'text-gray-600' : 'text-gray-300';
    const hoverBgColor = isLight ? 'hover:bg-gray-100' : 'hover:bg-white/10';
    const dropdownBg = isLight ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-700';
    const dropdownItemText = isLight ? 'text-gray-700' : 'text-white/90';

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMouseEnter = () => {
        easterEggTimer.current = window.setTimeout(() => {
            setShowEasterEgg(true);
        }, 2000);
    };

    const handleMouseLeave = () => {
        if (easterEggTimer.current) {
            clearTimeout(easterEggTimer.current);
        }
        setShowEasterEgg(false);
    };

    if (!user) {
        return (
            <button
                onClick={onLogin}
                className={`font-semibold px-4 py-2 rounded-lg transition-colors duration-200 ${isLight ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            >
                Login / Register
            </button>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="relative w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-800 transition-transform duration-300 hover:scale-110"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                {user.avatarUrl ? (
                    <img className="w-full h-full rounded-full object-cover" src={user.avatarUrl} alt="User avatar" />
                ) : (
                    <div className="w-full h-full rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-lg">
                        {getInitials(user.name)}
                    </div>
                )}
                {user.hasNotifications && (
                    <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                )}
            </button>
            
            {showEasterEgg && (
                 <div className="absolute top-full right-0 mt-3 w-max bg-black/80 text-white text-sm px-3 py-1.5 rounded-lg shadow-lg animate-fade-in-up" style={{animationDuration: '0.2s'}}>
                    You’re doing great, keep going 🚀
                </div>
            )}

            {/* Dropdown Menu */}
            <div
                className={`absolute top-full right-0 mt-3 w-64 ${dropdownBg} border rounded-2xl shadow-2xl p-2 z-50 transition-all duration-300 ease-in-out origin-top-right ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button"
            >
                <div className="px-2 py-2 border-b border-white/10 mb-2">
                    <p className={`font-semibold truncate ${dropdownItemText}`}>{user.name}</p>
                    <p className={`text-sm truncate ${textColor}`}>{user.email}</p>
                </div>
                <ul className="space-y-1">
                    {user.role === 'premium' && (
                        <li>
                            <a href="#" className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-lg transition-colors bg-yellow-400/10 text-yellow-300 hover:bg-yellow-400/20 shadow-inner`}>
                                <StarIcon className="w-5 h-5" />
                                <span>Premium Dashboard</span>
                            </a>
                        </li>
                    )}
                     {user.role === 'admin' && (
                        <li>
                            <a href="#" className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-lg transition-colors bg-red-500/10 text-red-300 hover:bg-red-500/20`}>
                                <WrenchScrewdriverIcon className="w-5 h-5" />
                                <span>Admin Panel</span>
                            </a>
                        </li>
                    )}
                    <li><a href="#" className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${dropdownItemText} ${hoverBgColor}`}><UserCircleIcon className="w-5 h-5" /> My Profile</a></li>
                    <li><a href="#" className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${dropdownItemText} ${hoverBgColor}`}><FolderIcon className="w-5 h-5" /> My Audits</a></li>
                    <li><a href="#" className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${dropdownItemText} ${hoverBgColor}`}><Cog8ToothIcon className="w-5 h-5" /> Settings</a></li>
                    <div className="!my-2 h-px bg-white/10"></div>
                    <li><button onClick={onLogout} className={`flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${dropdownItemText} ${hoverBgColor}`}><ArrowLeftStartOnRectangleIcon className="w-5 h-5" /> Logout</button></li>
                </ul>
            </div>
        </div>
    );
};

export default UserProfile;
