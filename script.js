/* ─── CURSOR ──────────────────────────────────── */
const cd=document.getElementById('cd'),cr=document.getElementById('cr');
let cx=0,cy=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{cx=e.clientX;cy=e.clientY;});
(function loop(){
  rx+=(cx-rx)*.12; ry+=(cy-ry)*.12;
  cd.style.left=cx+'px'; cd.style.top=cy+'px';
  cr.style.left=rx+'px'; cr.style.top=ry+'px';
  requestAnimationFrame(loop);
})();
document.querySelectorAll('a,button,.sc-card,.panel').forEach(el=>{
  el.addEventListener('mouseenter',()=>cr.classList.add('big'));
  el.addEventListener('mouseleave',()=>cr.classList.remove('big'));
});
 
/* ─── THREE.JS ────────────────────────────────── */
(function(){
  const cvs=document.getElementById('hcanvas');
  const W=cvs.parentElement.offsetWidth||window.innerWidth/2;
  const H=window.innerHeight;
  const renderer=new THREE.WebGLRenderer({canvas:cvs,alpha:true,antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(W,H);
  const scene=new THREE.Scene();
  const cam=new THREE.PerspectiveCamera(55,W/H,.1,200);
  cam.position.z=18;
 
  const G=0xC9A96E;
 
  /* Central diamond / gem */
  const gemGeo=new THREE.OctahedronGeometry(3.5,0);
  const gemMat=new THREE.MeshBasicMaterial({color:G,wireframe:true,transparent:true,opacity:.22});
  const gem=new THREE.Mesh(gemGeo,gemMat);
  scene.add(gem);
 
  /* Outer icosahedron */
  const outerGeo=new THREE.IcosahedronGeometry(5.2,0);
  const outerMat=new THREE.MeshBasicMaterial({color:G,wireframe:true,transparent:true,opacity:.07});
  const outer=new THREE.Mesh(outerGeo,outerMat);
  scene.add(outer);
 
  /* Orbiting rings */
  function ring(r,thick,rot,op){
    const m=new THREE.Mesh(new THREE.TorusGeometry(r,thick,2,100),new THREE.MeshBasicMaterial({color:G,transparent:true,opacity:op}));
    m.rotation.x=rot[0]; m.rotation.y=rot[1]; m.rotation.z=rot[2];
    scene.add(m); return m;
  }
  const r1=ring(7,.012,[1.2,0,.3],.08);
  const r2=ring(9,.008,[.5,.4,1.1],.05);
  const r3=ring(11,.006,[.8,1.2,.2],.04);
 
  /* Floating small gems */
  const floaters=[];
  [[-6,3,-5],[6,-2,-6],[-4,-4,-8],[7,4,-10],[0,6,-7]].forEach(([x,y,z])=>{
    const fg=new THREE.OctahedronGeometry(.4+Math.random()*.5,0);
    const fm=new THREE.Mesh(fg,new THREE.MeshBasicMaterial({color:G,wireframe:true,transparent:true,opacity:.3}));
    fm.position.set(x,y,z);
    fm.userData={ox:x,oy:y,sp:Math.random()*.5+.3};
    scene.add(fm); floaters.push(fm);
  });
 
  /* Particles */
  const pc=320,pa=new Float32Array(pc*3);
  for(let i=0;i<pc*3;i++)pa[i]=(Math.random()-.5)*55;
  const pbuf=new THREE.BufferGeometry();
  pbuf.setAttribute('position',new THREE.BufferAttribute(pa,3));
  scene.add(new THREE.Points(pbuf,new THREE.PointsMaterial({color:G,size:.045,transparent:true,opacity:.45})));
 
  let mx=0,my=0;
  document.addEventListener('mousemove',e=>{
    const bounds=cvs.getBoundingClientRect();
    mx=(e.clientX-bounds.left)/bounds.width*2-1;
    my=-(e.clientY-bounds.top)/bounds.height*2+1;
  });
 
  window.addEventListener('resize',()=>{
    const nw=cvs.parentElement.offsetWidth||window.innerWidth/2;
    const nh=window.innerHeight;
    cam.aspect=nw/nh; cam.updateProjectionMatrix();
    renderer.setSize(nw,nh);
  });
 
  const clk=new THREE.Clock();
  (function anim(){
    requestAnimationFrame(anim);
    const t=clk.getElapsedTime();
    gem.rotation.y=t*.18; gem.rotation.x=t*.09;
    outer.rotation.y=-t*.06; outer.rotation.z=t*.04;
    r1.rotation.z+=.001; r2.rotation.x+=.0008; r3.rotation.y+=.0006;
    floaters.forEach(f=>{
      f.rotation.y+=.008; f.rotation.x+=.005;
      f.position.y=f.userData.oy+Math.sin(t*f.userData.sp)*.4;
    });
    cam.position.x+=(mx*1.2-cam.position.x)*.025;
    cam.position.y+=(my*.8-cam.position.y)*.025;
    cam.lookAt(scene.position);
    renderer.render(scene,cam);
  })();
})();
 
/* ─── TICKER ──────────────────────────────────── */
const twords=['Sea View Residences','Private Beach Villas','Resort Investments','Luxury Penthouses','Golf Estates','Marina Studios','Managed Apartments','Red Sea Living'];
const ttk=document.getElementById('ttk');
[...twords,...twords].forEach(w=>{const d=document.createElement('div');d.className='ti';d.innerHTML=`<span class="ti-dot"></span>${w}`;ttk.appendChild(d);});
 
/* ─── NAV ─────────────────────────────────────── */
const nav=document.getElementById('nav');
window.addEventListener('scroll',()=>{
  const y=window.scrollY,vh=window.innerHeight;
  nav.classList.toggle('s',y>80);
  nav.classList.toggle('dark',y>vh*.7);
});
 
/* ─── PANEL REVEALS ───────────────────────────── */
const panelObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{e.target.classList.toggle('vis',e.isIntersecting);});
},{threshold:.25});
document.querySelectorAll('.panel').forEach(p=>panelObs.observe(p));
 
