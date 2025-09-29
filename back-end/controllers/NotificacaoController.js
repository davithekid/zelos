import Notificacao from '../entities/Notificacao.js';

class NotificacaoController {

    static async listar(req, res) {
        try {
            const usuario_id = req.user.id; 
            const notificacoes = await Notificacao.findAll({
                where: { usuario_id },
                order: [['criado_em', 'DESC']]
            });
            res.json(notificacoes);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao buscar notificações' });
        }
    }

    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const usuario_id = req.user.id;
            const notificacao = await Notificacao.findOne({
                where: { id, usuario_id }
            });

            if (!notificacao) {
                return res.status(404).json({ message: 'Notificação não encontrada' });
            }

            res.json(notificacao);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao buscar notificação' });
        }
    }

    static async marcarComoLida(req, res) {
        try {
            const { id } = req.params;
            const usuario_id = req.user.id;

            const notificacao = await Notificacao.findOne({
                where: { id, usuario_id }
            });

            if (!notificacao) {
                return res.status(404).json({ message: 'Notificação não encontrada ou não pertence a você.' });
            }
            
            if (notificacao.lida) {
                return res.status(200).json(notificacao);
            }
            
            notificacao.lida = true;

            await notificacao.save();

            res.status(200).json(notificacao);

        } catch (err) {
            console.error("Erro ao marcar notificação como lida:", err);
            res.status(500).json({ message: 'Erro ao atualizar notificação' });
        }
    }
    
    static async deletar(req, res) {
        try {
            const { id } = req.params;
            const usuario_id = req.user.id;
            const notificacao = await Notificacao.findOne({
                where: { id, usuario_id }
            });

            if (!notificacao) {
                return res.status(404).json({ message: 'Notificação não encontrada' });
            }

            await notificacao.destroy();
            res.json({ message: 'Notificação deletada com sucesso' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao deletar notificação' });
        }
    }

    static async limparTodas(req, res) {
        try {
            const usuario_id = req.user.id;
            await Notificacao.destroy({ where: { usuario_id } });
            res.json({ message: 'Todas as suas notificações foram deletadas.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao limpar notificações' });
        }
    }
}

export default NotificacaoController;