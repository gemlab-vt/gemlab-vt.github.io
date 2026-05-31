(function(){
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------- Interactive gem particle field ---------------------- */
  var canvas = document.getElementById('gem-canvas');
  if (canvas){
    var ctx = canvas.getContext('2d');
    var SPRITE = 160;
    var COLORS = [[134,31,65],[229,117,31],[229,117,31]]; /* pink, turquoise, purple */
    var dpr = 1, W = 0, H = 0, prevW = 0, prevH = 0;
    var sprites = [], gems = [], sparks = [];
    var pointer = { x:0, y:0, active:false, r:160 };
    var BG = '#fbfaf8';

    function rgba(c,a){ return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }

    function spriteCtx(){
      var oc = document.createElement('canvas');
      oc.width = SPRITE * dpr; oc.height = SPRITE * dpr;
      var o = oc.getContext('2d');
      o.scale(dpr, dpr); o.translate(SPRITE/2, SPRITE/2);
      return { oc:oc, o:o };
    }

    /* Brilliant-cut diamond */
    function diamond(c){
      var s = spriteCtx(), o = s.o, R = SPRITE * 0.4;
      function P(p){ return [p[0]*R, p[1]*R]; }
      var tl=P([-0.45,-0.55]), tr=P([0.45,-0.55]), gr=P([0.95,-0.15]), cu=P([0,0.95]), gl=P([-0.95,-0.15]), tc=P([0,-0.55]);
      o.beginPath(); o.moveTo(tl[0],tl[1]); o.lineTo(tr[0],tr[1]); o.lineTo(gr[0],gr[1]); o.lineTo(cu[0],cu[1]); o.lineTo(gl[0],gl[1]); o.closePath();
      var g = o.createLinearGradient(0,-R,0,R);
      g.addColorStop(0, rgba(c,0.10)); g.addColorStop(0.2, rgba(c,0.30)); g.addColorStop(0.55, rgba(c,0.52)); g.addColorStop(1, rgba(c,0.28));
      o.fillStyle = g; o.fill();
      function tri(a,b,d,f){ o.beginPath(); o.moveTo(a[0],a[1]); o.lineTo(b[0],b[1]); o.lineTo(d[0],d[1]); o.closePath(); o.fillStyle = f; o.fill(); }
      tri(tl,gl,tc, rgba([255,255,255],0.16));
      tri(tr,gr,tc, rgba([255,255,255],0.08));
      tri(tr,cu,tc, rgba(c,0.20));
      o.lineWidth = Math.max(1, SPRITE*0.006); o.strokeStyle = rgba(c,0.5);
      o.beginPath();
      o.moveTo(tc[0],tc[1]); o.lineTo(cu[0],cu[1]);
      o.moveTo(tl[0],tl[1]); o.lineTo(cu[0],cu[1]);
      o.moveTo(tr[0],tr[1]); o.lineTo(cu[0],cu[1]);
      o.moveTo(gl[0],gl[1]); o.lineTo(tc[0],tc[1]);
      o.moveTo(gr[0],gr[1]); o.lineTo(tc[0],tc[1]);
      o.stroke();
      o.lineJoin = 'round'; o.lineWidth = Math.max(1.3, SPRITE*0.009); o.strokeStyle = rgba(c,0.82);
      o.beginPath(); o.moveTo(tl[0],tl[1]); o.lineTo(tr[0],tr[1]); o.lineTo(gr[0],gr[1]); o.lineTo(cu[0],cu[1]); o.lineTo(gl[0],gl[1]); o.closePath(); o.stroke();
      o.fillStyle = rgba([255,255,255],0.85);
      o.beginPath(); o.arc(tl[0]*0.45, tl[1]*0.85, Math.max(1.4, SPRITE*0.014), 0, Math.PI*2); o.fill();
      return s.oc;
    }

    /* Emerald / step-cut octagon */
    function emerald(c){
      var s = spriteCtx(), o = s.o, R = SPRITE * 0.4;
      var pts = [[-0.5,-0.85],[0.5,-0.85],[0.85,-0.3],[0.85,0.3],[0.5,0.85],[-0.5,0.85],[-0.85,0.3],[-0.85,-0.3]];
      var v = pts.map(function(p){ return [p[0]*R, p[1]*R]; });
      function ring(arr){ o.beginPath(); for (var i=0;i<arr.length;i++){ if (i) o.lineTo(arr[i][0],arr[i][1]); else o.moveTo(arr[i][0],arr[i][1]); } o.closePath(); }
      ring(v);
      var g = o.createLinearGradient(0,-R,0,R);
      g.addColorStop(0, rgba(c,0.12)); g.addColorStop(0.5, rgba(c,0.5)); g.addColorStop(1, rgba(c,0.26));
      o.fillStyle = g; o.fill();
      var in1 = v.map(function(p){ return [p[0]*0.62, p[1]*0.62]; });
      ring(in1); o.fillStyle = rgba([255,255,255],0.10); o.fill();
      var in2 = v.map(function(p){ return [p[0]*0.3, p[1]*0.3]; });
      ring(in2); o.fillStyle = rgba(c,0.18); o.fill();
      o.lineWidth = Math.max(1, SPRITE*0.005); o.strokeStyle = rgba(c,0.45);
      o.beginPath();
      for (var i=0;i<v.length;i++){ o.moveTo(v[i][0],v[i][1]); o.lineTo(in1[i][0],in1[i][1]); }
      for (var j=0;j<in1.length;j++){ if (j) o.lineTo(in1[j][0],in1[j][1]); else o.moveTo(in1[j][0],in1[j][1]); }
      o.closePath(); o.stroke();
      o.lineJoin = 'round'; o.lineWidth = Math.max(1.3, SPRITE*0.009); o.strokeStyle = rgba(c,0.82);
      ring(v); o.stroke();
      o.fillStyle = rgba([255,255,255],0.85);
      o.beginPath(); o.arc(v[0][0]*0.5, v[0][1]*0.7, Math.max(1.4, SPRITE*0.014), 0, Math.PI*2); o.fill();
      return s.oc;
    }

    function buildSprites(){
      sprites = [];
      for (var i=0;i<COLORS.length;i++){ sprites.push(diamond(COLORS[i])); sprites.push(emerald(COLORS[i])); }
    }

    function makeGem(){
      var small = W < 720;
      var minS = small ? 28 : 44, rng = small ? 40 : 80;
      var size = minS + Math.random()*rng;
      var depth = (size - minS) / rng;
      var ci = (Math.random()*COLORS.length) | 0;
      var sp = ci*2 + (Math.random() < 0.5 ? 0 : 1);
      var ang = Math.random()*Math.PI*2;
      var speed = 0.06 + depth*0.20;
      return {
        x: Math.random()*W, y: Math.random()*H, size:size, sp:sp,
        rot: Math.random()*Math.PI*2, rs: (Math.random()-0.5)*0.004,
        bvx: Math.cos(ang)*speed, bvy: Math.sin(ang)*speed,
        vx: Math.cos(ang)*speed, vy: Math.sin(ang)*speed,
        alpha: 0.15 + depth*0.30, glow: 0, col: COLORS[ci]
      };
    }

    function buildGems(){
      var count = Math.round((W*H) / 42000);
      var small = W < 720;
      count = Math.max(small ? 9 : 16, Math.min(small ? 16 : 30, count));
      gems = [];
      for (var i=0;i<count;i++){ gems.push(makeGem()); }
    }

    function resize(){
      var nd = Math.min(window.devicePixelRatio || 1, 2);
      var nW = window.innerWidth, nH = window.innerHeight;
      canvas.width = Math.round(nW*nd); canvas.height = Math.round(nH*nd);
      canvas.style.width = nW + 'px'; canvas.style.height = nH + 'px';
      var dprChanged = nd !== dpr;
      dpr = nd;
      if (dprChanged || !sprites.length) buildSprites();
      if (prevW && gems.length){
        var sx = nW/prevW, sy = nH/prevH;
        for (var i=0;i<gems.length;i++){ gems[i].x *= sx; gems[i].y *= sy; }
      }
      W = nW; H = nH; prevW = nW; prevH = nH;
      pointer.r = (W < 720) ? 115 : 165;
      if (!gems.length) buildGems();
      if (reduce) renderStatic();
    }

    function corners(){}

    function drawGem(g){
      ctx.save();
      ctx.translate(g.x, g.y); ctx.rotate(g.rot);
      ctx.globalAlpha = Math.min(0.82, g.alpha + g.glow*0.45);
      if (g.glow > 0.02){ ctx.shadowColor = rgba(g.col, 0.55); ctx.shadowBlur = 18*g.glow; }
      ctx.drawImage(sprites[g.sp], -g.size/2, -g.size/2, g.size, g.size);
      ctx.restore();
    }

    function updateGem(g){
      if (pointer.active){
        var dx = g.x - pointer.x, dy = g.y - pointer.y, R = pointer.r;
        var d2 = dx*dx + dy*dy;
        if (d2 < R*R){
          var d = Math.sqrt(d2) || 0.0001;
          var f = 1 - d/R;
          g.vx += (dx/d)*f*0.8; g.vy += (dy/d)*f*0.8;
          if (f > g.glow) g.glow = f;
          g.rot += f*0.05;
        }
      }
      g.vx += (g.bvx - g.vx)*0.035; g.vy += (g.bvy - g.vy)*0.035;
      g.x += g.vx; g.y += g.vy; g.rot += g.rs; g.glow *= 0.92;
      var m = g.size;
      if (g.x < -m) g.x = W + m; else if (g.x > W + m) g.x = -m;
      if (g.y < -m) g.y = H + m; else if (g.y > H + m) g.y = -m;
    }

    function spark(x,y){
      for (var i=0;i<7;i++){
        var a = Math.random()*Math.PI*2, sp = 1.6 + Math.random()*3.6;
        var col = COLORS[(Math.random()*COLORS.length)|0];
        sparks.push({ x:x, y:y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp, life:1, dec:0.018 + Math.random()*0.02, sz:2 + Math.random()*2.6, col:col });
      }
      if (sparks.length > 140) sparks.splice(0, sparks.length - 140);
    }

    function drawStar(r){
      ctx.beginPath();
      ctx.moveTo(0,-r); ctx.lineTo(r*0.26,-r*0.26); ctx.lineTo(r,0); ctx.lineTo(r*0.26,r*0.26);
      ctx.lineTo(0,r); ctx.lineTo(-r*0.26,r*0.26); ctx.lineTo(-r,0); ctx.lineTo(-r*0.26,-r*0.26);
      ctx.closePath(); ctx.fill();
    }

    function updateSparks(){
      for (var i=sparks.length-1;i>=0;i--){
        var s = sparks[i];
        s.x += s.vx; s.y += s.vy; s.vx *= 0.94; s.vy *= 0.94; s.vy += 0.02; s.life -= s.dec;
        if (s.life <= 0){ sparks.splice(i,1); continue; }
        ctx.save();
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.translate(s.x, s.y); ctx.rotate((1 - s.life)*2.2);
        ctx.fillStyle = rgba(s.col, 0.9);
        drawStar(s.sz*(0.6 + s.life*0.9));
        ctx.restore();
      }
    }

    function renderStatic(){
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.globalAlpha = 1; ctx.fillStyle = BG; ctx.fillRect(0,0,W,H);
      corners();
      for (var i=0;i<gems.length;i++){
        var g = gems[i];
        ctx.save(); ctx.translate(g.x,g.y); ctx.rotate(g.rot); ctx.globalAlpha = g.alpha;
        ctx.drawImage(sprites[g.sp], -g.size/2, -g.size/2, g.size, g.size); ctx.restore();
      }
    }

    function frame(){
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.globalAlpha = 1; ctx.fillStyle = BG; ctx.fillRect(0,0,W,H);
      corners();
      for (var i=0;i<gems.length;i++){ updateGem(gems[i]); drawGem(gems[i]); }
      ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
      updateSparks();
      requestAnimationFrame(frame);
    }

    window.addEventListener('pointermove', function(e){ pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true; }, { passive:true });
    window.addEventListener('pointerdown', function(e){
      if (reduce) return;
      for (var i=0;i<gems.length;i++){
        var g = gems[i], dx = g.x - e.clientX, dy = g.y - e.clientY, d = Math.sqrt(dx*dx + dy*dy) || 1;
        if (d < 240){ var f = 1 - d/240; g.vx += (dx/d)*f*6; g.vy += (dy/d)*f*6; if (g.glow < f) g.glow = f; }
      }
      spark(e.clientX, e.clientY);
    }, { passive:true });
    window.addEventListener('pointerup', function(e){ if (e.pointerType === 'touch') pointer.active = false; }, { passive:true });
    window.addEventListener('pointercancel', function(){ pointer.active = false; }, { passive:true });
    document.addEventListener('mouseleave', function(){ pointer.active = false; });
    window.addEventListener('blur', function(){ pointer.active = false; });

    var rt;
    window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(resize, 150); }, { passive:true });

    resize();
    if (reduce) renderStatic(); else requestAnimationFrame(frame);
  }

  /* ---------------------- Nav: scrolled, mobile menu, active link ---------------------- */
  var nav = document.querySelector('.nav');
  if (nav){
    window.addEventListener('scroll', function(){ nav.classList.toggle('scrolled', window.scrollY > 8); }, { passive:true });
  }
  var burger = document.getElementById('burger');
  var links = document.getElementById('navLinks');
  if (burger && links){
    burger.addEventListener('click', function(){
      var open = links.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ links.classList.remove('open'); burger.classList.remove('open'); burger.setAttribute('aria-expanded','false'); });
    });
  }

  /* ---------------------- Back to top ---------------------- */
  document.querySelectorAll('a[href="#top"]').forEach(function(a){
    a.addEventListener('click', function(e){
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  var navMap = {};
  document.querySelectorAll('.nav-links a[href^="#"]').forEach(function(a){ navMap[a.getAttribute('href').slice(1)] = a; });
  var secs = document.querySelectorAll('section[id]');
  if ('IntersectionObserver' in window && secs.length){
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){
          var id = e.target.id;
          Object.keys(navMap).forEach(function(k){ navMap[k].classList.remove('active'); });
          if (navMap[id]) navMap[id].classList.add('active');
        }
      });
    }, { rootMargin:'-45% 0px -50% 0px', threshold:0 });
    secs.forEach(function(s){ spy.observe(s); });
  }

  /* ---------------------- Reveal on scroll ---------------------- */
  var revs = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window){
    var rev = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); rev.unobserve(e.target); } });
    }, { rootMargin:'0px 0px -8% 0px', threshold:0.04 });
    revs.forEach(function(el){ rev.observe(el); });
  } else {
    revs.forEach(function(el){ el.classList.add('in'); });
  }
})();
