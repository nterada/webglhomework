import * as THREE from '../lib/three.module.js';
import { OrbitControls } from '../lib/OrbitControls.js';

window.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.querySelector('#webgl');
  const app = new ThreeApp(wrapper);
  app.startRendering();
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
    clearColor: 0x666666,
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
    color: 0xEEDCB3,
  };

  constructor(wrapper) {
    const color = new THREE.Color(ThreeApp.RENDERER_PARAM.clearColor);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(color);
    this.renderer.setSize(ThreeApp.RENDERER_PARAM.width, ThreeApp.RENDERER_PARAM.height);
    wrapper.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      ThreeApp.CAMERA_PARAM.fovy,
      ThreeApp.CAMERA_PARAM.aspect,
      ThreeApp.CAMERA_PARAM.near,
      ThreeApp.CAMERA_PARAM.far,
    );
    this.camera.position.copy(ThreeApp.CAMERA_PARAM.position);
    this.camera.lookAt(ThreeApp.CAMERA_PARAM.lookAt);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

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

    this.isHiInitialized = false;

    this.loadTexturesAndObjects();

    this.render = this.render.bind(this);
    this.isDown = false;

    window.addEventListener('keydown', (keyEvent) => {
      switch (keyEvent.key) {
        case ' ':
          this.isDown = true;
          break;
        default:
      }
    }, false);

    window.addEventListener('keyup', (keyEvent) => {
      this.isDown = false;
    }, false);

    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    }, false);
  }

  loadTexturesAndObjects() {
    const loader = new THREE.TextureLoader();

    loader.load('habu_gray.jpg', (texture) => {
      this.scene.background = texture;
    });

    const boxCountX = 9;
    const boxCountZ = 9;
    const spacer = 0.51;
    const offsetX = boxCountX * spacer / 2;
    const offsetZ = boxCountZ * spacer / 2;

    this.boxGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    this.boxArray = [];

    loader.load('mokume.png', (texture2) => {
      this.material = new THREE.MeshLambertMaterial({ map: texture2 });

      for (let i = 0; i < boxCountX; i++) {
        for (let j = 0; j < boxCountZ; j++) {
          const box = new THREE.Mesh(this.boxGeometry, this.material);
          const icosahedronLine = new THREE.LineSegments(
            new THREE.EdgesGeometry(this.boxGeometry),
            new THREE.LineBasicMaterial({ color: 0x573f2c })
          );

          box.position.x = i * spacer - offsetX;
          box.position.z = j * spacer - offsetZ;
          box.position.y = -3;
          box.add(icosahedronLine);
          this.scene.add(box);
          this.boxArray.push(box);
        }
      }
    });

    const numberOfClones = 7;
    loader.load('ho.png', (texture3) => {
      const texho = new THREE.MeshBasicMaterial({ map: texture3 });

      for (let i = 0; i < numberOfClones; i++) {
        const ho = new THREE.Mesh(this.boxGeometry, texho);

        ho.position.x = (Math.random() - 0.5) * 8 * spacer;
        ho.position.z = (Math.random() - 0.5) * 8 * spacer;
        ho.position.y = -2.75;
        ho.scale.y = 0.1;

        this.scene.add(ho);
      }
    });

    loader.load('hi.png', (texture4) => {
      const texhi = new THREE.MeshBasicMaterial({ map: texture4 });
      this.hi = new THREE.Mesh(this.boxGeometry, texhi);

      this.hi.position.y = -2.75;
      this.hi.position.x = 0.25;
      this.hi.position.z = 0.25;
      this.hi.scale.y = 0.1;

      this.scene.add(this.hi);
      this.isHiInitialized = true;
    });

    loader.load('hbo1.jpg', (texture7) => {
      const texoyt1 = new THREE.MeshBasicMaterial({ map: texture7 });
      this.boxGeometry2 = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const oyt1 = new THREE.Mesh(this.boxGeometry2, texoyt1);

      // this.scene.add(oyt1);

      const torusCount = 8;
      const transformScale = 6.0;
      this.oyt1Array = [];
      for (let i = 0; i < torusCount; ++i) {
        const newOyt1 = new THREE.Mesh(this.boxGeometry2, texoyt1);
        newOyt1.position.x = (Math.random() * 2.0 - 1.0) * transformScale;
        newOyt1.position.y = (Math.random() * 2.0) * transformScale;
        newOyt1.position.z = (Math.random() * 2.0 - 1.0) * transformScale;
        newOyt1.scale.set(1, 1, 1);
        this.scene.add(newOyt1);
        this.oyt1Array.push(newOyt1);
      }
    });

    loader.load('oyt3.png', (texture8) => {
      const texoyt2 = new THREE.MeshBasicMaterial({ map: texture8 });
      this.boxGeometry2 = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const oyt1 = new THREE.Mesh(this.boxGeometry2, texoyt2);


      const torusCount = 8;
      const transformScale = 6.0;
      this.oyt2Array = [];
      for (let i = 0; i < torusCount; ++i) {
        const newOyt3 = new THREE.Mesh(this.boxGeometry2, texoyt2);
        newOyt3.position.x = (Math.random() * 2.0 - 1.0) * transformScale;
        newOyt3.position.y = (Math.random() * 2.0) * transformScale;
        newOyt3.position.z = (Math.random() * 2.0 - 1.0) * transformScale;
        newOyt3.scale.set(2, 2, 2);
        this.scene.add(newOyt3);
        this.oyt2Array.push(newOyt3);
      }
    });

    loader.load('oyt5.png', (texture9) => {
      const texoyt3 = new THREE.MeshBasicMaterial({ map: texture9 });
      this.boxGeometry2 = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const oyt3 = new THREE.Mesh(this.boxGeometry2, texoyt3);


      const torusCount = 1;
      const transformScale = 6.0;
      this.oyt3Array = [];
      for (let i = 0; i < torusCount; ++i) {
        const newOyt3 = new THREE.Mesh(this.boxGeometry2, texoyt3);
        newOyt3.position.x = (Math.random() * 2.0 - 1.0) * transformScale;
        newOyt3.position.y = (Math.random() * 2.0) * transformScale;
        newOyt3.position.z = (Math.random() * 2.0 - 1.0) * transformScale;
        newOyt3.scale.set(1, 1, 1);
        this.scene.add(newOyt3);
        this.oyt3Array.push(newOyt3);
      }
    });

    // loader.load('oyt4.png', (texture10) => {
    //   const texoyt4 = new THREE.MeshBasicMaterial({ map: texture10 });
    //   this.boxGeometry2 = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    //   // const newOyt4 = new THREE.Mesh(this.boxGeometry2, texoyt4);
  
  
    //   const torusCount = 3;
    //   const transformScale = 6.0;
    //   this.oyt4Array = [];
    //   for (let i = 0; i < torusCount; ++i) {
    //     const newOyt4 = new THREE.Mesh(this.boxGeometry2, texoyt4);
    //     newOyt4.position.x = (Math.random() * 2.0 - 1.0) * transformScale;
    //     newOyt4.position.y = (Math.random() * 2.0) * transformScale;
    //     newOyt4.position.z = (Math.random() * 2.0 - 1.0) * transformScale;
    //     newOyt4.scale.set(2, 2, 2);
    //     this.scene.add(newOyt4);
    //     this.oyt4Array.push(newOyt4);
    //   }
    // });
  }



  startRendering() {
    if (this.isHiInitialized) {
      this.render();
    } else {
      setTimeout(this.startRendering.bind(this), 100);
    }
  }

  render() {
    requestAnimationFrame(this.render);

    this.controls.update();

    if (this.isDown) {
      this.oyt1Array.forEach((oyt1) => {
        oyt1.rotation.y += 0.05;
      });
      this.oyt2Array.forEach((oyt2) => {
        oyt2.rotation.y += 0.05;
      });
      if (this.hi) {
        this.hi.position.z -= 0.01;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}
