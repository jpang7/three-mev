var coin_proton = new Proton();
coin_proton.addRender(new Proton.MeshRender(scene));

var recycle_proton = new Proton();
recycle_proton.addRender(new Proton.MeshRender(scene));

var back_proton = new Proton();
back_proton.addRender(new Proton.MeshRender(scene));

var coin_proton_list = [];
var recycle_proton_list = [];
var back_proton_list = [];
var travel_list = [];

const proton_map = new THREE.TextureLoader().load("../playground/dot6.png");
const proton_sprite_mat = new THREE.SpriteMaterial({ map: proton_map, color: 0xff0000, blending: THREE.AdditiveBlending, fog: true });

function TxEmitter(tx, color, r1, r2) {
    this.e = new Proton.Emitter();
    this.tx = tx;

    recycle_proton.addEmitter(this.e);

    this.e.rate = new Proton.Rate(new Proton.Span(3, 5), new Proton.Span(.01, .1));
    this.e.addInitialize(new Proton.Life(0.1, 0.2));
    this.e.addInitialize(new Proton.Body(new THREE.Sprite(proton_sprite_mat)));
    this.e.addInitialize(new Proton.Velocity(0.001, new Proton.Vector3D(0, 1, 0), 0));
    this.e.addInitialize(new Proton.Position(new Proton.BoxZone(0.01)));

    this.e.addBehaviour(new Proton.RandomDrift(0.001, 4, 0.001, 0.1));
    this.e.addBehaviour(new Proton.Scale(new Proton.Span(r1, r2), 0));
    this.e.addBehaviour(new Proton.Color(color, ['#ffff00', '#ffff11'], Infinity, Proton.easeOutSine));

    this.e.p.x = this.tx.t.position.x;
    this.e.p.y = this.tx.t.position.y;
    this.e.emit();

    this.update = function () {
        this.e.p.x = this.tx.t.position.x;
        this.e.p.y = this.tx.t.position.y;
        this.e.p.z = this.tx.t.position.z;
    }
}

function GoodTxEmitter(tx) {
    TxEmitter.call(this, tx, 0x0000ff, 1, 1.1);
}
function BadTxEmitter(tx) {
    TxEmitter.call(this, tx, RED, 1, 2);
}

function ParticleEmitter(p, color, r1, r2) {
    this.e = new Proton.Emitter();
    this.p = p;

    recycle_proton.addEmitter(this.e);

    this.e.rate = new Proton.Rate(new Proton.Span(1, 1), .2);
    this.e.addInitialize(new Proton.Life(0.1, 0.4));
    this.e.addInitialize(new Proton.Body(new THREE.Sprite(proton_sprite_mat)));
    this.e.addInitialize(new Proton.Velocity(0.001, new Proton.Vector3D(0, 1, 0), 0));
    this.e.addInitialize(new Proton.Position(new Proton.BoxZone(0.01)));

    this.e.addBehaviour(new Proton.RandomDrift(0.001, 4, 0.001, 0.1));
    this.e.addBehaviour(new Proton.Scale(new Proton.Span(r1, r2), 0));
    this.e.addBehaviour(new Proton.Color(color, ['#ffff00', '#ffff11'], Infinity, Proton.easeOutSine));

    this.e.p.x = this.p.p.position.x;
    this.e.p.y = this.p.p.position.y;
    this.e.emit();

    this.update = function () {
        this.e.p.x = this.p.p.position.x;
        this.e.p.y = this.p.p.position.y;
        this.e.p.z = this.p.p.position.z;
        // this.e.rate = new Proton.Rate(new Proton.Span(1,1), block_rate/4)
    }
}

function WhiteParticleEmitter(p) {
    ParticleEmitter.call(this, p, 0xff00ff, 1, 2);
}

function CoinEmitter(c) {
    this.e = new Proton.Emitter();
    this.c = c;
    this.behave = new Proton.Color(0xffffff, ['#ffff00', '#ffb601'], Infinity, Proton.easeOutSine);

    coin_proton.addEmitter(this.e);

    this.e.rate = new Proton.Rate(new Proton.Span(1, 1), .2);
    this.e.addInitialize(new Proton.Life(0.1, 0.4));
    this.e.addInitialize(new Proton.Body(new THREE.Sprite(proton_sprite_mat)));
    this.e.addInitialize(new Proton.Velocity(0.001, new Proton.Vector3D(0, 1, 0), 0));
    this.e.addInitialize(new Proton.Position(new Proton.BoxZone(0.01)));

    this.e.addBehaviour(new Proton.RandomDrift(0.001, 4, 0.001, 0.1));
    this.e.addBehaviour(new Proton.Scale(new Proton.Span(1, 1), 0));
    this.e.addBehaviour(this.behave);
    // this.e.removeBehaviour(this.behave)
    // this.e.addBehaviour(new Proton.Color(0xff0000, ['#ffff00', '#ffb601'], Infinity, Proton.easeOutSine))
    this.e.emit();

    this.update = function () {
        this.e.p.x = this.c.c.position.x;
        this.e.p.y = this.c.c.position.y;
        this.e.p.z = this.c.c.position.z;
    }
}

