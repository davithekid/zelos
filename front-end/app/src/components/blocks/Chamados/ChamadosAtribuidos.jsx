'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { FiFilter, FiEdit, FiX, FiPlus, FiSearch, FiAlertTriangle, FiCheckCircle, FiChevronDown, FiInbox, FiSlash, FiLoader, FiChevronLeft, FiChevronRight, FiBriefcase, FiCheckSquare, FiList, FiRefreshCw } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '../../../lib/api';
import GerenciarFechamentos from '../../../../components/blocks/GerenciarFechamento/GerenciarFechamento'; 

const tailwindColorMap = {
    red: { iconBg: 'bg-red-100/70', iconText: 'text-red-600', badgeBg: 'bg-red-100', badgeText: 'text-red-800', activeBorder: 'border-red-500' },
    yellow: { iconBg: 'bg-yellow-100/70', iconText: 'text-yellow-600', badgeBg: 'bg-yellow-100', badgeText: 'text-yellow-800', activeBorder: 'border-yellow-500' },
    green: { iconBg: 'bg-green-100/70', iconText: 'text-green-600', badgeBg: 'bg-green-100', badgeText: 'text-green-800', activeBorder: 'border-green-500' },
    gray: { iconBg: 'bg-gray-100/70', iconText: 'text-gray-600', badgeBg: 'bg-gray-100', badgeText: 'text-gray-800', activeBorder: 'border-gray-500' },
    blue: { iconBg: 'bg-blue-100/70', iconText: 'text-blue-600', badgeBg: 'bg-blue-100', badgeText: 'text-blue-800', activeBorder: 'border-blue-500' },
};

