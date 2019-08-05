// Energy Field
// By: Brandon Fogerty
// bfogerty at gmail dot com 
// xdpixel.com
// Special thanks to Inigo Quilez for noise!

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
    
    // vec2 uv=(gl_FragCoord.xy/u_resolution.xy)*2.-1.;
    vec2 uv=(gl_FragCoord.xy/u_resolution.xy)*2.-1.;
    // uv.x*=u_resolution.x/u_resolution.y;
    uv.xy=uv.yx;
    
    vec3 lineColor1=vec3(2.3,.5,.5);
    vec3 lineColor2=vec3(.3,.5,2.5);
    
    vec3 finalColor=vec3(0.);
    
    float t=sin(u_time)*.5+.5;
    float pulse=mix(.10,.20,t);
    
    finalColor+=drawLines(uv,vec3(1.,20.,30.),lineColor1,lineColor2)*pulse;
    finalColor+=drawLines(uv,vec3(1.,2.,4.),lineColor1,lineColor2);
    
    gl_FragColor=vec4(finalColor,1.);
    
}