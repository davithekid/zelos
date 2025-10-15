'use client';

import { motion } from 'framer-motion';
import { Users, ClipboardList, BarChart3 } from 'lucide-react';

export default function InicioAdmin({ setActiveTab }) {

  const stats = [
    {
      icon: <Users size={40} className="text-red-600" />,
      title: 'Atribuição de Técnicos',
      description: 'Defina quais técnicos serão responsáveis por cada chamado.'
    },
    {
      icon: <ClipboardList size={40} className="text-red-600" />,
      title: 'Gestão de Chamados',
      description: 'Acompanhe e organize o andamento de todos os chamados.'
    },
    {
      icon: <BarChart3 size={40} className="text-red-600" />,
      title: 'Relatórios',
      description: 'Analise o desempenho e tenha insights sobre o sistema.'
    },
  ];

  const actionButtons = [
    {
        label: 'Painel de Atribuição',
        icon: <Users size={20} />,
        tab: 'atribuidos',
    },
    {
        label: 'Gerenciar Chamados',
        icon: <ClipboardList size={20} />,
        tab: 'gerenciar',
    },
    {
        label: 'Ver Relatórios',
        icon: <BarChart3 size={20} />,
        tab: 'relatorio',
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-4xl mx-auto flex-grow flex flex-col justify-center px-6 text-center"
    >
      <div className="py-12">
        <h1 className="text-5xl font-extrabold text-red-600 mb-6 drop-shadow-md">
            Painel do Administrador
        </h1>

        <p className="text-gray-700 text-lg mb-12 max-w-xl mx-auto">
            Visão geral do sistema e atalhos para as principais áreas de gerenciamento.
        </p>
        <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-12 mb-16"
            initial="hidden"
            animate="visible"
            variants={{
                visible: { transition: { staggerChildren: 0.1 } },
                hidden: {},
            }}
        >
          {stats.map(({ icon, title, description }, i) => (
            <motion.div
              key={i}
              className="bg-red-50 rounded-lg p-6 shadow-md flex flex-col items-center text-red-700" 
              transition={{ type: "spring", stiffness: 300 }}
              variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1 },
              }}
            >
              <div className="mb-4">{icon}</div>
              <h3 className="font-semibold text-xl mb-2">{title}</h3>
              <p className="text-sm max-w-xs">{description}</p>
            </motion.div>
          ))}
        </motion.div>
        <motion.div 
            className="flex flex-col sm:flex-row justify-center gap-8 mb-20"
            initial="hidden"
            animate="visible"
            variants={{
                visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
                hidden: {},
            }}
        >
          {actionButtons.map(({ label, icon, tab }) => (
            <motion.button
              key={label}
              onClick={() => setActiveTab(tab)}
              className="bg-red-600 text-white px-10 py-4 rounded-xl shadow-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.05, y: -3 }} 
              whileTap={{ scale: 0.95 }}
              variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1 },
              }}
            >
              {label} {icon}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}