for (let i = 0; i < 6; i++) {
    cubes.push(new WhiteBlock(-3 + i * 1.5, 0));
}

cubes.forEach((cube) => {
    cube.adjust_cube();
});

let ps = new ParticleSet(cubes[0], 0.3, 0, block_rate / 400);
let ps1 = new ParticleSet(cubes[0], 0.3, 0, block_rate / 400);
let choice = 0;

// assigns position in block based on index. max index = 27
function parametrize(t) {
    let x = t % 3;
    if (x == 0) x = 3;
    let y = Math.ceil(t / 9);
    let z = t % 9;
    if (z == 0) z = 9;
    z = Math.ceil(z / 3);
    return [x, y, z];
}

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

var particle_sets = [];

// mining function
// Add new blocks to the scene and shift each block up
function mine_canonical(m, time) {
    cubes.forEach((c) => c.y += 1.5);
    let nc = new WhiteBlock(-3, m);
    update_particles(time);
    nc.adjust_cube();
    nc.vanish();
    cubes.push(nc);
    playBuildAnimation(time);

    return nc;
}

function update_particles(time) {
    choice++;
    if (choice % 2 == 0) {
        ps1.set_particles(0, -3, 0);
        ps.surroundCube();
        ps.dynamic_ut(time);
    } else {
        ps.set_particles(0, -3, 0);
        ps1.surroundCube();
        ps1.dynamic_ut(time);
    }
}