'use client';
import { motion } from 'framer-motion';

const ActionButton = ({ onClick, isBlocked }) => {
    let config;
    
    if (isBlocked) {
        config = {
            text: 'Você já possui um chamado em andamento',
            className: 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-300 text-center',
            disabled: true,
        };
    } else {
        config = {
            text: 'Atribuir para Mim',
            className: 'bg-green-600 text-white hover:bg-green-700 active:scale-95 cursor-pointer',
            disabled: false,
        };
    }

    return (
        <button
            onClick={onClick} 
            disabled={config.disabled}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all w-full sm:w-auto ${config.className}`}
        >
            {config.text}
        </button>
    );
};

export default ActionButton;