const capitalize = (s = '') => {
    if (!s) return '';
    const str = s.replace(/_/g, ' ');
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const StatusBadge = ({ status }) => {
    const statusLabel = capitalize(status === 'em andamento' ? 'Em Andamento' : status);
    
    const config = {
        'Aberto': { icon: <FiAlertTriangle />, colorKey: 'red' },
        'Em Andamento': { icon: <FiLoader className="animate-spin" />, colorKey: 'yellow' },
        'Concluido': { icon: <FiCheckCircle />, colorKey: 'green' },
        'Cancelado': { icon: <FiSlash />, colorKey: 'gray' },
    };
    
    const { icon, colorKey } = config[statusLabel] || { icon: '?', colorKey: 'gray' };
    
    const { badgeBg, badgeText } = tailwindColorMap[colorKey] || tailwindColorMap.gray;
    const colorClasses = `${badgeBg} ${badgeText}`;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClasses}`}>
            {icon} {statusLabel}
        </span>
    );
};

const Spinner = () => <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />;

const ReportCard = ({ title, count, icon, color, onClick, isActive, isLoading, isClickable = true }) => {
    const baseClasses = "flex flex-col p-5 rounded-xl shadow-lg transition-all duration-300 transform bg-white";
    
    let clickClasses = "";
    if (isClickable) {
        clickClasses = "cursor-pointer hover:scale-[1.02] active:scale-[0.98]";
    } else {
        clickClasses = "cursor-default";
    }

    const colorConfig = tailwindColorMap[color] || tailwindColorMap.red; 

    const activeClasses = isActive 
        ? `border-2 ${colorConfig.activeBorder}`
        : `hover:shadow-xl`; 
    
    const handleClick = () => {
        if (isClickable && onClick) {
            onClick();
        }
    };

    return (
        <motion.div 
            layout 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className={`${baseClasses} ${clickClasses} ${activeClasses} min-w-[200px]`}
            onClick={handleClick}
        >
            <div className={`${colorConfig.iconText} p-2 rounded-full ${colorConfig.iconBg} w-fit mb-3`}>
                {icon}
            </div>
            <p className="text-xl font-extrabold text-gray-800">
                {isLoading ? <FiLoader className="animate-spin inline-block mr-1 text-base" /> : count}
            </p>
            <p className="text-sm text-gray-500 font-medium mt-1">{title}</p>
        </motion.div>
    );
};


const Paginacao = ({ currentPage, totalPages, onPageChange }) => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div className="flex items-center justify-between sm:justify-end gap-4 mt-6">
            <div className="text-sm text-gray-600 hidden sm:block">
                Página {currentPage} de {totalPages}
            </div>
            
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                    <FiChevronLeft size={16} />
                </button>

                {startPage > 1 && (
                    <>
                        <button
                            onClick={() => onPageChange(1)}
                            className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            1
                        </button>
                        {startPage > 2 && <span className="px-2">...</span>}
                    </>
                )}

                {pages.map(page => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-3 py-2 rounded-lg border transition-colors ${
                            currentPage === page
                                ? 'bg-red-600 text-white border-red-600'
                                : 'border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        {page}
                    </button>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="px-2">...</span>}
                        <button
                            onClick={() => onPageChange(totalPages)}
                            className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                    <FiChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default function TabelaChamados({ setActiveTab: originalSetActiveTab, funcionario }) {
    const [activeTab, setActiveTab] = useState('tabela');
    
    const [counts, setCounts] = useState({
        todos: 0,
        em_andamento: 0,
        solicitacao_fechamento: 0,
    });
    
    const [countsLoading, setCountsLoading] = useState(true);
    const [chamados, setChamados] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [editingTicket, setEditingTicket] = useState(null);
    const [ticketToCancel, setTicketToCancel] = useState(null);
    const [filtroStatus, setFiltroStatus] = useState('');
    const [pesquisa, setPesquisa] = useState('');
    const [pageLoading, setPageLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const fetchCounts = useCallback(async () => {
        setCountsLoading(true);
        try {
            const [
                chamadosTodosRes,
                fechamentosRes
            ] = await Promise.all([
                api.get('/chamados'), 
                api.get('/pedidos-fechamento/pendentes')
            ]);

            const todosChamados = chamadosTodosRes.data || [];
            const emAndamentoCount = todosChamados.filter(c => 
                c.status === 'em andamento'
            ).length;

            setCounts({
                todos: todosChamados.length,
                em_andamento: emAndamentoCount, 
                solicitacao_fechamento: fechamentosRes.data.length,
            });
        } catch (error) {
            console.error("Erro ao buscar contagens:", error);
            if (countsLoading) toast.error("Falha ao carregar dados de resumo."); 
        } finally {
            setCountsLoading(false);
        }
    }, [countsLoading]);

    const fetchChamadosData = async () => {
        if (!chamados.length) setPageLoading(true);
        try {
            const [chamadosRes, tecnicosRes] = await Promise.all([
                api.get('/chamados'),
                api.get('/usuarios/tecnicos')
            ]);

            setChamados(chamadosRes.data);
            setTecnicos(tecnicosRes.data);
        } catch (error) {
            toast.error("Erro ao carregar dados da tabela.");
            console.error("Erro ao buscar dados da tabela:", error);
        } finally {
            setPageLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchChamadosData();
        fetchCounts();
        toast.info("A atualizar dados...");
    }

    useEffect(() => {
        fetchChamadosData();
        fetchCounts();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [filtroStatus, pesquisa]);

    const tecnicosOcupadosIds = useMemo(() => {
        const ocupados = chamados
            .filter(c => c.status === 'em andamento' && c.tecnico_id)
            .map(c => c.tecnico_id);
        return [...new Set(ocupados)];
    }, [chamados]);

    const tecnicosDisponiveisParaAtribuicao = useMemo(() => {
        return tecnicos.filter(t => !tecnicosOcupadosIds.includes(t.id));
    }, [tecnicos, tecnicosOcupadosIds]);

    const handleSave = async () => {
        if (!editingTicket) return;
        setActionLoading(true);

        const newTecnicoId = editingTicket.tecnico_id ? parseInt(editingTicket.tecnico_id) : null;
        const currentTecnicoId = editingTicket.tecnico ? editingTicket.tecnico.id : null;
        const newStatus = editingTicket.status;

        if (newTecnicoId && newTecnicoId !== currentTecnicoId) {
            if (tecnicosOcupadosIds.includes(newTecnicoId)) {
                const isTechnicianCurrentlyWorkingOnThisTicket = currentTecnicoId === newTecnicoId && newStatus === 'em andamento';

                if (!isTechnicianCurrentlyWorkingOnThisTicket) {
                    toast.error('O técnico já possui um chamado em andamento e não pode receber outro.');
                    setActionLoading(false);
                    return;
                }
            }
        }
        if (newStatus === 'em andamento' && !newTecnicoId) {
            toast.error('Para colocar o chamado "Em Andamento", um técnico deve ser atribuído.');
            setActionLoading(false);
            return;
        }


        try {
            await api.patch(`/chamados/${editingTicket.id}`, {
                titulo: editingTicket.titulo,
                tecnico_id: newTecnicoId,
                status: newStatus
            });
            await fetchChamadosData();
            fetchCounts(); 
            setEditingTicket(null);
            toast.success('Chamado atualizado com sucesso!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Falha ao atualizar o chamado.');
            console.error('Falha na atualização:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!ticketToCancel) return;
        setActionLoading(true);
        try {
            await api.patch(`/chamados/${ticketToCancel.id}/status`, { status: 'cancelado' });
            await fetchChamadosData();
            fetchCounts(); 
            setTicketToCancel(null);
            toast.success('Chamado cancelado com sucesso!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Falha ao cancelar o chamado.');
            console.error('Falha ao cancelar:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const filteredTickets = useMemo(() => {
        return chamados.filter(c => {
            const tecnicoNome = (c.tecnico ? c.tecnico.nome : 'não atribuído').toLowerCase();
            const p = pesquisa.toLowerCase();
            return (c.titulo.toLowerCase().includes(p) || tecnicoNome.includes(p)) &&
                (filtroStatus === '' || c.status === filtroStatus);
        });
    }, [chamados, pesquisa, filtroStatus]);

    const totalItems = filteredTickets.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredTickets.slice(startIndex, endIndex);

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
    const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

    const renderContent = () => {
        switch (activeTab) {
            case 'fechamentos':
                return <GerenciarFechamentos onUpdate={fetchCounts} />;
            case 'tabela':
            default:
                if (pageLoading) {
                    return <div className="flex justify-center items-center h-[50vh]"><FiLoader className="animate-spin text-4xl text-red-600" /></div>;
                }
                
                return (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2">
                        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/80 pb-6 mb-6">
                            <div>
                                <h1 className="text-3xl font-extrabold text-red-600 drop-shadow-md">Gerenciamento de Chamados</h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    {totalItems} chamado{totalItems !== 1 ? 's' : ''} encontrado{totalItems !== 1 ? 's' : ''}
                                    {filtroStatus && ` • Filtrado por: ${capitalize(filtroStatus)}`}
                                </p>
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <motion.button
                                    onClick={handleRefresh}
                                    disabled={countsLoading || pageLoading}
                                    className="flex items-center gap-2 bg-gray-200 text-gray-800 font-semibold py-2.5 px-4 rounded-lg shadow-sm hover:bg-gray-300 transition-all w-full sm:w-auto justify-center cursor-pointer disabled:opacity-50 disabled:cursor-wait">
                                    {countsLoading || pageLoading ? <FiLoader size={18} className="animate-spin" /> : <FiRefreshCw size={18} />} 
                                    Atualizar
                                </motion.button>
                                <motion.button
                                    onClick={() => originalSetActiveTab('abrir')} 
                                    whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 bg-red-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:bg-red-700 transition-all w-full sm:w-auto justify-center cursor-pointer">
                                    <FiPlus size={18} /> Novo Chamado
                                </motion.button>
                            </div>
                        </header>

                        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                            <div className="relative w-full md:flex-1 group">
                                <FiSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                                <input type="text" placeholder="Pesquisar por título ou técnico..." className="bg-zinc-100 border-2 border-transparent p-3 pl-12 rounded-lg w-full focus:bg-white focus:border-red-500 transition-all outline-none" value={pesquisa} onChange={e => setPesquisa(e.target.value)} />
                            </div>
                            <div className="relative w-full md:w-auto group">
                                <FiFilter className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <FiChevronDown className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <select className="bg-zinc-100 border-2 border-transparent font-medium text-gray-700 p-3 pl-12 rounded-lg w-full md:w-60 appearance-none focus:bg-white focus:border-red-500 transition-all outline-none" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
                                    <option value="">Todos os Status</option>
                                    <option value="aberto">Aberto</option>
                                    <option value="em andamento">Em Andamento</option>
                                    <option value="concluido">Concluído</option>
                                    <option value="cancelado">Cancelado</option>
                                </select>
                            </div>
                            <div className="relative w-full md:w-auto group">
                                <select 
                                    value={itemsPerPage} 
                                    onChange={e => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="bg-zinc-100 border-2 border-transparent font-medium text-gray-700 p-3 rounded-lg w-full md:w-32 appearance-none focus:bg-white focus:border-red-500 transition-all outline-none"
                                >
                                    <option value={5}>5 por página</option>
                                    <option value={10}>10 por página</option>
                                    <option value={20}>20 por página</option>
                                    <option value={50}>50 por página</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <motion.table variants={containerVariants} initial="hidden" animate="show" className="w-full text-left table-auto hidden md:table">
                                <thead className="bg-gray-50/70 text-gray-600 text-xs uppercase">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Patrimônio</th>
                                        <th className="px-4 py-3 font-semibold">Título</th>
                                        <th className="px-4 py-3 font-semibold">Técnico Atribuído</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.length > 0 ? currentItems.map((chamado, index) => {
                                        const isActionable = chamado.status === 'aberto' || chamado.status === 'em andamento';
                                        return (
                                            <motion.tr variants={itemVariants} key={`${chamado.id}-${index}`} className="border-b border-gray-200/80 hover:bg-zinc-50/50 transition-colors">
                                                <td className="px-4 py-4 font-mono text-sm text-gray-500">{chamado.numero_patrimonio || 'N/A'}</td>
                                                <td className="px-4 py-4 font-medium text-gray-800">{chamado.titulo}</td>
                                                <td className="px-4 py-4 text-gray-600">{chamado.tecnico ? chamado.tecnico.nome : 'Não atribuído'}</td>
                                                <td className="px-4 py-4"><StatusBadge status={chamado.status} /></td>
                                                <td className="px-4 py-4">
                                                    <div className="flex gap-2 justify-end">
                                                        {isActionable ? (
                                                            <>
                                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setEditingTicket({ ...chamado })} aria-label="Editar" className="p-2 cursor-pointer text-gray-400 hover:text-blue-600"><FiEdit size={18} /></motion.button>
                                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setTicketToCancel(chamado)} aria-label="Cancelar" className="p-2 cursor-pointer text-gray-400 hover:text-red-600"><FiX size={18} /></motion.button>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic pr-4">N/A</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        )
                                    }) : (
                                        <motion.tr><td colSpan="5" className="text-center py-12 text-gray-500"><FiInbox className="mx-auto text-3xl mb-2" />Nenhum chamado encontrado.</td></motion.tr>
                                    )}
                                </tbody>
                            </motion.table>
                        </div>

                        {totalPages > 1 && (
                            <Paginacao 
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </motion.div>
                );
        }
    }


    return (
        <div className="p-4 sm:p-6 lg:p-8 font-sans">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
                    <ReportCard 
                        title="Todos os Chamados"
                        count={counts.todos}
                        icon={<FiList size={24} />}
                        color="red"
                        isLoading={countsLoading}
                        onClick={() => {
                            setActiveTab('tabela');
                            setFiltroStatus(''); 
                            setCurrentPage(1);
                        }}
                        isActive={activeTab === 'tabela' && filtroStatus === ''}
                    />
                    <ReportCard 
                        title="Chamados Em Andamento"
                        count={counts.em_andamento}
                        icon={<FiLoader size={24} />}
                        color="yellow"
                        isLoading={countsLoading}
                        onClick={() => { 
                            setActiveTab('tabela');
                            setFiltroStatus('em andamento'); 
                            setCurrentPage(1);
                        }}
                        isClickable={true} 
                        isActive={activeTab === 'tabela' && filtroStatus === 'em andamento'}
                    />
                    <ReportCard 
                        title="Solicitações de Fechamento"
                        count={counts.solicitacao_fechamento}
                        icon={<FiCheckSquare size={24} />}
                        color="green"
                        isLoading={countsLoading}
                        onClick={() => {
                            setActiveTab('fechamentos');
                            setFiltroStatus('');
                        }}
                        isActive={activeTab === 'fechamentos'}
                    />
                </div>
                
                <motion.div key={activeTab} className="bg-white p-5 sm:p-8 rounded-2xl shadow-subtle border border-gray-200/80">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="min-h-[400px]"
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                <AnimatePresence>
                    {(editingTicket || ticketToCancel) && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                                {editingTicket && (
                                    <>
                                        <div className="p-6">
                                            <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-xl text-gray-800">Editar Chamado <span className="font-mono text-sm text-gray-500">#{editingTicket.id}</span></h3><button onClick={() => setEditingTicket(null)} className="text-gray-400 hover:text-gray-700 p-1 rounded-full"><FiX /></button></div>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-sm font-medium text-gray-600 mb-1 block">Técnico</label>
                                                    <select 
                                                        value={editingTicket.tecnico_id || ''} 
                                                        onChange={e => setEditingTicket({ ...editingTicket, tecnico_id: e.target.value })} 
                                                        className="w-full bg-zinc-100 border-2 border-transparent p-3 rounded-lg appearance-none focus:outline-none focus:bg-white focus:border-red-500"
                                                    >
                                                        <option value="">Não atribuído</option>
                                                        {tecnicosDisponiveisParaAtribuicao.map(t => (
                                                            <option key={t.id} value={t.id}>{t.nome}</option>
                                                        ))}
                                                        
                                                        {editingTicket.tecnico_id && tecnicosOcupadosIds.includes(editingTicket.tecnico_id) && (
                                                             <option key={editingTicket.tecnico_id} value={editingTicket.tecnico_id} className="bg-yellow-50 font-semibold text-yellow-800">
                                                                {editingTicket.tecnico.nome} (Atualmente Atribuído)
                                                             </option>
                                                        )}
                                                    </select>
                                                    {editingTicket.tecnico_id && tecnicosOcupadosIds.includes(editingTicket.tecnico_id) && (
                                                         <p className="text-xs text-yellow-600 mt-1">Este técnico já está em outro chamado em andamento.</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-600 mb-1 block">Status</label>
                                                    <select value={editingTicket.status} onChange={e => setEditingTicket({ ...editingTicket, status: e.target.value })} className="w-full bg-zinc-100 border-2 border-transparent p-3 rounded-lg appearance-none focus:outline-none focus:bg-white focus:border-red-500">
                                                        <option value="aberto">Aberto</option>
                                                        <option value="em andamento">Em Andamento</option>
                                                        <option value="concluido">Concluído</option>
                                                        <option value="cancelado">Cancelado</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                                            <motion.button type="button" onClick={() => setEditingTicket(null)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="cursor-pointer py-2 px-5 rounded-lg bg-gray-200 hover:bg-gray-300 font-semibold text-gray-800 transition">Voltar</motion.button>
                                            <motion.button onClick={handleSave} disabled={actionLoading} className="cursor-pointer py-2 px-5 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 flex justify-center items-center gap-2 disabled:bg-red-400" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>{actionLoading ? <Spinner /> : 'Salvar Alterações'}</motion.button>
                                        </div>
                                    </>
                                )}
                                {ticketToCancel && (
                                    <div className="p-6 text-center">
                                        <FiAlertTriangle className="mx-auto text-red-500 text-5xl mb-4" />
                                        <h3 className="font-bold text-xl mb-2 text-gray-800">Confirmar Cancelamento</h3>
                                        <p className="text-gray-600 mb-6">Tem certeza de que deseja cancelar o chamado "{ticketToCancel.titulo}"? Esta ação não pode ser desfeita.</p>
                                        <div className="flex gap-4 justify-center">
                                            <motion.button onClick={() => setTicketToCancel(null)} disabled={actionLoading} className="cursor-pointer py-2 px-6 rounded-lg bg-gray-200 hover:bg-gray-300 font-semibold text-gray-700" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Voltar</motion.button>
                                            <motion.button onClick={handleCancel} disabled={actionLoading} className="cursor-pointer py-2 px-6 rounded-lg text-white bg-red-600 hover:bg-red-700 font-semibold flex items-center justify-center gap-2 min-w-[120px]" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>{actionLoading ? <Spinner /> : 'Sim, Cancelar'}</motion.button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}