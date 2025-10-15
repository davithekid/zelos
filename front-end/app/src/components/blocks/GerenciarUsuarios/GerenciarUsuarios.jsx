'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { FiFilter, FiEdit, FiX, FiPlus, FiSearch, FiCheckCircle, FiChevronDown, FiInbox, FiLoader, FiChevronLeft, FiChevronRight, FiUser, FiUserCheck, FiUserX, FiBriefcase, FiRefreshCw, FiInfo, FiServer } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '../../../app/lib/api';

const capitalize = (s = '') => {
    if (!s) return '';
    const str = s.replace(/_/g, ' ');
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const colorMap = {
    green: { bg: 'bg-green-100', text: 'text-green-800' },
    red: { bg: 'bg-red-100', text: 'text-red-800' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-800' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-800' },
    gray: { bg: 'bg-gray-100', text: 'text-gray-800' },
};

const StatusBadge = ({ status }) => {
    const statusLabel = capitalize(status);
    const config = {
        'Ativo': { icon: <FiUserCheck />, color: 'green' },
        'Inativo': { icon: <FiUserX />, color: 'red' },
    };
    const { icon, color } = config[statusLabel] || { icon: <FiUser />, color: 'gray' };
    const { bg, text } = colorMap[color] || colorMap.gray;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
            {icon} {statusLabel}
        </span>
    );
};

const FuncaoBadge = ({ funcao }) => {
    const funcaoLabel = capitalize(funcao);
    const config = {
        'Admin': { color: 'purple' },
        'Tecnico': { color: 'blue' },
        'Usuario': { color: 'green' },
    };
    const { color } = config[funcaoLabel] || { color: 'gray' };
    const { bg, text } = colorMap[color] || colorMap.gray;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
            {funcaoLabel}
        </span>
    );
};

const PoolBadge = ({ poolTitle }) => {
    const poolLabel = capitalize(poolTitle);
    const { bg, text } = colorMap.blue;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
            <FiServer size={12} /> {poolLabel}
        </span>
    );
};


const Spinner = () => <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />;


