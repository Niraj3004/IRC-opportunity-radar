import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { api } from '../../lib/api';

const AVAILABLE_INTERESTS = [
  'technology', 'engineering', 'science', 'arts', 'business', 
  'healthcare', 'social-impact', 'startup', 'blockchain', 'ai'
];

export const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (interests.length === 0) {
      setError('Please select at least one interest area.');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/register', { 
        ...formData, 
        interests 
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
          <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="mb-2 text-xl font-bold text-white">Application Submitted</h2>
        <p className="mb-6 text-sm text-gray-400">
          Thanks — your account is pending approval. You'll get an email once it's approved by an administrator.
        </p>
        <Link to="/login">
          <Button variant="outline" className="w-full">Return to Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-white">Apply for Access</h2>
      
      {error && (
        <div className="mb-4 rounded-md bg-red-500/10 p-3 text-sm text-red-500 border border-red-500/20">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Jane Doe"
        />

        <Input
          label="Email Address"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="you@example.com"
        />
        
        <Input
          label="Password"
          type="password"
          required
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          placeholder="••••••••"
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-300">Areas of Interest</label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_INTERESTS.map(interest => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors border ${
                  interests.includes(interest)
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-surface border-gray-700 text-gray-400 hover:text-gray-300'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full mt-4" isLoading={isLoading}>
          Submit Application
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:underline font-medium">
          Log in
        </Link>
      </div>
    </div>
  );
};
