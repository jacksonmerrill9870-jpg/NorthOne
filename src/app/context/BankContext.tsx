"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { TransactionGroup } from '@/components/TransactionsPage';
import type { MessageItem } from '@/components/MessagesModal';
import { ArrowDownLeft, ShieldAlert, Sparkles, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export type UserStatus = 'active' | 'frozen' | 'restricted';

export interface UserAccount {
  id: string; // Using email as ID for simplicity
  username: string;
  profileName: string;
  country: string;
  phone?: string;
  address?: string;
  isVerified: boolean;
  status: UserStatus;
  balance: number;
  vaultBalance: number;
  cardNumber: string;
  transactions: TransactionGroup[];
  messages: MessageItem[];
}

export interface BankState {
  users: UserAccount[];
  activeUserId: string | null;
  activeUser: UserAccount | null;
  
  // Auth
  createAccount: (email: string, fullName: string, country: string) => void;
  login: (email: string) => void;
  logout: () => void;
  verifyAccount: (userId: string) => void;

  // Admin Actions
  updateProfile: (userId: string, updates: Partial<{ username: string; profileName: string; phone: string; address: string; status: UserStatus }>) => void;
  updateBalance: (userId: string, amount: number, type: 'credit' | 'debit', description: string, senderDetails?: string) => void;
  approveTransaction: (userId: string, transactionId: string) => void;
  declineTransaction: (userId: string, transactionId: string) => void;
  deleteUser: (userId: string) => void;

  // Active User Actions
  addTransaction: (transaction: any) => void;
  deleteTransaction: (transactionId: string) => void;
  stashVault: (userId: string, amount: number) => void;
  unstashVault: (userId: string, amount: number) => void;
  addMessage: (message: any) => void;
}

const defaultInitialUser: UserAccount = {
  id: 'luke@example.com',
  username: 'luke@example.com',
  profileName: 'Luke Skywalker',
  country: 'US',
  phone: '+1 (555) 012-3456',
  address: '123 Tatooine Way, Mos Eisley, NY 10001',
  isVerified: true,
  status: 'active',
  balance: 107463.98,
  vaultBalance: 261.89,
  cardNumber: '4123 4567 8901 2345',
  transactions: [
    { id: 1, date: 'Today', items: [
      { id: 't1', type: 'withdrawal', merchant: 'Whole Foods Market', category: 'Paid', amount: 136.02, pending: false },
      { id: 't2', type: 'deposit', merchant: 'Incoming Wire Transfer', category: 'Deposit', amount: 89600.00, pending: false }
    ]},
    { id: 2, date: 'Yesterday', items: [
      { id: 't3', type: 'withdrawal', merchant: 'Transfer to John Doe', category: 'Sent', amount: 500.00, pending: false },
      { id: 't4', type: 'withdrawal', merchant: 'Office Space Rent', category: 'Paid', amount: 1500.00, pending: false }
    ]}
  ],
  messages: [] // Icons injected below
};

const BankContext = createContext<BankState>({} as BankState);

export const BankProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [users, setUsers] = useState<UserAccount[]>([defaultInitialUser]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  const activeUser = users.find(u => u.id === activeUserId) || null;

  // Load state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('northone_users_v2');
      if (saved) {
        const parsedData = JSON.parse(saved);
        if (Array.isArray(parsedData.users)) {
          setUsers(parsedData.users);
          setActiveUserId(parsedData.activeUserId);
        }
      }
    } catch (e) {
      console.error("Failed to parse state", e);
    }
    setIsMounted(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isMounted) return;
    const stateToSave = {
      users: users,
      activeUserId
    };
    localStorage.setItem('northone_users_v2', JSON.stringify(stateToSave));
  }, [users, activeUserId, isMounted]);

  const createAccount = (email: string, fullName: string, country: string) => {
    // Generate a random 16-digit card number formatted as XXXX XXXX XXXX XXXX
    const randomCardSegment = () => Math.floor(1000 + Math.random() * 9000).toString();
    const newCardNumber = `${randomCardSegment()} ${randomCardSegment()} ${randomCardSegment()} ${randomCardSegment()}`;

    const newUser: UserAccount = {
      id: email,
      username: email,
      profileName: fullName,
      country,
      phone: '',
      address: '',
      isVerified: false,
      status: 'active',
      balance: 0,
      vaultBalance: 0,
      cardNumber: newCardNumber,
      transactions: [],
      messages: [{
        id: Date.now(),
        iconType: 'welcome',
        title: "Welcome to NorthOne!",
        body: "Thanks for choosing NorthOne banking. Enjoy fast direct deposits, no hidden fees, and seamless card management all in one place.",
        time: "Just now",
        alert: false
      }]
    };
    setUsers(prev => [...prev, newUser]);
    setActiveUserId(email);
  };

  const login = (email: string) => {
    // If user doesn't exist, we could create them or error. Let's just set active.
    if (users.find(u => u.id === email)) {
      setActiveUserId(email);
    } else {
      // Mock auto signup for any email during testing with default 'US'
      createAccount(email, email.split('@')[0], 'US');
    }
  };

  const verifyAccount = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: true } : u));
  };

  const logout = () => setActiveUserId(null);

  const updateProfile = (userId: string, updates: Partial<{ username: string; profileName: string; status: UserStatus }>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
  };

  const updateBalance = (userId: string, amount: number, type: 'credit' | 'debit', description: string, senderDetails?: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      const newBalance = type === 'credit' ? u.balance + amount : u.balance - amount;
      const newTransaction = {
        id: `t${Date.now()}`,
        type: type === 'credit' ? 'deposit' as const : 'withdrawal' as const,
        merchant: senderDetails ? (description ? `${description} - From: ${senderDetails}` : `From: ${senderDetails}`) : description,
        category: type === 'credit' ? 'Credited' : 'Debited',
        amount: amount,
        pending: false
      };
      
      const updatedTransactions = [...u.transactions];
      if (updatedTransactions[0] && updatedTransactions[0].date === 'Today') {
        updatedTransactions[0] = { ...updatedTransactions[0], items: [newTransaction, ...updatedTransactions[0].items] };
      } else {
        updatedTransactions.unshift({ id: Date.now(), date: 'Today', items: [newTransaction] });
      }
      return { ...u, balance: newBalance, transactions: updatedTransactions };
    }));
  };

  const approveTransaction = (userId: string, transactionId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      let amountToDeduct = 0;
      let merchantName = '';
      const updatedTransactions = u.transactions.map(group => ({
        ...group,
        items: group.items.map(item => {
          if (item.id === transactionId) {
            amountToDeduct = item.amount;
            merchantName = item.merchant;
            return { ...item, pending: false };
          }
          return item;
        })
      }));
      
      const cashback = amountToDeduct * 0.02;
      
      const newMessage: MessageItem = {
        id: Date.now(),
        iconType: 'success',
        title: "Transaction Completed",
        body: `Your transaction of $${amountToDeduct.toLocaleString('en-US', {minimumFractionDigits: 2})} to ${merchantName} was successfully completed. You earned $${cashback.toLocaleString('en-US', {minimumFractionDigits: 2})} in Vault cashback!`,
        time: "Just now",
        alert: false
      };
      
      return { 
        ...u, 
        transactions: updatedTransactions, 
        balance: u.balance - amountToDeduct,
        vaultBalance: (u.vaultBalance || 0) + cashback,
        messages: [newMessage, ...u.messages]
      };
    }));
  };

  const declineTransaction = (userId: string, transactionId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      let merchantName = '';
      let declinedAmount = 0;
      const updatedTransactions = u.transactions.map(group => ({
        ...group,
        items: group.items.map(item => {
          if (item.id === transactionId) {
            merchantName = item.merchant;
            declinedAmount = item.amount;
            return { ...item, pending: false, merchant: item.merchant + ' (Declined)' };
          }
          return item;
        })
      }));
      
      const newMessage: MessageItem = {
        id: Date.now(),
        iconType: 'error',
        title: "Transaction Failed",
        body: `Your transaction of $${declinedAmount.toLocaleString('en-US', {minimumFractionDigits: 2})} to ${merchantName} failed and was declined by your bank.`,
        time: "Just now",
        alert: true
      };
      
      return { 
        ...u, 
        transactions: updatedTransactions,
        messages: [newMessage, ...u.messages]
      };
    }));
  };

  const addTransaction = (transaction: any) => {
    if (!activeUserId) return;
    setUsers(prev => prev.map(u => {
      if (u.id !== activeUserId) return u;
      const updatedTransactions = [...u.transactions];
      if (updatedTransactions[0] && updatedTransactions[0].date === 'Today') {
        updatedTransactions[0] = { ...updatedTransactions[0], items: [transaction, ...updatedTransactions[0].items] };
      } else {
        updatedTransactions.unshift({ id: Date.now(), date: 'Today', items: [transaction] });
      }
      return { ...u, transactions: updatedTransactions };
    }));
  };

  const deleteTransaction = (transactionId: string) => {
    if (!activeUserId) return;
    setUsers(prev => prev.map(u => {
      if (u.id !== activeUserId) return u;
      const updatedTransactions = u.transactions.map(group => ({
        ...group,
        items: group.items.filter(item => item.id !== transactionId)
      })).filter(group => group.items.length > 0); // Remove empty groups

      return { ...u, transactions: updatedTransactions };
    }));
  };

  const stashVault = (userId: string, amount: number) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      return { ...u, balance: u.balance - amount, vaultBalance: u.vaultBalance + amount };
    }));
  };

  const unstashVault = (userId: string, amount: number) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      return { ...u, balance: u.balance + amount, vaultBalance: u.vaultBalance - amount };
    }));
  };

  const addMessage = (message: any) => {
    if (!activeUserId) return;
    setUsers(prev => prev.map(u => {
      if (u.id !== activeUserId) return u;
      return { ...u, messages: [message, ...u.messages] };
    }));
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (activeUserId === userId) {
      setActiveUserId(null);
    }
  };

  if (!isMounted) return null;

  return (
    <BankContext.Provider value={{
      users,
      activeUserId,
      activeUser,
      createAccount,
      login,
      logout,
      verifyAccount,
      updateProfile,
      updateBalance,
      approveTransaction,
      declineTransaction,
      deleteUser,
      addTransaction,
      deleteTransaction,
      stashVault,
      unstashVault,
      addMessage
    }}>
      {children}
    </BankContext.Provider>
  );
};

export const useBank = () => useContext(BankContext);
