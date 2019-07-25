'use strict';

/* global THREE */

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
    const clock = new THREE.Clock();
    const gl = canvas.getContext('experimental-webgl', { premultipliedAlpha: false });

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

    // SHADER STUFF HERE

    function vertexShader() {
        return `
            varying vec3 vUv;

            void main() {
                vUv = position;
                vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * modelViewPosition;
            }
        `
    }

    function fragmentShader() {
        return `
            uniform vec3 colorA;
            uniform vec3 colorB;
            varying vec3 vUv;

            void main() {
                gl_FragColor = vec4(mix(colorA,colorB,vUv.z), 1.0);
            }
        `
    }

    function buildBlock() {
        return `
            uniform float elapsed;
            uniform float y;
            varying vec3 vUv;

            void main() {
                gl_FragColor=vec4(1.,1.,1.,step(vUv.y,elapsed - y));
            }
        `
    }

    function fragmentShader1() { // Rainbow cube
        return `
            varying vec3 vUv;
            uniform vec3 colorA;
            uniform vec3 colorB;


            vec3 white = vec3(1.,1.,1.);

            void main() {

                gl_FragColor=vec4(mix(white,colorA,vUv.z),1.);
            }
        `
    }

    let sceneObjects = [];
    let start = 0;

    function addBuildCube(y) {
        start = Date.now();
        let uniforms = {
            elapsed: { type: 'f', value: 0.0 },
            y: { type: 'f', value: y }
        }
        let geometry = new THREE.BoxGeometry(1, 1, 1);
        let material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            fragmentShader: buildBlock(),
            vertexShader: vertexShader()
        })

        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = y;
        scene.add(mesh);
        sceneObjects.push(mesh);
    }

    function addExperimentalCube() {
        let uniforms = {
            colorB: { type: 'vec3', value: new THREE.Color(0xACB6E5) },
            colorA: { type: 'vec3', value: new THREE.Color(0x74ebd5) }
        }
        let geometry = new THREE.BoxGeometry(1, 1, 1);
        let material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            fragmentShader: fragmentShader1(),
            vertexShader: vertexShader()
        })

        let mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        sceneObjects.push(mesh);
    }

    addBuildCube(0);
    addBuildCube(-3)
    // addExperimentalCube();
    // addExperimentalCube();

    function render(time) {
        time *= 0.001;
        gl.enable(gl.BLEND);
        gl.blendEquation(gl.FUNC_ADD);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        let new_elapsed = (Date.now() - start) / 10000;

        sceneObjects[0].material.needsUpdate = true;
        sceneObjects[0].material.uniforms.elapsed.value = new_elapsed;

        if (resizeRendererToDisplaySize(renderer)) { //changes renderer size
            const canvas = renderer.domElement; // updates aspect based on window size
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);

        for (let object of sceneObjects) {
            // object.rotation.x += 0.01;
            object.rotation.y += 0.01;
        }
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
main();