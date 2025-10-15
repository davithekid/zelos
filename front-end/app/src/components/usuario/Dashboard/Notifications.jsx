'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function Notifications({
  notifications,
  marcarComoLida,
  limparTodasNotificacoes,
  unreadNotificationsCount,
  isNotificationsOpen,
  setNotificationsOpen,
  notificationsRef
}) {
  const defaultIcon = <CheckCircle className="w-5 h-5 text-red-500" />;

  return (
    <div className="relative" ref={notificationsRef}>
      <motion.button
        onClick={() => setNotificationsOpen(!isNotificationsOpen)}
        className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        whileTap={{ scale: 0.9 }}
        aria-label="Notificações"
      >
        <Bell className="w-6 h-6 cursor-pointer " />
        {unreadNotificationsCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full flex items-center justify-center shadow-sm"
          >
            {unreadNotificationsCount}
          </motion.span>
        )}
      </motion.button>
      <AnimatePresence>
        {isNotificationsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-40 lg:hidden"
              onClick={() => setNotificationsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="fixed inset-x-0 top-16 mx-auto w-[95vw] max-w-sm sm:max-w-md md:max-w-lg lg:fixed lg:right-4 lg:top-16 lg:inset-x-auto lg:mx-0 lg:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <div className="flex items-center">
                  <h3 className="font-bold text-lg text-gray-800">Notificações</h3>
                  {unreadNotificationsCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  {notifications.length > 0 && (
                    <button onClick={limparTodasNotificacoes} className="text-sm text-red-600 hover:text-red-800 font-medium transition hidden sm:block cursor-pointer">
                      Limpar tudo
                    </button>
                  )}
                  <button onClick={() => setNotificationsOpen(false)} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="max-h-[calc(100vh-10rem)] lg:max-h-[70vh] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <motion.div
                      key={n.id}
                      onClick={() => marcarComoLida(n.id)}
                      className={`flex items-start p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-150 ${!n.lida ? 'bg-red-50' : ''}`}
                    >
                      <div className="flex-shrink-0 mr-3 mt-0.5">
                        {defaultIcon}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-sm text-gray-700 mt-1 line-clamp-3">{n.mensagem}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(n.criado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!n.lida && (
                        <div className="ml-3 flex-shrink-0 mt-1">
                          <div className="w-2.5 h-2.5 bg-red-500 rounded-full" title="Não lida" />
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 mx-auto text-gray-300" />
                    <p className="mt-4 text-gray-500">Nenhuma notificação nova.</p>
                    <p className="text-sm text-gray-400 mt-1">Você está em dia!</p>
                  </div>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 bg-gray-50 sm:hidden">
                  <button onClick={limparTodasNotificacoes} className="w-full py-2 text-sm text-red-600 hover:text-red-800 font-medium transition">
                    Limpar todas as notificações
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}