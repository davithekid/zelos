'use client';
import { FaClipboardList, FaBook } from 'react-icons/fa';

export default function PainelAcoes({ setActiveTab }) {
  return (
    <div className="flex flex-col sm:flex-row justify-center gap-8 mb-20">
      <button
        onClick={() => setActiveTab('abertos')}
        className="bg-red-600 text-white px-10 py-4 rounded-xl shadow-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center gap-3 cursor-pointer"
      >
        Chamados abertos <FaClipboardList size={20} />
      </button>

      <button
        onClick={() => setActiveTab('atribuidos')}
        className="border-2 border-red-600 text-red-600 px-10 py-4 rounded-xl shadow-md hover:bg-red-600 hover:text-white transition-colors font-semibold flex items-center justify-center gap-3 cursor-pointer"
      >
        Meus chamados atribuídos <FaBook size={20} />
      </button>
    </div>
  );
}
