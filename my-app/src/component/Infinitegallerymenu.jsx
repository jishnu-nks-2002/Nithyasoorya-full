import { useEffect, useRef, useState, useCallback } from 'react';
import { mat4, quat, vec2, vec3 } from 'gl-matrix';

// ─── WebGL Shaders ────────────────────────────────────────────────────────────

const discVertShaderSource = `#version 300 es
uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uCameraPosition;
uniform vec4 uRotationAxisVelocity;
in vec3 aModelPosition;
in vec3 aModelNormal;
in vec2 aModelUvs;
in mat4 aInstanceMatrix;
out vec2 vUvs;
out float vAlpha;
flat out int vInstanceId;
void main() {
    vec4 worldPosition = uWorldMatrix * aInstanceMatrix * vec4(aModelPosition, 1.);
    vec3 centerPos = (uWorldMatrix * aInstanceMatrix * vec4(0., 0., 0., 1.)).xyz;
    float radius = length(centerPos.xyz);
    if (gl_VertexID > 0) {
        vec3 rotationAxis = uRotationAxisVelocity.xyz;
        float rotationVelocity = min(.15, uRotationAxisVelocity.w * 15.);
        vec3 stretchDir = normalize(cross(centerPos, rotationAxis));
        vec3 relativeVertexPos = normalize(worldPosition.xyz - centerPos);
        float strength = dot(stretchDir, relativeVertexPos);
        float invAbsStrength = min(0., abs(strength) - 1.);
        strength = rotationVelocity * sign(strength) * abs(invAbsStrength * invAbsStrength * invAbsStrength + 1.);
        worldPosition.xyz += stretchDir * strength;
    }
    worldPosition.xyz = radius * normalize(worldPosition.xyz);
    gl_Position = uProjectionMatrix * uViewMatrix * worldPosition;
    vAlpha = smoothstep(0.5, 1., normalize(worldPosition.xyz).z) * .9 + .1;
    vUvs = aModelUvs;
    vInstanceId = gl_InstanceID;
}`;

