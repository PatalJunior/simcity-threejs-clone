import * as THREE from 'three';

// -- Constantes --
const DEG2RAD = Math.PI / 180.0; // Conversão de graus para radianos
const RIGHT_MOUSE_BUTTON = 2; // Botão direito do mouse

// Restrições da câmera
const CAMERA_SIZE = 5; // Tamanho da câmera
const MIN_CAMERA_RADIUS = 0.1; // Raio mínimo da câmera
const MAX_CAMERA_RADIUS = 5; // Raio máximo da câmera
const MIN_CAMERA_ELEVATION = 45; // Elevação mínima da câmera
const MAX_CAMERA_ELEVATION = 45; // Elevação máxima da câmera

// Sensibilidade da câmera
const AZIMUTH_SENSITIVITY = 0.2; // Sensibilidade do ângulo azimutal
const ELEVATION_SENSITIVITY = 0.2; // Sensibilidade da elevação
const ZOOM_SENSITIVITY = 0.002; // Sensibilidade do zoom
const PAN_SENSITIVITY = -0.01; // Sensibilidade do movimento panorâmico

const Y_AXIS = new THREE.Vector3(0, 1, 0); // Eixo Y

export class CameraManager {
  constructor(camOrigin = new THREE.Vector3(3, 0, 3)) {
    const aspect = window.ui.gameWindow.clientWidth / window.ui.gameWindow.clientHeight;

    this.camera = new THREE.OrthographicCamera(
      (CAMERA_SIZE * aspect) / -2,
      (CAMERA_SIZE * aspect) / 2,
      CAMERA_SIZE / 2,
      CAMERA_SIZE / -2, 1, 1000);
    this.camera.layers.enable(1);
    
    this.cameraOrigin = camOrigin; // Origem da câmera
    this.cameraRadius = 0.5; // Raio inicial da câmera
    this.cameraAzimuth = 225; // Ângulo azimutal inicial
    this.cameraElevation = 45; // Elevação inicial da câmera

    this.updateCameraPosition();

    // Adiciona ouvintes de eventos para interações com a câmera
    window.ui.gameWindow.addEventListener('wheel', this.onMouseScroll.bind(this), false);
    window.ui.gameWindow.addEventListener('mousedown', this.onMouseMove.bind(this), false);
    window.ui.gameWindow.addEventListener('mousemove', this.onMouseMove.bind(this), false);
  }

  /**
   * Aplica quaisquer mudanças na posição/orientação da câmera
   */
  updateCameraPosition() {
    this.camera.zoom = this.cameraRadius;
    this.camera.position.x = 100 * Math.sin(this.cameraAzimuth * DEG2RAD) * Math.cos(this.cameraElevation * DEG2RAD);
    this.camera.position.y = 100 * Math.sin(this.cameraElevation * DEG2RAD);
    this.camera.position.z = 100 * Math.cos(this.cameraAzimuth * DEG2RAD) * Math.cos(this.cameraElevation * DEG2RAD);
    this.camera.position.add(this.cameraOrigin);
    this.camera.lookAt(this.cameraOrigin);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
  }

  /**
   * Manipulador de evento para o evento `mousemove`
   * @param {MouseEvent} event Argumentos do evento de mouse
   */
  onMouseMove(event) {
    // Controla a rotação da câmera
    if (event.buttons & RIGHT_MOUSE_BUTTON && !event.ctrlKey) {
      this.cameraAzimuth += -(event.movementX * AZIMUTH_SENSITIVITY);
      this.cameraElevation += (event.movementY * ELEVATION_SENSITIVITY);
      this.cameraElevation = Math.min(MAX_CAMERA_ELEVATION, Math.max(MIN_CAMERA_ELEVATION, this.cameraElevation));
    }

    // Controla o movimento panorâmico da câmera
    if (event.buttons & RIGHT_MOUSE_BUTTON && event.ctrlKey) {
      const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(Y_AXIS, this.cameraAzimuth * DEG2RAD);
      const left = new THREE.Vector3(1, 0, 0).applyAxisAngle(Y_AXIS, this.cameraAzimuth * DEG2RAD);
      this.cameraOrigin.add(forward.multiplyScalar(PAN_SENSITIVITY * event.movementY));
      this.cameraOrigin.add(left.multiplyScalar(PAN_SENSITIVITY * event.movementX));
    }

    this.updateCameraPosition();
  }

  /**
   * Manipulador de evento para o evento `wheel`
   * @param {MouseEvent} event Argumentos do evento de mouse
   */
  onMouseScroll(event) {
    this.cameraRadius *= 1 - (event.deltaY * ZOOM_SENSITIVITY);
    this.cameraRadius = Math.min(MAX_CAMERA_RADIUS, Math.max(MIN_CAMERA_RADIUS, this.cameraRadius));

    this.updateCameraPosition();
  }

  /**
   * Atualiza as proporções da câmera ao redimensionar a janela
   */
  resize() {
    const aspect = window.ui.gameWindow.clientWidth / window.ui.gameWindow.clientHeight;
    this.camera.left = (CAMERA_SIZE * aspect) / -2;
    this.camera.right = (CAMERA_SIZE * aspect) / 2;
    this.camera.updateProjectionMatrix();
  }
}
