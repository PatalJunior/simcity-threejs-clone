import * as THREE from 'three';
import { VehicleGraphTile } from './vehicleGraphTile.js';
import { VehicleGraphHelper } from './vehicleGraphHelper.js';
import config from '../../config.js';
import { Road } from '../buildings/transportation/road.js';

export class VehicleGraph extends THREE.Group {
  constructor(size) {
    super();

    this.size = size;

    /**
     * @type {VehicleGraphTile[][]}
     */
    this.tiles = [];
  
    /**
     * @type {VehicleGraphHelper}
     */
    this.helper = new VehicleGraphHelper();
    this.add(this.helper);

    // Initialize the vehicle graph tiles array
    for (let x = 0; x < this.size; x++) {
      const column = [];
      for (let y = 0; y < this.size; y++) {
        column.push(null);
      }
      this.tiles.push(column);
    }

    this.helper.refreshView(this);

  }

  /**
   * 
   * @param {number} x
   * @param {number} y 
   * @param {Road | null} road 
   */
  updateTile(x, y, road) {
    const existingTile = this.getTile(x, y);
    const leftTile = this.getTile(x - 1, y);
    const rightTile = this.getTile(x + 1, y);
    const topTile = this.getTile(x, y - 1);
    const bottomTile = this.getTile(x, y + 1);

    // Disconnect the existing tile and all adjacent tiles from each other
    existingTile?.disconnectAll();
    leftTile?.getWorldRightSide()?.out?.disconnectAll();
    rightTile?.getWorldLeftSide()?.out?.disconnectAll();
    topTile?.getWorldBottomSide()?.out?.disconnectAll();
    bottomTile?.getWorldTopSide()?.out?.disconnectAll();
    
    if (road) {
      const tile = VehicleGraphTile.create(x, y, road.rotation.y, road.style);

      // Connect tile to adjacent tiles
      if (leftTile) {
        tile.getWorldLeftSide().out?.connect(leftTile.getWorldRightSide().in);
        leftTile.getWorldRightSide().out?.connect(tile.getWorldLeftSide().in);
      }
      if (rightTile) {
        tile.getWorldRightSide().out?.connect(rightTile.getWorldLeftSide().in);
        rightTile.getWorldLeftSide().out?.connect(tile.getWorldRightSide().in);
      }
      if (topTile) {
        tile.getWorldTopSide().out?.connect(topTile.getWorldBottomSide().in);
        topTile.getWorldBottomSide().out?.connect(tile.getWorldTopSide().in);
      }
      if (bottomTile) {
        tile.getWorldBottomSide().out?.connect(bottomTile.getWorldTopSide().in);
        bottomTile.getWorldTopSide().out?.connect(tile.getWorldBottomSide().in);
      }

      this.tiles[x][y] = tile;
      this.add(tile);      
    } else {
      this.tiles[x][y] = null;
    }

    // Update the vehicle graph visualization
    this.helper.refreshView(this);
  }

  /**
   * @param {number} x 
   * @param {number} y 
   * @returns {VehicleGraphTile}
   */
  getTile(x, y) {
    if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
      return this.tiles[x][y];
    } else {
      return null;
    }
  }



  /**
   * Gets a random tile for a vehicle to spawn at
   * @returns {VehicleGraphTile | null}
   */
  getStartingTile() {
    const tiles = [];
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        let tile = this.getTile(x, y);
        if (tile) tiles.push(tile);
      }
    }

    if (tiles.length === 0) {
      return null;
    } else {
      const i = Math.floor(tiles.length * Math.random());
      return tiles[i];
    }
  }
}