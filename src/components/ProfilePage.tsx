import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useBank } from '@/app/context/BankContext';
import styles from './ProfilePage.module.css';

interface ProfilePageProps {
  onBack: () => void;
  isTransferBlocked: boolean;
  onToggleTransfer: () => void;
}

export default function ProfilePage({ onBack, isTransferBlocked, onToggleTransfer }: ProfilePageProps) {
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

  const getInitials = (name?: string) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const bank = useBank();
  
  const [editingField, setEditingField] = useState<'phone' | 'address' | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleSave = () => {
    if (editingField && bank.activeUser) {
      bank.updateProfile(bank.activeUser.id, { [editingField]: editValue });
    }
    setEditingField(null);
  };

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
        <h1 className={styles.headerTitle}>Profile</h1>
      </header>

      <section className={styles.profileSection}>
        <div className={styles.avatar}>
          {getInitials(bank.activeUser?.profileName)}
        </div>
        <h2 className={styles.name}>{bank.activeUser?.profileName || 'Loading...'}</h2>
        <p className={styles.memberSince}>
          Member since {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </section>

      <section className={styles.detailsSection}>
        <div className={styles.detailItem}>
          <div>
            <div className={styles.detailLabel}>Email</div>
            <div className={styles.detailValue}>{bank.activeUser?.username || 'Loading...'}</div>
          </div>
          <button className={styles.editButton}>Edit</button>
        </div>

        <div className={styles.detailItem}>
          <div style={{ flex: 1 }}>
            <div className={styles.detailLabel}>Phone Number</div>
            {editingField === 'phone' ? (
              <input 
                value={editValue} 
                onChange={(e) => setEditValue(e.target.value)} 
                className={styles.editInput}
                autoFocus
              />
            ) : (
              <div className={styles.detailValue}>{bank.activeUser?.phone || 'Not provided'}</div>
            )}
          </div>
          {editingField === 'phone' ? (
            <button className={styles.editButton} onClick={handleSave}>Save</button>
          ) : (
            <button className={styles.editButton} onClick={() => { setEditingField('phone'); setEditValue(bank.activeUser?.phone || ''); }}>Edit</button>
          )}
        </div>

        <div className={styles.detailItem}>
          <div style={{ flex: 1 }}>
            <div className={styles.detailLabel}>Mailing Address</div>
            {editingField === 'address' ? (
              <input 
                value={editValue} 
                onChange={(e) => setEditValue(e.target.value)} 
                className={styles.editInput}
                autoFocus
              />
            ) : (
              <div className={styles.detailValue}>{bank.activeUser?.address || 'Not provided'}</div>
            )}
          </div>
          {editingField === 'address' ? (
            <button className={styles.editButton} onClick={handleSave}>Save</button>
          ) : (
            <button className={styles.editButton} onClick={() => { setEditingField('address'); setEditValue(bank.activeUser?.address || ''); }}>Edit</button>
          )}
        </div>
      </section>
    </motion.div>
  );
}
