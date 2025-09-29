'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiInbox, FiUsers, FiTrendingUp, FiCheckCircle,
    FiChevronDown, FiCornerUpRight, FiLoader,
    FiChevronLeft, FiChevronRight, FiSearch,
    FiChevronUp, FiList
} from 'react-icons/fi';
import api from '../../../lib/api';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 15; 
const DEBOUNCE_DELAY = 300;
const MAX_CHAMADOS_VISIVEIS = 3;

const StatCard = ({ icon, label, value, loading = false }) => (
    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-5">
        <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-3 rounded-lg">
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500">{label}</p>
            {loading ? (
                <div className="h-7 w-12 bg-slate-200 rounded animate-pulse"></div>
            ) : (
                <p className="text-2xl font-bold text-slate-800">{value}</p>
            )}
        </div>
    </div>
);

const ChamadoPendenteCard = ({ chamado, tecnicos, onAtribuir, loading }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
        className="bg-white p-5 rounded-lg shadow-sm border border-slate-200/80 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
    >
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate" title={chamado.titulo}>
                    {chamado.titulo}
                </p>
                {chamado.numero_patrimonio && (
                    <p className="text-sm text-slate-500 mt-1">
                        Patrimônio: {chamado.numero_patrimonio}
                    </p>
                )}
            </div>
            <div className="relative w-full sm:w-52 flex-shrink-0">
                <select
                    onChange={(e) => onAtribuir(chamado.id, e.target.value)}
                    disabled={loading}
                    className="appearance-none w-full bg-slate-50 border border-slate-300/70 p-2.5 rounded-md text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    defaultValue=""
                >
                    <option value="" disabled>Atribuir a um técnico...</option>
                    {tecnicos.map(t => (
                        <option key={t.id} value={t.id}>{t.nome}</option>
                    ))}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
        </div>
    </motion.div>
);

const ChamadoItem = ({ chamado, onDesatribuir, loading }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-slate-100 p-2.5 rounded-md text-sm group"
    >
        <div className="flex justify-between items-center">
            <p className="text-slate-700 truncate flex-1" title={chamado.titulo}>
                {chamado.titulo}
            </p>
            <button
                onClick={() => onDesatribuir(chamado.id)}
                className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ml-2"
                title="Desatribuir"
                disabled={loading}
            >
                <FiCornerUpRight />
            </button>
        </div>
        {chamado.numero_patrimonio && (
            <p className="text-xs text-slate-500 mt-1 truncate">
                Patrimônio: {chamado.numero_patrimonio}
            </p>
        )}
    </motion.div>
);

