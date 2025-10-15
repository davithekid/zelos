'use client';

import { motion, AnimatePresence } from 'framer-motion';

export default function ModalAtribuicao({ aberto, onClose }) {
  const handleFecharERecarregar = () => {
    if (onClose) onClose();

    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }, 200);
  };

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          key="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50"
          onClick={handleFecharERecarregar}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-lg"
            onClick={(e) => e.stopPropagation()} 
          >
            <h3 className="text-2xl font-extrabold text-red-600 mb-4">
              Chamado Atribuído com Sucesso!
            </h3>

            <p className="text-gray-700 mb-6">
              O chamado atribuído foi adicionado ao seu perfil. Agora você pode vê-lo e gerenciar as
              atividades na sua área de Chamados Ativos.
            </p>

            <button
              onClick={handleFecharERecarregar}
              className="mt-2 bg-red-600 text-white py-3 px-6 rounded-xl font-semibold shadow hover:bg-red-700 transition cursor-pointer"
            >
              Fechar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
