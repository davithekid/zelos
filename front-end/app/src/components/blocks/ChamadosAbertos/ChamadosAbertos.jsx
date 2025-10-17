'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '../../../lib/api'; 
import CardChamado from './CardChamado';
import ModalAtribuicao from './ModalAtribuicao';
import ModalImagem from './ModalImagem';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ChamadosAbertos({ funcionario }) {
    const [chamadosAbertos, setChamadosAbertos] = useState([]);
    const [temChamadoEmAndamento, setTemChamadoEmAndamento] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalAberto, setModalAberto] = useState(false);
    const [imagemModal, setImagemModal] = useState(null);

    const [erroModal, setErroModal] = useState({
        isOpen: false,
        title: '',
        message: '',
    });

    // 🔁 Função para verificar se o técnico ainda tem chamados em andamento
    const verificarChamadoEmAndamento = useCallback(async () => {
        if (!funcionario || !funcionario.id) return;

        try {
            const res = await api.get(`/chamados?tecnico_id=${funcionario.id}&status=em_andamento`);
            setTemChamadoEmAndamento(res.data.length > 0);
        } catch (err) {
            console.error("Erro ao verificar chamados do técnico:", err);
        }
    }, [funcionario]);

    const fetchData = useCallback(async () => {
        if (!funcionario || !funcionario.id) return;

        setIsLoading(true);
        setError(null);

        try {
            const chamadosResponse = await api.get('/chamados/pool-tecnico');
            setChamadosAbertos(chamadosResponse.data);

            await verificarChamadoEmAndamento();

        } catch (err) {
            setError("Não foi possível carregar os dados. Tente atualizar a página.");
        } finally {
            setIsLoading(false);
        }
    }, [funcionario, verificarChamadoEmAndamento]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAtribuir = async (chamadoId) => {
        if (!funcionario || !funcionario.id) {
            setErroModal({
                isOpen: true,
                title: "Erro de Autenticação",
                message: "Não foi possível identificar seu ID de técnico. Por favor, faça login novamente.",
            });
            return;
        }

        try {
            await api.patch(`/chamados/${chamadoId}/atribuir`, { tecnico_id: funcionario.id });
            
            setChamadosAbertos(prev => prev.filter(c => c.id !== chamadoId));
            setModalAberto(true);

            // 🔁 Atualiza status após atribuição
            await verificarChamadoEmAndamento();

        } catch (err) {
            const errorMessage = err.response?.data?.message || "Não foi possível atribuir o chamado. Ele pode já ter sido atribuído a outro técnico.";
            
            setErroModal({
                isOpen: true,
                title: "Falha na Atribuição",
                message: errorMessage,
            });
        }
    };

    // 🔁 Atualiza automaticamente a cada 30 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            verificarChamadoEmAndamento();
        }, 30000);

        return () => clearInterval(interval);
    }, [verificarChamadoEmAndamento]);

    const abrirModalImagem = (url) => setImagemModal(url);
    const fecharModalImagem = () => setImagemModal(null);
    const fecharErroModal = () => setErroModal(prev => ({ ...prev, isOpen: false }));

    if (isLoading) return <div className="text-center p-10">Carregando chamados...</div>;
    if (error) return <div className="text-center p-10 text-red-600">{error}</div>;

    return (
        <>
            <motion.div>
                <h1 className='text-xl sm:text-2xl font-semibold text-gray-700 mb-6 text-center'>
                    Chamados Disponíveis para Atribuição
                </h1>
                {chamadosAbertos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {chamadosAbertos.map(chamado => (
                            <CardChamado
                                key={chamado.id}
                                chamado={chamado}
                                onAtribuir={handleAtribuir}
                                onAbrirImagem={abrirModalImagem}
                                isBlocked={temChamadoEmAndamento}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 mt-10">
                        Nenhum chamado aberto no momento, ou nenhum em seus pools de atuação.
                    </p>
                )}
            </motion.div>

            <ModalAtribuicao 
                aberto={modalAberto} 
                onClose={() => setModalAberto(false)}
            />
            
            <ModalImagem url={imagemModal} onClose={fecharModalImagem} />
            
            <Dialog open={erroModal.isOpen} onOpenChange={fecharErroModal}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 font-bold">{erroModal.title}</DialogTitle>
                        <DialogDescription>
                            {erroModal.message}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button type="button" onClick={fecharErroModal} className="bg-red-600 hover:bg-red-700">
                            Entendido
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
