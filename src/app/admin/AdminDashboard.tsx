"use client";

import React, { useState, useEffect } from 'react';
import { useBank, UserStatus, UserAccount } from '@/app/context/BankContext';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const bank = useBank();
  
  // Local state for selecting which user to manage
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Auto-select first user if none selected
  useEffect(() => {
    if (bank.users.length > 0 && !selectedUserId) {
      setSelectedUserId(bank.users[bank.users.length - 1].id); // Select most recent by default
    }
  }, [bank.users, selectedUserId]);

  const selectedUser = bank.users.find(u => u.id === selectedUserId) || null;

  // Local form states
  const [newUsername, setNewUsername] = useState('');
  const [newProfileName, setNewProfileName] = useState('');
  const [fundAmount, setFundAmount] = useState('');
  const [fundType, setFundType] = useState<'credit' | 'debit'>('credit');
  const [fundDesc, setFundDesc] = useState('');
  const [senderDetails, setSenderDetails] = useState('');
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Sync form state when selected user changes
  useEffect(() => {
    if (selectedUser) {
      setNewUsername(selectedUser.username);
      setNewProfileName(selectedUser.profileName);
    }
  }, [selectedUser]);

  if (!selectedUser) return <div className={styles.adminContainer}>No users found.</div>;

  const handleUpdateProfile = () => {
    bank.updateProfile(selectedUser.id, { username: newUsername, profileName: newProfileName });
    alert('Profile updated');
  };

  const handleStatusChange = (status: UserStatus) => {
    bank.updateProfile(selectedUser.id, { status });
  };

  const handleFundAction = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Invalid amount");
      return;
    }
    bank.updateBalance(selectedUser.id, amount, fundType, fundDesc, fundType === 'credit' ? senderDetails : undefined);
    alert(`Funds ${fundType === 'credit' ? 'added' : 'removed'} successfully`);
    setFundAmount('');
    setFundDesc('');
    setSenderDetails('');
  };

  const handleDeleteUser = () => {
    if (confirm(`Are you sure you want to permanently delete user ${selectedUser.username}?`)) {
      bank.deleteUser(selectedUserId);
      setSelectedUserId('');
    }
  };

  const handleChangePassword = async () => {
    if (!adminNewPassword || adminNewPassword.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: selectedUser.username, newPassword: adminNewPassword }),
      });

      const result = await response.json();
      if (response.ok) {
        alert(`Password for ${selectedUser.profileName} updated successfully!`);
        setAdminNewPassword('');
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      alert("Failed to update password. Please check your connection.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        
        <div className={styles.userSelector}>
          <label>Manage User: </label>
          <select 
            value={selectedUserId} 
            onChange={(e) => setSelectedUserId(e.target.value)}
            className={styles.selectUserDropdown}
          >
            {bank.users.map(u => (
              <option key={u.id} value={u.id}>{u.profileName} ({u.username})</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Profile Management */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>User Profile</h2>
          <div className={styles.formGroup}>
            <label>Username (Email)</label>
            <input className={styles.input} value={newUsername} onChange={e => setNewUsername(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label>Profile Name</label>
            <input className={styles.input} value={newProfileName} onChange={e => setNewProfileName(e.target.value)} />
          </div>
          <button className={styles.button} onClick={handleUpdateProfile}>Update Profile</button>

          <div className={styles.statusSection}>
            <h3 className={styles.subTitle}>Account Status: <span className={styles.badge}>{selectedUser.status}</span></h3>
            <div className={styles.buttonGroup}>
              <button className={`${styles.button} ${selectedUser.status === 'active' ? styles.active : ''}`} onClick={() => handleStatusChange('active')}>Active</button>
              <button className={`${styles.button} ${selectedUser.status === 'restricted' ? styles.restricted : ''}`} onClick={() => handleStatusChange('restricted')}>Restricted</button>
              <button className={`${styles.button} ${selectedUser.status === 'frozen' ? styles.frozen : ''}`} onClick={() => handleStatusChange('frozen')}>Frozen</button>
            </div>
            <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <button 
                className={styles.button} 
                style={{ backgroundColor: '#d9534f', color: '#fff', width: '100%' }}
                onClick={handleDeleteUser}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>

        {/* Add/Remove Funds */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Manage Funds</h2>
          <form onSubmit={handleFundAction}>
            <div className={styles.formGroup}>
              <label>Action Type</label>
              <select className={styles.input} value={fundType} onChange={e => setFundType(e.target.value as any)}>
                <option value="credit">Add Funds (Credit)</option>
                <option value="debit">Remove Funds (Debit)</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Amount</label>
              <input type="number" step="0.01" className={styles.input} value={fundAmount} onChange={e => setFundAmount(e.target.value)} required />
            </div>
            <div className={styles.formGroup}>
              <label>Description</label>
              <input className={styles.input} value={fundDesc} onChange={e => setFundDesc(e.target.value)} placeholder="e.g. Wire Transfer" />
            </div>
            {fundType === 'credit' && (
              <div className={styles.formGroup}>
                <label>Sender Details</label>
                <input className={styles.input} value={senderDetails} onChange={e => setSenderDetails(e.target.value)} placeholder="e.g. John Doe - Chase Bank" />
              </div>
            )}
            <button type="submit" className={styles.button}>Execute</button>
          </form>
        </div>

        {/* Security Settings - Change Password */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Security Settings</h2>
          <div className={styles.formGroup}>
            <label>Reset User Password</label>
            <input 
              type="text" 
              className={styles.input} 
              value={adminNewPassword} 
              onChange={e => setAdminNewPassword(e.target.value)} 
              placeholder="Enter new password"
            />
            <p className={styles.hint} style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
              Minimum 8 characters. User will be able to log in with this password immediately.
            </p>
          </div>
          <button 
            className={styles.button} 
            disabled={isChangingPassword}
            onClick={handleChangePassword}
          >
            {isChangingPassword ? 'Updating...' : 'Change Password'}
          </button>
        </div>

        {/* Pending Transactions */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Pending Transactions</h2>
          {selectedUser.transactions.map(group => (
            group.items.filter(t => t.pending).map(t => (
              <div key={t.id} className={styles.transactionItem}>
                <div>
                  <p className={styles.txMerchant}>{t.merchant}</p>
                  <p className={styles.txAmount}>${t.amount.toLocaleString()}</p>
                </div>
                <div className={styles.txActions}>
                  <button className={`${styles.button} ${styles.approve}`} onClick={() => bank.approveTransaction(selectedUser.id, t.id)}>Approve</button>
                  <button className={`${styles.button} ${styles.decline}`} onClick={() => bank.declineTransaction(selectedUser.id, t.id)}>Decline</button>
                </div>
              </div>
            ))
          ))}
          {selectedUser.transactions.flatMap(g => g.items).filter(t => t.pending).length === 0 && (
            <p className={styles.emptyState}>No pending transactions.</p>
          )}
        </div>
      </div>
    </div>
  );
}
