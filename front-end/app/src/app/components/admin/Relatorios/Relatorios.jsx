'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
    FiTrendingUp, FiCheckCircle, FiClock, FiUsers, FiPieChart, 
    FiTag, FiLoader, FiTool, FiAlertTriangle, FiPackage, FiDownload, FiPrinter
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'sonner'; 
import api from '../../../lib/api';

// #################################################################
// ############# FUNÇÕES E CONSTANTES AUXILIARES ###################
// #################################################################

const StatCard = ({ icon, title, value, color }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 rounded-2xl shadow-subtle border border-gray-200/80 flex items-center gap-5"
    >
        <div className={`p-4 rounded-full bg-${color}-100 text-${color}-600`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-semibold text-gray-500">{title}</p>
            <p className="text-3xl font-extrabold text-gray-800">{value}</p>
        </div>
    </motion.div>
);

const capitalize = (str = '') => {
    if (!str) return '';
    const s = str.replace(/_/g, ' ');
    return s.charAt(0).toUpperCase() + s.slice(1);
};

const PIE_COLORS_STATUS = {
    'aberto': '#C62828',
    'em andamento': '#F97316',
    'concluido': '#16A34A',
    'cancelado': '#64748B'
};

const PIE_COLORS_TIPO = ['#B91C1C', '#374151', '#9CA3AF', '#4B5563', '#F87171'];
const CHART_COLORS = {
    RED: '#C62828',
    BLUE: '#1E40AF',
    GREEN: '#16A34A',
    YELLOW: '#F59E0B',
    GRAY: '#64748B'
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
                <p className="font-bold text-gray-800">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color || p.fill }} className="text-sm">
                        {`${p.name}: ${p.dataKey.includes('minutos') ? Math.round(p.value) + ' min' : Math.round(p.value)}`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
        toast.warning("Nenhum dado para exportar.");
        return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.map(h => capitalize(h)).join(';'),
        ...data.map(row => headers.map(h => {
            const value = row[h] === null || row[h] === undefined ? '' : String(row[h]).replace(/"/g, '""');
            return `"${value}"`;
        }).join(';'))
    ].join('\n');

    const blob = new Blob(["\ufeff", csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Dados exportados para CSV!');
};

// #################################################################
// ############# NOVO COMPONENTE WRAPPER PARA GRÁFICOS #############
// #################################################################

const ChartWrapper = ({ title, icon, data, filename, children, dataToExport = data, onExportComplete }) => {
    const chartRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleExportPrint = useCallback(async () => {
        setIsExporting(true);
        const originalBody = document.body.innerHTML;
        const originalTitle = document.title;
        let success = false;

        try {
            const chartElement = chartRef.current;
            if (!chartElement) {
                toast.error("Elemento do gráfico não encontrado para exportação.");
                return;
            }

            document.body.innerHTML = '';

            const printContainer = document.createElement('div');
            printContainer.id = 'print-container';
            
            // Certifica que o gráfico clonado tem 100% de largura para impressão
            const clonedChart = chartElement.cloneNode(true);
            clonedChart.style.width = '100%';
            clonedChart.style.height = 'auto';

            printContainer.appendChild(clonedChart);
            document.body.appendChild(printContainer);
            
            document.title = title;
            
            const printButtons = document.body.querySelectorAll('.print-hide');
            printButtons.forEach(btn => btn.style.display = 'none');

            toast.info(`Preparando a impressão de: ${title}. Escolha 'Salvar como PDF' para exportar.`);
            await new Promise(resolve => {
                window.onafterprint = resolve;
                window.print();
            });

            success = true;

        } catch (error) {
            console.error("Erro ao exportar impressão:", error);
            toast.error("Falha na exportação de imagem. Tente novamente.");
        } finally {
            // Restaura o DOM original
            document.body.innerHTML = originalBody;
            document.title = originalTitle;
            
            setIsExporting(false);
            
            // Força a re-renderização do componente principal
            if (success && onExportComplete) {
                onExportComplete();
            }
            
            toast.success('Exportação para PDF concluída (via diálogo de impressão)!');
        }
    }, [title, onExportComplete]);

    const handleExportCSV = useCallback(() => {
        setIsExporting(true);
        exportToCSV(dataToExport, filename);
        setIsExporting(false);
    }, [dataToExport, filename]);

    return (
        <div className="bg-gray-50/50 p-6 rounded-xl shadow-inner border border-gray-100">
            <div className="flex justify-between items-start gap-3 mb-4 print-hide">
                <div className="flex items-center gap-3">
                    {icon}
                    <h2 className="font-bold text-lg text-gray-800">{title}</h2>
                </div>
                <div className="flex gap-2">
                    <motion.button
                        onClick={handleExportCSV}
                        disabled={isExporting || !dataToExport || dataToExport.length === 0}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-1 bg-green-600 text-white font-semibold py-1.5 px-3 rounded-md shadow-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-wait text-xs"
                    >
                        <FiDownload size={14} /> CSV
                    </motion.button>
                    <motion.button
                        onClick={handleExportPrint}
                        disabled={isExporting}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-1 bg-blue-600 text-white font-semibold py-1.5 px-3 rounded-md shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-wait text-xs"
                    >
                        <FiPrinter size={14} /> PDF
                    </motion.button>
                </div>
            </div>

            <div ref={chartRef} className="p-2">
                {children}
            </div>
        </div>
    );
};

// #################################################################
// ################# COMPONENTE PRINCIPAL (DASHBOARD) ##############
// #################################################################

export default function DashboardPage() {
    const [statusData, setStatusData] = useState([]);
    const [tipoData, setTipoData] = useState([]);
    const [tecnicoData, setTecnicoData] = useState([]);
    const [chamadosEspera, setChamadosEspera] = useState([]);
    const [eficienciaApontamento, setEficienciaApontamento] = useState([]);
    const [usoPatrimonio, setUsoPatrimonio] = useState([]);
    const [renderKey, setRenderKey] = useState(0); 

    const [generalStats, setGeneralStats] = useState({ 
        totalChamados: 0, 
        chamadosConcluidos: 0, 
        tempoMedioGeral: 0,
        totalEmEspera: 0
    });
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const forceRender = useCallback(() => {
        setRenderKey(prev => prev + 1);
    }, []);

    const consolidatedData = useMemo(() => {
        return []; 
    }, []);

    const fetchAllReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const results = await Promise.allSettled([
                api.get('/relatorios?tipo=status'),
                api.get('/relatorios?tipo=tipo'),
                api.get('/relatorios?tipo=tecnico'),
                api.get('/relatorios?tipo=espera'),
                api.get('/relatorios?tipo=eficienciaTecnico'),
                api.get('/relatorios?tipo=usoPatrimonio')
            ]);

            const errors = results.filter(r => r.status === 'rejected');
            if (errors.length > 0) {
                const firstError = errors[0].reason;
                const message = firstError.response?.data?.message || firstError.message;
                throw new Error(`Falha ao buscar relatórios: ${message}`);
            }

            const [statusRes, tipoRes, tecnicoRes, esperaRes, eficienciaRes, patrimonioRes] = results.map(r => r.value.data);

            setStatusData(statusRes);
            setTipoData(tipoRes);
            setTecnicoData(tecnicoRes);
            setChamadosEspera(esperaRes);
            setEficienciaApontamento(eficienciaRes);
            setUsoPatrimonio(patrimonioRes);

            const totalChamados = statusRes.reduce((sum, item) => sum + item.total, 0);
            const chamadosConcluidos = statusRes.find(item => item.status === 'concluido')?.total || 0;
            
            const validTemposMedios = tecnicoRes.filter(item => item.tempo_medio_resolucao_minutos != null)
                                                 .map(item => parseFloat(item.tempo_medio_resolucao_minutos));
            
            const tempoMedioGeral = validTemposMedios.length > 0 
                ? Math.round(validTemposMedios.reduce((sum, avg) => sum + avg, 0) / validTemposMedios.length) 
                : 0;

            const totalEmEspera = esperaRes.length;

            setGeneralStats({ totalChamados, chamadosConcluidos, tempoMedioGeral, totalEmEspera });

        } catch (err) {
            console.error("Erro detalhado ao buscar relatórios:", err);
            setError(err.message || "Falha ao carregar os dados dos relatórios.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllReports();
    }, [fetchAllReports]);

    if (loading) return <div className="flex justify-center items-center h-[50vh]"><FiLoader className="animate-spin text-4xl text-red-600"/></div>;
    if (error) return <div className="text-center p-10 font-semibold text-red-600 bg-red-50 rounded-lg max-w-7xl mx-auto">{error}</div>;

    return (
        <div key={renderKey} className="p-4 sm:p-6 lg:p-8 font-sans">
            <style jsx global>{`
                @media print {
                    .print-hide, .dashboard-container > *:not(#print-container) {
                        display: none !important;
                    }
                    body, html {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: none !important;
                        overflow: hidden; /* Remove scrollbars na impressão */
                    }
                    body > #print-container {
                        display: block !important;
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: auto;
                        padding: 20px; /* Margem interna para o gráfico */
                        box-sizing: border-box;
                    }
                    body > #print-container > div {
                        width: 100% !important;
                        height: auto !important;
                        max-height: 90vh;
                        padding: 0;
                        margin: 0;
                    }
                    /* Força o ResponsiveContainer dentro do Recharts a ocupar a largura total */
                    .recharts-responsive-container {
                        width: 100% !important;
                        min-width: 500px; /* Garante tamanho mínimo para melhor visualização */
                        height: 400px !important;
                    }
                }
            `}</style>

            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="bg-white p-5 sm:p-8 rounded-2xl shadow-lg max-w-7xl mx-auto border border-gray-200/80 dashboard-container"
            >
                
                <header className="border-b border-gray-200/80 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center print-hide">
                    <div>
                        <h1 className="text-3xl font-extrabold text-red-600 drop-shadow-sm">Dashboard de Análise Operacional</h1>
                        <p className="text-sm text-gray-600 mt-1">Visão geral dos chamados, performance da equipe e utilização de recursos.</p>
                    </div>
                </header>

                <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 print-hide">
                        <StatCard icon={<FiTrendingUp size={24} />} title="Total de Chamados" value={generalStats.totalChamados} color="red" />
                        <StatCard icon={<FiCheckCircle size={24} />} title="Chamados Concluídos" value={generalStats.chamadosConcluidos} color="green" />
                        <StatCard icon={<FiClock size={24} />} title="Tempo Médio Resolução (min)" value={generalStats.tempoMedioGeral} color="yellow" />
                        <StatCard icon={<FiAlertTriangle size={24} />} title="Chamados em Espera (Sem Técnico)" value={generalStats.totalEmEspera} color="orange" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ChartWrapper 
                            title="Distribuição por Status" 
                            icon={<FiPieChart className="text-red-600" size={20} />}
                            filename="distribuicao_status"
                            data={statusData}
                            onExportComplete={forceRender}
                        >
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie 
                                        data={statusData} 
                                        dataKey="total" 
                                        nameKey="status" 
                                        cx="50%" 
                                        cy="50%" 
                                        outerRadius={100} 
                                        fill="#8884d8"
                                        labelLine={false} 
                                        label={({ name, percent }) => `${capitalize(name)}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {statusData.map((entry) => <Cell key={`cell-status-${entry.status}`} fill={PIE_COLORS_STATUS[entry.status.toLowerCase()] || CHART_COLORS.GRAY} />)}
                                    </Pie>
                                    <Tooltip formatter={(value, name) => [value, capitalize(name)]} />
                                    <Legend iconType="circle" formatter={capitalize} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartWrapper>
                        
                        <ChartWrapper 
                            title="Distribuição por Pool/Tipo" 
                            icon={<FiTag className="text-red-600" size={20} />}
                            filename="distribuicao_tipo"
                            data={tipoData}
                            onExportComplete={forceRender}
                        >
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie 
                                        data={tipoData} 
                                        dataKey="total" 
                                        nameKey="tipo_chamado" 
                                        cx="50%" 
                                        cy="50%" 
                                        innerRadius={60} 
                                        outerRadius={100} 
                                        paddingAngle={3}
                                    >
                                        {tipoData.map((entry, index) => <Cell key={`cell-tipo-${index}`} fill={PIE_COLORS_TIPO[index % PIE_COLORS_TIPO.length]} stroke={CHART_COLORS.RED}/>)}
                                    </Pie>
                                    <Tooltip formatter={(value, name) => [value, capitalize(name)]} />
                                    <Legend iconType="square" formatter={capitalize} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartWrapper>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ChartWrapper
                            title="Eficiência de Apontamentos (Tempo Médio por Ação)"
                            icon={<FiTool className="text-red-600" size={20} />}
                            filename="eficiencia_apontamentos"
                            data={eficienciaApontamento}
                            onExportComplete={forceRender}
                        >
                            <div style={{ width: '100%', height: 350 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={eficienciaApontamento} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="tecnico_nome" fontSize={12} tick={{ fill: CHART_COLORS.GRAY }} />
                                        <YAxis orientation="left" stroke={CHART_COLORS.BLUE} domain={[0, 'auto']} tickFormatter={(value) => `${value} min`} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(30, 64, 175, 0.05)' }}/>
                                        <Legend />
                                        <Area 
                                            type="monotone" 
                                            dataKey="duracao_media_apontamento_minutos" 
                                            name="Duração Média (min)" 
                                            stroke={CHART_COLORS.BLUE} 
                                            fill={CHART_COLORS.BLUE} 
                                            fillOpacity={0.4}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </ChartWrapper>

                        <ChartWrapper
                            title="Patrimônios Mais Problemáticos (Uso em Chamados)"
                            icon={<FiPackage className="text-red-600" size={20} />}
                            filename="uso_patrimonio"
                            data={usoPatrimonio}
                            onExportComplete={forceRender}
                        >
                            <div className="h-[350px] overflow-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="sticky top-0 bg-white shadow-sm border-b text-gray-500">
                                        <tr>
                                            <th className="py-2 font-semibold">Patrimônio</th>
                                            <th className="py-2 font-semibold">Equipamento</th>
                                            <th className="py-2 text-center font-semibold">Total de Chamados</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usoPatrimonio.sort((a, b) => b.total_chamados_registrados - a.total_chamados_registrados).map((item, index) => (
                                            <tr key={item.patrimonio} className={`border-b last:border-none ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                                <td className="py-3 font-mono text-xs text-gray-600">{item.patrimonio}</td>
                                                <td className="py-3 font-semibold text-gray-700">{item.equipamento}</td>
                                                <td className="py-3 text-center font-extrabold text-red-600">{item.total_chamados_registrados}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {usoPatrimonio.length === 0 && (
                                    <div className="text-center py-10 text-gray-500">Nenhum patrimônio registrado em chamados.</div>
                                )}
                            </div>
                        </ChartWrapper>
                    </div>

                    <ChartWrapper
                        title="Performance Geral dos Técnicos"
                        icon={<FiUsers className="text-red-600" size={20} />}
                        filename="performance_tecnicos"
                        data={tecnicoData}
                        onExportComplete={forceRender}
                    >
                        <div className="md:hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b text-gray-500">
                                    <tr>
                                        <th className="py-2 font-semibold">Técnico</th>
                                        <th className="py-2 text-center font-semibold">Chamados</th>
                                        <th className="py-2 text-center font-semibold">T. Médio (min)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tecnicoData.map(tecnico => (
                                        <tr key={tecnico.tecnico_nome} className="border-b last:border-none">
                                            <td className="py-3 font-semibold text-gray-700">{tecnico.tecnico_nome}</td>
                                            <td className="py-3 text-center font-mono">{tecnico.total_chamados}</td>
                                            <td className="py-3 text-center font-mono">{Math.round(tecnico.tempo_medio_resolucao_minutos || 0)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="hidden md:block" style={{ width: '100%', height: 350 }}>
                            <ResponsiveContainer>
                                <BarChart data={tecnicoData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="tecnico_nome" fontSize={12} tick={{ fill: CHART_COLORS.GRAY }} />
                                    <YAxis yAxisId="chamados" orientation="left" stroke={CHART_COLORS.RED} label={{ value: 'Total de Chamados', angle: -90, position: 'insideLeft', offset: -5, fill: CHART_COLORS.RED, fontSize: 12 }} />
                                    <YAxis yAxisId="tempo" orientation="right" stroke={CHART_COLORS.GRAY} label={{ value: 'Tempo Médio (min)', angle: 90, position: 'insideRight', offset: 5, fill: CHART_COLORS.GRAY, fontSize: 12 }} tickFormatter={(value) => `${value}m`} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(185, 28, 28, 0.05)' }}/>
                                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                    <Bar yAxisId="chamados" dataKey="total_chamados" name="Total de Chamados" fill={CHART_COLORS.RED} radius={[4, 4, 0, 0]} />
                                    <Bar yAxisId="tempo" dataKey="tempo_medio_resolucao_minutos" name="Tempo Médio (min)" fill={CHART_COLORS.GRAY} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartWrapper>
                </div>
            </motion.div>
            <span className="hidden bg-red-100 text-red-600 bg-yellow-100 text-yellow-600 bg-green-100 text-green-600 bg-orange-100 text-orange-600"></span>
        </div>
    );
}