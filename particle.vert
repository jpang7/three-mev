uniform sampler2D uTexture;// This must take in 
// a texture from the external environment
// so shaders can just be an abstraction on a general set of
// images
uniform sampler2D uTouch;

varying vec2 vPUv;
varying vec2 vUv;// mapping from (x,y,z) to (u,v) space

#pragma glslify:snoise2=require(glsl-noise/simplex/2d)

float random(float n){
    return fract(sin(n)*43758.5453123);
}

void main(){
    vUv=uv;
    
    // particle uv
    // offset undeclared here-- so in the .js file you can import?
    vec2 puv=offset.xy/uTextureSize;//normalize xy
    vPUv=puv;
    
    // pixel color
    vec4 colA=texture2D(uTexture,puv);
    float grey=colA.r*.21+colA.g*.71+colA.b*.07;
    
    // displacement
    vec3 displaced=offset;
    
    // randomize
    // outputs position of particles according to offset attribute
    // random and noise
    displaced.xy+=vec2(random(pindex)-.5,random(offset.x+pindex)-.5)*uRandom;
    float rndz=(random(pindex)+snoise_1_2(vec2(pindex*.1,uTime*.1)));
    // z is based on time
    displaced.z+=rndz*(random(pindex)*2.*uDepth);
    
    // touch
    float t=texture2D(uTouch,puv).r;
    displaced.z+=t*20.*rndz;
    displaced.x+=cos(angle)*t*20.*rndz;
    displaced.y+=sin(angle)*t*20.*rndz;
    
    // particle size
    float psize=(snoise_1_2(vec2(uTime,pindex)*.5)+2.);
    psize*=max(grey,.2);
    psize*=uSize;
    
    // final position
    vec4 mvPosition=modelViewMatrix*vec4(displaced,1.);
    mvPosition.xyz+=position*psize;
    vec4 finalPosition=projectionMatrix*mvPosition;
    
    gl_Position=finalPosition;
}