function Chain() {
    this.main = [];
    this.fork = [];
    this.coins = [];

    //init
    for (let i = 0; i < 6; i++) { this.main.push(new WhiteBlock(-3 + 1.5 * i)); }
    this.main.forEach((block) => block.offset_rotation());

    this.shift_main = function (y) { this.main.forEach((b) => b.translate_y(y)) }
    this.shift_fork = function (y) { this.fork.forEach((b) => b.translate_y(y)) }
    this.mine_main = function (mev) {
        this.shift_main(1.5);
        let new_b = new WhiteBlock(-3, mev);
        new_b.offset_rotation();
        this.main.push(new_b);
        return new_b;
    }
    this.fork_length = function () { return this.fork.length; }
    this.latest_fork = function () { return this.fork[this.fork.length - 1] }
    this.latest_fork_y = function () { return this.fork[this.fork.length - 1].y }
    this.mine_fork = function (y, mev) {
        let new_b = new RedBlock(y, mev);
        if (mev > 0) {
            let n_coins = new_b.explode();
            this.coins = this.coins.concat(n_coins);
        }
        this.fork.push(new_b);
    }
    this.shift_coins = function (y) {
        this.fork.forEach((block) => block.shift_coins(y))
    }
    this.collect_coins = function () {
        this.fork.forEach((block) => block.collect_coins(4.5, -2.5))
    }
    this.vanish_coins = function () {
        this.fork.forEach((b) => b.eat_coins())
    }
    this.turn_invalid = function (mev_block) {
        this.main.forEach((block, ndx) => {
            if (ndx >= mev_block) {
                block.shift_x(-2.5);
                if (block.b.position.x <= -2.5) block.become_invalid();
            }
        })
        return this.main.slice(mev_block).every((block) => { return block.b.position.x <= -2.5 });
    }
    this.turn_canonical = function () {
        this.fork.forEach((block) => {
            block.shift_x(0);
            if (block.b.position.x <= 0) block.become_canon();
        })
        return this.main.every((block) => { return block.b.position.x <= 0 });
    }
    this.always_main = function (time) {
        this.main.forEach((block, ndx) => {
            block.update();
            const speed = 1 + ndx * .01;
            const rot = time * speed;
            block.b.rotation.y = rot;
            if (block.mev != 0) block.vibrate();
        });
    }
    this.always_fork = function (time) {
        this.fork.forEach((block, ndx) => {
            block.update();
            block.always_coins(time);
            const speed = 1 + ndx * .01;
            const rot = time * speed;
            block.b.rotation.y = rot;
        });
    }
}

const default_config = {
    honest_miner_rate: 1,
    adversary_miner_rate: 0.5,
    mev_start_time: 2,
    mev_lst: [0, 0, 10, 0, 3, 0, 0],
    mev_block_to_fork_from: 2,
};

function State(config, chain) {
    this.config = config;
    this.state = "stable";
    this.time_honest_last_mined = 0;
    this.chain = chain;

    this.always = function (time) {
        this.chain.always_main(time);
        this.chain.always_fork(time);
        if (time > this.config.mev_start_time & this.state == "stable") this.state = "unstable";
    }

    this.stable_blocks = function (now) {
        if (now - this.time_honest_last_mined >= config.honest_miner_rate) {
            this.time_honest_last_mined = now;
            this.chain.mine_main(0);
        }
    }

    this.mev_lst = config.mev_lst;
    this.mev_blocks_mined = [];

    this.unstable_blocks = function (now) {
        if (now - this.time_honest_last_mined >= config.honest_miner_rate) {
            this.time_honest_last_mined = now;
            let mev = 0;
            if (this.mev_lst.length != 0) {
                mev = this.mev_lst[0];
                this.mev_lst = this.mev_lst.slice(1);
            } else { this.state = "fork" }
            let new_b = this.chain.mine_main(mev);
            this.mev_blocks_mined.push(new_b);
        }
    }

    this.time_adversary_last_mined = 0;
    this.adversary_target = config.mev_block_to_fork_from;

    this.attacker_exploits = function (now) {
        if (now - this.time_adversary_last_mined >= config.adversary_miner_rate) {
            this.time_adversary_last_mined = now;
            let t_b = this.mev_blocks_mined[this.adversary_target];
            this.chain.mine_fork(t_b.y, t_b.mev);
            this.adversary_target++;
            if (this.adversary_target == this.config.mev_lst.length) this.state = "race";
        }
        if (now - this.time_honest_last_mined >= config.honest_miner_rate) {
            this.time_honest_last_mined = now;
            this.chain.mine_main(0);
            this.chain.shift_coins(1.5);
            this.chain.shift_fork(1.5);
        }
    }

    this.attacker_races = function (now) {
        if (now - this.time_adversary_last_mined >= config.adversary_miner_rate) {
            this.time_adversary_last_mined = now;
            let latest_b = this.chain.latest_fork();
            this.chain.mine_fork(latest_b.y - 1.5, 0);
            if (this.chain.latest_fork_y() <= -4.5) this.state = "win";
        }
        if (now - this.time_honest_last_mined >= config.honest_miner_rate) {
            this.time_honest_last_mined = now;
            this.chain.mine_main(0);
            this.chain.shift_coins(1.5);
            this.chain.shift_fork(1.5);
        }
    }

    this.zoom_in = function () {
        camera.fov += 0.2;
        camera.updateProjectionMatrix();
        if (camera.fov >= 130) this.state = "replace";
        this.chain.collect_coins();
    }

    this.replace = function () {
        let main_moved = this.chain.turn_invalid(config.mev_block_to_fork_from);
        let forks_moved = this.chain.turn_canonical();
        if (main_moved & forks_moved) {
            this.state = "loop";
            this.chain.vanish_coins();
        }
    }
}