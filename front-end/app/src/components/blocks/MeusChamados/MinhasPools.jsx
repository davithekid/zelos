'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PoolCard from './PoolCard';
import PoolFiltros from './PoolFitros';
import ChamadoDetalhesModal from './ChamadosDetalhesModal' 
import api from '../../../app/lib/api';

const statusConfig = {
  'aberto': { label: 'Aberto' },
  'em andamento': { label: 'Em Andamento' },
  'concluido': { label: 'Concluído' }
};

export default function MinhasPools({ funcionario }) {
  const [chamados, setChamados] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');   
  const [termoBusca, setTermoBusca] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chamadoSelecionado, setChamadoSelecionado] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCardClick = (chamado) => {
    setChamadoSelecionado(chamado);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setChamadoSelecionado(null);
  };

  useEffect(() => {
    if (funcionario && funcionario.id) {
      const fetchChamados = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await api.get(`/chamados`); 
          const meusChamados = response.data.filter(chamado => chamado.usuario_id === funcionario.id);
          setChamados(meusChamados);
        } catch (err) {
          console.error("Erro ao buscar chamados:", err);
          setError("Não foi possível carregar seus chamados.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchChamados();
    }
  }, [funcionario]);

  const chamadosFiltrados = useMemo(() => {
    return chamados.filter(chamado => {
      const poolTitulo = (chamado.pool?.titulo || '').toLowerCase();
      const descricao = (chamado.descricao || '').toLowerCase();
      const titulo = (chamado.titulo || '').toLowerCase();
      const busca = termoBusca.toLowerCase();
      const correspondeStatus = !filtroStatus || chamado.status === filtroStatus;
      const correspondeTipo = !filtroTipo || chamado.pool?.titulo === filtroTipo; 
      const correspondeBusca = !termoBusca || 
        descricao.includes(busca) ||
        titulo.includes(busca) ||
        poolTitulo.includes(busca);

      return correspondeStatus && correspondeTipo && correspondeBusca;
    });
  }, [chamados, filtroStatus, filtroTipo, termoBusca]); 
  
  if (isLoading) {
    return <div className="text-center py-20 font-semibold text-gray-600">Carregando seus chamados...</div>
  }
  if (error) {
     return <div className="text-center py-20 font-semibold text-red-600">{error}</div>
  }

  return (
    <div className="min-h-screen py-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Meus Chamados</h1>
          <p className="mt-2 text-lg text-gray-500">Acompanhe e gerencie suas solicitações e chamados.</p>
        </header>
        <PoolFiltros
          termoBusca={termoBusca}
          setTermoBusca={setTermoBusca}
          filtroStatus={filtroStatus}
          setFiltroStatus={setFiltroStatus}
          statusConfig={statusConfig}
          filtroTipo={filtroTipo}      
          setFiltroTipo={setFiltroTipo}   
        />

        <AnimatePresence>
          {chamadosFiltrados.length > 0 ? (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {chamadosFiltrados.map(chamado => (
                <PoolCard 
                    key={chamado.id} 
                    chamado={chamado} 
                    onClick={handleCardClick} 
                />
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <h3 className="mt-2 text-lg font-semibold text-gray-800">Nenhum chamado encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">Tente ajustar seus filtros ou você ainda não abriu um chamado.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <AnimatePresence>
        {isModalOpen && chamadoSelecionado && (
          <ChamadoDetalhesModal
            chamado={chamadoSelecionado}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}