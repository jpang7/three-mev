function Tx(x, y, z, color) {
    this.t = makeTx(color, x, y);
    this.x = x;
    this.y = y;
    this.z = z;
    this.r_x = x;
    this.r_y = y;
    this.r_z = z;
    this.ut = 0;

    this.update = function (time) {
        const speed = 0.33;
        if (this.ut < time) {
            let dist_x = Math.abs(this.t.position.x - this.x);
            let dist_y = Math.abs(this.t.position.y - this.y);
            let dist_z = Math.abs(this.t.position.z - this.z);

            let dir_x = (this.t.position.x < this.x) ? 1 : -1;
            let dir_y = (this.t.position.y < this.y) ? 1 : -1;
            let dir_z = (this.t.position.z < this.z) ? 1 : -1;

            this.t.position.x += Math.min(speed, dist_x) * dir_x;
            this.t.position.y += Math.min(speed, dist_y) * dir_y;
            this.t.position.z += Math.min(speed, dist_z) * dir_z;
        }
    }

    this.aligned = function () {
        return ((this.t.position.x == this.x) &
            (this.t.position.y == this.y) &
            (this.t.position.z == this.z))
    }

    this.vanish = function () {
        this.t.material.transparent = true;
        this.t.material.opacity = 0;
    }

    this.reset = function () {
        this.x = this.r_x;
        this.y = this.r_y;
        this.z = this.r_z;
        this.t.position.x = this.r_x;
        this.t.position.y = this.r_y;
        this.t.position.z = this.r_z;
    }

    this.appear = function () {
        this.t.material.opacity = 100;
    }
}

function InitTx() {
    Tx.call(this, -4.5, 0, 0, WHITE);
}

function BadTx() {
    Tx.call(this, 4.5, 0, 0, RED);
}

for (let i = 0; i < 27; i++) {
    tx_lst.push(new InitTx());
}

for (let i = 0; i < 27; i++) {
    bad_tx_lst.push(new BadTx());
}

bad_tx_lst.forEach((t) => t.vanish());

function makeTx(color, x, y) {
    const boxWidth = 0.33;
    const boxHeight = 0.33;
    const boxDepth = 0.33;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    const material = new THREE.MeshPhongMaterial({ color });
    const tx = new THREE.Mesh(geometry, material);
    tx.position.x = x;
    tx.position.y = y;
    scene.add(tx);
    return tx;
}

// ============= block classes =============    

//block geometry
const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

function makeInstance(geometry, color, y) {
    // const material = new THREE.MeshPhongMaterial({ color });
    const material = new THREE.MeshStandardMaterial({color});
    // const material = colored_material(color);
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    cube.position.y = y;
    return cube;
}

// Block class + methods
function Block(color, y, mev) {
    this.b = makeInstance(geometry, color, y);
    this.mev = mev;
    this.y = y;

    // Create a small tilt that distinguishes each block
    this.adjust_cube = function () {
        let dir = (Math.random() < 0.5) ? 1 : -1;
        this.b.rotateY(Math.random() * 0.5 * dir);
    }

    // Translate block to [this.y]
    this.move_cube_up = function () {
        if (this.b.position.y <= this.y) this.b.position.y += 0.1;
    }

    // Create a vibrating effect
    this.vibrate = function () {
        const speed = this.mev * 0.01;
        let pos = Math.random() < 0.5 ? 1 : -1;
        let dir = Math.random();
        if (dir < 0.33) {
            this.b.rotateX(speed * Math.random() * pos);
        } else if (dir < 0.66) {
            this.b.rotateY(speed * Math.random() * pos);
        } else {
            this.b.rotateZ(speed * Math.random() * pos);
        }
    }

    this.appear = function () {
        this.b.material.opacity = 100;
        this.b.material.transparent = false;
    }

    // Visibly disappear
    this.vanish = function () {
        this.b.material.transparent = true;
        this.b.material.opacity = 0;
    }

    this.change_color = function (color) {
        this.b.material.color.setHex(color);
    }
}

function WhiteBlock(y, mev) {
    Block.call(this, WHITE, y, mev);
}

// Red Blocks explode coins
function RedBlock(y, mev) {
    Block.call(this, RED, y, mev);
    this.coins = [];
    // Generate coins based on [this.mev]
    this.spawn = function () {
        for (let i = 0; i < this.mev; i++) {
            let nc = new Coin(this.b.position.x, this.b.position.y);
            nc.c.position.z = 1;
            nc.c.rotation.x = 70;
            this.coins.push(nc);
        }
    }
    // Explode coins in different directions
    this.explode = function () {
        this.coins.forEach((c) => c.drift());
        this.mev = 0;
    }
    // Assign all coins to a single location
    this.set_coins = function (x, y) {
        this.coins.forEach((c) => {
            c.x = x;
            c.y = y;
        })
    }

    this.shift_coins = function (y) {
        this.coins.forEach((c) => c.y += y);
    }

    this.update_coins = function () {
        this.coins.forEach((c) => c.update());
    }

    this.vanish_coins = function () {
        this.coins.forEach((c) => c.disappear());
    }

    this.spin_coins = function (time) {
        this.coins.forEach((coin, ndx) => {
            const speed = 1 + ndx * .01;
            const rot = time * speed;
            coin.c.rotation.x = rot;
            coin.c.rotation.y = rot;
        });
    }
}