/* ─── GENERAL REVEALS ─────────────────────────── */
const ro=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');ro.unobserve(e.target);}});
},{threshold:.1});
document.querySelectorAll('.rv,.rvl,.rvr').forEach(el=>ro.observe(el));
 
/* ─── COUNTERS ────────────────────────────────── */
const co=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(!e.isIntersecting)return;
    e.target.querySelectorAll('[data-t]').forEach(el=>{
      const t=+el.dataset.t,dur=1800,s=performance.now();
      const suf=t===97?'%':'+';
      (function tick(now){const p=Math.min((now-s)/dur,1);el.textContent=Math.floor(p*t)+suf;if(p<1)requestAnimationFrame(tick);else el.textContent=t+suf;})(performance.now());
    });
    co.unobserve(e.target);
  });
},{threshold:.5});
document.querySelectorAll('.numbers').forEach(el=>co.observe(el));
 
/* ─── HERO PARALLAX ───────────────────────────── */
window.addEventListener('scroll',()=>{
  const s=window.scrollY;
  const hl=document.querySelector('.hero-l');
  if(hl)hl.style.transform=`translateY(${s*.18}px)`;
});
 
/* ─── LANG ────────────────────────────────────── */
function setLang(l){
  document.getElementById('root').lang=l;
  document.getElementById('ben').classList.toggle('on',l==='en');
  document.getElementById('bar').classList.toggle('on',l==='ar');
  document.querySelectorAll('[data-'+l+']').forEach(el=>{const v=el.getAttribute('data-'+l);if(v)el.innerHTML=v;});
  document.dir=l==='ar'?'rtl':'ltr';
}
 
/* ─── FORM ────────────────────────────────────── */
function submitForm(){
  const fn=document.getElementById('cf-fn')?.value.trim();
  const em=document.getElementById('cf-em')?.value.trim();
  if(!fn||!em){alert('Please enter your name and email.');return;}
  document.getElementById('cform').innerHTML=`<div class="cf-sent"><div class="cf-sent-mark">✦</div><h3 class="cf-sent-h">Thank you, ${fn}</h3><p class="cf-sent-s">A consultant will reach out within 24 hours.</p></div>`;
}
 
document.getElementById('yr').textContent=new Date().getFullYear();
