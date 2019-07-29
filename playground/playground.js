'use strict';

// import { TranslucentShader } from "./TranslucentShader";

// var THREE = require('three');

function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ canvas });

    //camera
    const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 8;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    //position
    camera.position.z = 7;
    camera.position.y = 0.5;

    //scene
    const scene = new THREE.Scene();

    //light
    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        const light2 = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        light2.position.set(3, 2, 4);
        scene.add(light);
        scene.add(light2);
    }

    const fragmentShader = `
    #include <common>
  
    uniform vec3 iResolution;
    uniform float iTime;
    uniform sampler2D iChannel0;
  
    // By Daedelus: https://www.shadertoy.com/user/Daedelus
    // license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
    #define TIMESCALE 0.25 
    #define TILES 3
    #define COLOR 0.7, 1.6, 1.
  
    void mainImage( out vec4 fragColor, in vec2 fragCoord )
    {
      vec2 uv = fragCoord.xy / iResolution.xy;
      uv.x *= iResolution.x / iResolution.y;
      
    //   vec4 noise = texture2D(iChannel0, floor(uv * float(TILES)) / float(TILES));
    vec4 noise = texture2D(iChannel0, uv * float(TILES));
    //   vec4 noise = texture2D(iChannel0,uv);
      float p = 1.0 - mod(noise.r + noise.g + noise.b + iTime * float(TIMESCALE), 1.0);
    //   float p = 1.0 - noise.r + noise.g + noise.b + iTime * float(TIMESCALE);

      p = min(max(p * 3.0 - 1.8, 0.1), 2.0);
      
      vec2 r = mod(uv * float(TILES), 1.0);
      r = vec2(pow(r.x - 0.01, 2.0), pow(r.y - 0.01, 2.0));
    //   p *= 1.0 - pow(min(1.0, 12.0 * dot(r,r)), 2.0);
    //   vec3 c = vec3(random(1.));
    //   fragColor = vec4(COLOR, 1.0) * p;

    vec3 c = vec3(uv.x + uv.y + 0.3,uv.y + 0.3,uv.x + 0.3);
	fragColor = vec4(c, 1.0) * p;
    }
  
    varying vec2 vUv;
  
    void main() {
      mainImage(gl_FragColor, vUv * iResolution.xy);
    }
    `;
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `;

    const loader = new THREE.TextureLoader();
    const texture = loader.load('https://threejsfundamentals.org/threejs/resources/images/bayer.png');
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    const uniforms = {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector3(1, 1, 1) },
        iChannel0: { value: texture },
    };
    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
    });
    //block geometry
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    let mirrorCamera = new THREE.CubeCamera(near, far, 512);
    scene.add(mirrorCamera);

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    function makeInstance(geometry, color, y) {
        // const material = new THREE.MeshPhongMaterial({ color });
        // const material = new THREE.MeshPhongMaterial({
        //     color: color, specular: 0x050505, shininess: 100, reflectivity: 100
        // })
        // const material = new THREE.MeshBasicMaterial({ envMap: mirrorCamera.texture })
        // const material = shader_material;
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
        cube.position.y = y;
        return cube;
    }

    const WHITE = 0xFFFFFF;
    const RED = 0xFF0000;
    const GREY = 0x52527A;

    function white_block(y) { return makeInstance(geometry, WHITE, y) }
    function red_block(y) { return makeInstance(geometry, RED, y) }

    let cubes = [
        { b: white_block(-3), y: -3, mev: 0 },
        { b: white_block(-1.5), y: -1.5, mev: 0 },
        { b: white_block(0), y: 0, mev: 0 },
        { b: white_block(1.5), y: 1.5, mev: 0 },
        { b: white_block(3), y: 3, mev: 0 },
        { b: white_block(4.5), y: 4.5, mev: 0 },
    ]

    function adjust_cube(c) {
        let cube = c.b;
        let dir = (Math.random() < 0.5) ? 1 : -1;
        // cube.rotateX(Math.random() * 0.5 * dir);
        cube.rotateY(Math.random() * 0.5 * dir);
        // cube.rotateZ(Math.random() * 0.5 * dir);
    }

    cubes.forEach((cube) => {
        adjust_cube(cube);
    });

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const width = canvas.clientWidth * pixelRatio | 0;
        const height = canvas.clientHeight * pixelRatio | 0;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    //render
    function render(time) {
        time *= 0.001;


        uniforms.iTime.value = time;

        mirrorCamera.update(renderer, scene);

        if (resizeRendererToDisplaySize(renderer)) { //changes renderer size
            const canvas = renderer.domElement; // updates aspect based on window size
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        cubes.forEach((cube, ndx) => {
            const speed = 1 + ndx * .01;
            const rot = time * speed;
            cube.b.rotation.y = rot;
        });

        cubes.forEach((cube) => {
            if (cube.mev != 0) vibrate(cube);
        });

        renderer.render(scene, camera);

        requestAnimationFrame(render); // this is a recursive call
    }
    requestAnimationFrame(render);

    function vibrate(c) {
        let cube = c.b;
        let mev = c.mev;
        const speed = mev * 0.01;
        let pos = Math.random() < 0.5 ? 1 : -1;
        let dir = Math.random();
        if (dir < 0.33) {
            cube.rotateX(speed * Math.random() * pos);
        } else if (dir < 0.66) {
            cube.rotateY(speed * Math.random() * pos);
        } else {
            cube.rotateZ(speed * Math.random() * pos);
        }
    }

}

main();