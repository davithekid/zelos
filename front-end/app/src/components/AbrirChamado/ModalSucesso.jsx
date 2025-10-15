'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

export default function ModalSucesso({ aberto, onFechar }) {
  return (
    <AnimatePresence>
      {aberto && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center relative shadow-lg">
            <button onClick={onFechar} className="absolute top-4 right-4 text-red-500 hover:text-red-600 transition cursor-pointer"><FaTimes size={24} /></button>
            <h3 className="text-2xl font-extrabold text-red-600 mb-4">Chamado Enviado!</h3>
            <p className="text-gray-700 mb-6">Seu chamado foi enviado com sucesso. Nossa equipe entrará em contato em breve.</p>
            <button onClick={onFechar} className="mt-2 bg-red-600 text-white py-3 px-6 rounded-xl font-semibold shadow hover:bg-red-700 transition cursor-pointer">Fechar</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
