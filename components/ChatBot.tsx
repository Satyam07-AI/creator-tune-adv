
import React, { useState, useEffect, useRef } from 'react';
import { runChatbotQuery } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { ChatBubbleLeftRightIcon, XIcon, PaperAirplaneIcon, LanguageIcon, UserGroupIcon } from './icons';

interface ChatBotProps {
    onTalkToHuman: () => void;
    t: (key: string) => string;
}

const ChatBot = ({ onTalkToHuman, t }: ChatBotProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [chatLanguage, setChatLanguage] = useState<'hinglish' | 'english'>('hinglish');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setIsLoading(true);
            setTimeout(() => {
                const welcomeMessage: ChatMessage = {
                    sender: 'bot',
                    text: chatLanguage === 'hinglish' 
                        ? 'Hi 👋! Main aapka CreatorTune Buddy hoon. Aapko kya help chahiye aaj?' 
                        : 'Hi 👋! I\'m your CreatorTune Buddy. How can I help you today?',
                    suggestedReplies: chatLanguage === 'hinglish'
                        ? ['CreatorTune kya hai?', 'Thumbnail kaise improve karu?', 'Talk to a human']
                        : ['What is CreatorTune?', 'How to improve thumbnails?', 'Talk to a human']
                };
                setMessages([welcomeMessage]);
                setIsLoading(false);
            }, 500);
        }
    }, [isOpen, chatLanguage, messages.length]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return;

        if (text.toLowerCase() === 'talk to a human') {
            onTalkToHuman();
            setIsOpen(false);
            return;
        }

        const newUserMessage: ChatMessage = { sender: 'user', text };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);
        
        try {
            const response = await runChatbotQuery(text, chatLanguage);
            const botMessage: ChatMessage = {
                sender: 'bot',
                text: response.reply,
                suggestedReplies: response.suggestedReplies,
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = {
                sender: 'bot',
                text: error instanceof Error ? error.message : 'Something went wrong.',
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const toggleLanguage = () => {
        setChatLanguage(prev => prev === 'hinglish' ? 'english' : 'hinglish');
        setMessages([]); // Reset chat on language change
    }

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-5 right-5 z-40 flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-lg transition-all duration-300 ease-in-out hover:scale-110 ${isOpen ? 'w-16 h-16 opacity-0 pointer-events-none' : 'w-16 h-16 sm:w-auto sm:px-5 sm:py-3'}`}
                aria-label="Open Chat"
            >
                <ChatBubbleLeftRightIcon className="w-8 h-8 sm:w-6 sm:h-6" />
                <span className="hidden sm:inline sm:ml-2 font-bold">{t('chatbot.button')}</span>
            </button>

            {/* Chat Window */}
            <div
                className={`fixed inset-0 sm:bottom-5 sm:right-5 sm:inset-auto z-50 flex flex-col bg-gray-900/80 backdrop-blur-md border border-purple-500/50 shadow-2xl transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-8'} sm:rounded-2xl`}
                style={{ width: 'min(100vw, 400px)', height: 'min(100vh, 700px)'}}
            >
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/10">
                    <h3 className="text-lg font-bold text-white">CreatorTune Buddy</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={toggleLanguage} title="Switch Language" className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"><LanguageIcon className="w-5 h-5"/></button>
                        <button onClick={onTalkToHuman} title="Talk to a human" className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"><UserGroupIcon className="w-5 h-5"/></button>
                        <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"><XIcon className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Message Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-purple-500 flex-shrink-0 text-white font-bold flex items-center justify-center text-sm">CT</div>}
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.sender === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-800 text-white/90 rounded-bl-none'}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-2 justify-start">
                             <div className="w-8 h-8 rounded-full bg-purple-500 flex-shrink-0 text-white font-bold flex items-center justify-center text-sm">CT</div>
                             <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-gray-800 text-white/90 rounded-bl-none">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                    <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggested Replies & Input */}
                <div className="flex-shrink-0 p-4 border-t border-white/10 space-y-3">
                    {messages[messages.length - 1]?.sender === 'bot' && messages[messages.length - 1]?.suggestedReplies && (
                        <div className="flex flex-wrap gap-2">
                            {messages[messages.length - 1].suggestedReplies?.map((reply, i) => (
                                <button key={i} onClick={() => handleSendMessage(reply)} className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-purple-200 rounded-full transition-colors">
                                    {reply}
                                </button>
                            ))}
                        </div>
                    )}
                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(userInput); }} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={chatLanguage === 'hinglish' ? 'Aapka sawaal...' : 'Your question...'}
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-full py-2 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button type="submit" className="p-3 bg-purple-600 rounded-full text-white hover:bg-purple-700 transition-colors disabled:bg-gray-600" disabled={isLoading || !userInput}>
                            <PaperAirplaneIcon className="w-5 h-5"/>
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default ChatBot;
