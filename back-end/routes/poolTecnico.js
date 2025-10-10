import express from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import Autorizar from "../middlewares/Autorizar.js";
import PoolTecnicoController from '../controllers/PoolTecnicoController.js'; 

const router = express.Router();
const autorizar = new Autorizar();

const permitir = (perfisPermitidos) => (req, res, next) => {
    return autorizar.autorizacao(req.user, perfisPermitidos)(req, res, next);
}

// -------------------------------------------------------------
// ROTA CORRIGIDA PARA O FRONTEND (LISTA DE ESPECIALIDADES/POOLS)
// -------------------------------------------------------------
router.get('/pools-disponiveis',
    AuthMiddleware.verifyToken,
    // Garante que apenas usuários autenticados (Admin ou Técnico) possam obter a lista
    permitir(['admin', 'tecnico']), 
    // Este método buscará os títulos da tabela 'Pool'
    PoolTecnicoController.listarPoolsDisponiveis 
);
// -------------------------------------------------------------

router.get('/',
    AuthMiddleware.verifyToken,
    permitir(['admin', 'tecnico']),
    PoolTecnicoController.listarTodos
);

router.get('/pool/:id_pool',
    AuthMiddleware.verifyToken,
    permitir(['admin', 'tecnico', 'usuario']),
    PoolTecnicoController.listarPorPool
);

// NOVA ROTA: Listar pools de um técnico específico
router.get('/tecnico/:id_tecnico',
    AuthMiddleware.verifyToken,
    permitir(['admin', 'tecnico']), // Apenas admin e o próprio técnico podem ver
    PoolTecnicoController.listarPorTecnico
);

router.post('/',
    AuthMiddleware.verifyToken,
    permitir(['admin', 'tecnico']), // Permite que o técnico se associe
    PoolTecnicoController.associarTecnico
);

router.delete('/',
    AuthMiddleware.verifyToken,
    permitir(['admin', 'tecnico']), // Permite que o técnico remova sua associação
    PoolTecnicoController.removerAssociacao
);

export default router;