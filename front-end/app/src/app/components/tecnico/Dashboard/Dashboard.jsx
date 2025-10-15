'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import api from '../../../lib/api';

import Sidebar from './Slidebar';
import Header from './Header';
import ProfileInfo from './ProfileInfo';
import InicioTecnico from '../Inicio/InicioTecnico';
import ChamadosAbertos from '../ChamadosAbertos/ChamadosAbertos';
import ChamadosAtribuidos from '../ChamadosAtribuidos/ChamadosAtribuidos';
import HistoricoChamados from '../HistoricoChamados/HistoricoChamados';

// 📦 Importa o Dialog do shadcn/ui
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function DashboardTecnico() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [funcionario, setFuncionario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [hasActiveChamado, setHasActiveChamado] = useState(false);
  const [showDialog, setShowDialog] = useState(false); // 👈 controla o Dialog
  const router = useRouter();

  // ✅ Verificação de autenticação
  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.funcao !== 'tecnico') {
          console.error("Acesso não autorizado para esta função.");
          router.push('/login');
          return;
        }
        setFuncionario(decodedToken);
      } catch (error) {
        console.error("Token inválido, redirecionando:", error);
        Cookies.remove('token');
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
    setIsLoading(false);
  }, [router]);

  // 🔔 Busca notificações
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

  // 🔎 Verifica se o técnico já tem chamado em andamento
  useEffect(() => {
    if (!funcionario?.id) return;

    const verificarChamadoAtivo = async () => {
      try {
        const response = await api.get(`/chamados?tecnico_id=${funcionario.id}&status=andamento`);
        setHasActiveChamado(response.data && response.data.length > 0);
      } catch (error) {
        console.error("Erro ao verificar chamados em andamento:", error);
      }
    };

    verificarChamadoAtivo();
  }, [funcionario]);

  // 🧩 Utilitários
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

  // ✅ Função que controla qual conteúdo será exibido
  const renderContent = () => {
    switch (activeTab) {
      case 'inicio':
        return <InicioTecnico setActiveTab={setActiveTab} />;
      case 'abertos':
        if (hasActiveChamado) {
          setShowDialog(true);
          setActiveTab('inicio');
          return <InicioTecnico setActiveTab={setActiveTab} />;
        }
        return <ChamadosAbertos funcionario={funcionario} />;
      case 'atribuidos':
        return <ChamadosAtribuidos funcionario={funcionario} />;
      case 'historico':
        return <HistoricoChamados funcionario={funcionario} />;
      case 'info':
        return <ProfileInfo funcionario={funcionario} getInitials={getInitials} onSaveEspecialidade={handleSaveEspecialidade} />;
      default:
        return <InicioTecnico setActiveTab={setActiveTab} />;
    }
  };

  return (
    <>
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

      {/* 💬 Dialog do ShadCN */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Chamado em andamento</DialogTitle>
            <DialogDescription>
              Você já possui um chamado em andamento. Finalize-o antes de abrir ou visualizar novos chamados abertos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button className={'bg-red-500 hover:bg-red-600 cursor-pointer'} onClick={() => setShowDialog(false)}>Entendido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
