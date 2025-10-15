'use client';
import { useState, useEffect, useCallback } from 'react';
import { PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { FiBriefcase, FiUserCheck, FiServer } from 'react-icons/fi';
import api from '../../../app/lib/api';

const capitalize = (s = '') => {
  if (!s) return '';
  const str = s.replace(/_/g, ' ');
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function ProfileInfo({ funcionario, getInitials }) {
  const [allPools, setAllPools] = useState([]);
  const [associatedPools, setAssociatedPools] = useState([]);
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isTecnico = funcionario.funcao === 'tecnico';

  const fetchPoolsData = useCallback(async () => {
    if (!isTecnico) {
      setLoading(false);
      return;
    }


    try {
      const [allPoolsResponse, associatedPoolsResponse] = await Promise.all([
        api.get('/pools?status=ativo'),
        api.get(`/pool-tecnico/tecnico/${funcionario.id}`)
      ]);

      setAllPools(allPoolsResponse.data);
      setAssociatedPools(associatedPoolsResponse.data);

      setError(null);
    } catch (err) {
      console.error('Erro ao buscar pools:', err);
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

  const handleTogglePool = async (poolId, isAssociated) => {
    setLoading(true);
    try {
      if (isAssociated) {
        await api.delete('/pool-tecnico', { data: { id_pool: poolId, id_tecnico: funcionario.id } });
      } else {
        await api.post('/pool-tecnico', { id_pool: poolId, id_tecnico: funcionario.id });
      }

      await fetchPoolsData();

    } catch (error) {
      console.error(`Erro ao ${isAssociated ? 'remover' : 'adicionar'} Pool:`, error);
      alert(`Erro: ${error.response?.data?.message || 'Falha na atualização do Pool.'}`);
    } finally {
      setLoading(false);
    }
  };
  const handleCancelar = () => {
    setEditando(false);
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
      <div className="flex justify-center mb-8">
        <div className="w-32 h-32 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-4xl shadow-xl">
          {getInitials(funcionario.nome)}
        </div>
      </div>
      <div className="space-y-4 text-gray-800 text-left">
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

        {isTecnico && (
          <div className={`p-3 rounded-lg border-2 ${editando ? 'border-blue-500 bg-blue-50/50' : 'border-transparent bg-gray-50'}`}>
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-700 flex items-center gap-2">
                <FiServer className="w-5 h-5" /> Pools de Atuação:
              </span>

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
                  <button
                    onClick={() => setEditando(false)} 
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