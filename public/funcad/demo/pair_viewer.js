/* Dual-pane Animation contrast viewer. Loads pair data via a classic <script> tag (file://). */
(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var pairId = params.get("pair");
  if (!pairId) return;

  var MUTED = [0x7a8490, 0x6b5f54, 0x5c6b63, 0x8a7e72, 0x4d5560, 0x9a8f80];
  var JOINT_HEX = {
    revolute: 0x22d3ee,
    slider: 0xf59e0b,
    cylindrical: 0xd946ef,
    lock: 0xd1d5db
  };
  var PEN_BODY = 0xe05555;
  var PEN_REGION = 0xff2a2a;
  var DRIVEN_BODY = 0xf0a020;
  var BODY_DIM = 0.25;
  var REGION_DIM = 0.22;
  var PAIR_LABELS = {
    diesel_slider_crank: [
      { name: "crank", text: "曲轴" },
      { name: "rod", text: "连杆" },
      { name: "piston", text: "活塞" },
      { name: "cylinder", text: "缸体" }
    ],
    planetary_gear: [
      { name: "sun", text: "太阳轮" },
      { name: "planet_0", text: "行星轮" },
      { name: "ring", text: "齿圈" },
      { name: "carrier", text: "行星架" }
    ],
    mechanical_alarm_clock: [
      { name: "g14_group_timekeeping_barrel", text: "发条桶" },
      { name: "g9_group_minute_hand", text: "分针" },
      { name: "g6_group_hour_hand", text: "时针" },
      { name: "g11_group_second_hand", text: "秒针" }
    ],
    rack_pinion_gate: [
      { name: "g1_group_pinion_crank", text: "齿轮" },
      { name: "g2_group_rack_gate", text: "齿条" }
    ]
  };

  var _qa = new THREE.Quaternion();
  var _qb = new THREE.Quaternion();
  var _box = new THREE.Box3();
  var _center = new THREE.Vector3();
  var _size = new THREE.Vector3();
  var _corner = new THREE.Vector3();
  var _dir = new THREE.Vector3();
  var _worldAnchor = new THREE.Vector3();
  var _localAnchor = new THREE.Vector3();
  var _proj = new THREE.Vector3();
  var _view = new THREE.Vector3();
  var _clipN = new THREE.Vector3(1, 0, 0);

  var state = {
    data: null,
    pairId: pairId,
    bPhase: "static",
    playing: false,
    loop: true,
    speed: 1,
    time: 0,
    tMax: 0,
    showAxes: false,
    showTrails: false,
    wireframe: false,
    clip: false,
    canClip: false,
    penBody: pairId === "planetary_gear",
    penRegion: pairId === "planetary_gear",
    lastTs: 0,
    sliderSync: false,
    paneA: null,
    paneB: null,
    clipPlane: null,
    labels: []
  };

  var el = {};

  function $(id) {
    return document.getElementById(id);
  }

  function decodeB64(b64, TypedArray) {
    if (!b64) return new TypedArray(0);
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TypedArray(bytes.buffer);
  }

  function fmtDisp(m) {
    if (m == null || !isFinite(m)) return "—";
    var a = Math.abs(m);
    if (a < 1e-6) return "≈ 0";
    if (a >= 1) return m.toFixed(2) + " m";
    if (a >= 1e-3) return (m * 1000).toFixed(1) + " mm";
    return (m * 1000).toFixed(3) + " mm";
  }

  function fmtNum(x, digits) {
    if (x == null || !isFinite(x)) return "—";
    return Number(x).toFixed(digits == null ? 4 : digits);
  }

  function motionUnit(driveInput) {
    if (!driveInput) return "rad";
    return driveInput.joint_type === "slider" ? "m" : "rad";
  }

  function fmtMotion(val, unit) {
    if (val == null || !isFinite(val)) return "—";
    if (unit === "m") return fmtDisp(val);
    return (Math.abs(val) >= 10 ? val.toFixed(2) : val.toFixed(4)) + " rad";
  }

  function verdictClass(v) {
    if (v === "STABLE" || v === "MOTION_OK") return "badge-ok";
    if (v === "COLLAPSE") return "badge-collapse";
    if (v === "MOTION_DEAD") return "badge-dead";
    if (v === "MOTION_ERRATIC") return "badge-erratic";
    return "";
  }

  function verdictLabel(v) {
    if (v === "STABLE") return "STABLE 静置稳定";
    if (v === "COLLAPSE") return "COLLAPSE 静置坍塌";
    if (v === "MOTION_OK") return "MOTION_OK 驱动有效";
    if (v === "MOTION_DEAD") return "MOTION_DEAD 驱动无运动";
    if (v === "MOTION_ERRATIC") return "MOTION_ERRATIC 驱动失控";
    return v || "—";
  }

  function cssHex(n) {
    return "#" + ("000000" + n.toString(16)).slice(-6);
  }

  function nameHas(n, token) {
    return n.indexOf(token) >= 0;
  }

  function materialSpec(name, grounded, index) {
    var n = String(name || "").toLowerCase();
    // Planetary parts may be grounded; color them before the gray plate.
    if (n === "ring") {
      return { color: 0x8b6bb5, metalness: 0.35, roughness: 0.42 };
    }
    if (n === "sun") {
      return { color: 0xf5c542, metalness: 0.45, roughness: 0.38 };
    }
    if (n === "planet_0") {
      return { color: 0x7ecf6a, metalness: 0.35, roughness: 0.42 };
    }
    if (n === "planet_1") {
      return { color: 0x5b8def, metalness: 0.35, roughness: 0.42 };
    }
    if (n === "planet_2") {
      return { color: 0xf090c0, metalness: 0.25, roughness: 0.42 };
    }
    if (n === "carrier") {
      return { color: 0xd4c4e8, metalness: 0.18, roughness: 0.48 };
    }
    if (grounded || n === "ground" || nameHas(n, "ground")) {
      return { color: 0x6d6a64, metalness: 0.04, roughness: 0.92 };
    }
    if (nameHas(n, "timekeeping_barrel")) {
      return { color: 0xc4a35a, metalness: 0.55, roughness: 0.38 };
    }
    if (nameHas(n, "second_hand")) {
      return { color: 0xc45c4a, metalness: 0.35, roughness: 0.42 };
    }
    if (nameHas(n, "minute_hand") || nameHas(n, "hour_hand")) {
      return { color: 0xd8d2c4, metalness: 0.45, roughness: 0.36 };
    }
    if (nameHas(n, "pinion")) {
      return { color: 0xc9b27a, metalness: 0.5, roughness: 0.4 };
    }
    if (nameHas(n, "rack_gate")) {
      return { color: 0x8a96a4, metalness: 0.48, roughness: 0.42 };
    }
    if (n === "seat" || nameHas(n, "seat") || nameHas(n, "wood")) {
      return { color: 0x8b5a32, metalness: 0.02, roughness: 0.72 };
    }
    if (nameHas(n, "leg") || nameHas(n, "tube")) {
      return { color: 0x3d5a7a, metalness: 0.35, roughness: 0.42 };
    }
    if (n === "piston" || nameHas(n, "piston")) {
      return { color: 0xd2d7de, metalness: 0.62, roughness: 0.28 };
    }
    if (
      n === "cylinder" || nameHas(n, "cylinder") || nameHas(n, "block") ||
      nameHas(n, "cowl") || nameHas(n, "frame")
    ) {
      return { color: 0x2c3036, metalness: 0.78, roughness: 0.36 };
    }
    if (
      n === "crank" || n === "rod" || nameHas(n, "crank") || nameHas(n, "rod") ||
      nameHas(n, "bar") || nameHas(n, "arm") || nameHas(n, "coupler")
    ) {
      return { color: 0xb4bcc6, metalness: 0.86, roughness: 0.24 };
    }
    return {
      color: MUTED[index % MUTED.length],
      metalness: 0.28,
      roughness: 0.55
    };
  }

  function findBody(pane, name) {
    if (!pane) return null;
    for (var i = 0; i < pane.bodies.length; i++) {
      if (pane.bodies[i].name === name) return pane.bodies[i];
    }
    return null;
  }

  function sampleIndex(times, t) {
    var n = times.length;
    if (n <= 1) return 0;
    if (t <= times[0]) return 0;
    if (t >= times[n - 1]) return n - 1;
    var lo = 0;
    var hi = n - 1;
    while (lo + 1 < hi) {
      var mid = (lo + hi) >> 1;
      if (times[mid] <= t) lo = mid;
      else hi = mid;
    }
    return lo;
  }

  function interpPose(rt, t, outPos, outQuat) {
    var times = rt.times;
    var pos = rt.pos;
    var quat = rt.quat;
    var n = times.length;
    if (!n || !pos || pos.length < 3) return false;
    var k;
    if (n === 1 || t <= times[0]) {
      outPos.set(pos[0], pos[1], pos[2]);
      outQuat.set(quat[1], quat[2], quat[3], quat[0]);
      return true;
    }
    if (t >= times[n - 1]) {
      k = n - 1;
      outPos.set(pos[k * 3], pos[k * 3 + 1], pos[k * 3 + 2]);
      outQuat.set(quat[k * 4 + 1], quat[k * 4 + 2], quat[k * 4 + 3], quat[k * 4]);
      return true;
    }
    var i = sampleIndex(times, t);
    var j = i + 1;
    var dt = times[j] - times[i];
    var a = dt > 1e-12 ? (t - times[i]) / dt : 0;
    var i3 = i * 3;
    var j3 = j * 3;
    var i4 = i * 4;
    var j4 = j * 4;
    outPos.set(
      pos[i3] + (pos[j3] - pos[i3]) * a,
      pos[i3 + 1] + (pos[j3 + 1] - pos[i3 + 1]) * a,
      pos[i3 + 2] + (pos[j3 + 2] - pos[i3 + 2]) * a
    );
    _qa.set(quat[i4 + 1], quat[i4 + 2], quat[i4 + 3], quat[i4]);
    _qb.set(quat[j4 + 1], quat[j4 + 2], quat[j4 + 3], quat[j4]);
    outQuat.copy(_qa).slerp(_qb, a);
    return true;
  }

  function expandWorldAABB(mesh, box) {
    var bb = mesh.geometry.boundingBox;
    if (!bb) return;
    var m = mesh.matrixWorld;
    for (var i = 0; i < 8; i++) {
      _corner.set(
        i & 1 ? bb.max.x : bb.min.x,
        i & 2 ? bb.max.y : bb.min.y,
        i & 4 ? bb.max.z : bb.min.z
      ).applyMatrix4(m);
      box.expandByPoint(_corner);
    }
  }

  function assemblyAABB(pane) {
    _box.makeEmpty();
    for (var i = 0; i < pane.bodies.length; i++) {
      expandWorldAABB(pane.bodies[i].mesh, _box);
    }
    return _box;
  }

  function fitDistance(radius, fovDeg) {
    var fov = THREE.MathUtils.degToRad(fovDeg);
    return radius / Math.max(Math.sin(fov * 0.5), 1e-4) * 1.2;
  }

  function applyNearFar(pane, extent) {
    var ext = Math.max(extent, 1e-3);
    pane.camera.near = Math.max(1e-4, 1e-3 * ext);
    pane.camera.far = 1e5;
    pane.camera.updateProjectionMatrix();
  }

  function frameCamera(pane, box, storeInit) {
    if (box.isEmpty()) return;
    box.getCenter(_center);
    box.getSize(_size);
    var radius = Math.max(_size.length() * 0.5, 1e-4);
    var dist = fitDistance(radius, pane.camera.fov);
    _dir.set(0.7, -1.05, 0.62).normalize();
    pane.camera.up.set(0, 0, 1);
    pane.camera.position.copy(_center).addScaledVector(_dir, dist);
    pane.controls.target.copy(_center);
    applyNearFar(pane, Math.max(_size.x, _size.y, _size.z, radius));
    pane.controls.update();
    if (storeInit) {
      pane.initTarget.copy(_center);
      pane.initPos.copy(pane.camera.position);
      pane.extent = Math.max(_size.x, _size.y, _size.z, radius * 2);
    }
  }

  function phaseRecord(pane) {
    var phases = pane.track.phases || {};
    return phases[pane.phase] || null;
  }

  function phaseTimes(pane) {
    var rec = phaseRecord(pane);
    return rec && rec.times ? rec.times : [0];
  }

  function clampTime(t, tMax) {
    if (!isFinite(tMax) || tMax <= 0) return 0;
    if (t < 0) return 0;
    if (t > tMax) return tMax;
    return t;
  }

  function hasTriMasks(pen) {
    if (!pen || !pen.tri_masks) return false;
    var keys = Object.keys(pen.tri_masks);
    return keys.length > 0;
  }

  function flagAt(flags, name, sample) {
    if (!flags) return 0;
    var arr = flags[name];
    if (!arr || sample < 0 || sample >= arr.length) return 0;
    return arr[sample] ? 1 : 0;
  }

  function anyFlag(flags, bodies, sample) {
    if (!flags) return false;
    for (var i = 0; i < bodies.length; i++) {
      if (bodies[i].grounded) continue;
      if (flagAt(flags, bodies[i].name, sample)) return true;
    }
    return false;
  }

  function hideOverlay(b) {
    if (b.overlay) b.overlay.visible = false;
  }

  function setOverlay(b, faceIdxs) {
    if (!faceIdxs || !faceIdxs.length) {
      hideOverlay(b);
      return;
    }
    var geoSrc = b.mesh.geometry;
    var nFaces = faceIdxs.length;
    var idxOut = new Uint32Array(nFaces * 3);
    var srcIdx = geoSrc.index;
    var i, base;
    if (srcIdx) {
      var arr = srcIdx.array;
      for (i = 0; i < nFaces; i++) {
        base = (faceIdxs[i] | 0) * 3;
        idxOut[i * 3] = arr[base];
        idxOut[i * 3 + 1] = arr[base + 1];
        idxOut[i * 3 + 2] = arr[base + 2];
      }
    } else {
      for (i = 0; i < nFaces; i++) {
        base = (faceIdxs[i] | 0) * 3;
        idxOut[i * 3] = base;
        idxOut[i * 3 + 1] = base + 1;
        idxOut[i * 3 + 2] = base + 2;
      }
    }
    if (!b.overlay) {
      var geo = new THREE.BufferGeometry();
      geo.setAttribute("position", geoSrc.getAttribute("position"));
      var nrm = geoSrc.getAttribute("normal");
      if (nrm) geo.setAttribute("normal", nrm);
      var mat = new THREE.MeshStandardMaterial({
        color: PEN_REGION,
        emissive: 0x4a0000,
        metalness: 0.08,
        roughness: 0.45,
        transparent: true,
        opacity: 0.95,
        depthWrite: true,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -2,
        flatShading: true,
        clippingPlanes: state.clip && state.clipPlane ? [state.clipPlane] : [],
        side: state.clip ? THREE.DoubleSide : THREE.FrontSide
      });
      b.overlay = new THREE.Mesh(geo, mat);
      b.overlay.renderOrder = 2;
      b.mesh.add(b.overlay);
    }
    var prev = b.overlay.geometry.getIndex();
    if (prev && prev.array && prev.array.length === idxOut.length) {
      prev.array.set(idxOut);
      prev.needsUpdate = true;
    } else {
      b.overlay.geometry.setIndex(new THREE.BufferAttribute(idxOut, 1));
    }
    b.overlay.visible = true;
  }

  function bodyHighlightOn(pane) {
    return !!state.penBody;
  }

  function phaseVerdict(pane) {
    var rec = phaseRecord(pane);
    var v = rec && rec.verdict;
    return v && v.verdict ? v.verdict : null;
  }

  function bPhaseDead() {
    return phaseVerdict(state.paneB) === "MOTION_DEAD";
  }

  function drivenBodyName(pane) {
    if (!pane || pane.side !== "b") return null;
    if (phaseVerdict(pane) !== "MOTION_DEAD") return null;
    var rec = phaseRecord(pane);
    var di = (rec && rec.verdict && rec.verdict.drive_input) || {};
    return di.driven_body || di.load_on || di.body_b || null;
  }

  function applyPenetration(pane, t) {
    var rec = phaseRecord(pane);
    var times = rec && rec.times ? rec.times : [0];
    var localT = clampTime(t, pane.tMax);
    var sample = sampleIndex(times, localT);
    var pen = (pane.track.penetration || {})[pane.phase] || {};
    var flags = pen.body_flags || null;
    var masks = pen.tri_masks;
    var regionOn = state.penRegion;
    var bodyOn = bodyHighlightOn(pane);
    if (regionOn && !hasTriMasks(pen)) {
      bodyOn = true;
      regionOn = false;
    }
    var driven = drivenBodyName(pane);
    var showDriven = !!driven;
    var flaggedAny = bodyOn && anyFlag(flags, pane.bodies, sample);
    var highlightAny = flaggedAny || showDriven;
    var i, b, flagged, faces, isDriven, hex;

    for (i = 0; i < pane.bodies.length; i++) {
      b = pane.bodies[i];
      flagged = !!(bodyOn && !b.grounded && flagAt(flags, b.name, sample));
      isDriven = !!(showDriven && b.name === driven);
      faces = regionOn && masks && masks[b.name] ? masks[b.name][sample] : null;

      if (regionOn) {
        if (flagged) hex = PEN_BODY;
        else if (isDriven) hex = DRIVEN_BODY;
        else hex = b.baseColor;
        b.mat.color.setHex(hex);
        b.mat.opacity = 1;
        b.mat.transparent = !!state.wireframe;
        b.mat.depthWrite = !state.wireframe;
        setOverlay(b, faces);
      } else if (highlightAny) {
        if (flagged) {
          b.mat.color.setHex(PEN_BODY);
          b.mat.opacity = 1;
          b.mat.transparent = !!state.wireframe;
          b.mat.depthWrite = !state.wireframe;
        } else if (isDriven) {
          b.mat.color.setHex(DRIVEN_BODY);
          b.mat.opacity = 1;
          b.mat.transparent = !!state.wireframe;
          b.mat.depthWrite = !state.wireframe;
        } else {
          b.mat.color.setHex(b.baseColor);
          b.mat.opacity = 1;
          b.mat.transparent = !!state.wireframe;
          b.mat.depthWrite = !state.wireframe;
        }
        hideOverlay(b);
      } else {
        b.mat.color.setHex(b.baseColor);
        b.mat.opacity = 1;
        b.mat.transparent = !!state.wireframe;
        b.mat.depthWrite = !state.wireframe;
        hideOverlay(b);
      }
      b.mat.wireframe = !!state.wireframe;
      b.mat.needsUpdate = true;
    }
  }

  function applyPaneTime(pane, t) {
    var rec = phaseRecord(pane);
    if (!rec || !rec.has_trace) {
      applyPenetration(pane, t);
      return;
    }
    var localT = clampTime(t, pane.tMax);
    for (var i = 0; i < pane.bodies.length; i++) {
      var b = pane.bodies[i];
      interpPose(b.rt, localT, b.mesh.position, b.mesh.quaternion);
    }
    for (var j = 0; j < pane.bodies.length; j++) pane.bodies[j].mesh.updateMatrixWorld();
    applyPenetration(pane, t);
  }

  function applyTime(t) {
    if (state.paneA) applyPaneTime(state.paneA, t);
    if (state.paneB) applyPaneTime(state.paneB, t);
    updatePartLabels();
  }

  function setPenPressed(btn, on) {
    if (!btn) return;
    btn.classList.toggle("active", !!on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  }

  function setClipEnabled(on) {
    state.clip = !!(on && state.canClip && state.clipPlane);
    var planes = state.clip ? [state.clipPlane] : [];
    var side = state.clip ? THREE.DoubleSide : THREE.FrontSide;
    var panes = [state.paneA, state.paneB];
    for (var p = 0; p < panes.length; p++) {
      var pane = panes[p];
      if (!pane) continue;
      for (var i = 0; i < pane.bodies.length; i++) {
        var b = pane.bodies[i];
        b.mat.clippingPlanes = planes;
        b.mat.side = side;
        b.mat.needsUpdate = true;
        if (b.overlay && b.overlay.material) {
          b.overlay.material.clippingPlanes = planes;
          b.overlay.material.side = side;
          b.overlay.material.needsUpdate = true;
        }
      }
    }
    if (el.chkClip) el.chkClip.checked = !!state.clip;
  }

  function fitClipPlane() {
    if (!state.clipPlane) return;
    var pane = state.paneA || state.paneB;
    if (!pane) return;
    var box = assemblyAABB(pane);
    if (box.isEmpty()) return;
    box.getCenter(_center);
    state.clipPlane.set(_clipN.set(1, 0, 0), -_center.x);
  }

  function updatePartLabels() {
    var i, item, pane, w, h, zCam;
    for (i = 0; i < state.labels.length; i++) {
      item = state.labels[i];
      pane = item.pane;
      if (!pane || !item.body) {
        item.el.hidden = true;
        continue;
      }
      w = pane.host.clientWidth;
      h = pane.host.clientHeight;
      item.body.mesh.getWorldPosition(_proj);
      _view.copy(_proj).applyMatrix4(pane.camera.matrixWorldInverse);
      zCam = _view.z;
      if (zCam >= 0) {
        item.el.hidden = true;
        continue;
      }
      _proj.project(pane.camera);
      if (_proj.z > 1 || _proj.x < -1.2 || _proj.x > 1.2 || _proj.y < -1.2 || _proj.y > 1.2) {
        item.el.hidden = true;
        continue;
      }
      item.el.hidden = false;
      item.el.style.transform =
        "translate(" + ((_proj.x * 0.5 + 0.5) * w).toFixed(1) + "px," +
        ((-_proj.y * 0.5 + 0.5) * h).toFixed(1) + "px) translate(-50%, -120%)";
    }
  }

  function buildPartLabels() {
    state.labels = [];
    var hosts = [
      { pane: state.paneA, host: $("labels-a") },
      { pane: state.paneB, host: $("labels-b") }
    ];
    var labelSpecs = PAIR_LABELS[state.pairId] || [];
    var h, k, spec, body, elLabel;
    for (h = 0; h < hosts.length; h++) {
      if (!hosts[h].host) continue;
      hosts[h].host.innerHTML = "";
      if (!labelSpecs.length || !hosts[h].pane) continue;
      for (k = 0; k < labelSpecs.length; k++) {
        spec = labelSpecs[k];
        body = findBody(hosts[h].pane, spec.name);
        if (!body) continue;
        elLabel = document.createElement("div");
        elLabel.className = "part-label";
        elLabel.textContent = spec.text;
        hosts[h].host.appendChild(elLabel);
        state.labels.push({ el: elLabel, pane: hosts[h].pane, body: body });
      }
    }
  }

  function setTimeReadout() {
    var digits = state.tMax < 1 ? 3 : 2;
    el.timeReadout.textContent =
      "t = " + state.time.toFixed(digits) + " s / " + state.tMax.toFixed(digits) + " s";
    if (!state.sliderSync) el.scrub.value = String(state.time);
  }

  function uniqueTimes(a, b) {
    var raw = [];
    var i;
    if (a) for (i = 0; i < a.length; i++) raw.push(a[i]);
    if (b) for (i = 0; i < b.length; i++) raw.push(b[i]);
    raw.sort(function (x, y) { return x - y; });
    var out = [];
    for (i = 0; i < raw.length; i++) {
      if (!out.length || Math.abs(raw[i] - out[out.length - 1]) > 1e-9) out.push(raw[i]);
    }
    return out.length ? out : [0];
  }

  function sharedTimes() {
    return uniqueTimes(
      state.paneA ? phaseTimes(state.paneA) : null,
      state.paneB ? phaseTimes(state.paneB) : null
    );
  }

  function refreshTMax() {
    var aMax = state.paneA ? state.paneA.tMax : 0;
    var bMax = state.paneB ? state.paneB.tMax : 0;
    state.tMax = Math.max(aMax, bMax, 0);
    el.scrub.max = String(state.tMax);
    el.scrub.step = "0.001";
    if (state.time > state.tMax) state.time = state.tMax;
  }

  function isStaticPhase() {
    return state.bPhase === "static";
  }

  function setTransportFrozen(frozen) {
    if (el.transport) el.transport.classList.toggle("frozen", !!frozen);
    if (el.btnPlay) el.btnPlay.disabled = !!frozen;
    if (el.btnStepBack) el.btnStepBack.disabled = !!frozen;
    if (el.btnStepFwd) el.btnStepFwd.disabled = !!frozen;
    if (el.scrub) el.scrub.disabled = !!frozen;
    state.playing = false;
    if (el.btnPlay) el.btnPlay.textContent = "播放";
    if (frozen) {
      state.time = 0;
      if (state.paneA || state.paneB) applyTime(0);
      if (el.timeReadout) setTimeReadout();
    }
  }

  function stepSample(delta) {
    if (isStaticPhase()) return;
    var times = sharedTimes();
    var i = sampleIndex(times, state.time);
    var onSample = Math.abs(state.time - times[i]) < 1e-6;
    var next = delta < 0 ? (onSample ? i - 1 : i) : i + 1;
    next = Math.max(0, Math.min(times.length - 1, next));
    state.time = times[next];
    state.playing = false;
    el.btnPlay.textContent = "播放";
    applyTime(state.time);
    setTimeReadout();
  }

  function disposeTrail(pane, b) {
    if (!b.trail) return;
    pane.scene.remove(b.trail);
    b.trail.geometry.dispose();
    b.trail.material.dispose();
    b.trail = null;
  }

  function rebuildTrails(pane) {
    var rec = phaseRecord(pane);
    for (var i = 0; i < pane.bodies.length; i++) {
      var b = pane.bodies[i];
      disposeTrail(pane, b);
      if (!rec || !rec.has_trace) continue;
      var pos = b.rt.pos;
      var n = rec.times.length;
      if (!pos || n < 2) continue;
      var arr = new Float32Array(n * 3);
      arr.set(pos.subarray(0, n * 3));
      var geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
      var mat = new THREE.LineBasicMaterial({
        color: b.baseColor,
        transparent: true,
        opacity: 0.32,
        depthWrite: false
      });
      var line = new THREE.Line(geo, mat);
      line.visible = state.showTrails && b.mesh.visible;
      pane.scene.add(line);
      b.trail = line;
    }
  }

  function bindRuntime(pane) {
    var rec = phaseRecord(pane);
    var times = rec && rec.times ? rec.times : [0];
    pane.tMax = times.length ? times[times.length - 1] : 0;
    for (var i = 0; i < pane.bodies.length; i++) {
      var b = pane.bodies[i];
      var packed = rec && rec.poses ? rec.poses[b.name] : null;
      b.rt = {
        times: times,
        pos: packed ? decodeB64(packed.pos, Float32Array) : new Float32Array(0),
        quat: packed ? decodeB64(packed.quat, Float32Array) : new Float32Array(0)
      };
    }
    rebuildTrails(pane);
  }

  function placeHelpers(pane, box) {
    if (pane.grid) {
      pane.scene.remove(pane.grid);
      pane.grid.geometry.dispose();
      pane.grid.material.dispose();
    }
    if (pane.groundDisc) {
      pane.scene.remove(pane.groundDisc);
      pane.groundDisc.geometry.dispose();
      pane.groundDisc.material.dispose();
      pane.groundDisc = null;
    }
    if (pane.axes) pane.scene.remove(pane.axes);
    box.getSize(_size);
    box.getCenter(_center);
    var extent = Math.max(_size.x, _size.y, _size.z, 1e-3);
    pane.extent = extent;
    var gridSize = extent * 3;
    var grid = new THREE.GridHelper(gridSize, 30, 0x2a3140, 0x161a22);
    grid.rotation.x = Math.PI / 2;
    grid.position.set(_center.x, _center.y, box.min.z);
    pane.scene.add(grid);
    pane.grid = grid;
    var discGeo = new THREE.CircleGeometry(extent * 1.2, 48);
    var discMat = new THREE.MeshStandardMaterial({
      color: 0x2a2c32,
      metalness: 0.02,
      roughness: 0.96,
      transparent: true,
      opacity: pane.side === "b" ? 0.38 : 0.55
    });
    var disc = new THREE.Mesh(discGeo, discMat);
    disc.position.set(_center.x, _center.y, box.min.z - extent * 0.004);
    pane.scene.add(disc);
    pane.groundDisc = disc;
    var axes = new THREE.AxesHelper(extent * 0.1);
    axes.position.set(box.min.x, box.min.y, box.min.z);
    pane.scene.add(axes);
    pane.axes = axes;
  }

  function buildJointHelpers(pane) {
    var i;
    for (i = 0; i < pane.jointHelpers.length; i++) {
      var h = pane.jointHelpers[i];
      if (h.parent) h.parent.remove(h);
      else pane.scene.remove(h);
    }
    pane.jointHelpers = [];
    var joints = pane.track.joints || [];
    var byName = {};
    for (i = 0; i < pane.bodies.length; i++) byName[pane.bodies[i].name] = pane.bodies[i];
    var len = Math.max(pane.extent * 0.25, 1e-3);
    for (i = 0; i < joints.length; i++) {
      var jn = joints[i];
      var host = byName[jn.body_a];
      var hex = JOINT_HEX[jn.type] || 0xffffff;
      _worldAnchor.set(jn.anchor[0], jn.anchor[1], jn.anchor[2]);
      _dir.set(jn.axis[0], jn.axis[1], jn.axis[2]);
      if (_dir.lengthSq() < 1e-12) _dir.set(0, 0, 1);
      _dir.normalize();
      var arrow = new THREE.ArrowHelper(_dir, new THREE.Vector3(), len, hex, len * 0.22, len * 0.12);
      if (host) {
        host.mesh.updateMatrixWorld();
        _localAnchor.copy(_worldAnchor);
        host.mesh.worldToLocal(_localAnchor);
        _qa.copy(host.mesh.quaternion).invert();
        _dir.applyQuaternion(_qa).normalize();
        arrow.position.copy(_localAnchor);
        arrow.setDirection(_dir);
        host.mesh.add(arrow);
      } else {
        arrow.position.copy(_worldAnchor);
        pane.scene.add(arrow);
      }
      arrow.visible = state.showAxes;
      pane.jointHelpers.push(arrow);
    }
  }

  function setJointVisible(on) {
    state.showAxes = on;
    var panes = [state.paneA, state.paneB];
    for (var p = 0; p < panes.length; p++) {
      var pane = panes[p];
      if (!pane) continue;
      for (var i = 0; i < pane.jointHelpers.length; i++) pane.jointHelpers[i].visible = on;
    }
  }

  function setTrailVisible(on) {
    state.showTrails = on;
    var panes = [state.paneA, state.paneB];
    for (var p = 0; p < panes.length; p++) {
      var pane = panes[p];
      if (!pane) continue;
      for (var i = 0; i < pane.bodies.length; i++) {
        var b = pane.bodies[i];
        if (b.trail) b.trail.visible = on && b.mesh.visible;
      }
    }
  }

  function setWireframe(on) {
    state.wireframe = on;
    applyTime(state.time);
  }

  function fillVerdict() {
    var rec = state.paneB ? phaseRecord(state.paneB) : null;
    if (!rec || !rec.has_trace) {
      el.verdict.innerHTML = '<div class="muted">尚无 B 轨轨迹，没有物理判定。</div>';
      el.abortNote.hidden = true;
      return;
    }
    var v = rec.verdict || {};
    var verdict = v.verdict;
    var isNocontact = state.bPhase === "drive_nocontact";
    var badgeCls = "badge " + verdictClass(verdict) + (isNocontact ? " badge-diag" : "");
    var prefix = isNocontact ? "诊断 · " : "";
    var html = '<div class="verdict-head"><span class="' + badgeCls + '">' +
      prefix + verdictLabel(verdict) + "</span></div><div class='kv'>";
    if (state.bPhase === "static") {
      html += "<div>max位移 <b>" + fmtDisp(v.max_displacement_m) + "</b>（阈值 10 mm）</div>";
      html += "<div>bbox_exit <b>" + (v.bbox_exit ? "是" : "否") + "</b></div>";
    } else {
      var di = v.drive_input || {};
      var unit = motionUnit(di);
      html += "<div>驱动关节 <b>" + (di.joint_id || "—") + "</b> · " + (di.joint_type || "") + "</div>";
      html += "<div>" + (di.body_a || "") + " → " + (di.body_b || "") + "</div>";
      if (di.magnitude != null) {
        html += "<div>载荷 <b>" + fmtNum(di.magnitude, 4) + " " + (di.unit || "") + "</b></div>";
      }
      if (di.load_scale != null && Number(di.load_scale) !== 1) {
        html += "<div>载荷倍数 <b>" + fmtNum(di.load_scale, 1) + "×</b>（大于 1× 自重）</div>";
      }
      html += "<div>运动量 <b>" + fmtMotion(v.cumulative_motion, unit) + "</b> / 阈值 <b>" +
        fmtMotion(v.threshold, unit) + "</b></div>";
      html += "<div>偏轴 <b>" + fmtNum(v.off_axis, 4) + "</b> / 上限 <b>" +
        fmtNum(v.off_axis_limit, 4) + "</b></div>";
    }
    var notes = v.notes || [];
    var issues = v.issues || [];
    if (notes.length) {
      html += "<div>备注</div><ul class='note-list'>";
      for (var n = 0; n < notes.length; n++) html += "<li>" + notes[n] + "</li>";
      html += "</ul>";
    }
    if (issues.length) {
      html += "<div>issues</div><ul class='issue-list'>";
      for (var k = 0; k < issues.length; k++) html += "<li>" + issues[k] + "</li>";
      html += "</ul>";
    }
    html += "</div>";
    if (isNocontact) {
      html += "<p class=\"muted\">关掉被驱动关节那一对的接触后再驱动，不是协议判定。</p>";
    }
    el.verdict.innerHTML = html;
    if (verdict === "MOTION_DEAD" || verdict === "MOTION_ERRATIC") {
      var deadNote = (state.data && state.data.dead_note) ||
        (state.data && state.data.pair && state.data.pair.dead_note);
      if (deadNote) {
        var box = document.createElement("p");
        box.className = "dead-note";
        box.textContent = deadNote;
        el.verdict.appendChild(box);
      }
    }

    var aborted = rec.aborted;
    if (aborted) {
      var at = rec.abort_t != null ? rec.abort_t : rec.t_end;
      var digits = at < 1 ? 3 : 2;
      el.abortNote.hidden = false;
      el.abortNote.textContent = "此相位在 t=" + Number(at).toFixed(digits) + " 中止（数值发散）";
    } else {
      el.abortNote.hidden = true;
    }
  }

  function switchBPhase(name) {
    var rec = state.data.b && state.data.b.phases && state.data.b.phases[name];
    if (!rec || !rec.has_trace) return;
    state.bPhase = name;
    state.paneB.phase = name;
    var tabs = el.bTabs.querySelectorAll("button");
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle("active", tabs[i].getAttribute("data-phase") === name);
    }
    state.time = 0;
    bindRuntime(state.paneB);
    refreshTMax();
    updatePenCaption();
    applyTime(0);
    fillVerdict();
    setTimeReadout();
    setTransportFrozen(isStaticPhase());
  }

  function updatePenCaption() {
    if (!el.penCaption) return;
    if (bPhaseDead()) {
      el.penCaption.textContent = "标红互相穿进的零件，或只标相交三角。橙色是被驱动件（行程 ≈ 0）。";
    } else {
      el.penCaption.textContent = "标红互相穿进的零件，或只标相交三角。";
    }
  }

  function setSpeed(speed) {
    state.speed = speed;
    var speeds = el.speedBtns.querySelectorAll("button");
    for (var k = 0; k < speeds.length; k++) {
      var s = parseFloat(speeds[k].getAttribute("data-speed"));
      speeds[k].classList.toggle("active", s === speed);
    }
  }

  function onResize() {
    var panes = [state.paneA, state.paneB];
    for (var i = 0; i < panes.length; i++) {
      var pane = panes[i];
      if (!pane) continue;
      var w = pane.host.clientWidth;
      var h = Math.max(pane.host.clientHeight, 1);
      pane.camera.aspect = w / h;
      pane.camera.updateProjectionMatrix();
      pane.renderer.setSize(w, h, false);
    }
    updatePartLabels();
  }

  function tick(now) {
    requestAnimationFrame(tick);
    var dt = state.lastTs ? Math.min(0.05, (now - state.lastTs) / 1000) : 0;
    state.lastTs = now;
    if (state.playing && !isStaticPhase()) {
      state.time += dt * state.speed;
      if (state.time >= state.tMax) {
        if (state.loop && state.tMax > 0) {
          state.time = state.time % state.tMax;
        } else {
          state.time = state.tMax;
          state.playing = false;
          el.btnPlay.textContent = "播放";
        }
      }
      applyTime(state.time);
      setTimeReadout();
    }
    if (state.paneA) {
      state.paneA.controls.update();
      state.paneA.renderer.render(state.paneA.scene, state.paneA.camera);
    }
    if (state.paneB) {
      state.paneB.controls.update();
      state.paneB.renderer.render(state.paneB.scene, state.paneB.camera);
    }
    updatePartLabels();
  }

  function buildMeshes(pane, bodiesSrc) {
    pane.bodies = [];
    for (var i = 0; i < bodiesSrc.length; i++) {
      var src = bodiesSrc[i];
      var verts = decodeB64(src.verts, Float32Array);
      var indices = decodeB64(src.indices, Uint32Array);
      var geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
      if (indices.length) geo.setIndex(new THREE.BufferAttribute(indices, 1));
      geo.computeVertexNormals();
      geo.computeBoundingBox();
      geo.computeBoundingSphere();
      var spec = materialSpec(src.name, !!src.grounded, i);
      var mat = new THREE.MeshStandardMaterial({
        color: spec.color,
        metalness: spec.metalness,
        roughness: spec.roughness,
        flatShading: false,
        emissive: 0x000000
      });
      var mesh = new THREE.Mesh(geo, mat);
      pane.scene.add(mesh);
      pane.bodies.push({
        name: src.name,
        grounded: !!src.grounded,
        baseColor: spec.color,
        mesh: mesh,
        mat: mat,
        rt: { times: [0], pos: new Float32Array(0), quat: new Float32Array(0) },
        trail: null,
        overlay: null
      });
    }
  }

  function makePane(side, host, canvas, track, phase) {
    var dim = side === "b" ? 0.72 : 1;
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(side === "b" ? 0x050608 : 0x07080c, 1);
    if (renderer.localClippingEnabled !== undefined) {
      renderer.localClippingEnabled = true;
      state.canClip = true;
    }
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(50, 1, 0.001, 1e5);
    camera.up.set(0, 0, 1);
    var controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.screenSpacePanning = true;

    scene.add(new THREE.HemisphereLight(0xc9d4e8, 0x1a1814, 0.4 * dim));
    var key = new THREE.DirectionalLight(0xfff4e8, 1.15 * dim);
    key.position.set(0.55, -1.05, 1.35);
    scene.add(key);
    var fill = new THREE.DirectionalLight(0xa8c0e0, 0.38 * dim);
    fill.position.set(-1.15, 0.35, 0.55);
    scene.add(fill);
    var rim = new THREE.DirectionalLight(0x9bb8ff, 0.58 * dim);
    rim.position.set(-0.25, 1.25, 0.45);
    scene.add(rim);
    scene.add(new THREE.AmbientLight(0xffffff, 0.07 * dim));

    var pane = {
      side: side,
      host: host,
      canvas: canvas,
      track: track,
      phase: phase,
      renderer: renderer,
      scene: scene,
      camera: camera,
      controls: controls,
      bodies: [],
      jointHelpers: [],
      grid: null,
      axes: null,
      groundDisc: null,
      tMax: 0,
      extent: 1,
      initTarget: new THREE.Vector3(),
      initPos: new THREE.Vector3()
    };
    buildMeshes(pane, track.bodies || []);
    bindRuntime(pane);
    applyPaneTime(pane, 0);
    for (var b = 0; b < pane.bodies.length; b++) pane.bodies[b].mesh.updateMatrixWorld(true);
    var box = assemblyAABB(pane);
    if (!box.isEmpty()) {
      placeHelpers(pane, box);
      buildJointHelpers(pane);
      frameCamera(pane, box, true);
    }
    return pane;
  }

  function resetCameras() {
    var panes = [state.paneA, state.paneB];
    for (var i = 0; i < panes.length; i++) {
      var pane = panes[i];
      if (!pane) continue;
      pane.camera.position.copy(pane.initPos);
      pane.controls.target.copy(pane.initTarget);
      applyNearFar(pane, pane.extent);
      pane.controls.update();
    }
  }

  function captionText(track, fallback) {
    if (!track) return fallback;
    return track.note || track.caption || fallback;
  }

  function fillPairMeta(data) {
    $("pair-title").textContent = data.title || data.id;
    $("pair-id").textContent = data.id || pairId;
    $("pair-description").textContent = data.description || "";
    $("a-caption").textContent = data.a_note || captionText(data.a, "时间轴正向运动学，无质量无碰撞，看起来能转完。");
    $("b-caption").textContent = data.b_note || captionText(data.b, "同一套网格进入 unified_sim，含重力与接触。");
    document.title = (data.title || data.id) + " — Animation 对照";
    var related = data.related || [];
    var host = $("pair-related");
    if (!related.length) {
      host.hidden = true;
      host.innerHTML = "";
    } else {
      host.hidden = false;
      var html = "网上同类：";
      for (var i = 0; i < related.length; i++) {
        if (i) html += " · ";
        html += '<a href="' + related[i].href + '" target="_blank" rel="noopener">' +
          (related[i].label || related[i].href) + "</a>";
      }
      host.innerHTML = html;
    }
    var thesisEl = document.querySelector(".dual-thesis");
    if (thesisEl && data.thesis) thesisEl.textContent = data.thesis;
  }

  function wireBTabs() {
    var phases = (state.data.b && state.data.b.phases) || {};
    var tabs = el.bTabs.querySelectorAll("button");
    var first = null;
    for (var i = 0; i < tabs.length; i++) {
      var ph = tabs[i].getAttribute("data-phase");
      var rec = phases[ph];
      var ok = !!(rec && rec.has_trace);
      tabs[i].disabled = !ok;
      if (ok && !first) first = ph;
      tabs[i].addEventListener("click", function (ev) {
        switchBPhase(ev.currentTarget.getAttribute("data-phase"));
      });
    }
    var driveRec = phases.drive;
    var driveVerdict = driveRec && driveRec.verdict && driveRec.verdict.verdict;
    if (driveRec && driveRec.has_trace &&
        (driveVerdict === "MOTION_DEAD" || driveVerdict === "MOTION_ERRATIC")) {
      first = "drive";
    }
    var preferred = state.data && state.data.default_b_phase;
    if (preferred && phases[preferred] && phases[preferred].has_trace) {
      first = preferred;
    }
    state.bPhase = first || "static";
    for (var t = 0; t < tabs.length; t++) {
      tabs[t].classList.toggle("active", !!first && tabs[t].getAttribute("data-phase") === state.bPhase);
    }
    setTransportFrozen(isStaticPhase());
  }

  function wireUi() {
    el.btnPlay.addEventListener("click", function () {
      if (isStaticPhase()) return;
      state.playing = !state.playing;
      el.btnPlay.textContent = state.playing ? "暂停" : "播放";
    });
    el.chkLoop.addEventListener("change", function () {
      state.loop = el.chkLoop.checked;
    });
    el.btnStepBack.addEventListener("click", function () { stepSample(-1); });
    el.btnStepFwd.addEventListener("click", function () { stepSample(1); });
    el.scrub.addEventListener("pointerdown", function () { state.sliderSync = true; });
    el.scrub.addEventListener("pointerup", function () { state.sliderSync = false; });
    el.scrub.addEventListener("input", function () {
      if (isStaticPhase()) return;
      state.time = parseFloat(el.scrub.value) || 0;
      applyTime(state.time);
      setTimeReadout();
    });
    var speeds = el.speedBtns.querySelectorAll("button");
    for (var i = 0; i < speeds.length; i++) {
      speeds[i].addEventListener("click", function (ev) {
        setSpeed(parseFloat(ev.currentTarget.getAttribute("data-speed")));
      });
    }
    $("pair-btn-reset").addEventListener("click", resetCameras);
    $("pair-chk-axes").addEventListener("change", function (ev) {
      setJointVisible(ev.target.checked);
    });
    $("pair-chk-trails").addEventListener("change", function (ev) {
      setTrailVisible(ev.target.checked);
    });
    $("pair-chk-wire").addEventListener("change", function (ev) {
      setWireframe(ev.target.checked);
    });
    if (el.chkClip) {
      el.chkClip.addEventListener("change", function (ev) {
        setClipEnabled(ev.target.checked);
      });
    }
    if (el.chkPenBody) {
      el.chkPenBody.addEventListener("click", function () {
        state.penBody = !state.penBody;
        setPenPressed(el.chkPenBody, state.penBody);
        applyTime(state.time);
      });
    }
    if (el.chkPenRegion) {
      el.chkPenRegion.addEventListener("click", function () {
        state.penRegion = !state.penRegion;
        setPenPressed(el.chkPenRegion, state.penRegion);
        applyTime(state.time);
      });
    }
    window.addEventListener("keydown", function (ev) {
      var tag = (ev.target && ev.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (ev.code === "Space") {
        ev.preventDefault();
        if (isStaticPhase()) return;
        state.playing = !state.playing;
        el.btnPlay.textContent = state.playing ? "暂停" : "播放";
      } else if (ev.code === "ArrowLeft") {
        ev.preventDefault();
        stepSample(-1);
      } else if (ev.code === "ArrowRight") {
        ev.preventDefault();
        stepSample(1);
      }
    });
    window.addEventListener("resize", onResize);
  }

  function showPaneError(id, msg) {
    var box = $(id);
    if (!box) return;
    box.hidden = false;
    box.classList.add("error");
    box.textContent = msg;
  }

  function hidePaneMsg(id) {
    var box = $(id);
    if (!box) return;
    box.hidden = true;
  }

  function showError(msg) {
    showPaneError("load-msg-a", msg);
    showPaneError("load-msg-b", msg);
  }

  function bootPair(data) {
    document.body.classList.add("case-page-dual");
    $("stage").hidden = true;
    $("panel-case").hidden = true;
    $("dual-stage").hidden = false;
    $("panel-pair").hidden = false;

    state.data = data;
    if (el.penTools) el.penTools.hidden = false;
    fillPairMeta(data);
    wireBTabs();

    var aTrack = data.a || { bodies: [], joints: [], phases: {} };
    var bTrack = data.b || { bodies: [], joints: [], phases: {} };
    var aRec = (aTrack.phases || {}).kinematic;
    var bRec = (bTrack.phases || {})[state.bPhase];

    state.paneA = makePane("a", $("pane-a"), $("view-a"), aTrack, "kinematic");
    state.paneB = makePane("b", $("pane-b"), $("view-b"), bTrack, state.bPhase);
    if (state.canClip) {
      state.clipPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
      fitClipPlane();
    } else if (el.clipWrap) {
      el.clipWrap.hidden = true;
    }
    setClipEnabled(state.canClip && pairId === "diesel_slider_crank");
    buildPartLabels();
    refreshTMax();
    updatePenCaption();
    applyTime(0);
    fillVerdict();
    setTimeReadout();
    onResize();
    wireUi();

    if (!aRec || !aRec.has_trace) {
      showPaneError("load-msg-a", "A 轨没有 kinematic 轨迹。");
    } else {
      hidePaneMsg("load-msg-a");
    }
    if (!bRec || !bRec.has_trace) {
      showPaneError("load-msg-b", "此对照还没有 B 轨轨迹。");
    } else {
      hidePaneMsg("load-msg-b");
    }
    requestAnimationFrame(tick);
  }

  function bindEls() {
    el.bTabs = $("b-phase-tabs");
    el.abortNote = $("pair-abort-note");
    el.btnPlay = $("pair-btn-play");
    el.chkLoop = $("pair-chk-loop");
    el.btnStepBack = $("pair-btn-step-back");
    el.btnStepFwd = $("pair-btn-step-fwd");
    el.scrub = $("pair-scrub");
    el.timeReadout = $("pair-time-readout");
    el.speedBtns = $("pair-speed-btns");
    el.transport = $("panel-pair") ? $("panel-pair").querySelector(".transport") : null;
    el.verdict = $("pair-verdict-block");
    el.penTools = $("pen-tools");
    el.chkPenBody = $("chk-pen-body");
    el.chkPenRegion = $("chk-pen-region");
    el.penCaption = $("pen-caption");
    el.chkClip = $("pair-chk-clip");
    el.clipWrap = $("clip-toggle-wrap");
    setPenPressed(el.chkPenBody, state.penBody);
    setPenPressed(el.chkPenRegion, state.penRegion);
  }

  function boot() {
    document.body.classList.add("case-page-dual");
    $("stage").hidden = true;
    $("panel-case").hidden = true;
    $("dual-stage").hidden = false;
    $("panel-pair").hidden = false;
    bindEls();

    if (!window.THREE || !THREE.OrbitControls) {
      showError("three.js / OrbitControls 未载入");
      return;
    }

    var script = document.createElement("script");
    script.src = "data/animation_pairs/" + pairId + ".js?t=" + Date.now();
    script.onload = function () {
      var data = (window.ANIMATION_PAIRS || {})[pairId];
      if (!data) {
        showError("已载入脚本，但没有找到对照 " + pairId);
        return;
      }
      bootPair(data);
    };
    script.onerror = function () {
      showError("无法载入 data/animation_pairs/" + pairId +
        ".js（请先运行 animation/pack_animation_viewer.py）");
    };
    document.head.appendChild(script);
  }

  boot();
})();
