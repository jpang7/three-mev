#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

void main(void)
{
    
    vec2 uv=(gl_FragCoord.xy/u_resolution.xy);
    
    vec3 finalColor=vec3(1.,.3,.5);
    
    uv.xy=uv.yx;
    
    finalColor*=abs(1./(uv.x-uv.y*.10));
    
    gl_FragColor=vec4(finalColor,1.);
}