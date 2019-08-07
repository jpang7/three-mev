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
    let tx = new InitTx();
    tx_lst.push(tx);
    recycle_proton_list.push(new GoodTxEmitter(tx));
}

for (let i = 0; i < 27; i++) {
    let tx=  new BadTx();
    bad_tx_lst.push(tx);
    recycle_proton_list.push(new BadTxEmitter(tx));
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

function makeInstance(color, y) {
    const material = new THREE.MeshPhongMaterial({ color });
    // const material = new THREE.MeshStandardMaterial({ color });
    // const material = glow_material;
    // const material = colored_material(color);
    const cube = new THREE.Mesh(block_geometry, material);
    scene.add(cube);
    cube.position.y = y;
    return cube;
}

// Block class + methods
function Block(color, y, mev) {
    this.b = makeInstance(color, y);
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

    this.delete = function () {
        scene.remove(this.b);
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
        for (let i = 0; i < this.mev * 7; i++) {
            let nc = new Coin(this.b.position.x, this.b.position.y);
            nc.c.position.z = 1;
            nc.g.position.z = 1;
            nc.c.rotation.x = 70;
            nc.g.rotation.x = 70;
            this.coins.push(nc);
        }
    }
    // Explode coins in different directions
    this.explode = function () {
        this.coins.forEach((c) => c.drift());
        this.mev = 0;
    }

    this.helicoid = function () {
        this.coins.forEach((c,ndx) => {
            let ndx_u = ndx*0.1
            c.set(Math.sin(ndx_u) + 3 ,Math.cos(ndx_u) + this.b.position.y,ndx_u);
        })
        this.mev = 0;
    }
    // Assign all coins to a single location
    this.set_coins = function (x, y) {
        this.coins.forEach((c) => {
            c.x = x;
            c.y = y;
            c.z = 0;
        })
    }

    this.dynamic_ut = function(time) {
        this.coins.forEach((c, ndx) => {
            c.ut = time + (ndx + 1);
        })
    }

    this.target_timed = function(time) {
        this.coins.forEach((c,ndx) => {
            if (time > c.ut) {
                // c.set(

                // )
            }
        })
    }

    this.emit_color = function (color) {
        this.coins.forEach((c) => {
            c.e.e.removeBehaviour(c.e.behave);
            c.e.behave = new Proton.Color(color, ['#ffff00', color], Infinity, Proton.easeOutSine)
            c.e.e.addBehaviour(c.e.behave);
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

    this.delete_coins = function () {
        this.coins.forEach((c) => c.delete());
    }

    this.spin_coins = function (time) {
        this.coins.forEach((coin, ndx) => {
            const speed = 1 + ndx * .01;
            const rot = time * speed;
            coin.c.rotation.x = rot;
            coin.c.rotation.y = rot;
            coin.g.rotation.x = rot;
            coin.g.rotation.y = rot;
        });
    }
}

// ============= coin classes =============    
function makeCoin(x, y) {
    const coin = new THREE.Mesh(coin_geometry, coin_material);
    coin.position.x = x;
    coin.position.y = y;
    scene.add(coin);
    return coin;
}

function makeGlow(x, y) {
    const glow = new THREE.Mesh(coin_glow_geometry, glow_material);
    glow.position.x = x;
    glow.position.y = y;
    scene.add(glow);
    return glow;
}

function Coin(x, y) {
    this.c = makeCoin(x, y);
    this.x = x;
    this.y = y;
    this.z = 0;
    this.g = makeGlow(x, y);
    this.ut = 0;
    this.e = new CoinEmitter(this);

    coin_proton_list.push(this.e);
    // Go in a random direction to the right
    this.drift = function () {
        this.x += Math.random() * 2 * ((Math.random() < 0.5) ? 1 : -3);
        this.y += Math.random() * 1.4*  ((Math.random() < 0.5) ? 1 : -1);
    }
    // Translate to ([this.x], [this.y])
    this.update = function (time) {
        const speed = 0.4;
        let dist_x = Math.abs(this.c.position.x - this.x);
        let dist_y = Math.abs(this.c.position.y - this.y);
        let dist_z = Math.abs(this.c.position.z - this.z);

        let dir_x = (this.c.position.x < this.x) ? 1 : -1;
        let dir_y = (this.c.position.y < this.y) ? 1 : -1;
        let dir_z = (this.c.position.z < this.z) ? 1 : -1;

        this.c.position.x += Math.min(speed, dist_x) * dir_x;
        this.c.position.y += Math.min(speed, dist_y) * dir_y;
        this.c.position.z += Math.min(speed, dist_z) * dir_z;

        this.g.position.x += Math.min(speed, dist_x) * dir_x;
        this.g.position.y += Math.min(speed, dist_y) * dir_y;
        this.g.position.z += Math.min(speed, dist_z) * dir_z;
    }

    this.set = function (x,y,z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    // Visibly disappear
    this.disappear = function () {
        this.c.material.transparent = true;
        this.c.material.opacity = 0;
        this.g.material = this.c.material;
        // this.g.material.transparent = true;
        // this.g.material.opacity = 0;
    }

    this.delete = function () {
        scene.remove(this.c);
        scene.remove(this.g);
        this.e.e.destroy();
    }
}

// ============= particle classes =============
function makeParticle(x, y, z, color) {
    const geometry = new THREE.SphereGeometry(0.05, 8, 8);
    const material = new THREE.MeshPhongMaterial({ color });
    const particle = new THREE.Mesh(geometry, glow_material_white);
    particle.position.x = x;
    particle.position.y = y;
    particle.position.z = z;
    scene.add(particle);
    return particle;
}

function makePGlow(x, y, z, color) {
    const geometry = new THREE.SphereGeometry(0.07, 8, 8);
    const material = new THREE.MeshPhongMaterial({ color });
    const particle = new THREE.Mesh(geometry, glow_material);
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
                let wp  = new WhiteParticle(x,y,z);
                particles.push(wp);
                // recycle_proton_list.push(new WhiteParticleEmitter(wp));
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
    this.dynamic_ut = function (time) {
        this.particles.forEach((p, ndx) => {
            p.ut = time + (ndx + 1) * (rate);
            // console.log(p.ut)
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
    this.set_particles = function (x, y, z) {
        this.particles.forEach((p) => p.set_pos(x, y, z));
    }
    this.surroundCube = function () {
        let i = 0;
        for (let y = -3 + 0.6; y > -3 - 0.6 - this.step; y -= this.step) {
            for (let z = 0 - 0.6; z < 0 + 0.6 + this.step; z += this.step) {
                for (let x = 0 - 0.6; x < 0 + 0.6 + this.step; x += this.step) {
                    this.particles[i].set(x, y, z);
                    this.particles[i].set_pos(x, y, z);
                    i++;
                }
            }
        }
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
    // this.g = makePGlow(x, y, z, c);
    this.ut = 0;

    this.set = function (x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    this.set_pos = function (x, y, z) {
        this.p.position.x = x;
        this.p.position.y = y;
        this.p.position.z = z;
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

function makeBolt(x, y, z, r, mat) {
    const radiusTop = r;
    const radiusBottom = radiusTop;
    const height = 0.1;
    const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 32);
    const cylinder = new THREE.Mesh(geometry, mat);
    scene.add(cylinder);
    cylinder.rotation.z = Math.PI / 2;
    cylinder.position.x = x;
    cylinder.position.y = y;
    cylinder.position.z = z;
    return cylinder;
}

function makeTrail() {
    var trail = [];
    const radius = .1;
    const geometry = new THREE.SphereGeometry(radius, 4,4);
    // const geometry = new THREE.BoxGeometry(radius,radius,radius)
    for (let i = 0; i < 300; i++) {
        let sphere = new THREE.Mesh(geometry, glow_material);
        trail.push(sphere);
        sphere.position.x = -3;
        sphere.position.z = -1;
        scene.add(sphere);
    }
    return trail;
}

function Bolt(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.b = makeBolt(x, y, z, 0.05, glow_material_custom);
    this.trail = makeTrail();
    this.count = 0;
    this.update = function () {
        const speed = 0.5;
        let dist_x = Math.abs(this.b.position.x - this.x);
        let dist_y = Math.abs(this.b.position.y - this.y);
        let dist_z = Math.abs(this.b.position.z - this.z);

        let dir_x = (this.b.position.x < this.x) ? 1 : -1;
        let dir_y = (this.b.position.y < this.y) ? 1 : -1;
        let dir_z = (this.b.position.z < this.z) ? 1 : -1;

        this.b.position.x += Math.min(speed, dist_x) * dir_x;
        this.b.position.y += Math.min(speed, dist_y) * dir_y;
        this.b.position.z += Math.min(speed, dist_z) * dir_z;
    }
    this.trail_update = function () {
        this.trail[this.count].position.x = this.b.position.x;
        this.trail[this.count].position.y = this.b.position.y;
        let c = [1, 1, Math.random()]
        this.trail[this.count].material = color_glow(c);
        this.count++;
    }
    this.go = function () {
        this.x = 10 * block_rate;
        this.y = Math.random() * 15 * ((Math.random() <= 0.5) ? 1 : -1);
    }
    this.reset = function () {
        this.x = -6;
        this.b.position.x = -6;
        this.count = 0;
        this.trail.forEach((t) => t.position.x = -6);
    }
    this.disappear = function () {
        this.b.material = white_phong;
        this.b.material.transparent = true;
        this.b.material.opacity = 0;

        this.trail.forEach((t) => {
            t.material = this.b.material;
        });
    }
    this.appear = function () {
        this.b.material = color_glow([1., 0.84, 0]);
        this.trail.forEach((t) => {
            t.material = this.b.material;
        });
    }
}

function makeDrone(x,y,z) {
    var side = 0.5;
    var geometry = new THREE.BoxGeometry(side,side,side);
    var material = new THREE.MeshPhongMaterial({color: 0xFFFFFF});
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

