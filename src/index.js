'use strict';

/* global THREE */
var THREE = require('three');

// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { AdditiveBlending } from 'three';

function main() {
    // ============= loader =============
    const loader = new FBXLoader();
    var honest_mixer;
    loader.load('../red_digging.fbx', function (object) {
        honest_mixer = new THREE.AnimationMixer(object);
        var action = honest_mixer.clipAction(object.animations[0]);
        action.play();
        object.scale.set(0.01, 0.01, 0.01);
        object.position.set(-4, -1, 0);

        object.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        // scene.add(object);
    }, undefined, function (e) {
        console.error(e);
    })

    var adversary_mixer;
    loader.load('../red_digging.fbx', function (object) {
        adversary_mixer = new THREE.AnimationMixer(object);
        var action = adversary_mixer.clipAction(object.animations[0]);
        action.play();
        object.scale.set(0.01, 0.01, 0.01);
        object.position.set(4, -1, 0);

        object.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        // scene.add(object);
    })


    // ============= post-processing =============
    const renderScene = new RenderPass(scene, camera);

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0;
    bloomPass.strength = strength;
    bloomPass.radius = 0;

    const filmPass = new FilmPass(
        0.35, 0.025, 648, false
    );
    filmPass.renderToScreen = true;

    const afterimagePass = new AfterimagePass();
    afterimagePass.uniforms["damp"].value = damp;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);

    // ============= render =============    
    let then = 0;
    function render(time) {
        time *= 0.001;
        const deltaTime = time - then;
        then = time;

        sub_render(time, honest_mixer, adversary_mixer);

        if (resizeRendererToDisplaySize(renderer)) { //changes renderer size
            const canvas = renderer.domElement; // updates aspect based on window size
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
            composer.setSize(canvas.width, canvas.height);
        }

        composer.render(deltaTime);
        requestAnimationFrame(render); // this is a recursive call
    }

    THREE.DefaultLoadingManager.onLoad = function () {
        requestAnimationFrame(render);
    }

}

main();