'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function ModalImagem({ url, onClose }) {
  if (!url) return null;
  const getSafeUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:3001${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
  };

  const safeUrl = getSafeUrl(url);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative rounded-lg shadow-2xl max-w-4xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold shadow-lg hover:bg-gray-200 transition-colors z-10"
        >
          &times;
        </button>
        
        <div className="relative w-full h-full">
          <Image
            src={safeUrl}
            alt="Visualização ampliada da imagem do chamado"
            width={800}
            height={600}
            className="object-contain rounded-md max-h-[85vh] max-w-full"
            onError={(e) => {
              console.error('Erro ao carregar imagem:', url);
              e.target.style.display = 'none';
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}