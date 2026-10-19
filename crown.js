/* 3D-корона из логотипа (замена «черепа» из референса): летит сквозь страницу вместе со скроллом */
(function () {
  const canvas = document.getElementById('crown');
  const state = { x: .6, y: -.16, z: 0, rx: .12, ry: .5, rz: 0, s: 1, o: 1 }; // x,y — доли полуширины/полувысоты экрана
  const api = { state, ready: false };
  window.Crown = api;
  if (!window.THREE) return;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { canvas.style.display = 'none'; return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
  camera.position.set(0, 0, 8);

  // --- студийное окружение для металла ---
  const envScene = new THREE.Scene();
  const box = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), new THREE.MeshBasicMaterial({ color: 0x15130f, side: THREE.BackSide }));
  envScene.add(box);
  const panel = (w, h, c, x, y, z) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); envScene.add(m); };
  panel(9, 5, 0xfff1d6, -7, 6, 6); panel(6, 8, 0xffffff, 8, 1, 3); panel(10, 3, 0xffd9a0, 0, -7, 4); panel(5, 5, 0x9fb7ff, -8, -2, -5); panel(12, 2, 0xffffff, 0, 9, -3);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(envScene, 0.02).texture;

  scene.add(new THREE.AmbientLight(0xffffff, .25));
  const key = new THREE.DirectionalLight(0xffe2b0, 2.2); key.position.set(-3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x9db8ff, 1.6); rim.position.set(4, 1, -4); scene.add(rim);

  // --- материалы ---
  const black = new THREE.MeshPhysicalMaterial({ color: 0x14141a, metalness: .9, roughness: .17, clearcoat: 1, clearcoatRoughness: .05, envMapIntensity: 1.6 });
  const gold = new THREE.MeshPhysicalMaterial({ color: 0xd9a94e, metalness: 1, roughness: .2, clearcoat: .6, envMapIntensity: 1.5, });
  const ruby = new THREE.MeshPhysicalMaterial({ color: 0xb3122b, metalness: .1, roughness: .05, transmission: 0, clearcoat: 1, emissive: 0x330008, });
  const mats = [black, gold, ruby];

  // --- геометрия: силуэт зубцов, изогнутый в кольцо ---
  const R = 1, SPIKES = 5, L = Math.PI * 2 * R;
  function silhouette(u) {
    const t = (u / L * SPIKES) % 1;                  // 0..1 внутри зубца
    const peak = Math.pow(Math.max(0, 1 - Math.abs(t * 2 - 1)), 1.35); // острый пик
    const wave = .09 * Math.sin(t * Math.PI * 2 * 2 + Math.PI);          // малые зубчики между
    return .42 + .78 * peak + Math.max(0, -wave) * .5;
  }
  const pts = []; const STEP = L / 360;
  for (let u = 0; u <= L + 1e-6; u += STEP) pts.push(new THREE.Vector2(u, silhouette(u)));
  const shape = new THREE.Shape();
  shape.moveTo(0, 0); shape.lineTo(L, 0);
  for (let i = pts.length - 1; i >= 0; i--) shape.lineTo(pts[i].x, pts[i].y);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: .06, bevelEnabled: true, bevelThickness: .035, bevelSize: .03, bevelSegments: 3, steps: 1, curveSegments: 1 });
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i), v = pos.getY(i), d = pos.getZ(i) - .03;
    const a = u / R, r = R + d;
    pos.setXYZ(i, Math.cos(a) * r, v, Math.sin(a) * r);
  }
  geo.computeVertexNormals();
  const body = new THREE.Mesh(geo, black);

  const crown = new THREE.Group();
  crown.add(body);
  // золотые ободы (как в логотипе)
  [0, .1].forEach((y, i) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R + .03, .045 - i * .012, 20, 160), gold);
    ring.rotation.x = Math.PI / 2; ring.position.y = y - .02; crown.add(ring);
  });
  // шарики на кончиках, камни на ободе
  for (let k = 0; k < SPIKES; k++) {
    const a = (k + .5) / SPIKES * Math.PI * 2;
    const tip = new THREE.Mesh(new THREE.SphereGeometry(.07, 24, 24), gold);
    tip.position.set(Math.cos(a) * (R + .005), 1.2 + .06, Math.sin(a) * (R + .005)); crown.add(tip);
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(.075, 0), ruby);
    gem.scale.y = 1.4; const a2 = a, g = new THREE.Vector3(Math.cos(a2) * (R + .07), .27, Math.sin(a2) * (R + .07)); gem.position.copy(g); gem.lookAt(g.x * 2, g.y, g.z * 2); crown.add(gem);
  }

  // надпись TOHA на каждом зубце-«впадине» короны (шрифт как в логотипе)
  (function () {
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 256;
    const g = cv.getContext('2d');
    const grad = g.createLinearGradient(0, 40, 0, 216); grad.addColorStop(0, '#fff0c2'); grad.addColorStop(.5, '#e2b45e'); grad.addColorStop(1, '#a87a2c');
    g.fillStyle = grad; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '700 190px "Times New Roman", Georgia, serif';
    if ('letterSpacing' in g) g.letterSpacing = '26px';
    g.fillText('TOHA', 512 + 13, 136);
    const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 8;
    const label = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, toneMapped: false, depthWrite: false });
    label.userData.keepT = true; mats.push(label);
    const span = Math.PI * 2 / SPIKES * .8;
    for (let k = 0; k < SPIKES; k++) {
      const a = k / SPIKES * Math.PI * 2;               // середина «впадины» между зубцами
      const m = new THREE.Mesh(new THREE.CylinderGeometry(R + .075, R + .075, .26, 48, 1, true, Math.PI / 2 - a - span / 2, span), label);
      m.position.y = .26; crown.add(m);
    }
  })();
  crown.position.y = -.6;
  const holder = new THREE.Group(); holder.add(crown); scene.add(holder);

  // --- размеры ---
  let W = 1, H = 1, halfH = 1, halfW = 1;
  function resize() {
    W = innerWidth; H = innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z; halfW = halfH * camera.aspect;
  }
  addEventListener('resize', resize); resize();

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', e => { mouse.tx = (e.clientX / W - .5) * 2; mouse.ty = (e.clientY / H - .5) * 2; }, { passive: true });

  api.setTheme = (theme) => {
    renderer.toneMappingExposure = theme === 'day' ? .95 : 1.2;
    black.color.set(theme === 'day' ? 0x1a1a20 : 0x14141a);
    gold.color.set(theme === 'day' ? 0xc9962f : 0xe0b45c);
  };
  api.setTheme(document.documentElement.dataset.theme);

  const clock = new THREE.Clock(); let idle = 0; const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible = true; document.addEventListener('visibilitychange', () => { visible = !document.hidden; });
  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(clock.getDelta(), .05);
    if (!reduce) idle += dt * .35;
    mouse.x += (mouse.tx - mouse.x) * .05; mouse.y += (mouse.ty - mouse.y) * .05;
    const fly = THREE.MathUtils.clamp((state.z - 1) / 3, 0, 1);
    const narrow = Math.min(1, camera.aspect / 1.2);       // на телефонах корона уходит ближе к центру и меньше
    const s = state.s * (camera.aspect < 1 ? .62 : 1);
    holder.position.set(state.x * halfW * (narrow < 1 ? .35 : 1) + mouse.x * .12, state.y * halfH * (camera.aspect < 1 ? .55 : 1) + (camera.aspect < 1 ? halfH * .74 * (1 - fly) : 0) - mouse.y * .08, state.z);
    holder.rotation.set(state.rx + mouse.y * .08, state.ry + idle, state.rz);
    holder.scale.setScalar(s);
    const o = THREE.MathUtils.clamp(state.o, 0, 1) * (camera.aspect < 1 ? .3 + .7 * fly : 1);
    mats.forEach(m => { m.opacity = o; m.transparent = !!m.userData.keepT || o < .995; m.depthWrite = true; });
    holder.visible = o > .003;
    renderer.render(scene, camera);
  }
  frame(); api.ready = true;
})();
