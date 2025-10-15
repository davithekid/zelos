'use client';

import { useState, useEffect } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function ProfileDropdown({ funcionario, getInitials, isProfileOpen, setProfileOpen, handleSelecao, dropdownRef, handleLogout }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button 
        onClick={() => setProfileOpen(!isProfileOpen)} 
        className="flex items-center space-x-2 p-1 rounded-full transition-colors cursor-pointer hover:bg-gray-100" 
        whileTap={{ scale: 0.95 }}
      >
        <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-inner">
          {getInitials(funcionario.nome)}
        </div>
        <div className="hidden md:flex flex-col items-start">
          <span className="font-semibold text-sm text-gray-700">{funcionario.nome}</span>
          <span className="text-xs text-gray-500">{funcionario.funcao}</span>
        </div>
        <motion.div className={`w-4 h-4 text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}></motion.div>
      </motion.button>
      {hasMounted && (
        <AnimatePresence>
          {isProfileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute right-0 mt-3 w-56 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
            >
              <div className="p-4 border-b">
                <p className="font-semibold text-gray-800">{funcionario.nome}</p>
                <p className="text-sm text-gray-500">Matrícula: {funcionario.matricula}</p>
              </div>
              <button 
                onClick={handleLogout} 
                className="w-full px-4 py-3 text-left cursor-pointer text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" /> <span>Sair da Conta</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}