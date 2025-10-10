import ChamadoController from "../controllers/ChamadoController.js";
import Autorizar from "../middlewares/Autorizar.js";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import upload from '../middlewares/upload.js';
import express from "express";

const router = express.Router();
const autorizar = new Autorizar();

const permitir = (perfisPermitidos) => (req, res, next) => {
    return autorizar.autorizacao(req.user, perfisPermitidos)(req, res, next);
}

router.get('/pool-tecnico',
    AuthMiddleware.verifyToken,
    permitir(['tecnico', 'admin']),
    ChamadoController.listarChamadosParaTecnico
);

router.get('/meu-historico',
    AuthMiddleware.verifyToken,
    permitir(['tecnico']),
    ChamadoController.listarHistoricoTecnico
);

router.get('/',
    AuthMiddleware.verifyToken,
    permitir(['admin', 'tecnico', 'usuario']),
    ChamadoController.listar
);

router.get('/:id',
    AuthMiddleware.verifyToken,
    permitir(['usuario', 'admin', 'tecnico']),
    ChamadoController.buscarPorId
);

router.get('/:id/apontamentos',
    AuthMiddleware.verifyToken,
    permitir(['admin', 'tecnico', 'usuario']),
    ChamadoController.listarApontamentos
);

router.post('/',
    AuthMiddleware.verifyToken,
    permitir(['usuario', 'admin', 'tecnico']),
    upload.single('imagem'),
    ChamadoController.criar
);

router.patch('/:id/atribuir',
    AuthMiddleware.verifyToken,
    permitir(['admin', 'tecnico']),
    ChamadoController.atribuir
);

router.patch('/:id/status',
    AuthMiddleware.verifyToken,
    permitir(['admin', 'tecnico']),
    ChamadoController.status
);

router.patch('/:id',
    AuthMiddleware.verifyToken,
    permitir(['admin', 'tecnico']),
    ChamadoController.atualizar
);


router.patch('/:id/fechar',
    AuthMiddleware.verifyToken,
    permitir(['admin']),
    ChamadoController.fechar
);


export default router;