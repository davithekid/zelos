'use client';

import { motion } from 'framer-motion';
import { Calendar, UserCircle, Tag, CheckCircle, XCircle } from 'lucide-react';

const formatarDataFinalizacao = (dataString) => {
    if (!dataString) return 'Data indisponível';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dataString).toLocaleDateString('pt-BR', options);
};

const StatusBadge = ({ status }) => {
    const isConcluido = status === 'concluido';
    const config = {
        icon: isConcluido ? <CheckCircle size={14} /> : <XCircle size={14} />,
        text: isConcluido ? 'Concluído' : 'Cancelado',
        className: isConcluido ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}>
            {config.icon}
            {config.text}
        </span>
    );
};


export default function HistoricoCard({ chamado }) {
    if (!chamado) return null;

    const usuarioNome = chamado.usuario?.nome || "Solicitante desconhecido";
    const patrimonio = chamado.numero_patrimonio || 'N/A';
    
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-white rounded-2xl shadow-subtle border border-gray-200/80 p-5 flex flex-col h-full cursor-pointer"
        >
            <header className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-gray-800 text-lg line-clamp-2 pr-4">{chamado.titulo}</h3>
                <StatusBadge status={chamado.status} />
            </header>

            <div className="text-sm text-gray-600 flex-grow space-y-3 mt-2">
                <div className="flex items-center gap-2">
                    <UserCircle size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">Solicitado por: <span className="font-medium text-gray-900">{usuarioNome}</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <Tag size={16} className="text-gray-400 flex-shrink-0" />
                    <span>Patrimônio: <span className="font-medium text-gray-900">{patrimonio}</span></span>
                </div>
            </div>

            <footer className="mt-5 pt-4 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>Finalizado em: {formatarDataFinalizacao(chamado.atualizado_em)}</span>
                </div>
                <span className="font-mono text-gray-400">ID: #{chamado.id}</span>
            </footer>
        </motion.div>
    );
}