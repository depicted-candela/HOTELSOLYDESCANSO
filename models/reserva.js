'use strict';
export default (sequelize, DataTypes) => {

  const Reserva = sequelize.define('Reserva', {
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    habitacionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fechaInicio: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fechaFin: {
      type: DataTypes.DATE,
      allowNull: false
    },
    precioTotal: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {});
  Reserva.associate = function(models) {
    Reserva.belongsTo(models.Usuario, { foreignKey: 'usuarioId' });
    Reserva.belongsTo(models.Habitacion, { foreignKey: 'habitacionId' });
  };
  return Reserva;
  
};
