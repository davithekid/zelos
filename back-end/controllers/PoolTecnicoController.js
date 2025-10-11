import PoolTecnico from '../entities/PoolTecnico.js';
import Pool from '../entities/Pool.js';
import Usuario from '../entities/Usuario.js';

class PoolTecnicoController {

    static async listarTodos(req, res) {
        try {
            const poolsTecnicos = await PoolTecnico.findAll({
                include: [
                    { model: Pool, as: 'pool', attributes: ['id', 'titulo', 'status'] },
                    { model: Usuario, as: 'tecnico', attributes: ['id', 'nome', 'funcao'] } 
                ]
            });
            res.json(poolsTecnicos);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Erro ao listar associações Pool-Técnico.' });
        }
    }

    static async listarPorTecnico(req, res) {
        try {
            const { id_tecnico } = req.params;

            const poolTecnicos = await PoolTecnico.findAll({
                where: { id_tecnico: id_tecnico },
                include: [
                    { model: Pool, as: 'pool', attributes: ['id', 'titulo', 'status'] }
                ]
            });

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
                    { model: Usuario, attributes: ['id', 'nome', 'funcao'] }
                ]
            });

            if (poolTecnicos.length === 0) {
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

    static async listarPoolsDisponiveis(req, res) {
        try {
            const pools = await Pool.findAll({
                attributes: ['titulo'],
                where: {
                    status: 'ativo'
                },
                order: [
                    ['titulo', 'ASC']
                ],
                raw: true
            });

            const especialidades = pools.map(pool => pool.titulo);

            res.status(200).json({
                message: "Pools disponíveis listadas com sucesso.",
                data: especialidades
            });

        } catch (err) {
            console.error("Erro ao listar pools disponíveis:", err);
            res.status(500).json({ message: 'Erro ao listar pools disponíveis.' });
        }
    }

}

export default PoolTecnicoController;