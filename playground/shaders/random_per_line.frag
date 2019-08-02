// Author:
// Title:

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

vec3 blue=vec3(.2,.2,1.);
vec3 orange=vec3(1.,.4,0.);
vec3 cloud=vec3(1.,.9,.7);

float PI=3.14;

float plot(vec2 st,float pct){
    return smoothstep(pct-.01,pct,st.y)-
    smoothstep(pct,pct+.01,st.y);
}

float random(in float x){
    return fract(sin(x)*1e4);
}

float random(in vec2 _st){
    return fract(sin(dot(_st.xy,
                vec2(12.9898,78.233)))*
            43758.5453123);
        }
        
        float projectile(vec2 st){
            float t=smoothstep(.172,.189,1.-st.y);
            float b=step(.8,st.y);
            float l=step(.7+sin(u_time),st.x);
            float r=step(.2-sin(u_time),1.-st.x);
            return t*b*l*r;
        }
        
        float pr_y(vec2 st,float y){
            float t=step(.172-y,1.-st.y);
            float b=step(.8+y,st.y);
            float l=step(.7+sin(u_time),st.x);
            float r=step(.2-sin(u_time),1.-st.x);
            return t*b*l*r;
        }
        
        float p(vec2 st,float y,float off){
            float t=step(.172-y,1.-st.y);
            float b=step(.8+y,st.y);
            float l=step(.7+(sin(u_time+off)+off),st.x);
            float r=step(.2-(sin(u_time+off)+off),1.-st.x);
            return t*b*l*r;
        }
        
        void main(){
            vec2 st=gl_FragCoord.xy/u_resolution.xy;
            st.y*=20.;
            // st.y = fract(st.y);
            
            vec2 fPos=fract(st);
            vec2 iPos=floor(st);
            
            vec3 color=vec3(.1);
            
            vec3 p1=vec3(p(fPos,.036,random(iPos+u_time)));
            vec3 p2=vec3(p(fPos,-.1,random(iPos)))*cloud;
            vec3 p3=vec3(p(fPos,-.5,random(.3)))*blue;
            vec3 p4=vec3(p(fPos,-.512,.3))*vec3(1.,1.,0.);
            
            vec3 final=p1;
            +
            p2;
            +
            p3;
            +
            p4;
            
            // color= final * vec3(0.,1.,0.);
            color=final;
            
            gl_FragColor=vec4(color,1.);
        }