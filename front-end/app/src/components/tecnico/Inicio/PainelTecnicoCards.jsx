'use client';
import { motion } from 'framer-motion';

export default function PainelTecnicoCards({ cards, setActiveTab }) {
  return (
    <div className="flex flex-col sm:flex-row justify-center gap-12 mb-16">
      {cards.map(({ icon, title, description, action }, i) => (
        <motion.div
          key={i}
          className="bg-red-50 rounded-lg p-6 shadow-md flex flex-col items-center text-red-700 hover:shadow-xl transition-transform duration-300"
          whileHover={{ scale: 1.07 }}
          title={title}
          role="region"
          aria-label={title}
          tabIndex={0}
          onClick={action}
        >
          <div className="mb-4">{icon}</div>
          <h3 className="font-semibold text-xl mb-2">{title}</h3>
          <p className="text-sm max-w-xs">{description}</p>
        </motion.div>
      ))}
    </div>
  );
}
