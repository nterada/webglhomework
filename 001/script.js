import * as THREE from '../lib/three.module.js';
import { OrbitControls } from '../lib/OrbitControls.js';
import { EffectComposer } from '../lib/EffectComposer.js';
import { RenderPass } from '../lib/RenderPass.js';
import { GlitchPass } from '../lib/GlitchPass.js';
import { DotScreenPass } from '../lib/DotScreenPass.js';

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
    clearColor: 0xffdbed,
    width: window.innerWidth,
    height: window.innerHeight,
  };

  static DIRECTIONAL_LIGHT_PARAM = {
    color: 0xffdbed,
    intensity: 1.0,
    position: new THREE.Vector3(1.0, 1.0, 1.0),
  };

  static AMBIENT_LIGHT_PARAM = {
    color: 0xffdbed,
    intensity: 0.1,
  };

  static MATERIAL_PARAM = {
    color: 0x3399ff,
  };

  static FOG_PARAM = {
    color: 0xffdbed,
    near: 1.0,
    far: 15.0
  };


  composer;         // エフェクトコンポーザー
  renderPass;       // レンダーパス
  glitchPass;       // グリッチパス
  dotScreenPass;    // ドットスクリーンパス @@@

  constructor(wrapper) {
    const color = new THREE.Color(ThreeApp.RENDERER_PARAM.clearColor);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(color);
    this.renderer.setSize(ThreeApp.RENDERER_PARAM.width, ThreeApp.RENDERER_PARAM.height);
    wrapper.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    // this.scene.fog = new THREE.Fog(
    //   ThreeApp.FOG_PARAM.color,
    //   ThreeApp.FOG_PARAM.near,
    //   ThreeApp.FOG_PARAM.far
    // );

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

    this.senpuki = new THREE.Group();
    this.scene.add(this.senpuki);
    // this.wing.position.z = 1;

    this.pools = new THREE.Group();
    this.scene.add(this.pools);

    this.neck = new THREE.Group();
    this.scene.add(this.neck);
    
    this.wing = new THREE.Group();
    this.neck.add(this.wing);

    this.senpuki.add(this.neck);
    this.senpuki.add(this.pools);
    this.senpuki.position.y = 1.8;
    // this.wing.scale.z = 0.1;
    // this.wing.position.z = 0;

    const radius = .8;
    const propellerLength = 4;
    const boxSizeX = 1;
    const boxSizeY = 0.8;
    const boxSizeZ = 0.01;
    // const numBoxes = 1; // 一つのプロペラを構成するボックスの数
    const numPropellers = 4; // プロペラの数

    for (let i = 0; i < numPropellers; i++) {
      const angle = (i / numPropellers) * 2 * Math.PI;
      
      // プロペラグループの作成
      const propellerGroup = new THREE.Group();
      const box = new THREE.Mesh(
        // new THREE.BoxGeometry(boxSizeX, boxSizeY, boxSizeZ),
        // new THREE.TorusGeometry( 0.21, 0.22, 2, 50 ),
        // new THREE.TorusGeometry( 0.2, 0.22, 2, 100 ),
        new THREE.CylinderGeometry( .4, .45, 0.01, 32 ),
        new THREE.MeshPhongMaterial({ color: 0xffffff })
      );

      box.rotation.x = 0.6*Math.PI;

      box.scale.x = 2;
      // box.scale.y = 1.2;
      box.scale.y = 1.4;
      box.scale.z = 1.4;
      // box.
      // box.rotation.x = .3;
  

      // const boxAngle = 1 * Math.PI;
      // box.position.x = (propellerLength / 2) * Math.cos(boxAngle);
      // box.position.y = (propellerLength / 4) * Math.sin(boxAngle);
      propellerGroup.add(box);

      // プロペラグループの配置
      propellerGroup.rotation.z = angle;
      propellerGroup.position.x = radius * Math.cos(angle);
      propellerGroup.position.y = radius * Math.sin(angle);

      propellerGroup.position.z = .75;

      this.wing.add(propellerGroup);
    }

    const propellerneck = new THREE.Mesh(
      new THREE.CylinderGeometry( .3, .3, .3, 32 ),
      new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    propellerneck.rotation.x = 0.5*Math.PI;
    propellerneck.position.z = .75;

    this.wing.add(propellerneck);


    const propellerneck2 = new THREE.Mesh(
      new THREE.CylinderGeometry( .1, .1, .5, 32 ),
      new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    propellerneck2.rotation.x = 0.5*Math.PI;
    // propellerneck2.position.z = -.2;
    propellerneck2.position.z = .4;

    this.wing.add(propellerneck2);

    
    const propellerneck3 = new THREE.Mesh(
      new THREE.CylinderGeometry( .5, .5, 1.2, 32 ),
      new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    propellerneck3.rotation.x = 0.5*Math.PI;
    propellerneck3.position.z = -.3;

    this.wing.add(propellerneck3);


    const numLines = 70; // プロペラの数

    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * 2 * Math.PI;

      // プロペラグループの作成
      const coverLineGroup = new THREE.Group();
      const coverline  = new THREE.Mesh(
        // new THREE.CylinderGeometry( 0.001, .02, 4, 32 ),
        new THREE.TorusGeometry(1.9, 0.01, 12, 48),
        new THREE.MeshPhongMaterial({ color: 0xffffff })
      );
      coverline.rotation.x = 0.5*Math.PI;

      coverLineGroup.add(coverline);

      // プロペラグループの配置
      coverLineGroup.rotation.z = angle;
      coverLineGroup.scale.z = 0.3;
      coverLineGroup.position.z = 0.8;
      // coverLineGroup.rotation.x = angle;
      // coverLineGroup.position.x = radius * Math.cos(angle);
      // coverLineGroup.position.y = radius * Math.sin(angle);

      this.neck.add(coverLineGroup);
    }

    const cover = new THREE.Mesh(
      // new THREE.BoxGeometry(dotSize, dotSize, dotSize),
      new THREE.TorusGeometry( 1.9, .05, 16, 20 ),
      new THREE.MeshPhongMaterial({ color: 0xffffff })
    );

    cover.position.z = 0.8;
    this.neck.add(cover);


    const covercenter = new THREE.Mesh(
      // new THREE.BoxGeometry(dotSize, dotSize, dotSize),
      new THREE.CylinderGeometry( .5, .5, .1,16 ),
      new THREE.MeshPhongMaterial({ color: 0xffffff })
    );

    covercenter.rotation.x = 0.5*Math.PI;
    covercenter.position.z = 1.4;
    this.neck.add(covercenter);


    const pool = new THREE.Mesh(
      // new THREE.BoxGeometry(dotSize, dotSize, dotSize),
      new THREE.CylinderGeometry( .1, .1, 4, 32 ),  
      new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    pool.position.y = -2;
    this.pools.add(pool);

    const pool2 = new THREE.Mesh(
      // new THREE.BoxGeometry(dotSize, dotSize, dotSize),
      new THREE.CylinderGeometry( .13, .23, 3, 32 ),  
      new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    pool2.position.y = -3;
    this.pools.add(pool2);

    const pool3 = new THREE.Mesh(
      // new THREE.BoxGeometry(dotSize, dotSize, dotSize),
      new THREE.BoxGeometry( 3, .3, 3),  
      new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    pool3.position.y = -4.5;
    this.pools.add(pool3);

    const axesBarLength = 5.0;
    this.axesHelper = new THREE.AxesHelper(axesBarLength);
    this.scene.add(this.axesHelper);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);




    // コンポーザーの設定 @@@
    // 1. コンポーザーにレンダラを渡して初期化する
    this.composer = new EffectComposer(this.renderer);
    // 2. コンポーザーに、まず最初に「レンダーパス」を設定する
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);
    // 3. コンポーザーに第２のパスとして「グリッチパス」を設定する
    // this.glitchPass = new GlitchPass();
    // this.composer.addPass(this.glitchPass);
    // 4. コンポーザーに第３のパスとして「ドットスクリーンパス」を設定する
    this.dotScreenPass = new DotScreenPass();
    this.composer.addPass(this.dotScreenPass);
    // 5. パスの追加がすべて終わったら画面に描画結果を出すよう指示する
    this.dotScreenPass.renderToScreen = true;










    this.render = this.render.bind(this);

    this.isRotating = false;
    this.wingRotationSpeed = 0;
    this.maxWingRotationSpeed = 0.3;
    this.neckRotationSpeed = 0;
    this.maxNeckRotationSpeed = 0.01;

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
      if (this.neckRotationSpeed < this.maxNeckRotationSpeed) {
        this.neckRotationSpeed += 0.001;
      }
    } else {
      if (this.wingRotationSpeed > 0) {
        this.wingRotationSpeed -= 0.01 * this.easeOutQuad(this.wingRotationSpeed / this.maxWingRotationSpeed);
      } else {
        this.wingRotationSpeed = 0;
      }
      if (this.neckRotationSpeed > 0) {
        this.neckRotationSpeed -= 0.001 * this.easeOutQuad(this.neckRotationSpeed / this.maxNeckRotationSpeed);
      } else {
        this.neckRotationSpeed = 0;
      }
    }

    this.wing.rotation.z += this.wingRotationSpeed;

    this.neck.rotation.y += this.neckRotationSpeed * this.neckRotationDirection;
    if (this.neck.rotation.y > Math.PI / 4) {
      this.neckRotationDirection = -1;
    } else if (this.neck.rotation.y < -Math.PI / 4) {
      this.neckRotationDirection = 1;
    }

    // this.renderer.render(this.scene, this.camera);
    this.composer.render();
  }
}
