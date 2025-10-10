'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../lib/api'; 
import CardChamado from './CardChamado';
import ModalAtribuicao from './ModalAtribuicao';
import ModalImagem from './ModalImagem';

export default function ChamadosAbertos({ funcionario }) {
    const [chamadosAbertos, setChamadosAbertos] = useState([]);
    // O estado pedidosDoTecnico não é mais necessário, mas será mantido por enquanto para evitar quebras no CardChamado.
    // Ele será um objeto vazio, pois a auto-atribuição não usa pedidos pendentes.
    const [pedidosDoTecnico, setPedidosDoTecnico] = useState({}); 
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalAberto, setModalAberto] = useState(false);
    const [imagemModal, setImagemModal] = useState(null);
    
    const fetchData = async () => {
        if (!funcionario || !funcionario.id) return;
        
        if (!chamadosAbertos.length) {
            setIsLoading(true);
        }
        setError(null);
        
        try {
            // Buscamos apenas os chamados disponíveis para o pool do técnico
            const chamadosResponse = await api.get('/chamados/pool-tecnico');
            
            // NÃO precisamos mais buscar pedidos-chamado
            setPedidosDoTecnico({}); // Limpamos a lista de pedidos, pois não são mais usados
            setChamadosAbertos(chamadosResponse.data); 
            
        } catch (err) {
            console.error("Erro ao buscar dados iniciais:", err);
            setError("Não foi possível carregar os dados. Tente atualizar a página.");
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, [funcionario]);

    // FUNÇÃO ATUALIZADA: AUTO-ATRIBUIÇÃO DIRETA
    const handleAtribuir = async (chamadoId) => {
        if (!funcionario || !funcionario.id) {
            alert("Erro: ID do técnico não encontrado.");
            return;
        }

        try {
            // 1. CHAMA A ROTA DE ATRIBUIÇÃO DIRETA (PATCH)
            const response = await api.patch(`/chamados/${chamadoId}/atribuir`, { 
                tecnico_id: funcionario.id 
            });
            
            const chamadoAtribuido = response.data;

            // 2. ATUALIZA O ESTADO NA LISTA LOCAL (ChamadosAbertos)
            setChamadosAbertos(prevChamados => 
                prevChamados.filter(c => c.id !== chamadoId) // Remove o chamado da lista de abertos
            );
            
            // Opcionalmente, você pode querer adicionar uma lógica para
            // um modal de sucesso aqui, ou apenas fechar o modal.
            setModalAberto(true); 

            // Se você quiser que o chamado permaneça na lista, mas com o status atualizado:
            /*
            setChamadosAbertos(prevChamados => 
                prevChamados.map(c => 
                    c.id === chamadoId ? chamadoAtribuido : c
                )
            );
            */
            
        } catch (err) {
            console.error("Erro ao atribuir chamado:", err);
            const errorMessage = err.response?.data?.message || "Não foi possível atribuir o chamado. Ele pode já ter sido atribuído a outro técnico.";
            alert(errorMessage);
        }
    };

    const abrirModalImagem = (url) => setImagemModal(url);
    const fecharModalImagem = () => setImagemModal(null);

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
                                pedidosDoTecnico={pedidosDoTecnico} 
                                onAtribuir={handleAtribuir}
                                onAbrirImagem={abrirModalImagem}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 mt-10">Nenhum chamado aberto no momento, ou nenhum em seus pools de atuação.</p>
                )}
            </motion.div>

            <ModalAtribuicao 
                aberto={modalAberto} 
                onClose={() => setModalAberto(false)}
            />
            <ModalImagem url={imagemModal} onClose={fecharModalImagem} />
        </>
    );
}