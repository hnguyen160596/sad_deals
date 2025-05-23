import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { trackClick } from './Analytics';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; sender: 'user' | 'bot'; timestamp: Date }>>([
    { text: 'Hi there! 👋 How can I help you find deals today?', sender: 'bot', timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleChat = () => {
    try {
      setIsOpen(!isOpen);
      trackClick('Chat Widget', isOpen ? 'Close' : 'Open');
      if (!isOpen) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    } catch (error) {
      console.error('Error toggling chat:', error);
      setIsOpen(!isOpen);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      // Add user message
      const userMessage = { text: inputValue, sender: 'user' as const, timestamp: new Date() };
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      trackClick('Chat Widget', 'Send Message');

      // Simulate bot response after a short delay
      setTimeout(() => {
        const botResponses = [
          "I can help you find deals! What stores are you interested in?",
          "Check out our Today's Deals page for the latest savings!",
          "Have you signed up for our newsletter? You'll get daily deals right in your inbox.",
          "Looking for a specific product? Try our search bar at the top of the page.",
          "Our most popular deals are from Amazon, Target, and Walmart right now."
        ];
        const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
        setMessages(prev => [...prev, { text: randomResponse, sender: 'bot', timestamp: new Date() }]);
      }, 1000);
    } catch (error) {
      console.error('Error handling chat submission:', error);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Time formatting helper
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[30rem]">
          <div className="bg-[#982a4a] text-white p-4 flex justify-between items-center">
            <h3 className="font-bold">Sales Aholics Deals Chat</h3>
            <button
              onClick={toggleChat}
              className="text-white hover:text-gray-200"
              aria-label="Close chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
            <div className="flex flex-col space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3/4 rounded-lg px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-[#982a4a] text-white'
                        : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <p>{message.text}</p>
                    <span className={`text-xs block mt-1 ${
                      message.sender === 'user' ? 'text-gray-200' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
            <div className="flex">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-l-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[#982a4a] focus:border-[#982a4a] dark:text-gray-200"
              />
              <button
                type="submit"
                className="bg-[#982a4a] hover:bg-[#982a4a]/90 text-white rounded-r-md px-4 py-2 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        onClick={toggleChat}
        className="bg-[#982a4a] hover:bg-[#982a4a]/90 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors"
        aria-label="Open chat"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
