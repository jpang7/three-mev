if (!Detector.webgl) Detector.addGetWebGL.Message();
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;
var renderer, camera, scene, moverGroup, floorGeometry, floorMaterial, pointLight, pointLight2, pGeometry;
var FLOOR_RES = 60;
var FLOOR_HT = 650;
var stepCount = 0;
var noiseScale = 9.5;
var noiseSeed = Math.random() * 100;

var FLOOR_WIDTH = 3600;
var FLOOR_DEPTH = 4800;
var MOVE_SPD = 1.9;
var mouseX = 0;
var mouseY = 0;

//center of the screen
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerWidth / 2;

var snoise = new ImprovedNoise();
var textureLoader = new THREE.TextureLoader();