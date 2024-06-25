'use strict';
export default (sequelize, DataTypes) => {

  const Usuario = sequelize.define('Usuario', {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {});

  Usuario.associate = function(models) {
    Usuario.hasMany(models.Reserva, { foreignKey: 'usuarioId' });
  };
  return Usuario;
  
};
