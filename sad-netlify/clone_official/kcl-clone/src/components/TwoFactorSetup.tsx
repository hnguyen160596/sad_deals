import type React from 'react';
import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

// Two-factor setup component
const TwoFactorSetup: React.FC = () => {
  const { currentUser, setupTwoFactor, verifyTwoFactorSetup, disableTwoFactor } = useUser();

  const [isSettingUp, setIsSettingUp] = useState(false);
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset states when the component mounts or when the currentUser changes
  useEffect(() => {
    setIsSettingUp(false);
    setSecret('');
    setQrCodeUrl('');
    setVerificationCode('');
    setBackupCodes([]);
    setPassword('');
    setError('');
    setSuccess('');
  }, [currentUser?.id]);

  if (!currentUser) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              You must be logged in to manage two-factor authentication.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleStartSetup = () => {
    setIsSettingUp(true);
    setError('');
    setSuccess('');

    try {
      const result = setupTwoFactor(currentUser.id);
      if (result.secret && result.qrCodeUrl) {
        setSecret(result.secret);
        setQrCodeUrl(result.qrCodeUrl);
      } else {
        setError('Failed to set up two-factor authentication. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during setup. Please try again.');
      console.error('2FA setup error:', err);
    }
  };

  const handleVerifySetup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!verificationCode.trim()) {
      setError('Please enter the verification code.');
      return;
    }

    try {
      const isVerified = verifyTwoFactorSetup(currentUser.id, verificationCode);

      if (isVerified) {
        // Get the newly generated backup codes
        const newBackupCodes = currentUser.twoFactorAuth.backupCodes || [];
        setBackupCodes(newBackupCodes);
        setSuccess('Two-factor authentication enabled successfully!');
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during verification. Please try again.');
      console.error('2FA verification error:', err);
    }
  };

  const handleDisableTwoFactor = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Please enter your password to disable two-factor authentication.');
      return;
    }

    try {
      const isDisabled = disableTwoFactor(currentUser.id, password);

      if (isDisabled) {
        setSuccess('Two-factor authentication has been disabled.');
        setPassword('');
        setIsSettingUp(false);
      } else {
        setError('Incorrect password. Two-factor authentication was not disabled.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('2FA disable error:', err);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Two-Factor Authentication</h2>

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

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <p className="text-gray-600 mb-2">
          Two-factor authentication adds an extra layer of security to your account by requiring a verification code from your mobile device in addition to your password.
        </p>

        <div className="flex items-center mt-4">
          <div className={`w-4 h-4 rounded-full ${currentUser.twoFactorAuth.enabled ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
          <span className="font-medium">
            {currentUser.twoFactorAuth.enabled
              ? 'Two-factor authentication is enabled'
              : 'Two-factor authentication is not enabled'}
          </span>
        </div>
      </div>

      {!currentUser.twoFactorAuth.enabled ? (
        <>
          {!isSettingUp ? (
            <button
              onClick={handleStartSetup}
              className="bg-[#982a4a] text-white px-4 py-2 rounded-md hover:bg-[#982a4a]/90"
            >
              Set Up Two-Factor Authentication
            </button>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-lg mb-3">Set Up Two-Factor Authentication</h3>

              <ol className="list-decimal list-inside space-y-4 mb-4">
                <li className="text-gray-700">
                  <span className="font-medium">Install an authenticator app</span>
                  <p className="ml-6 text-sm text-gray-600">
                    Download and install an authenticator app such as Google Authenticator, Authy, or Microsoft Authenticator on your mobile device.
                  </p>
                </li>

                <li className="text-gray-700">
                  <span className="font-medium">Scan the QR code</span>
                  <div className="ml-6 my-3">
                    {qrCodeUrl ? (
                      <div className="bg-white border-2 border-gray-300 inline-block p-2 rounded-lg">
                        <img src={qrCodeUrl} alt="QR Code" className="w-44 h-44" />
                      </div>
                    ) : (
                      <div className="animate-pulse bg-gray-200 w-44 h-44"></div>
                    )}
                  </div>
                  <p className="ml-6 text-sm text-gray-600">
                    Open your authenticator app and scan this QR code to add your account.
                  </p>
                </li>

                <li className="text-gray-700">
                  <span className="font-medium">Manual entry</span>
                  <div className="ml-6 mt-1 mb-2">
                    <p className="text-sm text-gray-600 mb-1">
                      If you can't scan the QR code, enter this secret key manually:
                    </p>
                    <div className="bg-gray-100 p-2 rounded font-mono text-sm break-all">
                      {secret}
                    </div>
                  </div>
                </li>

                <li className="text-gray-700">
                  <span className="font-medium">Verify setup</span>
                  <div className="ml-6 mt-2">
                    <form onSubmit={handleVerifySetup} className="space-y-3">
                      <div>
                        <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-1">
                          Enter the 6-digit code from your authenticator app
                        </label>
                        <input
                          type="text"
                          id="verification-code"
                          maxLength={6}
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a] sm:text-sm"
                          placeholder="123456"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-[#982a4a] text-white px-4 py-2 rounded-md hover:bg-[#982a4a]/90"
                      >
                        Verify and Activate
                      </button>
                    </form>
                  </div>
                </li>
              </ol>
            </div>
          )}
        </>
      ) : backupCodes.length > 0 ? (
        <div className="border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-lg mb-3">Backup Codes</h3>
          <p className="text-sm text-gray-600 mb-4">
            Save these backup codes in a secure place. Each code can be used once to access your account if you lose your phone or can't use your authenticator app.
          </p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {backupCodes.map((code, index) => (
              <div key={index} className="bg-gray-100 p-2 rounded font-mono text-sm text-center">
                {code}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setBackupCodes([])}
              className="text-[#982a4a] hover:text-[#982a4a]/80 text-sm"
            >
              I've saved these codes
            </button>
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-lg mb-3">Disable Two-Factor Authentication</h3>
          <p className="text-sm text-gray-600 mb-4">
            Disabling two-factor authentication will make your account less secure. You'll only need your password to sign in.
          </p>

          <form onSubmit={handleDisableTwoFactor} className="space-y-3">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm your password to disable two-factor authentication
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#982a4a] focus:border-[#982a4a] sm:text-sm"
                placeholder="Password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Disable Two-Factor Authentication
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default TwoFactorSetup;
