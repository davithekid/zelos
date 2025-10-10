'use client';
import { useState, useEffect, useCallback } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { FiBriefcase, FiUserCheck, FiServer } from 'react-icons/fi';
import api from '../../../lib/api'; // Certifique-se de que este caminho está correto

// Função auxiliar para capitalizar a primeira letra
const capitalize = (s = '') => {
  if (!s) return '';
  const str = s.replace(/_/g, ' ');
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ProfileInfo({ funcionario, getInitials }) {
  // Novo estado para a lista de TODOS os pools disponíveis
  const [allPools, setAllPools] = useState([]);
  // Novo estado para os pools atualmente associados ao técnico (lista de objetos PoolTecnico)
  const [associatedPools, setAssociatedPools] = useState([]);
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isTecnico = funcionario.funcao === 'tecnico';

  // 1. Função para buscar todos os pools e os pools associados ao técnico
  const fetchPoolsData = useCallback(async () => {
    if (!isTecnico) {
      setLoading(false);
      return;
    }


    try {
      const [allPoolsResponse, associatedPoolsResponse] = await Promise.all([
        api.get('/pools?status=ativo'),
        // CORREÇÃO AQUI: USANDO A NOVA ROTA /tecnico/
        api.get(`/pool-tecnico/tecnico/${funcionario.id}`)
      ]);

      // ...

      // allPools: Lista completa de Pools
      setAllPools(allPoolsResponse.data);

      // associatedPools: Lista de associações PoolTecnico. Precisamos do 'pool_id'.
      // A rota deve retornar a associação, onde o Pool está incluído.
      // Aqui assumimos que a resposta é um array de { id, id_pool, id_tecnico, pool: { id, titulo, ... } }
      setAssociatedPools(associatedPoolsResponse.data);

      setError(null);
    } catch (err) {
      console.error('Erro ao buscar pools:', err);
      // Se a API retornar 404 (nenhuma associação), setAssociatedPools será vazio, o que é ok.
      if (err.response && err.response.status !== 404) {
        setError("Erro ao carregar Pools.");
      }
      setAssociatedPools([]);
      setAllPools([]);
    } finally {
      setLoading(false);
    }
  }, [funcionario.id, isTecnico]);

  useEffect(() => {
    fetchPoolsData();
  }, [fetchPoolsData]);


  // 2. Função para adicionar/remover associação ao Pool
  // ... importações e estados ...

  // ... fetchPoolsData (já ajustado no passo anterior) ...

  // 2. Função para adicionar/remover associação ao Pool
  const handleTogglePool = async (poolId, isAssociated) => {
    setLoading(true);
    try {
      if (isAssociated) {
        // Remover associação (DELETE)
        // CORRIGIDO: O prefixo deve ser '/pool-tecnico'
        await api.delete('/pool-tecnico', { data: { id_pool: poolId, id_tecnico: funcionario.id } });
      } else {
        // Adicionar associação (POST)
        // CORRIGIDO: O prefixo deve ser '/pool-tecnico'
        await api.post('/pool-tecnico', { id_pool: poolId, id_tecnico: funcionario.id });
      }

      // Recarrega os dados após a operação
      await fetchPoolsData();

    } catch (error) {
      console.error(`Erro ao ${isAssociated ? 'remover' : 'adicionar'} Pool:`, error);
      alert(`Erro: ${error.response?.data?.message || 'Falha na atualização do Pool.'}`);
    } finally {
      setLoading(false);
    }
  };

  // ... restante do componente ...

  const handleCancelar = () => {
    setEditando(false);
    // Recarrega os dados originais em caso de cancelamento para descartar mudanças não salvas
    fetchPoolsData();
  };

  if (loading) return (
    <section className="max-w-md w-full mt-12 mb-20 p-8 bg-white rounded-2xl shadow-lg border border-gray-300 mx-auto text-center">
      <p className="text-lg text-gray-600">Carregando informações do técnico...</p>
    </section>
  );

  const associatedPoolIds = associatedPools.map(pt => pt.id_pool);
  const poolsAtivas = allPools.filter(pool => pool.status === 'ativo');

  return (
    <section className="max-w-md w-full mt-12 mb-20 p-8 bg-white rounded-2xl shadow-lg border border-gray-300 mx-auto text-center">
      <h2 className="text-3xl font-extrabold text-red-600 mb-8">Informações do Perfil</h2>

      {/* Avatar e Iniciais */}
      <div className="flex justify-center mb-8">
        <div className="w-32 h-32 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-4xl shadow-xl">
          {getInitials(funcionario.nome)}
        </div>
      </div>

      {/* Detalhes do Usuário */}
      <div className="space-y-4 text-gray-800 text-left">
        {/* Nome e Função (mantidos) */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="font-semibold text-gray-700">Nome:</span>
          <span className="font-medium">{funcionario.nome}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="font-semibold text-gray-700">Função:</span>
          <span className="font-medium flex items-center gap-1">
            {capitalize(funcionario.funcao)}
            {isTecnico ? <FiBriefcase className="text-blue-500" size={16} /> : <FiUserCheck className="text-green-500" size={16} />}
          </span>
        </div>

        {/* CAMPO DE POOLS TÉCNICAS */}
        {isTecnico && (
          <div className={`p-3 rounded-lg border-2 ${editando ? 'border-blue-500 bg-blue-50/50' : 'border-transparent bg-gray-50'}`}>
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-700 flex items-center gap-2">
                <FiServer className="w-5 h-5" /> Pools de Atuação:
              </span>

              {/* Botão de Edição/Ações */}
              {!editando ? (
                <button
                  onClick={() => setEditando(true)}
                  className="text-gray-500 hover:text-blue-600 p-1 rounded-full transition-colors"
                  aria-label="Editar Pools"
                  disabled={loading}
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
              ) : (
                <div className="flex gap-2">
                  {/* Botão Salvar removido, pois a alteração é instantânea ao clicar no checkbox */}
                  <button
                    onClick={() => setEditando(false)} // Apenas fecha
                    disabled={loading}
                    className="bg-gray-400 hover:bg-gray-500 text-white p-1.5 rounded-full transition-colors disabled:opacity-50"
                    aria-label="Concluir Edição"
                  >
                    <CheckIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            {/* Lista de Pools - Modo Visualização */}
            {!editando ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {associatedPools.length > 0 ? (
                  associatedPools.map(pt => (
                    <span key={pt.id} className="inline-flex items-center px-3 py-1 text-sm font-medium bg-red-100 text-red-800 rounded-full">
                      {capitalize(pt.pool.titulo)}
                    </span>
                  ))
                ) : (
                  <p className="font-medium text-gray-500 italic">Nenhum pool atribuído.</p>
                )}
              </div>
            ) : (
              // Lista de Pools - Modo Edição (Checkboxes)
              <div className="space-y-2 mt-2">
                {poolsAtivas.length > 0 ? (
                  poolsAtivas.map(pool => {
                    const isChecked = associatedPoolIds.includes(pool.id);
                    return (
                      <label key={pool.id} className="flex items-center justify-between p-2 bg-white rounded-md shadow-sm cursor-pointer hover:bg-gray-50">
                        <span className="font-medium text-gray-700">{capitalize(pool.titulo)}</span>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePool(pool.id, isChecked)}
                          className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          disabled={loading}
                        />
                      </label>
                    );
                  })
                ) : (
                  <p className="text-gray-500 italic">Não há pools ativos para associação.</p>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}