// Replays one recorded unified-simulation case on its original meshes, in the
// main page's palette. The demo pages use it interactively, and the demo clips
// were rendered from it headlessly, so both look the same. Poses come from the
// recorded traces; nothing is simulated here.
const LIB_URL = new URL("../assets/failure-viewer/three-viewer.js?v=20261011-3", import.meta.url).href;

let lib = null;
const loadLib = () => (lib ||= import(/* @vite-ignore */ LIB_URL));

const COLORS = { fixed: 0x2c6894, problem: 0xd8644c, moving: [0xdba543, 0xc9cfd5, 0x3c9a8b, 0xe7c47c, 0x6f9fbf, 0xb8834a] };
const OVERLAP = 0xe0312a;
const PUSH = new Set(["drive", "drive_scale10", "drive_nocontact"]);

export async function createViewer(container, { interactive = true, capture = false } = {}) {
  const THREE = await loadLib();
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: capture });
  renderer.setPixelRatio(capture ? 1 : Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf4f3ef);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.42;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xcfc6b8, 0.55));
  const key = new THREE.DirectionalLight(0xfffaf0, 2.6);
  key.castShadow = true;
  key.shadow.mapSize.set(1536, 1536);
  key.shadow.radius = 10;
  key.shadow.blurSamples = 12;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  const rim = new THREE.DirectionalLight(0xdfeaff, 0.8);
  scene.add(key, key.target, rim);

  // Recorded frames are z-up; the scene is y-up.
  const world = new THREE.Group();
  world.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0));
  scene.add(world);
  const camera = new THREE.PerspectiveCamera(24, 1, 0.001, 100);
  const controls = interactive ? new THREE.OrbitControls(camera, renderer.domElement) : null;
  if (controls) {
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
  }

  let doc = null;
  let bodies = [];   // { node, poses-by-phase lookup, overlay }
  let phase = null;
  let fitBox = new THREE.Box3();
  let radius = 1;
  let arrow = null;
  let floor = null;
  let needsRender = true;
  let view = { az: 35, el: 24 };
  const qa = new THREE.Quaternion();
  const qb = new THREE.Quaternion();

  function resize() {
    const { width, height } = container.getBoundingClientRect();
    renderer.setSize(Math.max(1, width), Math.max(1, height), false);
    camera.aspect = Math.max(1, width) / Math.max(1, height);
    camera.updateProjectionMatrix();
    needsRender = true;
  }
  new ResizeObserver(resize).observe(container);
  resize();
  controls?.addEventListener("change", () => { needsRender = true; });

  function sampleAt(times, t) {
    let hi = times.findIndex((x) => x >= t);
    if (hi < 0) hi = times.length - 1;
    const lo = Math.max(0, hi - 1);
    const span = times[hi] - times[lo];
    return { lo, hi, f: span > 0 ? Math.min(1, Math.max(0, (t - times[lo]) / span)) : 0 };
  }

  function pose(p, t, overlaps = true) {
    const { lo, hi, f } = sampleAt(p.t, t);
    for (const body of bodies) {
      const seq = p.poses[body.info.node];
      if (!seq) continue;
      const a = lo * 7;
      const b = hi * 7;
      body.node.position.set(
        seq[a] + (seq[b] - seq[a]) * f,
        seq[a + 1] + (seq[b + 1] - seq[a + 1]) * f,
        seq[a + 2] + (seq[b + 2] - seq[a + 2]) * f,
      );
      qa.set(seq[a + 3], seq[a + 4], seq[a + 5], seq[a + 6]);
      qb.set(seq[b + 3], seq[b + 4], seq[b + 5], seq[b + 6]);
      body.node.quaternion.copy(qa.slerp(qb, f));
    }
    // Overlap masks are per recorded sample; show the nearest one.
    const sample = f < 0.5 ? lo : hi;
    for (const body of overlaps ? bodies : []) {
      const faces = p.overlap?.[body.info.node]?.[sample];
      if (!faces || !faces.length) {
        if (body.overlay) body.overlay.visible = false;
        continue;
      }
      body.overlay ||= makeOverlay(body);
      const index = new Uint32Array(faces.length * 3);
      faces.forEach((face, i) => { index[i * 3] = face * 3; index[i * 3 + 1] = face * 3 + 1; index[i * 3 + 2] = face * 3 + 2; });
      body.overlay.geometry.setIndex(new THREE.BufferAttribute(index, 1));
      body.overlay.visible = true;
    }
    world.updateMatrixWorld(true);
  }

  function makeOverlay(body) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", body.mesh.geometry.getAttribute("position"));
    const overlay = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
      color: OVERLAP, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    }));
    body.mesh.add(overlay);
    return overlay;
  }

  function volume(node) {
    const size = new THREE.Box3().setFromObject(node).getSize(new THREE.Vector3());
    return size.x * size.y * size.z;
  }

  function material(color, ghost = false) {
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0, side: THREE.DoubleSide });
    if (ghost) Object.assign(mat, { transparent: true, opacity: 0.26, depthWrite: false });
    return mat;
  }

  // The push: a 270° arc in the positive sense about a revolute axis, or a
  // straight arrow along a slider, drawn at the joint anchor.
  function makeArrow(drive) {
    const group = new THREE.Group();
    const ink = new THREE.MeshBasicMaterial({ color: 0x1d2733 });
    const size = radius * 0.2;
    const axis = new THREE.Vector3(...drive.axis).normalize();
    const head = new THREE.Mesh(new THREE.ConeGeometry(size * 0.17, size * 0.42, 20), ink);
    if (drive.type === "revolute") {
      // TorusGeometry sweeps counter-clockwise about +z from +x; after 270° it
      // ends at -y heading +x. Cones point along +y, so turn the head to +x.
      group.add(new THREE.Mesh(new THREE.TorusGeometry(size, size * 0.06, 10, 64, Math.PI * 1.5), ink));
      head.position.set(size * 0.21, -size, 0);
      head.rotation.z = -Math.PI / 2;
      group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), axis);
    } else {
      const length = size * 2.2;
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(size * 0.06, size * 0.06, length, 12), ink);
      shaft.position.y = length / 2;
      head.position.y = length + size * 0.21;
      group.add(shaft);
      group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis);
    }
    group.add(head);
    group.position.set(...drive.anchor);
    group.visible = false;
    return group;
  }

  function placeCamera(u = 0.5) {
    const az = THREE.MathUtils.degToRad(view.az + (capture ? 14 * (u - 0.5) : 0));
    const el = THREE.MathUtils.degToRad(view.el);
    const dir = new THREE.Vector3(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az));
    const target = fitBox.getCenter(new THREE.Vector3());
    const corners = [];
    for (const x of [fitBox.min.x, fitBox.max.x]) for (const y of [fitBox.min.y, fitBox.max.y]) for (const z of [fitBox.min.z, fitBox.max.z]) corners.push(new THREE.Vector3(x, y, z));
    // Smallest distance that keeps the whole framing box inside 84% of the view.
    let lo = radius * 0.2;
    let hi = radius * 40;
    for (let i = 0; i < 30; i++) {
      const d = (lo + hi) / 2;
      camera.position.copy(target).addScaledVector(dir, d);
      camera.near = d / 100;
      camera.far = d * 20;
      camera.updateProjectionMatrix();
      camera.lookAt(target);
      camera.updateMatrixWorld(true);
      const inside = corners.every((c) => { const p = c.clone().project(camera); return Math.abs(p.x) < 0.84 && Math.abs(p.y) < 0.84 && p.z < 1; });
      if (inside) hi = d; else lo = d;
    }
    camera.position.copy(target).addScaledVector(dir, hi);
    camera.near = hi / 100;
    camera.far = hi * 20;
    camera.updateProjectionMatrix();
    camera.lookAt(target);
    if (controls) {
      controls.target.copy(target);
      controls.minDistance = hi * 0.35;
      controls.maxDistance = hi * 3;
      controls.update();
    }
    needsRender = true;
  }

  async function load(url) {
    doc = await (await fetch(url)).json();
    const loader = new THREE.GLTFLoader().setMeshoptDecoder(THREE.MeshoptDecoder);
    const gltf = await loader.loadAsync(url.replace(/\.json(?=$|\?)/, ".glb"));
    world.add(gltf.scene);
    view = { ...view, ...doc.view };

    bodies = doc.bodies.map((info) => {
      const node = gltf.scene.getObjectByName(info.node);
      let mesh = null;
      node.traverse((o) => { if (o.isMesh && !mesh) mesh = o; });
      return { info, node, mesh, overlay: null };
    });
    const first = doc.phases[0];
    pose(first, 0, false);
    const moving = bodies.filter((b) => b.info.role === "moving").sort((a, b) => volume(b.node) - volume(a.node));
    const colorOf = new Map(moving.map((b, i) => [b, COLORS.moving[i % COLORS.moving.length]]));
    for (const body of bodies) {
      const color = body.info.role === "fixed" ? COLORS.fixed : body.info.role === "problem" ? COLORS.problem : colorOf.get(body);
      // view.ghost shows fixed housings translucent so parts falling inside stay visible.
      const ghost = Boolean(view.ghost) && body.info.role === "fixed";
      const mat = material(color, ghost);
      body.node.traverse((o) => {
        if (!o.isMesh) return;
        let geometry = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry;
        geometry.deleteAttribute("normal");
        geometry = THREE.toCreasedNormals(geometry, THREE.MathUtils.degToRad(35));
        o.geometry = geometry;
        o.material = mat;
        o.castShadow = !ghost;
        o.receiveShadow = !ghost;
        o.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 38),
          new THREE.LineBasicMaterial({ color: new THREE.Color(color).multiplyScalar(0.45), transparent: true, opacity: ghost ? 0.3 : 0.55 })));
      });
    }

    // Frame either the first pose (parts that fall leave the frame) or every
    // recorded pose of every phase, so switching phases keeps the camera.
    world.position.set(0, 0, 0);
    world.updateMatrixWorld(true);
    const box = new THREE.Box3();
    const phases = view.frame === "initial" ? [first] : doc.phases;
    for (const p of phases) {
      const steps = view.frame === "initial" ? 0 : 24;
      for (let i = 0; i <= steps; i++) {
        pose(p, (p.t[p.t.length - 1] * i) / Math.max(1, steps), false);
        box.expandByObject(gltf.scene);
      }
    }
    const center = box.getCenter(new THREE.Vector3());
    world.position.set(-center.x, -box.min.y, -center.z);
    fitBox = box.clone().translate(new THREE.Vector3(-center.x, -box.min.y, -center.z));
    if (view.frame === "initial") fitBox.expandByScalar(fitBox.getSize(new THREE.Vector3()).length() * 0.06);
    radius = fitBox.getSize(new THREE.Vector3()).length() / 2;

    if (view.frame !== "initial") {
      floor = new THREE.Mesh(new THREE.PlaneGeometry(radius * 40, radius * 40), new THREE.ShadowMaterial({ opacity: 0.16 }));
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = fitBox.min.y - radius * 0.002;
      floor.receiveShadow = true;
      scene.add(floor);
    }
    key.position.set(-radius * 1.0, radius * 4.0, radius * 1.6);
    key.target.position.set(0, fitBox.getCenter(new THREE.Vector3()).y, 0);
    const sc = key.shadow.camera;
    sc.left = -radius * 1.8; sc.right = radius * 1.8; sc.top = radius * 1.8; sc.bottom = -radius * 1.8;
    sc.near = radius * 0.1; sc.far = radius * 10;
    sc.updateProjectionMatrix();
    rim.position.set(radius * 2.5, radius * 1.2, -radius * 2.5);

    if (doc.drive) {
      arrow = makeArrow(doc.drive);
      world.add(arrow);
    }
    setPhase(first.key);
    placeCamera();
    return doc;
  }

  function setPhase(keyName) {
    phase = doc.phases.find((p) => p.key === keyName) || doc.phases[0];
    if (arrow) {
      arrow.visible = PUSH.has(phase.key);
      arrow.scale.setScalar(phase.key === "drive_scale10" ? 1.35 : 1);
    }
    pose(phase, 0);
    needsRender = true;
    return phase;
  }

  return {
    load,
    setPhase,
    get phase() { return phase; },
    get doc() { return doc; },
    duration: () => phase.t[phase.t.length - 1],
    resetView: () => placeCamera(),
    // Render the current phase at time t (seconds of recorded time). u drifts
    // the camera slightly across a pre-rendered clip.
    renderAt(t, u) {
      pose(phase, t);
      if (capture) placeCamera(u);
      controls?.update();
      renderer.render(scene, camera);
      needsRender = false;
    },
    // For interactive pages: re-render only when the view or time changed.
    renderIfNeeded(t, changed) {
      if (controls?.update()) needsRender = true;
      if (!changed && !needsRender) return;
      this.renderAt(t);
    },
    frameDataURL: (quality = 0.93) => renderer.domElement.toDataURL("image/jpeg", quality),
  };
}
