// ============= configs/data to animate =============    

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

// sync state with config
function set_config(config) {
    block_rate = config.block_rate;
    a_rate = config.a_rate;
    mev_start = config.mev_start;
    mev_lst = config.mev_lst;
    target_block = config.target_block;
}

set_config(config_lst[0]);