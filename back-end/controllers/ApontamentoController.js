import Apontamento from '../entities/Apontamento.js'
import Chamado from '../entities/Chamado.js';

class ApontamentoController {

    static async listar(req, res) {
        try {
            const apontamento = await Apontamento.findAll({
                include: ['chamado', 'tecnico']
            });
            res.json(apontamento);
        } catch (err) {
            res.status(500).json({ message: 'Erro ao listar apontamento' });
        }
    }

    static async listarApontamentos(req, res) {
        try {
            const { id } = req.params;

            const apontamentos = await Apontamento.findAll({
                where: { chamado_id: id },
                include: ['tecnico'],
                order: [['comeco', 'DESC']]
            });

            res.json(apontamentos);
        } catch (err) {
            console.error("Erro ao buscar apontamentos:", err);
            res.status(500).json({ message: "Erro ao buscar apontamentos." });
        }
    }

    static async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const apontamento = await Apontamento.findByPk(id, { include: ['chamado', 'tecnico'] });
            if (!apontamento) {
                res.status(404).json({ message: 'Apontamento não encontrado' });
            }
            res.json(apontamento);
        } catch (err) {
            res.status(500).json({ message: 'Erro ao buscar apontamento' })
        }
    }

    static async criar(req, res) {
        try {
            const { comeco, fim, descricao, chamado_id } = req.body;
            const tecnico_id = req.user.id;

            // validação de campos obrigatórios
            if (!comeco || !descricao || !chamado_id) {
                return res.status(400).json({ message: 'Campos obrigatórios faltando: Descrição e Início.' });
            }


            const dataComeco = new Date(comeco);
            const dataFim = fim ? new Date(fim) : null;

            // verificação para que fim nao seja antes do começo
            if (dataFim && dataFim < dataComeco) {
                return res.status(400).json({ message: 'A data/hora de Fim não pode ser anterior à data/hora de Início.' });
            }

            const chamado = await Chamado.findByPk(chamado_id);
            if (!chamado) {
                return res.status(404).json({ message: 'Chamado não encontrado.' });
            }

            if (chamado.tecnico_id !== tecnico_id) {
                return res.status(403).json({ message: 'Este chamado não está atribuído a você.' });
            }

            if (chamado.status !== 'em andamento') {
                return res.status(400).json({ message: 'Só é possível criar apontamentos para chamados "em andamento".' });
            }

            const apontamento = await Apontamento.create({
                chamado_id,
                tecnico_id,
                descricao,
                comeco: dataComeco,
                fim: dataFim,
            });

            const apontamentoCompleto = await Apontamento.findByPk(apontamento.id, {
                include: ['chamado', 'tecnico']
            });

            res.status(201).json(apontamentoCompleto);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao criar apontamento.' });
        }
    }

    static async fechar(req, res) {
        try {
            const { id } = req.params;
            const apontamento = await Apontamento.findByPk(id);

            if (!apontamento)
                return res.status(404).json({ message: 'Apontamento não encontrado' });

            if (apontamento.fim !== null)
                return res.status(400).json({ message: 'Apontamento já finalizado' });

            await apontamento.update({ fim: new Date() });
            const apontamentoAtualizado = await Apontamento.findByPk(id, { include: ['chamado', 'tecnico'] });

            res.status(200).json(apontamentoAtualizado);

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Erro ao fechar apontamento" });
        }
    }

}

export default ApontamentoController;   