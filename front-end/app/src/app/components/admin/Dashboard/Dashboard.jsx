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

import Inicio from '../Inicio/Inicio';
import GerenciarChamados from '../Atribuicoes/GerenciarAtribuicoes';
import ChamadosAtribuidos from '../Chamados/ChamadosAtribuidos';
import Relatorio from '../Relatorios/Relatorios';
import AbrirChamado from '../AbrirChamado/Chamado';
import GerenciarPatrimonios from '../GerenciasPatrimonios/GerenciarPatrimonios';
import GerenciarUsuarios from '../GerenciarUsuarios/GerenciarUsuarios';
import Apontamentos from '../Apontamentos/Apontamentos';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('inicio');
    const [funcionario, setFuncionario] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [hasActiveChamado, setHasActiveChamado] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const router = useRouter();
    useEffect(() => {
        const token = Cookies.get('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setFuncionario(decodedToken);
            } catch (error) {
                console.error('Token inválido, redirecionando:', error);
                Cookies.remove('token');
                router.push('/login');
            }
        } else {
            router.push('/login');
        }
        setIsLoading(false);
    }, [router]);

    useEffect(() => {
        if (!funcionario?.id || funcionario.funcao !== 'tecnico') return;

        const verificarChamadoAtivo = async () => {
            try {
                const response = await api.get(`/chamados?tecnico_id=${funcionario.id}`);
                const STATUS_BLOQUEIO = ['em andamento', 'andamento']; 

                const ativos = response.data?.filter(
                    (chamado) =>
                        chamado.tecnico_id === funcionario.id && 
                        STATUS_BLOQUEIO.includes(chamado.status?.toLowerCase())
                );
                setHasActiveChamado(ativos.length > 0);

            } catch (error) {
                console.error('Erro ao verificar chamados em andamento:', error.response?.data || error.message);
                setHasActiveChamado(false); 
            }
        };

        verificarChamadoAtivo();
        const intervalId = setInterval(verificarChamadoAtivo, 10000); 
        return () => clearInterval(intervalId);
        
    }, [funcionario]);

    useEffect(() => {
        if (!funcionario) return;
        const fetchNotifications = async () => {
            try {
                const response = await api.get('/notificacao');
                setNotifications(response.data);
            } catch (error) {
                console.error('Erro ao buscar notificações:', error.response?.data || error.message);
            }
        };
        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 15000);
        return () => clearInterval(intervalId);
    }, [funcionario]);

    const getInitials = (name = '') =>
        name ? name.split(' ').map((n) => n[0]).join('').toUpperCase() : '?';

    const marcarComoLida = async (notificationId) => {
        const notification = notifications.find((n) => n.id === notificationId);
        if (!notification || notification.lida) return;
        setNotifications((prev) =>
            prev.map((n) => (n.id === notificationId ? { ...n, lida: true } : n))
        );
        try {
            await api.patch(`/notificacao/${notificationId}/lida`);
        } catch (error) {
            console.error('Erro ao marcar notificação como lida:', error);
            setNotifications((prev) =>
                prev.map((n) => (n.id === notificationId ? { ...n, lida: false } : n))
            );
        }
    };

    const limparTodasNotificacoes = async () => {
        const backup = [...notifications];
        setNotifications([]);
        try {
            await api.delete('/notificacao');
        } catch (error) {
            console.error('Erro ao limpar notificações no servidor:', error);
            setNotifications(backup);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center text-lg text-gray-600">
                Verificando autenticação...
            </div>
        );
    }

    if (!funcionario) return null;
    const handleChangeTab = (tab) => {
        const isBlockedTab = tab === 'gerenciar'; 
        
        if (
            funcionario.funcao === 'tecnico' &&
            isBlockedTab &&
            hasActiveChamado
        ) {
            setShowDialog(true);
            return; // Impede navegação
        }
        setActiveTab(tab);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'inicio':
                return <Inicio setActiveTab={handleChangeTab} />;
            case 'abrir':
                return <AbrirChamado funcionario={funcionario} />;
            case 'gerenciar':
                return <GerenciarChamados funcionario={funcionario} />;
            case 'usuarios':
                return <GerenciarUsuarios funcionario={funcionario} />;
            case 'atribuidos':
                return <ChamadosAtribuidos funcionario={funcionario} setActiveTab={handleChangeTab} />;
            case 'patrimonio':
                return <GerenciarPatrimonios funcionario={funcionario} />;
            case 'apontamentos':
                return <Apontamentos funcionario={funcionario} />;
            case 'relatorio':
                return <Relatorio />;
            case 'info':
                return <ProfileInfo funcionario={funcionario} getInitials={getInitials} />;
            default:
                return <Inicio setActiveTab={handleChangeTab} />;
        }
    };

    return (
        <>
            <div className="flex h-screen bg-gray-100 font-sans">
                <Sidebar activeTab={activeTab} setActiveTab={handleChangeTab} />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header
                        activeTab={activeTab}
                        setActiveTab={handleChangeTab}
                        notifications={notifications}
                        marcarComoLida={marcarComoLida}
                        limparTodasNotificacoes={limparTodasNotificacoes}
                        unreadNotificationsCount={notifications.filter((n) => !n.lida).length}
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

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Chamado em Andamento</DialogTitle>
                        <DialogDescription>
                            Você possui um chamado atribuído em andamento. Finalize-o
                            antes de visualizar e atribuir novos chamados do pool geral.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button 
                            onClick={() => {
                                setShowDialog(false);
                                handleChangeTab('atribuidos'); 
                            }}
                        >
                            Ver Meu Chamado Ativo
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => setShowDialog(false)}
                        >
                            Ficar Aqui
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}