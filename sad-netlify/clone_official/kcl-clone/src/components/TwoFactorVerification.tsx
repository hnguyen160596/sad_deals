import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';

interface TwoFactorVerificationProps {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({
  userId,
  onSuccess,
  onCancel
}) => {
  const { verifyTwoFactorCode, users } = useUser();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isUsingBackupCode, setIsUsingBackupCode] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  // Get user info for display
  const user = users.find(u => u.id === userId);

  // Create refs for the 6 input fields
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Try to handle verification on code change if it's 6 digits long
  useEffect(() => {
    if (code.length === 6 && !isUsingBackupCode) {
      handleVerify();
    }
  }, [code]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, []);

  const handleVerify = () => {
    setError('');
    if (!code.trim()) {
      setError('Please enter the verification code.');
      return;
    }

    try {
      const verified = verifyTwoFactorCode(userId, code);
      if (verified) {
        onSuccess();
      } else {
        setError('Invalid verification code. Please try again.');
        setCode('');

        // Focus back on first input
        if (inputRefs[0].current) {
          inputRefs[0].current.focus();
        }
      }
    } catch (err) {
      setError('An error occurred during verification. Please try again.');
      console.error('2FA verification error:', err);
    }
  };

  // Handle input change for the code fields
  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Paste handling
      const pastedValue = value.slice(0, 6);
      setCode(pastedValue);

      // Try to distribute the pasted chars to the inputs
      const chars = pastedValue.split('');
      chars.forEach((char, i) => {
        if (i < inputRefs.length && inputRefs[i].current) {
          inputRefs[i].current!.value = char;
        }
      });

      // Focus the appropriate field
      if (pastedValue.length === 6) {
        inputRefs[5].current?.focus();
      } else if (pastedValue.length < 6 && inputRefs[pastedValue.length]) {
        inputRefs[pastedValue.length].current?.focus();
      }
    } else {
      // Normal typing - update the current digit
      const newCode = code.split('');
      newCode[index] = value;
      setCode(newCode.join(''));

      // Auto-focus next input if value is entered
      if (value && index < 5 && inputRefs[index + 1]?.current) {
        inputRefs[index + 1].current!.focus();
      }
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0 && inputRefs[index - 1]?.current) {
      // If current field is empty and backspace is pressed, focus the previous field
      inputRefs[index - 1].current!.focus();
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="h-12 w-12 rounded-full bg-[#982a4a] text-white inline-flex items-center justify-center mx-auto mb-3">
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold mb-1">Two-Factor Authentication</h2>
        <p className="text-gray-600">
          For additional security, please enter the 6-digit code from your authenticator app.
        </p>
        {user && (
          <div className="mt-2 text-sm text-gray-500">
            Logging in as <span className="font-medium">{user.displayName}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {isUsingBackupCode ? (
        <div className="mb-6">
          <label htmlFor="backup-code" className="block text-sm font-medium text-gray-700 mb-1">
            Backup Code
          </label>
          <input
            type="text"
            id="backup-code"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a] sm:text-sm"
            placeholder="Enter your backup code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoFocus
          />
        </div>
      ) : (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Verification Code
          </label>
          <div
            className={`flex justify-between mb-3 p-1 border rounded-md ${
              inputFocused ? 'border-[#982a4a] ring-1 ring-[#982a4a]' : 'border-gray-300'
            }`}
          >
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <input
                key={i}
                ref={inputRefs[i]}
                type="text"
                maxLength={1}
                className="w-10 h-12 text-center text-lg font-semibold border-0 focus:outline-none focus:ring-0"
                value={code[i] || ''}
                onChange={(e) => handleInputChange(i, e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
              />
            ))}
          </div>
        </div>
      )}

      {isUsingBackupCode ? (
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleVerify}
            className="w-full bg-[#982a4a] text-white px-4 py-2 rounded-md hover:bg-[#982a4a]/90"
          >
            Verify
          </button>
          <button
            onClick={() => {
              setIsUsingBackupCode(false);
              setCode('');
              setError('');
            }}
            className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200"
          >
            Use verification code instead
          </button>
        </div>
      ) : (
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleVerify}
            className="w-full bg-[#982a4a] text-white px-4 py-2 rounded-md hover:bg-[#982a4a]/90"
            disabled={code.length !== 6}
          >
            Verify
          </button>
          <button
            onClick={() => {
              setIsUsingBackupCode(true);
              setCode('');
              setError('');
            }}
            className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200"
          >
            Use backup code
          </button>
        </div>
      )}

      <div className="mt-4 flex justify-between">
        <button
          onClick={onCancel}
          className="text-gray-500 text-sm hover:text-gray-700"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default TwoFactorVerification;
