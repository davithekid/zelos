'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../../lib/api'; 
import CardChamado from './CardChamado';
import ModalAtribuicao from './ModalAtribuicao';
import ModalImagem from './ModalImagem';

export default function ChamadosAbertos({ funcionario }) {
  const [chamadosAbertos, setChamadosAbertos] = useState([]);
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
      const [chamadosResponse, pedidosResponse] = await Promise.all([
        api.get('/chamados'), 
        api.get('/pedidos-chamado/meus-pedidos')
      ]);
      
      const todosChamados = chamadosResponse.data;
      const pedidosMap = pedidosResponse.data.reduce((acc, pedido) => {
        acc[pedido.chamado_id] = pedido.status;
        return acc;
      }, {});
      setPedidosDoTecnico(pedidosMap);
      const abertos = todosChamados.filter(chamado => {
        return chamado.status === 'aberto';
      });
      
      setChamadosAbertos(abertos);
      
    } catch (err) {
      console.error("Erro ao buscar dados iniciais:", err);
      setError("Não foi possível carregar os dados. Tente atualizar a página.");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); 
    return () => clearInterval(interval);
  }, [funcionario]);

  const handleAtribuir = async (chamadoId) => {
    const statusPedidoAtual = pedidosDoTecnico[chamadoId];
    if (statusPedidoAtual && statusPedidoAtual !== 'recusado') {
        alert("Você já tem um pedido pendente ou ele foi aceito/recusado. Aguarde a atualização da lista.");
        return;
    }
    
    try {
      await api.post('/pedidos-chamado', { chamado_id: chamadoId });
      setPedidosDoTecnico(prev => ({ ...prev, [chamadoId]: 'pendente' }));
      setModalAberto(true); 
    } catch (err) {
      console.error("Erro ao enviar pedido:", err);
      const errorMessage = err.response?.data?.message || "Não foi possível enviar o pedido.";
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
          <p className="text-center text-gray-500 mt-10">Nenhum chamado aberto no momento.</p>
        )}
      </motion.div>

      <ModalAtribuicao aberto={modalAberto} onClose={() => setModalAberto(false)} />
      <ModalImagem url={imagemModal} onClose={fecharModalImagem} />
    </>
  );
}
