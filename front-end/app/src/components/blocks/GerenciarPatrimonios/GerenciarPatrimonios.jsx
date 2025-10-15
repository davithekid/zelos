'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { FiFilter, FiEdit, FiX, FiPlus, FiSearch, FiAlertTriangle, FiCheckCircle, FiChevronDown, FiInbox, FiSlash, FiLoader, FiChevronLeft, FiChevronRight, FiPackage, FiMonitor, FiMapPin, FiRefreshCw, FiTrash2} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '../../../app/lib/api'; 


const STATUS_OPTIONS = [ 
    { value: 'disponivel', label: 'Disponível' },
    { value: 'emManutencao', label: 'Em Manutenção' },
];

const getStatusDetails = (equipamento, index) => {
    const STATUS_MAP = {
        disponivel: { label: 'Disponível', color: 'green', icon: <FiCheckCircle size={12} />, statusKey: 'disponivel' },
        emManutencao: { label: 'Em Manutenção', color: 'yellow', icon: <FiLoader size={12} />, statusKey: 'emManutencao' },
        semLocalizacao: { label: 'Sem Localização', color: 'orange', icon: <FiMapPin size={12} />, statusKey: 'semLocalizacao' },
    };

    if (equipamento.status && STATUS_MAP[equipamento.status]) {
        return STATUS_MAP[equipamento.status];
    }
    
    if (!equipamento.sala || equipamento.sala.trim() === '') {
        return STATUS_MAP.semLocalizacao; 
    }

    const isMaintenance = index % 10 === 0; 
    if (isMaintenance) return STATUS_MAP.emManutencao;
    
    return STATUS_MAP.disponivel;
};


const capitalize = (s = '') => {
    if (!s) return '';
    const str = s.replace(/_/g, ' ');
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const Spinner = () => <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />;

const ReportCard = ({ title, count, icon, color, onClick, isActive, isLoading, isClickable = true }) => {
    const baseClasses = "flex flex-col p-5 rounded-xl shadow-lg transition-all duration-300 transform bg-white";
    
    let clickClasses = "";
    if (isClickable) {
        clickClasses = "cursor-pointer hover:scale-[1.02] active:scale-[0.98]";
    } else {
        clickClasses = "cursor-default";
    }

    const activeClasses = isActive 
        ? `border-2 border-red-500`
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
            <div className={`text-${color}-600 p-2 rounded-full bg-${color}-100/70 w-fit mb-3`}>
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
    const pages = useMemo(() => {
        const p = [];
        const maxVisiblePages = 5;
        
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            p.push(i);
        }
        return p;
    }, [currentPage, totalPages]);

    if (totalPages <= 1) return null;

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

                {pages[0] > 1 && (
                    <>
                        <button
                            onClick={() => onPageChange(1)}
                            className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            1
                        </button>
                        {pages[0] > 2 && <span className="px-2">...</span>}
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

                {pages[pages.length - 1] < totalPages && (
                    <>
                        {pages[pages.length - 1] < totalPages - 1 && <span className="px-2">...</span>}
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

function ConfirmationModal({ title, message, onConfirm, onCancel, isLoading }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-xl w-full max-w-sm text-center p-6 shadow-2xl">
                <FiAlertTriangle className="mx-auto text-red-500 text-5xl mb-4" />
                <h3 className="font-bold text-xl text-gray-800">{title}</h3>
                <p className="text-gray-600 my-4">{message}</p>
                <div className="flex gap-4 justify-center mt-6">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onCancel} className="py-2 px-6 rounded-lg bg-gray-200 hover:bg-gray-300 font-semibold text-gray-700">Cancelar</motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onConfirm} disabled={isLoading} className="py-2 px-6 rounded-lg text-white bg-red-600 hover:bg-red-700 font-semibold flex items-center justify-center gap-2 min-w-[120px]">
                        {isLoading ? <FiLoader className="animate-spin"/> : 'Confirmar'}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}

function PatrimonioModal({ equipamento, onClose, onSave, isLoading }) {
    const [patrimonio, setPatrimonio] = useState(equipamento?.patrimonio || '');
    const [sala, setSala] = useState(equipamento?.sala || '');
    const [nomeEquipamento, setNomeEquipamento] = useState(equipamento?.equipamento || '');
    const [status, setStatus] = useState(equipamento?.status || ''); 
    const isEditing = !!equipamento;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ patrimonio, sala, equipamento: nomeEquipamento, status }); 
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}>
                
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl text-gray-800">{isEditing ? 'Editar Equipamento' : 'Novo Equipamento'}</h3>
                            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-full transition-colors"><FiX /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-1 block">Patrimônio*</label>
                                <input type="text" value={patrimonio} onChange={(e) => setPatrimonio(e.target.value)}
                                    disabled={isEditing} required
                                    className="w-full bg-zinc-100 border-2 border-transparent p-3 rounded-lg focus:bg-white focus:border-red-500 transition-all outline-none disabled:bg-gray-200 disabled:cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-1 block">Nome do Equipamento</label>
                                <input type="text" value={nomeEquipamento} onChange={(e) => setNomeEquipamento(e.target.value)}
                                    placeholder="Ex: Computador Dell Optiplex"
                                    className="w-full bg-zinc-100 border-2 border-transparent p-3 rounded-lg focus:bg-white focus:border-red-500 transition-all outline-none" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600 mb-1 block">Sala / Localização</label>
                                <input type="text" value={sala} onChange={(e) => setSala(e.target.value)}
                                    placeholder="Ex: Sala 101, Laboratório 3"
                                    className="w-full bg-zinc-100 border-2 border-transparent p-3 rounded-lg focus:bg-white focus:border-red-500 transition-all outline-none" />
                            </div>
                            
                            {isEditing && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600 mb-1 block">Status</label>
                                    <div className="relative">
                                        <select 
                                            value={status} 
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-full appearance-none bg-zinc-100 border-2 border-transparent p-3 pr-10 rounded-lg focus:bg-white focus:border-red-500 transition-all outline-none text-gray-700 font-medium"
                                        >
                                            <option value="">(Manter Status Atual)</option>
                                            {STATUS_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">Isto define o status manual do equipamento. Se vazio, o status é derivado da localização ou simulação.</p>
                                </div>
                            )}

                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                        <motion.button type="button" onClick={onClose} className="py-2 px-5 cursor-pointer rounded-lg bg-gray-200 hover:bg-gray-300 font-semibold text-gray-800 transition" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>Cancelar</motion.button>
                        <motion.button type="submit" disabled={isLoading} className="py-2 px-5 rounded-lg cursor-pointer text-white bg-red-600 hover:bg-red-700 font-semibold disabled:bg-red-400 flex items-center gap-2 transition" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            {isLoading && <FiLoader className="animate-spin" />}
                            {isLoading ? 'Salvando...' : 'Salvar'}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}


