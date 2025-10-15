'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div
      className="bg-white rounded-xl shadow-md border border-red-100 cursor-pointer focus-within:ring-2 focus-within:ring-red-400"
      onClick={toggleOpen}
      aria-expanded={isOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleOpen(); }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="font-semibold text-lg text-red-700">{question}</h3>
        <span className="text-red-600">{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
      </div>
      <motion.div
        initial={false}
        animate={{ maxHeight: isOpen ? 200 : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.15, ease: 'linear' }}
        className="px-4 pb-4 text-gray-700 text-md overflow-hidden whitespace-normal break-words"
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      >
        <p>{answer}</p>
      </motion.div>
    </div>
  );
}
