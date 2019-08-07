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
    camera.position.z = 1;
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

    // =========== proton stuff ============
    var proton, emitter1;


    function createMesh() {
        var map = new THREE.TextureLoader().load("./dot4.png");
        var material = new THREE.SpriteMaterial({
            map: map,
            color: "#ff0000",
            blending: THREE.AdditiveBlending,
            fog: true
        });
        return new THREE.Sprite(material);
    }
    
    function createEmitter(obj) {
        var emitter = new Proton.Emitter();
        emitter.rate = new Proton.Rate(new Proton.Span(10,20), new Proton.Span(.01,.1));
        // emitter.addInitialize(new Proton.Mass(1));
        // emitter.addInitialize(new Proton.Radius(0.01));
        emitter.addInitialize(new Proton.Life(1,3));
        emitter.addInitialize(new Proton.Body(obj.Body));
        // emitter.addInitialize(new Proton.Position(new Proton.SphereZone(0.01)));
        emitter.addInitialize(new Proton.Velocity(0.001, new Proton.Vector3D(0,1,0), 0));
        emitter.addBehaviour(new Proton.RandomDrift(0.001,0.001,0.001, 0.1));
        // emitter.addBehaviour(new Proton.Rotate("random", "random"));
        emitter.addBehaviour(new Proton.Scale(new Proton.Span(0.01,0.1), 0));
        // emitter.addBehaviour(new Proton.Gravity(-0.0001));
        emitter.addBehaviour(new Proton.Color('#ff0026', ['#ffff00', '#ffff11'], Infinity, Proton.easeOutSine));

        emitter.p.x = obj.p.x;
        emitter.p.y = obj.p.y;
        emitter.emit();
        return emitter;
    }

    function initProton() {
        proton = new Proton();
        emitter1 = createEmitter({
            p: {
                x: 0, y: 0
            },
            Body: createMesh()
        });
        proton.addEmitter(emitter1);
        proton.addRender(new Proton.MeshRender(scene));
    }
    
    initProton();

    //render
    function render(time) {
        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) { //changes renderer size
            const canvas = renderer.domElement; // updates aspect based on window size
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        // proton.emitters[0].p.x = Math.sin(time);
        proton.emitters[0].p.y = Math.abs(Math.sin(time)) * 0.5;

        proton.update();

        renderer.render(scene, camera);

        requestAnimationFrame(render); // this is a recursive call
    }
    requestAnimationFrame(render);
}

main();