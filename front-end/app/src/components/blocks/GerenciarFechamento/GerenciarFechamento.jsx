'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiInbox, FiCheck, FiX, FiLoader, FiAlertTriangle, FiCheckSquare, FiInfo, FiHash, FiUser, FiPackage, FiCalendar, FiClock } from 'react-icons/fi';
import api from '../../../app/lib/api';
import { toast } from 'sonner'; 

const formatDateTime = (dateString) => {
    if (!dateString) return 'Em andamento';
    const date = new Date(dateString);
    if (isNaN(date)) return 'Data inválida';
    return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    });
};

const ApontamentoItem = ({ apontamento }) => {
    const inicio = formatDateTime(apontamento.comeco);
    const fim = formatDateTime(apontamento.fim);
    const isConcluido = !!apontamento.fim;
    
    const duracao = (() => {
        if (!apontamento.fim) return 'Em curso';
        const start = new Date(apontamento.comeco);
        const end = new Date(apontamento.fim);
        const diffInMs = Math.abs(end - start);
        const hours = Math.floor(diffInMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    })();

    return (
        <div className="border-l-4 border-red-500 bg-white p-4 shadow-sm rounded-lg space-y-2">
            <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-gray-800 flex items-center gap-1">
                    <FiCalendar size={14}/> {inicio}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${isConcluido ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {isConcluido ? 'Concluído' : 'Em Andamento'}
                </span>
            </div>
            <p className="text-gray-700 text-sm italic whitespace-pre-wrap mt-1 border-t pt-2">
                {apontamento.descricao || 'Nenhuma descrição fornecida.'}
            </p>
            <div className="text-xs text-gray-500 pt-1 flex justify-between">
                <span>Fim: {fim}</span>
                <span className="font-bold text-gray-800">Duração: {duracao}</span>
            </div>
        </div>
    );
}

function FechamentoDetalheModal({ pedido, onClose, onResponder, isLoading }) {
    if (!pedido) return null;

    const { chamado, tecnico } = pedido;
    const apontamentos = chamado.apontamentos || [];

    const handleAprovar = () => onResponder(pedido.id, 'aprovado');
    const handleReprovar = () => onResponder(pedido.id, 'reprovado');

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}>
            <motion.div initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }}
                className="bg-zinc-50 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}>

                <header className="p-6 bg-red-600 text-white flex justify-between items-center sticky top-0 z-10">
                    <h3 className="font-extrabold text-2xl flex items-center gap-2">
                        <FiInfo /> Detalhes do Pedido #{pedido.id}
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-red-700 transition"><FiX size={24} /></button>
                </header>

                <div className="p-6 overflow-y-auto flex-1">
                    <section className="mb-6 pb-4 border-b border-gray-200">
                        <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <FiHash className="text-red-600" /> Chamado: {chamado.titulo}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                            <p className="flex items-center gap-2"><FiPackage className="text-red-500"/> Patrimônio: <span className="font-semibold">{chamado.numero_patrimonio || 'N/A'}</span></p>
                            <p className="flex items-center gap-2"><FiUser className="text-red-500"/> Técnico: <span className="font-semibold">{tecnico.nome}</span></p>
                            <p className="flex items-center gap-2"><FiCalendar className="text-red-500"/> Abertura: <span className="font-semibold">{formatDateTime(chamado.data_abertura)}</span></p>
                        </div>
                    </section>

                    <section>
                        <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FiClock className="text-red-600" /> Apontamentos de Trabalho ({apontamentos.length})
                        </h4>
                        <div className="space-y-4">
                            {apontamentos.length > 0 ? (
                                apontamentos.map((ap) => (
                                    <ApontamentoItem key={ap.id} apontamento={ap} />
                                ))
                            ) : (
                                <div className="text-center py-5 bg-white rounded-lg shadow-inner text-gray-500">
                                    Nenhum apontamento registrado para este chamado.
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <footer className="p-4 bg-white border-t flex justify-end gap-3 sticky bottom-0 z-10">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={handleReprovar}
                        disabled={isLoading}
                        className="py-2 px-6 rounded-lg text-white bg-red-600 hover:bg-red-700 font-semibold flex items-center justify-center gap-2 disabled:bg-red-400">
                        {isLoading ? <FiLoader className="animate-spin"/> : <FiX />} Reprovar
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={handleAprovar}
                        disabled={isLoading}
                        className="py-2 px-6 rounded-lg text-white bg-green-600 hover:bg-green-700 font-semibold flex items-center justify-center gap-2 disabled:bg-green-400">
                        {isLoading ? <FiLoader className="animate-spin"/> : <FiCheck />} Aprovar
                    </motion.button>
                </footer>
            </motion.div>
        </motion.div>
    );
}

