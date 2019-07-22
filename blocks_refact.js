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
    }

    const WHITE = 0xFFFFFF;
    const RED = 0xFF0000;
    const GREY = 0x52527A;

    function WhiteBlock(y, mev) {
        Block.call(this, WHITE, y, mev);
    }

    function RedBlock(y, mev) {
        Block.call(this, RED, y, mev);
        this.coins = [];
        this.spawn = function () {

        }
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


    function move_coin(coin) {
        let c = coin.c;
        let x = coin.x;
        let y = coin.y;
        if (c.position.y <= y) {
            c.position.y += 0.1
        } else {
            c.position.y -= 0.1
        }
        if (c.position.x <= x) {
            c.position.x += 0.1
        } else {
            c.position.x -= 0.1
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

    var last = 0;
    var a_last = 0;

    var block_rate = default_config.block_rate;
    var a_rate = default_config.a_rate;
    var mev_start = default_config.mev_start;
    var mev_lst = default_config.mev_lst;
    var target_block = default_config.target_block;

    var forks = [];
    var coins = [];
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
        forks.forEach((cube) => move_cube_up(cube));
        if (time - a_last >= a_rate) {
            a_last = time;
            if (surpassed) {
                let nb = new RedBlock(pass_y, 0);
                nb.b.position.x = 2;
                forks.push(nb);
                pass_y -= 1.5;
                if (pass_y == -6) state = "win";
            }
            else {
                let tb = mev_blocks[target_block];
                let nb = new RedBlock(tb.y, tb.mev);
                nb.b.position.x = 2;
                let subcoins = [];
                for (let i = 0; i < tb.mev; i++) {
                    let coin = makeCoin(nb.position.x, nb.position.y);
                    coin.position.z = 1;
                    coin.rotation.x = 70;
                    let cd = { c: coin, x: coin.position.x, y: coin.position.y }
                    coins.push(cd);
                    subcoins.push(cd)
                }
                forks.push(nb);
                subcoins.forEach((coin) => {
                    coin.x += Math.random() * 3;
                    coin.y += Math.random() * ((Math.random() < 0.5) ? 1 : -1);
                })
                target_block++;
                if (target_block == mev_blocks.length) {
                    surpassed = true;
                    pass_y = tb.y - 1.5;
                }
            }
        }
        if (time - last >= block_rate) {
            forks.forEach((cube) => {
                cube.y += 1.5;
            })
            coins.forEach((coin) => coin.y += 1.5)
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

    // let tst_coin = makeCoin(0, 0);

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
        // else if (state == "fork") {
        //     fork_state(time);
        //     stable_state(time);
        // } else if (state == "win") {
        //     camera.fov += 0.2;
        //     camera.updateProjectionMatrix();
        //     if (camera.fov >= 130) {
        //         state = "stop";
        //     }
        //     coins.forEach((coin) => {
        //         coin.x = 4.5;
        //         coin.y = -2.5;
        //     })
        // } else if (state == "stop") {
        //     replace_state();
        // } else if (state == "replay") {
        //     coins.forEach((coin) => {
        //         coin.c.material.transparent = true;
        //         coin.c.material.opacity = 0;
        //     })
        //     camera.fov -= 0.5;
        //     camera.updateProjectionMatrix();
        //     if (camera.fov <= 75) {
        //         state = "stable2"
        //         let sub_cubes = cubes.slice(cubes.length - forks.length + 1);
        //         sub_cubes.forEach((cube) => {
        //             cube.b.material.transparent = true;
        //             cube.b.material.opacity = 0;
        //         })
        //         cubes = cubes.concat(forks);
        //         cubes.forEach((cube) => cube.y += 1.5);
        //         // forks.forEach((cube) => cube.y += 3);
        //     }
        // }

        if (time > mev_start & state == "stable") {
            state = "mev";
        }

        // coins.forEach((coin, ndx) => {
        //     const speed = 1 + ndx * .01;
        //     const rot = time * speed;
        //     coin.c.rotation.x = rot;
        //     coin.c.rotation.y = rot;
        // })

        // coins.forEach((coin) => move_coin(coin));


        cubes.forEach((cube, ndx) => {
            cube.move_cube_up();
            if (cube.mev != 0) cube.vibrate();
            const speed = 1 + ndx * .01;
            const rot = time * speed;
            cube.b.rotation.y = rot;
        });

        // forks.forEach((cube, ndx) => {
        //     const speed = 10 + ndx * .1;
        //     const rot = time * speed;
        //     cube.b.rotation.y = rot;
        // });

        // cubes.forEach((cube) => {
        //     if (cube.mev != 0) vibrate(cube);
        // });

        renderer.render(scene, camera);

        requestAnimationFrame(render); // this is a recursive call
    }
    requestAnimationFrame(render);
}

main();