// ============= coin classes =============    

// coin class + methods
const coin_texture = new THREE.TextureLoader().load('../gcoin.jpg');
const radius_top = 0.12;
const radius_bot = 0.12;
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
    // Go in a random direction to the right
    this.drift = function () {
        this.x += Math.random() * 3;
        this.y += Math.random() * ((Math.random() < 0.5) ? 1 : -1);
    }
    // Translate to ([this.x], [this.y])
    this.update = function (time) {
        const speed = 0.1;
        let dist_x = Math.abs(this.c.position.x - this.x);
        let dist_y = Math.abs(this.c.position.y - this.y);

        let dir_x = (this.c.position.x < this.x) ? 1 : -1;
        let dir_y = (this.c.position.y < this.y) ? 1 : -1;

        this.c.position.x += Math.min(speed, dist_x) * dir_x;
        this.c.position.y += Math.min(speed, dist_y) * dir_y;
    }

    // Visibly disappear
    this.disappear = function () {
        this.c.material.transparent = true;
        this.c.material.opacity = 0;
    }
}

// ============= particle classes =============
function makeParticle(x, y, z, color) {
    const geometry = new THREE.SphereGeometry(0.03, 8, 8);
    const material = new THREE.MeshPhongMaterial({ color });
    const particle = new THREE.Mesh(geometry, material);
    particle.position.x = x;
    particle.position.y = y;
    particle.position.z = z;
    scene.add(particle);
    return particle;
}

function surroundCube(x_cube, y_cube, z_cube, step_size) {
    let particles = [];

    for (let z = z_cube - 0.6; z < z_cube + 0.6 + step_size; z += step_size) {
        for (let y = y_cube - 0.6; y < y_cube + 0.6 + step_size; y += step_size) {
            for (let x = x_cube - 0.6; x < x_cube + 0.6 + step_size; x += step_size) {
                particles.push(new WhiteParticle(x, y, z));
            }
        }
    }
    return particles;
}

function ParticleSet(cube, step, time, rate) {
    let x = cube.b.position.x;
    let y = cube.b.position.y;
    let z = cube.b.position.z;
    this.cube = cube;
    this.step = step;
    this.particles = surroundCube(x, y, z, step);
    this.final_target = [-4, 0, 0];
    this.time = time;

    this.determine_ut = function () {
        this.particles.forEach((p, ndx) => {
            p.ut = this.time + (ndx + 1) * (rate);
        })
    }

    this.target_timed = function (time) {
        this.particles.forEach((p) => {
            if (time > p.ut) {
                p.set(
                    this.final_target[0],
                    this.final_target[1],
                    // this.final_target[1] + Math.random(),
                    this.final_target[2]);
            }
        })
    }
    this.target_particles = function () {
        this.particles.forEach((p) => p.set(-3 + Math.random(), 0, 0));
    }
    this.update_particles = function () {
        this.particles.forEach((p) => p.update());
    }
    this.sync = function () {
        let i = 0;
        let x_cube = this.cube.b.position.x;
        let y_cube = this.cube.b.position.y;
        let z_cube = this.cube.b.position.z;
        for (let z = z_cube - 0.6; z < z_cube + 0.6 + this.step; z += this.step) {
            for (let y = y_cube - 0.6; y < y_cube + 0.6 + this.step; y += this.step) {
                for (let x = x_cube - 0.6; x < x_cube + 0.6 + this.step; x += this.step) {
                    this.particles[i].set(x, y, z);
                    i++;
                }
            }
        }
    }
}

function Particle(x, y, z, c) {
    this.p = makeParticle(x, y, z, c);
    this.x = x;
    this.y = y;
    this.z = z;
    this.ut = 0;
    this.set = function (x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    this.update = function () {
        const speed = 0.1;
        let dist_x = Math.abs(this.p.position.x - this.x);
        let dist_y = Math.abs(this.p.position.y - this.y);
        let dist_z = Math.abs(this.p.position.z - this.z);

        let dir_x = (this.p.position.x < this.x) ? 1 : -1;
        let dir_y = (this.p.position.y < this.y) ? 1 : -1;
        let dir_z = (this.p.position.z < this.z) ? 1 : -1;

        this.p.position.x += Math.min(speed, dist_x) * dir_x;
        this.p.position.y += Math.min(speed, dist_y) * dir_y;
        this.p.position.z += Math.min(speed, dist_z) * dir_z;

    }

    this.disappear = function () {
        this.p.material.transparent = true;
        this.p.material.opacity = 0;
    }
}

function WhiteParticle(x, y, z) {
    Particle.call(this, x, y, z, WHITE);
}