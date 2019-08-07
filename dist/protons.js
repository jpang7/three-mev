var coin_proton = new Proton();
coin_proton.addRender(new Proton.MeshRender(scene));

var recycle_proton = new Proton();
recycle_proton.addRender(new Proton.MeshRender(scene));

var coin_proton_list = [];
var recycle_proton_list = [];

const proton_map = new THREE.TextureLoader().load("../playground/dot6.png");
const proton_sprite_mat = new THREE.SpriteMaterial({map:proton_map, color:0xff0000, blending: THREE.AdditiveBlending, fog: true});

function TxEmitter(tx,color,r1,r2) {
    this.e = new Proton.Emitter();
    this.tx = tx;

    recycle_proton.addEmitter(this.e);

    this.e.rate = new Proton.Rate(new Proton.Span(3,5), new Proton.Span(.01,.1));
    this.e.addInitialize(new Proton.Life(0.1,0.2));
    this.e.addInitialize(new Proton.Body(new THREE.Sprite(proton_sprite_mat)));
    this.e.addInitialize(new Proton.Velocity(0.001, new Proton.Vector3D(0,1,0), 0));
    this.e.addInitialize(new Proton.Position(new Proton.BoxZone(0.01)));

    this.e.addBehaviour(new Proton.RandomDrift(0.001,4,0.001, 0.1));
    this.e.addBehaviour(new Proton.Scale(new Proton.Span(r1,r2), 0));
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
    TxEmitter.call(this,tx,0x0000ff,1,1.1);
}
function BadTxEmitter(tx) {
    TxEmitter.call(this,tx,RED,1,2);
}

function ParticleEmitter(p,color,r1,r2) {
    this.e = new Proton.Emitter();
    this.p = p;

    recycle_proton.addEmitter(this.e);

    this.e.rate = new Proton.Rate(new Proton.Span(1,1), .2);
    this.e.addInitialize(new Proton.Life(0.1,0.4));
    this.e.addInitialize(new Proton.Body(new THREE.Sprite(proton_sprite_mat)));
    this.e.addInitialize(new Proton.Velocity(0.001, new Proton.Vector3D(0,1,0), 0));
    this.e.addInitialize(new Proton.Position(new Proton.BoxZone(0.01)));

    this.e.addBehaviour(new Proton.RandomDrift(0.001,4,0.001, 0.1));
    this.e.addBehaviour(new Proton.Scale(new Proton.Span(r1,r2), 0));
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
    ParticleEmitter.call(this,p,0xff00ff,1,2);
}

function CoinEmitter(c) {
    this.e = new Proton.Emitter();
    this.c = c;
    this.behave = new Proton.Color(0xffffff, ['#ffff00', '#ffb601'], Infinity, Proton.easeOutSine);

    coin_proton.addEmitter(this.e);

    this.e.rate = new Proton.Rate(new Proton.Span(1,1), .2);
    this.e.addInitialize(new Proton.Life(0.1,0.4));
    this.e.addInitialize(new Proton.Body(new THREE.Sprite(proton_sprite_mat)));
    this.e.addInitialize(new Proton.Velocity(0.001, new Proton.Vector3D(0,1,0), 0));
    this.e.addInitialize(new Proton.Position(new Proton.BoxZone(0.01)));

    this.e.addBehaviour(new Proton.RandomDrift(0.001,4,0.001, 0.1));
    this.e.addBehaviour(new Proton.Scale(new Proton.Span(1,1), 0));
    this.e.addBehaviour(this.behave);
    // this.e.removeBehaviour(this.behave)
    // this.e.addBehaviour(new Proton.Color(0xff0000, ['#ffff00', '#ffb601'], Infinity, Proton.easeOutSine))
    this.e.emit();
    
    this.update = function() {
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