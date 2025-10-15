'use client';
import { useState } from 'react'; 
import { motion } from 'framer-motion';
import Image from 'next/image';
import ActionButton from './ActionButton';
import ConfirmationModal from './ConfirmaChamado'; 

// Componente de imagem separado para melhor organização
const ImagemComponente = ({ imgUrl, titulo, onAbrirImagem }) => (
  <motion.div
    whileHover={{ scale: 1.03 }}
    className="w-full h-48 rounded-lg overflow-hidden border border-gray-200 cursor-pointer group"
    onClick={() => onAbrirImagem(imgUrl)}
  >
    <Image
      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      src={imgUrl}
      alt={titulo || "Imagem do chamado"}
      width={300}
      height={200}
      onError={(e) => {
        e.target.src = "/placeholder.png";
      }}
    />
  </motion.div>
);

// Componente para informações do usuário
const UserInfo = ({ usuario, criado_em }) => (
  <div className="flex items-center gap-3 mt-3">
    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-500">
      {usuario?.nome?.charAt(0)?.toUpperCase() || '?'}
    </div>
    <div>
      <p className="font-medium text-gray-700 text-sm">
        {usuario?.nome || 'Usuário desconhecido'}
      </p>
      <p className="text-xs text-gray-500">
        {new Date(criado_em).toLocaleDateString('pt-BR')}
      </p>
    </div>
  </div>
);

// Componente para status do chamado
const StatusBadge = ({ tecnico_id }) => (
  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
    tecnico_id 
      ? 'bg-blue-100 text-blue-700' 
      : 'bg-red-100 text-red-700' 
  }`}>
    {tecnico_id ? 'ATRIBUÍDO' : 'ABERTO'}
  </span>
);

export default function CardChamado({ chamado, onAtribuir, onAbrirImagem, isBlocked }) {
  // 1. Não renderiza se estiver bloqueado ou sem chamado
  if (isBlocked || !chamado) {
    return null;
  }
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleOpenConfirmation = () => {
    openModal();
  };
  
  const getImageUrl = (imgPath) => {
    if (!imgPath) return "/placeholder.png";
    if (imgPath.startsWith('http')) return imgPath;
    return `http://localhost:3001${imgPath.startsWith('/') ? imgPath : `/${imgPath}`}`;
  };

  const imageUrl = getImageUrl(chamado.img_url);
  const hasImage = Boolean(chamado.img_url);
  const isAtribuido = Boolean(chamado.tecnico_id);

  const cardClasses = 'bg-white p-5 rounded-xl shadow-md border border-gray-200/80 w-full flex flex-col';

  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={onAtribuir} 
        chamadoId={chamado.id} 
      />

      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={cardClasses}
      >
        <div className="flex flex-col flex-1 h-full">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800 line-clamp-2">
              {chamado.titulo}
            </h1>

            <UserInfo 
              usuario={chamado.usuario} 
              criado_em={chamado.criado_em} 
            />

            <p className="text-gray-600 text-sm line-clamp-3 mt-3">
              {chamado.descricao}
            </p>

            {hasImage && (
              <div className="mt-4 sm:hidden">
                <ImagemComponente 
                  imgUrl={imageUrl}
                  titulo={chamado.titulo}
                  onAbrirImagem={onAbrirImagem}
                />
              </div>
            )}
          </div>

          <div className="mt-3">
            <StatusBadge tecnico_id={chamado.tecnico_id} />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 mt-auto border-t border-gray-200/80 gap-3">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                Patrimônio: {chamado.numero_patrimonio || 'N/A'}
              </span>

              {hasImage && (
                <button
                  onClick={() => onAbrirImagem(imageUrl)}
                  className="hidden sm:inline text-xs font-semibold cursor-pointer text-blue-600 hover:underline"
                >
                  Ver imagem
                </button>
              )}
            </div>

            {!isAtribuido ? (
              <ActionButton 
                isBlocked={isBlocked} 
                onClick={handleOpenConfirmation} 
              />
            ) : (
              <span className="text-sm font-semibold text-blue-700">
                Chamado já atribuído.
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}