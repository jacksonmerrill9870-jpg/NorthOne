import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User as UserIcon } from 'lucide-react';
import styles from './ChatBotModal.module.css';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
}

interface ChatBotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FAQ = [
  "How do I reset my password?",
  "How do I lock my card?",
  "What are your wire transfer fees?",
  "Speak to a human agent"
];

export default function ChatBotModal({ isOpen, onClose }: ChatBotModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: 'Hello! I am your NorthOne virtual assistant. How can I help you today? You can ask me questions or select one of the common topics below.' }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Simulate bot thinking
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let botResponse = "I'm sorry, I didn't quite catch that. Could you please rephrase?";

      if (lowerText.includes('human') || lowerText.includes('agent') || lowerText.includes('speak') || lowerText.includes('talk')) {
        botResponse = "I am connecting you with our support team. You can reach our customer service directly at customer@gmail.com or call us at 000000000.";
      } else if (lowerText.includes('password')) {
        botResponse = "To reset your password, go to Settings > Security and tap on 'Change Password'.";
      } else if (lowerText.includes('card') || lowerText.includes('lock')) {
        botResponse = "You can lock your card temporarily by navigating to Settings > Card Management.";
      } else if (lowerText.includes('fee') || lowerText.includes('wire')) {
        botResponse = "Standard incoming domestic wires are $15. Outgoing domestic wires are $20.";
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'bot', text: botResponse }]);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <motion.div 
        className={styles.modal}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <Bot size={24} color="#5cb85c" />
            <h3>Support Assistant</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
        </div>

        <div className={styles.chatContainer}>
          {messages.map(msg => (
            <div key={msg.id} className={`${styles.messageWrapper} ${msg.sender === 'user' ? styles.userWrapper : styles.botWrapper}`}>
              {msg.sender === 'bot' && <div className={styles.avatar}><Bot size={16} color="#fff" /></div>}
              <div className={`${styles.messageBubble} ${msg.sender === 'user' ? styles.userBubble : styles.botBubble}`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.faqSection}>
          {FAQ.map((q, idx) => (
            <button key={idx} className={styles.faqChip} onClick={() => handleSend(q)}>
              {q}
            </button>
          ))}
        </div>

        <div className={styles.inputArea}>
          <input 
            type="text" 
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend(inputText)}
            placeholder="Type your message..."
            className={styles.input}
          />
          <button className={styles.sendBtn} onClick={() => handleSend(inputText)}>
            <Send size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
