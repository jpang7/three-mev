import TouchTexture from './TouchTexture';
const glslify = require('glslify');
export default class Particles { //class for all the particles we want to make
    constructor(webgl) {
        this.webgl = webgl;
        this.container = new THREE.Object3D();
    }
    init(src) {
        const loader = new THREE.TextureLoader();
        //the texture must be the picture that we want to mess around with
        loader.load(src, (texture) => { //i thnk once we load a texture we call everything
            this.texture = texture;
            this.texture.minFilter = THREE.LinearFilter; //linear filter...
            this.texture.magFilter = THREE.LinearFilter;
            this.texture.format = THREE.RBGFormat;

            this.width = texture.image.width;
            this.height = texture.image.height;

            this.initPoints(true); //discard is true
            this.initHitArea();
            this.initTouch();
            this.resize();
            this.show();
        });
    }
    initPoints(discard) {
        this.numPoints = this.width * this.height;

        let numVisible = this.numPoints; //for iterating over pixels
        let threshold = 0;
        let originalColors;

        if (discard) {
            // discard pixels darker than threshold #22
            numVisible = 0;
            threshold = 34;

            const img = this.texture.image;
            // html here
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = this.width;
            canvas.height = this.height;
            ctx.scale(1, -1); // flip y
            ctx.drawImage(img, 0, 0, this.width, this.height * -1); //some drawing function
            //every context must have this

            // what type of data is this? at least some kind of color data
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            originalColors = Float32Array.from(imgData.data);

            // we set numVisible to 0 and kept this.numPoints
            for (let i = 0; i < this.numPoints; i++) {
                if (originalColors[i * 4 + 0] > threshold) numVisible++;
            } // if its bright enough we care about it (only using the r channel)
        }

        // Particle material
        // RawShaderMaterial with particle.vert and particle.frag

        const uniforms = {
            uTime: { value: 0 }, // elapsed time
            uRandom: { value: 1.0 }, // randomness used to displace particles
            uDepth: { value: 2.0 }, // max z-axis oscillation
            uSize: { value: 0.0 }, // base size of particles
            uTextureSize: { value: new THREE.Vector2(this.width, this.height) },
            uTexture: { value: this.texture }, // texture
            uTouch: { value: null }, // touch texture (null)
        }

        const material = new THREE.RawShaderMaterial({
            uniforms,
            vertexShader: glslify(require('./particle.vert')),
            fragmentShader: glslify(require('.shaders/particle.frag')),
            depthTest: false,
            transparent: true
        }) // glslify is a library for loading shaders

        // geometry instancing, geometry particle parametrization
        // InsBufGeo defines the geometry
        // particle geometry is a simple quad. 
        const geometry = new THREE.InstancedBufferGeometry();

        //BufAttr for attributes that remain the same every instance
        const positions = new THREE.BufferAttribute(new Float32Array(4 * 3), 3);

        //0 --> 3, top left, top right, bot left, bot right
        // INDEX, POSITION
        positions.setXYZ(0, -0.5, 0.5, 0.0);
        positions.setXYZ(1, 0.5, 0.5, 0.0);
        positions.setXYZ(2, -0.5, -0.5, 0.0);
        positions.setXYZ(3, 0.5, -0.5, 0.0);
        geometry.addAttribute('position', positions);
        //so we have geometry.position <-- 2d array: 4 elements, each a 3d vector

        const uvs = new THREE.BufferAttribute(new Float32Array(4 * 2), 2);
        // INDEX, UV
        uvs.setXYZ(0, 0.0, 0.0);
        uvs.setXYZ(1, 1.0, 0.0);
        uvs.setXYZ(2, 0.0, 1.0);
        uvs.setXYZ(3, 1.0, 1.0);
        geometry.addAttribute('uv', uvs);
        //geometry.uv <-- 4 elements, each a 2d vector

        // INDEX
        geometry.setIndex(new THREE.BufferAttribute(new Uint16Array([0, 2, 1, 2, 3, 1]), 1));

        //InstancedBufAttr for attributes that vary between instances
        //loop through pixels and assign instanced attributes
        // offset = position of each instance. the x,y pixel of the image
        const indices = new Uint16Array(this.numPoints);
        const offsets = new Float32Array(this.numPoints * 3);
        //  offsets is triple the number of points. 
        const angles = new Float32Array(this.numPoints);

        for (let i = 0; i < this.numPoints; i++) {
            offsets[i * 3 + 0] = i % this.width;  // 0 = x position
            offsets[i * 3 + 1] = Math.floor(i / this.width); // 1 = height, y pos

            indices[i] = i; //save all points

            angles[i] = Math.random() * Math.PI; //some random direction stemming from a circle
        }

        // BufferAttribute( array: typedArray, itemSize: integer, normalized: boolean)
        geometry.addAttribute('pindex', new THREE.InstancedBufferAttribute(indices, 1, false));
        geometry.addAttribute('offset', new THREE.InstancedBufferAttribute(offsets, 3, false));
        geometry.addAttribute('angle', new THREE.InstancedBufferAttribute(angles, 1, false));// geometry instancing, geometry particle parametrization
        // InsBufGeo defines the geometry
        // particle geometry is a simple quad. 
        const geometry = new THREE.InstancedBufferGeometry();

        //BufAttr for attributes that remain the same every instance
        const positions = new THREE.BufferAttribute(new Float32Array(4 * 3), 3);

        //0 --> 3, top left, top right, bot left, bot right
        // INDEX, POSITION
        positions.setXYZ(0, -0.5, 0.5, 0.0);
        positions.setXYZ(1, 0.5, 0.5, 0.0);
        positions.setXYZ(2, -0.5, -0.5, 0.0);
        positions.setXYZ(3, 0.5, -0.5, 0.0);
        geometry.addAttribute('position', positions);
        //so we have geometry.position <-- 2d array: 4 elements, each a 3d vector

        const uvs = new THREE.BufferAttribute(new Float32Array(4 * 2), 2);
        // INDEX, UV
        uvs.setXYZ(0, 0.0, 0.0);
        uvs.setXYZ(1, 1.0, 0.0);
        uvs.setXYZ(2, 0.0, 1.0);
        uvs.setXYZ(3, 1.0, 1.0);
        geometry.addAttribute('uv', uvs);
        //geometry.uv <-- 4 elements, each a 2d vector

        // INDEX
        geometry.setIndex(new THREE.BufferAttribute(new Uint16Array([0, 2, 1, 2, 3, 1]), 1));

        //InstancedBufAttr for attributes that vary between instances
        //loop through pixels and assign instanced attributes
        // offset = position of each instance. the x,y pixel of the image
        const indices = new Uint16Array(this.numPoints);
        const offsets = new Float32Array(this.numPoints * 3);
        //  offsets is triple the number of points. 
        const angles = new Float32Array(this.numPoints);

        for (let i = 0; i < this.numPoints; i++) {
            offsets[i * 3 + 0] = i % this.width;  // 0 = x position
            offsets[i * 3 + 1] = Math.floor(i / this.width); // 1 = height, y pos

            indices[i] = i; //save all points

            angles[i] = Math.random() * Math.PI; //some random direction stemming from a circle
        }

        // BufferAttribute( array: typedArray, itemSize: integer, normalized: boolean)
        geometry.addAttribute('pindex', new THREE.InstancedBufferAttribute(indices, 1, false));
        geometry.addAttribute('offset', new THREE.InstancedBufferAttribute(offsets, 3, false));
        geometry.addAttribute('angle', new THREE.InstancedBufferAttribute(angles, 1, false));
    }

    initTouch() {
        //create only once
        if (!this.touch) this.touch = new TouchTexture(this);
        this.Object3D.material.uniforms.uTouch.value = this.touch.texture;
    }

    initHitArea() {
        const geometry = new THREE.PlaneGeometry(this.width, this.height, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true, depthTest: false });
        material.visible = false;
        this.hitArea = new THREE.Mesh(geometry, material);
        this.container.add(this.hitArea);
    }

    addListeners() {
        this.handlerInteractiveMove = this.onInteractiveMove.bind(this);

        this.webgl.interactive.addListener('interactive-move', this.handlerInteractiveMove);
        this.webgl.interactive.objects.push(this.hitArea);
        this.webgl.interactive.enable();
    }

    removeListeners() {
        this.interactive.removeListener('interactive-move', this.handlerInteractiveMove);

        const index = this.webgl.interactive.objects.findIndex(obj => obj === this.hitArea);
        this.webgl.interactive.objects.splice(index, 1);
        this.webgl.interactive.disable();
    }

    update(delta) {

    }
}

