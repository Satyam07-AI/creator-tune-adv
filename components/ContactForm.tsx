

import React, { useState, useEffect } from 'react';
import { sendContactMessage } from '../services/contactService';
import { XIcon, CheckCircleIcon } from './icons';

interface ContactFormProps {
    isOpen: boolean;
    onClose: () => void;
    t: (key: string) => string;
}

const ContactForm = ({ isOpen, onClose, t }: ContactFormProps) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !message) {
            setStatus('error');
            setErrorMsg(t('error.allFields'));
            return;
        }
        setStatus('loading');
        setErrorMsg('');
        try {
            await sendContactMessage(name, email, message);
            setStatus('success');
            setName('');
            setEmail('');
            setMessage('');
        } catch (err) {
            setStatus('error');
            setErrorMsg(err instanceof Error ? err.message : t('error.unknown'));
        }
    };
    
    // Close form on escape key
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Reset status when form is closed
    useEffect(() => {
        if (!isOpen) {
            // Reset after a delay to allow for the closing animation
            setTimeout(() => {
                setStatus('idle');
                setErrorMsg('');
            }, 300);
        }
    }, [isOpen]);

    return (
        <div
            className={`fixed inset-0 z-50 flex items-end justify-end transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
            
            {/* Form Panel */}
            <div
                className={`relative w-full max-w-md bg-gray-900 border-t-2 border-purple-500 shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
                style={{ borderTopLeftRadius: '1.5rem', borderTopRightRadius: '1.5rem' }}
            >
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-2xl font-bold text-white">{t('contact.title')}</h3>
                            <p className="text-gray-400">{t('contact.subtitle')}</p>
                        </div>
                        <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                    
                    {status === 'success' ? (
                        <div className="text-center py-10">
                            <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4"/>
                            <p className="text-xl font-bold text-white">{t('contact.success')}</p>
                            <button onClick={() => setStatus('idle')} className="mt-6 text-sm text-purple-300 hover:underline">Send another message</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="sr-only">{t('contact.name')}</label>
                                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} placeholder={t('contact.name')} required className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"/>
                            </div>
                            <div>
                                <label htmlFor="email" className="sr-only">{t('contact.email')}</label>
                                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('contact.email')} required className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"/>
                            </div>
                            <div>
                                <label htmlFor="message" className="sr-only">{t('contact.message')}</label>
                                <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} placeholder={t('contact.message')} required rows={5} className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"></textarea>
                            </div>
                            
                            {status === 'error' && errorMsg && (
                                <p className="text-sm text-red-400 text-center">{errorMsg}</p>
                            )}

                            <button type="submit" disabled={status === 'loading'} className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-500/50 disabled:cursor-wait">
                                {status === 'loading' ? t('sending') : t('submit')}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactForm;
