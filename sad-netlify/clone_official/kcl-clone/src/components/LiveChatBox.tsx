import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { trackClick } from './Analytics';
import { getErrorTracking, withErrorBoundary } from '../utils/errorTracking';
import { optimizeAvatarImage } from '../utils/cloudinary';

// Message types
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'system' | 'admin' | 'other';
  userId?: string;
  username?: string;
  timestamp: Date;
  status?: 'pending' | 'approved' | 'rejected';
  media?: {
    type: 'image' | 'link';
    url: string;
    previewUrl?: string;
  };
  isSubscriberOnly?: boolean;
}

// Subscription plans
interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  features: string[];
  isPopular?: boolean;
}

// Demo subscription plans
const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic Chat',
    price: 'Free',
    features: [
      'View all public messages',
      'Post 5 messages per day',
      'Standard response time'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Access',
    price: '$4.99/mo',
    features: [
      'All Basic features',
      'Unlimited messages',
      'Access to exclusive deals',
      'Priority response time'
    ],
    isPopular: true
  },
  {
    id: 'pro',
    name: 'Pro Deals Hunter',
    price: '$9.99/mo',
    features: [
      'All Premium features',
      'Early access to flash deals',
      'Direct chat with admins',
      'Custom deal alerts'
    ]
  }
];

// Demo messages
const initialMessages: Message[] = [
  {
    id: 'welcome',
    text: 'Welcome to Sales Aholics Deals live chat! Join the community discussion to discover the best deals.',
    sender: 'system',
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    id: 'admin-1',
    text: 'Hey deal hunters! Today we have some amazing offers on electronics. Check out our Today\'s Deals page.',
    sender: 'admin',
    userId: 'admin-1',
    username: 'DealsModerator',
    timestamp: new Date(Date.now() - 2700000)
  },
  {
    id: 'user-1',
    text: 'Has anyone seen a good deal on the new AirPods Pro?',
    sender: 'other',
    userId: 'user-123',
    username: 'DealFinder22',
    timestamp: new Date(Date.now() - 1800000)
  },
  {
    id: 'user-2',
    text: 'Just found them on Amazon for $189! Limited time offer.',
    sender: 'other',
    userId: 'user-456',
    username: 'SavingsQueen',
    timestamp: new Date(Date.now() - 1500000)
  },
  {
    id: 'admin-2',
    media: {
      type: 'image',
      url: 'https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg',
      previewUrl: 'https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg'
    },
    text: 'Here\'s the Amazon AirPods Pro deal! Act fast, it\'s a limited time offer!',
    sender: 'admin',
    userId: 'admin-2',
    username: 'DealsExpert',
    timestamp: new Date(Date.now() - 1200000)
  },
  {
    id: 'premium-1',
    text: 'EXCLUSIVE DEAL: Get an additional 10% off using code PREMIUM10 at checkout!',
    sender: 'admin',
    userId: 'admin-1',
    username: 'DealsModerator',
    timestamp: new Date(Date.now() - 900000),
    isSubscriberOnly: true
  }
];

// Fallback component to render when LiveChatBox encounters an error
const LiveChatBoxErrorFallback: React.FC = () => (
  <div className="fixed bottom-0 right-4 z-50 w-64 h-14">
    <div className="flex flex-col h-full rounded-t-lg shadow-xl overflow-hidden">
      <div className="bg-[#982a4a] text-white p-3 flex items-center justify-between">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
          </svg>
          <span className="font-bold">Live Deals Chat</span>
          <button
            onClick={() => window.location.reload()}
            className="ml-3 p-1 rounded hover:bg-[#982a4a]/80"
            aria-label="Reload chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Component for handling media previews
const MediaPreview: React.FC<{ media: Message['media'] }> = ({ media }) => {
  const errorTracking = getErrorTracking();

  if (!media) return null;

  try {
    if (media.type === 'image') {
      // Use Cloudinary for image optimization
      const optimizedUrl = optimizeAvatarImage(media.previewUrl || media.url, {
        width: 300,
        height: 200,
        crop: 'fill',
        gravity: 'auto'
      });

      return (
        <div className="mt-1 rounded-md overflow-hidden max-w-xs">
          <img
            src={optimizedUrl}
            alt="Shared media"
            className="max-w-full h-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/200x150?text=Image+Unavailable';
              errorTracking.captureWarning('Image failed to load in LiveChatBox', {
                component: 'MediaPreview',
                originalUrl: media.url,
                optimizedUrl
              });
            }}
            loading="lazy"
          />
        </div>
      );
    }

    if (media.type === 'link') {
      return (
        <a
          href={media.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block text-blue-600 underline break-all"
        >
          {media.url}
        </a>
      );
    }
  } catch (err) {
    errorTracking.captureError(err instanceof Error ? err : new Error('MediaPreview rendering error'), {
      component: 'MediaPreview',
      mediaType: media.type,
      url: media.url
    });

    // Fallback to simple text link if rendering fails
    return (
      <div className="mt-1 text-sm text-gray-500">
        [Media attachment - {media.type}]
      </div>
    );
  }

  return null;
};

