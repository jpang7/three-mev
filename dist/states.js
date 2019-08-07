// ============= state managers =============    
function stable_state(time) {
    if (time - last >= block_rate) {
        last = time;
        let nc = mine_canonical(0, time);
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
            nb.emit_color(coin_colors[coin_color_count % coin_colors.length]);

            if (tb.mev != 0) coin_color_count++;

            nb.explode();
            nb.vanish();
            forks.push(nb);
            playStealAnimation(time, tb.y);
            target_block++;
            if (target_block == mev_blocks.length) {
                surpassed = true;
                coin_color_count = 0;
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