const coin_colors = [
    0xffffff, //white
    0xffff00, //yellow
    0xffa601, //orange
    // 0xff6901, // redder orange
    0xff3501, // red orange
    0xff017c, // pink
    0xff01b4, // magenta
    // 0xeb01ff, // purple
    0x7f01ff, // purple blue
    0x2a01ff // blue
]
var coin_color_count = 0;

function BoltEmitter(b) {
    this.e = new Proton.Emitter();
    this.b = b;

    recycle_proton.addEmitter(this.e);

    this.e.rate = new Proton.Rate(new Proton.Span(1, 5), block_rate / 2);
    this.e.addInitialize(new Proton.Life(0.1, 0.4));
    this.e.addInitialize(new Proton.Body(new THREE.Sprite(proton_sprite_mat)));
    this.e.addInitialize(new Proton.Velocity(0.1, new Proton.Vector3D(0, 1, 0), 0));
    this.e.addInitialize(new Proton.Position(new Proton.BoxZone(0.1)));

    this.e.addBehaviour(new Proton.RandomDrift(0.001, 4, 0.001, 0.1));
    this.e.addBehaviour(new Proton.Scale(new Proton.Span(0.5, 0.5), 0));
    this.e.emit();

    this.update = function () {
        this.e.p.x = this.b.b.position.x;
        this.e.p.y = this.b.b.position.y;
        this.e.p.z = this.b.b.position.z;
    }
}

function BackEmitter(x, y) {
    this.e = new Proton.Emitter();
    this.color = new Proton.Color(0xffffff, ['#ffffff'], Infinity, Proton.easeOutSine);

    back_proton.addEmitter(this.e);

    this.e.rate = new Proton.Rate(1, block_rate);
    this.e.addInitialize(new Proton.Life(0.1, 0.4));
    this.e.addInitialize(new Proton.Body(new THREE.Sprite(proton_sprite_mat)));
    this.e.addInitialize(new Proton.Velocity(0.001, new Proton.Vector3D(0, 1, 0), 0));
    this.e.addInitialize(new Proton.Position(new Proton.BoxZone(0.1)));

    this.e.addBehaviour(new Proton.RandomDrift(0.001, 4, 0.001, 0.1));
    this.e.addBehaviour(new Proton.Scale(new Proton.Span(0.5, 0.5), 0));
    this.e.addBehaviour(this.color);

    this.e.emit();

    this.e.p.x = x;
    this.e.p.y = y;
    this.e.p.z = 1;
}

function TravelingEmitter(x, y) {
    this.e = new Proton.Emitter();
    back_proton.addEmitter(this.e);
    this.x = x;
    this.y = y;

    this.e.rate = new Proton.Rate(4, 0.2);
    this.e.addInitialize(new Proton.Life(0.1, 0.4));
    this.e.addInitialize(new Proton.Body(new THREE.Sprite(proton_sprite_mat)));
    this.e.addInitialize(new Proton.Velocity(0.001, new Proton.Vector3D(0, 1, 0), 0));
    this.e.addInitialize(new Proton.Position(new Proton.BoxZone(0.1)));

    this.e.addBehaviour(new Proton.RandomDrift(0.001, 4, 0.001, 0.1));
    this.e.addBehaviour(new Proton.Scale(new Proton.Span(0.5, 0.5), 0));
    this.e.addBehaviour(new Proton.Color(0xffffff, ['#ffffff'], Infinity, Proton.easeOutSine));

    this.e.emit();

    this.update = function () {
        const speed = 0.1;
        let dist_x = Math.abs(this.e.p.x - this.x);
        let dist_y = Math.abs(this.e.p.y - this.y);
        // let dist_z = Math.abs(this.d.position.z - this.z);

        let dir_x = (this.e.p.x < this.x) ? 1 : -1;
        let dir_y = (this.e.p.y < this.y) ? 1 : -1;
        // let dir_z = (this.e.position.z < this.z) ? 1 : -1;

        this.e.p.x += Math.min(speed, dist_x) * dir_x;
        this.e.p.y += Math.min(speed, dist_y) * dir_y;
        // this.e.position.z += Math.min(speed, dist_z) * dir_z;
    }

    this.reset = function () {
        this.e.p.x = -3;
        this.e.p.y = 0;
        this.x = -3;
        this.y = 0;
    }

    this.set = function (x, y) {
        this.x = x;
        this.y = y;
    }
}

