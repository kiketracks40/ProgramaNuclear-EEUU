const math = require('mathjs');

class NuclearPhysics {
  // Constantes físicas
  static CONSTANTS = {
    AVOGADRO: 6.02214076e23,
    SPEED_OF_LIGHT: 299792458,
    PLANCK: 6.62607015e-34,
    ELECTRON_MASS: 9.1093837015e-31,
    NEUTRON_MASS: 1.67262192369e-27,
    PROTON_MASS: 1.67262192369e-27
  };

  // Calcular masa crítica
  static calculateCriticalMass(material, geometry = 'sphere') {
    const criticalMassValues = {
      'U-235': 52, // kg
      'Pu-239': 10, // kg
      'U-233': 16  // kg
    };
    
    return criticalMassValues[material] || null;
  }

  // Calcular decaimiento radiactivo
  static calculateDecay(initialQuantity, halfLife, time) {
    const decayConstant = Math.log(2) / halfLife;
    return initialQuantity * Math.exp(-decayConstant * time);
  }

  // Calcular energía liberada en fisión
  static calculateFissionEnergy(mass) {
    // E = mc²
    const c = this.CONSTANTS.SPEED_OF_LIGHT;
    return mass * c * c;
  }
}

module.exports = NuclearPhysics;