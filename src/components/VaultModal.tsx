import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { useBank } from '@/app/context/BankContext';
import styles from './VaultModal.module.css';

interface VaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'stash' | 'unstash';
}

export default function VaultModal({ isOpen, onClose, mode }: VaultModalProps) {
  const bank = useBank();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const user = bank.activeUser;
  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    if (mode === 'stash' && val > user.balance) {
      setError('Insufficient available balance to stash.');
      return;
    }

    if (mode === 'unstash' && val > (user.vaultBalance || 0)) {
      setError('Insufficient vault balance to unstash.');
      return;
    }

    if (mode === 'stash') {
      bank.stashVault(user.id, val);
    } else {
      bank.unstashVault(user.id, val);
    }
    
    setAmount('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay} onClick={onClose}>
          <motion.div 
            className={styles.modal}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.header}>
              <h3>{mode === 'stash' ? 'Stash to Vault' : 'Unstash from Vault'}</h3>
              <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
            </div>
            
            <div className={styles.balanceInfo}>
              <div className={styles.balanceBox}>
                <span className={styles.balanceLabel}>Available Balance</span>
                <span className={styles.balanceValue}>${user.balance.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
              <div className={styles.directionIcon}>
                {mode === 'stash' ? <ArrowRight size={20} color="#5cb85c" /> : <ArrowLeft size={20} color="#5cb85c" />}
              </div>
              <div className={styles.balanceBox}>
                <span className={styles.balanceLabel}>Vault Balance <Lock size={12} /></span>
                <span className={styles.balanceValue}>${(user.vaultBalance || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.inputWrapper}>
                <span className={styles.currencySymbol}>$</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={amount} 
                  onChange={e => { setAmount(e.target.value); setError(''); }}
                  placeholder="0.00"
                  className={styles.amountInput}
                  autoFocus
                />
              </div>
              
              {error && <div className={styles.error}>{error}</div>}
              
              <button type="submit" className={styles.submitBtn}>
                {mode === 'stash' ? 'Confirm Stash' : 'Confirm Unstash'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
