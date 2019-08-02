// ============= shaders ============= 

const uniforms1 = {
    "time": { value: 1.0 }
};

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`;

const fragmentShader = `
#include <common>

uniform vec3 iResolution;
uniform float iTime;
uniform sampler2D iChannel0;

// By Daedelus: https://www.shadertoy.com/user/Daedelus
// license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
#define TIMESCALE 0.25 
#define TILES 3
#define COLOR 0.7, 1.6, 1.

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  vec2 uv = fragCoord.xy / iResolution.xy;
  uv.x *= iResolution.x / iResolution.y;
  
  vec4 noise = texture2D(iChannel0, floor(uv * float(TILES)) / float(TILES));
// vec4 noise = texture2D(iChannel0, uv * float(TILES));
//   vec4 noise = texture2D(iChannel0,uv);
  float p = 1.0 - mod(noise.r + noise.g + noise.b + iTime * float(TIMESCALE), 1.0);
//   float p = 1.0 - noise.r + noise.g + noise.b + iTime * float(TIMESCALE);

  p = min(max(p * 3.0 - 1.8, 0.1), 2.0);
  
  vec2 r = mod(uv * float(TILES), 1.0);
  r = vec2(pow(r.x - 0.01, 2.0), pow(r.y - 0.01, 2.0));
  p *= 1.0 - pow(min(1.0, 12.0 * dot(r,r)), 2.0);
//   vec3 c = vec3(random(1.));
//   fragColor = vec4(COLOR, 1.0) * p;

vec3 c = vec3(uv.x + uv.y + 0.3,uv.y + 0.3,uv.x + 0.3);
fragColor = vec4(c, 1.0) * p;
}

varying vec2 vUv;

void main() {
  mainImage(gl_FragColor, vUv * iResolution.xy);
}
`;

const vertexShaderSun = `
uniform vec3 viewVector;
varying float intensity;
void main() {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
    vec3 actual_normal = vec3(modelMatrix * vec4(normal, 0.0));
    intensity = pow( dot(normalize(viewVector), actual_normal), 6.0 );
}
`

const fragmentShaderSun = `
varying float intensity;
void main() {
	vec3 glow = vec3(1., .84, 0.) * intensity;
    gl_FragColor = vec4( glow, 1.0 );
}
`

const whiteFrag = `
varying float intensity;
void main() {
	vec3 glow = vec3(1., 1., 1.) * intensity;
    gl_FragColor = vec4( glow, 1.0 );
}
`

const mat_loader = new THREE.TextureLoader();
const texture = mat_loader.load('https://threejsfundamentals.org/threejs/resources/images/bayer.png');
texture.minFilter = THREE.NearestFilter;
texture.magFilter = THREE.NearestFilter;
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
const uniforms = {
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector3(1, 1, 1) },
    iChannel0: { value: texture },
};
const bleep_material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
});

// ============= phong material =============    

// let white_phong = new THREE.MeshPhongMaterial({ WHITE });
// let white_phong = new THREE.MeshPhongMaterial({
//     color: WHITE, specular: 0x050505, shininess: 100, reflectivity: 1
// })
let red_phong = new THREE.MeshPhongMaterial({ RED });
let grey_phong = new THREE.MeshPhongMaterial({ GREY });

function colored_material(c) {
    if (c == WHITE) return white_phong
    else if (c == RED) return red_phong
    else if (c == GREY) return grey_phong
}

const glow_material = new THREE.ShaderMaterial({
    uniforms: {
        viewVector: {
            type: "v3",
            value: camera.position
        }
    },
    vertexShader: vertexShaderSun,
    fragmentShader: fragmentShaderSun,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    transparent: true
});

const glow_material_white = new THREE.ShaderMaterial({
    uniforms: {
        viewVector: {
            type: "v3",
            value: camera.position
        }
    },
    vertexShader: vertexShaderSun,
    fragmentShader: whiteFrag,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    transparent: true
});