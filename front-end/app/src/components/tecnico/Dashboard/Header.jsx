'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Notifications from './Notifications';
import ProfileDropdown from './ProfileDropdown';
import { toast } from 'sonner';

const tabs = [
    { id: 'inicio', label: 'Início' },
    { id: 'abertos', label: 'Chamados Abertos' },
    { id: 'atribuidos', label: 'Meus Chamados' },
    { id: 'historico', label: 'Meu Histórico' },
    { id: 'info', label: 'Perfil' },
];
const profileTab = { id: 'info', label: 'Meu Perfil' };

export default function Header({
  activeTab, setActiveTab,
  notifications, marcarComoLida, limparTodasNotificacoes, unreadNotificationsCount,
  funcionario, getInitials
}) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
      document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'auto';
      return () => { document.body.style.overflow = 'auto'; };
  }, [isMobileMenuOpen]);

 const handleLogout = () => {
    toast.success("Logout efetuado com sucesso.");
    Cookies.remove('token');
    setTimeout(() => {
        router.push('/login');
    }, 1000); 
  };
  
  const handleSelecao = (opcao) => {
      setActiveTab(opcao);
      setMobileMenuOpen(false);
  };
  
  const getActiveTabLabel = () => {
      const active = tabs.find(t => t.id === activeTab) || (activeTab === 'info' ? profileTab : { label: 'Painel' });
      return active.label;
  };

  return (
    <header className="bg-gradient-to-r from-gray-50 via-white to-gray-50 shadow-md h-20 flex items-center justify-between px-6 z-30 sticky top-0">
      <div className="flex items-center space-x-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} 
          className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-200 transition" aria-label="Abrir Menu">
          {isMobileMenuOpen ? <XMarkIcon className="w-7 h-7" /> : <Bars3Icon className="w-7 h-7" />}
        </motion.button>
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{getActiveTabLabel()}</h2>
      </div>

      <div className="flex items-center space-x-6">
        <Notifications
          notifications={notifications} marcarComoLida={marcarComoLida}
          limparTodasNotificacoes={limparTodasNotificacoes}
          unreadNotificationsCount={unreadNotificationsCount}
          isNotificationsOpen={isNotificationsOpen} setNotificationsOpen={setNotificationsOpen}
          notificationsRef={notificationsRef}
        />
        <span className="hidden lg:block w-px h-6 bg-gray-300"></span>
        <ProfileDropdown
          funcionario={funcionario} getInitials={getInitials}
          isProfileOpen={isProfileOpen} setProfileOpen={setProfileOpen}
          handleSelecao={() => handleSelecao('info')}
          dropdownRef={dropdownRef}
          handleLogout={handleLogout}
        />
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-20" onClick={() => setMobileMenuOpen(false)} />
            <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 w-full bg-white shadow-lg border-t z-20 rounded-b-2xl overflow-hidden">
              <ul className="flex flex-col p-2">
                {tabs.map(tab => (
                  <li key={tab.id}>
                    <button onClick={() => handleSelecao(tab.id)} className={`w-full text-left px-4 py-3 transition rounded-lg text-base ${ activeTab === tab.id ? 'bg-red-600 text-white font-semibold' : 'text-gray-700 hover:bg-gray-100' }`}>
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}