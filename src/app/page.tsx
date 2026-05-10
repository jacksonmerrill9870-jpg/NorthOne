"use client";

import { AnimatePresence } from 'framer-motion';
import LoginPage from "@/components/LoginPage";
import BankingApp from "@/components/BankingApp";
import { useBank } from '@/app/context/BankContext';

export default function Home() {
  const bank = useBank();

  return (
    <main>
      <AnimatePresence mode="wait">
        {!bank.activeUserId ? (
          <LoginPage key="login" onLoginSuccess={() => {}} />
        ) : (
          <BankingApp key="app" />
        )}
      </AnimatePresence>
    </main>
  );
}
