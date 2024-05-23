
// 必要なモジュールを読み込み
import * as THREE from '../lib/three.module.js';
import { OrbitControls } from '../lib/OrbitControls.js';

// DOM がパースされたことを検出するイベントを設定
window.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.querySelector('#webgl');
  const app = new ThreeApp(wrapper);
  app.render();
}, false);

/**
 * three.js を効率よく扱うために自家製の制御クラスを定義
 */
class ThreeApp {
  static CAMERA_PARAM = {
    fovy: 60,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 10.0,
    position: new THREE.Vector3(0.0, 2.0, 5.0),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
  };

  static RENDERER_PARAM = {
    clearColor: 0x666666,
    width: window.innerWidth, // レンダラーに設定する幅
    height: window.innerHeight, // レンダラーに設定する高さ
  };

  static DIRECTIONAL_LIGHT_PARAM = {
    // color: 0xffffff,                            // 光の色
    color: 0xfffff99,                            // 光の色
    // intensity: 1.0,                             // 光の強度
    intensity: 0.1,                             // 光の強度
    position: new THREE.Vector3(1.0, 1.0, 1.0), // 光の向き
  };

  static AMBIENT_LIGHT_PARAM = {
    // color: 0xffffff, // 光の色
    color: 0xffffff, // 光の色
    intensity: 0.1,  // 光の強度
    // intensity: 0.1,  // 光の強度
  };

  static MATERIAL_PARAM = {
    // color: 0x3399ff,
    color: 0x3300ff,
    transparent: true,     // 透明を扱うかどうか
    opacity: 0.2,          // 透明度
    opacity: 0.01,          // 透明度
    side: THREE.DoubleSide, // 両面描画
    depthTest: true,        // 深度テスト
    depthWrite: false,      // 深度書き込みを無効化
  };

  renderer; // レンダラ
  scene;    // シーン
  camera;   // カメラ
  directionalLight; // 平行光源（ディレクショナルライト）
  ambientLight;     // 環境光（アンビエントライト）
  material; // マテリアル
  geometry; // ジオメトリ
  boxes;    // ボックスメッシュの配列
  controls;   // オービットコントロール
  axesHelper; // 軸ヘルパー
  isDown;     // キーの押下状態用フラグ
  scalingUp;  // スケーリングの方向フラグ

  /**
   * コンストラクタ
   * @constructor
   * @param {HTMLElement} wrapper - canvas 要素を append する親要素
   */
  constructor(wrapper) {
    // - レンダラの初期化 -----------------------------------------------------
    const color = new THREE.Color(ThreeApp.RENDERER_PARAM.clearColor);
    this.renderer = new THREE.WebGLRenderer({
      alpha: true
    });
    this.renderer.setClearColor(color, 0); // 不透明度を 0 に設定
    this.renderer.setSize(ThreeApp.RENDERER_PARAM.width, ThreeApp.RENDERER_PARAM.height);
    wrapper.appendChild(this.renderer.domElement);

    // - シーンの初期化 -------------------------------------------------------
    this.scene = new THREE.Scene();

    // - カメラの初期化 -------------------------------------------------------
    this.camera = new THREE.PerspectiveCamera(
      ThreeApp.CAMERA_PARAM.fovy,
      ThreeApp.CAMERA_PARAM.aspect,
      ThreeApp.CAMERA_PARAM.near,
      ThreeApp.CAMERA_PARAM.far,
    );
    this.camera.position.copy(ThreeApp.CAMERA_PARAM.position);
    this.camera.lookAt(ThreeApp.CAMERA_PARAM.lookAt);

    // ディレクショナルライト（平行光源）
    this.directionalLight = new THREE.DirectionalLight(
      ThreeApp.DIRECTIONAL_LIGHT_PARAM.color,
      ThreeApp.DIRECTIONAL_LIGHT_PARAM.intensity
    );
    this.directionalLight.position.copy(ThreeApp.DIRECTIONAL_LIGHT_PARAM.position);
    this.scene.add(this.directionalLight);

    // アンビエントライト（環境光）
    this.ambientLight = new THREE.AmbientLight(
      ThreeApp.AMBIENT_LIGHT_PARAM.color,
      ThreeApp.AMBIENT_LIGHT_PARAM.intensity,
    );
    this.scene.add(this.ambientLight);

    // - ジオメトリとマテリアルの初期化 ---------------------------------------
    this.material = new THREE.MeshLambertMaterial(ThreeApp.MATERIAL_PARAM);




    // - ボックスメッシュの配列を初期化 ---------------------------------------
    // this.geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    this.geometry = new THREE.BoxGeometry(0.01, 0.01, 0.01);






    this.boxes = [];
    for (let i = 0; i <= 102; i++) {
      const box = new THREE.Mesh(this.geometry, this.material);


      const icosahedronLine = new THREE.LineSegments(
        new THREE.EdgesGeometry(this.geometry), // 線を生成する元になるgeometry
        // new THREE.LineBasicMaterial({ color: 0x00ff99 }) // 線のmaterial
        new THREE.LineBasicMaterial({ color: 0xffdddd }) // 線のmaterial
      );
      box.add(icosahedronLine);



      if(i % 2 == 0) {
        box.position.x = 1;
      }

      if(i % 3 == 0) {
        box.position.x = -1;
      }
      if(i % 5 == 0) {
        box.position.y = -1;
      }
      if(i % 6 == 0) {
        box.position.y = 1;
      }
      if(i % 7 == 0) {
        box.position.x = -1;
      }
      if(i % 8 == 0) {
        box.position.x = 1;
      }
      if(i % 9 == 0) {
        box.position.z = -1;
      }
      if(i % 20 == 0) {
        box.position.z = 1;
      }


      const scale = 1 + i * 2;
      const rotate = 1 + i * 10;
      box.scale.set(scale, scale, scale);
      box.rotation.y = rotate;
      box.rotation.x = rotate;
      box.renderOrder = i; // 描画順序を設定
      this.scene.add(box);
      this.boxes.push(box);
    }

    // // 軸ヘルパー
    // const axesBarLength = 5.0;
    // this.axesHelper = new THREE.AxesHelper(axesBarLength);
    // this.scene.add(this.axesHelper);

    // コントロール
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.render = this.render.bind(this);

    // キーの押下状態を保持するフラグ
    this.isDown = false;
    this.scalingUp = true; // 初期状態ではスケーリングアップ
    window.addEventListener('keydown', (event) => {
      if (event.key === ' ') {
        this.isDown = true;
      }
    }, false);
    window.addEventListener('keyup', (event) => {
      if (event.key === ' ') {
        this.isDown = false;
      }
    }, false);

    // リサイズ時に canvas のサイズを変更
    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }, false);
  }

  render() {
    requestAnimationFrame(this.render);
    this.controls.update();
    if (this.isDown === true) {
      this.boxes.forEach((box) => {
        box.rotation.y += 0.01;



        if (this.scalingUp) {
          box.scale.x += 0.8;
          box.scale.y += 0.8;
          box.scale.z += 0.8;
          box.rotation.y += 0.01;

          if (box.scale.x >= 1.0) { 
            this.scalingUp = false;
          }
        } else {
          box.scale.x -= 0.9;
          box.scale.y -= 0.9;
          box.scale.z -= 0.9;
          box.rotation.y += -0.01;
          if (box.scale.x <= 0.5) { 
            this.scalingUp = true;
          }
        }
      });
    }
    this.renderer.render(this.scene, this.camera);
  }
}
