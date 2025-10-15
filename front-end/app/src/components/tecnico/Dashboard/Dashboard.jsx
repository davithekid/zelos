'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

import api from '../../../app/lib/api';
import Sidebar from './Slidebar';
import Header from './Header';
import ProfileInfo from './ProfileInfo';
import InicioTecnico from '../Inicio/InicioTecnico';
import ChamadosAbertos from '../ChamadosAbertos/ChamadosAbertos';
import ChamadosAtribuidos from '../ChamadosAtribuidos/ChamadosAtribuidos';
import HistoricoChamados from '../HistoricoChamados/HistoricoChamados';

export default function DashboardTecnico() {
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
        if (decodedToken.funcao !== 'tecnico') {
          console.error("Acesso não autorizado para esta função.");
          router.push('/'); 
          return;
        }
        setFuncionario(decodedToken);
      } catch (error) {
        console.error("Token inválido, redirecionando:", error);
        Cookies.remove('token');
        router.push('/');
      }
    } else {
      router.push('/');
    }
    setIsLoading(false);
  }, [router]);
  useEffect(() => {
    if (!funcionario) return;

    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notificacao');
        setNotifications(response.data);
      } catch (error) { console.error("Erro ao buscar notificações:", error); }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 10000);
    return () => clearInterval(intervalId);
  }, [funcionario]);
  const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase();

  const marcarComoLida = async (notificationId) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification || notification.lida) return;
    setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, lida: true } : n)));
    try {
      await api.patch(`/notificacao/${notificationId}/lida`);
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
      setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, lida: false } : n)));
    }
  };

  const limparTodasNotificacoes = async () => {
    const backup = [...notifications];
    setNotifications([]);
    try {
      await api.delete('/notificacao');
    } catch (error) {
      console.error("Erro ao limpar notificações:", error);
      setNotifications(backup);
    }
  };
  
   const handleSaveEspecialidade = async (especialidade) => {
    if (!funcionario || !funcionario.id) return;
    try {
      const response = await api.patch(`/usuarios/${funcionario.id}`, { especialidade });
      setFuncionario(prev => ({ ...prev, especialidade: response.data.especialidade }));
    } catch (error) {
      console.error("Falha ao atualizar especialidade:", error);
      throw error;
    }
  };
  if (isLoading || !funcionario) {
    return <div className="flex h-screen items-center justify-center">Verificando autenticação...</div>;
  }
  
  const renderContent = () => {
    switch(activeTab) {
      case 'inicio': return <InicioTecnico setActiveTab={setActiveTab} />;
      case 'abertos': return <ChamadosAbertos funcionario={funcionario} />;
      case 'atribuidos': return <ChamadosAtribuidos funcionario={funcionario} />;
      case 'historico': return <HistoricoChamados funcionario={funcionario} />;
      case 'info': return <ProfileInfo funcionario={funcionario} getInitials={getInitials} onSaveEspecialidade={handleSaveEspecialidade}/>;
      default: return <InicioTecnico setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          activeTab={activeTab} setActiveTab={setActiveTab}
          notifications={notifications} marcarComoLida={marcarComoLida}
          limparTodasNotificacoes={limparTodasNotificacoes}
          unreadNotificationsCount={notifications.filter(n => !n.lida).length}
          funcionario={funcionario} getInitials={getInitials}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.25, ease: 'easeInOut' }}>
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

    </div>
  );
}