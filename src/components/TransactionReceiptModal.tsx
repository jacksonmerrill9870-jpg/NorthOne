import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, CheckCircle, Clock, ArrowDownLeft, Send } from 'lucide-react';
import styles from './TransactionReceiptModal.module.css';
import { TransactionItem } from './TransactionsPage';

interface TransactionReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionItem | null;
}

export default function TransactionReceiptModal({ isOpen, onClose, transaction }: TransactionReceiptModalProps) {
  if (!isOpen || !transaction) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay} onClick={onClose}>
          <motion.div 
            className={styles.modal}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={e => e.stopPropagation()}
          >
            <div className={`${styles.receiptHeader} ${transaction.category === 'Failed' ? styles.receiptHeaderError : ''}`}>
              <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
              <div className={styles.statusBadge}>
                {transaction.pending ? 'Pending' : (transaction.category === 'Failed' ? 'Declined' : 'Completed')}
              </div>
              <h2 className={styles.amount}>
                {transaction.type === 'deposit' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <p className={styles.merchant}>{transaction.merchant}</p>
            </div>

            <div className={styles.receiptBody}>
              <div className={styles.detailsList}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Status</span>
                  <span className={`${styles.detailValue} ${transaction.pending ? styles.pendingColor : (transaction.category === 'Failed' ? styles.errorColor : styles.successColor)}`}>
                    {transaction.pending ? 'Payment Processing' : (transaction.category === 'Failed' ? 'Transaction Declined' : 'Transaction Successful')}
                  </span>
                </div>
                
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Reference ID</span>
                  <span className={styles.detailValue}>TXN-{transaction.id.slice(0, 8).toUpperCase()}</span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Category</span>
                  <span className={styles.detailValue}>{transaction.category}</span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Payment Type</span>
                  <span className={styles.detailValue}>{transaction.type === 'deposit' ? 'Direct Deposit' : 'Internal Transfer'}</span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Date</span>
                  <span className={styles.detailValue}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              <button className={styles.shareBtn}>
                <Share2 size={18} />
                Share Receipt
              </button>
            </div>

            <div className={styles.footer}>
              <p className={styles.footerNote}>This is an official transaction record for your NorthOne account.</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
