import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Shield, Settings, Mail } from 'lucide-react';
import { useBank } from '@/app/context/BankContext';
import styles from './CardManagementModal.module.css';

interface CardManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CardManagementModal({ isOpen, onClose }: CardManagementModalProps) {
  const bank = useBank();
  const user = bank.activeUser;
  
  const [isCardLocked, setIsCardLocked] = useState(false);
  const [requestedPhysical, setRequestedPhysical] = useState(false);
  const [requesting, setRequesting] = useState(false);

  if (!isOpen || !user) return null;

  const handleRequestPhysical = () => {
    setRequesting(true);
    setTimeout(() => {
      setRequesting(false);
      setRequestedPhysical(true);
    }, 1500);
  };

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
          <h3>Card Management</h3>
          <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
        </div>

        <div className={styles.cardContainer}>
          <div className={`${styles.creditCard} ${isCardLocked ? styles.lockedCard : ''}`}>
            <div className={styles.cardTop}>
              <span className={styles.bankName}>NorthOne</span>
              <CreditCard size={24} color="rgba(255,255,255,0.8)" />
            </div>
            <div className={styles.chip}></div>
            <div className={styles.cardNumber}>
              {user.cardNumber || '4123 4567 8901 2345'}
            </div>
            <div className={styles.cardBottom}>
              <div className={styles.cardHolder}>
                <span>Cardholder Name</span>
                <div>{user.profileName.toUpperCase()}</div>
              </div>
              <div className={styles.cardExpiry}>
                <span>Valid Thru</span>
                <div>12/28</div>
              </div>
            </div>
            {isCardLocked && (
              <div className={styles.lockedOverlay}>
                <Shield size={32} />
                <span>Card Locked</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.actionsList}>
          <div className={styles.actionItem}>
            <div className={styles.actionInfo}>
              <div className={styles.iconBox}><Shield size={20} color="#1a1a1a" /></div>
              <div>
                <h4>Lock Card</h4>
                <p>Temporarily disable your card</p>
              </div>
            </div>
            <button 
              className={`${styles.toggleSwitch} ${isCardLocked ? styles.toggleOn : styles.toggleOff}`}
              onClick={() => setIsCardLocked(!isCardLocked)}
            >
              <span className={`${styles.toggleKnob} ${isCardLocked ? styles.knobOn : styles.knobOff}`} />
            </button>
          </div>

          <div className={styles.actionItem} onClick={!requestedPhysical ? handleRequestPhysical : undefined} style={{ cursor: requestedPhysical ? 'default' : 'pointer' }}>
            <div className={styles.actionInfo}>
              <div className={styles.iconBox}><Mail size={20} color="#1a1a1a" /></div>
              <div>
                <h4>{requestedPhysical ? 'Physical Card Requested' : 'Request Physical Card'}</h4>
                <p>{requestedPhysical ? 'Expected delivery in 5-7 business days' : 'Get a physical card mailed to you'}</p>
              </div>
            </div>
            {requesting ? (
              <div className={styles.spinner}></div>
            ) : (
              !requestedPhysical && <div className={styles.requestBtn}>Request</div>
            )}
          </div>

          <div className={styles.actionItem}>
            <div className={styles.actionInfo}>
              <div className={styles.iconBox}><Settings size={20} color="#1a1a1a" /></div>
              <div>
                <h4>Change PIN</h4>
                <p>Update your card's PIN</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
