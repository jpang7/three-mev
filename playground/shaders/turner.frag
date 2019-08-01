// Author:
// Title:

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec3 blue = vec3(0.2,0.2,1.);
vec3 orange = vec3(1.,0.4,0.);
vec3 cloud = vec3(1.,0.9,.7);

float PI = 3.14;

float plot(vec2 st, float pct) {
    return smoothstep(pct - .01, pct, st.y) - 
        smoothstep(pct, pct + .01, st.y);
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    
    vec3 pct = vec3(st.x);
    pct.r = smoothstep(0.5,.7,st.x);
    pct.g = smoothstep(0.2,.7,st.x);
    pct.b = smoothstep(0.5,.7,st.x);

    vec3 color = vec3(0.);
    color = mix(blue,orange,pct);
    
    float pct_cloud = sin(PI * st.x);
    color = mix(color,cloud,pct_cloud);

    gl_FragColor = vec4(color,1.0);
}