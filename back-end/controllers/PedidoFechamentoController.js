import PedidoFechamento from '../entities/PedidoFechamento.js';
import Chamado from '../entities/Chamado.js';
import sequelize from '../configs/database.js';
import Usuario from '../entities/Usuario.js'; 

class PedidoFechamentoController {
    
    static async criar(req, res) {
        const { chamado_id } = req.body;
        const tecnico_id = req.user.id;
        
        try {
            const pedidoPendente = await PedidoFechamento.findOne({
                where: {
                    chamado_id: chamado_id,
                    status: 'pendente'
                }
            });

            if (pedidoPendente) {
                return res.status(409).json({ message: "Já existe uma solicitação de fechamento pendente para este chamado." });
            }

            const novoPedido = await PedidoFechamento.create({ chamado_id, tecnico_id });
            res.status(201).json(novoPedido);
        } catch (error) {
            console.error("Erro ao criar pedido de fechamento:", error);
            res.status(500).json({ message: "Erro ao criar pedido de fechamento." });
        }
    }

    static async listar(req, res) {
        try {
            const { chamado_id } = req.query;
            let whereClause = {};
            if (chamado_id) {
                whereClause.chamado_id = chamado_id;
            }
            
            const pedidos = await PedidoFechamento.findAll({ where: whereClause });
            res.json(pedidos);
        } catch (error) {
            console.error("Erro ao listar pedidos de fechamento:", error);
            res.status(500).json({ message: 'Erro ao listar pedidos.' });
        }
    }
    
    static async listarPendentes(req, res) {
        try {
            const pedidos = await PedidoFechamento.findAll({
                where: { status: 'pendente' },
                include: [
                    { model: Chamado, as: 'chamado' },
                    { model: Usuario, as: 'tecnico' }
                ]
            });
            res.json(pedidos);
        } catch (error) {
            console.error("Erro ao listar pedidos pendentes:", error);
            res.status(500).json({ message: "Erro ao listar pedidos pendentes." });
        }
    }
    
    static async responder(req, res) {
        const { id } = req.params;
        const { status } = req.body; 

        if (!['aprovado', 'reprovado'].includes(status)) {
            return res.status(400).json({ message: "Status inválido." });
        }
        
        const t = await sequelize.transaction();

        try {
            const pedido = await PedidoFechamento.findByPk(id, { transaction: t });
            if (!pedido || pedido.status !== 'pendente') {
                await t.rollback();
                return res.status(404).json({ message: "Pedido não encontrado ou já foi respondido." });
            }

            if (status === 'aprovado') {
                await Chamado.update({ status: 'concluido' }, {
                    where: { id: pedido.chamado_id },
                    transaction: t
                });

                pedido.status = 'aprovado';
                await pedido.save({ transaction: t });

            } else { 
                await pedido.destroy({ transaction: t });
            }

            await t.commit();
            res.json({ message: `Pedido ${status} com sucesso!` });

        } catch (error) {
            await t.rollback();
            console.error("Erro ao responder ao pedido:", error);
            res.status(500).json({ message: "Erro ao responder ao pedido." });
        }
    }
}

export default PedidoFechamentoController;