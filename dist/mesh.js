const block_length = 1;
const block_geometry = new THREE.BoxGeometry(block_length, block_length, block_length);

const coin_texture = new THREE.TextureLoader().load('../gcoin.jpg');
const coin_radius_top = 0.12;
const coin_radius_bot = coin_radius_top;
const coin_glow_top = 0.17;
const coin_glow_bot = coin_glow_top;
const coin_height = 0.01;
const coin_glow_height = 0.04;
const coin_geometry = new THREE.CylinderGeometry(coin_radius_top, coin_radius_bot, coin_height, 32);
const coin_glow_geometry = new THREE.CylinderGeometry(coin_glow_top, coin_glow_bot, coin_glow_height, 32);
const coin_material = new THREE.MeshStandardMaterial({
    color: 0xFFD700,
    map: coin_texture
})