const discFragShaderSource = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform int uItemCount;
uniform int uAtlasSize;
out vec4 outColor;
in vec2 vUvs;
in float vAlpha;
flat in int vInstanceId;
void main() {
    int itemIndex = vInstanceId % uItemCount;
    int cellX = itemIndex % uAtlasSize;
    int cellY = itemIndex / uAtlasSize;
    vec2 cellSize = vec2(1.0) / vec2(float(uAtlasSize));
    vec2 cellOffset = vec2(float(cellX), float(cellY)) * cellSize;
    vec2 st = vec2(vUvs.x, 1.0 - vUvs.y);
    st = clamp(st, 0.0, 1.0);
    st = st * cellSize + cellOffset;
    outColor = texture(uTex, st);
    outColor.a *= vAlpha;
}`;

// ─── Geometry ─────────────────────────────────────────────────────────────────
class Face { constructor(a,b,c){this.a=a;this.b=b;this.c=c;} }
class Vertex {
  constructor(x,y,z){ this.position=vec3.fromValues(x,y,z); this.normal=vec3.create(); this.uv=vec2.create(); }
}
class Geometry {
  constructor(){this.vertices=[];this.faces=[];}
  addVertex(...args){for(let i=0;i<args.length;i+=3)this.vertices.push(new Vertex(args[i],args[i+1],args[i+2]));return this;}
  addFace(...args){for(let i=0;i<args.length;i+=3)this.faces.push(new Face(args[i],args[i+1],args[i+2]));return this;}
  get lastVertex(){return this.vertices[this.vertices.length-1];}
  subdivide(d=1){
    const cache={};let f=this.faces;
    for(let div=0;div<d;++div){
      const nf=new Array(f.length*4);
      f.forEach((face,ndx)=>{
        const mAB=this.getMidPoint(face.a,face.b,cache),mBC=this.getMidPoint(face.b,face.c,cache),mCA=this.getMidPoint(face.c,face.a,cache);
        const i=ndx*4;nf[i]=new Face(face.a,mAB,mCA);nf[i+1]=new Face(face.b,mBC,mAB);nf[i+2]=new Face(face.c,mCA,mBC);nf[i+3]=new Face(mAB,mBC,mCA);
      });f=nf;
    }this.faces=f;return this;
  }
  spherize(r=1){this.vertices.forEach(v=>{vec3.normalize(v.normal,v.position);vec3.scale(v.position,v.normal,r);});return this;}
  get vertexData(){return new Float32Array(this.vertices.flatMap(v=>Array.from(v.position)));}
  get uvData(){return new Float32Array(this.vertices.flatMap(v=>Array.from(v.uv)));}
  get indexData(){return new Uint16Array(this.faces.flatMap(f=>[f.a,f.b,f.c]));}
  get data(){return{vertices:this.vertexData,indices:this.indexData,normals:new Float32Array(this.vertices.flatMap(v=>Array.from(v.normal))),uvs:this.uvData};}
  getMidPoint(a,b,cache){
    const key=a<b?`k_${b}_${a}`:`k_${a}_${b}`;
    if(Object.prototype.hasOwnProperty.call(cache,key))return cache[key];
    const pa=this.vertices[a].position,pb=this.vertices[b].position,ndx=this.vertices.length;cache[key]=ndx;
    this.addVertex((pa[0]+pb[0])*.5,(pa[1]+pb[1])*.5,(pa[2]+pb[2])*.5);return ndx;
  }
}
class IcosahedronGeometry extends Geometry {
  constructor(){
    super();const t=Math.sqrt(5)*0.5+0.5;
    this.addVertex(-1,t,0,1,t,0,-1,-t,0,1,-t,0,0,-1,t,0,1,t,0,-1,-t,0,1,-t,t,0,-1,t,0,1,-t,0,-1,-t,0,1)
        .addFace(0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1);
  }
}
class DiscGeometry extends Geometry {
  constructor(_=4,r=1){
    super();const h=r;
    this.addVertex(-h,-h,0);this.lastVertex.uv[0]=0;this.lastVertex.uv[1]=0;
    this.addVertex(h,-h,0);this.lastVertex.uv[0]=1;this.lastVertex.uv[1]=0;
    this.addVertex(h,h,0);this.lastVertex.uv[0]=1;this.lastVertex.uv[1]=1;
    this.addVertex(-h,h,0);this.lastVertex.uv[0]=0;this.lastVertex.uv[1]=1;
    this.addFace(0,1,2);this.addFace(0,2,3);
  }
}

// ─── WebGL Helpers ────────────────────────────────────────────────────────────
function createShader(gl,type,src){
  const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);
  if(gl.getShaderParameter(s,gl.COMPILE_STATUS))return s;
  console.error(gl.getShaderInfoLog(s));gl.deleteShader(s);return null;
}
function createProgram(gl,srcs,tf,attribs){
  const p=gl.createProgram();
  [gl.VERTEX_SHADER,gl.FRAGMENT_SHADER].forEach((t,i)=>{const s=createShader(gl,t,srcs[i]);if(s)gl.attachShader(p,s);});
  if(tf)gl.transformFeedbackVaryings(p,tf,gl.SEPARATE_ATTRIBS);
  if(attribs)for(const a in attribs)gl.bindAttribLocation(p,attribs[a],a);
  gl.linkProgram(p);
  if(gl.getProgramParameter(p,gl.LINK_STATUS))return p;
  console.error(gl.getProgramInfoLog(p));gl.deleteProgram(p);return null;
}
function makeBuffer(gl,data,usage){
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,usage);gl.bindBuffer(gl.ARRAY_BUFFER,null);return b;
}
function makeVertexArray(gl,pairs,indices){
  const va=gl.createVertexArray();gl.bindVertexArray(va);
  for(const[buffer,loc,n]of pairs){
    if(loc===-1)continue;gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,n,gl.FLOAT,false,0,0);
  }
  if(indices){const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);}
  gl.bindVertexArray(null);return va;
}
function resizeCanvasToDisplaySize(canvas){
  const dpr=Math.min(2,window.devicePixelRatio),w=Math.round(canvas.clientWidth*dpr),h=Math.round(canvas.clientHeight*dpr);
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;return true;}return false;
}
function createTex(gl,min,mag,ws,wt){
  const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,ws);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,wt);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,min);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,mag);
  return t;
}

// ─── ArcballControl ───────────────────────────────────────────────────────────
class ArcballControl {
  isPointerDown=false;orientation=quat.create();pointerRotation=quat.create();
  rotationVelocity=0;rotationAxis=vec3.fromValues(1,0,0);
  snapDirection=vec3.fromValues(0,0,-1);snapTargetDirection;
  EPSILON=0.1;IDENTITY_QUAT=quat.create();
  constructor(canvas,cb){
    this.canvas=canvas;this.updateCallback=cb||(() =>{});
    this.pointerPos=vec2.create();this.previousPointerPos=vec2.create();
    this._rotationVelocity=0;this._combinedQuat=quat.create();
    canvas.addEventListener('pointerdown',e=>{vec2.set(this.pointerPos,e.clientX,e.clientY);vec2.copy(this.previousPointerPos,this.pointerPos);this.isPointerDown=true;});
    canvas.addEventListener('pointerup',()=>{this.isPointerDown=false;});
    canvas.addEventListener('pointerleave',()=>{this.isPointerDown=false;});
    canvas.addEventListener('pointermove',e=>{if(this.isPointerDown)vec2.set(this.pointerPos,e.clientX,e.clientY);});
    canvas.style.touchAction='none';
  }
  update(dt,tfd=16){
    const ts=dt/tfd+0.00001;let af=ts;let sr=quat.create();
    if(this.isPointerDown){
      const INT=0.3*ts,AA=5/ts;
      const mp=vec2.sub(vec2.create(),this.pointerPos,this.previousPointerPos);vec2.scale(mp,mp,INT);
      if(vec2.sqrLen(mp)>this.EPSILON){
        vec2.add(mp,this.previousPointerPos,mp);
        const p=this.#project(mp),q=this.#project(this.previousPointerPos);
        const a=vec3.normalize(vec3.create(),p),b=vec3.normalize(vec3.create(),q);
        vec2.copy(this.previousPointerPos,mp);af*=AA;this.quatFromVectors(a,b,this.pointerRotation,af);
      }else{quat.slerp(this.pointerRotation,this.pointerRotation,this.IDENTITY_QUAT,INT);}
    }else{
      const INT=0.1*ts;quat.slerp(this.pointerRotation,this.pointerRotation,this.IDENTITY_QUAT,INT);
      if(this.snapTargetDirection){
        const a=this.snapTargetDirection,b=this.snapDirection;
        const df=Math.max(0.1,1-vec3.squaredDistance(a,b)*10);af*=0.2*df;this.quatFromVectors(a,b,sr,af);
      }
    }
    const cq=quat.multiply(quat.create(),sr,this.pointerRotation);
    this.orientation=quat.multiply(quat.create(),cq,this.orientation);quat.normalize(this.orientation,this.orientation);
    quat.slerp(this._combinedQuat,this._combinedQuat,cq,0.8*ts);quat.normalize(this._combinedQuat,this._combinedQuat);
    const rad=Math.acos(Math.max(-1,Math.min(1,this._combinedQuat[3])))*2,s2=Math.sin(rad/2);
    let rv=0;
    if(s2>0.000001){rv=rad/(2*Math.PI);this.rotationAxis[0]=this._combinedQuat[0]/s2;this.rotationAxis[1]=this._combinedQuat[1]/s2;this.rotationAxis[2]=this._combinedQuat[2]/s2;}
    this._rotationVelocity+=(rv-this._rotationVelocity)*0.5*ts;this.rotationVelocity=this._rotationVelocity/ts;this.updateCallback(dt);
  }
  quatFromVectors(a,b,out,af=1){
    const axis=vec3.normalize(vec3.create(),vec3.cross(vec3.create(),a,b));
    quat.setAxisAngle(out,axis,Math.acos(Math.max(-1,Math.min(1,vec3.dot(a,b))))*af);
  }
  #project(pos){
    const r=2,w=this.canvas.clientWidth,h=this.canvas.clientHeight,s=Math.max(w,h)-1;
    const x=(2*pos[0]-w-1)/s,y=(2*pos[1]-h-1)/s;
    const xySq=x*x+y*y,rSq=r*r;
    const z=xySq<=rSq/2?Math.sqrt(rSq-xySq):rSq/Math.sqrt(xySq);
    return vec3.fromValues(-x,y,z);
  }
}

// ─── InfiniteGridMenu Engine ──────────────────────────────────────────────────
class InfiniteGridMenu {
  TARGET_FRAME_DURATION=1000/60;SPHERE_RADIUS=2;
  #time=0;#deltaTime=0;#frames=0;
  camera={matrix:mat4.create(),near:0.1,far:40,fov:Math.PI/4,aspect:1,
    position:vec3.fromValues(0,0,3),up:vec3.fromValues(0,1,0),
    matrices:{view:mat4.create(),projection:mat4.create(),inversProjection:mat4.create()}};
  smoothRotationVelocity=0;scaleFactor=1.0;movementActive=false;
  videoElements=[];videoIndices=[];atlasCanvas=null;atlasCtx=null;hasVideo=false;

  constructor(canvas,items,onActive,onMove,onInit=null,scale=1.0){
    this.canvas=canvas;this.items=items||[];
    this.onActiveItemChange=onActive||(() =>{});this.onMovementChange=onMove||(() =>{});
    this.scaleFactor=scale;this.camera.position[2]=3*scale;this.#init(onInit);
  }

  resize(){
    this.viewportSize=vec2.set(this.viewportSize||vec2.create(),this.canvas.clientWidth,this.canvas.clientHeight);
    if(resizeCanvasToDisplaySize(this.gl.canvas))this.gl.viewport(0,0,this.gl.drawingBufferWidth,this.gl.drawingBufferHeight);
    this.#updateProjectionMatrix(this.gl);
  }

  run(time=0){
    this.#deltaTime=Math.min(32,time-this.#time);this.#time=time;
    this.#frames+=this.#deltaTime/this.TARGET_FRAME_DURATION;
    this.#animate(this.#deltaTime);this.#updateVideoFrames();this.#render();
    this._rafId=requestAnimationFrame(t=>this.run(t));
  }

  destroy(){
    if(this._rafId)cancelAnimationFrame(this._rafId);
    this.videoElements.forEach(v=>{v.pause();v.src='';});
  }

  #updateVideoFrames(){
    if(!this.hasVideo||!this.atlasCtx)return;
    const gl=this.gl;let dirty=false;
    this.videoIndices.forEach(({itemIndex,videoEl})=>{
      if(videoEl.readyState<2)return;
      const x=(itemIndex%this.atlasSize)*512,y=Math.floor(itemIndex/this.atlasSize)*512;
      this.atlasCtx.drawImage(videoEl,x,y,512,512);dirty=true;
    });
    if(dirty){gl.bindTexture(gl.TEXTURE_2D,this.tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,this.atlasCanvas);gl.bindTexture(gl.TEXTURE_2D,null);}
  }

  #init(onInit){
    this.gl=this.canvas.getContext('webgl2',{antialias:true,alpha:true});
    const gl=this.gl;if(!gl)throw new Error('No WebGL 2!');
    this.viewportSize=vec2.fromValues(this.canvas.clientWidth,this.canvas.clientHeight);
    this.discProgram=createProgram(gl,[discVertShaderSource,discFragShaderSource],null,{aModelPosition:0,aModelNormal:1,aModelUvs:2,aInstanceMatrix:3});
    const L={};
    ['aModelPosition','aModelUvs','aInstanceMatrix'].forEach(n=>L[n]=gl.getAttribLocation(this.discProgram,n));
    ['uWorldMatrix','uViewMatrix','uProjectionMatrix','uCameraPosition','uScaleFactor','uRotationAxisVelocity','uTex','uFrames','uItemCount','uAtlasSize'].forEach(n=>L[n]=gl.getUniformLocation(this.discProgram,n));
    this.discLocations=L;
    this.discGeo=new DiscGeometry(4,1);this.discBuffers=this.discGeo.data;
    this.discVAO=makeVertexArray(gl,[[makeBuffer(gl,this.discBuffers.vertices,gl.STATIC_DRAW),L.aModelPosition,3],[makeBuffer(gl,this.discBuffers.uvs,gl.STATIC_DRAW),L.aModelUvs,2]],this.discBuffers.indices);
    this.icoGeo=new IcosahedronGeometry();this.icoGeo.subdivide(1).spherize(this.SPHERE_RADIUS);
    this.instancePositions=this.icoGeo.vertices.map(v=>v.position);
    this.DISC_INSTANCE_COUNT=this.icoGeo.vertices.length;
    this.#initDiscInstances(this.DISC_INSTANCE_COUNT);
    this.worldMatrix=mat4.create();
    this.#initTexture();
    this.control=new ArcballControl(this.canvas,dt=>this.#onControlUpdate(dt));
    this.#updateCameraMatrix();this.#updateProjectionMatrix(gl);this.resize();
    if(onInit)onInit(this);
  }

  #initTexture(){
    const gl=this.gl;
    this.tex=createTex(gl,gl.LINEAR,gl.LINEAR,gl.CLAMP_TO_EDGE,gl.CLAMP_TO_EDGE);
    this.atlasSize=Math.ceil(Math.sqrt(Math.max(1,this.items.length)));
    const ac=document.createElement('canvas');ac.width=this.atlasSize*512;ac.height=this.atlasSize*512;
    const ctx=ac.getContext('2d');this.atlasCanvas=ac;this.atlasCtx=ctx;
    ctx.fillStyle='#0d0d1a';ctx.fillRect(0,0,ac.width,ac.height);
    gl.bindTexture(gl.TEXTURE_2D,this.tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,ac);
    Promise.all(this.items.map((item,i)=>item.type==='video'?this.#loadVideoItem(item,i,ctx):this.#loadImageItem(item,i,ctx))).then(()=>{
      gl.bindTexture(gl.TEXTURE_2D,this.tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,ac);gl.generateMipmap(gl.TEXTURE_2D);
    });
  }

  #loadImageItem(item,i,ctx){
    return new Promise(resolve=>{
      const img=new Image();img.crossOrigin='anonymous';
      img.onload=()=>{ctx.drawImage(img,(i%this.atlasSize)*512,Math.floor(i/this.atlasSize)*512,512,512);resolve();};
      img.onerror=()=>resolve(null);img.src=item.image;
    });
  }

  #loadVideoItem(item,i,ctx){
    return new Promise(resolve=>{
      const video=document.createElement('video');
      video.crossOrigin='anonymous';video.src=item.video;video.loop=true;video.muted=true;video.playsInline=true;video.autoplay=true;
      if(item.poster){
        const img=new Image();img.crossOrigin='anonymous';
        img.onload=()=>{ctx.drawImage(img,(i%this.atlasSize)*512,Math.floor(i/this.atlasSize)*512,512,512);};img.src=item.poster;
      }
      video.addEventListener('canplay',()=>{video.play().catch(()=>{});this.hasVideo=true;this.videoIndices.push({itemIndex:i,videoEl:video});resolve();},{once:true});
      video.addEventListener('error',()=>resolve(),{once:true});video.load();this.videoElements.push(video);
    });
  }

  #initDiscInstances(count){
    const gl=this.gl;
    this.discInstances={matricesArray:new Float32Array(count*16),matrices:[],buffer:gl.createBuffer()};
    for(let i=0;i<count;++i){const arr=new Float32Array(this.discInstances.matricesArray.buffer,i*64,16);arr.set(mat4.create());this.discInstances.matrices.push(arr);}
    gl.bindVertexArray(this.discVAO);gl.bindBuffer(gl.ARRAY_BUFFER,this.discInstances.buffer);
    gl.bufferData(gl.ARRAY_BUFFER,this.discInstances.matricesArray.byteLength,gl.DYNAMIC_DRAW);
    for(let j=0;j<4;++j){const loc=this.discLocations.aInstanceMatrix+j;gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,4,gl.FLOAT,false,64,j*16);gl.vertexAttribDivisor(loc,1);}
    gl.bindBuffer(gl.ARRAY_BUFFER,null);gl.bindVertexArray(null);
  }

  #animate(dt){
    const gl=this.gl;this.control.update(dt,this.TARGET_FRAME_DURATION);
    const positions=this.instancePositions.map(p=>vec3.transformQuat(vec3.create(),p,this.control.orientation));
    positions.forEach((p,ndx)=>{
      const s=(Math.abs(p[2])/this.SPHERE_RADIUS)*0.6+0.4,fs=s*0.25,m=mat4.create();
      mat4.multiply(m,m,mat4.fromTranslation(mat4.create(),vec3.negate(vec3.create(),p)));
      mat4.multiply(m,m,mat4.targetTo(mat4.create(),[0,0,0],p,[0,1,0]));
      mat4.multiply(m,m,mat4.fromScaling(mat4.create(),[fs,fs,fs]));
      mat4.multiply(m,m,mat4.fromTranslation(mat4.create(),[0,0,-this.SPHERE_RADIUS]));
      mat4.copy(this.discInstances.matrices[ndx],m);
    });
    gl.bindBuffer(gl.ARRAY_BUFFER,this.discInstances.buffer);gl.bufferSubData(gl.ARRAY_BUFFER,0,this.discInstances.matricesArray);gl.bindBuffer(gl.ARRAY_BUFFER,null);
    this.smoothRotationVelocity=this.control.rotationVelocity;
  }

  #render(){
    const gl=this.gl;
    gl.useProgram(this.discProgram);gl.disable(gl.CULL_FACE);gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(this.discLocations.uWorldMatrix,false,this.worldMatrix);
    gl.uniformMatrix4fv(this.discLocations.uViewMatrix,false,this.camera.matrices.view);
    gl.uniformMatrix4fv(this.discLocations.uProjectionMatrix,false,this.camera.matrices.projection);
    gl.uniform3f(this.discLocations.uCameraPosition,...this.camera.position);
    gl.uniform4f(this.discLocations.uRotationAxisVelocity,this.control.rotationAxis[0],this.control.rotationAxis[1],this.control.rotationAxis[2],this.smoothRotationVelocity*1.1);
    gl.uniform1i(this.discLocations.uItemCount,this.items.length);gl.uniform1i(this.discLocations.uAtlasSize,this.atlasSize);
    gl.uniform1f(this.discLocations.uFrames,this.#frames);gl.uniform1f(this.discLocations.uScaleFactor,this.scaleFactor);
    gl.uniform1i(this.discLocations.uTex,0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.tex);
    gl.bindVertexArray(this.discVAO);gl.drawElementsInstanced(gl.TRIANGLES,this.discBuffers.indices.length,gl.UNSIGNED_SHORT,0,this.DISC_INSTANCE_COUNT);
  }

  #updateCameraMatrix(){mat4.targetTo(this.camera.matrix,this.camera.position,[0,0,0],this.camera.up);mat4.invert(this.camera.matrices.view,this.camera.matrix);}

  #updateProjectionMatrix(gl){
    this.camera.aspect=gl.canvas.clientWidth/gl.canvas.clientHeight;
    const h=this.SPHERE_RADIUS*0.35,dist=this.camera.position[2];
    this.camera.fov=this.camera.aspect>1?2*Math.atan(h/dist):2*Math.atan(h/this.camera.aspect/dist);
    mat4.perspective(this.camera.matrices.projection,this.camera.fov,this.camera.aspect,this.camera.near,this.camera.far);
    mat4.invert(this.camera.matrices.inversProjection,this.camera.matrices.projection);
  }

  #onControlUpdate(dt){
    const ts=dt/this.TARGET_FRAME_DURATION+0.0001;let damping=5/ts,ctz=3*this.scaleFactor;
    const isMoving=this.control.isPointerDown||Math.abs(this.smoothRotationVelocity)>0.01;
    if(isMoving!==this.movementActive){this.movementActive=isMoving;this.onMovementChange(isMoving);}
    if(!this.control.isPointerDown){
      const nvi=this.#findNearestVertexIndex();this.onActiveItemChange(nvi%Math.max(1,this.items.length));
      this.control.snapTargetDirection=vec3.normalize(vec3.create(),this.#getVWP(nvi));
    }else{ctz+=this.control.rotationVelocity*80+2.5;damping=7/ts;}
    this.camera.position[2]+=(ctz-this.camera.position[2])/damping;this.#updateCameraMatrix();
  }

  #findNearestVertexIndex(){
    const nt=vec3.transformQuat(vec3.create(),this.control.snapDirection,quat.conjugate(quat.create(),this.control.orientation));
    let maxD=-1,idx=0;
    for(let i=0;i<this.instancePositions.length;++i){const d=vec3.dot(nt,this.instancePositions[i]);if(d>maxD){maxD=d;idx=i;}}
    return idx;
  }
  #getVWP(i){return vec3.transformQuat(vec3.create(),this.instancePositions[i],this.control.orientation);}
}

// ─── Gallery Data ─────────────────────────────────────────────────────────────
const galleryItems = [
  { id:1,  type:'image', image:'/images/logo.jpeg', link:'#', title:'Form in Space',    description:'Sculpture' },
  { id:2,  type:'video', video:'/images/videos/video-2.mp4', poster:'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&q=80', link:'#', title:'Chromatic Study',  description:'Film' },
  { id:3,  type:'image', image:'/images/p-1.jpeg', link:'#', title:'Quiet Geometry',   description:'Installation' },
  { id:4,  type:'image', image:'/images/p-2.jpeg', link:'#', title:'After the Rain',   description:'Photography' },
  { id:5,  type:'video', video:'/images/videos/video-1.mp4', poster:'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&q=80', link:'#', title:'Vessel No. 7',    description:'Film' },
  { id:6,  type:'image', image:'/images/p-3.jpeg', link:'#', title:'Passage',          description:'Mixed Media' },
  { id:7,  type:'image', image:'/images/p-4.jpeg', link:'#', title:'Tender Light',    description:'Painting' },
  { id:8,  type:'image', image:'/images/p-5.jpeg', link:'#', title:'Bloom Study IV',  description:'Photography' },
  { id:9,  type:'image', image:'/images/p-6.jpeg', link:'#', title:'Surface Tension', description:'Installation' },
  { id:10, type:'image', image:'/images/p-7.jpeg', link:'#', title:'Minimal Act',     description:'Sculpture' },
  { id:11, type:'image', image:'/images/p-8.jpeg', link:'#', title:'Nocturne',        description:'Painting' },
  { id:12, type:'image', image:'/images/p-9.jpeg', link:'#', title:'The Wound Heals', description:'Mixed Media' },
];

// ─── CSS injected once ────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
  @keyframes fadeSlideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse-ring { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.12);opacity:1} }
  .mob-card-enter { animation: fadeSlideUp 0.5s cubic-bezier(0.25,0.1,0.25,1) both; }
  .nav-btn:active { transform: scale(0.92) !important; }
`;
let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  const el = document.createElement('style');
  el.textContent = STYLES;
  document.head.appendChild(el);
  stylesInjected = true;
}

