'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import ChamadoForm from './ChamadoForm';
import api from '../../../lib/api';
import { toast } from 'sonner';

const ModalSucesso = dynamic(() => import('./ModalSucesso'), { ssr: false });

export default function Chamado({ funcionario }) {
  const [imagem, setImagem] = useState(null);
  const [imagemPreview, setImagemPreview] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [patrimonio, setPatrimonio] = useState('');
  const [poolId, setPoolId] = useState('');
  const [poolOptions, setPoolOptions] = useState([]);
  const [isLoadingPools, setIsLoadingPools] = useState(true);
  const [erros, setErros] = useState({});
  const [modalAberto, setModalAberto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPools = async () => {
      setIsLoadingPools(true);
      try {
        const response = await api.get('/pools');
        const ativas = response.data.filter(pool => pool.status === 'ativo');
        setPoolOptions(ativas);
      } catch (error) {
        console.error("Falha ao buscar as pools:", error);
        toast.error('Não foi possível carregar os tipos de chamado.');
      } finally {
        setIsLoadingPools(false);
      }
    };
    fetchPools();
  }, []);

  const validarFormulario = () => {
    const newErros = {};
    if (titulo.trim().length < 5) newErros.titulo = 'Título precisa ter ao menos 5 caracteres.';
    if (titulo.length > 50) newErros.titulo = 'Título não pode exceder 50 caracteres.';
    if (descricao.trim().length < 10) newErros.descricao = 'Descrição precisa ter ao menos 10 caracteres.';
    if (!poolId) newErros.poolId = 'Selecione um tipo de solicitação.';
    
    setErros(newErros);
    return Object.keys(newErros).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) {
        toast.error("Por favor, corrija os erros no formulário.");
        return;
    }
    setIsSubmitting(true);
    setErros({});

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descricao', descricao);
    formData.append('numero_patrimonio', patrimonio);
    formData.append('pool_id', poolId);
    if (imagem) {
      formData.append('imagem', imagem);
    }

    try {
      await api.post('/chamados', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setModalAberto(true); 
      setTitulo(''); 
      setDescricao(''); 
      setPatrimonio('');
      setPoolId(''); 
      setImagem(null); 
      setImagemPreview('');
    } catch (err) {
      console.error("Erro ao criar chamado:", err);
      const errorMessage = err.response?.data?.message || 'Ocorreu um erro ao enviar o chamado.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFecharModal = () => {
      setModalAberto(false);
      toast.success("Seu chamado foi registrado com sucesso!");
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-lg border border-gray-200/80"
      >
        <h2 className="text-4xl font-extrabold mb-10 text-center tracking-tight text-red-600">
          Abrir Novo Chamado
        </h2>
        
        <ChamadoForm
          titulo={titulo} setTitulo={setTitulo}
          descricao={descricao} setDescricao={setDescricao}
          patrimonio={patrimonio} setPatrimonio={setPatrimonio}
          poolId={poolId} setPoolId={setPoolId}
          poolOptions={poolOptions}
          isLoadingPools={isLoadingPools}
          erros={erros}
          handleSubmit={handleSubmit}
          imagem={imagem} setImagem={setImagem}
          imagemPreview={imagemPreview} setImagemPreview={setImagemPreview}
          isSubmitting={isSubmitting}
        />
      </motion.div>
      <ModalSucesso aberto={modalAberto} onFechar={handleFecharModal} />
    </>
  ); 
}