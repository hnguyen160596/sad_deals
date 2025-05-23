import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { trackFormSubmit } from './Analytics';

const EmailSignupSection: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setErrorMessage('');

    // Validate email
    if (!validateEmail(email)) {
      setErrorMessage(t('emailSignup.invalidEmail', 'Please enter a valid email address.'));
      return;
    }

    // Set submitting state
    setStatus('submitting');

    try {
      // In a real app, you would send the email to your backend
      // This is a mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Track the form submission
      trackFormSubmit('email_signup', { email });

      // Success state
      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error('Error submitting email:', error);
      setStatus('error');
      setErrorMessage(t('emailSignup.failedSubscribe', 'Failed to subscribe. Please try again.'));
    }
  };

  return (
    <section className="py-12 md:py-16 bg-gradient-to-r from-[#982a4a] to-[#e33d6f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-xl">
          <div className="absolute inset-0 bg-yellow-50 mix-blend-multiply opacity-30" />

          <div className="relative">
            <div className="flex flex-col md:flex-row items-center">
              {/* Image section */}
              <div className="md:w-1/3 mb-6 md:mb-0 flex justify-center">
                <img
                  src="/images/app-promo.png"
                  alt={t('emailSignup.emailCtaGraphic', 'Email CTA Graphic')}
                  className="h-auto max-h-64 w-auto max-w-full rounded-lg shadow-md"
                  loading="lazy"
                  width="300"
                  height="300"
                />
              </div>

              {/* Content section */}
              <div className="md:w-2/3 md:pl-8">
                {status === 'success' ? (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('emailSignup.thankYou', 'Thank you!')}</h3>
                    <p className="text-gray-600 max-w-lg mx-auto">
                      {t('emailSignup.allSet', 'You’re all set to receive our best deals!')}
                    </p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                      {t('emailSignup.wantCheapEats', 'Want cheap eats 365 days a year?')}
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">
                      {t('emailSignup.getCalendar', 'Get our free food calendar and daily deals now!')}
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                      <div className="flex-grow relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t('emailSignup.enterEmail', 'Enter your email')}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#982a4a] focus:outline-none transition-colors"
                          disabled={status === 'submitting'}
                          aria-label={t('emailSignup.enterEmail', 'Enter your email')}
                          required
                        />
                        {errorMessage && (
                          <p className="absolute text-sm text-red-600 mt-1">{errorMessage}</p>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="px-6 py-3 bg-[#982a4a] text-white font-medium rounded-lg hover:bg-[#982a4a]/90 focus:ring-2 focus:ring-[#982a4a] focus:outline-none transition-colors shadow-md disabled:opacity-70"
                      >
                        {status === 'submitting'
                          ? t('emailSignup.subscribing', 'Subscribing...')
                          : t('emailSignup.submit', 'Submit')}
                      </button>
                    </form>

                    <p className="text-xs text-gray-500 mt-4">
                      {t('emailSignup.privacyNotice', 'Will be used in accordance with our')}{' '}
                      <a href="/privacy-policy" className="text-[#982a4a] hover:underline">
                        {t('emailSignup.privacyPolicy', 'Privacy Policy')}
                      </a>.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmailSignupSection;
