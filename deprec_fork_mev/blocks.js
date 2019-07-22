//block geometry
const blockWidth = 1;
const blockHeight = 1;
const blockDepth = 1;
const blockGeometry = new THREE.BoxGeometry(blockWidth, blockHeight, blockDepth);

const WHITE = 0xFFFFFF;
const RED = 0xFF0000;
const GREY = 0x52527A;

function makeBlock(color, y) {
    const material = new THREE.MeshPhongMaterial({ color });
    const block = new THREE.Mesh(blockGeometry, material);
    scene.add(block);
    block.position.y = y;
    return block;
}

function Block(c, y, mev) {
    this.b = makeBlock(c, y);
    this.x = this.b.position.x;
    this.y = y;
    this.mev = mev;

    this.become_canon = function () { this.b.material.color.setHex(WHITE) }
    this.become_invalid = function () { this.b.material.color.setHex(GREY) }
    this.offset_rotation = function () {
        dir = (Math.random() < 0.5) ? 1 : -1;
        this.b.rotateY(Math.random() * 0.5 * dir);
    }
    this.set_x = function (x) { this.b.position.x = x; }
    this.shift_x = function (x) { this.x = x; }
    this.shift_y = function (y) { this.y = y; }
    this.translate_y = function (y) { this.y += y; }
    this.update = function () {
        if (this.b.position.y < this.y) this.b.position.y += 0.1;
        else if (this.b.position.y > this.y) this.b.position.y -= 0.1;
        if (this.b.position.x < this.x) this.b.position.x += 0.1;
        else if (this.b.position.x > this.x) this.b.position.x -= 0.1;
    }
    this.vanish = function () {
        this.b.material.transparent = true;
        this.b.material.opacity = 0;
    }
    this.vibrate = function () {
        const speed = this.mev * 0.01;
        let pos = Math.random() < 0.5 ? 1 : -1;
        let dir = Math.random();
        if (dir < 0.33) this.b.rotateX(speed * Math.random() * pos);
        else if (dir < 0.66) this.b.rotateY(speed * Math.random() * pos);
        else this.b.rotateZ(speed * Math.random() * pos);
    }
}

function WhiteBlock(y, mev) { Block.call(this, WHITE, y, mev); }

function RedBlock(y, mev) {
    Block.call(this, RED, y, mev);
    this.coins = [];
    this.shift_x(2);
    this.set_x(2);
    this.shift_y = function (y) {
        this.y = y;
        this.shift_coins(y);
    }
    this.explode = function () {
        for (let i = 0; i < this.mev; i++) {
            let coin = new Coin(this.b.position.x, this.b.position.y);
            coin.c.position.z = 1;
            coin.c.rotation.x = 70;
            this.coins.push(coin);
        }
        this.coins.forEach((coin) => {
            coin.x += Math.random() * 3;
            coin.y += Math.random() * ((Math.random() < 0.5) ? 1 : -1);
        })
        return this.coins;
    }
    this.collect_coins = function (x, y) { this.coins.forEach((c) => c.target(x, y)) }
    this.shift_coins = function (y) { this.coins.forEach((c) => c.translate_y(y)) }
    this.always_coins = function (time) {
        this.coins.forEach((coin, ndx) => {
            coin.update();
            const speed = 1 + ndx * .01;
            const rot = time * speed;
            coin.c.rotation.x = rot;
            coin.c.rotation.y = rot;
        })
    }
    this.eat_coins = function () { this.coins.forEach((c) => c.vanish()) }
}

