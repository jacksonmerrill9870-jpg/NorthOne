import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle, TrendingDown, Calendar, BarChart2 } from 'lucide-react';
import { useBank } from '@/app/context/BankContext';
import styles from './WaiverModal.module.css';

interface WaiverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WaiverModal({ isOpen, onClose }: WaiverModalProps) {
  const bank = useBank();
  const user = bank.activeUser;

  const WAIVER_GOAL = 500; // Require $500 spend per month

  const { dailyExpenses, monthlyExpenses } = useMemo(() => {
    let daily = 0;
    let monthly = 0;
    
    if (user && user.transactions) {
      user.transactions.forEach(group => {
        group.items.forEach(item => {
          if (item.type === 'withdrawal') {
            monthly += item.amount;
            if (group.date === 'Today') {
              daily += item.amount;
            }
          }
        });
      });
    }
    
    return { dailyExpenses: daily, monthlyExpenses: monthly };
  }, [user]);

  if (!isOpen || !user) return null;

  const progress = Math.min((monthlyExpenses / WAIVER_GOAL) * 100, 100);
  const isWaived = monthlyExpenses >= WAIVER_GOAL;

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
          <h3>Monthly Charge Waiver</h3>
          <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
        </div>

        <div className={styles.content}>
          <div className={styles.heroSection}>
            <div className={styles.heroIcon}>
              <BarChart2 size={40} color={isWaived ? "#5cb85c" : "#f0ad4e"} />
            </div>
            <h2>{isWaived ? 'Fee Waived!' : 'Waiver in Progress'}</h2>
            <p>Spend ${WAIVER_GOAL} a month using your NorthOne card to automatically waive the $10 account fee.</p>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <TrendingDown size={18} color="#d9534f" />
                <span>Today's Spend</span>
              </div>
              <div className={styles.statAmount}>${dailyExpenses.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statHeader}>
                <Calendar size={18} color="#5cb85c" />
                <span>Monthly Spend</span>
              </div>
              <div className={styles.statAmount}>${monthlyExpenses.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
            </div>
          </div>

          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <span>Progress toward ${WAIVER_GOAL}</span>
              <span>{Math.floor(progress)}%</span>
            </div>
            <div className={styles.progressBarBg}>
              <motion.div 
                className={styles.progressBarFill}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                style={{ backgroundColor: isWaived ? '#5cb85c' : '#f0ad4e' }}
              />
            </div>
            <div className={styles.progressStatus}>
              {isWaived ? (
                <span className={styles.successText}><CheckCircle size={16} /> You've reached the goal!</span>
              ) : (
                <span>${(WAIVER_GOAL - monthlyExpenses).toLocaleString('en-US', {minimumFractionDigits: 2})} more to go</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
