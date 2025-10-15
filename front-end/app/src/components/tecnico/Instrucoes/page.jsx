'use client';

import { motion } from "framer-motion";

export default function InstrucoesRapidas({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50"
            onClick={onClose}
        >
            <motion.div
                className="bg-white rounded-xl max-w-md w-full p-6 relative"
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
                <h2 className="text-xl font-semibold mb-4 text-red-700">Como abrir um chamado?</h2>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Clique no botão <strong className='text-red-700'>Abrir Chamado</strong>.</li>
                    <li>Preencha o formulário com detalhes do problema.</li>
                    <li>Informe a categoria e a prioridade do chamado.</li>
                    <li>Anexe imagens ou documentos se for necessário.</li>
                    <li>Clique em <strong className='text-red-700'>Enviar</strong> e aguarde o retorno da equipe de suporte.</li>
                </ol>
                <p className="mt-4 text-sm text-gray-500">
                    Em caso de dúvidas, contate o suporte pelo telefone: (xx) xxxx-xxxx.
                </p>
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600 text-xl font-bold transition duration-200 cursor-pointer"
                    aria-label="Fechar instruções"
                >
                    ×
                </button>
            </motion.div>
        </div>
    );
}
