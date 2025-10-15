'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import FeatureCard from './FeatureCard';
import FaqItem from './FaqItem';
import InstrucoesRapidas from '../Instrucoes/page';
import { FaHeadset, FaClock, FaShieldAlt, FaCheckCircle, FaQuestionCircle } from 'react-icons/fa';

export default function Inicio({ onAbrirChamado }) {
  const [modalAberto, setModalAberto] = useState(false);


  const features = [
    {
      icon: <FaHeadset size={40} className="text-red-600" />,
      title: 'Suporte Dedicado',
      description: 'Nosso atendimento funciona de segunda a sexta, das 8h às 17h, garantindo acompanhamento e suporte durante todo o horário escolar.'
    },
    { 
      icon: <FaClock size={40} className="text-red-600" />,
      title: 'Resolução Ágil',
      description: 'Chamados tratados de forma rápida e eficiente, reduzindo o tempo de espera e trazendo soluções sem complicação.'
    },
    { icon: <FaShieldAlt size={40} className="text-red-600" />, title: 'Segurança', description: 'Seus dados e chamados estão protegidos com criptografia e boas práticas.' },
  ];

  const faqs = [
    { question: 'Como abrir um chamado?', answer: 'Clique no botão "Solicitar chamado", preencha o formulário com os detalhes do problema e envie.' },
    { question: 'Qual o tempo médio de resposta?', answer: 'Nosso tempo médio de resposta é de até 24 horas úteis.' },
    { question: 'Como acompanhar meu chamado?', answer: 'Você pode ver seus chamados na seção "Minhas solicitações" após fazer login.' },
    {
      question: "Como eu envio uma mensagem para o suporte?", answer: "Você pode enviar uma mensagem para nossa equipe no chat fixo no canto inferior direito em 'Suporte'. Assim que retornarmos, aparecerá uma nova notificação."
    }

  ];

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto flex-grow flex flex-col justify-center px-6 text-center"
        aria-label="Seção de boas-vindas"
      >
        <h1 className="text-5xl mt-20 font-extrabold text-red-600 mb-6 leading-tight drop-shadow-md">
          Bem-vindo ao Sistema de Chamados!
        </h1>
        <p className="text-gray-700 text-lg italic mb-12 max-w-xl mx-auto">
          Envie seus chamados com agilidade e total suporte para que seus problemas sejam resolvidos rapidamente.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-12 mb-16">
          {features.map((f, i) => <FeatureCard key={i} {...f} />)}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-8 mb-20">
          <button
            onClick={onAbrirChamado}
            className="bg-red-600 text-white px-10 py-4 rounded-xl shadow-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-3 cursor-pointer"
          >
            Abrir chamado <FaCheckCircle size={20} />
          </button>

          <button
            onClick={() => setModalAberto(true)}
            className="border-2 border-red-600 text-red-600 px-10 py-4 rounded-xl shadow-md hover:bg-red-600 hover:text-white transition-colors font-semibold flex items-center justify-center gap-3 cursor-pointer"
          >
            Instruções Rápidas <FaQuestionCircle size={20} />
          </button>
        </div>

        <InstrucoesRapidas isOpen={modalAberto} onClose={() => setModalAberto(false)} />
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto p-8 bg-red-50 rounded-2xl shadow-lg my-20"
        aria-label="Perguntas Frequentes"
      >
        <h2 className="text-4xl font-extrabold text-red-600 text-center mb-12">Perguntas Frequentes</h2>
        <div className="space-y-4">
          {faqs.map((f, i) => <FaqItem key={i} {...f} />)}
        </div>
      </motion.section>
    </>
  );
}
