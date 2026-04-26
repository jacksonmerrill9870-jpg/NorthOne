"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './BankingApp.module.css';
import SettingsModal from './SettingsModal';
import ProfilePage from './ProfilePage';
import TransactionsPage from './TransactionsPage';
import type { TransactionGroup } from './TransactionsPage';
import PaymentModal from './PaymentModal';
import MessagesModal from './MessagesModal';
import type { MessageItem } from './MessagesModal';
import { motion, AnimatePresence } from 'framer-motion';
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
  Lock,
  ArrowDownLeft,
  ShieldAlert,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

// Initial transaction data
const initialTransactions: TransactionGroup[] = [
  { id: 1, date: 'Today', items: [
    { id: 't1', type: 'withdrawal', merchant: 'Whole Foods Market', category: 'Paid', amount: 136.02, pending: false },
    { id: 't2', type: 'deposit', merchant: 'Incoming Wire Transfer', category: 'Deposit', amount: 89600.00, pending: false }
  ]},
  { id: 2, date: 'Yesterday', items: [
    { id: 't3', type: 'withdrawal', merchant: 'Transfer to John Doe', category: 'Sent', amount: 500.00, pending: false },
    { id: 't4', type: 'withdrawal', merchant: 'Office Space Rent', category: 'Paid', amount: 1500.00, pending: false }
  ]},
  { id: 3, date: 'Last Week', items: [
    { id: 't5', type: 'deposit', merchant: 'Initial Funding', category: 'Deposit', amount: 20000.00, pending: false }
  ]}
];

const initialMessages: MessageItem[] = [
  {
    id: 1,
    icon: <ArrowDownLeft size={20} />,
    title: "Incoming Wire Received",
    body: "We have successfully processed an incoming wire transfer of $89,600.00. The funds are now available in your available balance.",
    time: "Today at 9:41 AM",
    alert: false
  },
  {
    id: 2,
    icon: <ShieldAlert size={20} />,
    title: "New Device Login",
    body: "Your account was accessed from a new device (Windows PC) in Austin, TX. If this wasn't you, please secure your account immediately.",
    time: "Yesterday at 4:12 PM",
    alert: true
  },
  {
    id: 3,
    icon: <Sparkles size={20} />,
    title: "You're Pre-Approved!",
    body: "Good news, Luke! Based on your account activity, you've been pre-approved for the NorthOne Business Credit line up to $50,000.",
    time: "Mar 22 at 11:30 AM",
    alert: false
  }
];

export default function BankingApp() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isTransferBlocked, setIsTransferBlocked] = useState(false);
  const [balance, setBalance] = useState(107463.98);
  const [transactionGroups, setTransactionGroups] = useState<TransactionGroup[]>(initialTransactions);
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [activePage, setActivePage] = useState<'home' | 'profile' | 'transactions'>('home');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const formatBalance = (val: number) => {
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleTransactionComplete = (record: { bank: string; name: string; email: string; amount: number }) => {
    const newTransaction = {
      id: `t${Date.now()}`,
      type: 'withdrawal' as const,
      merchant: `Transfer to ${record.name} (${record.bank})`,
      category: 'Sent',
      amount: record.amount,
      pending: false
    };

    // Add transaction to history
    setTransactionGroups(prev => {
      const updated = [...prev];
      if (updated[0] && updated[0].date === 'Today') {
        updated[0] = { ...updated[0], items: [newTransaction, ...updated[0].items] };
      } else {
        updated.unshift({ id: Date.now(), date: 'Today', items: [newTransaction] });
      }
      return updated;
    });

    // Deduct from balance
    setBalance(prev => prev - record.amount);
  };

  const handleBlockedTransferAttempt = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const newMessage: MessageItem = {
      id: Date.now(),
      icon: <AlertTriangle size={20} />,
      title: "Account Restricted",
      body: "Your account is restricted. We are sorry, you can't send or receive money at the moment. Kindly contact your account assistance.",
      time: `Today at ${timeStr}`,
      alert: true
    };
    setMessages(prev => [newMessage, ...prev]);
  };

  const handleDeleteMessage = (id: number) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const handleDeleteTransaction = (transactionId: string) => {
    setTransactionGroups(prev => 
      prev.map(group => ({
        ...group,
        items: group.items.filter(item => item.id !== transactionId)
      }))
    );
  };

  return (
    <>
      <motion.div 
        className={styles.container}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ display: activePage === 'home' ? 'flex' : 'none' }}
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
              src="/northone_logo.svg" 
              alt="NorthOne Logo" 
              width={50} 
              height={50} 
              className={styles.logo}
              priority
            />
          </motion.div>
          <motion.div whileTap={{ scale: 0.9 }} onClick={() => setIsMessagesOpen(true)} style={{ cursor: 'pointer', position: 'relative' }}>
            <MessageSquare size={24} color="#5cb85c" strokeWidth={1.5} />
            {messages.length > 0 && (
              <span style={{
                position: 'absolute', top: -5, right: -5,
                backgroundColor: '#ef5350', color: '#fff',
                fontSize: 10, fontWeight: 700,
                width: 16, height: 16, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{messages.length}</span>
            )}
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
            key={balance}
          >
            ${formatBalance(balance)}
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
            { icon: <List size={20} />, text: "Transactions", onClick: () => setActivePage('transactions') },
            { icon: <BarChart2 size={20} />, text: "Monthly Charge Waiver" },
            { icon: <MapPin size={20} />, text: "ATM & Cash Deposit Map" },
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              className={styles.featureItem}
              variants={itemVariants}
              whileHover={{ x: 5, backgroundColor: "#f9f9f9" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={item.onClick}
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
            { icon: <ArrowUpRight size={24} />, label: "Pay", onClick: () => setIsPaymentOpen(true) },
            { icon: <Settings size={24} />, label: "Account", onClick: () => setIsSettingsOpen(true) },
          ].map((nav, idx) => (
            <motion.div 
              key={idx}
              className={`${styles.navItem} ${nav.active ? styles.navItemActive : ''}`}
              whileTap={{ y: -5 }}
              onClick={nav.onClick}
            >
              {nav.icon}
              <span>{nav.label}</span>
            </motion.div>
          ))}
        </nav>

        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          onOpenProfile={() => {
            setIsSettingsOpen(false);
            setActivePage('profile');
          }}
        />

        <PaymentModal 
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          isTransferBlocked={isTransferBlocked}
          onTransactionComplete={handleTransactionComplete}
          onBlockedAttempt={handleBlockedTransferAttempt}
        />

        <MessagesModal 
          isOpen={isMessagesOpen}
          onClose={() => setIsMessagesOpen(false)}
          messages={messages}
          onDeleteMessage={handleDeleteMessage}
        />
      </motion.div>

      <AnimatePresence>
        {activePage === 'profile' && (
          <ProfilePage 
            onBack={() => setActivePage('home')} 
            isTransferBlocked={isTransferBlocked}
            onToggleTransfer={() => setIsTransferBlocked(prev => !prev)}
          />
        )}
        {activePage === 'transactions' && (
          <TransactionsPage 
            onBack={() => setActivePage('home')} 
            transactionGroups={transactionGroups}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}
      </AnimatePresence>
    </>
  );
}
