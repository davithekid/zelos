'use client';
import { motion } from 'framer-motion';

export default function FeatureCard({ icon, title, description }) {
  return (
    <motion.div
      className="bg-red-50 rounded-lg p-6 shadow-md flex flex-col items-center text-red-700 cursor-default hover:shadow-xl transition-transform duration-300"
      whileHover={{ scale: 1.07 }}
      title={title}
      role="region"
      aria-label={title}
      tabIndex={-1}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="font-semibold text-xl mb-2">{title}</h3>
      <p className="text-sm max-w-xs">{description}</p>
    </motion.div>
  );
}
