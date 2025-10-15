'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function FaqTecnico({ faqs }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleOpen = (index) => setOpenIndex(openIndex === index ? null : index);

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-5xl mx-auto p-8 bg-red-50 rounded-2xl shadow-lg my-20"
      aria-label="Perguntas Frequentes do Técnico"
    >
      <h2 className="text-4xl font-extrabold text-red-600 text-center mb-12">
        Dúvidas Comuns da Equipe
      </h2>

      <div className="space-y-4">
        {faqs.map(({ question, answer }, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="bg-white rounded-xl shadow-md border border-red-100 cursor-pointer focus-within:ring-2 focus-within:ring-red-400"
              onClick={() => toggleOpen(i)}
              aria-expanded={isOpen}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleOpen(i); }}
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
        })}
      </div>
    </motion.section>
  );
}