const ManageTechnicianPoolsModal = ({ user, onClose, onUpdateTechnicianPools, actionLoading, setActionLoading }) => {
    const [allPools, setAllPools] = useState([]);
    const [associatedPools, setAssociatedPools] = useState([]);
    const [poolsLoading, setPoolsLoading] = useState(true);
    const isTechnician = user?.funcao === 'tecnico';

    const fetchPoolsData = useCallback(async () => {
        if (!isTechnician) return;

        setPoolsLoading(true);
        try {
            const [allPoolsResponse, associatedPoolsResponse] = await Promise.all([
                api.get('/pools?status=ativo'),
                api.get(`/pool-tecnico/tecnico/${user.id}`)
            ]);

            setAllPools(allPoolsResponse.data);
            setAssociatedPools(associatedPoolsResponse.data);

        } catch (err) {
            console.error('Erro ao buscar pools:', err);
            toast.error("Falha ao carregar a lista de pools.");
            setAssociatedPools([]);
            setAllPools([]);
        } finally {
            setPoolsLoading(false);
        }
    }, [user.id, isTechnician]);

    useEffect(() => {
        fetchPoolsData();
    }, [fetchPoolsData]);

    const associatedPoolIds = useMemo(() => associatedPools.map(pt => pt.id_pool), [associatedPools]);

    const handleTogglePool = async (poolId, isAssociated) => {
        setActionLoading(true);
        try {
            if (isAssociated) {
                await api.delete('/pool-tecnico', { data: { id_pool: poolId, id_tecnico: user.id } });
                toast.success(`Pool removido do técnico.`);
            } else {
                await api.post('/pool-tecnico', { id_pool: poolId, id_tecnico: user.id });
                toast.success(`Pool adicionado ao técnico.`);
            }
            
            await fetchPoolsData(); 
            
            const updatedPoolsResponse = await api.get(`/pool-tecnico/tecnico/${user.id}`);
            onUpdateTechnicianPools(user.id, updatedPoolsResponse.data);

        } catch (error) {
            console.error(`Erro ao ${isAssociated ? 'remover' : 'adicionar'} Pool:`, error);
            toast.error(error.response?.data?.message || `Falha na atualização do Pool.`);
        } finally {
            setActionLoading(false);
        }
    };

    if (!user || !isTechnician) return null;

    return (
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="font-bold text-xl text-blue-600 flex items-center gap-2">
                        <FiServer size={20} /> Gerenciar Pools de {user.nome}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-full">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Selecione os Pools Técnicos que o usuário **{user.username}** pode atuar.</p>
                    
                    {poolsLoading ? (
                        <div className="flex justify-center items-center h-20"><FiLoader className="animate-spin text-2xl text-red-600" /></div>
                    ) : (
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                            {allPools.length > 0 ? (
                                allPools.map(pool => {
                                    const isChecked = associatedPoolIds.includes(pool.id);
                                    return (
                                        <label key={pool.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200">
                                            <span className="font-medium text-gray-800">{capitalize(pool.titulo)}</span>
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handleTogglePool(pool.id, isChecked)}
                                                className="w-5 h-5 text-red-600 bg-white border-gray-300 rounded focus:ring-red-500"
                                                disabled={actionLoading}
                                            />
                                        </label>
                                    );
                                })
                            ) : (
                                <div className="text-center p-4 bg-yellow-50 rounded-lg text-yellow-800">Nenhum Pool Ativo encontrado.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <motion.button 
                    type="button" 
                    onClick={onClose} 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                    disabled={actionLoading}
                >
                    Fechar
                </motion.button>
            </div>
        </motion.div>
    );
};


const TechnicianInfoModal = ({ user, pools, onClose }) => {
    if (!user) return null;

    const data = [
        { label: 'Nome', value: user.nome },
        { label: 'Username', value: user.username },
        { label: 'Email', value: user.email },
        { label: 'Função', value: <FuncaoBadge funcao={user.funcao} /> },
        { label: 'Status', value: <StatusBadge status={user.status} /> },
        { 
            label: 'Pools de Atuação', 
            value: pools && pools.length > 0 
                ? pools.map(pt => <PoolBadge key={pt.id} poolTitle={pt.pool.titulo} />)
                : <span className='text-gray-500 italic text-sm'>Nenhuma pool atribuída.</span>,
            isPools: true
        },
    ];

    return (
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="font-bold text-xl text-blue-600 flex items-center gap-2">
                        <FiBriefcase size={20} /> Detalhes do Técnico
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-full">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    {data.map((item, index) => (
                        <div key={index} className="flex flex-col text-left">
                            <span className="text-sm font-medium text-gray-500">{item.label}</span>
                            <div className={`text-gray-800 font-semibold mt-0.5 ${item.isPools ? 'flex flex-wrap gap-2' : ''}`}>{item.value}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <motion.button 
                    type="button" 
                    onClick={onClose} 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                    Fechar
                </motion.button>
            </div>
        </motion.div>
    );
};


const EditUserModal = ({ editingUser, setEditingUser, handleSave, actionLoading }) => {
    const handleClose = () => setEditingUser(null);
    const isTechnician = editingUser?.funcao === 'tecnico';

    if (!editingUser) return null;

    return (
        <AnimatePresence>
            {editingUser && (
                <motion.div
                    className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                >
                    <motion.div
                        className="bg-white rounded-xl w-full max-w-lg shadow-2xl"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6 border-b pb-4">
                                <h3 className="font-bold text-xl text-blue-600 flex items-center gap-2">
                                    <FiEdit size={20} /> Editar Função: {editingUser.nome}
                                </h3>
                                <button onClick={handleClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-full">
                                    <FiX size={20} />
                                </button>
                            </div>

                            <form className="space-y-4">
                                <div>
                                    <label htmlFor="funcao" className="block text-sm font-medium text-gray-700 mb-1">Função</label>
                                    <div className="relative">
                                        <FiChevronDown className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        <select
                                            id="funcao"
                                            value={editingUser.funcao}
                                            onChange={(e) => setEditingUser({ ...editingUser, funcao: e.target.value, especialidade: null })} 
                                            className="appearance-none w-full border border-gray-300 rounded-lg py-2 px-3 pr-10 text-gray-700 focus:ring-red-500 focus:border-red-500 transition-all"
                                            disabled={actionLoading}
                                        >
                                            <option value="usuario">Usuário</option>
                                            <option value="tecnico">Técnico</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    {isTechnician && <p className="text-xs text-gray-400 mt-1 italic">Para gerenciar as Pools de Atuação, use o ícone <FiServer size={12} className="inline-block" /> na tabela.</p>}
                                </div>
                            </form>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                            <motion.button 
                                type="button" 
                                onClick={handleClose} 
                                whileHover={{ scale: 1.05 }} 
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                                disabled={actionLoading}
                            >
                                Cancelar
                            </motion.button>
                            <motion.button 
                                type="button" 
                                onClick={handleSave} 
                                whileHover={{ scale: 1.05 }} 
                                whileTap={{ scale: 0.95 }}
                                className={`px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2 ${actionLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                disabled={actionLoading}
                            >
                                {actionLoading ? <Spinner /> : <FiCheckCircle size={18} />}
                                {actionLoading ? 'Salvando...' : 'Salvar Alterações'}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


const StatusToggleModal = ({ userToToggle, setUserToToggle, handleToggleStatus, actionLoading }) => {
    if (!userToToggle) return null;

    const currentStatus = userToToggle.status;
    const isActivating = currentStatus === 'inativo';
    const actionText = isActivating ? 'Ativar' : 'Inativar';
    const icon = isActivating ? <FiUserCheck size={24} className="text-green-600" /> : <FiUserX size={24} className="text-red-600" />;
    const confirmButtonClass = isActivating 
        ? 'bg-green-600 hover:bg-green-700' 
        : 'bg-red-600 hover:bg-red-700';

    const handleClose = () => setUserToToggle(null);

    return (
        <AnimatePresence>
            {userToToggle && (
                <motion.div
                    className="fixed backdrop-blur-sm inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                >
                    <motion.div
                        className="bg-white rounded-xl w-full max-w-sm shadow-2xl"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 text-center">
                            <div className="flex justify-center mb-4">
                                {icon}
                            </div>
                            <h3 className="font-bold text-xl text-gray-800 mb-2">
                                Confirmação de {actionText}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Tem certeza que deseja **{actionText.toLowerCase()}** o usuário **{userToToggle.nome}**?
                            </p>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                            <motion.button 
                                type="button" 
                                onClick={handleClose} 
                                whileHover={{ scale: 1.05 }} 
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                                disabled={actionLoading}
                            >
                                Cancelar
                            </motion.button>
                            <motion.button 
                                type="button" 
                                onClick={handleToggleStatus} 
                                whileHover={{ scale: 1.05 }} 
                                whileTap={{ scale: 0.95 }}
                                className={`px-4 py-2 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 ${confirmButtonClass} ${actionLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                disabled={actionLoading}
                            >
                                {actionLoading ? <Spinner /> : <FiCheckCircle size={18} />}
                                {actionLoading ? 'Processando...' : actionText}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


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

    const { bg: iconBg, text: iconText } = colorMap[color] || colorMap.gray;

    return (
        <motion.div 
            layout 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className={`${baseClasses} ${clickClasses} ${activeClasses} min-w-[200px]`}
            onClick={handleClick}
        >
            <div className={`${iconText} p-2 rounded-full ${iconBg}/70 w-fit mb-3`}>
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


export default function GerenciarUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [technicianPoolsMap, setTechnicianPoolsMap] = useState({}); 
    const [chamadosEmAndamento, setChamadosEmAndamento] = useState([]); 
    
    const [counts, setCounts] = useState({
        todos: 0, ativos: 0, tecnicos: 0, admins: 0,
    });
    
    const [countsLoading, setCountsLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [userToToggle, setUserToToggle] = useState(null);
    const [viewingUser, setViewingUser] = useState(null); 
    const [managingPoolsUser, setManagingPoolsUser] = useState(null); 
    
    const [filtroStatus, setFiltroStatus] = useState('');
    const [filtroFuncao, setFiltroFuncao] = useState('');
    const [pesquisa, setPesquisa] = useState('');
    const [pageLoading, setPageLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const fetchAllData = useCallback(async () => {
        setPageLoading(true);
        setCountsLoading(true);

        try {
            const [usuariosRes, chamadosRes, allPoolsRes] = await Promise.all([
                 api.get('/usuarios'),
                 api.get('/chamados'), 
                 api.get('/pool-tecnico'), 
            ]);

            const todosUsuarios = usuariosRes.data || [];
            const todosChamados = chamadosRes.data || [];
            const allPoolTecnico = allPoolsRes.data || [];

            const chamadosAtivos = todosChamados.filter(c => c.status === 'em andamento');
            setChamadosEmAndamento(chamadosAtivos);

            const poolsMap = allPoolTecnico.reduce((acc, item) => {
                if (!acc[item.id_tecnico]) {
                    acc[item.id_tecnico] = [];
                }
                acc[item.id_tecnico].push(item);
                return acc;
            }, {});
            setTechnicianPoolsMap(poolsMap);


            const ativosCount = todosUsuarios.filter(u => u.status === 'ativo').length;
            const tecnicosCount = todosUsuarios.filter(u => u.funcao === 'tecnico').length;
            const adminsCount = todosUsuarios.filter(u => u.funcao === 'admin').length;

            setUsuarios(todosUsuarios);
            setCounts({
                todos: todosUsuarios.length,
                ativos: ativosCount,
                tecnicos: tecnicosCount,
                admins: adminsCount,
            });
        } catch (error) {
            toast.error("Erro ao carregar todos os dados.");
            console.error("Erro ao buscar dados:", error);
            setUsuarios([]);
            setCounts({ todos: 0, ativos: 0, tecnicos: 0, admins: 0 });
        } finally {
            setPageLoading(false);
            setCountsLoading(false);
        }
    }, []);

    const handleRefresh = () => {
        fetchAllData();
        toast.info("A atualizar dados...");
    }

    const handleUpdateTechnicianPools = useCallback((technicianId, newPoolsList) => {
        setTechnicianPoolsMap(prevMap => ({
            ...prevMap,
            [technicianId]: newPoolsList,
        }));

        setManagingPoolsUser(prevUser => {
            if (prevUser && prevUser.id === technicianId) {
                return { ...prevUser }; 
            }
            return prevUser;
        });

        if (viewingUser && viewingUser.id === technicianId) {
            setViewingUser(prevUser => {
                 if (prevUser && prevUser.id === technicianId) {
                    return { ...prevUser };
                }
                return prevUser;
            });
        }
    }, [viewingUser]);


    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    useEffect(() => {
        setCurrentPage(1);
    }, [filtroStatus, filtroFuncao, pesquisa]);

    const handleSave = async () => {
        if (!editingUser) return;
        
        const payload = {
            funcao: editingUser.funcao,
            especialidade: null 
        };

        setActionLoading(true);
        try {
            await api.patch(`/usuarios/${editingUser.id}`, payload);
            
            await fetchAllData();
            setEditingUser(null);
            toast.success('Função do usuário atualizada com sucesso!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Falha ao atualizar a função.');
            console.error('Falha na atualização:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!userToToggle) return;
        
        const isOccupied = userToToggle.funcao === 'tecnico' && userToToggle.status === 'ativo' && chamadosEmAndamento.some(c => c.tecnico_id === userToToggle.id);
        
        if (userToToggle.status === 'ativo' && isOccupied) {
            toast.error(`Não é possível inativar o técnico ${userToToggle.nome} pois ele possui um chamado em andamento.`);
            setUserToToggle(null);
            return;
        }

        setActionLoading(true);
        try {
            const novoStatus = userToToggle.status === 'ativo' ? 'inativo' : 'ativo';
            await api.patch(`/usuarios/${userToToggle.id}/status`, { status: novoStatus });
            await fetchAllData();
            setUserToToggle(null);
            toast.success(`Usuário ${novoStatus === 'ativo' ? 'ativado' : 'inativado'} com sucesso!`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Falha ao alterar status do usuário.');
            console.error('Falha ao alterar status:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleViewTechnician = (usuario) => {
        if (usuario.funcao === 'tecnico') {
            setViewingUser(usuario);
        } else {
            toast.info(`Detalhes avançados apenas para técnicos. Para editar, use o ícone de edição.`);
        }
    };

    const filteredUsers = useMemo(() => {
        return usuarios.filter(u => {
            const matchesSearch = u.nome.toLowerCase().includes(pesquisa.toLowerCase()) || 
                                 u.email.toLowerCase().includes(pesquisa.toLowerCase()) ||
                                 u.username.toLowerCase().includes(pesquisa.toLowerCase());
            const matchesStatus = filtroStatus === '' || u.status === filtroStatus;
            const matchesFuncao = filtroFuncao === '' || u.funcao === filtroFuncao;
            
            return matchesSearch && matchesStatus && matchesFuncao;
        });
    }, [usuarios, pesquisa, filtroStatus, filtroFuncao]);

    const totalItems = filteredUsers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredUsers.slice(startIndex, endIndex);

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
    const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

    if (pageLoading) {
        return <div className="flex justify-center items-center h-[50vh]"><FiLoader className="animate-spin text-4xl text-red-600" /></div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 font-sans">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <ReportCard 
                        title="Todos os Usuários"
                        count={counts.todos}
                        icon={<FiUser size={24} />}
                        color="red"
                        isLoading={countsLoading}
                        onClick={() => {
                            setFiltroStatus(''); setFiltroFuncao(''); setCurrentPage(1);
                        }}
                        isActive={filtroStatus === '' && filtroFuncao === ''}
                    />
                    <ReportCard 
                        title="Usuários Ativos"
                        count={counts.ativos}
                        icon={<FiUserCheck size={24} />}
                        color="green"
                        isLoading={countsLoading}
                        onClick={() => { 
                            setFiltroStatus('ativo'); setFiltroFuncao(''); setCurrentPage(1);
                        }}
                        isActive={filtroStatus === 'ativo' && filtroFuncao === ''}
                    />
                    <ReportCard 
                        title="Técnicos"
                        count={counts.tecnicos}
                        icon={<FiBriefcase size={24} />}
                        color="blue"
                        isLoading={countsLoading}
                        onClick={() => {
                            setFiltroFuncao('tecnico'); setFiltroStatus(''); setCurrentPage(1);
                        }}
                        isActive={filtroFuncao === 'tecnico' && filtroStatus === ''}
                    />
                    <ReportCard 
                        title="Administradores"
                        count={counts.admins}
                        icon={<FiUserCheck size={24} />}
                        color="purple"
                        isLoading={countsLoading}
                        onClick={() => {
                            setFiltroFuncao('admin'); setFiltroStatus(''); setCurrentPage(1);
                        }}
                        isActive={filtroFuncao === 'admin' && filtroStatus === ''}
                    />
                </div>
                
                <motion.div className="bg-white p-5 sm:p-8 rounded-2xl shadow-subtle border border-gray-200/80">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="min-h-[400px]"
                    >
                        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/80 pb-6 mb-6">
                            <div>
                                <h1 className="text-3xl font-extrabold text-red-600 drop-shadow-md">Gerenciamento de Usuários</h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    {totalItems} usuário{totalItems !== 1 ? 's' : ''} encontrado{totalItems !== 1 ? 's' : ''}
                                    {filtroStatus && ` • Filtrado por status: ${capitalize(filtroStatus)}`}
                                    {filtroFuncao && ` • Filtrado por função: ${capitalize(filtroFuncao)}`}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                                <motion.button 
                                    onClick={handleRefresh}
                                    whileHover={{ scale: 1.05 }} 
                                    whileTap={{ scale: 0.95 }}
                                    className="p-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                                >
                                    <FiRefreshCw size={18} />
                                    Atualizar
                                </motion.button>
                            
                                <motion.button 
                                    onClick={() => toast.info('Funcionalidade de Novo Usuário pendente')}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <FiPlus size={18} />
                                    Novo Usuário
                                </motion.button>
                            </div>
                        </header>

                        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                            <div className="relative w-full md:flex-1 group">
                                <FiSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 group-focus-within:text-red-600 transition-colors" />
                                <input type="text" placeholder="Pesquisar por nome, email ou username..." className="bg-zinc-100 border-2 border-transparent p-3 pl-12 rounded-lg w-full focus:bg-white focus:border-red-500 transition-all outline-none" value={pesquisa} onChange={e => setPesquisa(e.target.value)} />
                            </div>
                            <div className="relative w-full md:w-auto group">
                                <FiFilter className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <FiChevronDown className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <select className="bg-zinc-100 border-2 border-transparent font-medium text-gray-700 p-3 pl-12 rounded-lg w-full md:w-40 appearance-none focus:bg-white focus:border-red-500 transition-all outline-none" value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
                                    <option value="">Status (Todos)</option>
                                    <option value="ativo">Ativo</option>
                                    <option value="inativo">Inativo</option>
                                </select>
                            </div>
                            <div className="relative w-full md:w-auto group">
                                <FiBriefcase className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <FiChevronDown className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <select className="bg-zinc-100 border-2 border-transparent font-medium text-gray-700 p-3 pl-12 rounded-lg w-full md:w-48 appearance-none focus:bg-white focus:border-red-500 transition-all outline-none" value={filtroFuncao} onChange={e => setFiltroFuncao(e.target.value)}>
                                    <option value="">Função (Todas)</option>
                                    <option value="usuario">Usuário</option>
                                    <option value="tecnico">Técnico</option>
                                    <option value="admin">Admin</option>
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
                                    <option value={5}>5 / pág</option>
                                    <option value={10}>10 / pág</option>
                                    <option value={20}>20 / pág</option>
                                    <option value={50}>50 / pág</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <motion.table variants={containerVariants} initial="hidden" animate="show" className="w-full text-left table-auto">
                                <thead className="bg-gray-50/70 text-gray-600 text-xs uppercase">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Nome</th>
                                        <th className="px-4 py-3 font-semibold">Username</th>
                                        <th className="px-4 py-3 font-semibold">Email</th>
                                        <th className="px-4 py-3 font-semibold">Função</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.length > 0 ? currentItems.map((user, index) => {
                                        const isTechnician = user.funcao === 'tecnico';
                                        return (
                                            <motion.tr variants={itemVariants} key={`${user.id}-${index}`} className="border-b border-gray-200/80 hover:bg-zinc-50/50 transition-colors">
                                                <td className="px-4 py-4 font-medium text-gray-800">{user.nome}</td>
                                                <td className="px-4 py-4 text-gray-600">{user.username}</td>
                                                <td className="px-4 py-4 text-gray-600">{user.email}</td>
                                                <td className="px-4 py-4"><FuncaoBadge funcao={user.funcao} /></td>
                                                <td className="px-4 py-4"><StatusBadge status={user.status} /></td>
                                                <td className="px-4 py-4">
                                                    <div className="flex gap-2 justify-end">
                                                        {isTechnician && (
                                                            <>
                                                                <motion.button 
                                                                    whileHover={{ scale: 1.1 }} 
                                                                    whileTap={{ scale: 0.9 }} 
                                                                    onClick={() => setManagingPoolsUser(user)} 
                                                                    aria-label="Gerenciar Pools" 
                                                                    title="Gerenciar Pools de Atuação"
                                                                    className="p-2 cursor-pointer text-gray-400 hover:text-red-600"
                                                                >
                                                                    <FiServer size={18} />
                                                                </motion.button>
                                                                
                                                                <motion.button 
                                                                    whileHover={{ scale: 1.1 }} 
                                                                    whileTap={{ scale: 0.9 }} 
                                                                    onClick={() => handleViewTechnician(user)} 
                                                                    aria-label="Ver detalhes do técnico" 
                                                                    title="Ver detalhes do técnico"
                                                                    className="p-2 cursor-pointer text-gray-400 hover:text-blue-600"
                                                                >
                                                                    <FiInfo size={18} />
                                                                </motion.button>
                                                            </>
                                                        )}
                                                        <motion.button 
                                                            whileHover={{ scale: 1.1 }} 
                                                            whileTap={{ scale: 0.9 }} 
                                                            onClick={() => setEditingUser({ ...user })} 
                                                            aria-label="Editar" 
                                                            title="Editar função"
                                                            className="p-2 cursor-pointer text-gray-400 hover:text-red-600"
                                                        >
                                                            <FiEdit size={18} />
                                                        </motion.button>
                                                        <motion.button 
                                                            whileHover={{ scale: 1.1 }} 
                                                            whileTap={{ scale: 0.9 }} 
                                                            onClick={() => setUserToToggle(user)} 
                                                            aria-label={user.status === 'ativo' ? 'Inativar' : 'Ativar'} 
                                                            title={user.status === 'ativo' ? 'Inativar usuário' : 'Ativar usuário'}
                                                            className={`p-2 cursor-pointer ${user.status === 'ativo' ? 'text-green-500 hover:text-green-700' : 'text-red-500 hover:text-red-700'}`}
                                                        >
                                                            {user.status === 'ativo' ? <FiUserX size={18} /> : <FiUserCheck size={18} />}
                                                        </motion.button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        )
                                    }) : (
                                        <motion.tr><td colSpan="6" className="text-center py-12 text-gray-500"><FiInbox className="mx-auto text-3xl mb-2" />Nenhum usuário encontrado.</td></motion.tr>
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
                </motion.div>

                <AnimatePresence>
                    {viewingUser && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0  backdrop-blur-sm flex justify-center items-center z-50 p-4">
                            <TechnicianInfoModal 
                                user={viewingUser} 
                                pools={technicianPoolsMap[viewingUser.id]}
                                onClose={() => setViewingUser(null)} 
                            />
                        </motion.div>
                    )}

                    {managingPoolsUser && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                            <ManageTechnicianPoolsModal 
                                user={managingPoolsUser}
                                onClose={() => setManagingPoolsUser(null)}
                                onUpdateTechnicianPools={handleUpdateTechnicianPools}
                                actionLoading={actionLoading}
                                setActionLoading={setActionLoading}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <EditUserModal 
                    editingUser={editingUser}
                    setEditingUser={setEditingUser}
                    handleSave={handleSave}
                    actionLoading={actionLoading}
                />

                <StatusToggleModal 
                    userToToggle={userToToggle}
                    setUserToToggle={setUserToToggle}
                    handleToggleStatus={handleToggleStatus}
                    actionLoading={actionLoading}
                />

            </motion.div>
        </div>
    );
}