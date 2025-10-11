import express from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import Autorizar from "../middlewares/Autorizar.js";
import PoolTecnicoController from '../controllers/PoolTecnicoController.js'; 

const router = express.Router();
const autorizar = new Autorizar();

const permitir = (perfisPermitidos) => (req, res, next) => {
    return autorizar.autorizacao(req.user, perfisPermitidos)(req, res, next);
}
router.get('/pools-disponiveis',
    AuthMiddleware.verifyToken,
    permitir(['admin', 'tecnico']), 
    PoolTecnicoController.listarPoolsDisponiveis 
);

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

router.get('/tecnico/:id_tecnico',
    AuthMiddleware.verifyToken,
    permitir(['admin', 'tecnico']), 
    PoolTecnicoController.listarPorTecnico
);

router.post('/',
    AuthMiddleware.verifyToken,
    permitir(['admin', 'tecnico']),
    PoolTecnicoController.associarTecnico
);

router.delete('/',
    AuthMiddleware.verifyToken,
    permitir(['admin', 'tecnico']), 
    PoolTecnicoController.removerAssociacao
);

export default router;