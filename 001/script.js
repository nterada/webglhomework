import * as THREE from '../lib/three.module.js';
import { OrbitControls } from '../lib/OrbitControls.js';

window.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.querySelector('#webgl');
  const app = new ThreeApp(wrapper);
  app.render();
}, false);

class ThreeApp {
  static CAMERA_PARAM = {
    fovy: 60,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 20.0,
    position: new THREE.Vector3(0.0, 2.0, 10.0),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
  };

  static RENDERER_PARAM = {
    clearColor: 0xffffff,
    width: window.innerWidth,
    height: window.innerHeight,
  };

  static DIRECTIONAL_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 1.0,
    position: new THREE.Vector3(1.0, 1.0, 1.0),
  };

  static AMBIENT_LIGHT_PARAM = {
    color: 0xffffff,
    intensity: 0.1,
  };

  static MATERIAL_PARAM = {
    color: 0x3399ff,
  };

  static FOG_PARAM = {
    color: 0xffffff,
    near: 1.0,
    far: 15.0
  };

  constructor(wrapper) {
    const color = new THREE.Color(ThreeApp.RENDERER_PARAM.clearColor);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(color);
    this.renderer.setSize(ThreeApp.RENDERER_PARAM.width, ThreeApp.RENDERER_PARAM.height);
    wrapper.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(
      ThreeApp.FOG_PARAM.color,
      ThreeApp.FOG_PARAM.near,
      ThreeApp.FOG_PARAM.far
    );

    this.camera = new THREE.PerspectiveCamera(
      ThreeApp.CAMERA_PARAM.fovy,
      ThreeApp.CAMERA_PARAM.aspect,
      ThreeApp.CAMERA_PARAM.near,
      ThreeApp.CAMERA_PARAM.far,
    );
    this.camera.position.copy(ThreeApp.CAMERA_PARAM.position);
    this.camera.lookAt(ThreeApp.CAMERA_PARAM.lookAt);

    this.directionalLight = new THREE.DirectionalLight(
      ThreeApp.DIRECTIONAL_LIGHT_PARAM.color,
      ThreeApp.DIRECTIONAL_LIGHT_PARAM.intensity
    );
    this.directionalLight.position.copy(ThreeApp.DIRECTIONAL_LIGHT_PARAM.position);
    this.scene.add(this.directionalLight);

    this.ambientLight = new THREE.AmbientLight(
      ThreeApp.AMBIENT_LIGHT_PARAM.color,
      ThreeApp.AMBIENT_LIGHT_PARAM.intensity,
    );
    this.scene.add(this.ambientLight);

    this.material = new THREE.MeshPhongMaterial(ThreeApp.MATERIAL_PARAM);

    this.neck = new THREE.Group();
    this.scene.add(this.neck);
    
    this.wing = new THREE.Group();
    this.neck.add(this.wing);
    // this.wing.scale.z = 0.1;
    this.wing.position.z = 0.5;

    const radius = 1;
    const propellerLength = 2;
    const boxSize = 0.2;
    const numBoxes = 10; // 一つのプロペラを構成するボックスの数
    const numPropellers = 7; // プロペラの数

    for (let i = 0; i < numPropellers; i++) {
      const angle = (i / numPropellers) * 2 * Math.PI;
      
      // プロペラグループの作成
      const propellerGroup = new THREE.Group();

      for (let j = 0; j < numBoxes; j++) {
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(boxSize, boxSize, boxSize),
          new THREE.MeshBasicMaterial({ color: 0x0000ff })
        );

        const boxAngle = (j / numBoxes) * Math.PI;
        box.position.x = (propellerLength / 2) * Math.cos(boxAngle);
        box.position.y = (propellerLength / 4) * Math.sin(boxAngle);

        propellerGroup.add(box);
      }

      // プロペラグループの配置
      propellerGroup.rotation.z = angle;
      propellerGroup.position.x = radius * Math.cos(angle);
      propellerGroup.position.y = radius * Math.sin(angle);

      this.wing.add(propellerGroup);
    }



    const dotradius = 2.5; // 円の半径
    const dotSize = 0.2; // ドット（円）のサイズ
    const numDots = 30; // 円周上のドットの数

    for (let i = 0; i < numDots; i++) {
      const angle = (i / numDots) * Math.PI * 2;
      
      const dot = new THREE.Mesh(
        new THREE.BoxGeometry(dotSize, dotSize, dotSize),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
      );

      dot.position.x = dotradius * Math.cos(angle);
      dot.position.y = dotradius * Math.sin(angle);

      // this.scene.add(dot); // シーンに追加
      this.neck.add(dot);
    }


    const dotSize2 = 0.2; // ドット（正方形）のサイズ
    const numHeight = 20; // 高さ方向に配置するドットの数

    for (let i = 0; i < numHeight; i++) {
      const height = new THREE.Mesh(
        new THREE.BoxGeometry(dotSize2, dotSize2, dotSize2),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
      );

      // height.position.z = i * dotSize2 * 2; // ドット同士の間隔を考慮して高さを設定
      height.position.y = i * dotSize2 * -2; // ドット同士の間隔を考慮して高さを設定
      height.position.z = -0.5;

      this.neck.add(height); // ラインのようにドットを追加
    }







    const axesBarLength = 5.0;
    this.axesHelper = new THREE.AxesHelper(axesBarLength);
    this.scene.add(this.axesHelper);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.render = this.render.bind(this);

    this.isRotating = false;
    this.wingRotationSpeed = 0;
    this.maxWingRotationSpeed = 0.3;

    window.addEventListener('keydown', (keyEvent) => {
      switch (keyEvent.key) {
        case ' ':
          this.isRotating = !this.isRotating;
          break;
        default:
      }
    }, false);

    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }, false);

    this.neckRotationDirection = 1;
  }

  easeOutQuad(t) {
    return t * (2 - t);
  }

  render() {
    requestAnimationFrame(this.render);

    this.controls.update();

    if (this.isRotating) {
      if (this.wingRotationSpeed < this.maxWingRotationSpeed) {
        this.wingRotationSpeed += 0.01;
      }
    } else {
      if (this.wingRotationSpeed > 0) {
        this.wingRotationSpeed -= 0.01 * this.easeOutQuad(this.wingRotationSpeed / this.maxWingRotationSpeed);
      } else {
        this.wingRotationSpeed = 0;
      }
    }

    this.wing.rotation.z += this.wingRotationSpeed;

    this.neck.rotation.y += 0.01 * this.neckRotationDirection;
    if (this.neck.rotation.y > Math.PI / 4) {
      this.neckRotationDirection = -1;
    } else if (this.neck.rotation.y < -Math.PI / 4) {
      this.neckRotationDirection = 1;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
