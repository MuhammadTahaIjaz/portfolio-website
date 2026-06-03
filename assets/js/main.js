/* =============================================
   THREE.JS HERO — Animated network graph
   ============================================= */
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 30);

  // Particle nodes
  const NODE_COUNT = 120;
  const CONNECTION_DIST = 12;
  const positions = [];

  for (let i = 0; i < NODE_COUNT; i++) {
    positions.push({
      x: (Math.random() - 0.5) * 80,
      y: (Math.random() - 0.5) * 50,
      z: (Math.random() - 0.5) * 30,
      vx: (Math.random() - 0.5) * 0.03,
      vy: (Math.random() - 0.5) * 0.02,
      vz: (Math.random() - 0.5) * 0.01,
    });
  }

  // Points geometry
  const pointGeo = new THREE.BufferGeometry();
  const pointPositions = new Float32Array(NODE_COUNT * 3);
  const pointColors = new Float32Array(NODE_COUNT * 3);

  for (let i = 0; i < NODE_COUNT; i++) {
    pointPositions[i * 3]     = positions[i].x;
    pointPositions[i * 3 + 1] = positions[i].y;
    pointPositions[i * 3 + 2] = positions[i].z;
    const t = Math.random();
    pointColors[i * 3]     = t < 0.5 ? 0 : 0.49;
    pointColors[i * 3 + 1] = t < 0.5 ? 0.83 : 1.0;
    pointColors[i * 3 + 2] = t < 0.5 ? 1.0 : 0.53;
  }

  pointGeo.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));
  pointGeo.setAttribute('color', new THREE.BufferAttribute(pointColors, 3));

  const pointMat = new THREE.PointsMaterial({
    size: 0.35,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(pointGeo, pointMat);
  scene.add(points);

  // Lines geometry
  const MAX_LINES = NODE_COUNT * 6;
  const lineGeo = new THREE.BufferGeometry();
  const linePos = new Float32Array(MAX_LINES * 2 * 3);
  const lineCol = new Float32Array(MAX_LINES * 2 * 3);
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  lineGeo.setAttribute('color', new THREE.BufferAttribute(lineCol, 3));

  const lineMat = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.3,
  }));
  scene.add(lineMat);

  // Mouse parallax
  let mx = 0, my = 0;
  document.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 0.5;
    my = (e.clientY / window.innerHeight - 0.5) * 0.3;
  });

  function updateLines() {
    let lineIdx = 0;
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        if (lineIdx >= MAX_LINES) break;
        const dx = positions[i].x - positions[j].x;
        const dy = positions[i].y - positions[j].y;
        const dz = positions[i].z - positions[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < CONNECTION_DIST) {
          const alpha = 1 - dist / CONNECTION_DIST;
          const base = lineIdx * 6;
          linePos[base]     = positions[i].x; linePos[base + 1] = positions[i].y; linePos[base + 2] = positions[i].z;
          linePos[base + 3] = positions[j].x; linePos[base + 4] = positions[j].y; linePos[base + 5] = positions[j].z;
          lineCol[base]     = 0; lineCol[base + 1] = alpha * 0.83; lineCol[base + 2] = alpha;
          lineCol[base + 3] = 0; lineCol[base + 4] = alpha * 0.83; lineCol[base + 5] = alpha;
          lineIdx++;
        }
      }
    }
    lineGeo.setDrawRange(0, lineIdx * 2);
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate = true;
  }

  function animate() {
    requestAnimationFrame(animate);

    // Update positions
    for (let i = 0; i < NODE_COUNT; i++) {
      const p = positions[i];
      p.x += p.vx; p.y += p.vy; p.z += p.vz;
      if (Math.abs(p.x) > 40) p.vx *= -1;
      if (Math.abs(p.y) > 25) p.vy *= -1;
      if (Math.abs(p.z) > 15) p.vz *= -1;
      pointPositions[i * 3]     = p.x;
      pointPositions[i * 3 + 1] = p.y;
      pointPositions[i * 3 + 2] = p.z;
    }
    pointGeo.attributes.position.needsUpdate = true;

    updateLines();

    // Parallax camera
    camera.position.x += (mx * 4 - camera.position.x) * 0.04;
    camera.position.y += (-my * 3 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Fade canvas when scrolled past hero
  window.addEventListener('scroll', () => {
    const progress = window.scrollY / window.innerHeight;
    canvas.style.opacity = Math.max(0, 1 - progress * 1.5);
  });
})();

/* =============================================
   NAV — scroll state + mobile menu
   ============================================= */
(function initNav() {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const menu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });

  burger.addEventListener('click', () => {
    menu.classList.toggle('open');
    burger.classList.toggle('active');
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      burger.classList.remove('active');
    });
  });
})();

/* =============================================
   SCROLL REVEAL
   ============================================= */
(function initReveal() {
  const items = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-section');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || 0);
        setTimeout(() => el.classList.add('visible'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(el => observer.observe(el));
})();

/* =============================================
   COUNTER ANIMATION
   ============================================= */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      const duration = 1800;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(ease * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

/* =============================================
   SMOOTH ACTIVE NAV LINK
   ============================================= */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__links a');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.style.color = '');
        const active = document.querySelector(`.nav__links a[href="#${entry.target.id}"]`);
        if (active) active.style.color = '#00d4ff';
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
})();
