'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiSearch, FiFilter, FiInbox, FiLoader } from 'react-icons/fi';
import api from '../../../lib/api';
import HistoricoCard from './HistoricoCard';

export default function HistoricoChamados({ funcionario }) {
    const [chamados, setChamados] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroStatus, setFiltroStatus] = useState('');
    const [pesquisa, setPesquisa] = useState('');

    useEffect(() => {
        if (!funcionario?.id) return;
        
        const fetchHistorico = async () => {
            setIsLoading(true);
            try {
                const response = await api.get('/chamados/meu-historico');
                setChamados(response.data);
            } catch (err) {
                console.error("Erro ao buscar histórico:", err);
                setError("Não foi possível carregar seu histórico de chamados.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistorico();
    }, [funcionario]);


    const filteredChamados = useMemo(() => {
        return chamados.filter(chamado => {
            const p = pesquisa.toLowerCase();
            const correspondePesquisa = !p ||
                (chamado.titulo || '').toLowerCase().includes(p) ||
                (chamado.numero_patrimonio || '').toLowerCase().includes(p);
            
            const correspondeStatus = !filtroStatus || chamado.status === filtroStatus;
            
            return correspondePesquisa && correspondeStatus;
        });
    }, [chamados, pesquisa, filtroStatus]);

    if (isLoading) {
      return (
        <div className="flex flex-col justify-center items-center h-full min-h-[60vh] text-gray-500">
            <FiLoader className="animate-spin text-4xl mb-4 text-red-500" />
            <p className="text-lg font-semibold">Carregando seu histórico...</p>
        </div>
      );
    }
    
    if (error) {
        return <div className="text-center p-10 font-semibold text-red-600 bg-red-50 rounded-lg">{error}</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 font-sans">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-5 sm:p-8 rounded-2xl shadow-subtle max-w-7xl mx-auto border border-gray-200/80">
                <header className="border-b border-gray-200/80 pb-6 mb-6">
                    <h1 className="text-3xl font-extrabold text-red-600 drop-shadow-md">Meu Histórico de Chamados</h1>
                    <p className="text-sm text-gray-600 mt-1">Aqui estão todos os chamados que você concluiu ou que foram cancelados.</p>
                </header>
            
                <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                    <div className="relative w-full md:flex-1 group">
                        <FiSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                        <input type="text" placeholder="Buscar por título ou patrimônio..." value={pesquisa} onChange={e => setPesquisa(e.target.value)}
                            className="bg-zinc-100 border-2 border-transparent p-3 pl-12 rounded-lg w-full focus:bg-white focus:border-red-500 transition-all outline-none"/>
                    </div>
                    <div className="relative w-full md:w-auto group">
                        <FiFilter className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
                            className="bg-zinc-100 border-2 border-transparent font-medium text-gray-700 p-3 pl-12 rounded-lg w-full appearance-none focus:bg-white focus:border-red-500 transition-all outline-none">
                            <option value="">Todos os Status</option>
                            <option value="concluido">Concluído</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                    </div>
                </div>
                
                <AnimatePresence>
                    {filteredChamados.length > 0 ? (
                        <motion.div layout className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                            {filteredChamados.map(chamado => (
                                <HistoricoCard 
                                    key={chamado.id} 
                                    chamado={chamado} 
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-gray-500">
                            <FiInbox className="mx-auto text-5xl mb-2 text-gray-400" />
                            <p className="font-semibold text-lg">Nenhum chamado encontrado</p>
                            <p className="text-sm">Seu histórico está vazio ou não há resultados para os filtros aplicados.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}