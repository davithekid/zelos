'use client';
import { motion } from 'framer-motion';
import PainelTecnicoCards from './PainelTecnicoCards';
import PainelAcoes from './PainelAcoes';
import FaqTecnico from './FaqTecnico';
import { 
  FaTicketAlt, 
  FaUserClock, 
  FaRegListAlt, 
  FaUserCog 
} from 'react-icons/fa';
import { HiExclamationTriangle } from 'react-icons/hi2';

const PoolManagementBanner = ({ setActiveTab }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay: 0.2 }}
    onClick={() => setActiveTab('perfil')}
    role="alert"
    className="w-full mx-auto p-6 bg-red-50 border-2 border-red-500 rounded-xl shadow-2xl text-red-800 text-left mb-12 cursor-pointer transition-all hover:bg-red-100"
  >
    <div className="flex items-center gap-4">
      <HiExclamationTriangle size={36} className="text-red-600 flex-shrink-0" />
      <div>
        <h3 className="text-xl font-extrabold leading-snug text-red-700">
          Atenção: Cadastre suas <span className="underline">Aréas de atuação</span>
        </h3>
        <p className="mt-2 text-base text-gray-800">
          <span className="font-bold text-red-700">Ação necessária:</span> 
          {' '}Para começar a receber chamados, é obrigatório cadastrar suas áreas de atuações na aba{' '}
          <span className="font-semibold">Perfil</span> ou solicitar ajuda à Administração.
        </p>
      </div>
    </div>
  </motion.div>
);

export default function InicioTecnico({ setActiveTab }) {
  const painelTecnico = [
    {
      icon: <FaTicketAlt size={38} className="text-red-600" />,
      title: 'Novos Chamados',
      description: 'Visualize e atribua os chamados que acabaram de chegar na fila.',
    },
    {
      icon: <FaRegListAlt size={38} className="text-red-600" />,
      title: 'Meus Chamados Atribuídos',
      description: 'Acesse a lista de chamados que estão sob sua responsabilidade.',
    },
    {
      icon: <FaUserClock size={38} className="text-red-600" />,
      title: 'Histórico de Chamados',
      description: 'Consulte os chamados concluídos e suas informações anteriores.',
    },
  ];

  const faqsTecnico = [
    {
      question: 'Como atribuo um chamado para mim?',
      answer:
        'Na aba "Chamados Abertos", clique no chamado desejado e confirme.',
    },
    {
      question: 'Como faço apontamentos?',
      answer:
        'Na aba "Chamados Atribuídos", clique em detalhes e selecione "apontamento" diretamente no chamado correspondente.',
    },
    {
      question: 'Como fecho um chamado resolvido?',
      answer:
        'Na aba "Chamados Atribuídos", clique em "Detalhes" e selecione "Solicitar Fechamento". A solicitação será enviada à Administração.',
    },
    {
      question: 'Como atribuo minhas especialidades no meu perfil?',
      answer:
        'Na aba "Perfil", clique no ícone de lápis em "Especialidade" para adicionar suas áreas de atuação.',
    },
  ];

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        aria-label="Painel de Controle do Técnico"
        className="max-w-4xl mx-auto flex-grow flex flex-col justify-center px-6 text-center"
      >
        <h1 className="text-5xl mt-20 font-extrabold text-red-600 mb-6 leading-tight drop-shadow-md">
          Painel do Técnico
        </h1>
        <p className="text-gray-700 text-lg italic mb-12 max-w-xl mx-auto">
          Gerencie seus chamados, acompanhe suas tarefas e resolva com agilidade e precisão.
        </p>

        <PoolManagementBanner setActiveTab={setActiveTab} />
        <PainelTecnicoCards cards={painelTecnico} setActiveTab={setActiveTab} />
        <PainelAcoes setActiveTab={setActiveTab} />
      </motion.section>

      <FaqTecnico faqs={faqsTecnico} />
    </>
  );
}
