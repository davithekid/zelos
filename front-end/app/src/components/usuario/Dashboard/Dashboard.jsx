'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import api from '../../../app/lib/api';
import Sidebar from './Slidebar';
import Header from './Header';
import Inicio from '../Inicio/Inicio';
import Chamado from '../AbrirChamado/Chamado';
import MeusChamados from '../../blocks/MeusChamados/MinhasPools';
import InstrucoesRapidas from '../Instrucoes/page';
import ProfileInfo from './ProfileInfo';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [funcionario, setFuncionario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const router = useRouter();
  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setFuncionario({
          id: decodedToken.id,
          nome: decodedToken.nome,
          funcao: decodedToken.funcao,
          email: decodedToken.email,
          matricula: decodedToken.username,
        });
      } catch (error) {
        console.error("Token inválido ou expirado, redirecionando:", error);
        Cookies.remove('token');
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
    setIsLoading(false);
  }, [router]);
  useEffect(() => {
    if (!funcionario) return;

    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notificacao');
        setNotifications(response.data);
      } catch (error) {
        console.error("Erro ao buscar notificações:", error);
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 10000);

    return () => clearInterval(intervalId);
  }, [funcionario]);
  const getInitials = (name = '') => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  const marcarComoLida = async (notificationId) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification || notification.lida) return;
    setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, lida: true } : n)));
  };

  const limparTodasNotificacoes = async () => {
    const originalNotifications = [...notifications];
    setNotifications([]);
    try {
      await api.delete('/notificacao');
    } catch (error) {
      console.error("Erro ao limpar notificações:", error);
      setNotifications(originalNotifications);
    }
  };
  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Verificando autenticação...</div>;
  }
  if (!funcionario) {
    return null;
  }
  const renderContent = () => {
    switch (activeTab) {
      case 'inicio': return <><Inicio onAbrirChamado={() => setActiveTab('chamado')} /><InstrucoesRapidas /></>;
      case 'chamado': return <Chamado funcionario={funcionario} />;
      case 'meus': return <MeusChamados funcionario={funcionario} />;
      case 'info': return <ProfileInfo funcionario={funcionario} getInitials={getInitials} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          notifications={notifications}
          marcarComoLida={marcarComoLida}
          limparTodasNotificacoes={limparTodasNotificacoes}
          unreadNotificationsCount={notifications.filter(n => !n.lida).length}
          funcionario={funcionario}
          getInitials={getInitials}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>
    </div>
  );
}