"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Banknote, RefreshCw, Lock } from 'lucide-react';
import styles from './Terms.module.css';

export default function TermsPage() {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className={styles.termsWrapper}>
      <motion.div 
        className={styles.termsContainer}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <header className={styles.header}>
          <h1 className={styles.title}>Simplified Terms & Conditions</h1>
          <p className={styles.lastUpdated}>Last Updated: May 2023</p>
        </header>

        <div className={styles.content}>
          <p className={styles.text}>
            Welcome to NorthOne. We believe banking terms shouldn't require a law degree to understand. 
            Here is a plain-English summary of how your hybrid business account works.
          </p>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Banknote className={styles.icon} size={24} />
              1. The Hybrid Account
            </h2>
            <p className={styles.text}>
              Your NorthOne account is designed to act as both a secure savings vault and a day-to-day transactional account. 
              You can earn competitive interest on your balances while still having instant access to your funds for payroll, vendor payments, and everyday expenses.
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>No minimum balance requirement.</li>
              <li className={styles.listItem}>No monthly maintenance fees.</li>
              <li className={styles.listItem}>Unlimited day-to-day transactions.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <RefreshCw className={styles.icon} size={24} />
              2. Day-to-Day Transactions
            </h2>
            <p className={styles.text}>
              Even though this account helps you save, it doesn't restrict your movement. You can:
            </p>
            <ul className={styles.list}>
              <li className={styles.listItem}>Send and receive ACH payments instantly.</li>
              <li className={styles.listItem}>Wire funds domestically and internationally.</li>
              <li className={styles.listItem}>Use your associated NorthOne business debit card everywhere Mastercard is accepted.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Shield className={styles.icon} size={24} />
              3. Security & FDIC Insurance
            </h2>
            <p className={styles.text}>
              Your deposits are safe with us. All funds held in your NorthOne account are FDIC insured up to $250,000 through our banking partners.
            </p>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <Lock className={styles.icon} size={24} />
              4. Privacy & Data
            </h2>
            <p className={styles.text}>
              We protect your data with 256-bit bank-level encryption. We will never sell your personal or financial data to third-party marketers. Your transaction history and balances are completely private.
            </p>
          </section>

          <p className={styles.text}>
            By creating an account and checking the "I agree" box, you acknowledge that you have read, understood, and agree to these simplified terms of service.
          </p>
        </div>

        <footer className={styles.footer}>
          <Link href="/" className={styles.backButton}>
            <ArrowLeft size={18} />
            Return to Sign Up
          </Link>
        </footer>
      </motion.div>
    </div>
  );
}
