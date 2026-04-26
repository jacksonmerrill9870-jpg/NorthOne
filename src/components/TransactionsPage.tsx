import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowDownLeft, ShoppingCart, Send, Trash2 } from 'lucide-react';
import styles from './TransactionsPage.module.css';

export interface TransactionItem {
  id: string;
  type: 'deposit' | 'withdrawal';
  merchant: string;
  category: string;
  amount: number;
  pending: boolean;
}

export interface TransactionGroup {
  id: number;
  date: string;
  items: TransactionItem[];
}

interface TransactionsPageProps {
  onBack: () => void;
  transactionGroups: TransactionGroup[];
  onDeleteTransaction: (transactionId: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  'Deposit': <ArrowDownLeft size={20} />,
  'Paid': <ShoppingCart size={20} />,
  'Sent': <Send size={20} />,
};

export default function TransactionsPage({ onBack, transactionGroups, onDeleteTransaction }: TransactionsPageProps) {
  const pageVariants = {
    hidden: { x: "100%", opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { type: "spring", damping: 25, stiffness: 200 }
    },
    exit: { 
      x: "100%", 
      opacity: 0,
      transition: { type: "spring", damping: 25, stiffness: 200 }
    }
  };

  const hasTransactions = transactionGroups.some(g => g.items.length > 0);

  return (
    <motion.div 
      className={styles.container}
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <header className={styles.header}>
        <button className={styles.backButton} onClick={onBack}>
          <ChevronLeft size={24} />
          Back
        </button>
        <h1 className={styles.headerTitle}>Transactions</h1>
      </header>

      <div className={styles.transactionList}>
        {!hasTransactions ? (
          <div className={styles.emptyState}>No transactions yet</div>
        ) : (
          transactionGroups.map(group => (
            group.items.length > 0 && (
              <div key={group.id}>
                <div className={styles.dateHeader}>{group.date}</div>
                <AnimatePresence>
                  {group.items.map(item => (
                    <motion.div 
                      key={item.id}
                      className={styles.transactionItem}
                      initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                      animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={styles.transactionLeft}>
                        <div className={`${styles.transactionIcon} ${item.type === 'deposit' ? styles.iconDeposit : styles.iconWithdrawal}`}>
                          {iconMap[item.category] || <Send size={20} />}
                        </div>
                        <div className={styles.transactionDetails}>
                          <span className={styles.merchantName}>{item.merchant}</span>
                          <span className={styles.transactionCategory}>{item.category}</span>
                        </div>
                      </div>
                      <div className={styles.transactionRight}>
                        <span className={`${styles.amount} ${item.type === 'deposit' ? styles.amountPositive : styles.amountNegative}`}>
                          {item.type === 'deposit' ? '+' : '-'}${Math.abs(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        {item.pending && <span className={`${styles.status} ${styles.statusPending}`}>Pending</span>}
                      </div>
                      <button 
                        className={styles.deleteButton}
                        onClick={() => onDeleteTransaction(item.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )
          ))
        )}
      </div>
    </motion.div>
  );
}
