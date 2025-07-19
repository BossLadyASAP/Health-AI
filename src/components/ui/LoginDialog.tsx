import React, { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'reset';

export function LoginDialog() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setShowPassword(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    const { error, user } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Login successful', description: `Welcome back!` });
      setOpen(false);
      resetForm();
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: 'Signup failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Signup successful', description: 'Please check your email to confirm your account.' });
      setOpen(false);
      resetForm();
    }
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) {
      toast({ title: 'Password reset failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Password reset email sent', description: 'Check your email for instructions.' });
      setOpen(false);
      resetForm();
    }
  };

  const handleGoogleOAuth = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    setLoading(false);
    if (error) {
      toast({ title: 'Google sign-in failed', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Login</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="mb-2 text-center text-2xl font-semibold">
          {mode === 'login' && 'Login'}
          {mode === 'signup' && 'Sign Up'}
          {mode === 'reset' && 'Reset Password'}
        </DialogTitle>
        <DialogDescription className="mb-4 text-center text-sm text-muted-foreground">
          {mode === 'login' && 'Welcome back! Please login to your account.'}
          {mode === 'signup' && 'Create a new account.'}
          {mode === 'reset' && 'Enter your email to reset your password.'}
        </DialogDescription>

        <form
          onSubmit={e => {
            e.preventDefault();
            if (mode === 'login') handleLogin();
            else if (mode === 'signup') handleSignup();
            else if (mode === 'reset') handlePasswordReset();
          }}
          className="space-y-4"
        >
          {(mode === 'signup') && (
            <>
              <Input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
              />
              <Input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
              />
            </>
          )}
          {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          )}
          {(mode === 'login' || mode === 'signup') && (
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {mode === 'login' && 'Login'}
            {mode === 'signup' && 'Sign Up'}
            {mode === 'reset' && 'Send Reset Email'}
          </Button>
        </form>

        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={handleGoogleOAuth}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Google size={18} />
            Continue with Google
          </Button>
        </div>

        <div className="mt-4 flex justify-center gap-4 text-sm text-muted-foreground">
          {mode !== 'login' && (
            <button
              onClick={() => setMode('login')}
              className="underline hover:text-primary"
              type="button"
            >
              Back to Login
            </button>
          )}
          {mode !== 'signup' && (
            <button
              onClick={() => setMode('signup')}
              className="underline hover:text-primary"
              type="button"
            >
              Create Account
            </button>
          )}
          {mode !== 'reset' && (
            <button
              onClick={() => setMode('reset')}
              className="underline hover:text-primary"
              type="button"
            >
              Forgot Password?
            </button>
          )}
        </div>

        <DialogClose asChild>
          <button
            aria-label="Close"
            className="absolute right-2 top-2 rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            ×
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
