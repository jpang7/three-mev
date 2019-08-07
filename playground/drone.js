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
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    //position
    camera.position.z = 7;
    camera.position.y = 0.5;

    //scene
    const scene = new THREE.Scene();
    // const clock = new THREE.Clock();

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

    var drones = [];

    function makeDrone(x,y,z) {
        var side = 0.1;
        var geometry = new THREE.BoxGeometry(side,side,side);
        var material = new THREE.MeshBasicMaterial({color: 0xFFFFFF});
        var mesh = new THREE.Mesh(geometry,material);
        mesh.position.x = x;
        mesh.position.y = y;
        mesh.position.z = z;
        scene.add(mesh);
        return mesh;
    }

    function Drone(x,y,z) {
        this.x =x;
        this.y = y;
        this.z = z;
        this.d = makeDrone(x,y,z);

        this.set = function (x,y,z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }

        this.update = function () {
            const speed = 0.1;
            let dist_x = Math.abs(this.d.position.x - this.x);
            let dist_y = Math.abs(this.d.position.y - this.y);
            let dist_z = Math.abs(this.d.position.z - this.z);
    
            let dir_x = (this.d.position.x < this.x) ? 1 : -1;
            let dir_y = (this.d.position.y < this.y) ? 1 : -1;
            let dir_z = (this.d.position.z < this.z) ? 1 : -1;
    
            this.d.position.x += Math.min(speed, dist_x) * dir_x;
            this.d.position.y += Math.min(speed, dist_y) * dir_y;
            this.d.position.z += Math.min(speed, dist_z) * dir_z;
        }
    }

    for (let i = 0; i < 30; i++){
        drones.push(new Drone(-3,0,0));
    }


    var count = 0;
    //render
    function render(time) {
        time *= 0.001;

        drones.forEach((d,ndx) => {
            d.set(
                -3 + Math.cos(time + ndx * 100),
                Math.cos(ndx + time) + Math.cos(time * 4),
                Math.sin(ndx + time))
            d.update();
        })
    

        if (resizeRendererToDisplaySize(renderer)) { //changes renderer size
            const canvas = renderer.domElement; // updates aspect based on window size
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);

        requestAnimationFrame(render); // this is a recursive call
    }
    requestAnimationFrame(render);
}

main();