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

    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    function render(time) {
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();