import * as THREE from '../lib/three.module.js';
import { OrbitControls } from '../lib/OrbitControls.js';
import { EffectComposer } from '../lib/EffectComposer.js';
import { RenderPass } from '../lib/RenderPass.js';
import { DotScreenPass } from '../lib/DotScreenPass.js';

window.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.querySelector('#webgl');
  const app = new ThreeApp(wrapper);
  app.render();
}, false);

class ThreeApp {
  static CAMERA_PARAM = {
    fovy: 65,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 20.0,
    position: new THREE.Vector3(0.0, 2.0, 5.0),
    lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
  };
  
  static RENDERER_PARAM = {
    clearColor: 0x000000,
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
    color: 0x000000,
    near: 1.0,
    far: 15.0,
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
      ThreeApp.CAMERA_PARAM.far
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
      ThreeApp.AMBIENT_LIGHT_PARAM.intensity
    );
    this.scene.add(this.ambientLight);
    
    this.material = new THREE.MeshPhongMaterial(ThreeApp.MATERIAL_PARAM);
    
    this.senpuki = new THREE.Group();
    this.scene.add(this.senpuki);
    
    this.pools = new THREE.Group();
    this.scene.add(this.pools);
    
    this.neck = new THREE.Group();
    this.scene.add(this.neck);
    
    this.wing = new THREE.Group();
    this.neck.add(this.wing);
    
    this.senpuki.add(this.neck);
    this.senpuki.add(this.pools);
    this.senpuki.position.y = 1.8;
    
    const radius = 0.8;
    const numPropellers = 4;
    
    for (let i = 0; i < numPropellers; i++) {
      const angle = (i / numPropellers) * 2 * Math.PI;
      const propellerGroup = new THREE.Group();
      const box = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.45, 0.01, 32),
        new THREE.MeshPhongMaterial({
          color: 0xffffff,
          opacity: 0.5,
          transparent: true,
        })
      );
      box.rotation.x = 0.6 * Math.PI;
      box.scale.set(2, 1.4, 1.4);
      propellerGroup.add(box);
      
      propellerGroup.rotation.z = angle;
      propellerGroup.position.set(radius * Math.cos(angle), radius * Math.sin(angle), 0.75);
      this.wing.add(propellerGroup);
    }

    const propellerneck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.3, 32),
      new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    propellerneck.rotation.x = 0.5 * Math.PI;
    propellerneck.position.z = 0.75;
    this.wing.add(propellerneck);
    
    const propellerneck2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.5, 32),
      new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    propellerneck2.rotation.x = 0.5 * Math.PI;
    propellerneck2.position.z = 0.4;
    this.wing.add(propellerneck2);
    
    const propellerneck3 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 1.2, 32),
      new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    propellerneck3.rotation.x = 0.5 * Math.PI;
    propellerneck3.position.z = -0.3;
    this.wing.add(propellerneck3);
    
    const numLines = 70;
    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * 2 * Math.PI;
      const coverLineGroup = new THREE.Group();
      const coverline = new THREE.Mesh(
        new THREE.TorusGeometry(1.9, 0.01, 12, 48),
        new THREE.MeshPhongMaterial({ color: 0xffffff })
      );
      coverline.rotation.x = 0.5 * Math.PI;
      coverLineGroup.add(coverline);
      coverLineGroup.rotation.z = angle;
      coverLineGroup.scale.z = 0.3;
      coverLineGroup.position.z = 0.8;
      this.neck.add(coverLineGroup);
    }

    const cover = new THREE.Mesh(
      new THREE.TorusGeometry(1.9, 0.05, 16, 20),
      new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    cover.position.z = 0.8;
    this.neck.add(cover);
    
    const covercenter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16),
      new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    covercenter.rotation.x = 0.5 * Math.PI;
    covercenter.position.z = 1.4;
    this.neck.add(covercenter);
    
    const pool = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 4, 32),
      new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    pool.position.y = -2;
    this.pools.add(pool);
    
    const pool2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.23, 3, 32),
      new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    pool2.position.y = -3;
    this.pools.add(pool2);
    
    const pool3 = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.3, 3),
      new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    pool3.position.y = -4.5;
    this.pools.add(pool3);
    
    const axesBarLength = 5.0;
    this.axesHelper = new THREE.AxesHelper(axesBarLength);
    this.scene.add(this.axesHelper);
    
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    
    this.senpuki.traverse((object) => {
      object.layers.set(1);
    });
    
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    
    const dotScreenPass = new DotScreenPass();
    dotScreenPass.enabled = false;
    this.composer.addPass(dotScreenPass);
    
    this.isRotating = false;
    
    window.addEventListener('keydown', (event) => {
      if (event.key === ' ') {
        this.isRotating = !this.isRotating;
        dotScreenPass.enabled = this.isRotating;
      }
    });
    
    window.addEventListener('resize', this.resize.bind(this), false);
    this.startTime = Date.now();
  }
  
  resize() {
    console.log('Resizing...');
    console.log('Window dimensions:', window.innerWidth, window.innerHeight);
    console.log('Renderer:', this.renderer);
    console.log('Camera:', this.camera);
  
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
  
  
  render() {
    requestAnimationFrame(this.render.bind(this));
    const nowTime = Date.now();
    const diffTime = (nowTime - this.startTime) / 1000;
    
    if (this.isRotating) {
      this.wing.rotation.z = diffTime * 2;
    }
    
    this.controls.update();
    this.composer.render();
  }
}
