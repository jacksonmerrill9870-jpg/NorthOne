"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import styles from './BankingApp.module.css';
import SettingsModal from './SettingsModal';
import ProfilePage from './ProfilePage';
import TransactionsPage from './TransactionsPage';
import type { TransactionGroup } from './TransactionsPage';
import PaymentModal from './PaymentModal';
import MessagesModal from './MessagesModal';
import type { MessageItem } from './MessagesModal';
import VerificationModal from './VerificationModal';
import VaultModal from './VaultModal';
import ChatBotModal from './ChatBotModal';
import CardManagementModal from './CardManagementModal';
import DepositModal from './DepositModal';
import WaiverModal from './WaiverModal';
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
import { useBank } from '@/app/context/BankContext';

export default function BankingApp() {
  const bank = useBank();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWaiverOpen, setIsWaiverOpen] = useState(false);
  const [vaultMode, setVaultMode] = useState<'stash' | 'unstash'>('stash');
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
    if (!bank.activeUser) return;
    if (bank.activeUser.status === 'restricted' || bank.activeUser.status === 'frozen') {
      handleBlockedTransferAttempt();
      return;
    }

    const newTransaction = {
      id: `t${Date.now()}`,
      type: 'withdrawal' as const,
      merchant: `Transfer to ${record.name} (${record.bank})`,
      category: 'Sent',
      amount: record.amount,
      pending: true // Made pending, wait for admin approval
    };

    bank.addTransaction(newTransaction);
    // Note: Do NOT deduct from balance yet.
  };

  const handleBlockedTransferAttempt = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    bank.addMessage({
      id: Date.now(),
      icon: <AlertTriangle size={20} />,
      title: "Account Restricted",
      body: "Your account is restricted or frozen. We are sorry, you can't send or receive money at the moment. Kindly contact support.",
      time: `Today at ${timeStr}`,
      alert: true
    });
  };

  const handleDeleteMessage = (id: number) => {
    // Currently BankContext doesn't expose deleteMessage, so we skip or we would need to add it to BankContext.
    // For now, let's keep it simple and just do nothing here since Admin manages it, 
    // or we can update BankContext later if needed.
  };

  const handleDeleteTransaction = (transactionId: string) => {
    bank.deleteTransaction(transactionId);
  };

  const derivedMessages = useMemo(() => {
    if (!bank.activeUser) return [];
    const msgs = [...bank.activeUser.messages];
    if (bank.activeUser.status === 'frozen') {
      msgs.unshift({ id: 9991, iconType: 'alert', title: 'Account Frozen', body: 'Your account has been temporarily frozen. Please contact support.', time: 'System Alert', alert: true } as any);
    } else if (bank.activeUser.status === 'restricted') {
      msgs.unshift({ id: 9992, iconType: 'alert', title: 'Account Restricted', body: 'Your account has restrictions. Outgoing transfers are disabled.', time: 'System Alert', alert: true } as any);
    }
    return msgs;
  }, [bank.activeUser?.messages, bank.activeUser?.status]);

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
            {bank.activeUser && bank.activeUser.messages.length > 0 && (
              <span style={{
                position: 'absolute', top: -5, right: -5,
                backgroundColor: '#ef5350', color: '#fff',
                fontSize: 10, fontWeight: 700,
                width: 16, height: 16, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{bank.activeUser.messages.length}</span>
            )}
          </motion.div>
        </header>

        {/* Balance Card */}
        <motion.section 
          className={styles.balanceCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.balanceHeader}>
            <span>{bank.activeUser?.profileName || 'Loading'}'s Available Balance</span>
            <span className={styles.balanceAccount}>...{bank.activeUser?.cardNumber?.slice(-4) || '1234'}</span>
          </div>
          <h2 className={styles.balanceAmount}>
            <span className={styles.currencySymbol}>$</span>
            {formatBalance(bank.activeUser?.balance || 0)}
          </h2>
          
          {/* Vault Section */}
          <div className={styles.vaultSection}>
            <motion.button 
              className={styles.stashBtn}
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setVaultMode('stash'); setIsVaultOpen(true); }}
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
              <span className={styles.vaultAmount}>${(bank.activeUser?.vaultBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <Lock size={12} className={styles.lockIcon} />
            </motion.div>
            
            <motion.button 
              className={styles.stashBtn}
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setVaultMode('unstash'); setIsVaultOpen(true); }}
            >
              UNSTASH
            </motion.button>
          </div>
        </motion.section>

        {/* Feature List */}
        <section className={styles.featureList}>
          {[
            { icon: <Zap size={20} />, text: "ASAP Direct Deposit™", comingSoon: true },
            { icon: <List size={20} />, text: "Transactions", onClick: () => setActivePage('transactions') },
            { icon: <BarChart2 size={20} />, text: "Monthly Charge Waiver", onClick: () => setIsWaiverOpen(true) },
            { icon: <MapPin size={20} />, text: "ATM & Cash Deposit Map", comingSoon: true },
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
              <div className={styles.featureText}>
                {item.text}
                {item.comingSoon && <span className={styles.comingSoonBadge}>Coming Soon</span>}
              </div>
              <ChevronRight size={20} className={styles.chevron} />
            </motion.div>
          ))}
        </section>

        {/* Removed Recent Transactions */}

        {/* Bottom Nav */}
        <nav className={styles.bottomNav}>
          {[
            { icon: <Home size={24} />, label: "Home", active: true },
            { icon: <PlusSquare size={24} />, label: "Deposit", onClick: () => setIsDepositOpen(true) },
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
          onOpenSupport={() => {
            setIsSettingsOpen(false);
            setIsChatOpen(true);
          }}
          onOpenNotifications={() => {
            setIsSettingsOpen(false);
            setIsMessagesOpen(true);
          }}
          onOpenCard={() => {
            setIsSettingsOpen(false);
            setIsCardOpen(true);
          }}
          onLogout={bank.logout}
        />

        <PaymentModal 
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          isTransferBlocked={bank.activeUser?.status === 'restricted' || bank.activeUser?.status === 'frozen'}
          onTransactionComplete={handleTransactionComplete}
          onBlockedAttempt={handleBlockedTransferAttempt}
        />

        <MessagesModal 
          isOpen={isMessagesOpen}
          onClose={() => setIsMessagesOpen(false)}
          messages={derivedMessages}
          onDeleteMessage={handleDeleteMessage}
        />
      </motion.div>

      <AnimatePresence>
        {activePage === 'profile' && (
          <ProfilePage 
            onBack={() => setActivePage('home')} 
            isTransferBlocked={bank.activeUser?.status === 'restricted' || bank.activeUser?.status === 'frozen'}
            onToggleTransfer={() => {}}
          />
        )}
        {activePage === 'transactions' && (
          <TransactionsPage 
            onBack={() => setActivePage('home')} 
            transactionGroups={bank.activeUser?.transactions || []}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}
      </AnimatePresence>

      <VaultModal 
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        mode={vaultMode}
      />

      <ChatBotModal 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <CardManagementModal 
        isOpen={isCardOpen}
        onClose={() => setIsCardOpen(false)}
      />

      <DepositModal 
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
      />

      <WaiverModal
        isOpen={isWaiverOpen}
        onClose={() => setIsWaiverOpen(false)}
      />

      <VerificationModal 
        isOpen={!!bank.activeUser && !bank.activeUser.isVerified}
        onComplete={() => {}}
      />
    </>
  );
}
