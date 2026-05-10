import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, UploadCloud, CheckCircle, X } from 'lucide-react';
import { useBank } from '@/app/context/BankContext';
import styles from './VerificationModal.module.css';

interface VerificationModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function VerificationModal({ isOpen, onComplete }: VerificationModalProps) {
  const bank = useBank();
  const user = bank.activeUser;
  
  const [fullName, setFullName] = useState(user?.profileName || '');
  const [email, setEmail] = useState(user?.username || '');
  const [ssn, setSsn] = useState('');
  
  const [frontUploaded, setFrontUploaded] = useState(false);
  const [backUploaded, setBackUploaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;
    if (user?.country === 'US' && !ssn) return;
    if (!frontUploaded || !backUploaded) return;

    setIsSubmitting(true);
    // Simulate upload and verification time
    await new Promise(resolve => setTimeout(resolve, 2500));
    setIsSubmitting(false);
    
    if (user) {
      bank.verifyAccount(user.id);
    }
    onComplete();
  };

  const handleUpload = (side: 'front' | 'back') => {
    // Mock upload behavior
    setTimeout(() => {
      if (side === 'front') setFrontUploaded(true);
      if (side === 'back') setBackUploaded(true);
    }, 800);
  };

  if (!isOpen || !user) return null;

  return (
    <div className={styles.overlay}>
      <motion.div 
        className={styles.modal}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className={styles.header}>
          <div className={styles.iconContainer}>
            <ShieldCheck size={28} color="#5cb85c" />
          </div>
          <h2>Verify Your Account</h2>
          <p>Please provide the following details to activate your account securely.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Full Name</label>
            <input 
              type="text" 
              value={fullName} 
              onChange={e => setFullName(e.target.value)} 
              required 
              placeholder="e.g. Jane Doe"
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              placeholder="e.g. jane@example.com"
            />
          </div>

          {user.country === 'US' && (
            <div className={styles.inputGroup}>
              <label>Social Security Number (SSN)</label>
              <input 
                type="password" 
                value={ssn} 
                onChange={e => setSsn(e.target.value)} 
                required 
                placeholder="XXX-XX-XXXX"
                maxLength={9}
              />
            </div>
          )}

          <div className={styles.uploadSection}>
            <label>Driver's License</label>
            <div className={styles.uploadGrid}>
              <label className={`${styles.uploadBox} ${frontUploaded ? styles.uploaded : ''}`}>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleUpload('front');
                    }
                  }}
                  disabled={frontUploaded}
                />
                {frontUploaded ? (
                  <>
                    <CheckCircle size={24} color="#5cb85c" />
                    <span>Front Uploaded</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={24} color="#666" />
                    <span>Upload Front</span>
                  </>
                )}
              </label>
              
              <label className={`${styles.uploadBox} ${backUploaded ? styles.uploaded : ''}`}>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleUpload('back');
                    }
                  }}
                  disabled={backUploaded}
                />
                {backUploaded ? (
                  <>
                    <CheckCircle size={24} color="#5cb85c" />
                    <span>Back Uploaded</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={24} color="#666" />
                    <span>Upload Back</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className={styles.submitBtn} 
            disabled={isSubmitting || !frontUploaded || !backUploaded}
          >
            {isSubmitting ? 'Verifying...' : 'Complete Verification'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
