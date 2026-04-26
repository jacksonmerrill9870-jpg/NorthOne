import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
  };

  const username = "Luke Charles Stafford";

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
          {getInitials(username)}
        </div>
        <h2 className={styles.name}>{username}</h2>
        <p className={styles.memberSince}>Member since April 2026</p>
      </section>

      <section className={styles.detailsSection}>
        <div className={styles.detailItem}>
          <div>
            <div className={styles.detailLabel}>Email</div>
            <div className={styles.detailValue}>luke.stafford@example.com</div>
          </div>
          <button className={styles.editButton}>Edit</button>
        </div>

        <div className={styles.detailItem}>
          <div>
            <div className={styles.detailLabel}>Phone Number</div>
            <div className={styles.detailValue}>+1 (555) 123-4567</div>
          </div>
          <button className={styles.editButton}>Edit</button>
        </div>

        <div className={styles.detailItem}>
          <div>
            <div className={styles.detailLabel}>Mailing Address</div>
            <div className={styles.detailValue}>123 Green Dot Way<br/>Austin, TX 78701</div>
          </div>
          <button className={styles.editButton}>Edit</button>
        </div>
      </section>

      <section className={styles.transferSection}>
        <div className={styles.transferRow}>
          <div className={styles.transferInfo}>
            <div className={styles.transferLabel}>Block Transfers</div>
            <div className={styles.transferDescription}>
              When enabled, all outgoing transfers will be blocked.
            </div>
          </div>
          <button 
            className={`${styles.toggleSwitch} ${isTransferBlocked ? styles.toggleOn : styles.toggleOff}`}
            onClick={onToggleTransfer}
          >
            <span className={`${styles.toggleKnob} ${isTransferBlocked ? styles.knobOn : styles.knobOff}`} />
          </button>
        </div>
        <span className={`${styles.statusBadge} ${isTransferBlocked ? styles.statusBlocked : styles.statusActive}`}>
          {isTransferBlocked ? '🔒 Transfers Blocked' : '✅ Transfers Allowed'}
        </span>
      </section>
    </motion.div>
  );
}
