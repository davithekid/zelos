import express from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware.js";
import Autorizar from "../middlewares/Autorizar.js";
import PedidoChamadoController from "../controllers/PedidoChamadoController.js";

const router = express.Router();
const autorizar = new Autorizar();

const permitir = (perfisPermitidos) => (req, res, next) => {
    return autorizar.autorizacao(req.user, perfisPermitidos)(req, res, next);
}


router.post('/',
    AuthMiddleware.verifyToken,
    permitir(['tecnico']),
    PedidoChamadoController.criar
);

router.get('/meus-pedidos',
    AuthMiddleware.verifyToken,
    permitir(['tecnico']),
    PedidoChamadoController.listarPorTecnico
);

router.get('/pendentes',
    AuthMiddleware.verifyToken,
    permitir(['admin']),
    PedidoChamadoController.listarPendentes
);

router.patch('/:id/responder',
    AuthMiddleware.verifyToken,
    permitir(['admin']),
    PedidoChamadoController.responderPedido
);

export default router;