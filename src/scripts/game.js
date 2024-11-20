import * as THREE from 'three';
import { AssetManager } from './assets/assetManager.js';
import { CameraManager } from './camera.js';
import { InputManager } from './input.js';
import { City } from './sim/city.js';
import { SimObject } from './sim/simObject.js';

/** 
 * Gerenciador da cena do Three.js. Lida com a renderização de um objeto `City`.
 */
export class Game {
  /**
   * @type {City}
   */
  city;
  /**
   * Objeto que atualmente tem o foco
   * @type {SimObject | null}
   */
  focusedObject = null;
  /**
   * Classe para gerenciar a entrada do usuário
   * @type {InputManager}
   */
  inputManager;
  /**
   * Objeto que está atualmente selecionado
   * @type {SimObject | null}
   */
  selectedObject = null;

  constructor(city) {
    this.city = city;

    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true
    });
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb);

    this.inputManager = new InputManager(window.ui.gameWindow);
    this.cameraManager = new CameraManager();

    // Configurar o renderizador
    this.renderer.setSize(window.ui.gameWindow.clientWidth, window.ui.gameWindow.clientHeight);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    // Adicionar o renderizador ao DOM
    window.ui.gameWindow.appendChild(this.renderer.domElement);

    // Variáveis para seleção de objetos
    this.raycaster = new THREE.Raycaster();

    /**
     * Instância global do gerenciador de ativos
     */
    window.assetManager = new AssetManager(() => {
      window.ui.hideLoadingText();

      this.city = new City(8);
      this.initialize(this.city);
      this.start();

      setInterval(this.simulate.bind(this), 1000);
    });

    window.addEventListener('resize', this.onResize.bind(this), false);
  }

  /**
   * Inicializa a cena, limpando todos os ativos existentes
   */
  initialize(city) {
    this.scene.clear();
    this.scene.add(city);
    this.#setupLights();
    this.#setupGrid(city);
  }

  #setupGrid(city) {
    // Adiciona a grade
    const gridMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x000000,
      map: window.assetManager.textures['grid'],
      transparent: true,
      opacity: 0.2
    });
    gridMaterial.map.repeat = new THREE.Vector2(city.size, city.size);
    gridMaterial.map.wrapS = city.size;
    gridMaterial.map.wrapT = city.size;

    const grid = new THREE.Mesh(
      new THREE.BoxGeometry(city.size, 0.1, city.size),
      gridMaterial
    );
    grid.position.set(city.size / 2 - 0.5, -0.04, city.size / 2 - 0.5);
    this.scene.add(grid);
  }

  /**
   * Configura as luzes da cena
   */
  #setupLights() {
    const sun = new THREE.DirectionalLight(0xffffff, 2);
    sun.position.set(-10, 20, 0);
    sun.castShadow = true;
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 50;
    sun.shadow.normalBias = 0.01;
    this.scene.add(sun);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  }
  
  /**
   * Inicia o renderizador
   */
  start() {
    this.renderer.setAnimationLoop(this.draw.bind(this));
  }

  /**
   * Para o renderizador
   */
  stop() {
    this.renderer.setAnimationLoop(null);
  }

  /**
   * Renderiza o conteúdo da cena
   */
  draw() {
    this.city.draw();
    this.updateFocusedObject();

    if (this.inputManager.isLeftMouseDown) {
      this.useTool();
    }

    this.renderer.render(this.scene, this.cameraManager.camera);
  }

  /**
   * Avança a simulação em um passo
   */
  simulate() {
    if (window.ui.isPaused) return;

    // Atualiza o modelo de dados da cidade primeiro, depois atualiza a cena
    this.city.simulate(1);

    window.ui.updateTitleBar(this);
    window.ui.updateInfoPanel(this.selectedObject);
  }

  /**
   * Usa a ferramenta atualmente ativa
   */
  useTool() {
    switch (window.ui.activeToolId) {
      case 'select':
        this.updateSelectedObject();
        window.ui.updateInfoPanel(this.selectedObject);
        break;
      case 'bulldoze':
        if (this.focusedObject) {
          const { x, y } = this.focusedObject;
          this.city.bulldoze(x, y);
        }
        break;
      default:
        if (this.focusedObject) {
          const { x, y } = this.focusedObject;
          this.city.placeBuilding(x, y, window.ui.activeToolId);
        }
        break;
    }
  }
  
  /**
   * Define o objeto atualmente selecionado e o destaca
   */
  updateSelectedObject() {
    this.selectedObject?.setSelected(false);
    this.selectedObject = this.focusedObject;
    this.selectedObject?.setSelected(true);
  }

  /**
   * Define o objeto que está atualmente em destaque
   */
  updateFocusedObject() {  
    this.focusedObject?.setFocused(false);
    const newObject = this.#raycast();
    if (newObject !== this.focusedObject) {
      this.focusedObject = newObject;
    }
    this.focusedObject?.setFocused(true);
  }

  /**
   * Obtém o mesh atualmente sob o cursor do mouse. Se não houver nada, retorna null.
   * @param {MouseEvent} event Evento do mouse
   * @returns {THREE.Mesh | null}
   */
  #raycast() {
    var coords = {
      x: (this.inputManager.mouse.x / this.renderer.domElement.clientWidth) * 2 - 1,
      y: -(this.inputManager.mouse.y / this.renderer.domElement.clientHeight) * 2 + 1
    };

    this.raycaster.setFromCamera(coords, this.cameraManager.camera);

    let intersections = this.raycaster.intersectObjects(this.city.root.children, true);
    if (intersections.length > 0) {
      // O SimObject anexado ao mesh é armazenado nos dados do usuário
      const selectedObject = intersections[0].object.userData;
      return selectedObject;
    } else {
      return null;
    }
  }

  /**
   * Redimensiona o renderizador para caber na janela atual do jogo
   */
  onResize() {
    this.cameraManager.resize(window.ui.gameWindow);
    this.renderer.setSize(window.ui.gameWindow.clientWidth, window.ui.gameWindow.clientHeight);
  }
}

// Cria um novo jogo quando a janela é carregada
window.onload = () => {
  window.game = new Game();
}
