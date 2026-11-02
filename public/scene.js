'use strict';
const canvas=document.querySelector('#scene'),button=document.querySelector('#motion');
let paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
function label(){button.setAttribute('aria-pressed',String(paused));button.textContent=`Motion: ${paused?'off':'on'} ◉`}label();
function fallback(){if(canvas.parentElement.querySelector('.lock-fallback'))return;canvas.hidden=true;canvas.classList.add('canvas-hidden');const img=document.createElement('img');img.src='lock-key.svg';img.alt='Sculptural red padlock and key';img.className='lock-fallback';canvas.after(img);button.hidden=true;}
const gl=canvas.getContext('webgl2',{alpha:true,antialias:false,powerPreference:'low-power'});
if(gl){
const vs=`#version 300 es
in vec2 a;out vec2 uv;void main(){uv=a;gl_Position=vec4(a,0.,1.);}`;
const fs=`#version 300 es
precision highp float;in vec2 uv;out vec4 color;uniform float t;uniform float aspect;
mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
float box(vec3 p,vec3 b,float r){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.)-r;}
float shape(vec3 p){
p.xz=rot(.22+sin(t*.35)*.16)*p.xz;p.xy=rot(-.09+sin(t*.25)*.035)*p.xy;
vec3 l=p-vec3(-.38,-.16,0.);
float body=box(l,vec3(.58,.49,.21),.13);
vec3 h=l-vec3(0.,.17,.27);
float hole=min(length(h.xy-vec2(0.,.02))-.11,box(h-vec3(0.,-.13,0.),vec3(.045,.12,.5),.012));
body=max(body,-hole);
vec3 u=p-vec3(-.38,.58,0.);
float bow=length(vec2(length(u.xy)-.43,u.z))-.105;
bow=max(bow,-u.y);
float leg1=box(p-vec3(-.81,.43,0.),vec3(.075,.18,.075),.03);
float leg2=box(p-vec3(.05,.43,0.),vec3(.075,.18,.075),.03);
float lock=min(body,min(bow,min(leg1,leg2)));
vec3 k=p-vec3(.92,-.16,.32);k.xy=rot(-.48+sin(t*.35)*.04)*k.xy;
float ring=length(vec2(length(k.xy-vec2(0.,.51))-.235,k.z))-.085;
float shaft=box(k-vec3(0.,-.08,0.),vec3(.055,.42,.055),.025);
float tooth1=box(k-vec3(.115,-.28,0.),vec3(.14,.055,.055),.025);
float tooth2=box(k-vec3(.10,-.46,0.),vec3(.125,.055,.055),.025);
return min(lock,min(ring,min(shaft,min(tooth1,tooth2))));}
void main(){vec2 p=uv;p.x*=aspect;vec3 ro=vec3(0.,0.,4.6),rd=normalize(vec3(p,-3.));rd.yz=rot(-.13)*rd.yz;float d=0.;bool hit=false;vec3 pos;for(int i=0;i<85;i++){pos=ro+rd*d;float s=shape(pos);if(s<.0015){hit=true;break;}d+=s*.8;if(d>9.)break;}
vec3 c=vec3(.067,.067,.063);if(hit){vec2 e=vec2(.002,0.);vec3 n=normalize(vec3(shape(pos+e.xyy)-shape(pos-e.xyy),shape(pos+e.yxy)-shape(pos-e.yxy),shape(pos+e.yyx)-shape(pos-e.yyx)));vec3 l=normalize(vec3(-3.,4.,5.));float dif=max(dot(n,l),0.);float spec=pow(max(dot(reflect(-l,n),-rd),0.),40.);float rim=pow(1.-max(dot(n,-rd),0.),2.);float grooves=.97+.03*sin(pos.y*150.);c=vec3(.58,.025,.016)*(.18+dif*1.25)*grooves+vec3(1.,.49,.32)*spec*.9+vec3(.32,.022,.013)*rim; c=pow(c,vec3(.83));}color=vec4(c,hit?1.:0.);}`;
function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
try{const prog=gl.createProgram();gl.attachShader(prog,shader(gl.VERTEX_SHADER,vs));gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error('Shader link failed');gl.useProgram(prog);const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const a=gl.getAttribLocation(prog,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);const time=gl.getUniformLocation(prog,'t'),ratio=gl.getUniformLocation(prog,'aspect');let clock=0,last=0,visible=true;const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting});observer.observe(canvas);function draw(now){if(visible&&!document.hidden){if(!paused)clock+=Math.min((now-last)/1000,.05);const scale=Math.min(devicePixelRatio,1.5),w=Math.min(2048,Math.max(1,Math.round(canvas.clientWidth*scale))),h=Math.min(2048,Math.max(1,Math.round(canvas.clientHeight*scale)));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}gl.uniform1f(time,clock);gl.uniform1f(ratio,w/h);gl.drawArrays(gl.TRIANGLES,0,6);}last=now;requestAnimationFrame(draw)}requestAnimationFrame(draw);}catch(e){fallback();}
}else{fallback();}
button.addEventListener('click',()=>{paused=!paused;label()});
document.querySelector('#year').textContent=new Date().getFullYear();
