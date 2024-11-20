import { BuildingType } from './buildingType.js';
import { ResidentialZone } from './zones/residential.js';
import { Road } from './transportation/road.js';
import { Building } from './building.js';

/**
 * Cria um novo objeto de construção
 * @param {number} x A coordenada x da construção
 * @param {number} y A coordenada y da construção
 * @param {string} type O tipo de construção
 * @returns {Building} Um novo objeto de construção
 */
export function createBuilding(x, y, type) {
  switch (type) {
    case BuildingType.residential: 
      return new ResidentialZone();
    case BuildingType.road: 
      return new Road();
    default:
      console.error(`${type} não é um tipo de construção reconhecido.`);
  }
}
