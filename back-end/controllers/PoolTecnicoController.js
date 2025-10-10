import PoolTecnico from '../entities/PoolTecnico.js';
import Pool from '../entities/Pool.js';
import Usuario from '../entities/Usuario.js';

class PoolTecnicoController {

    static async listarTodos(req, res) {
        try {
            const poolsTecnicos = await PoolTecnico.findAll({
                include: [
                    { model: Pool, attributes: ['id', 'titulo', 'status'] },
                    { model: Usuario, attributes: ['id', 'nome', 'especialidade'] }
                ]
            });
            res.json(poolsTecnicos);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao listar associações Pool-Técnico.' });
        }
    }

    // NOVO MÉTODO: Lista Pools associados a um Técnico específico
    static async listarPorTecnico(req, res) {
        try {
            // Renomeado para id_tecnico para clareza
            const { id_tecnico } = req.params; 

            const poolTecnicos = await PoolTecnico.findAll({
                where: { id_tecnico: id_tecnico },
                include: [
                    // Inclui os dados do Pool para o frontend (ProfileInfo) renderizar
                    { model: Pool, as: 'pool', attributes: ['id', 'titulo', 'status'] } 
                ]
            });

            // Retorna array vazio se não houver associações (Status 200 OK)
            res.json(poolTecnicos); 

        } catch (err) {
            console.error("Erro ao buscar Pools por Técnico:", err);
            res.status(500).json({ message: "Erro ao buscar Pools por Técnico." });
        }
    }

    static async listarPorPool(req, res) {
        try {
            const { id_pool } = req.params;

            const poolTecnicos = await PoolTecnico.findAll({
                where: { id_pool: id_pool },
                include: [
                    { model: Usuario, attributes: ['id', 'nome', 'especialidade'] }
                ]
            });

            if (poolTecnicos.length === 0) {
                // Ao invés de 404 para "nenhum técnico", é melhor retornar array vazio (200)
                // O 404 deve ser usado quando o recurso (o Pool) não existe.
                return res.json([]);
            }

            res.json(poolTecnicos);
        } catch (err) {
            console.error("Erro ao buscar técnicos por Pool:", err);
            res.status(500).json({ message: "Erro ao buscar técnicos por Pool." });
        }
    }

    static async associarTecnico(req, res) {
        try {
            const { id_pool, id_tecnico } = req.body;

            if (!id_pool || !id_tecnico) {
                return res.status(400).json({ message: 'IDs do Pool e do Técnico são obrigatórios.' });
            }

            const poolExistente = await Pool.findByPk(id_pool);
            if (!poolExistente) {
                return res.status(404).json({ message: 'Pool não encontrado.' });
            }

            const tecnicoExistente = await Usuario.findByPk(id_tecnico);
            if (!tecnicoExistente || tecnicoExistente.funcao !== 'tecnico') {
                return res.status(404).json({ message: 'Técnico não encontrado ou não tem a função adequada.' });
            }

            const associacaoExistente = await PoolTecnico.findOne({
                where: { id_pool, id_tecnico }
            });

            if (associacaoExistente) {
                return res.status(409).json({ message: 'O técnico já está associado a este Pool.' });
            }

            const novaAssociacao = await PoolTecnico.create({
                id_pool,
                id_tecnico
            });

            const associacaoCompleta = await PoolTecnico.findByPk(novaAssociacao.id, {
                include: [
                    { model: Pool, as: 'pool', attributes: ['id', 'titulo'] },
                    { model: Usuario, as: 'tecnico', attributes: ['id', 'nome'] }
                ]
            });

            res.status(201).json(associacaoCompleta);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao associar técnico ao Pool.' });
        }
    }

    static async removerAssociacao(req, res) {
        try {
            const { id_pool, id_tecnico } = req.body;

            if (!id_pool || !id_tecnico) {
                return res.status(400).json({ message: 'IDs do Pool e do Técnico são obrigatórios.' });
            }

            const resultado = await PoolTecnico.destroy({
                where: { id_pool, id_tecnico }
            });

            if (resultado === 0) {
                return res.status(404).json({ message: 'Associação Pool-Técnico não encontrada para remoção.' });
            }

            res.status(200).json({ message: 'Associação removida com sucesso.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao remover associação Pool-Técnico.' });
        }
    }

}

export default PoolTecnicoController;