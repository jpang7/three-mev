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
    const clock = new THREE.Clock();


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

    const uniforms1 = {
        "time": { value: 1.0 }
    };

    var params = [
        ['frag_white', uniforms1],
        ['frag_red', uniforms1],
        ['frag_grey', uniforms1],
        ['fragment_shader1', uniforms1],
        ['fragment_shader3', uniforms1],
        ['fragment_shader4', uniforms1]
    ];

    const WHITE = 0xFFFFFF;
    const RED = 0xFF0000;
    const GREY = 0x52527A;

    let white_material = new THREE.ShaderMaterial({
        uniforms: params[0][1],
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById(params[0][0]).textContent
    })

    let red_material = new THREE.ShaderMaterial({
        uniforms: params[1][1],
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById(params[1][0]).textContent
    })

    let grey_material = new THREE.ShaderMaterial({
        uniforms: params[2][1],
        vertexShader: document.getElementById('vertexShader').textContent,
        fragmentShader: document.getElementById(params[2][0]).textContent
    })

    let uniforms_2 = {
        colorB: { type: 'vec3', value: new THREE.Color(0xACB6E5) },
        colorA: { type: 'vec3', value: new THREE.Color(0x74ebd5) }
    }

    function vertexShader() {
        return `
            varying vec3 vUv;

            void main() {
                vUv = position;
                vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * modelViewPosition;
            }
        `
    }
    function fragmentShader1() {
        return `
            varying vec3 vUv;
            uniform vec3 colorA;
            uniform vec3 colorB;

            vec3 white = vec3(1.,1.,1.);

            void main() {
                gl_FragColor=vec4(mix(white,colorA,vUv.z),1.0);
            }
        `
    }
    let material_2 = new THREE.ShaderMaterial({
        uniforms: uniforms_2,
        fragmentShader: fragmentShader1(),
        vertexShader: vertexShader(),
    })

    let transparent_material = new THREE.MeshPhongMaterial({ WHITE })

    let white_phong = new THREE.MeshPhongMaterial({ WHITE });
    let red_phong = new THREE.MeshPhongMaterial({ RED });
    let grey_phong = new THREE.MeshPhongMaterial({ GREY });

    function colored_material(c) {
        // if (c == WHITE) return white_material
        // if (c == WHITE) return material_2
        // else if (c == RED) return red_material
        // else if (c == GREY) return grey_material
        if (c == WHITE) return white_phong
        else if (c == RED) return red_phong
        else if (c == GREY) return grey_phong
    }

    // ART

    //block geometry
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    function makeInstance(geometry, color, y) {
        const material = new THREE.MeshPhongMaterial({ color });
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
            this.b.material = colored_material(color)
        }
    }

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

    // Add new blocks to the scene and shift each block up
    function mine_canonical(m, time) {
        cubes.forEach((c) => c.y += 1.5);
        let nc = new WhiteBlock(-3, m);
        nc.adjust_cube();
        nc.vanish();
        cubes.push(nc);
        playBuildAnimation(time);

        return nc;
    }

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

    var tx_lst = [];
    for (let i = 0; i < 27; i++) {
        tx_lst.push(new InitTx());
    }

    var bad_tx_lst = [];
    for (let i = 0; i < 27; i++) {
        bad_tx_lst.push(new BadTx());
    }

    bad_tx_lst.forEach((t) => t.vanish());

    function parametrize(t) {
        let x = t % 3;
        if (x == 0) x = 3;
        let y = Math.ceil(t / 9);
        let z = t % 9;
        if (z == 0) z = 9;
        z = Math.ceil(z / 3);
        return [x, y, z];
    }

    let reset = false;

    function playBuildAnimation(time) { // set parameters so 
        tx_lst.forEach((tx, ndx) => {
            tx.appear();
            let coords = parametrize(ndx + 1);
            tx.x = -0.6 + coords[0] * .33;
            tx.y = -3.5 + coords[1] * .33;
            tx.z = -0.5 + coords[2] * .33;
            tx.ut = (ndx + 1) * (block_rate / 32.5) + time;
            if (ndx == (tx_lst.length - 1)) reset = true;
        })
    }

    let a_reset = false;

    function playStealAnimation(time, y) {
        bad_tx_lst.forEach((tx, ndx) => {
            tx.appear();
            let coords = parametrize(ndx + 1);
            tx.x = 1 + coords[0] * .33;
            tx.y = y + coords[1] * .33;
            tx.z = -0.5 + coords[2] * .33;
            tx.ut = (ndx + 1) * (a_rate / 60) + time;
            if (ndx == (tx_lst.length - 1)) a_reset = true;
        })
    }

    function mine_canonical2(m, time) {
        cubes.forEach((c) => c.y += 1.5);

        playBuildAnimation(time); // signal play/change a boolean. doesn't need a stop. just a function called in render

        let nc = new WhiteBlock(-3, m);
        nc.adjust_cube();
        nc.vanish();
        cubes.push(nc);
        return nc;
    }

    // coin class + methods
    const coin_texture = new THREE.TextureLoader().load('gcoin.jpg');
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

    // states

    const default_config = {
        block_rate: 1,
        a_rate: 0.5,
        mev_start: 2,
        mev_lst: [0, 0, 10, 0, 3, 0, 0],
        target_block: 2,
    };

    function find_first_nonzero(lst) {
        for (let i in lst) { if (lst[i] != 0) return i }
        return 0;
    }

    function gen_rand_config() {
        let mev_lst = [];
        let len = Math.round(Math.random() * 10);
        for (let i = 0; i < len; i++) {
            mev_lst.push(Math.round(Math.random() * 20));
        }
        return {
            block_rate: 1 + Math.random(),
            a_rate: Math.random() * .75,
            mev_start: Math.round(Math.random() * 10),
            mev_lst: mev_lst,
            target_block: find_first_nonzero(mev_lst)
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
            let nc = mine_canonical(0, time);
            // let nc = mine_canonical2(0, time);
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
            let nc = mine_canonical(mev, time);
            // let nc = mine_canonical2(mev, time);
            mev_blocks.push(nc);
        }
    }

    function fork_state(time) {
        forks.forEach((cube) => cube.move_cube_up());
        if (time - a_last >= a_rate) {
            a_last = time;
            if (surpassed) { // If fork surpassed the blocks that correspond to [mev_blocks]. Red blocks don't explode
                let nb = new RedBlock(pass_y, 0);
                nb.b.position.x = 2;
                nb.vanish();
                forks.push(nb);
                pass_y -= 1.5;
                playStealAnimation(time, pass_y);
                if (pass_y == -6) {
                    state = "win";
                    surpassed = false;
                }
            }
            else { // If fork is still referencing blocks in [mev_blocks]. Red blocks explode
                let tb = mev_blocks[target_block];
                let nb = new RedBlock(tb.y, tb.mev);
                nb.b.position.x = 2;
                nb.spawn();
                nb.explode();
                nb.vanish();
                forks.push(nb);
                playStealAnimation(time, tb.y);
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
        forks.forEach((cube) => { // Move fork blocks to main. Turn them white
            if (cube.b.position.x >= 0) {
                cube.b.position.x -= 0.1;
            } else {
                cond1 = true;
                cube.change_color(WHITE);
            }
        })
        let sub_cubes = cubes.slice(cubes.length - forks.length + 1);
        sub_cubes.forEach((cube) => { // Move replaced blocks left and turn grey
            if (cube.b.position.x >= -2.5) {
                cube.b.position.x -= 0.1;
            } else {
                cond2 = true;
                cube.change_color(GREY);
            }
        })
        if (cond1 & cond2) {
            state = "replay"
        }
    }

    //render
    function render(time) {
        time *= 0.001;

        var delta = clock.getDelta();
        uniforms1["time"].value += delta * 5;

        if (resizeRendererToDisplaySize(renderer)) { //changes renderer size
            const canvas = renderer.domElement; // updates aspect based on window size
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        if (state == "stable") { // Only stable (not shaking), white blocks
            stable_state(time);
        } else if (state == "mev") { // White blocks begin to shake
            mev_state(time);
        }
        else if (state == "fork") { // Red fork blocks appear
            fork_state(time);
            stable_state(time);
        }
        else if (state == "win") { // Red fork surpassed the main chain. zoom out
            camera.fov += 0.2;
            camera.updateProjectionMatrix();
            if (camera.fov >= 130) {
                state = "zoom out";
            }
            forks.forEach((b) => b.set_coins(4.5, -2.5));
        }
        else if (state == "zoom out") { // Camera fully zoomed out
            replace_state();    // Red blocks become canon, replaced blocks vanish
        }
        else if (state == "replay") { // Prepare the next config and loop back to stable
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

        tx_lst.forEach((t) => t.update(time))
        bad_tx_lst.forEach((t) => t.update(time))

        if (reset & time > tx_lst[tx_lst.length - 1].ut) {
            cubes[cubes.length - 1].appear();
            reset = false;
            tx_lst.forEach((t) => {
                t.reset();
                t.vanish();
            })
        }

        if (reset & time > tx_lst[tx_lst.length - 1].ut) {
            cubes[cubes.length - 1].appear();
            reset = false;
            tx_lst.forEach((t) => {
                t.reset();
                t.vanish();
            })
        }

        if (a_reset & time > bad_tx_lst[bad_tx_lst.length - 1].ut) {
            forks[forks.length - 1].appear();
            a_reset = false;
            bad_tx_lst.forEach((t) => {
                t.reset();
                t.vanish();
            })
        }

        // Make each main block rotate and vibrate
        cubes.forEach((cube, ndx) => {
            cube.move_cube_up();
            if (cube.mev != 0) cube.vibrate();
            const speed = 1 + ndx * .01;
            const rot = time * speed;
            cube.b.rotation.y = rot;
        });

        // Make each fork block rotate and vibrate. Make coins spin
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