import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle } from 'lucide-react';
import styles from './PaymentModal.module.css';

interface TransactionRecord {
  bank: string;
  name: string;
  email: string;
  amount: number;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  isTransferBlocked: boolean;
  onTransactionComplete: (record: TransactionRecord) => void;
  onBlockedAttempt: () => void;
}

const BANK_OPTIONS = [
  "Chase Bank", "Bank of America", "Wells Fargo", "Citibank", 
  "Chime", "PayPal", "CashApp", "Venmo", "Zelle",
  "Capital One", "US Bank", "PNC Bank", "TD Bank", 
  "Ally Bank", "Goldman Sachs", "HSBC", "Barclays",
  "SoFi", "Revolut", "Wise", "Other Bank..."
];

export default function PaymentModal({ isOpen, onClose, isTransferBlocked, onTransactionComplete, onBlockedAttempt }: PaymentModalProps) {
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [resultState, setResultState] = useState<'none' | 'success' | 'failed'>('none');
  const [txId, setTxId] = useState("");
  
  const filteredBanks = BANK_OPTIONS.filter(bank => 
    bank.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const modalVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { type: "spring", damping: 25, stiffness: 300 }
    },
    exit: { 
      scale: 0.9, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const resetForm = () => {
    setSearchQuery("");
    setSelectedBank("");
    setRecipientName("");
    setRecipientEmail("");
    setAmount("");
    setResultState('none');
    setIsSending(false);
    setTxId("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const generateTxId = () => {
    return 'TXN-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    setTimeout(() => {
      setIsSending(false);
      const generatedTxId = generateTxId();
      setTxId(generatedTxId);

      if (isTransferBlocked) {
        setResultState('failed');
        onBlockedAttempt();
      } else {
        setResultState('success');
        onTransactionComplete({
          bank: searchQuery,
          name: recipientName,
          email: recipientEmail,
          amount: parseFloat(amount)
        });
      }
    }, 1500);
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={styles.overlay}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={resultState === 'none' ? handleClose : undefined}
        >
          {/* Result Dialog */}
          <AnimatePresence>
            {resultState !== 'none' && (
              <motion.div
                className={styles.resultOverlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  className={styles.resultCard}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 20 }}
                >
                  <div className={`${styles.resultIcon} ${resultState === 'success' ? styles.resultIconSuccess : styles.resultIconFail}`}>
                    {resultState === 'success' ? <CheckCircle size={32} /> : <XCircle size={32} />}
                  </div>

                  <h3 className={`${styles.resultTitle} ${resultState === 'success' ? styles.resultTitleSuccess : styles.resultTitleFail}`}>
                    {resultState === 'success' ? 'Transaction Completed' : 'Transaction Failed'}
                  </h3>

                  <p className={styles.resultMessage}>
                    {resultState === 'success' 
                      ? `$${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} has been successfully sent to ${recipientName}.`
                      : 'Transaction failed. Please contact your account manager for assistance.'}
                  </p>

                  {resultState === 'success' && (
                    <div className={styles.receiptSection}>
                      <div className={styles.receiptRow}>
                        <span className={styles.receiptLabel}>Transaction ID</span>
                        <span className={styles.receiptValue}>{txId}</span>
                      </div>
                      <div className={styles.receiptRow}>
                        <span className={styles.receiptLabel}>Date</span>
                        <span className={styles.receiptValue}>{getCurrentDate()}</span>
                      </div>
                      <div className={styles.receiptRow}>
                        <span className={styles.receiptLabel}>Recipient</span>
                        <span className={styles.receiptValue}>{recipientName}</span>
                      </div>
                      <div className={styles.receiptRow}>
                        <span className={styles.receiptLabel}>Bank</span>
                        <span className={styles.receiptValue}>{searchQuery}</span>
                      </div>
                      <div className={styles.receiptRow}>
                        <span className={styles.receiptLabel}>Email</span>
                        <span className={styles.receiptValue}>{recipientEmail}</span>
                      </div>
                      <div className={`${styles.receiptRow} ${styles.receiptTotal}`}>
                        <span className={styles.receiptLabel}>Amount</span>
                        <span className={styles.receiptValue}>${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  )}

                  <button 
                    className={`${styles.resultCloseButton} ${resultState === 'failed' ? styles.resultCloseButtonFail : ''}`}
                    onClick={handleClose}
                  >
                    {resultState === 'success' ? 'Done' : 'Close'}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Payment Form */}
          <motion.form 
            className={styles.modal}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSend}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>Send Money</h2>
              <button type="button" className={styles.closeButton} onClick={handleClose}>
                <X size={24} />
              </button>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Recipient Bank</label>
              <div className={styles.dropdownContainer}>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="Search a bank..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                  style={{ width: '100%' }}
                  required
                />
                <AnimatePresence>
                  {isDropdownOpen && filteredBanks.length > 0 && (
                    <motion.div 
                      className={styles.dropdownList}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                    >
                      {filteredBanks.map((bank, idx) => (
                        <div 
                          key={idx} 
                          className={styles.dropdownItem}
                          onClick={() => {
                            setSearchQuery(bank);
                            setSelectedBank(bank);
                            setIsDropdownOpen(false);
                          }}
                        >
                          {bank}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Recipient Name</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="e.g. John Doe" 
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                required 
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Recipient Email</label>
              <input 
                type="email" 
                className={styles.input} 
                placeholder="john@example.com" 
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                required 
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Amount</label>
              <div className={styles.amountWrapper}>
                <span className={styles.currencySymbol}>$</span>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0.01"
                  className={`${styles.input} ${styles.amountInput}`} 
                  placeholder="0.00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required 
                />
              </div>
            </div>

            <motion.button 
              type="submit" 
              className={styles.sendButton}
              disabled={isSending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSending ? 'Sending...' : 'Send Payment'}
            </motion.button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
