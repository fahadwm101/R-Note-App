
import React, { useState, useRef, useEffect } from 'react';
import { ICONS } from '../constants';
import { ChatMessage } from '../types';
import { getGeminiResponse } from '../services/geminiService';
import { marked } from 'marked';
import { useLanguage } from '../LanguageContext';
import { useDataManagement } from '../hooks/useDataManagement';
import Card from './ui/Card';

import { Task, Class, Note, Assignment, Quiz } from '../types';

interface SmartAssistantProps {
  isOpen?: boolean;
  onClose?: () => void;
  tasks: Task[];
  classes: Class[];
  notes: Note[];
  assignments: Assignment[];
  quizzes: Quiz[];
}

const SmartAssistant: React.FC<SmartAssistantProps> = ({ isOpen: externalIsOpen, onClose: externalOnClose, tasks, classes, notes, assignments, quizzes }) => {
  const { t, language } = useLanguage();
  // Removed local useDataManagement hook call to prevent duplicate listeners
  // const { tasks, classes, notes, assignments, quizzes } = useDataManagement();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnClose || setInternalIsOpen;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;
    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await getGeminiResponse(messages, input, language, { tasks, classes, notes, assignments, quizzes });
      const modelMessage: ChatMessage = { role: 'model', text: responseText };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { role: 'model', text: t('geminiError') };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  if (externalIsOpen !== undefined) {
    // Sidebar mode
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-800">
        <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
            {ICONS.ai} <span className="ms-2">{t('smartAssistant')}</span>
          </h2>
          <button
            onClick={externalOnClose}
            className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors lg:hidden"
            aria-label="Close"
          >
            {ICONS.close}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-lg px-4 py-2 max-w-sm ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                {msg.role === 'model' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }} />
                ) : (
                  <p>{msg.text}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-4 py-2">
                <span className="animate-pulse">{t('thinking')}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </main>

        <footer className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('askForStudyTips')}
              className="w-full bg-transparent p-3 focus:outline-none text-gray-800 dark:text-white"
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading} className="p-3 text-indigo-500 disabled:text-gray-400">
              {ICONS.send}
            </button>
          </div>
        </footer>
      </div>
    );
  }

  // Modal mode (original behavior)
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 end-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg z-50 transition-transform hover:scale-110"
        aria-label="Open Smart Assistant"
      >
        {ICONS.ai}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-end sm:items-center p-4">
          <div className="relative w-full max-w-lg h-[80vh]">
            {/* RGB Glow Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50 blur-2xl rounded-[32px] animate-pulse"></div>
            <Card className="relative w-full h-full flex flex-col p-0">
              <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                  {ICONS.ai} <span className="ms-2">{t('smartAssistant')}</span>
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 -mr-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  aria-label="Close"
                >
                  {ICONS.close}
                </button>
              </header>

              <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-lg px-4 py-2 max-w-sm ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                      {msg.role === 'model' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }} />
                      ) : (
                        <p>{msg.text}</p>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg px-4 py-2">
                      <span className="animate-pulse">{t('thinking')}</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </main>

              <footer className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t('askForStudyTips')}
                    className="w-full bg-transparent p-3 focus:outline-none text-gray-800 dark:text-white"
                    disabled={isLoading}
                  />
                  <button onClick={handleSend} disabled={isLoading} className="p-3 text-indigo-500 disabled:text-gray-400">
                    {ICONS.send}
                  </button>
                </div>
              </footer>
            </Card>
          </div>
        </div>
      )}
    </>
  );
};

export default SmartAssistant;
