// Interactive views of the two Figure 7 failure details. The blocked parts are
// highlighted; everything else keeps the page's steel-blue structure color.
// three.js loads only when a viewer nears the viewport. A viewer with a coarse
// model shows it first and swaps in the full model once that has loaded.
const BLOCKED_PARTS = { bicycle: ["body_023"], clock: ["body_172", "body_174"] };
// Resolved against the page rather than this module, so the URL still holds
// when the GenLab copy bundles this file into Astro's /_astro/ directory.
const LIB_URL = new URL("assets/failure-viewer/three-viewer.js?v=20261011-3", document.baseURI).href;

let lib = null;
const loadLib = () => (lib ||= import(/* @vite-ignore */ LIB_URL));

function stageColor() {
  return getComputedStyle(document.documentElement).getPropertyValue("--surface-2").trim() || "#f1f0eb";
}

async function startViewer(container) {
  const status = container.querySelector(".viewer-status");
  const unavailable = () => { if (status) status.textContent = "3D preview unavailable"; };
  let THREE;
  try {
    THREE = await loadLib();
  } catch (_) {
    unavailable();
    return;
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xcfc6b8, 0.7));
  const key = new THREE.DirectionalLight(0xfffaf0, 2.2);
  key.position.set(3, 5, 4);
  scene.add(key);

  const applyBackground = () => renderer.setClearColor(new THREE.Color(stageColor()), 1);
  applyBackground();
  document.addEventListener("funcad-theme", () => { applyBackground(); needsRender = true; });

  const camera = new THREE.PerspectiveCamera(32, 1, 0.001, 1000);
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.9;
  controls.enablePan = false;

  let needsRender = true;
  let visible = true;
  controls.addEventListener("change", () => { needsRender = true; });
  renderer.domElement.addEventListener("pointerdown", () => {
    controls.autoRotate = false;
    container.classList.add("interacted");
  }, { once: true });

  function resize() {
    const { width, height } = container.getBoundingClientRect();
    renderer.setSize(Math.max(1, width), Math.max(1, height), false);
    camera.aspect = Math.max(1, width) / Math.max(1, height);
    camera.updateProjectionMatrix();
    needsRender = true;
  }

  const blockedTokens = BLOCKED_PARTS[container.dataset.failureModel] || [];
  const structure = new THREE.MeshStandardMaterial({ color: 0x3f7ea8, roughness: 0.5, metalness: 0.05, side: THREE.DoubleSide });
  const blocked = new THREE.MeshStandardMaterial({ color: 0xd8644c, roughness: 0.45, metalness: 0.05, side: THREE.DoubleSide, emissive: 0x3a0d05, emissiveIntensity: 0.25 });
  const isBlocked = (object) => {
    for (let node = object; node; node = node.parent) {
      if (blockedTokens.some((token) => node.name.includes(token))) return true;
    }
    return false;
  };

  // Frame the first model shown; a later level of detail reuses its centering
  // so the swap does not move the camera. data-view sets the starting direction.
  const view = (container.dataset.view || "1.55 1.05 1.85").split(" ").map(Number);
  let offset = null;
  function frame(root) {
    const box = new THREE.Box3().setFromObject(root);
    offset = box.getCenter(new THREE.Vector3()).negate();
    const radius = Math.max(box.getSize(new THREE.Vector3()).length() / 2, 1e-3);
    // Fit the bounding sphere inside the narrower field of view.
    const vfov = THREE.MathUtils.degToRad(camera.fov);
    const fov = Math.min(vfov, 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect));
    camera.position.set(...view).normalize().multiplyScalar((radius / Math.sin(fov / 2)) * 1.02);
    camera.near = radius / 100;
    camera.far = radius * 50;
    camera.updateProjectionMatrix();
    controls.target.set(0, 0, 0);
    controls.minDistance = radius * 0.6;
    controls.maxDistance = radius * 6;
    controls.update();
  }

  let shown = null;
  let shownLevel = 0;
  function show(root, level) {
    if (level <= shownLevel) return;
    root.traverse((object) => { if (object.isMesh) object.material = isBlocked(object) ? blocked : structure; });
    if (!offset) frame(root);
    root.position.copy(offset);
    if (shown) {
      scene.remove(shown);
      shown.traverse((object) => { if (object.isMesh) object.geometry.dispose(); });
    }
    scene.add(root);
    shown = root;
    shownLevel = level;
    container.dataset.lod = level === 2 ? "fine" : "coarse";
    container.classList.add("ready");
    needsRender = true;
  }

  new ResizeObserver(resize).observe(container);
  new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; }).observe(container);
  resize();

  // Request both levels together; the small coarse file normally arrives first.
  const loader = new THREE.GLTFLoader().setMeshoptDecoder(THREE.MeshoptDecoder);
  const sources = [[container.dataset.modelCoarse, 1], [container.dataset.modelSrc, 2]].filter(([url]) => url);
  let failed = 0;
  sources.forEach(([url, level]) => {
    loader.load(url, (gltf) => show(gltf.scene, level), undefined, () => {
      failed += 1;
      if (failed === sources.length) unavailable();
    });
  });

  renderer.setAnimationLoop(() => {
    if (!visible) return;
    if (controls.update() || controls.autoRotate) needsRender = true;
    if (!needsRender) return;
    renderer.render(scene, camera);
    needsRender = false;
  });
}

// Start each viewer only when it comes near the viewport.
const viewers = document.querySelectorAll("[data-failure-model]");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      startViewer(entry.target);
    });
  }, { rootMargin: "600px 0px" });
  viewers.forEach((v) => io.observe(v));
} else {
  viewers.forEach(startViewer);
}
