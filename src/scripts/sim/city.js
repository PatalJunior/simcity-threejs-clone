import * as THREE from 'three';
import { BuildingType } from './buildings/buildingType.js';
import { createBuilding } from './buildings/buildingFactory.js';
import { Tile } from './tile.js';
import { VehicleGraph } from './vehicles/vehicleGraph.js';
import { SimService } from './services/simService.js';

export class City extends THREE.Group {
  /**
   * Grupo separado para organizar meshes de depuração
   * para que não sejam incluídas em verificações de raycasting
   * @type {THREE.Group}
   */
  debugMeshes = new THREE.Group();
  
  /**
   * Nó raiz para todos os objetos da cena
   * @type {THREE.Group}
   */
  root = new THREE.Group();
  
  /**
   * Lista de serviços disponíveis na cidade
   * @type {SimService[]}
   */
  services = [];
  
  /**
   * Tamanho da cidade em tiles
   * @type {number}
   */
  size = 8;
  
  /**
   * Tempo atual da simulação
   */
  simTime = 0;
  
  /**
   * Matriz 2D representando os tiles da cidade
   * @type {Tile[][]}
   */
  tiles = [];
  
  /**
   * Grafo de veículos para gerenciar conexões e rotas
   * @type {VehicleGraph}
   */
  vehicleGraph;

  // Construtor da cidade
  constructor(size, name = 'Patal & oSlaYn CITY') {
    super(); // Inicializa a classe pai (THREE.Group)

    this.name = name;
    this.size = size;
    
    this.add(this.debugMeshes); // Adiciona meshes de depuração
    this.add(this.root);        // Adiciona o nó raiz

    // Cria a matriz de tiles (blocos da cidade)
    this.tiles = [];
    for (let x = 0; x < this.size; x++) {
      console.log(x)
      const column = [];
      for (let y = 0; y < this.size; y++) {
        const tile = new Tile(x, y); // Cria cada tile
        tile.refreshView(this);     // Atualiza a visualização do tile
        this.root.add(tile);        // Adiciona ao nó raiz
        column.push(tile);          // Adiciona o tile à coluna
      }
      this.tiles.push(column);      // Adiciona a coluna à matriz
    }

    this.services = []; // Inicializa a lista de serviços

    // Inicializa o grafo de veículos
    this.vehicleGraph = new VehicleGraph(this.size);
    this.debugMeshes.add(this.vehicleGraph); // Adiciona ao grupo de depuração
  }

  /**
   * Retorna a população total da cidade
   * @type {number}
   */
  get population() {
    let population = 0;
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        const tile = this.getTile(x, y);
        population += tile.building?.residents?.count ?? 0; // Soma a população de cada tile
      }
    }
    return population;
  }

  /**
   * Retorna o tile nas coordenadas especificadas.
   * Se estiver fora dos limites, retorna `null`.
   * @param {number} x Coordenada x do tile
   * @param {number} y Coordenada y do tile
   * @returns {Tile | null}
   */
  getTile(x, y) {
    if (
      x === undefined || y === undefined || 
      x < 0 || y < 0 || 
      x >= this.size || y >= this.size
    ) {
      return null;
    } else {
      return this.tiles[x][y];
    }
  }

  /**
   * Avança a simulação em um ou mais passos
   * @type {number} steps Número de passos a simular
   */
  simulate(steps = 1) {
    let count = 0;
    while (count++ < steps) {
      // Atualiza os serviços
      this.services.forEach((service) => service.simulate(this));

      // Atualiza cada tile
      for (let x = 0; x < this.size; x++) {
        for (let y = 0; y < this.size; y++) {
          this.getTile(x, y).simulate(this);
        }
      }
    }
    this.simTime++; // Incrementa o tempo da simulação
  }

  /**
   * Coloca um edifício em um tile especificado
   * @param {number} x Coordenada x
   * @param {number} y Coordenada y
   * @param {string} buildingType Tipo do edifício
   */
  placeBuilding(x, y, buildingType) {
    const tile = this.getTile(x, y);

    // Verifica se o tile já possui um edifício
    if (tile && !tile.building) {
      tile.setBuilding(createBuilding(x, y, buildingType));
      tile.refreshView(this);

      // Atualiza a visualização dos tiles vizinhos (ex: para estradas)
      this.getTile(x - 1, y)?.refreshView(this);
      this.getTile(x + 1, y)?.refreshView(this);
      this.getTile(x, y - 1)?.refreshView(this);
      this.getTile(x, y + 1)?.refreshView(this);

      // Atualiza o grafo de veículos se o edifício for uma estrada
      if (tile.building.type === BuildingType.road) {
        this.vehicleGraph.updateTile(x, y, tile.building);
      }
    }
  }

  /**
   * Demole um edifício em um tile especificado
   * @param {number} x Coordenada x
   * @param {number} y Coordenada y
   */
  bulldoze(x, y) {
    const tile = this.getTile(x, y);

    if (tile.building) {
      // Remove do grafo de veículos se for uma estrada
      if (tile.building.type === BuildingType.road) {
        this.vehicleGraph.updateTile(x, y, null);
      }

      tile.building.dispose(); // Libera recursos do edifício
      tile.setBuilding(null); // Remove o edifício
      tile.refreshView(this);

      // Atualiza os tiles vizinhos
      this.getTile(x - 1, y)?.refreshView(this);
      this.getTile(x + 1, y)?.refreshView(this);
      this.getTile(x, y - 1)?.refreshView(this);
      this.getTile(x, y + 1)?.refreshView(this);
    }
  }

  /**
   * Desenha ou atualiza a representação visual da cidade
   */
  draw() {
    // Método para ser implementado no futuro
  }

  /**
   * Encontra o primeiro tile que atende aos critérios fornecidos
   * @param {{x: number, y: number}} start Coordenadas iniciais
   * @param {(Tile) => (boolean)} filter Função para filtrar tiles
   * @param {number} maxDistance Distância máxima para busca
   * @returns {Tile | null} O primeiro tile que atende aos critérios ou `null`
   */
  findTile(start, filter, maxDistance) {
    const startTile = this.getTile(start.x, start.y);
    const visited = new Set();
    const tilesToSearch = [];

    // Inicializa a busca com o tile de início
    tilesToSearch.push(startTile);

    while (tilesToSearch.length > 0) {
      const tile = tilesToSearch.shift();

      // Ignora tiles já visitados
      if (visited.has(tile.id)) {
        continue;
      } else {
        visited.add(tile.id);
      }

      // Verifica se o tile está fora do limite de distância
      const distance = startTile.distanceTo(tile);
      if (distance > maxDistance) continue;

      // Adiciona vizinhos à lista de busca
      tilesToSearch.push(...this.getTileNeighbors(tile.x, tile.y));

      // Retorna o tile se passar nos critérios
      if (filter(tile)) {
        return tile;
      }
    }

    return null; // Nenhum tile encontrado
  }

  /**
   * Retorna os vizinhos de um tile
   * @param {number} x Coordenada x
   * @param {number} y Coordenada y
   */
  getTileNeighbors(x, y) {
    const neighbors = [];

    if (x > 0) {
      neighbors.push(this.getTile(x - 1, y));
    }
    if (x < this.size - 1) {
      neighbors.push(this.getTile(x + 1, y));
    }
    if (y > 0) {
      neighbors.push(this.getTile(x, y - 1));
    }
    if (y < this.size - 1) {
      neighbors.push(this.getTile(x, y + 1));
    }

    return neighbors;
  }
}