const FechamentoCard = ({ pedido, onOpenDetails }) => (
    <motion.div
        layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }}
        onClick={() => onOpenDetails(pedido)} 
        className="bg-white p-5 rounded-xl shadow-subtle border border-green-200/80 flex items-center justify-between gap-4 cursor-pointer hover:shadow-lg transition-all"
    >
        <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800 truncate" title={pedido.chamado.titulo}>
                <span className="text-red-600 mr-2 font-mono">#{pedido.chamado.id}</span>
                {pedido.chamado.titulo}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-sm mt-2 text-gray-500">
                <span>Patrimônio: <span className="font-semibold text-gray-700">{pedido.chamado.numero_patrimonio || 'N/A'}</span></span>
                <span>Técnico: <span className="font-semibold text-gray-700">{pedido.tecnico.nome}</span></span>
            </div>
        </div>
        <div className="flex-shrink-0">
            <button className="bg-red-100 text-red-600 font-semibold py-1.5 px-3 rounded-full text-sm flex items-center gap-1 hover:bg-red-200 transition">
                <FiInfo size={14} /> Ver Detalhes
            </button>
        </div>
    </motion.div>
);


export default function GerenciarFechamentos() {
    const [pedidos, setPedidos] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedPedido, setSelectedPedido] = useState(null);

    const fetchPedidos = async () => {
        setPageLoading(true);
        try {
            const response = await api.get('/pedidos-fechamento/pendentes');
            setPedidos(response.data);
        } catch (error) {
            console.error("Erro ao buscar pedidos de fechamento:", error);
            toast.error("Falha ao carregar pedidos de fechamento."); 
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        fetchPedidos();
    }, []);

    const handleResponder = async (pedidoId, status) => {
        setActionLoading(true);
        try {
            await api.patch(`/pedidos-fechamento/${pedidoId}/responder`, { status });
            
            setPedidos(prev => prev.filter(p => p.id !== pedidoId));
            
            toast.success(`Pedido de fechamento ${status === 'aprovado' ? 'aprovado' : 'reprovado'} com sucesso!`); 
            
            setIsDetailModalOpen(false);
            setSelectedPedido(null);
            
        } catch (error) {
            console.error("Erro ao responder pedido:", error);
            toast.error(error.response?.data?.message || `Falha ao ${status === 'aprovado' ? 'aprovar' : 'reprovar'} pedido.`); 
        } finally {
            setActionLoading(false);
        }
    };
    
    const openDetailsModal = useCallback((pedido) => {
        setSelectedPedido(pedido);
        setIsDetailModalOpen(true);
    }, []);

    if (pageLoading) {
        return (
             <div className="p-8 flex justify-center items-center h-[50vh] text-center">
                <FiLoader className="text-4xl text-red-600 animate-spin"/>
                <p className="ml-3 font-semibold text-gray-600">Carregando solicitações de fechamento...</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 font-sans">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-5 sm:p-8 rounded-2xl shadow-subtle max-w-7xl mx-auto border border-gray-200/80">
                
                <header className="border-b border-gray-200/80 pb-6 mb-6">
                    <h1 className="text-3xl font-extrabold text-red-600 drop-shadow-md flex items-center gap-3">
                        <FiCheckSquare />
                        Solicitações de Fechamento
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Visualize os detalhes do serviço prestado e aprove ou reprove o fechamento do chamado.
                    </p>
                </header>
                
                <div className="space-y-4">
                    <AnimatePresence>
                        {pedidos.length > 0 ? (
                            pedidos.map(pedido => (
                                <FechamentoCard
                                    key={pedido.id}
                                    pedido={pedido}
                                    onOpenDetails={openDetailsModal}
                                />
                            ))
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="text-center text-gray-500 py-16">
                                <FiInbox className="mx-auto text-5xl text-gray-400 mb-2" />
                                <p className="font-semibold text-lg">Nenhuma solicitação pendente.</p>
                                <p className="text-sm">A caixa de entrada está limpa!</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            <AnimatePresence>
                {isDetailModalOpen && selectedPedido && (
                    <FechamentoDetalheModal
                        pedido={selectedPedido}
                        onClose={() => setIsDetailModalOpen(false)}
                        onResponder={handleResponder}
                        isLoading={actionLoading}
                    />
                )}
            </AnimatePresence>
        </div>
    );  
}