const LiveChatBoxComponent: React.FC = () => {
  const { user, isAuthenticated } = useUser();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAdmin] = useState(() => user?.isAdmin || false);
  const [isPremium] = useState(() => user?.email === 'admin@salesaholicsdeals.com');
  const [processingMessage, setProcessingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const errorTracking = getErrorTracking();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    try {
      if (messagesEndRef.current && isExpanded) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      errorTracking.captureWarning('Failed to scroll to bottom in LiveChatBox', {
        component: 'LiveChatBox',
        method: 'useEffect[scrollToBottom]'
      });
    }
  }, [messages, isExpanded, errorTracking]);

  // Time formatting helper
  const formatTime = (date: Date) => {
    try {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (err) {
      errorTracking.captureWarning('Error formatting time in LiveChatBox', {
        component: 'LiveChatBox',
        method: 'formatTime'
      });
      return '--:--'; // Fallback time format
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && !uploadedImage) return;

    // Require login to post
    if (!isAuthenticated) {
      setShowSubscriptionModal(true);
      return;
    }

    // Prevent multiple rapid submissions
    if (processingMessage) return;

    try {
      setProcessingMessage(true);

      // For demo, we'll add message directly
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        text: inputValue,
        sender: isAdmin ? 'admin' : 'user',
        userId: user?.id,
        username: user?.displayName,
        timestamp: new Date(),
        status: isAdmin ? 'approved' : 'pending'
      };

      // Add image if available
      if (uploadedImage) {
        newMessage.media = {
          type: 'image',
          url: uploadedImage
        };
      }

      setMessages(prevMessages => [...prevMessages, newMessage]);
      setInputValue('');
      setUploadedImage(null);

      // Track the event
      trackClick('LiveChat', 'MessageSent');

      // Simulate admin or system response
      if (Math.random() > 0.7) {
        setTimeout(() => {
          try {
            const systemResponses = [
              'Thanks for sharing! Our community appreciates your input.',
              'Great find! Anyone else found similar deals?',
              'Remember to check our Deals page for more offers like this!',
              'Pro tip: Set deal alerts in your profile to never miss offers like this.'
            ];

            setMessages(prevMessages => [
              ...prevMessages,
              {
                id: `system-${Date.now()}`,
                text: systemResponses[Math.floor(Math.random() * systemResponses.length)],
                sender: 'system',
                timestamp: new Date()
              }
            ]);
          } catch (err) {
            errorTracking.captureWarning('Failed to generate system response', {
              component: 'LiveChatBox',
              method: 'handleSubmit.systemResponse'
            });
          } finally {
            setProcessingMessage(false);
          }
        }, 2000);
      } else {
        setProcessingMessage(false);
      }
    } catch (error) {
      errorTracking.captureError(error instanceof Error ? error : new Error('Error sending message in LiveChatBox'), {
        component: 'LiveChatBox',
        method: 'handleSubmit',
        inputLength: inputValue.length,
        hasImage: !!uploadedImage
      });
      console.error('Error sending message:', error);

      // Reset processing state
      setProcessingMessage(false);

      // Show an error message to the user
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: `error-${Date.now()}`,
          text: "Sorry, we couldn't send your message. Please try again.",
          sender: 'system',
          timestamp: new Date()
        }
      ]);
    }
  };

  const handleUploadClick = () => {
    try {
      fileInputRef.current?.click();
    } catch (err) {
      errorTracking.captureWarning('Failed to trigger file upload', {
        component: 'LiveChatBox',
        method: 'handleUploadClick'
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large. Maximum size is 5MB.');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Only image files are supported.');
        return;
      }

      // In a real app, we would upload to a server
      // Here we just create a local object URL
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);

      trackClick('LiveChat', 'ImageUploaded');
    } catch (err) {
      errorTracking.captureError(err instanceof Error ? err : new Error('Error handling file upload'), {
        component: 'LiveChatBox',
        method: 'handleFileChange'
      });
      console.error('Error handling file upload:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      // Reset the input value to allow uploading the same file again
      if (e.target) e.target.value = '';
    }
  };

  const toggleExpand = () => {
    try {
      setIsExpanded(!isExpanded);
      trackClick('LiveChat', isExpanded ? 'Collapse' : 'Expand');
    } catch (err) {
      errorTracking.captureWarning('Error toggling chat expand state', {
        component: 'LiveChatBox',
        method: 'toggleExpand'
      });
      // Still try to toggle state even if tracking fails
      setIsExpanded(!isExpanded);
    }
  };

  // Used to check if user can see subscriber-only messages
  const canViewSubscriberContent = isAdmin || isPremium;

  return (
    <>
      <div className={`fixed bottom-0 right-4 z-50 transition-all duration-300 transform ${isExpanded ? 'h-[30rem] w-96' : 'h-14 w-64'}`}>
        <div className="flex flex-col h-full rounded-t-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div
            className="bg-[#982a4a] text-white p-3 flex items-center justify-between cursor-pointer"
            onClick={toggleExpand}
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
              </svg>
              <span className="font-bold">Live Deals Chat</span>
              {!isExpanded && (
                <span className="ml-2 bg-green-500 rounded-full w-2 h-2 animate-pulse"></span>
              )}
            </div>
            <button className="text-white focus:outline-none">
              <svg className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Chat Content - only visible when expanded */}
          {isExpanded && (
            <>
              {/* Messages area */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {/* Community guidelines banner */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
                  <p className="text-xs text-blue-700">
                    Welcome to our community chat! Please keep conversations respectful and on-topic.
                    All messages are moderated.
                  </p>
                </div>

                <div className="space-y-4">
                  {messages.map((message) => (
                    // Skip subscriber-only messages for non-premium users
                    (message.isSubscriberOnly && !canViewSubscriberContent) ? null : (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' && message.userId === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs rounded-lg px-4 py-2 ${
                            message.sender === 'system'
                              ? 'bg-gray-200 text-gray-800'
                              : message.sender === 'admin'
                                ? 'bg-[#982a4a] text-white'
                                : message.sender === 'user' && message.userId === user?.id
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-gray-200 text-gray-800'
                          } ${message.isSubscriberOnly ? 'border-2 border-yellow-400' : ''}`}
                        >
                          {/* Username display */}
                          {message.sender !== 'system' && message.username && (
                            <div className={`text-xs mb-1 font-bold ${
                              message.sender === 'admin'
                                ? 'text-white'
                                : message.sender === 'user' && message.userId === user?.id
                                  ? 'text-white'
                                  : 'text-gray-600'
                            }`}>
                              {message.sender === 'admin' && (
                                <span className="bg-yellow-400 text-black text-xs px-1 rounded mr-1">MOD</span>
                              )}
                              {message.username}
                              {message.isSubscriberOnly && (
                                <span className="ml-1 bg-yellow-400 text-black text-xs px-1 rounded">PRO</span>
                              )}
                            </div>
                          )}

                          {/* Message text */}
                          <p className="whitespace-pre-wrap break-words">{message.text}</p>

                          {/* Media content */}
                          {message.media && <MediaPreview media={message.media} />}

                          {/* Timestamp */}
                          <span className={`text-xs block mt-1 ${
                            message.sender === 'system'
                              ? 'text-gray-500'
                              : message.sender === 'admin'
                                ? 'text-gray-200'
                                : message.sender === 'user' && message.userId === user?.id
                                  ? 'text-gray-200'
                                  : 'text-gray-500'
                          }`}>
                            {formatTime(message.timestamp)}
                          </span>

                          {/* Message status for user's own messages */}
                          {message.sender === 'user' && message.userId === user?.id && message.status === 'pending' && (
                            <span className="text-xs text-gray-200 block">Pending review</span>
                          )}
                        </div>
                      </div>
                    )
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input area */}
              <form onSubmit={handleSubmit} className="bg-white border-t p-3">
                {/* Preview of uploaded image */}
                {uploadedImage && (
                  <div className="relative mb-2">
                    <img
                      src={uploadedImage}
                      alt="Upload preview"
                      className="h-20 rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => setUploadedImage(null)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}

                {!isAuthenticated ? (
                  // Login prompt for unauthenticated users
                  <div className="bg-gray-100 rounded p-3 text-center">
                    <p className="text-gray-700 mb-2">Sign in to join the conversation</p>
                    <div className="flex justify-center space-x-2">
                      <Link to="/login" className="text-sm px-3 py-1 bg-[#982a4a] text-white rounded hover:bg-[#982a4a]/90">
                        Sign In
                      </Link>
                      <Link to="/signup" className="text-sm px-3 py-1 bg-white border border-[#982a4a] text-[#982a4a] rounded hover:bg-gray-50">
                        Sign Up
                      </Link>
                    </div>
                  </div>
                ) : (
                  // Input field for authenticated users
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="p-2 rounded-full text-gray-500 hover:text-[#982a4a]"
                      onClick={handleUploadClick}
                      disabled={processingMessage}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={processingMessage}
                      />
                    </button>
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={isPremium ? "Post a message (Premium member)" : "Type your message..."}
                      className="flex-1 border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#982a4a] focus:border-[#982a4a]"
                      disabled={processingMessage}
                    />
                    <button
                      type="submit"
                      className={`${processingMessage ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#982a4a] hover:bg-[#982a4a]/90 cursor-pointer'} text-white rounded-r-md px-4 py-2 transition-colors`}
                      disabled={processingMessage}
                    >
                      {processingMessage ? (
                        <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}

                {/* Admin controls */}
                {isAdmin && (
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">Admin Mode</span>
                    <span className="mx-2">•</span>
                    <span>Messages post instantly</span>
                  </div>
                )}
              </form>
            </>
          )}
        </div>
      </div>

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Upgrade Your Chat Experience</h2>
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 mb-8">
                Join our community to participate in live discussions, receive exclusive deals, and connect with fellow deal hunters!
              </p>

              {/* Subscription plans */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {subscriptionPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`border rounded-lg overflow-hidden ${
                      plan.isPopular ? 'border-[#982a4a] shadow-md relative' : 'border-gray-200'
                    }`}
                  >
                    {plan.isPopular && (
                      <div className="bg-[#982a4a] text-white text-xs uppercase font-bold py-1 text-center">
                        Most Popular
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                      <p className="text-2xl font-bold mb-4">{plan.price}</p>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        to={plan.id === 'basic' ? "/signup" : "/signup?plan=" + plan.id}
                        className={`block w-full py-2 px-4 text-center rounded font-medium ${
                          plan.isPopular
                            ? 'bg-[#982a4a] hover:bg-[#982a4a]/90 text-white'
                            : 'bg-white border border-[#982a4a] text-[#982a4a] hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          trackClick('LiveChat', `SubscriptionSelected_${plan.id}`);
                          setShowSubscriptionModal(false);
                        }}
                      >
                        {plan.id === 'basic' ? 'Sign Up Free' : 'Choose Plan'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 text-center">
                Already have an account? <Link to="/login" className="text-[#982a4a] underline">Sign in</Link> to access your benefits.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Wrap component with error boundary
const LiveChatBox = withErrorBoundary(LiveChatBoxComponent, <LiveChatBoxErrorFallback />);
export default LiveChatBox;
