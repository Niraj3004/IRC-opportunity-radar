import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setErrorMsg('Verification token is missing.');
        return;
      }

      try {
        await api.get(`/auth/verify-email/${token}`);
        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.response?.data?.error || 'Verification failed. Link may have expired.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="text-center">
      {status === 'loading' && (
        <>
          <div className="mx-auto mb-6 flex justify-center">
            <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold text-white">Verifying your email...</h2>
          <p className="text-sm text-gray-400">Please wait while we confirm your email address.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
            <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">Email Verified!</h2>
          <p className="mb-6 text-sm text-gray-400">
            Thank you for verifying your email. Your account is now fully active.
          </p>
          <Link to="/login">
            <Button variant="primary" className="w-full">Proceed to Login</Button>
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">Verification Failed</h2>
          <p className="mb-6 text-sm text-red-400">{errorMsg}</p>
          <Link to="/login">
            <Button variant="outline" className="w-full">Return to Login</Button>
          </Link>
        </>
      )}
    </div>
  );
};
