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
                // child.material.map = glow_material;
                // child.material.needsUpdate = true;
            }
        });
        scene.add(object);
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
        scene.add(object);
    })


    // ============= post-processing =============
    const renderScene = new RenderPass(scene, camera);
    const renderScene2 = new RenderPass(scene2, camera);
    // renderScene.renderToScreen = true;
    // renderScene.clear = false;
    // renderScene.clearDepth = true;
    // renderScene2.renderToScreen = true;
    // renderScene2.clear = false;
    // renderScene2.clearDepth = true;

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

    const blendPass = new ShaderPass(AdditiveBlending);

    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    // composer.addPass(renderScene2);
    // composer.addPass(bloomPass);
    // composer.addPass(filmPass);
    // composer.addPass(afterimagePass);

    afterim.composer = new EffectComposer(renderer);
    afterim.composer.addPass(renderScene2);
    afterim.composer.addPass(afterimagePass);

    const colorShader = {
        uniforms: {
            tDiffuse: { value: null },
            color: { value: new THREE.Color(0x88CCFF) },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          uniform sampler2D tDiffuse;
          varying vec2 vUv;
          void main() {
            vec4 previousPassColor = texture2D(tDiffuse, vUv);
            gl_FragColor = vec4(
                previousPassColor.rgb * color,
                previousPassColor.a);
          }
        `,
    };

    const colorPass = new ShaderPass(colorShader);
    colorPass.renderToScreen = true;

    normal.composer = new EffectComposer(renderer);
    normal.composer.addPass(renderScene);
    normal.composer.addPass(bloomPass);
    normal.composer.addPass(colorPass);
    // normal.composer.addPass(afterimagePass);
    // normal.composer.addPass(filmPass);


    // const composer2 = new EffectComposer(renderer2);
    // composer2.addPass(renderScene2);
    // composer2.addPass(afterimagePass);

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
            normal.composer.setSize(canvas.width, canvas.height);
        }


        // afterim.composer.render(deltaTime);
        normal.composer.render(deltaTime);
        // composer.clear = false;
        // composer2.render(deltaTime);
        // composer2.clear = true;

        requestAnimationFrame(render); // this is a recursive call
    }

    THREE.DefaultLoadingManager.onLoad = function () {
        requestAnimationFrame(render);
    }

}

main();