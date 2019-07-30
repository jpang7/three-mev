// ============= render =============    
function sub_render(time, honest_mixer, adversary_mixer) {
    var delta = clock.getDelta();

    function mixer_times(h, a) {
        if (honest_mixer) honest_mixer.timeScale = h;
        if (adversary_mixer) adversary_mixer.timeScale = a;
    }

    if (honest_mixer) honest_mixer.update(delta);
    if (adversary_mixer) adversary_mixer.update(delta);
    uniforms1["time"].value += delta * 5;

    if (state == "stable") { // Only stable (not shaking), white blocks
        stable_state(time);
        mixer_times(5, 0);
    } else if (state == "mev") { // White blocks begin to shake
        mev_state(time);
    }
    else if (state == "fork") { // Red fork blocks appear
        fork_state(time);
        stable_state(time);
        mixer_times(5, 10);
    }
    else if (state == "win") { // Red fork surpassed the main chain. zoom out
        mixer_times(0, 0);
        camera.fov += 0.2;
        camera.updateProjectionMatrix();
        if (camera.fov >= 130) {
            state = "zoom out";
        }
        forks.forEach((b) => b.set_coins(4.5, -1.5));
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

    particle_sets.forEach((p) => {
        p.target_timed(time);
        p.update_particles();
    })

    tx_lst.forEach((t) => t.update(time))
    bad_tx_lst.forEach((t) => t.update(time))

    //reset the building blocks
    if (reset & time > tx_lst[tx_lst.length - 1].ut) {
        cubes[cubes.length - 1].appear();
        reset = false;
        tx_lst.forEach((t) => {
            t.reset();
            t.vanish();
        })
    }

    //reset the building blocks for adversary
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
}
