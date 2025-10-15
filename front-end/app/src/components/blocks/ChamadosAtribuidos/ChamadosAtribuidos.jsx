'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../../../lib/api'; 
import ChamadoCard from './ChamadoCard';
import ChamadoDetailView from './ChamadoDetailView';
import ApontamentoModal from './ApontamentoModal';

export default function ChamadosAtribuidos({ funcionario }) {
    const [meusChamados, setMeusChamados] = useState([]);
    const [apontamentos, setApontamentos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedChamado, setSelectedChamado] = useState(null);
    const [apontamentoModal, setApontamentoModal] = useState(null); 

    useEffect(() => {
        if (!funcionario || !funcionario.id) return;

        const fetchMeusChamados = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get('/chamados');
                const atribuidos = response.data.filter(chamado => 
                    chamado.tecnico_id === funcionario.id && chamado.status !== 'concluido'
                );
                setMeusChamados(atribuidos);
            } catch (err) {
                console.error("Erro ao buscar chamados atribuídos:", err);
                setError("Não foi possível carregar seus chamados.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMeusChamados();
    }, [funcionario]);
    useEffect(() => {
        if (!selectedChamado) {
            setApontamentos([]);
            return;
        }

        const fetchApontamentos = async () => {
            try {
                const response = await api.get(`/chamados/${selectedChamado.id}/apontamentos`);
                setApontamentos(response.data);
            } catch (error) {
                console.error("Erro ao buscar o histórico de apontamentos:", error);
            }
        };

        fetchApontamentos();
    }, [selectedChamado]); 

    const handleApontamentoSuccess = (novoApontamento) => {
        setApontamentos(prevApontamentos => [novoApontamento, ...prevApontamentos]);
        console.log("Apontamento adicionado à lista da UI!", novoApontamento);
    };
    
    if (isLoading) return <div className="text-center p-10 font-semibold text-gray-600">Carregando seus chamados...</div>;
    if (error) return <div className="text-center p-10 font-semibold text-red-600">{error}</div>;

    return (
        <div className="p-4 sm:p-6 h-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    {selectedChamado && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => setSelectedChamado(null)}
                            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeftIcon className="w-6 h-6 text-red-600" />
                        </motion.button>
                    )}
                    {selectedChamado ? 'Detalhes do Chamado' : 'Meus Chamados Atribuídos'}
                </h1>
                <p className="text-gray-500 mt-1">
                    {selectedChamado ? `Visualizando detalhes do chamado #${selectedChamado.id}` : 'Aqui estão os chamados que precisam da sua atenção.'}
                </p>
            </div>

            <AnimatePresence mode="wait">
                {!selectedChamado ? (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {meusChamados.length > 0 ? (
                            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                                {meusChamados.map(chamado => (
                                    <ChamadoCard
                                        key={chamado.id}
                                        chamado={chamado}
                                        onVerDetalhes={() => setSelectedChamado(chamado)}
                                        onAbrirApontamento={() => setApontamentoModal(chamado)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 mt-10">Você não tem nenhum chamado atribuído no momento.</p>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="detail">
                        <ChamadoDetailView
                            chamado={selectedChamado}
                            apontamentos={apontamentos} 
                            onAbrirApontamento={() => setApontamentoModal(selectedChamado)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            <ApontamentoModal
                chamado={apontamentoModal}
                tecnicoId={funcionario.id}
                onClose={() => setApontamentoModal(null)}
                onSuccess={handleApontamentoSuccess}
            />
        </div>
    );
}