// ─── Mobile Carousel ──────────────────────────────────────────────────────────
function MobileCarousel({ items }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1); // 1=next, -1=prev
  const [animKey, setAnimKey] = useState(0);
  const autoRef = useRef(null);
  const videoRefs = useRef({});
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const navigate = useCallback((idx, dir) => {
    setDirection(dir);
    setCurrent((idx + items.length) % items.length);
    setAnimKey(k => k + 1);
  }, [items.length]);

  const startAutoplay = useCallback(() => {
    clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setCurrent(c => { setDirection(1); setAnimKey(k => k+1); return (c + 1) % items.length; });
    }, 4500);
  }, [items.length]);

  useEffect(() => { startAutoplay(); return () => clearInterval(autoRef.current); }, [startAutoplay]);

  const handlePrev = () => { navigate(current - 1, -1); startAutoplay(); };
  const handleNext = () => { navigate(current + 1,  1); startAutoplay(); };
  const handleDot  = (i) => { navigate(i, i > current ? 1 : -1); startAutoplay(); };

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
    if (Math.abs(dx) > 44 && Math.abs(dx) > dy) { dx > 0 ? handleNext() : handlePrev(); }
    touchStartX.current = null;
  };

  // Manage video playback per card
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([idx, vid]) => {
      if (!vid) return;
      if (parseInt(idx) === current) { vid.currentTime = 0; vid.play().catch(() => {}); }
      else { vid.pause(); }
    });
  }, [current]);

  const item = items[current];
  const isVideo = item.type === 'video';

  // Progress bar
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    const dur = 4500;
    const raf = () => {
      const p = Math.min(1, (Date.now() - start) / dur);
      setProgress(p);
      if (p < 1) rafRef.current = requestAnimationFrame(raf);
    };
    const rafRef = { current: requestAnimationFrame(raf) };
    return () => cancelAnimationFrame(rafRef.current);
  }, [current, animKey]);

  return (
    <div style={{ width:'100%', height:'100%', position:'relative', background:'#070712', overflow:'hidden', fontFamily:"'Playfair Display', Georgia, serif" }}>

      {/* Blurred ambient background */}
      <div style={{ position:'absolute', inset:0, zIndex:0, transition:'opacity 0.7s ease' }}>
        {items.map((it, i) => (
          <div key={it.id} style={{ position:'absolute', inset:0, opacity: i===current?1:0, transition:'opacity 0.9s ease' }}>
            {it.type==='video'
              ? <video src={it.video} poster={it.poster} muted playsInline loop style={{ width:'100%', height:'100%', objectFit:'cover', filter:'blur(40px) brightness(0.18) saturate(1.6)', transform:'scale(1.15)' }}/>
              : <img src={it.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', filter:'blur(40px) brightness(0.18) saturate(1.6)', transform:'scale(1.15)' }}/>
            }
          </div>
        ))}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,rgba(7,7,18,0.55) 0%,transparent 25%,transparent 55%,rgba(7,7,18,1) 100%)' }}/>
      </div>

      {/* Header */}
      <div style={{ position:'absolute', top:0, left:0, right:0, zIndex:30, padding:'20px 20px 0', textAlign:'center' }}>
        <p style={{ fontSize:7, letterSpacing:6, textTransform:'uppercase', color:'#a78bfa', margin:'0 0 5px', fontWeight:500 }}>
          Current Collection
        </p>
        <h1 style={{ fontSize:'1.55rem', fontWeight:400, color:'#f5f0ff', letterSpacing:'-0.02em', margin:0, lineHeight:1.1 }}>
          Works on View
        </h1>
      </div>

      {/* Progress bar */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, zIndex:40, background:'rgba(167,139,250,0.12)' }}>
        <div style={{ height:'100%', width:`${progress*100}%`, background:'linear-gradient(90deg,#7c3aed,#a78bfa)', borderRadius:'0 1px 1px 0', transition:'width 0.1s linear', boxShadow:'0 0 10px rgba(167,139,250,0.7)' }}/>
      </div>

      {/* Cards area */}
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:10, padding:'80px 0 170px' }}
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

        {/* Side peek cards */}
        {[-1, 1].map(offset => {
          const idx = (current + offset + items.length) % items.length;
          const it = items[idx];
          return (
            <div key={`peek-${idx}`} onClick={offset===-1?handlePrev:handleNext}
              style={{
                position:'absolute',
                left: offset===-1?'4px':undefined, right: offset===1?'4px':undefined,
                width:'58vw', maxWidth:230, aspectRatio:'3/4', borderRadius:16,
                overflow:'hidden', cursor:'pointer', opacity:0.28,
                transform: `scale(0.78) translateX(${offset===1?'22%':'-22%'})`,
                transition:'all 0.55s cubic-bezier(0.25,0.1,0.25,1)',
                boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
                filter:'blur(1.5px)',
              }}>
              {it.type==='video'
                ? <video src={it.video} poster={it.poster} muted playsInline loop style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                : <img src={it.image} alt={it.title} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              }
              <div style={{position:'absolute',inset:0,background:'rgba(7,7,18,0.45)'}}/>
            </div>
          );
        })}

        {/* Active card */}
        <div key={animKey}
          style={{
            position:'relative', width:'72vw', maxWidth:300, aspectRatio:'3/4',
            borderRadius:22, overflow:'hidden', zIndex:20,
            boxShadow:'0 40px 100px rgba(0,0,0,0.75), 0 0 0 1px rgba(167,139,250,0.18)',
            animation:'fadeSlideUp 0.5s cubic-bezier(0.25,0.1,0.25,1) both',
          }}>

          {/* Media */}
          {isVideo ? (
            <video ref={el => { videoRefs.current[current] = el; }}
              src={item.video} poster={item.poster} muted playsInline loop autoPlay
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
          ) : (
            <img src={item.image} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
          )}

          {/* Card gradient */}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(7,7,18,0.95) 0%, rgba(7,7,18,0.3) 50%, transparent 100%)' }}/>

          {/* Video badge */}
          {isVideo && (
            <div style={{ position:'absolute', top:14, left:14, display:'flex', alignItems:'center', gap:5, background:'rgba(124,58,237,0.85)', borderRadius:20, padding:'5px 11px', backdropFilter:'blur(10px)' }}>
              <svg width="8" height="8" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <span style={{ fontSize:7.5, color:'#fff', letterSpacing:2.5, fontWeight:700, textTransform:'uppercase' }}>Live</span>
            </div>
          )}

          {/* Card info */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'20px 18px 18px' }}>
            <p style={{ fontSize:7.5, letterSpacing:3.5, textTransform:'uppercase', color:'#a78bfa', margin:'0 0 6px', fontWeight:500 }}>
              {item.description}
            </p>
            <h2 style={{ fontSize:'1.2rem', fontWeight:700, color:'#f5f0ff', margin:'0 0 14px', lineHeight:1.2, letterSpacing:'-0.01em' }}>
              {item.title}
            </h2>
            <button style={{
              background:'rgba(124,58,237,0.15)', border:'1px solid rgba(167,139,250,0.45)',
              borderRadius:10, padding:'9px 18px', color:'#c4b5fd', fontSize:8.5,
              letterSpacing:3, textTransform:'uppercase', cursor:'pointer', width:'100%',
              fontFamily:'inherit', fontWeight:600, transition:'all 0.2s ease',
            }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(124,58,237,0.35)';e.currentTarget.style.borderColor='#a78bfa';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(124,58,237,0.15)';e.currentTarget.style.borderColor='rgba(167,139,250,0.45)';}}>
              {isVideo ? '▶  Watch' : 'Explore  →'}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, zIndex:30, padding:'0 24px 28px', display:'flex', flexDirection:'column', alignItems:'center', gap:18 }}>

        {/* Dot indicators */}
        <div style={{ display:'flex', gap:5, alignItems:'center' }}>
          {items.map((_, i) => (
            <button key={i} onClick={() => handleDot(i)} style={{
              width: i===current ? 28 : 6, height:6, borderRadius:3,
              background: i===current ? '#7c3aed' : 'rgba(167,139,250,0.25)',
              border:'none', cursor:'pointer', padding:0,
              transition:'all 0.4s cubic-bezier(0.25,0.1,0.25,1)',
              boxShadow: i===current ? '0 0 8px rgba(124,58,237,0.7)' : 'none',
            }}/>
          ))}
        </div>

        {/* Navigation row */}
        <div style={{ display:'flex', gap:20, alignItems:'center' }}>
          <button className="nav-btn" onClick={handlePrev} style={{
            width:54, height:54, borderRadius:'50%',
            background:'rgba(124,58,237,0.12)', border:'1.5px solid rgba(167,139,250,0.3)',
            color:'#a78bfa', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.2s ease', backdropFilter:'blur(16px)',
          }}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(124,58,237,0.3)';e.currentTarget.style.borderColor='#a78bfa';}}
          onMouseLeave={e=>{e.currentTarget.style.background='rgba(124,58,237,0.12)';e.currentTarget.style.borderColor='rgba(167,139,250,0.3)';}}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>

          <div style={{ textAlign:'center', minWidth:64 }}>
            <div style={{ fontSize:'1.55rem', fontWeight:700, color:'#f5f0ff', lineHeight:1, letterSpacing:'-0.03em' }}>
              {String(current+1).padStart(2,'0')}
              <span style={{ fontSize:11, color:'rgba(245,240,255,0.28)', margin:'0 3px', fontWeight:400 }}>/</span>
              <span style={{ fontSize:11, color:'rgba(245,240,255,0.38)', fontWeight:400 }}>{String(items.length).padStart(2,'0')}</span>
            </div>
            <p style={{ fontSize:7, letterSpacing:3, textTransform:'uppercase', color:'rgba(167,139,250,0.5)', margin:'4px 0 0', fontWeight:500 }}>
              {isVideo ? 'Video' : 'Image'}
            </p>
          </div>

          <button className="nav-btn" onClick={handleNext} style={{
            width:54, height:54, borderRadius:'50%',
            background:'rgba(124,58,237,0.12)', border:'1.5px solid rgba(167,139,250,0.3)',
            color:'#a78bfa', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.2s ease', backdropFilter:'blur(16px)',
          }}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(124,58,237,0.3)';e.currentTarget.style.borderColor='#a78bfa';}}
          onMouseLeave={e=>{e.currentTarget.style.background='rgba(124,58,237,0.12)';e.currentTarget.style.borderColor='rgba(167,139,250,0.3)';}}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Desktop Globe ────────────────────────────────────────────────────────────
