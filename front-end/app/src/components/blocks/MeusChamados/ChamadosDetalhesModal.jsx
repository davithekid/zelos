'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag, User, Wrench, SprayCan, CircleHelp, FileImage, ClipboardCheck, Clock, Loader2 } from 'lucide-react';
import api from '../../../app/lib/api'; 

const statusConfig = {
  'aberto': { label: 'Aberto', classes: 'bg-blue-100 text-blue-800 border-blue-300' },
  'em andamento': { label: 'Em Andamento', classes: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  'concluido': { label: 'Concluído', classes: 'bg-green-100 text-green-800 border-green-300' }
};

const tituloConfig = {
  'externo': { label: 'Externo', icon: <User size={20} /> },
  'manutencao': { label: 'Manutenção', icon: <Wrench size={20} /> },
  'apoio_tecnico': { label: 'Apoio Técnico', icon: <User size={20} /> },
  'limpeza': { label: 'Limpeza', icon: <SprayCan size={20} /> },
  'outro': { label: 'Outro', icon: <CircleHelp size={20} /> }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const formatarDataApontamento = (dataString) => {
  if (!dataString) return 'Data/Hora indisponível';
  const date = new Date(dataString);
  const data = date.toLocaleDateString('pt-BR');
  const hora = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${data} às ${hora}`;
};


export default function ChamadoDetalhesModal({ chamado, onClose }) {
  if (!chamado) return null;

  const initialApontamentos = chamado.apontamentos || [];
  const [apontamentos, setApontamentos] = useState(initialApontamentos);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!chamado.id) return;

    const fetchApontamentos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(`/chamados/${chamado.id}/apontamentos`);
        setApontamentos(response.data); 

      } catch (err) {
        console.error("Erro ao buscar apontamentos:", err);
        const errorMessage = err.response?.data?.message || err.message || "Erro de conexão desconhecido.";
        setError(errorMessage);
        setApontamentos([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApontamentos();
  }, [chamado.id]); 

  
  const { label: statusLabel, classes: statusClasses } = statusConfig[chamado.status] || { label: 'Desconhecido', classes: 'bg-gray-100 text-gray-800 border-gray-300'};
  const { label: tituloLabel, icon: tituloIcon } = tituloConfig[chamado.pool?.titulo] || tituloConfig.outro;

  let imageUrl = null;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'; 
  
  if (chamado.img_url) {
    imageUrl = `${API_BASE_URL}${chamado.img_url}`; 
  }
  
  const fallbackImageUrl = '/image-not-found.png'; 
  const possuiApontamentos = apontamentos.length > 0;


  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div 
          className="absolute inset-0  bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto transform transition-all relative z-10"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          <div className="sticky top-0 bg-white p-5 border-b border-gray-200 flex justify-between items-center z-20">
            <div className="flex items-center gap-3">
                <div className="flex-shrink-0 text-red-600">{tituloIcon}</div>
                <h2 className="text-2xl font-bold text-gray-800">{chamado.titulo}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-medium">
                <div className={`col-span-2 sm:col-span-1 px-3 py-1 text-center rounded-full border ${statusClasses}`}>
                    {statusLabel}
                </div>
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <Calendar size={16} />
                    <span>Aberto: {new Date(chamado.criado_em).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <Tag size={16} />
                    <span>Tipo: {tituloLabel}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <ClipboardCheck size={16} />
                    <span>ID: {chamado.id}</span>
                </div>
            </div>

            <hr className="border-gray-100" />
            
            <section>
              <h3 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-1">Descrição do Chamado</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{chamado.descricao}</p>
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-1 flex items-center gap-2">
                <FileImage size={20} className="text-indigo-500" />
                Imagem Anexada
              </h3>
              <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden max-h-96 flex items-center justify-center bg-gray-50">
                
                {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={`Anexo do chamado ${chamado.id}`} 
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => { 
                          e.target.onerror = null; 
                          e.target.src = fallbackImageUrl;
                          console.error(`Erro ao carregar a imagem na URL: ${imageUrl}`);
                      }} 
                    />
                ) : (
                    <div className="text-center p-8 text-gray-500">
                        <FileImage size={32} className="mx-auto mb-2" />
                        Nenhuma imagem anexada para este chamado.
                    </div>
                )}
              </div>
            </section>
            
            <section>
              <h3 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-1 flex items-center gap-2">
                <ClipboardCheck size={20} className="text-green-500" />
                Apontamentos do Técnico
              </h3>

              {isLoading ? (
                <div className="p-4 flex items-center justify-center text-indigo-500">
                    <Loader2 size={24} className="animate-spin mr-2" />
                    Carregando apontamentos...
                </div>
              ) : error ? (
                <div className="p-4 bg-red-50/70 border-l-4 border-red-400 rounded-lg shadow-sm">
                  <p className="text-red-700 leading-relaxed">**Erro:** {error}</p>
                </div>
              ) : possuiApontamentos ? (
                <div className="space-y-4">
                  {apontamentos.map((apontamento, index) => (
                    <div 
                      key={apontamento.id || index} 
                      className="p-4 bg-gray-50 border-l-4 border-green-500 rounded-lg shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                              <User size={14} className="text-green-600" />
                              {apontamento.tecnico?.nome || 'Técnico Desconhecido'}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock size={12} />
                              {formatarDataApontamento(apontamento.comeco)} 
                          </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {apontamento.descricao} 
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-yellow-50/70 border-l-4 border-yellow-400 rounded-lg shadow-sm">
                  <p className="text-gray-700 italic leading-relaxed">Nenhum apontamento feito pelo técnico até o momento.</p>
                </div>
              )}
            </section>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}