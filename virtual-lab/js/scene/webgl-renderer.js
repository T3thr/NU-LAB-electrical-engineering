/* Small WebGL 1 renderer: real meshes, perspective projection, depth testing,
   directional lighting and live Canvas textures. No runtime dependencies. */
(() => {
  const V = {
    add: (a,b) => a.map((x,i)=>x+b[i]), sub: (a,b)=>a.map((x,i)=>x-b[i]),
    scale:(a,s)=>a.map(x=>x*s), dot:(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),
    cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
    norm:a=>{const d=Math.hypot(...a)||1;return a.map(x=>x/d);}
  };
  function multiply(a,b) { const c=new Float32Array(16);for(let j=0;j<4;j++)for(let i=0;i<4;i++)for(let k=0;k<4;k++)c[j*4+i]+=a[k*4+i]*b[j*4+k];return c; }
  function perspective(fov,aspect,near,far) { const f=1/Math.tan(fov/2);return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0]); }
  function lookAt(eye,target) { const z=V.norm(V.sub(eye,target)),x=V.norm(V.cross([0,1,0],z)),y=V.cross(z,x); return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-V.dot(x,eye),-V.dot(y,eye),-V.dot(z,eye),1]); }
  function transform(p,s=[1,1,1],basis=[[1,0,0],[0,1,0],[0,0,1]]) { return new Float32Array([...basis[0].map(v=>v*s[0]),0,...basis[1].map(v=>v*s[1]),0,...basis[2].map(v=>v*s[2]),0,...p,1]); }
  const vertex=`attribute vec3 position;attribute vec3 normal;attribute vec2 uv;uniform mat4 model;uniform mat4 viewProjection;varying vec3 n;varying vec2 texcoord;void main(){gl_Position=viewProjection*model*vec4(position,1.0);n=normalize(mat3(model)*normal);texcoord=uv;}`;
  const fragment=`precision mediump float;varying vec3 n;varying vec2 texcoord;uniform vec3 color;uniform sampler2D image;uniform float textured;uniform float unlit;void main(){vec3 base=color*mix(vec3(1.0),texture2D(image,texcoord).rgb,textured);float light=mix(0.57+0.43*max(dot(normalize(n),normalize(vec3(-0.45,0.85,0.6))),0.0),1.0,unlit);gl_FragColor=vec4(base*light,1.0);}`;
  class Renderer {
    constructor(canvas) { this.canvas=canvas;this.init(); }
    init() {
      const gl=this.canvas.getContext('webgl',{antialias:true,alpha:false,powerPreference:'low-power'});if(!gl)throw new Error('WebGL unavailable');this.gl=gl;
      const compile=(type,code)=>{const shader=gl.createShader(type);gl.shaderSource(shader,code);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));return shader;};
      this.program=gl.createProgram();const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);gl.attachShader(this.program,vs);gl.attachShader(this.program,fs);gl.linkProgram(this.program);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(this.program));gl.deleteShader(vs);gl.deleteShader(fs);gl.useProgram(this.program);
      this.uniforms=Object.fromEntries(['model','viewProjection','color','image','textured','unlit'].map(k=>[k,gl.getUniformLocation(this.program,k)]));this.attributes=Object.fromEntries(['position','normal','uv'].map(k=>[k,gl.getAttribLocation(this.program,k)]));
      this.textures=new Map();this.white=document.createElement('canvas');this.white.width=this.white.height=1;this.white.getContext('2d').fillStyle='#fff';this.white.getContext('2d').fillRect(0,0,1,1);
      const quad=(out,points,normal)=>{const uv=[[0,0],[1,0],[1,1],[0,1]];for(const i of [0,1,2,0,2,3])out.push(...points[i],...normal,...uv[i]);};
      let box=[];quad(box,[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]],[0,0,1]);quad(box,[[.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5]],[0,0,-1]);quad(box,[[-.5,-.5,-.5],[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5]],[-1,0,0]);quad(box,[[.5,-.5,.5],[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5]],[1,0,0]);quad(box,[[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5],[-.5,.5,-.5]],[0,1,0]);quad(box,[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]],[0,-1,0]);
      let plane=[];quad(plane,[[-.5,-.5,0],[.5,-.5,0],[.5,.5,0],[-.5,.5,0]],[0,0,1]);
      let cylinder=[];for(let i=0;i<16;i++){const a=i/16*Math.PI*2,b=(i+1)/16*Math.PI*2;const p=[Math.cos(a),0,Math.sin(a)],q=[Math.cos(b),0,Math.sin(b)];quad(cylinder,[[p[0],-.5,p[2]],[q[0],-.5,q[2]],[q[0],.5,q[2]],[p[0],.5,p[2]]],V.norm(V.add(p,q)));for(const side of [-1,1])cylinder.push(0,side*.5,0,0,side,0,.5,.5,p[0],side*.5,p[2],0,side,0,0,0,q[0],side*.5,q[2],0,side,0,1,1);}
      this.meshes={box:this.mesh(box),plane:this.mesh(plane),cylinder:this.mesh(cylinder)};
      gl.enable(gl.DEPTH_TEST);gl.clearColor(.12,.17,.18,1);gl.uniform1i(this.uniforms.image,0);this.upload(this.white);
    }
    mesh(data){const gl=this.gl,buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);return{buffer,count:data.length/8};}
    upload(canvas){if(!canvas.width||!canvas.height)return;const gl=this.gl;let texture=this.textures.get(canvas);if(!texture){texture=gl.createTexture();this.textures.set(canvas,texture);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);}gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,canvas);}
    begin(camera){const gl=this.gl,dpr=Math.min(devicePixelRatio||1,1.5),w=Math.round(this.canvas.clientWidth*dpr),h=Math.round(this.canvas.clientHeight*dpr);if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}gl.viewport(0,0,w,h);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.program);this.camera=camera;this.eye=V.add(camera.target,[Math.sin(camera.yaw)*Math.cos(camera.pitch)*camera.distance,Math.sin(camera.pitch)*camera.distance,Math.cos(camera.yaw)*Math.cos(camera.pitch)*camera.distance]);this.viewProjection=multiply(perspective(camera.fov||Math.PI/3,w/h,.03,30),lookAt(this.eye,camera.target));gl.uniformMatrix4fv(this.uniforms.viewProjection,false,this.viewProjection);this.calls=0;}
    draw(kind,p,s,color,texture=null,basis,unlit=false){const gl=this.gl,mesh=this.meshes[kind];gl.bindBuffer(gl.ARRAY_BUFFER,mesh.buffer);for(const [name,size,offset] of [['position',3,0],['normal',3,12],['uv',2,24]]){gl.enableVertexAttribArray(this.attributes[name]);gl.vertexAttribPointer(this.attributes[name],size,gl.FLOAT,false,32,offset);}gl.uniformMatrix4fv(this.uniforms.model,false,transform(p,s,basis));gl.uniform3fv(this.uniforms.color,color);gl.uniform1f(this.uniforms.textured,texture?1:0);gl.uniform1f(this.uniforms.unlit,unlit?1:0);gl.bindTexture(gl.TEXTURE_2D,this.textures.get(texture||this.white));gl.drawArrays(gl.TRIANGLES,0,mesh.count);this.calls++;}
    segment(a,b,r,color){const delta=V.sub(b,a),y=V.norm(delta),x=V.norm(V.cross(Math.abs(y[1])>.95?[1,0,0]:[0,1,0],y)),z=V.cross(x,y);this.draw('cylinder',V.scale(V.add(a,b),.5),[r,Math.hypot(...delta),r],color,null,[x,y,z]);}
    project(p){const m=this.viewProjection;const v=[0,0,0,0];for(let i=0;i<4;i++)for(let k=0;k<4;k++)v[i]+=m[k*4+i]*(k===3?1:p[k]);const r=this.canvas.getBoundingClientRect();return{x:r.left+(v[0]/v[3]+1)*r.width/2,y:r.top+(1-v[1]/v[3])*r.height/2,visible:v[3]>0&&v[2]/v[3]<1};}
    ray(x,y){const r=this.canvas.getBoundingClientRect(),forward=V.norm(V.sub(this.camera.target,this.eye)),right=V.norm(V.cross(forward,[0,1,0])),up=V.cross(right,forward),tan=Math.tan(Math.PI/6);return{origin:this.eye,direction:V.norm(V.add(forward,V.add(V.scale(right,(2*(x-r.left)/r.width-1)*tan*r.width/r.height),V.scale(up,(1-2*(y-r.top)/r.height)*tan))))};}
  }
  EE.SceneMath={V,multiply,perspective,lookAt,transform};EE.WebGLRenderer=Renderer;
})();
