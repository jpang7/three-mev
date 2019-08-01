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

    vec3 color = vec3(0.);
	
    float left = step(abs(sin(u_time)),st.x); // square morphs
    left = step(.1, st.x);
    float bot = step(.1,st.y);
    float right = step(.1,1.-st.x);
    float top = step(.1,1.-st.y);
    color = vec3(left * bot * right * top);
    color = 1. - color; // inversion
    
    gl_FragColor = vec4(color,1.0);
}