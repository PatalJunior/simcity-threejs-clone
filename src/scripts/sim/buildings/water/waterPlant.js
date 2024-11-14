import { Building } from '../building.js';
import { BuildingType } from '../buildingType.js';

export class WaterPlant extends Building {

  /**
   * Available units of water (L/h)
   */
  waterCapacity = 100;

  /**
   * Consumed units of water
   */
  waterConsumed = 0;

  constructor(x, y) {
    super(x, y);
    this.type = BuildingType.waterPlant;
  }

  /**
   * Gets the amount of water available
   */
  get waterAvailable() {
    // Water plant must have road access in order to provide water
    if (this.roadAccess.value) {
      return this.waterCapacity - this.waterConsumed;
    } else {
      return 0;
    }
  }

  refreshView() {
    let mesh = window.assetManager.getModel(this.type, this);
    this.setMesh(mesh);
  }

  /**
   * Returns an HTML representation of this object
   * @returns {string}
   */
  toHTML() {
    let html = super.toHTML();
    html += `
      <div class="info-heading">Water</div>
      <span class="info-label">Water Capacity (L/h)</span>
      <span class="info-value">${this.waterCapacity}</span>
      <br>
      <span class="info-label">Water Consumed (L/h)</span>
      <span class="info-value">${this.waterConsumed}</span>
      <br>
      <span class="info-label">Water Available (L/h)</span>
      <span class="info-value">${this.waterAvailable}</span>
      <br>
    `;
    return html;
  }
}