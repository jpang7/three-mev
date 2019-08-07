const WHITE = 0xFFFFFF;
const RED = 0xFF0109;
// const RED = 0xFC50F7;
// const RED = 0xF57B36;
// const RED = 0x4F854C;
const GREY = 0x52527A;

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ canvas });

//camera
const fov = 75;
const aspect = 2;
const near = 0.1;
const far = 50;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

//position
camera.position.z = 10;
camera.position.y = 3;

//scene

const scene = new THREE.Scene();
const clock = new THREE.Clock();

//light
const color = 0x000000;
const intensity = 0.5;
const light = new THREE.DirectionalLight(0xEEEE44, intensity);
const light2 = new THREE.DirectionalLight(0x2222FF, 0.5);
const light3 = new THREE.DirectionalLight(color, 0.3);
light.position.set(-1, 2, 4);
light2.position.set(3, 2, 4);
light3.position.set(0, 0, -1);
scene.add(light);
scene.add(light2);
scene.add(light3);


var light_amb = new THREE.AmbientLight(0x404055); // soft white light
scene.add(light_amb);

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

var tx_lst = [];
var bad_tx_lst = [];

let reset = false;
let a_reset = false;

let cubes = [];

var forks = [];
var surpassed = false;
var pass_y = 0;
var mev_blocks = [];

var state = "stable";

//post processing
var damp = 0.3;
var strength = 0.7;