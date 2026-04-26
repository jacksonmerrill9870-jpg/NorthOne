import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Bell, Shield, CreditCard, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import styles from './SettingsModal.module.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
}

export default function SettingsModal({ isOpen, onClose, onOpenProfile }: SettingsModalProps) {
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

  const settingsItems = [
    { icon: <User size={20} />, label: "Profile", description: "Personal info, email, phone", onClick: onOpenProfile },
    { icon: <CreditCard size={20} />, label: "Card Management", description: "Lock card, report lost/stolen" },
    { icon: <Shield size={20} />, label: "Security", description: "Password, Face ID, PIN" },
    { icon: <Bell size={20} />, label: "Notifications", description: "Alerts, marketing preferences" },
    { icon: <HelpCircle size={20} />, label: "Help & Support", description: "FAQ, contact us" },
    { icon: <LogOut size={20} />, label: "Log Out", description: "" },
  ];

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
              <h2 className={styles.title}>Settings</h2>
              <button className={styles.closeButton} onClick={onClose}>
                <X size={24} />
              </button>
            </div>
            
            <div className={styles.content}>
              {settingsItems.map((item, idx) => (
                <motion.div 
                  key={idx}
                  className={styles.settingItem}
                  whileHover={{ x: 5, backgroundColor: "#f9f9f9" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onClick={item.onClick}
                >
                  <div className={styles.iconWrapper}>{item.icon}</div>
                  <div className={styles.settingText}>
                    <div className={styles.settingLabel}>{item.label}</div>
                    {item.description && (
                      <div className={styles.settingDescription}>{item.description}</div>
                    )}
                  </div>
                  <ChevronRight size={20} className={styles.chevron} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
