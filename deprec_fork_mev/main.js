'use strict';

/* global THREE */

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

function main() {

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

    let c = new Chain();
    let s = new State(default_config, c);

    function render(time) {
        time *= 0.001;

        s.always(time);
        console.log(s.state)
        if (s.state == "stable") s.stable_blocks(time);
        else if (s.state == "unstable") s.unstable_blocks(time);
        else if (s.state == "fork") s.attacker_exploits(time);
        else if (s.state == "race") s.attacker_races(time);
        else if (s.state == "win") s.zoom_in();
        else if (s.state == "replace") s.replace();

        if (resizeRendererToDisplaySize(renderer)) { //changes renderer size
            const canvas = renderer.domElement; // updates aspect based on window size
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();