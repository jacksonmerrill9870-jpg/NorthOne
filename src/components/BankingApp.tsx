"use client";

import React from 'react';
import Image from 'next/image';
import styles from './BankingApp.module.css';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  MessageSquare, 
  Zap, 
  List, 
  BarChart2, 
  MapPin, 
  Home, 
  PlusSquare, 
  ArrowUpRight, 
  Settings,
  ChevronRight,
  Lock
} from 'lucide-react';

export default function BankingApp() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className={styles.container}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <header className={styles.header}>
        <motion.div whileTap={{ scale: 0.9 }}>
          <ChevronLeft size={24} color="#5cb85c" strokeWidth={1.5} />
        </motion.div>
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Image 
            src="/logo.png" 
            alt="Green Dot Logo" 
            width={80} 
            height={30} 
            className={styles.logo}
            priority
          />
        </motion.div>
        <motion.div whileTap={{ scale: 0.9 }}>
          <MessageSquare size={24} color="#5cb85c" strokeWidth={1.5} />
        </motion.div>
      </header>

      {/* Balance Card */}
      <motion.section 
        className={styles.balanceCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.balanceLabel}>ACCOUNT BALANCE (CARD ENDING IN 3208)</div>
        <motion.div 
          className={styles.balanceAmount}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          -$417.75
        </motion.div>
        
        {/* Vault Section */}
        <div className={styles.vaultSection}>
          <motion.button 
            className={styles.stashBtn}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.3)" }}
            whileTap={{ scale: 0.95 }}
          >
            STASH
          </motion.button>
          
          <motion.div 
            className={styles.vaultCircle}
            animate={{ 
              boxShadow: ["0 8px 30px rgba(0,0,0,0.1)", "0 8px 40px rgba(92,184,92,0.3)", "0 8px 30px rgba(0,0,0,0.1)"]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <span className={styles.vaultTitle}>VAULT</span>
            <span className={styles.vaultAmount}>$261.89</span>
            <Lock size={12} className={styles.lockIcon} />
          </motion.div>
          
          <motion.button 
            className={styles.stashBtn}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.3)" }}
            whileTap={{ scale: 0.95 }}
          >
            UNSTASH
          </motion.button>
        </div>
      </motion.section>

      {/* Feature List */}
      <section className={styles.featureList}>
        {[
          { icon: <Zap size={20} />, text: "ASAP Direct Deposit™" },
          { icon: <List size={20} />, text: "Transactions" },
          { icon: <BarChart2 size={20} />, text: "Monthly Charge Waiver" },
          { icon: <MapPin size={20} />, text: "ATM & Cash Deposit Map" },
        ].map((item, idx) => (
          <motion.div 
            key={idx}
            className={styles.featureItem}
            variants={itemVariants}
            whileHover={{ x: 5, backgroundColor: "#f9f9f9" }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className={styles.featureIcon}>{item.icon}</div>
            <div className={styles.featureText}>{item.text}</div>
            <ChevronRight size={20} className={styles.chevron} />
          </motion.div>
        ))}
      </section>

      {/* Bottom Nav */}
      <nav className={styles.bottomNav}>
        {[
          { icon: <Home size={24} />, label: "Home", active: true },
          { icon: <PlusSquare size={24} />, label: "Deposit" },
          { icon: <ArrowUpRight size={24} />, label: "Pay" },
          { icon: <Settings size={24} />, label: "Account" },
        ].map((nav, idx) => (
          <motion.div 
            key={idx}
            className={`${styles.navItem} ${nav.active ? styles.navItemActive : ''}`}
            whileTap={{ y: -5 }}
          >
            {nav.icon}
            <span>{nav.label}</span>
          </motion.div>
        ))}
      </nav>
    </motion.div>
  );
}
