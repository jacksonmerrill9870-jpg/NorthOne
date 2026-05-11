"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { TransactionGroup } from '@/components/TransactionsPage';
import type { MessageItem } from '@/components/MessagesModal';
import { ArrowDownLeft, ShieldAlert, Sparkles, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

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
  deleteMessage: (messageId: number) => void;
}

const BankContext = createContext<BankState>({} as BankState);

export const BankProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [users, setUsers] = useState<UserAccount[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('northone_users_cache');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Save cache when users update
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('northone_users_cache', JSON.stringify(users));
    }
  }, [users]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const activeUser = users.find(u => u.id === activeUserId) || null;

  // Initialize session and listen for auth changes
  useEffect(() => {
    setIsMounted(true);

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setActiveUserId(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setActiveUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    // 1. Fetch all Profiles
    const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
    if (pError || !profiles) {
      console.error("Error fetching profiles:", pError);
      return;
    }

    const profileIds = profiles.map(p => p.id);

    // 2. Fetch ALL transactions and messages for these profiles in just 2 calls (Batch Fetching)
    const [ { data: allTxs }, { data: allMsgs } ] = await Promise.all([
      supabase.from('transactions').select('*').in('user_id', profileIds).order('created_at', { ascending: false }),
      supabase.from('messages').select('*').in('user_id', profileIds).order('created_at', { ascending: false })
    ]);

    // 3. Map everything in memory (Super Fast)
    const enrichedUsers = profiles.map((p: any) => {
      const userTxs = (allTxs || []).filter((t: any) => t.user_id === p.id);
      const userMsgs = (allMsgs || []).filter((m: any) => m.user_id === p.id);

      const groups: TransactionGroup[] = [];
      if (userTxs.length > 0) {
        const today = userTxs.filter((t: any) => t.date === 'Today');
        const others = userTxs.filter((t: any) => t.date !== 'Today');
        if (today.length > 0) groups.push({ id: 1, date: 'Today', items: today });
        if (others.length > 0) groups.push({ id: 2, date: 'Other', items: others });
      }

      return {
        id: p.id,
        username: p.email,
        profileName: p.profile_name,
        country: p.country,
        phone: p.phone,
        address: p.address,
        isVerified: p.is_verified || (typeof window !== 'undefined' && localStorage.getItem(`verified_${p.id}`) === 'true'),
        status: p.status as UserStatus,
        balance: parseFloat(p.balance),
        vaultBalance: parseFloat(p.vault_balance),
        cardNumber: p.card_number,
        transactions: groups,
        messages: userMsgs.map((m: any) => ({
          id: m.id,
          iconType: m.icon_type,
          title: m.title,
          body: m.body,
          time: m.time,
          alert: m.alert
        }))
      } as UserAccount;
    });

    setUsers(enrichedUsers);
  };

  // Fetch all users (for admin) and current user data
  useEffect(() => {
    fetchData();

    // Set up real-time subscription for profiles, transactions, and messages
    const profileSub = supabase.channel('profiles-db-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchData).subscribe();
    const txSub = supabase.channel('tx-db-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchData).subscribe();
    const msgSub = supabase.channel('msg-db-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchData).subscribe();

    return () => {
      profileSub.unsubscribe();
      txSub.unsubscribe();
      msgSub.unsubscribe();
    };
  }, []);

  const sendEmail = async (to: string, subject: string, html: string) => {
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html }),
      });
    } catch (error) {
      console.error("Email error:", error);
    }
  };

  // Inactivity Timer (10 Minutes)
  useEffect(() => {
    if (!activeUserId) return;

    let timeoutId: any;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log("Inactivity logout triggered");
        logout();
      }, 10 * 60 * 1000); // 10 Minutes
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [activeUserId]);

  const createAccount = async (email: string, fullName: string, country: string) => {
    // This is handled by supabase.auth.signUp in LoginPage
    console.log("Account creation handled by LoginPage");
  };

  const login = async (email: string) => {
    // This is handled by supabase.auth.signIn in LoginPage
    console.log("Login handled by LoginPage");
  };

  const verifyAccount = async (userId: string) => {
    // Optimistic update
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: true } : u));
    
    const { error } = await supabase.from('profiles').update({ is_verified: true }).eq('id', userId);
    if (error) {
      console.error("Error verifying account:", error);
    } else {
      fetchData(); // Refresh to be sure
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('northone_users_cache');
    setActiveUserId(null);
  };

  const updateProfile = async (userId: string, updates: Partial<{ username: string; profileName: string; status: UserStatus }>) => {
    const dbUpdates: any = {};
    if (updates.profileName) dbUpdates.profile_name = updates.profileName;
    if (updates.status) dbUpdates.status = updates.status;
    
    await supabase.from('profiles').update(dbUpdates).eq('id', userId);
  };

  const updateBalance = async (userId: string, amount: number, type: 'credit' | 'debit', description: string, senderDetails?: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newBalance = type === 'credit' ? user.balance + amount : user.balance - amount;
    
    // Update balance
    await supabase.from('profiles').update({ balance: newBalance }).eq('id', userId);

    // Add transaction
    await supabase.from('transactions').insert({
      user_id: userId,
      type: type === 'credit' ? 'deposit' : 'withdrawal',
      merchant: senderDetails ? (description ? `${description} - From: ${senderDetails}` : `From: ${senderDetails}`) : description,
      category: type === 'credit' ? 'Credited' : 'Debited',
      amount: amount,
      pending: false,
      date: 'Today'
    });
  };

  const approveTransaction = async (userId: string, transactionId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const txs = user.transactions.flatMap(g => g.items);
    const tx = txs.find(t => t.id === transactionId);
    if (!tx) return;

    const amountToDeduct = tx.amount;
    const merchantName = tx.merchant;
    const cashback = amountToDeduct * 0.02;

    try {
      // 1. Update transaction status
      const { error: txError } = await supabase.from('transactions').update({ pending: false }).eq('id', transactionId);
      if (txError) throw txError;

      // 2. Update balance and vault
      const { error: pError } = await supabase.from('profiles').update({ 
        balance: user.balance - amountToDeduct,
        vault_balance: user.vaultBalance + cashback
      }).eq('id', userId);
      if (pError) throw pError;

      // 3. Add success message
      await supabase.from('messages').insert({
        user_id: userId,
        icon_type: 'success',
        title: "Transaction Completed",
        body: `Your transaction of $${amountToDeduct.toLocaleString('en-US', {minimumFractionDigits: 2})} to ${merchantName} was successfully completed. You earned $${cashback.toLocaleString('en-US', {minimumFractionDigits: 2})} in Vault cashback!`,
        time: "Just now",
        alert: false
      });

      // 4. Send Email
      await sendEmail(user.username, "Transaction Successful - NorthOne Bank", `
        <div style="font-family: sans-serif; padding: 20px; color: #111;">
          <h2 style="color: #5cb85c;">Transaction Completed</h2>
          <p>Hello <b>${user.profileName}</b>,</p>
          <p>Your transaction of <b>$${amountToDeduct.toLocaleString()}</b> to <b>${merchantName}</b> was successful.</p>
          <p>You have earned <b>$${cashback.toLocaleString()}</b> in Vault cashback!</p>
          <br/>
          <p>Thank you for choosing NorthOne.</p>
        </div>
      `);

      console.log("Transaction approved successfully");
      fetchData(); // Force refresh
    } catch (error) {
      console.error("Error approving transaction:", error);
      alert("Failed to approve transaction. See console for details.");
    }
  };

  const declineTransaction = async (userId: string, transactionId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const txs = user.transactions.flatMap(g => g.items);
    const tx = txs.find(t => t.id === transactionId);
    if (!tx) return;

    try {
      // 1. Update transaction to declined state
      const { error: txError } = await supabase.from('transactions').update({ 
        pending: false,
        category: 'Failed',
        merchant: tx.merchant + ' (Declined)'
      }).eq('id', transactionId);
      if (txError) throw txError;

      // 2. Add error message for user
      await supabase.from('messages').insert({
        user_id: userId,
        icon_type: 'error',
        title: "Transaction Failed",
        body: `Your transaction of $${tx.amount.toLocaleString('en-US', {minimumFractionDigits: 2})} to ${tx.merchant} failed and was declined by your bank.`,
        time: "Just now",
        alert: true
      });

      // 3. Send Email
      await sendEmail(user.username, "Transaction Declined - NorthOne Bank", `
        <div style="font-family: sans-serif; padding: 20px; color: #111;">
          <h2 style="color: #d9534f;">Transaction Declined</h2>
          <p>Hello <b>${user.profileName}</b>,</p>
          <p>Your transaction of <b>$${tx.amount.toLocaleString()}</b> to <b>${tx.merchant}</b> was declined by your bank.</p>
          <p>No funds were deducted from your account.</p>
          <br/>
          <p>If you have questions, please contact support.</p>
        </div>
      `);

      console.log("Transaction declined successfully");
      fetchData(); // Force refresh
    } catch (error) {
      console.error("Error declining transaction:", error);
      alert("Failed to decline transaction. See console for details.");
    }
  };

  const addTransaction = async (transaction: any) => {
    if (!activeUserId) return;
    
    // Remove client-side temp ID so Supabase can generate a valid UUID
    const { id, ...txData } = transaction;
    
    const { error } = await supabase.from('transactions').insert({
      ...txData,
      user_id: activeUserId,
      date: 'Today'
    });

    if (error) {
      console.error("Error adding transaction:", error);
      alert("Failed to record transaction. Please check your connection.");
    } else {
      console.log("Transaction recorded successfully");
      fetchData(); // Trigger refresh
    }
  };

  const deleteTransaction = async (transactionId: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', transactionId);
    if (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction.");
    } else {
      fetchData();
    }
  };

  const stashVault = async (userId: string, amount: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Optimistic Update
    const newBalance = user.balance - amount;
    const newVaultBalance = user.vaultBalance + amount;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, balance: newBalance, vaultBalance: newVaultBalance } : u));

    try {
      const { error } = await supabase.from('profiles').update({ 
        balance: newBalance, 
        vault_balance: newVaultBalance 
      }).eq('id', userId);
      
      if (error) throw error;
      fetchData(); // Confirm with server
    } catch (err) {
      console.error("Stash error:", err);
      fetchData(); // Revert to server state
    }
  };

  const unstashVault = async (userId: string, amount: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // Optimistic Update
    const newBalance = user.balance + amount;
    const newVaultBalance = user.vaultBalance - amount;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, balance: newBalance, vaultBalance: newVaultBalance } : u));

    try {
      const { error } = await supabase.from('profiles').update({ 
        balance: newBalance, 
        vault_balance: newVaultBalance 
      }).eq('id', userId);

      if (error) throw error;
      fetchData(); // Confirm with server
    } catch (err) {
      console.error("Unstash error:", err);
      fetchData(); // Revert to server state
    }
  };

  const addMessage = async (message: any) => {
    if (!activeUserId) return;
    await supabase.from('messages').insert({
      ...message,
      user_id: activeUserId
    });
    fetchData();
  };

  const deleteMessage = async (messageId: number) => {
    const { error } = await supabase.from('messages').delete().eq('id', messageId);
    if (error) {
      console.error("Error deleting message:", error);
    } else {
      fetchData();
    }
  };

  const clearUserData = async (userId: string) => {
    try {
      // Delete all transactions for this user
      await supabase.from('transactions').delete().eq('user_id', userId);
      // Delete all messages/notifications for this user
      await supabase.from('messages').delete().eq('user_id', userId);
      
      console.log("User data cleared successfully");
      fetchData();
    } catch (err) {
      console.error("Error clearing user data:", err);
      alert("Failed to clear data.");
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // 1. Delete from profiles (Cascades to transactions/messages)
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;

      // 2. Delete from Supabase Auth (Permanent)
      await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      console.log("User deleted permanently from DB and Auth");
      fetchData();
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user. Please try again.");
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
      clearUserData,
      addTransaction,
      deleteTransaction,
      stashVault,
      unstashVault,
      addMessage,
      deleteMessage
    }}>
      {children}
    </BankContext.Provider>
  );
};

export const useBank = () => useContext(BankContext);
