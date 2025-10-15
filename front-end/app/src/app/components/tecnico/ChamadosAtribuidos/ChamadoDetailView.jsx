'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    CalendarIcon, UserCircleIcon, WrenchScrewdriverIcon, PlusCircleIcon,
    ArrowUpOnSquareIcon, BuildingOffice2Icon, PhotoIcon 
} from '@heroicons/react/24/outline';
import api from '../../../lib/api';
import ConfirmaModal from './ConfirmaModal';
import { toast } from 'sonner';

function capitalize(str = '') { return str.charAt(0).toUpperCase() + str.slice(1); }

const formatarData = (dataString) => {
    if (!dataString) return 'Data indisponível';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dataString).toLocaleDateString('pt-BR', options).replace(',', ' às');
};

const ApontamentoCard = ({ apontamento }) => {
    const duracao = apontamento.fim ? `${Math.floor(apontamento.duracao / 60)}h ${apontamento.duracao % 60}min` : "Em andamento";
    
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4 p-4 border-l-4 border-red-500 bg-red-50/50 rounded-r-lg"
        >
            <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shadow-sm">
                    <WrenchScrewdriverIcon className="w-5 h-5 text-red-600" />
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 font-medium leading-relaxed break-words">{apontamento.descricao}</p>
                <div className="text-xs text-gray-500 mt-2 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                    <span className="font-semibold">Início: {formatarData(apontamento.comeco)}</span>
                    {apontamento.fim && <span className="font-semibold">Fim: {formatarData(apontamento.fim)} ({duracao})</span>}
                </div>
            </div>
        </motion.div>
    );
};

const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-5 h-5 text-gray-400">{icon}</div>
        <div>
            <p className="font-semibold text-gray-800">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
        </div>
    </div>
);


export default function ChamadoDetailView({ chamado, apontamentos = [], onAbrirApontamento }) {
    const [pedidoEnviado, setPedidoEnviado] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    useEffect(() => {
        if (!chamado?.id) return;
        
        setPedidoEnviado(false); 
        
        const verificarPedidoExistente = async () => {
            try {
                const response = await api.get(`/pedidos-fechamento?chamado_id=${chamado.id}`);
                
                if (response.data && response.data.length > 0 && response.data.some(p => p.status === 'pendente')) {
                    setPedidoEnviado(true);
                }
            } catch (error) {
                console.error("Não foi possível verificar pedidos de fechamento existentes:", error);
            }
        };
        verificarPedidoExistente();
    }, [chamado?.id]);

    const handleConfirmarFechamento = async () => {
        setIsSubmitting(true);
        try {
            await api.post('/pedidos-fechamento', { chamado_id: chamado.id });
            setPedidoEnviado(true); 
            toast.success("Pedido de fechamento enviado com sucesso!");
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Não foi possível enviar o pedido.";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
            setIsConfirmModalOpen(false);
        }
    };

    const usuarioNome = chamado.usuario?.nome || "Usuário não identificado";
    const localizacao = capitalize(chamado.pool?.titulo || "Não especificado");
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const imagemUrl = chamado.img_url ? `${API_BASE_URL}${chamado.img_url}` : null;
    const patrimonio = chamado.numero_patrimonio || 'Não informado';

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
            >
                <div className="bg-white rounded-2xl shadow-subtle border p-6">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 break-words">{chamado.titulo}</h2>
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
                        <div className="space-y-4">
                            <InfoItem icon={<UserCircleIcon />} label="Solicitante" value={usuarioNome} />
                            <InfoItem icon={<BuildingOffice2Icon />} label="Tipo / Local" value={localizacao} />
                            <InfoItem icon={<CalendarIcon />} label="Data de Abertura" value={formatarData(chamado.criado_em)} />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="font-bold text-gray-600">Patrimônio:</p>
                                <p className="text-red-600 font-bold mt-1 text-base">{patrimonio}</p>
                            </div>
                            <div>
                                <p className="font-bold text-gray-600">Descrição do Problema:</p>
                                <p className="text-gray-700 leading-relaxed mt-1">{chamado.descricao}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-subtle border p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Histórico de Atividades</h3>
                    <div className="space-y-4">
                        {apontamentos && apontamentos.length > 0 ? (
                            apontamentos.map(ap => <ApontamentoCard key={ap.id} apontamento={ap} />)
                        ) : (
                            <div className="text-center text-gray-500 py-6 bg-gray-50/70 rounded-lg">
                                <WrenchScrewdriverIcon className="w-8 h-8 mx-auto text-gray-400 mb-2"/>
                                <p className="font-medium">Nenhum apontamento registrado.</p>
                            </div>
                        )}
                    </div>
                </div>
                
                {imagemUrl && (
                    <div className="bg-white rounded-2xl shadow-subtle border p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <PhotoIcon className="w-6 h-6 text-gray-500" /> Imagem Anexada
                        </h3>
                        <div className="mt-4 bg-gray-100 p-2 rounded-lg">
                           <img src={imagemUrl} alt={`Anexo para ${chamado.titulo}`}
                           className="w-full h-auto max-h-[70vh] object-contain rounded-md"
                           loading="lazy" />
                        </div>
                    </div>
                )}
                
                <div className="sticky bottom-6 flex flex-col sm:flex-row justify-end gap-3 z-10">
                    <motion.button 
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => onAbrirApontamento(chamado)} 
                        disabled={pedidoEnviado} // 👈 BLOQUEIO APLICADO AQUI
                        className={`px-5 py-2.5 font-bold cursor-pointer rounded-lg shadow-lg flex items-center justify-center gap-2 text-base transition-all 
                            ${pedidoEnviado 
                                ? 'bg-gray-400 text-gray-800 cursor-not-allowed shadow-none' 
                                : 'bg-red-600 text-white hover:shadow-xl hover:bg-red-700'}`
                        }
                    >
                        <PlusCircleIcon className="w-5 h-5"/> 
                        <span>
                            {pedidoEnviado ? 'Fechamento Solicitado' : 'Criar Apontamento'}
                        </span>
                    </motion.button>
                    
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setIsConfirmModalOpen(true)}
                        disabled={pedidoEnviado || isSubmitting}
                        className="px-5 py-2.5 rounded-lg flex items-center justify-center cursor-pointer gap-2 text-base transition-colors font-bold shadow-lg hover:shadow-xl bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 disabled:text-gray-800 disabled:cursor-not-allowed">
                        <ArrowUpOnSquareIcon className="w-5 h-5"/>
                        <span>{pedidoEnviado ? 'Pedido Enviado' : (isSubmitting ? 'Enviando...' : 'Solicitar Fechamento')}</span>
                    </motion.button>
                </div>
            </motion.div>
            
            <ConfirmaModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmarFechamento}
                title="Solicitar Fechamento de Chamado"
                message={`Você confirma que concluiu as tarefas para o chamado "${chamado.titulo}" e deseja solicitar o fechamento?`}
                isLoading={isSubmitting}
                confirmText="Sim, solicitar"
                cancelText="Não, voltar"
                confirmColor="red"
            />
        </>
    );
}