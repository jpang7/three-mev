'use strict';

/* global THREE */

function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ canvas });

    //camera
    const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 8;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    //position
    camera.position.z = 7;
    camera.position.y = 0.5;

    //scene
    const scene = new THREE.Scene();

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

    // ART

    //block geometry
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    function makeInstance(geometry, color, y) {
        const material = new THREE.MeshPhongMaterial({ color });
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

        this.adjust_cube = function () {
            let dir = (Math.random() < 0.5) ? 1 : -1;
            this.b.rotateY(Math.random() * 0.5 * dir);
        }

        this.move_cube_up = function () {
            if (this.b.position.y <= this.y) this.b.position.y += 0.1;
        }

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

        this.vanish = function () {
            this.b.material.transparent = true;
            this.b.material.opacity = 0;
        }
    }

    const WHITE = 0xFFFFFF;
    const RED = 0xFF0000;
    const GREY = 0x52527A;

    function WhiteBlock(y, mev) {
        Block.call(this, WHITE, y, mev);
    }

    let cubes = [];
    for (let i = 0; i < 6; i++) {
        cubes.push(new WhiteBlock(-3 + i * 1.5, 0));
    }

    cubes.forEach((cube) => {
        cube.adjust_cube();
    });

    function mine_canonical(m) {
        cubes.forEach((c) => c.y += 1.5);
        let nc = new WhiteBlock(-3, m);
        nc.adjust_cube();
        cubes.push(nc);
        return nc;
    }

    // coin class + methods
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

        this.drift = function () {
            this.x += Math.random() * 3;
            this.y += Math.random() * ((Math.random() < 0.5) ? 1 : -1);
        }

        this.update = function () {
            if (this.c.position.y <= this.y) this.c.position.y += 0.1;
            else this.c.position.y -= 0.1;
            if (this.c.position.x <= this.x) this.c.position.x += 0.1;
            else this.c.position.x -= 0.1;
        }

        this.disappear = function () {
            this.c.material.transparent = true;
            this.c.material.opacity = 0;
        }
    }

    function RedBlock(y, mev) {
        Block.call(this, RED, y, mev);
        this.coins = [];

        this.spawn = function () {
            for (let i = 0; i < this.mev; i++) {
                let nc = new Coin(this.b.position.x, this.b.position.y);
                nc.c.position.z = 1;
                nc.c.rotation.x = 70;
                this.coins.push(nc);
            }
        }

        this.explode = function () {
            this.coins.forEach((c) => c.drift());
        }

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

    // states

    const default_config = {
        block_rate: 1,
        a_rate: 0.5,
        mev_start: 2,
        mev_lst: [0, 0, 10, 0, 3, 0, 0],
        target_block: 2,
    };

    function gen_rand_config() {
        let mev_lst = [];
        let len = Math.round(Math.random() * 10);
        for (let i = 0; i < len; i++) {
            mev_lst.push(Math.round(Math.random() * 20));
        }
        return {
            block_rate: Math.random() * 2,
            a_rate: Math.random(),
            mev_start: Math.round(Math.random() * 10),
            mev_lst: mev_lst,
            target_block: Math.round(Math.random() * mev_lst.length)
        }
    }

    var config_lst = [
        default_config,
        gen_rand_config(),
        gen_rand_config(),
        gen_rand_config(),
        gen_rand_config()
    ]

    console.log(config_lst)
    var config_count = 0;

    var last = 0;
    var a_last = 0;

    var block_rate, a_rate, mev_start, mev_lst, target_block;

    function set_config(config) {
        block_rate = config.block_rate;
        a_rate = config.a_rate;
        mev_start = config.mev_start;
        mev_lst = config.mev_lst;
        target_block = config.target_block;
    }

    set_config(config_lst[0]);

    var forks = [];
    var surpassed = false;
    var pass_y = 0;
    var mev_blocks = [];

    var state = "stable";

    function stable_state(time) {
        if (time - last >= block_rate) {
            last = time;
            let nc = mine_canonical(0);
        }
    }

    function mev_state(time) {
        if (time - last >= block_rate) {
            last = time;
            let mev = 0;
            if (mev_lst.length != 0) {
                mev = mev_lst[0];
                mev_lst = mev_lst.slice(1);
            } else {
                state = "fork";
            }
            let nc = mine_canonical(mev);
            mev_blocks.push(nc);
        }
    }

    function fork_state(time) {
        forks.forEach((cube) => cube.move_cube_up());
        if (time - a_last >= a_rate) {
            a_last = time;
            if (surpassed) {
                let nb = new RedBlock(pass_y, 0);
                nb.b.position.x = 2;
                forks.push(nb);
                pass_y -= 1.5;
                if (pass_y == -6) {
                    state = "win";
                    surpassed = false;
                }
            }
            else {
                let tb = mev_blocks[target_block];
                let nb = new RedBlock(tb.y, tb.mev);
                nb.b.position.x = 2;
                nb.spawn();
                nb.explode();
                forks.push(nb);
                target_block++;
                if (target_block == mev_blocks.length) {
                    surpassed = true;
                    pass_y = tb.y - 1.5;
                    mev_blocks = [];
                }
            }
        }
        if (time - last >= block_rate) {
            forks.forEach((cube) => {
                cube.shift_coins(1.5);
                cube.y += 1.5
            });
            pass_y += 1.5;
        }
    }

    function replace_state() {
        let cond1 = false;
        let cond2 = false;
        forks.forEach((cube) => {
            if (cube.b.position.x >= 0) {
                cube.b.position.x -= 0.1;
            } else {
                cond1 = true;
                cube.b.material.color.setHex(WHITE);
            }
        })
        let sub_cubes = cubes.slice(cubes.length - forks.length + 1);
        sub_cubes.forEach((cube) => {
            if (cube.b.position.x >= -2.5) {
                cube.b.position.x -= 0.1;
            } else {
                cond2 = true;
                cube.b.material.color.setHex(GREY);
            }
        })
        if (cond1 & cond2) {
            state = "replay"
        }
    }

    //render
    function render(time) {
        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) { //changes renderer size
            const canvas = renderer.domElement; // updates aspect based on window size
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        if (state == "stable" || state == "stable2") {
            stable_state(time);
        } else if (state == "mev") {
            mev_state(time);
        }
        else if (state == "fork") {
            fork_state(time);
            stable_state(time);
        }
        else if (state == "win") {
            camera.fov += 0.2;
            camera.updateProjectionMatrix();
            if (camera.fov >= 130) {
                state = "zoom out";
            }
            forks.forEach((b) => b.set_coins(4.5, -2.5));
        }
        else if (state == "zoom out") {
            replace_state();
        }
        else if (state == "replay") {
            forks.forEach((c) => c.vanish_coins());
            camera.fov -= 0.5;
            camera.updateProjectionMatrix();
            if (camera.fov <= 75) {
                config_count++;
                set_config(config_lst[config_count]);
                mev_start += time;
                state = "stable"
                let sub_cubes = cubes.slice(cubes.length - forks.length + 1);
                sub_cubes.forEach((c) => c.vanish());
                cubes = cubes.concat(forks);
                cubes.forEach((cube) => cube.y += 1.5);
                forks = [];
            }
        }

        if (time > mev_start & state == "stable") {
            state = "mev";
        }

        cubes.forEach((cube, ndx) => {
            cube.move_cube_up();
            if (cube.mev != 0) cube.vibrate();
            const speed = 1 + ndx * .01;
            const rot = time * speed;
            cube.b.rotation.y = rot;
        });

        forks.forEach((cube, ndx) => {
            const speed = 10 + ndx * .1;
            const rot = time * speed;
            cube.update_coins();
            cube.spin_coins(time);
            cube.b.rotation.y = rot;
        });

        renderer.render(scene, camera);

        requestAnimationFrame(render); // this is a recursive call
    }
    requestAnimationFrame(render);
}

main();