const TecnicoCard = ({ tecnico, chamados, onDesatribuir, loading }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const getInitials = (name = "") => {
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const chamadosVisiveis = isExpanded ? chamados : chamados.slice(0, MAX_CHAMADOS_VISIVEIS);
    const temChamadosOcultos = chamados.length > MAX_CHAMADOS_VISIVEIS;

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {getInitials(tecnico.nome)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 truncate">{tecnico.nome}</h3>
                        <p className="text-sm text-slate-500">
                            {loading ? (
                                <span className="inline-block h-4 w-20 bg-slate-200 rounded animate-pulse"></span>
                            ) : (
                                `${chamados.length} chamado(s) atribuído(s)`
                            )}
                        </p>
                    </div>
                </div>

                {chamados.length > 0 && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-1 text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0 ml-2 p-1 rounded hover:bg-slate-100"
                        title={isExpanded ? "Recolher" : "Expandir"}
                    >
                        {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                )}
            </div>

            <div className="space-y-2">
                {loading ? (
                    [...Array(2)].map((_, index) => (
                        <div key={index} className="bg-slate-100 p-2.5 rounded-md animate-pulse">
                            <div className="h-4 bg-slate-200 rounded"></div>
                        </div>
                    ))
                ) : chamados.length > 0 ? (
                    <AnimatePresence>
                        {chamadosVisiveis.map(chamado => (
                            <ChamadoItem
                                key={chamado.id}
                                chamado={chamado}
                                onDesatribuir={onDesatribuir}
                                loading={loading}
                            />
                        ))}

                        {temChamadosOcultos && !isExpanded && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center"
                            >
                                <button
                                    onClick={() => setIsExpanded(true)}
                                    className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center justify-center gap-1 w-full py-2 hover:bg-slate-50 rounded-md transition-colors"
                                >
                                    <FiList className="text-sm" />
                                    Ver mais {chamados.length - MAX_CHAMADOS_VISIVEIS} chamado(s)
                                </button>
                            </motion.div>
                        )}

                        {isExpanded && temChamadosOcultos && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center"
                            >
                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className="text-xs text-slate-500 hover:text-slate-700 font-medium flex items-center justify-center gap-1 w-full py-2 hover:bg-slate-50 rounded-md transition-colors"
                                >
                                    <FiChevronUp className="text-sm" />
                                    Mostrar menos
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                ) : (
                    <div className="text-center py-3 text-slate-400">
                        <FiInbox className="mx-auto text-lg mb-1" />
                        <p className="text-xs">Nenhum chamado atribuído</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const Pagination = ({ currentPage, totalPages, onPageChange, className = '' }) => {
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
        <div className={`flex items-center justify-between ${className}`}>
            <div className="text-sm text-slate-500">
                Página {currentPage} de {totalPages}
            </div>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    <FiChevronLeft />
                </button>

                {startPage > 1 && (
                    <>
                        <button
                            onClick={() => onPageChange(1)}
                            className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition text-sm"
                        >
                            1
                        </button>
                        {startPage > 2 && <span className="px-1">...</span>}
                    </>
                )}

                {pages.map(page => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-3 py-2 rounded-lg border transition text-sm ${
                            currentPage === page
                                ? 'bg-red-600 text-white border-red-600'
                                : 'border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                        {page}
                    </button>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="px-1">...</span>}
                        <button
                            onClick={() => onPageChange(totalPages)}
                            className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 transition text-sm"
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    <FiChevronRight />
                </button>
            </div>
        </div>
    );
};

const LoadingSkeleton = () => (
    <div className="space-y-4">
        {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white p-5 rounded-lg shadow-sm border border-slate-200/80 animate-pulse">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex-1 space-y-2">
                        <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    </div>
                    <div className="w-full sm:w-52 h-10 bg-slate-200 rounded"></div>
                </div>
            </div>
        ))}
    </div>
);

const TecnicoCardSkeleton = () => (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm animate-pulse">
        <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-200"></div>
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
        </div>
        <div className="space-y-2">
            {[...Array(2)].map((_, index) => (
                <div key={index} className="bg-slate-100 p-2.5 rounded-md">
                    <div className="h-4 bg-slate-200 rounded"></div>
                </div>
            ))}
        </div>
    </div>
);

export default function PainelAtribuicaoAdmin() {
    const [tecnicos, setTecnicos] = useState([]);
    const [chamados, setChamados] = useState([]); 
    const [pageLoading, setPageLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPagination(prev => ({ ...prev, currentPage: 1 })); 
        }, DEBOUNCE_DELAY);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchData = useCallback(async (page = 1, search = '') => {
        if (!chamados.length && page === 1 && !search) { // Ajuste para só mostrar no carregamento inicial ou busca vazia
            setPageLoading(true);
        }

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: ITEMS_PER_PAGE.toString(),
                ...(search && { search }) 
            });

            const [chamadosRes, tecnicosRes] = await Promise.all([
                api.get(`/chamados?${params}`),
                api.get('/usuarios/tecnicos')
            ]);
            const responseData = chamadosRes.data.data || chamadosRes.data;
            const mappedChamados = Array.isArray(responseData)
                ? responseData.map(c => ({
                    id: c.id,
                    titulo: c.titulo,
                    tecnico: c.tecnico ? c.tecnico.nome : null,
                    status: c.status,
                    numero_patrimonio: c.numero_patrimonio
                }))
                : [];

            setChamados(mappedChamados);
            setTecnicos(tecnicosRes.data);

            if (chamadosRes.data.pagination) {
                setPagination(chamadosRes.data.pagination);
            } else {
                const totalItems = Array.isArray(chamadosRes.data) ? chamadosRes.data.length : 0;
                const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
                setPagination({
                    currentPage: page,
                    totalPages: totalPages === 0 ? 1 : totalPages, 
                    totalItems
                });
                console.warn("Backend não forneceu objeto de paginação. Calculando no frontend. Considere ajustar o backend.");
            }
        } catch (error) {
            console.error("Erro ao buscar dados:", error);
            toast.error("Erro ao carregar dados. Tente novamente.");
            setChamados([]); 
        } finally {
            setPageLoading(false);
        }
    }, [chamados.length]); 

    useEffect(() => {
        fetchData(pagination.currentPage, debouncedSearch);
    }, [pagination.currentPage, debouncedSearch, fetchData]);

    const handleAtribuir = async (chamadoId, tecnicoId) => {
        if (!tecnicoId) return;

        setActionLoading(chamadoId);
        try {
            await api.patch(`/chamados/${chamadoId}/atribuir`, { tecnico_id: tecnicoId });
            setChamados(prev => prev.filter(c => c.id !== chamadoId));

            const tecnicoNome = tecnicos.find(t => t.id === tecnicoId)?.nome;
            toast.success(`Atribuído a ${tecnicoNome || 'um técnico'}!`);
            await fetchData(pagination.currentPage, debouncedSearch);
        } catch (error) {
            console.error("Erro ao atribuir chamado:", error.response?.data || error);
            toast.error("Falha ao atribuir chamado.");
            await fetchData(pagination.currentPage, debouncedSearch);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDesatribuir = async (chamadoId) => {
        setActionLoading(chamadoId);
        try {
            await api.patch(`/chamados/${chamadoId}/atribuir`, { tecnico_id: null });
            setChamados(prev => prev.map(c =>
                c.id === chamadoId ? { ...c, tecnico: null } : c
            ));

            toast.success('Chamado retornado para a fila.');
            await fetchData(pagination.currentPage, debouncedSearch); 
        } catch (error) {
            console.error("Erro ao desatribuir chamado:", error);
            toast.error("Falha ao desatribuir chamado.");
            await fetchData(pagination.currentPage, debouncedSearch); 
        } finally {
            setActionLoading(null);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, currentPage: newPage }));
        }
    };
    const { pendentes, chamadosAtribuiveis } = useMemo(() => {
        const pendentes = chamados.filter(c => !c.tecnico && c.status === 'aberto');
        const atribuidosAtivos = chamados.filter(c => c.tecnico && (c.status === 'aberto' || c.status === 'em andamento'));
        return { pendentes, chamadosAtribuiveis: atribuidosAtivos };
    }, [chamados]); 

    const filteredPendentes = useMemo(() => {
        if (!debouncedSearch) return pendentes;

        return pendentes.filter(chamado =>
            chamado.titulo.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            (chamado.numero_patrimonio && chamado.numero_patrimonio.toLowerCase().includes(debouncedSearch.toLowerCase()))
        );
    }, [pendentes, debouncedSearch]);
    if (pageLoading && !chamados.length) {
        return (
            <div className="flex flex-col justify-center items-center h-screen text-slate-500">
                <FiLoader className="animate-spin text-4xl mb-4" />
                <p className="text-lg">Carregando painel de atribuição...</p>
            </div>
        );
    }

    return (
        <div className="font-sans p-4 sm:p-6 lg:p-8 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-4xl font-black text-red-600 tracking-tight">Painel de Atribuição</h1>
                            <p className="text-lg text-slate-500 mt-1">Atribua rapidamente os chamados pendentes para a sua equipe.</p>
                        </div>

                        <div className="relative max-w-md w-full">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por título ou patrimônio..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <StatCard
                            icon={<FiTrendingUp className="text-sky-600"/>}
                            label="Total de Chamados Ativos"
                            value={pagination.totalItems} 
                            loading={pageLoading}
                        />
                        <StatCard
                            icon={<FiInbox className="text-red-600"/>}
                            label="Pendentes na Fila"
                            value={pendentes.length}
                            loading={pageLoading}
                        />
                        <StatCard
                            icon={<FiUsers className="text-green-600"/>}
                            label="Em Atendimento"
                            value={chamadosAtribuiveis.length}
                            loading={pageLoading}
                        />
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <main className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Fila de Espera</h2>
                                                     {filteredPendentes.length > 0 && (
                                <span className="text-sm text-slate-500">
                                    {filteredPendentes.length} chamado(s) encontrado(s)
                                </span>
                            )}
                        </div>

                        {pageLoading ? (
                            <LoadingSkeleton />
                        ) : (
                            <>
                                <AnimatePresence mode="popLayout">
                                    {filteredPendentes.length > 0 ? (
                                        filteredPendentes.map(chamado => (
                                            <ChamadoPendenteCard
                                                key={chamado.id}
                                                chamado={chamado}
                                                tecnicos={tecnicos}
                                                onAtribuir={handleAtribuir}
                                                loading={actionLoading === chamado.id}
                                            />
                                        ))
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center text-slate-500 py-16 bg-white rounded-lg border-2 border-dashed"
                                        >
                                            <FiCheckCircle className="mx-auto text-4xl text-green-500 mb-2" />
                                            <p className="font-semibold">
                                                {debouncedSearch ? 'Nenhum chamado encontrado' : 'Fila de chamados vazia. Bom trabalho!'}
                                            </p>
                                            {debouncedSearch && (
                                                <p className="text-sm mt-1">Tente ajustar os termos da busca</p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {pagination.totalPages > 1 && (
                                    <Pagination
                                        currentPage={pagination.currentPage}
                                        totalPages={pagination.totalPages}
                                        onPageChange={handlePageChange}
                                        className="mt-6"
                                    />
                                )}
                            </>
                        )}
                    </main>

                    <aside className="space-y-6 lg:sticky lg:top-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">Equipe Técnica</h2>
                            <span className="text-sm text-slate-500">
                                {tecnicos.length} técnico(s)
                            </span>
                        </div>

                        {pageLoading ? (
                            [...Array(3)].map((_, index) => (
                                <TecnicoCardSkeleton key={index} />
                            ))
                        ) : (
                            tecnicos.map(tecnico => (
                                <TecnicoCard
                                    key={tecnico.id}
                                    tecnico={tecnico}
                                    chamados={chamadosAtribuiveis.filter(c => c.tecnico === tecnico.nome)}
                                    onDesatribuir={handleDesatribuir}
                                    loading={actionLoading !== null}
                                />
                            ))
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
}