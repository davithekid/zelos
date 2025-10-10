import Equipamento from '../entities/Equipamento.js';

class EquipamentoController {

    static async listar(req, res) {
        try {
            const equipamentos = await Equipamento.findAll({ order: [['patrimonio', 'ASC']] });
            res.json(equipamentos);
        } catch (err) {
            console.error("Erro ao listar equipamentos:", err);
            res.status(500).json({ message: 'Erro ao buscar equipamentos.' });
        }
    }

    static async criar(req, res) {
        try {
            // Incluindo 'status' no desestruturamento
            const { patrimonio, sala, equipamento, status } = req.body;
            if (!patrimonio) {
                return res.status(400).json({ message: "O número do patrimônio é obrigatório." });
            }

            const novoEquipamento = await Equipamento.create({ patrimonio, sala, equipamento, status }); 
            res.status(201).json(novoEquipamento);
        } catch (err) {
            if (err.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ message: 'Erro: Este número de patrimônio já está cadastrado.' });
            }
            console.error("Erro ao criar equipamento:", err);
            res.status(500).json({ message: 'Erro ao criar equipamento.' });
        }
    }

    static async atualizar(req, res) {
        try {
            const { patrimonio } = req.params; 
            const { sala, equipamento, status } = req.body;

            const eqp = await Equipamento.findByPk(patrimonio);
            if (!eqp) {
                return res.status(404).json({ message: "Equipamento não encontrado." });
            }
            
            await eqp.update({ sala, equipamento, status }); 
            res.json(eqp);

        } catch (err) {
            console.error("Erro ao atualizar equipamento:", err);
            res.status(500).json({ message: 'Erro ao atualizar equipamento.' });
        }
    }

    static async deletar(req, res) {
        try {
            const { patrimonio } = req.params;
            const eqp = await Equipamento.findByPk(patrimonio);
            if (!eqp) {
                return res.status(404).json({ message: "Equipamento não encontrado." });
            }
            
            await eqp.destroy();
            res.json({ message: "Equipamento deletado com sucesso." });
        } catch (err) {
            if (err.name === 'SequelizeForeignKeyConstraintError') {
                return res.status(409).json({ message: 'Não é possível excluir este equipamento pois existem chamados associados a ele.' });
            }
            console.error("Erro ao deletar equipamento:", err);
            res.status(500).json({ message: 'Erro ao deletar equipamento.' });
        }
    }
}

export default EquipamentoController;