function DesktopGlobe({ items, scale }) {
  const canvasRef = useRef(null);
  const sketchRef = useRef(null);
  const [activeItem, setActiveItem] = useState(null);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sketch = new InfiniteGridMenu(canvas, items,
      idx => setActiveItem(items[idx % items.length]),
      setIsMoving, sk => sk.run(), scale
    );
    sketchRef.current = sketch;
    const onResize = () => sketchRef.current?.resize();
    window.addEventListener('resize', onResize); onResize();
    return () => { window.removeEventListener('resize', onResize); sketchRef.current?.destroy(); sketchRef.current = null; };
  }, [items, scale]);

  const isVideo = activeItem?.type === 'video';

  return (
    <div style={{ position:'relative', width:'100%', height:'100%', background:'#f8f8f5', fontFamily:"'Playfair Display', Georgia, serif" }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, zIndex:10, textAlign:'center', padding:'32px 24px 0', pointerEvents:'none' }}>
        <p style={{ fontSize:9, fontWeight:500, letterSpacing:4, textTransform:'uppercase', color:'#7B4BA0', margin:'0 0 8px' }}>Current Collection</p>
        <h1 style={{ fontSize:'clamp(2rem, 4vw, 3.5rem)', fontWeight:400, color:'#1a0f2e', letterSpacing:'-0.02em', margin:0, lineHeight:1.05 }}>Works on View</h1>
      </div>

      <canvas ref={canvasRef} style={{ width:'100%', height:'100%', display:'block', cursor:'grab', outline:'none' }} className="active:cursor-grabbing"/>

      {activeItem && (
        <>
          <h2 style={{
            position:'absolute', left:'max(24px, 6vw)', top:'50%', transform:'translateY(-50%)', margin:0,
            fontWeight:700, fontSize:'clamp(2rem, 4.5vw, 4rem)', lineHeight:1.1, color:'#7B4BA0',
            maxWidth:'8ch', letterSpacing:'-0.02em', userSelect:'none',
            transition:'opacity 0.4s ease', opacity:isMoving?0:1, pointerEvents:isMoving?'none':'auto',
          }}>
            {activeItem.title}
            {isVideo && (
              <span style={{ display:'flex', alignItems:'center', gap:6, marginTop:8, fontSize:9, fontWeight:500, letterSpacing:3, textTransform:'uppercase', color:'#7B4BA0', opacity:0.65 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>Video
              </span>
            )}
          </h2>

          <p style={{
            position:'absolute', right:'max(24px, 6vw)', top:'50%',
            transform:`translateY(-50%) translateX(${isMoving?'-20%':'0%'})`,
            margin:0, fontSize:10, fontWeight:500, letterSpacing:3, textTransform:'uppercase',
            color:'#7B4BA0', maxWidth:'12ch', textAlign:'right', userSelect:'none',
            transition:'opacity 0.4s ease, transform 0.4s ease', opacity:isMoving?0:1,
          }}>
            {activeItem.description}
          </p>

          <div onClick={() => activeItem.link?.startsWith('http') && window.open(activeItem.link,'_blank')}
            style={{
              position:'absolute', left:'50%', bottom:isMoving?'-120px':'2.5em',
              transform:`translateX(-50%) scale(${isMoving?0:1})`, zIndex:9999,
              display:'flex', alignItems:'center', gap:10, background:'#7B4BA0',
              borderRadius:4, padding:'14px 28px', cursor:'pointer', whiteSpace:'nowrap',
              transition:'bottom 0.4s cubic-bezier(0.25,0.1,0.25,1), opacity 0.3s, transform 0.4s cubic-bezier(0.25,0.1,0.25,1)',
              opacity:isMoving?0:1, pointerEvents:isMoving?'none':'auto',
              boxShadow:'0 4px 20px rgba(123,75,160,0.35)',
            }}
            onMouseEnter={e=>{e.currentTarget.style.background='#5e3580';}}
            onMouseLeave={e=>{e.currentTarget.style.background='#7B4BA0';}}>
            <span style={{ color:'#fff', fontSize:11, fontWeight:600, letterSpacing:3, textTransform:'uppercase', userSelect:'none' }}>
              {isVideo ? 'Watch' : 'Explore'}
            </span>
            {isVideo
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
            }
          </div>
        </>
      )}

      <div style={{ position:'absolute', bottom:24, left:0, right:0, textAlign:'center', pointerEvents:'none', transition:'opacity 0.3s', opacity:isMoving?0:0.4 }}>
        <p style={{ fontSize:9, fontWeight:500, letterSpacing:3, textTransform:'uppercase', color:'#7B4BA0', margin:0, opacity:0.5 }}>Drag to explore</p>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function InfiniteGalleryMenu({ items = galleryItems, scale = 1.0 }) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    injectStyles();
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile
    ? <MobileCarousel items={items} />
    : <DesktopGlobe items={items} scale={scale} />;
}