const coin_texture = new THREE.TextureLoader().load('gcoin.jpg');
const radius_top = 0.1;
const radius_bot = 0.1;
const height = 0.01;
const r_segments = 100;
const coin_geometry = new THREE.CylinderGeometry(
    radius_top, radius_bot, height, r_segments);

function makeCoin(x, y) {
    const material = new THREE.MeshStandardMaterial({
        color: 0xFFD700,
        map: coin_texture
    })
    const coin = new THREE.Mesh(coin_geometry, material);
    coin.position.x = x;
    coin.position.y = y;
    scene.add(coin);
    return coin;
}

function Coin(x, y) {
    this.c = makeCoin(x, y);
    this.x = x;
    this.y = y;

    this.translate_y = function (y) { this.y += y; }
    this.shift_y = function (y) { this.y = y; }
    this.target = function (x, y) {
        this.x = x;
        this.y = y;
    }
    this.update = function () {
        if (this.c.position.y < this.y) this.c.position.y += 0.1;
        else if (this.c.position.y > this.y) this.c.position.y -= 0.1;
        if (this.c.position.x < this.x) this.c.position.x += 0.1;
        else if (this.c.position.x > this.x) this.c.position.x -= 0.1;
    }
    this.vanish = function () {
        this.c.material.transparent = true;
        this.c.material.opacity = 0;
    }

}