export default function GerenciarPatrimonios() {
    const [equipamentos, setEquipamentos] = useState([]);
    const [pesquisa, setPesquisa] = useState('');
    const [pageLoading, setPageLoading] = useState(true);
    const [modal, setModal] = useState({ formOpen: false, deleteOpen: false });
    const [selectedEquipamento, setSelectedEquipamento] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [counts, setCounts] = useState({ todos: 0, emManutencao: 0, semLocalizacao: 0, disponivel: 0 }); 
    const [countsLoading, setCountsLoading] = useState(true);
    const [filtroStatus, setFiltroStatus] = useState(''); 
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); 
    
    const indexedEquipamentos = useMemo(() => {
        return equipamentos.map((eq, index) => {
            const details = getStatusDetails(eq, index);
            return {
                ...eq,
                _index: index, 
                _statusKey: details.statusKey, 
                _statusLabel: details.label,
                _statusColor: details.color,
                _statusIcon: details.icon,
            };
        });
    }, [equipamentos]);

    const calculateCounts = useCallback((data) => {
        const emManutencaoCount = data.filter(eq => eq._statusKey === 'emManutencao').length;
        const semLocalizacaoCount = data.filter(eq => eq._statusKey === 'semLocalizacao').length;
        const disponivelCount = data.filter(eq => eq._statusKey === 'disponivel').length;

        setCounts({
            todos: data.length,
            emManutencao: emManutencaoCount,
            semLocalizacao: semLocalizacaoCount,
            disponivel: disponivelCount,
        });
    }, []);

    const fetchData = async () => {
        setPageLoading(true);
        try {
            const response = await api.get('/equipamentos');
            setEquipamentos(response.data); 
            setCurrentPage(1); 
        } catch (error) {
            toast.error("Erro ao carregar equipamentos.");
        } finally {
            setPageLoading(false);
        }
    };
    
    useEffect(() => {
        calculateCounts(indexedEquipamentos);
        setCountsLoading(false);
    }, [indexedEquipamentos, calculateCounts]);


    const handleRefresh = () => {
        fetchData();
        toast.info("A atualizar dados...");
    }

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [pesquisa, filtroStatus]);

    const handleSave = async (data) => {
        setActionLoading(true);
        try {
            if (selectedEquipamento) {
                const dataToSend = { ...data };
                if (dataToSend.status === "") {
                    delete dataToSend.status;
                }
                
                await api.patch(`/equipamentos/${selectedEquipamento.patrimonio}`, dataToSend);
                toast.success("Equipamento atualizado com sucesso!");
            } else {
                await api.post('/equipamentos', data);
                toast.success("Equipamento criado com sucesso!");
            }
            setModal({ formOpen: false, deleteOpen: false });
            setSelectedEquipamento(null);
            await fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Ocorreu um erro.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedEquipamento) return;
        setActionLoading(true);
        try {
            await api.delete(`/equipamentos/${selectedEquipamento.patrimonio}`);
            toast.success("Equipamento excluído com sucesso!");
            setModal({ formOpen: false, deleteOpen: false });
            await fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || "Erro ao excluir.");
        } finally {
            setActionLoading(false);
        }
    };

    const openDeleteModal = (equipamento) => {
        setSelectedEquipamento(equipamento);
        setModal({ formOpen: false, deleteOpen: true });
    };

    const openFormModal = (equipamento = null) => {
        setSelectedEquipamento(equipamento);
        setModal({ deleteOpen: false, formOpen: true });
    };

    const filteredEquipamentos = useMemo(() => {
        const p = pesquisa.toLowerCase();
        
        return indexedEquipamentos.filter((eq) => {
            const matchesSearch = (eq.patrimonio || '').toLowerCase().includes(p) ||
                                 (eq.sala || '').toLowerCase().includes(p) ||
                                 (eq.equipamento || '').toLowerCase().includes(p);
            
            let matchesStatus = true;
            if (filtroStatus) {
                matchesStatus = eq._statusKey === filtroStatus;
            }

            return matchesSearch && matchesStatus;
        });
    }, [indexedEquipamentos, pesquisa, filtroStatus]);

    const totalPages = Math.ceil(filteredEquipamentos.length / itemsPerPage);
    const paginatedEquipamentos = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredEquipamentos.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredEquipamentos, currentPage, itemsPerPage]);

    if (pageLoading && countsLoading) return <div className="p-8 flex justify-center items-center h-[50vh]"><FiLoader className="text-4xl text-red-600 animate-spin"/></div>;

    return (
        <div className="p-4 sm:p-6 lg:p-8 font-sans">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-5 sm:p-8 rounded-2xl shadow-subtle max-w-7xl mx-auto border border-gray-200/80">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/80 pb-6 mb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-red-600 drop-shadow-md">Gerenciar Patrimônios</h1>
                        <p className="text-sm text-gray-600 mt-1">Adicione, edite ou remova equipamentos do sistema.</p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <motion.button onClick={handleRefresh} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 bg-gray-200 text-gray-700 font-semibold cursor-pointer py-2.5 px-4 rounded-lg shadow-sm hover:bg-gray-300 transition-all justify-center text-sm"
                            title="Atualizar Dados">
                            <FiRefreshCw size={16} />
                        </motion.button>
                        <motion.button onClick={() => openFormModal()} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 bg-red-600 text-white font-semibold cursor-pointer py-2.5 px-5 rounded-lg shadow-sm hover:bg-red-700 transition-all w-full sm:w-auto justify-center">
                            <FiPlus /> Novo Equipamento
                        </motion.button>
                    </div>
                </header>
                
                <motion.div layout className="flex flex-wrap gap-4 mb-8 justify-center lg:justify-start">
                    <ReportCard 
                        title="Patrimônios Totais"
                        count={counts.todos}
                        icon={<FiPackage size={24} />}
                        color="red"
                        isActive={filtroStatus === ''}
                        onClick={() => setFiltroStatus('')}
                        isLoading={countsLoading}
                    />
                    <ReportCard 
                        title="Disponível/Localizado"
                        count={counts.disponivel}
                        icon={<FiCheckCircle size={24} />}
                        color="green"
                        isActive={filtroStatus === 'disponivel'}
                        onClick={() => setFiltroStatus('disponivel')}
                        isLoading={countsLoading}
                    />
                    <ReportCard 
                        title="Em Manutenção"
                        count={counts.emManutencao}
                        icon={<FiLoader size={24} />}
                        color="yellow"
                        isActive={filtroStatus === 'emManutencao'}
                        onClick={() => setFiltroStatus('emManutencao')}
                        isLoading={countsLoading}
                    />
                    <ReportCard 
                        title="Sem Localização"
                        count={counts.semLocalizacao}
                        icon={<FiMapPin size={24} />}
                        color="orange"
                        isActive={filtroStatus === 'semLocalizacao'}
                        onClick={() => setFiltroStatus('semLocalizacao')}
                        isLoading={countsLoading}
                    />
                </motion.div>
                
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative group flex-grow">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600" />
                        <input type="text" placeholder="Buscar por patrimônio, sala ou nome do equipamento..." value={pesquisa}
                            onChange={(e) => setPesquisa(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-zinc-100 border-2 border-transparent rounded-lg focus:bg-white focus:border-red-500 transition-all outline-none"
                        />
                    </div>
                    
                    <div className="relative">
                        <select 
                            value={filtroStatus} 
                            onChange={(e) => setFiltroStatus(e.target.value)}
                            className="w-full md:w-auto appearance-none bg-zinc-100 border-2 border-transparent p-3 pr-10 rounded-lg focus:bg-white focus:border-red-500 transition-all outline-none text-gray-700 font-medium"
                        >
                            <option value="">Status (Todos)</option>
                            <option value="disponivel">Disponível/Localizado</option>
                            <option value="emManutencao">Em Manutenção</option>
                            <option value="semLocalizacao">Sem Localização (Sala Vazia)</option>
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                    </div>
                </div>
                <div>
                    <motion.table initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } }}}
                        className="w-full text-left text-sm table-auto hidden md:table">
                        <thead className="bg-gray-50 text-gray-600 uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Patrimônio</th>
                                <th className="px-4 py-3 font-semibold">Equipamento</th>
                                <th className="px-4 py-3 font-semibold">Sala/Local</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 font-semibold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {paginatedEquipamentos.map((eq) => {
                                    return (
                                        <motion.tr variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                                            key={eq.patrimonio} className="border-t hover:bg-zinc-50/50 transition-colors">
                                            <td className="px-4 py-4 font-mono font-semibold text-gray-700">{eq.patrimonio}</td>
                                            <td className="px-4 py-4 text-gray-800">{eq.equipamento || '-'}</td>
                                            <td className="px-4 py-4 text-gray-600">{eq.sala || <span className="text-orange-500 font-medium">Não Informada</span>}</td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${eq._statusColor}-100 text-${eq._statusColor}-800`}>
                                                    {eq._statusIcon} {eq._statusLabel}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openFormModal(eq)} className="p-2 cursor-pointer text-gray-500 hover:text-blue-600"><FiEdit /></motion.button>
                                                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openDeleteModal(eq)} className="p-2 cursor-pointer text-gray-500 hover:text-red-600"><FiTrash2 /></motion.button>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </motion.table>
                    
                    <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } }}}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                        
                        <AnimatePresence>
                            {paginatedEquipamentos.map((eq) => {
                                return (
                                    <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                                        key={eq.patrimonio} 
                                        className="bg-white border rounded-lg p-4 space-y-3 shadow-sm"
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold text-gray-800 font-mono pr-2">{eq.patrimonio}</span>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${eq._statusColor}-100 text-${eq._statusColor}-800`}>
                                                {eq._statusIcon} {eq._statusLabel}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500 border-t pt-3 space-y-1">
                                            <p><strong>Equipamento:</strong> {eq.equipamento || 'Não informado'}</p>
                                            <p><strong>Local:</strong> {eq.sala || <span className="text-orange-500 font-medium">Não Informada</span>}</p>
                                        </div>
                                        <div className="flex justify-end gap-2 border-t pt-3">
                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openFormModal(eq)} className="p-2 cursor-pointer text-gray-500 hover:text-blue-600"><FiEdit /></motion.button>
                                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => openDeleteModal(eq)} className="p-2 cursor-pointer text-gray-500 hover:text-red-600"><FiTrash2 /></motion.button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>

                    {filteredEquipamentos.length === 0 && (
                        <div className="text-center py-10">
                            <FiInbox className="text-6xl text-gray-300 mx-auto mb-4" />
                            <p className="text-lg text-gray-500 font-semibold">Nenhum equipamento encontrado.</p>
                            <p className="text-sm text-gray-400">Tente ajustar seus filtros ou pesquisa.</p>
                        </div>
                    )}
                </div>
                
                <Paginacao 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={setCurrentPage}
                />
            </motion.div>
            
            <AnimatePresence>
                {(modal.formOpen && (
                    <PatrimonioModal
                        equipamento={selectedEquipamento}
                        onClose={() => setModal({ formOpen: false, deleteOpen: false })}
                        onSave={handleSave}
                        isLoading={actionLoading}
                    />
                ))}
                {(modal.deleteOpen && selectedEquipamento && (
                    <ConfirmationModal
                        title="Confirmar Exclusão"
                        message={`Tem certeza que deseja excluir o equipamento de patrimônio ${selectedEquipamento.patrimonio}? Essa ação é irreversível.`}
                        onConfirm={handleDelete}
                        onCancel={() => setModal({ formOpen: false, deleteOpen: false })}
                        isLoading={actionLoading}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}