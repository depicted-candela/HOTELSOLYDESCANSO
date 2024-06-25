'use strict';
export default (sequelize, DataTypes) => {

  const Habitacion = sequelize.define('Habitacion', {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: false
    },
    precio: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    disponible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {});

  Habitacion.associate = function(models) {
    Habitacion.hasMany(models.Reserva, { foreignKey: 'habitacionId' });
  };

  Habitacion.prototype.disponibleEn = async function(fechaInicio, fechaFin) {

    const reservas = await this.tomaReservas({
      where: {
        [sequelize.Op.or]: [
          {
            fechaInicio: {
              [sequelize.Op.between]: [fechaInicio, fechaFin]
            }
          },
          {
            fechaFin: {
              [sequelize.Op.between]: [fechaInicio, fechaFin]
            }
          },
          {
            fechaInicio: {
              [sequelize.Op.lte]: fechaInicio
            },
            fechaFin: {
              [sequelize.Op.gte]: fechaFin
            }
          }
        ]
      }
    });
    return reservas.length === 0;
  };
  return Habitacion;

};