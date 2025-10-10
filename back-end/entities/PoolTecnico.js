import { Model, DataTypes } from "sequelize";
import sequelize from "../configs/database.js";
import Pool from "./Pool.js";
import Usuario from "./Usuario.js";

export default class PoolTecnico extends Model {}

PoolTecnico.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_pool: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {model: Pool, key: 'id'}
    },
    id_tecnico: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        references: {model: Usuario, key: 'id'} 
    }
}, {
    sequelize,
    tableName: 'pool_tecnico',
    timestamps: false 
});


PoolTecnico.belongsTo(Pool, { 
    foreignKey: 'id_pool', 
    as: 'pool' 
});

PoolTecnico.belongsTo(Usuario, { 
    foreignKey: 'id_tecnico', 
    as: 'tecnico' 
});

Pool.hasMany(PoolTecnico, {
    foreignKey: 'id_pool',
    as: 'tecnicos_associados'
});

Usuario.hasMany(PoolTecnico, {
    foreignKey: 'id_tecnico',
    as: 'pools_associados'
});