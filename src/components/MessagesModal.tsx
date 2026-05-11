import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, CheckCircle, XCircle, Sparkles, ShieldAlert, AlertTriangle, ArrowDownLeft } from 'lucide-react';
import styles from './MessagesModal.module.css';

export interface MessageItem {
  id: number;
  iconType: 'success' | 'error' | 'alert' | 'welcome' | 'deposit';
  title: string;
  body: string;
  time: string;
  alert: boolean;
}

const renderIcon = (type: string) => {
  switch (type) {
    case 'success': return <CheckCircle size={20} color="#fff" />;
    case 'error': return <XCircle size={20} color="#fff" />;
    case 'alert': return <AlertTriangle size={20} color="#fff" />;
    case 'welcome': return <Sparkles size={20} color="#fff" />;
    case 'deposit': return <ArrowDownLeft size={20} color="#fff" />;
    default: return <Sparkles size={20} color="#fff" />;
  }
};

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: MessageItem[];
  onDeleteMessage: (id: number) => void;
}

export default function MessagesModal({ isOpen, onClose, messages, onDeleteMessage }: MessagesModalProps) {
  const modalVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", damping: 25, stiffness: 300 }
    },
    exit: { 
      y: "100%", 
      opacity: 0,
      transition: { type: "spring", damping: 25, stiffness: 300 }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
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
          onClick={onClose}
        >
          <motion.div 
            className={styles.modal}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>
                Messages {messages.length > 0 && <span className={styles.badge}>{messages.length}</span>}
              </h2>
              <button className={styles.closeButton} onClick={onClose}>
                <X size={24} />
              </button>
            </div>
            
            <div className={styles.content}>
              {messages.length === 0 ? (
                <div className={styles.emptyState}>No messages</div>
              ) : (
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div 
                      key={msg.id} 
                      className={styles.messageItem}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className={`${styles.messageIcon} ${msg.iconType === 'success' ? styles.iconSuccess : ''} ${msg.iconType === 'error' ? styles.iconError : ''} ${msg.iconType === 'alert' ? styles.iconAlert : ''}`}>
                        {renderIcon(msg.iconType)}
                      </div>
                      <div className={styles.messageText}>
                        <div className={styles.messageTitle}>{msg.title}</div>
                        <div className={styles.messageBody}>{msg.body}</div>
                        <div className={styles.messageTime}>{msg.time}</div>
                      </div>
                      <button 
                        className={styles.deleteButton}
                        onClick={() => onDeleteMessage(msg.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
