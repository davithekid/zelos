'use client'
import { motion, AnimatePresence } from 'framer-motion';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, chamadoId }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-50 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm"
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    >
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Confirmar Atribuição</h2>
                        <p className="text-gray-600 mb-6">
                            Você tem certeza que deseja <b>atribuir</b> este chamado para você?
                            <br />
                            <b>Esta ação não pode ser desfeita facilmente.</b>
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm(chamadoId);
                                    onClose();
                                }}
                                className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-500 text-white hover:bg-red-700 cursor-pointer active:scale-95 transition-all"
                            >
                                Confirmar e Atribuir
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;