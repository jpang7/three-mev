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
	vec3 glow = vec3(1., .84, 0.) * intensity * 1.5;
    gl_FragColor = vec4( glow, 1.0 );
}
`

const fragmentShaderCustom = `
varying float intensity;
uniform vec3 color;
void main() {
	vec3 glow = color * intensity * 1.5;
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

const pulseShader = `
    #ifdef GL_ES
    precision mediump float;
    #endif

    uniform float u_time;
    uniform vec2 u_resolution;

    float hash(float n){return fract(sin(n)*753.5453123);}

    // Slight modification of iq's noise function.
    float noise(in vec2 x)
    {
        vec2 p=floor(x);
        vec2 f=fract(x);
        f=f*f*(3.-2.*f);
        
        float n=p.x+p.y*157.;
        return mix(
            mix(hash(n+0.),hash(n+1.),f.x),
            mix(hash(n+157.),hash(n+158.),f.x),
        f.y);
    }

    float fbm(vec2 p,vec3 a)
    {
        float v=0.;
        v+=noise(p*a.x)*.5;
        v+=noise(p*a.y)*.25;
        v+=noise(p*a.z)*.125;
        return v;
    }

    vec3 drawLines(vec2 uv,vec3 fbmOffset,vec3 color1,vec3 color2)
    {
        float timeVal=u_time*.1;
        vec3 finalColor=vec3(0.);
        for(int i=0;i<3;++i)
        {
            float indexAsFloat=float(i);
            float amp=40.+(indexAsFloat*5.);
            float period=2.+(indexAsFloat+2.);
            float thickness=mix(.9,1.,noise(uv*10.));
            float t=abs(.9/(sin(uv.x+fbm(uv+timeVal*period,fbmOffset))*amp)*thickness);
            
            finalColor+=t*color1;
        }
        
        for(int i=0;i<5;++i)
        {
            float indexAsFloat=float(i);
            float amp=40.+(indexAsFloat*7.);
            float period=2.+(indexAsFloat+8.);
            float thickness=mix(.7,1.,noise(uv*10.));
            float t=abs(.8/(sin(uv.x+fbm(uv+timeVal*period,fbmOffset))*amp)*thickness);
            
            finalColor+=t*color2*.6;
        }
        
        return finalColor;
    }

    void main(void)
    {
        
        vec2 uv=(gl_FragCoord.xy/u_resolution.xy)*2.-1.;
        uv.x*=u_resolution.x/u_resolution.y;
        uv.xy=uv.yx;
        // vec2 uv=(gl_FragCoord.xy/u_resolution.xy);
        
        vec3 lineColor1=vec3(2.3,.5,.5);
        vec3 lineColor2=vec3(.3,.5,2.5);
        
        vec3 finalColor=vec3(0.);
        
        float t=sin(u_time)*.5+.5;
        float pulse=mix(.10,.20,t);
        
        finalColor+=drawLines(uv,vec3(1.,20.,30.),lineColor1,lineColor2)*pulse;
        finalColor+=drawLines(uv,vec3(1.,2.,4.),lineColor1,lineColor2);
        
        gl_FragColor=vec4(finalColor,1.);
        
    }`;

const bolt_frag = `
    #ifdef GL_ES
    precision mediump float;
    #endif

    uniform vec2 u_resolution;

    void main(void)
    {

        vec2 new_res = u_resolution.xy * 10000.;

        vec2 uv=(gl_FragCoord.xy/(new_res));
        
        vec3 finalColor=vec3(1.,.3,.5);
        
        uv.xy=uv.yx;
        
        finalColor*=abs(1./(uv.x-uv.y*.10));
        
        gl_FragColor=vec4(finalColor,1.);
    }`

const pulse_uniforms = {
    u_time: { value: 0 },
    u_resolution: { value: new THREE.Vector2(1, 1) }
}
pulse_uniforms.u_resolution.value.x = window.innerWidth;
pulse_uniforms.u_resolution.value.y = window.innerHeight / 40;

const pulse_material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: pulseShader,
    uniforms: pulse_uniforms
});

const bolt_uniforms = {
    u_resolution: { value: new THREE.Vector2(0.2, 0.2) }
}

const bolt_material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: bolt_frag,
    uniforms: bolt_uniforms
});

// bolt_uniforms.u_resolution.value.x = window.innerWidth;
// bolt_uniforms.u_resolution.value.y = window.innerHeight;

// const plane_geometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
// const plane = new THREE.Mesh(plane_geometry, bolt_material);
// scene.add(plane);

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

let white_phong = new THREE.MeshPhongMaterial({ WHITE });
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

const glow_material_custom = new THREE.ShaderMaterial({
    uniforms: {
        viewVector: {
            type: "v3",
            value: camera.position
        },
        color: {
            type: "v3",
            value: [1., .84, .0]
        }
    },
    vertexShader: vertexShaderSun,
    fragmentShader: fragmentShaderCustom,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    transparent: true
})

function color_glow(c) {
    return new THREE.ShaderMaterial({
        uniforms: {
            viewVector: {
                type: "v3",
                value: camera.position
            },
            color: {
                type: "v3",
                value: c
            }
        },
        vertexShader: vertexShaderSun,
        fragmentShader: fragmentShaderCustom,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    })
}