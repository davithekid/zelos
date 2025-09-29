'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
const ActionButton = ({ status, onClick }) => {
  let config;
  switch (status) {
    case 'pendente':
      config = {
        text: 'Pedido Enviado',
        className: 'bg-yellow-100 text-yellow-700 cursor-not-allowed border border-yellow-300', 
        disabled: true,
      };
      break;
    case 'aceito':
      config = {
        text: 'Pedido Aceite',
        className: 'bg-green-600 text-white cursor-not-allowed', 
        disabled: true,
      };
      break;
    case 'recusado':
      config = {
        text: 'Pedido Recusado',
        className: 'bg-red-100 text-red-700 cursor-not-allowed border border-red-300', 
        disabled: true,
      };
      break;
    default: 
      config = {
        text: 'Enviar Pedido',
        className: 'bg-red-600 text-white hover:bg-red-700 active:scale-95 cursor-pointer',
        disabled: false,
      };
  }

  return (
    <button
      onClick={onClick}
      disabled={config.disabled}
      className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all w-full sm:w-auto ${config.className}`}
    >
      {config.text}
    </button>
  );
};

export default function CardChamado({ chamado, pedidosDoTecnico, onAtribuir, onAbrirImagem }) {
  const meuPedidoStatus = pedidosDoTecnico[chamado.id];
  const getImageUrl = (imgPath) => {
    if (!imgPath) return "/placeholder.png";
    if (imgPath.startsWith('http')) return imgPath;
    return `http://localhost:3001${imgPath.startsWith('/') ? imgPath : `/${imgPath}`}`;
  };

  const ImagemComponente = () => (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="w-full h-48 rounded-lg overflow-hidden border border-gray-200 cursor-pointer group"
      onClick={() => onAbrirImagem(getImageUrl(chamado.img_url))}
    >
      <Image
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        src={getImageUrl(chamado.img_url)}
        alt={chamado.titulo || "Imagem do chamado"}
        width={300}
        height={200}
        onError={(e) => {
          e.target.src = "/placeholder.png";
        }}
      />
    </motion.div>
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white p-5 rounded-xl shadow-md border border-gray-200/80 w-full flex flex-col"
    >
      <div className="flex flex-col flex-1 h-full">
      
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-800 line-clamp-2">{chamado.titulo}</h1>

          <div className="flex items-center gap-3 mt-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-500">
              {chamado.usuario?.nome.charAt(0) || '?'}
            </div>
            <div>
              <p className="font-medium text-gray-700 text-sm">{chamado.usuario?.nome || 'Usuário desconhecido'}</p>
              <p className="text-xs text-gray-500">
                {new Date(chamado.criado_em).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <p className="text-gray-600 text-sm line-clamp-3 mt-3">{chamado.descricao}</p>

          {chamado.img_url && (
            <div className="mt-4 sm:hidden">
              <ImagemComponente />
            </div>
          )}
        </div>
        <div className="mt-3">
             <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                chamado.tecnico_id 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-red-100 text-red-700' 
             }`}>
                {chamado.tecnico_id ? 'ATRIBUÍDO' : 'ABERTO'}
            </span>
        </div>


        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 mt-auto border-t border-gray-200/80 gap-3">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
              Patrimônio: {chamado.numero_patrimonio || 'N/A'}
            </span>

            {chamado.img_url && (
              <button
                onClick={() => onAbrirImagem(chamado.img_url)}
                className="hidden sm:inline text-xs font-semibold cursor-pointer text-blue-600 hover:underline"
              >
                Ver imagem
              </button>
            )}
          </div>
          {!chamado.tecnico_id ? (
            <ActionButton 
                status={meuPedidoStatus} 
                onClick={() => onAtribuir(chamado.id)} 
            />
          ) : (
             <span className="text-sm font-semibold text-blue-700">Chamado já atribuído.</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
