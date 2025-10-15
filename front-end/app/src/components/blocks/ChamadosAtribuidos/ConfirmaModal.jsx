'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiLoader } from 'react-icons/fi';

export default function ConfirmaModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading,
  confirmText = "Sim, confirmar",
  cancelText = "Não, voltar",
  confirmColor = "red" 
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 30 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="bg-white rounded-2xl w-full max-w-md text-center p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <FiAlertTriangle className={`mx-auto text-${confirmColor}-500 text-5xl mb-4`} />
          <h3 className="font-bold text-xl text-gray-800">{title}</h3>
          <p className="text-gray-600 my-4 text-sm leading-relaxed">{message}</p>
          <div className="flex gap-4 justify-center mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={onClose} disabled={isLoading}
              className="py-2.5 px-6 rounded-lg bg-gray-200 hover:bg-gray-300 font-semibold text-gray-800 transition"
            >
              {cancelText}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={onConfirm} disabled={isLoading}
              className={`py-2.5 px-6 rounded-lg text-white bg-${confirmColor}-600 hover:bg-${confirmColor}-700 font-bold flex items-center justify-center gap-2 min-w-[140px] transition disabled:bg-${confirmColor}-400`}
            >
              {isLoading ? <FiLoader className="animate-spin"/> : confirmText}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}