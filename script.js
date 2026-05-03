// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES & SETUP
// ═══════════════════════════════════════════════════════════════════════════

// Detect touch device
const isTouchDevice = () => {
  return (('ontouchstart' in window) || 
           (navigator.maxTouchPoints > 0) || 
           (navigator.msMaxTouchPoints > 0));
};

// Add touch device class
if (isTouchDevice()) {
  document.body.classList.add('touch-device');
}

// Mobile menu toggle functionality
const setupMobileMenu = () => {
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  
  if (!navToggle || !navMenu) return;
  
  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isExpanded);
    navMenu.classList.toggle('active');
  });
  
  // Close menu on link click
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('active');
    });
  });
  
  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (navToggle.contains(e.target) || navMenu.contains(e.target)) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('active');
  });
};

/* ─── CUSTOM CURSOR ──────────────────────────── */
const setupCursor = () => {
  if (isTouchDevice()) return; // Skip for touch devices
  
  const cd = document.getElementById('cd');
  const cr = document.getElementById('cr');
  
  if (!cd || !cr) return;
  
  let cx = 0, cy = 0, rx = 0, ry = 0;
  let animationId;
  
  const updateCursorPos = (e) => {
    cx = e.clientX;
    cy = e.clientY;
  };
  
  document.addEventListener('mousemove', updateCursorPos, { passive: true });
  
  const animateCursor = () => {
    rx += (cx - rx) * 0.12;
    ry += (cy - ry) * 0.12;
    cd.style.left = cx + 'px';
    cd.style.top = cy + 'px';
    cr.style.left = rx + 'px';
    cr.style.top = ry + 'px';
    animationId = requestAnimationFrame(animateCursor);
  };
  
  animateCursor();
  
  // Cursor interaction feedback
  const hoverableElements = document.querySelectorAll('a, button, .sc-card, .panel');
  hoverableElements.forEach(el => {
    el.addEventListener('mouseenter', () => cr.classList.add('big'), { passive: true });
    el.addEventListener('mouseleave', () => cr.classList.remove('big'), { passive: true });
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// THREE.JS 3D SCENE
// ═══════════════════════════════════════════════════════════════════════════
const initThreeJS = () => {
  const cvs = document.getElementById('hcanvas');
  if (!cvs) return;
  
  try {
    if (!window.THREE) {
      console.warn('Three.js not loaded');
      return;
    }
    
    const parentWidth = cvs.parentElement?.offsetWidth || window.innerWidth / 2;
    const W = Math.min(parentWidth, window.innerWidth);
    const H = window.innerHeight;
    
    const renderer = new THREE.WebGLRenderer({ 
      canvas: cvs, 
      alpha: true, 
      antialias: true,
      powerPreference: 'high-performance'
    });
    
    const dpr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H);
    
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);
    cam.position.z = 18;
    
    const G = 0xC9A96E;
    
    // Central diamond
    const gemGeo = new THREE.OctahedronGeometry(3.5, 0);
    const gemMat = new THREE.MeshBasicMaterial({
      color: G,
      wireframe: true,
      transparent: true,
      opacity: 0.22
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    scene.add(gem);
    
    // Outer icosahedron
    const outerGeo = new THREE.IcosahedronGeometry(5.2, 0);
    const outerMat = new THREE.MeshBasicMaterial({
      color: G,
      wireframe: true,
      transparent: true,
      opacity: 0.07
    });
    const outer = new THREE.Mesh(outerGeo, outerMat);
    scene.add(outer);
    
    // Orbiting rings
    const createRing = (r, thick, rot, op) => {
      const m = new THREE.Mesh(
        new THREE.TorusGeometry(r, thick, 2, 100),
        new THREE.MeshBasicMaterial({ color: G, transparent: true, opacity: op })
      );
      m.rotation.x = rot[0];
      m.rotation.y = rot[1];
      m.rotation.z = rot[2];
      scene.add(m);
      return m;
    };
    
    const r1 = createRing(7, 0.012, [1.2, 0, 0.3], 0.08);
    const r2 = createRing(9, 0.008, [0.5, 0.4, 1.1], 0.05);
    const r3 = createRing(11, 0.006, [0.8, 1.2, 0.2], 0.04);
    
    // Floating small gems
    const floaters = [];
    const floaterPositions = [[-6, 3, -5], [6, -2, -6], [-4, -4, -8], [7, 4, -10], [0, 6, -7]];
    
    floaterPositions.forEach(([x, y, z]) => {
      const fg = new THREE.OctahedronGeometry(0.4 + Math.random() * 0.5, 0);
      const fm = new THREE.Mesh(fg, new THREE.MeshBasicMaterial({
        color: G,
        wireframe: true,
        transparent: true,
        opacity: 0.3
      }));
      fm.position.set(x, y, z);
      fm.userData = { ox: x, oy: y, sp: Math.random() * 0.5 + 0.3 };
      scene.add(fm);
      floaters.push(fm);
    });
    
    // Particles
    const particleCount = 320;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 55;
    }
    
    const bufferGeo = new THREE.BufferGeometry();
    bufferGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    scene.add(new THREE.Points(bufferGeo, new THREE.PointsMaterial({
      color: G,
      size: 0.045,
      transparent: true,
      opacity: 0.45
    })));
    
    let mx = 0, my = 0;
    
    const handleMouseMove = (e) => {
      const bounds = cvs.getBoundingClientRect();
      mx = (e.clientX - bounds.left) / bounds.width * 2 - 1;
      my = -(e.clientY - bounds.top) / bounds.height * 2 + 1;
    };
    
    if (!isTouchDevice()) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
    }
    
    const handleResize = () => {
      const nw = cvs.parentElement?.offsetWidth || window.innerWidth / 2;
      const nh = window.innerHeight;
      cam.aspect = nw / nh;
      cam.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    const clock = new THREE.Clock();
    
    const animate = () => {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      
      // Animate geometries
      gem.rotation.y = t * 0.18;
      gem.rotation.x = t * 0.09;
      outer.rotation.y = -t * 0.06;
      outer.rotation.z = t * 0.04;
      
      r1.rotation.z += 0.001;
      r2.rotation.x += 0.0008;
      r3.rotation.y += 0.0006;
      
      // Animate floaters
      floaters.forEach(f => {
        f.rotation.y += 0.008;
        f.rotation.x += 0.005;
        f.position.y = f.userData.oy + Math.sin(t * f.userData.sp) * 0.4;
      });
      
      // Camera follows mouse
      cam.position.x += (mx * 1.2 - cam.position.x) * 0.025;
      cam.position.y += (my * 0.8 - cam.position.y) * 0.025;
      cam.lookAt(scene.position);
      
      renderer.render(scene, cam);
    };
    
    animate();
  } catch (e) {
    console.error('Three.js initialization error:', e);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION & SCROLL EFFECTS
// ═══════════════════════════════════════════════════════════════════════════

const setupNavScroll = () => {
  const nav = document.getElementById('nav');
  if (!nav) return;
  
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    nav.classList.toggle('s', y > 80);
    nav.classList.toggle('dark', y > vh * 0.7);
  }, { passive: true });
};

// ═══════════════════════════════════════════════════════════════════════════
// TICKER
// ═══════════════════════════════════════════════════════════════════════════

const setupTicker = () => {
  const ttk = document.getElementById('ttk');
  if (!ttk) return;
  
  const twords = [
    'Sea View Residences',
    'Private Beach Villas',
    'Resort Investments',
    'Luxury Penthouses',
    'Golf Estates',
    'Marina Studios',
    'Managed Apartments',
    'Red Sea Living'
  ];
  
  [...twords, ...twords].forEach(word => {
    const div = document.createElement('div');
    div.className = 'ti';
    div.innerHTML = `<span class="ti-dot"></span>${word}`;
    ttk.appendChild(div);
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// INTERSECTION OBSERVERS (Reveals & Animations)
// ═══════════════════════════════════════════════════════════════════════════

const setupPanelObserver = () => {
  const panelObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      entry.target.classList.toggle('vis', entry.isIntersecting);
    });
  }, { threshold: 0.25 });
  
  document.querySelectorAll('.panel').forEach(panel => {
    panelObs.observe(panel);
  });
};

const setupRevealObserver = () => {
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('on');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('.rv, .rvl, .rvr').forEach(el => {
    revealObs.observe(el);
  });
};

const setupCounterObserver = () => {
  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      
      entry.target.querySelectorAll('[data-t]').forEach(el => {
        const target = +el.dataset.t;
        const duration = 1800;
        const startTime = performance.now();
        const suffix = target === 97 ? '%' : '+';
        
        const tick = (now) => {
          const progress = Math.min((now - startTime) / duration, 1);
          el.textContent = Math.floor(progress * target) + suffix;
          
          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            el.textContent = target + suffix;
          }
        };
        
        requestAnimationFrame(tick);
      });
      
      counterObs.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  
  document.querySelectorAll('.numbers').forEach(el => {
    counterObs.observe(el);
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// HERO PARALLAX
// ═══════════════════════════════════════════════════════════════════════════

const setupHeroParallax = () => {
  const heroL = document.querySelector('.hero-l');
  if (!heroL) return;
  
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    heroL.style.transform = `translateY(${scrollY * 0.18}px)`;
  }, { passive: true });
};

// ═══════════════════════════════════════════════════════════════════════════
// LANGUAGE SWITCHER
// ═══════════════════════════════════════════════════════════════════════════

function setLang(lang) {
  const root = document.getElementById('root');
  if (root) root.lang = lang;
  
  // Update button states
  const benBtn = document.getElementById('ben');
  const barBtn = document.getElementById('bar');
  if (benBtn) benBtn.classList.toggle('on', lang === 'en');
  if (barBtn) barBtn.classList.toggle('on', lang === 'ar');
  
  // Update content
  document.querySelectorAll('[data-' + lang + ']').forEach(el => {
    const value = el.getAttribute('data-' + lang);
    if (value) el.innerHTML = value;
  });
  
  // Set document direction
  document.dir = lang === 'ar' ? 'rtl' : 'ltr';
  
  // Save preference
  try {
    localStorage.setItem('redora-lang', lang);
  } catch (e) {
    console.debug('localStorage not available');
  }
}

// Load saved language preference
const loadLanguagePreference = () => {
  try {
    const saved = localStorage.getItem('redora-lang');
    if (saved) setLang(saved);
  } catch (e) {
    console.debug('localStorage not available');
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// CONTACT FORM
// ═══════════════════════════════════════════════════════════════════════════

function submitForm(event) {
  if (event) event.preventDefault();
  
  const form = document.getElementById('cform');
  const fnInput = document.getElementById('cf-fn');
  const emInput = document.getElementById('cf-em');
  
  if (!form || !fnInput || !emInput) return;
  
  const fn = fnInput.value.trim();
  const em = emInput.value.trim();
  
  // Basic validation
  if (!fn) {
    alert('Please enter your first name.');
    fnInput.focus();
    return;
  }
  
  if (!em) {
    alert('Please enter your email address.');
    emInput.focus();
    return;
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(em)) {
    alert('Please enter a valid email address.');
    emInput.focus();
    return;
  }
  
  // Success message
  form.innerHTML = `
    <div class="cf-sent">
      <div class="cf-sent-mark">✦</div>
      <h3 class="cf-sent-h">Thank you, ${escapeHtml(fn)}</h3>
      <p class="cf-sent-s">A consultant will reach out within 24 hours.</p>
    </div>
  `;
  
  // Optional: Send to backend
  // sendFormToBackend(fnInput, emInput);
}

// Sanitize HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

const init = () => {
  // Set current year in footer
  const yearEl = document.getElementById('yr');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  
  // Setup all features
  setupMobileMenu();
  setupCursor();
  setupTicker();
  setupNavScroll();
  setupPanelObserver();
  setupRevealObserver();
  setupCounterObserver();
  setupHeroParallax();
  initThreeJS();
  loadLanguagePreference();
};

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Global form submission handler
document.addEventListener('submit', (e) => {
  if (e.target.id === 'cform') {
    submitForm(e);
  }
}, { passive: false });
