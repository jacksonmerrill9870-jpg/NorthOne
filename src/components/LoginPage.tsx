"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './LoginPage.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useBank } from '@/app/context/BankContext';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Mail,
  ArrowLeft,
  ShieldCheck,
  Check,
  AlertCircle,
  Globe
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const bank = useBank();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const clearForm = () => {
    setEmail(''); setPassword(''); setFullName(''); setConfirmPassword(''); setCountry('');
    setShowPassword(false); setShowConfirmPassword(false);
    setError(''); setAgreeTerms(false);
  };

  const switchMode = (newMode: 'login' | 'signup' | 'forgot') => {
    clearForm();
    setMode(newMode);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) { setError('Please enter your email and password.'); return; }
    
    setIsLoading(true);
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password
    });

    setIsLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }
    
    if (data.user) {
      onLoginSuccess();
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!country) { setError('Please select your country.'); return; }
    if (!password.trim()) { setError('Please create a password.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (!agreeTerms) { setError('Please agree to the Terms & Conditions.'); return; }

    setIsLoading(true);
    const { data, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password: password,
      options: {
        data: {
          full_name: fullName,
          country: country
        }
      }
    });

    setIsLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    if (data.user) {
      alert("Registration successful! Please check your email for verification (if enabled) or log in.");
      switchMode('login');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (!password.trim()) { setError('Please enter a new password.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), newPassword: password }),
      });

      const result = await response.json();
      setIsLoading(false);

      if (response.ok) {
        alert("Password updated successfully! You can now log in with your new password.");
        switchMode('login');
      } else {
        setError(result.error || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      setIsLoading(false);
      setError("An error occurred. Please try again.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.08 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.4, ease: "easeInOut" } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const formTransition = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
    transition: { duration: 0.35, ease: "easeInOut" as const }
  };

  const renderFormHeader = () => (
    <>
      <motion.div className={styles.logoArea} variants={itemVariants}>
        <motion.div className={styles.logoCircle}
          animate={{ boxShadow: ["0 8px 32px rgba(92,184,92,0.25)","0 8px 48px rgba(92,184,92,0.45)","0 8px 32px rgba(92,184,92,0.25)"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image src="/northone_logo.svg" alt="NorthOne Logo" width={50} height={50} className={styles.logoImage} priority />
        </motion.div>
        <motion.span className={styles.brandName} variants={itemVariants}>NorthOne</motion.span>
        <motion.span className={styles.brandTagline} variants={itemVariants}>Business Banking, Simplified</motion.span>
      </motion.div>
      <motion.div className={styles.formHeader} variants={itemVariants}>
        <h2 className={styles.formTitle}>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
        <p className={styles.formSubtitle}>{mode === 'login' ? 'Sign in to your account to continue' : 'Open your free business account today'}</p>
      </motion.div>
    </>
  );

  const renderError = () => (
    <AnimatePresence>
      {error && (
        <motion.div className={styles.errorMessage}
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
        >
          <AlertCircle size={16} />{error}
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderLoginForm = () => (
    <motion.div key="login" {...formTransition}>
      <form className={styles.loginForm} onSubmit={handleLogin}>
        {renderError()}
        <div className={styles.inputGroup}>
          <div className={styles.inputIcon}><User size={18} /></div>
          <input id="login-email" type="email" className={styles.inputField} placeholder="Email address"
            value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} autoComplete="email" />
        </div>
        <div className={styles.inputGroup}>
          <div className={styles.inputIcon}><Lock size={18} /></div>
          <input id="login-password" type={showPassword ? 'text' : 'password'} className={styles.inputField}
            placeholder="Password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} autoComplete="current-password" />
          <button type="button" className={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className={styles.formOptions}>
          <div className={styles.rememberMe} onClick={() => setRememberMe(!rememberMe)} role="checkbox" aria-checked={rememberMe} tabIndex={0}>
            <div className={`${styles.checkbox} ${rememberMe ? styles.checkboxChecked : ''}`}>
              {rememberMe && <Check size={12} color="#fff" strokeWidth={3} />}
            </div>
            <span className={styles.rememberLabel}>Remember me</span>
          </div>
          <button type="button" className={styles.forgotLink} onClick={() => switchMode('forgot')}>Forgot password?</button>
        </div>
        <motion.button type="submit" className={styles.loginButton} disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          {isLoading ? <span className={styles.spinner} /> : <>Sign In<span className={styles.buttonShimmer} /></>}
        </motion.button>
        <div className={styles.divider}><div className={styles.dividerLine} /><span className={styles.dividerText}>or</span><div className={styles.dividerLine} /></div>
        <motion.button type="button" className={styles.createAccountButton} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => switchMode('signup')}>
          <UserPlus size={18} />Create New Account
        </motion.button>
      </form>
    </motion.div>
  );

  const renderForgotForm = () => (
    <motion.div key="forgot" {...formTransition}>
      <form className={styles.loginForm} onSubmit={handleResetPassword}>
        <div className={styles.backToLoginArea}>
          <button type="button" className={styles.backLink} onClick={() => switchMode('login')}>
            <ArrowLeft size={16} /> Back to Sign In
          </button>
        </div>
        <h2 className={styles.formTitle} style={{ marginTop: '10px' }}>Reset Password</h2>
        <p className={styles.formSubtitle}>Enter your email and a new password below</p>
        
        {renderError()}
        
        <div className={styles.inputGroup}>
          <div className={styles.inputIcon}><Mail size={18} /></div>
          <input id="reset-email" type="email" className={styles.inputField} placeholder="Account Email"
            value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} autoComplete="email" />
        </div>
        
        <div className={styles.inputGroup}>
          <div className={styles.inputIcon}><Lock size={18} /></div>
          <input id="reset-password" type={showPassword ? 'text' : 'password'} className={styles.inputField}
            placeholder="New Password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} />
          <button type="button" className={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className={styles.inputGroup}>
          <div className={styles.inputIcon}><Lock size={18} /></div>
          <input id="reset-confirm" type={showConfirmPassword ? 'text' : 'password'} className={styles.inputField}
            placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }} />
          <button type="button" className={styles.passwordToggle} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <motion.button type="submit" className={styles.loginButton} disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          {isLoading ? <span className={styles.spinner} /> : <>Reset Password<span className={styles.buttonShimmer} /></>}
        </motion.button>
      </form>
    </motion.div>
  );

  const renderSignupForm = () => (
    <motion.div key="signup" {...formTransition}>
      <form className={styles.loginForm} onSubmit={handleSignup}>
        {renderError()}
        <div className={styles.inputGroup}>
          <div className={styles.inputIcon}><User size={18} /></div>
          <input id="signup-name" type="text" className={styles.inputField} placeholder="Full name"
            value={fullName} onChange={(e) => { setFullName(e.target.value); setError(''); }} autoComplete="name" />
        </div>
        <div className={styles.inputGroup}>
          <div className={styles.inputIcon}><Mail size={18} /></div>
          <input id="signup-email" type="email" className={styles.inputField} placeholder="Email address"
            value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} autoComplete="email" />
        </div>
        <div className={styles.inputGroup}>
          <div className={styles.inputIcon}><Globe size={18} /></div>
          <select 
            id="signup-country" 
            className={`${styles.inputField} ${styles.selectField} ${!country ? styles.selectPlaceholder : ''}`}
            value={country} 
            onChange={(e) => { setCountry(e.target.value); setError(''); }}
          >
            <option value="" disabled hidden>Select your country</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="UK">United Kingdom</option>
            <option value="AU">Australia</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className={styles.inputGroup}>
          <div className={styles.inputIcon}><Lock size={18} /></div>
          <input id="signup-password" type={showPassword ? 'text' : 'password'} className={styles.inputField}
            placeholder="Create password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} autoComplete="new-password" />
          <button type="button" className={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className={styles.inputGroup}>
          <div className={styles.inputIcon}><Lock size={18} /></div>
          <input id="signup-confirm" type={showConfirmPassword ? 'text' : 'password'} className={styles.inputField}
            placeholder="Confirm password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }} autoComplete="new-password" />
          <button type="button" className={styles.passwordToggle} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <div className={styles.formOptions}>
          <div className={styles.rememberMe} onClick={() => setAgreeTerms(!agreeTerms)} role="checkbox" aria-checked={agreeTerms} tabIndex={0}>
            <div className={`${styles.checkbox} ${agreeTerms ? styles.checkboxChecked : ''}`}>
              {agreeTerms && <Check size={12} color="#fff" strokeWidth={3} />}
            </div>
            <span className={styles.rememberLabel}>
              I agree to the <Link href="/terms" className={styles.termsLink} onClick={(e) => e.stopPropagation()}>Terms & Conditions</Link>
            </span>
          </div>
        </div>
        <motion.button type="submit" className={styles.loginButton} disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          {isLoading ? <span className={styles.spinner} /> : <>Create Account<span className={styles.buttonShimmer} /></>}
        </motion.button>
        <div className={styles.divider}><div className={styles.dividerLine} /><span className={styles.dividerText}>or</span><div className={styles.dividerLine} /></div>
        <motion.button type="button" className={styles.createAccountButton} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => switchMode('login')}>
          <ArrowLeft size={18} />Back to Sign In
        </motion.button>
      </form>
    </motion.div>
  );

  return (
    <motion.div className={styles.loginWrapper} initial="hidden" animate="visible" exit="exit" variants={containerVariants}>
      <motion.div className={styles.splitContainer} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>

        {/* LEFT: Hero Panel */}
        <motion.div className={styles.heroPanel} initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}>
          <div className={styles.heroContent}>
            <motion.div className={styles.heroLogoCircle}
              animate={{ boxShadow: ["0 8px 40px rgba(255,255,255,0.15)","0 8px 60px rgba(255,255,255,0.3)","0 8px 40px rgba(255,255,255,0.15)"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
              <Image src="/northone_logo.svg" alt="NorthOne Logo" width={70} height={70} className={styles.heroLogoImage} priority />
            </motion.div>
            <motion.h1 className={styles.heroBrandName} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}>NorthOne</motion.h1>
            <motion.p className={styles.heroTagline} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}>Business Banking, Simplified</motion.p>
            <motion.div className={styles.heroFeatures} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }}>
              {["Free business checking account","No minimum balance required","Send & receive payments instantly","FDIC insured up to $250,000"].map((f, i) => (
                <motion.div key={i} className={styles.heroFeatureItem} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.1, duration: 0.5 }}>
                  <div className={styles.heroCheckmark}><Check size={14} strokeWidth={3} /></div><span>{f}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
          <motion.div className={styles.heroFooter} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.6 }}>
            <ShieldCheck size={14} /><span>Bank-level security · FDIC insured</span>
          </motion.div>
        </motion.div>

        {/* RIGHT: Form Panel */}
        <motion.div className={styles.loginCard} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>
          {renderFormHeader()}
          <AnimatePresence mode="wait">
            {mode === 'login' ? renderLoginForm() : (mode === 'signup' ? renderSignupForm() : renderForgotForm())}
          </AnimatePresence>
          <motion.div className={styles.securityBadge} variants={itemVariants}>
            <ShieldCheck size={14} /><span>256-bit SSL Encrypted</span>
          </motion.div>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}
