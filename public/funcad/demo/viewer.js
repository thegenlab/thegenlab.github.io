/* Rigid-body trace viewer. Loads case data via a classic <script> tag (file://). */
(function () {
  "use strict";

  var PALETTE = [
    0x4e79a7, 0xf28e2b, 0xe15759, 0x76b7b2, 0x59a14f, 0xedc948,
    0xb07aa1, 0xff9da7, 0x9c755f, 0x86bcb6, 0xd37295, 0x8cd17d,
    0xb6992d, 0x499894, 0xd4a6c8, 0xffbe7d, 0xa0cbe8, 0xfabfd2,
    0x59a14e, 0xe15758
  ];
  var GROUND_COLOR = 0x8b929c;
  var JOINT_HEX = {
    revolute: 0x22d3ee,
    slider: 0xf59e0b,
    cylindrical: 0xd946ef,
    lock: 0xd1d5db
  };
  var NOMINAL_T = 4.0;

  var _qa = new THREE.Quaternion();
  var _qb = new THREE.Quaternion();
  var _box = new THREE.Box3();
  var _center = new THREE.Vector3();
  var _size = new THREE.Vector3();
  var _offset = new THREE.Vector3();
  var _corner = new THREE.Vector3();
  var _dir = new THREE.Vector3();
  var _worldAnchor = new THREE.Vector3();
  var _localAnchor = new THREE.Vector3();
  var _t0 = new THREE.Vector3();

  var state = {
    data: null,
    phase: "static",
    playing: false,
    loop: true,
    speed: 1,
    time: 0,
    tMax: NOMINAL_T,
    follow: false,
    showAxes: false,
    showTrails: false,
    ghostGround: false,
    wireframe: false,
    bodies: [],
    jointHelpers: [],
    grid: null,
    axes: null,
    initTarget: new THREE.Vector3(),
    initPos: new THREE.Vector3(),
    extent: 1,
    lastTs: 0,
    sliderSync: false
  };

  var el = {};
  var renderer, scene, camera, controls, canvas;

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

  function phaseRecord() {
    var phases = state.data.phases || {};
    return phases[state.phase] || null;
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

  function bodyColor(body, index) {
    if (body.grounded) return GROUND_COLOR;
    return PALETTE[index % PALETTE.length];
  }

  function cssHex(n) {
    return "#" + ("000000" + n.toString(16)).slice(-6);
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

  function assemblyAABB(visibleOnly) {
    _box.makeEmpty();
    for (var i = 0; i < state.bodies.length; i++) {
      var b = state.bodies[i];
      if (visibleOnly && !b.mesh.visible) continue;
      expandWorldAABB(b.mesh, _box);
    }
    return _box;
  }

  function fitDistance(radius, fovDeg) {
    var fov = THREE.MathUtils.degToRad(fovDeg);
    return radius / Math.max(Math.sin(fov * 0.5), 1e-4) * 1.2;
  }

  function applyNearFar(extent) {
    var ext = Math.max(extent, 1e-3);
    camera.near = Math.max(1e-4, 1e-3 * ext);
    camera.far = 1e5;
    camera.updateProjectionMatrix();
  }

  function frameCamera(box, storeInit) {
    if (box.isEmpty()) return;
    box.getCenter(_center);
    box.getSize(_size);
    var radius = Math.max(_size.length() * 0.5, 1e-4);
    var dist = fitDistance(radius, camera.fov);
    _dir.set(0.7, -1.05, 0.62).normalize();
    camera.up.set(0, 0, 1);
    camera.position.copy(_center).addScaledVector(_dir, dist);
    controls.target.copy(_center);
    applyNearFar(Math.max(_size.x, _size.y, _size.z, radius));
    controls.update();
    if (storeInit) {
      state.initTarget.copy(_center);
      state.initPos.copy(camera.position);
      state.extent = Math.max(_size.x, _size.y, _size.z, radius * 2);
    }
  }

  function followCamera(dt) {
    var box = assemblyAABB(true);
    if (box.isEmpty()) return;
    box.getCenter(_center);
    box.getSize(_size);
    var radius = Math.max(_size.length() * 0.5, 1e-4);
    var desired = fitDistance(radius, camera.fov);
    var k = 1 - Math.pow(0.08, Math.max(dt, 1e-3));
    controls.target.lerp(_center, k);
    _offset.copy(camera.position).sub(controls.target);
    var dist = _offset.length();
    if (dist < 1e-8) {
      _offset.set(0.7, -1.05, 0.62);
      dist = 1;
    }
    var next = dist + (desired - dist) * k;
    _offset.multiplyScalar(next / dist);
    camera.position.copy(controls.target).add(_offset);
    applyNearFar(Math.max(_size.x, _size.y, _size.z, radius));
  }

  function applyTime(t) {
    var rec = phaseRecord();
    if (!rec || !rec.has_trace) return;
    var times = rec.times;
    for (var i = 0; i < state.bodies.length; i++) {
      var b = state.bodies[i];
      if (!interpPose(b.rt, t, b.mesh.position, b.mesh.quaternion)) continue;
      if (b.dispEl) {
        var dmm = b.mesh.position.distanceTo(b.t0Pos) * 1000;
        var txt;
        if (dmm < 1e-3) txt = "≈ 0";
        else if (dmm >= 1000) txt = (dmm / 1000).toFixed(2) + " m";
        else txt = dmm.toFixed(1) + " mm";
        if (b.dispEl.textContent !== txt) b.dispEl.textContent = txt;
      }
    }
    for (var j = 0; j < state.bodies.length; j++) state.bodies[j].mesh.updateMatrixWorld();
  }

  function setTimeReadout() {
    var digits = state.tMax < 1 ? 3 : 2;
    el.timeReadout.textContent =
      "t = " + state.time.toFixed(digits) + " s / " + state.tMax.toFixed(digits) + " s";
    if (!state.sliderSync) {
      el.scrub.value = String(state.time);
    }
  }

  function currentPhaseTimes() {
    var rec = phaseRecord();
    return rec && rec.times ? rec.times : [0];
  }

  function stepSample(delta) {
    var times = currentPhaseTimes();
    if (!times.length) return;
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

  function disposeTrail(b) {
    if (!b.trail) return;
    scene.remove(b.trail);
    b.trail.geometry.dispose();
    b.trail.material.dispose();
    b.trail = null;
  }

  function rebuildTrails() {
    var rec = phaseRecord();
    for (var i = 0; i < state.bodies.length; i++) {
      var b = state.bodies[i];
      disposeTrail(b);
      if (!rec || !rec.has_trace) continue;
      var pos = b.rt.pos;
      var n = rec.times.length;
      if (!pos || n < 2) continue;
      var arr = new Float32Array(n * 3);
      arr.set(pos.subarray(0, n * 3));
      var geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
      var mat = new THREE.LineBasicMaterial({
        color: b.color,
        transparent: true,
        opacity: 0.32,
        depthWrite: false
      });
      var line = new THREE.Line(geo, mat);
      line.visible = state.showTrails && b.mesh.visible;
      scene.add(line);
      b.trail = line;
    }
  }

  function bindRuntime() {
    var rec = phaseRecord();
    var times = rec && rec.times ? rec.times : [0];
    state.tMax = times.length ? times[times.length - 1] : 0;
    el.scrub.max = String(state.tMax);
    el.scrub.step = "0.001";
    for (var i = 0; i < state.bodies.length; i++) {
      var b = state.bodies[i];
      var packed = rec && rec.poses ? rec.poses[b.name] : null;
      b.rt = {
        times: times,
        pos: packed ? decodeB64(packed.pos, Float32Array) : new Float32Array(0),
        quat: packed ? decodeB64(packed.quat, Float32Array) : new Float32Array(0)
      };
      if (b.rt.pos.length >= 3) {
        b.t0Pos.set(b.rt.pos[0], b.rt.pos[1], b.rt.pos[2]);
      }
      var maxMap = (rec && rec.verdict && rec.verdict.per_body_max_displacement_m) || {};
      var sampleMax = (rec && rec.sample_max_disp_m && rec.sample_max_disp_m[b.name]) || 0;
      var mx = maxMap[b.name];
      if (mx == null) mx = sampleMax;
      if (b.maxEl) b.maxEl.textContent = fmtDisp(mx);
    }
    var aborted = rec && rec.aborted;
    if (aborted) {
      var at = rec.abort_t != null ? rec.abort_t : rec.t_end;
      var digits = at < 1 ? 3 : 2;
      el.abortNote.hidden = false;
      if (state.phase === "static_explode") {
        el.abortNote.textContent = "逐步发散：t=" + Number(at).toFixed(digits) +
          " s 起位移超出可积范围。飞出零件已夹到 12 m，便于看方向；真实位移是天文数字。";
      } else {
        el.abortNote.textContent = "此相位在 t=" + Number(at).toFixed(digits) + " 中止（数值发散）";
      }
    } else {
      el.abortNote.hidden = true;
    }
    rebuildTrails();
  }

  function placeHelpers(box) {
    if (state.grid) {
      scene.remove(state.grid);
      state.grid.geometry.dispose();
      state.grid.material.dispose();
    }
    if (state.axes) scene.remove(state.axes);
    box.getSize(_size);
    box.getCenter(_center);
    var extent = Math.max(_size.x, _size.y, _size.z, 1e-3);
    state.extent = extent;
    var gridSize = extent * 3;
    var grid = new THREE.GridHelper(gridSize, 30, 0x3a4150, 0x262b36);
    grid.rotation.x = Math.PI / 2;
    grid.position.set(_center.x, _center.y, box.min.z);
    scene.add(grid);
    state.grid = grid;
    var axes = new THREE.AxesHelper(extent * 0.1);
    axes.position.set(box.min.x, box.min.y, box.min.z);
    scene.add(axes);
    state.axes = axes;
  }

  function buildJointHelpers() {
    var i;
    for (i = 0; i < state.jointHelpers.length; i++) {
      var h = state.jointHelpers[i];
      if (h.parent) h.parent.remove(h);
      else scene.remove(h);
    }
    state.jointHelpers = [];
    var joints = state.data.joints || [];
    var byName = {};
    for (i = 0; i < state.bodies.length; i++) byName[state.bodies[i].name] = state.bodies[i];
    var len = Math.max(state.extent * 0.25, 1e-3);
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
        scene.add(arrow);
      }
      arrow.visible = state.showAxes;
      state.jointHelpers.push(arrow);
    }
  }

  function setJointVisible(on) {
    state.showAxes = on;
    for (var i = 0; i < state.jointHelpers.length; i++) state.jointHelpers[i].visible = on;
  }

  function setTrailVisible(on) {
    state.showTrails = on;
    for (var i = 0; i < state.bodies.length; i++) {
      var b = state.bodies[i];
      if (b.trail) b.trail.visible = on && b.mesh.visible;
    }
  }

  function setGhostGround(on) {
    state.ghostGround = on;
    for (var i = 0; i < state.bodies.length; i++) {
      var b = state.bodies[i];
      if (!b.grounded) continue;
      b.mat.transparent = on || state.wireframe;
      b.mat.opacity = on ? 0.32 : 1;
      b.mat.depthWrite = !on;
      b.mat.needsUpdate = true;
    }
  }

  function setWireframe(on) {
    state.wireframe = on;
    for (var i = 0; i < state.bodies.length; i++) {
      var b = state.bodies[i];
      b.mat.wireframe = on;
      if (b.grounded && state.ghostGround) {
        b.mat.transparent = true;
      } else {
        b.mat.transparent = on ? true : b.mat.opacity < 1;
      }
      b.mat.needsUpdate = true;
    }
  }

  function fillVerdict() {
    var rec = phaseRecord();
    var v = rec && rec.verdict ? rec.verdict : {};
    var isNocontact = state.phase === "drive_nocontact";
    var isScale10 = state.phase === "drive_scale10";
    var isExplode = state.phase === "static_explode";
    var isDiag = isNocontact || isScale10 || isExplode;
    var verdict = v.verdict;
    var cls = verdictClass(verdict);
    var badgeCls = "badge " + cls + (isDiag ? " badge-diag" : "");
    var prefix = isScale10 ? "10× · " : (isNocontact ? "诊断 · " : "");
    if (state.phase === "static_explode") prefix = "逐步发散 · ";
    var html = '<div class="verdict-head"><span class="' + badgeCls + '">' +
      prefix + verdictLabel(verdict) + "</span></div><div class='kv'>";
    if (state.phase === "static" || state.phase === "static_explode") {
      html += "<div>max位移 <b>" + fmtDisp(v.max_displacement_m) + "</b>（阈值 10 mm）</div>";
      html += "<div>bbox_exit <b>" + (v.bbox_exit ? "是" : "否") + "</b></div>";
    } else {
      var di = v.drive_input || {};
      var unit = motionUnit(di);
      html += "<div>驱动关节 <b>" + (di.joint_id || "—") + "</b> · " + (di.joint_type || "") + "</div>";
      html += "<div>" + (di.body_a || "") + " → " + (di.body_b || "") + "</div>";
      if (di.magnitude != null) {
        var mag = "<div>载荷 <b>" + fmtNum(di.magnitude, 4) + " " + (di.unit || "") + "</b>";
        if (di.load_scale != null && di.load_scale !== 1) {
          mag += "（协议 × " + di.load_scale + "）";
        }
        html += mag + "</div>";
      }
      html += "<div>运动量 <b>" + fmtMotion(v.cumulative_motion, unit) + "</b> / 阈值 <b>" +
        fmtMotion(v.threshold, unit) + "</b></div>";
      html += "<div>偏轴 <b>" + fmtNum(v.off_axis, 4) + "</b> / 上限 <b>" +
        fmtNum(v.off_axis_limit, 4) + "</b></div>";
      if (v.diagnostic) html += "<div>诊断标签 <b>" + v.diagnostic + "</b></div>";
    }
    html += "<div>机制 <b>" + (state.data.mechanism || "—") + "</b></div>";
    var limits = (v.limits_applied && v.limits_applied.length)
      ? v.limits_applied
      : (state.data.summary && state.data.summary.limits_applied) || [];
    if (limits.length) {
      html += "<div>限位</div><ul class='plain-list'>";
      for (var i = 0; i < limits.length; i++) {
        var lim = limits[i];
        html += "<li>" + (lim.joint || "") + " [" + fmtNum(lim.min, 4) + ", " +
          fmtNum(lim.max, 4) + "]</li>";
      }
      html += "</ul>";
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
    el.verdict.innerHTML = html;
  }

  function fillContacts() {
    var c = state.data.contacts_t0 || {};
    var pairs = (c.pairs || []).slice(0, 3);
    var html = "<div class='kv'><div>接触点 <b>" + (c.n_contacts == null ? "—" : c.n_contacts) +
      "</b> · 接触对 <b>" + (c.n_pairs == null ? "—" : c.n_pairs) +
      "</b></div><div>最大穿透 <b>" + fmtDisp(c.max_penetration_m) + "</b></div>";
    if (pairs.length) {
      html += "<div>最近 3 对</div><ul class='plain-list'>";
      for (var i = 0; i < pairs.length; i++) {
        var p = pairs[i];
        html += "<li>" + p.body_a + " × " + p.body_b +
          " · n=" + p.n_contacts +
          " · d<sub>min</sub>=" + fmtDisp(p.min_distance_m) +
          (p.shares_joint ? " · 同关节" : "") + "</li>";
      }
      html += "</ul>";
    }
    html += "</div>";
    el.contacts.innerHTML = html;
  }

  function fillBodyTable() {
    var tb = el.bodyTable.querySelector("tbody");
    var html = "";
    for (var i = 0; i < state.bodies.length; i++) {
      var b = state.bodies[i];
      html += '<tr data-index="' + i + '">' +
        '<td class="name-cell"><span class="swatch" style="background:' + cssHex(b.color) +
        '"></span>' + b.name + (b.grounded ? ' <span class="faint">接地</span>' : "") + "</td>" +
        '<td class="num">' + (b.mass == null ? "—" : Number(b.mass).toPrecision(4)) + "</td>" +
        '<td class="num" data-disp="' + i + '">—</td>' +
        '<td class="num" data-max="' + i + '">—</td></tr>';
    }
    tb.innerHTML = html;
    var rows = tb.querySelectorAll("tr");
    for (var r = 0; r < rows.length; r++) {
      (function (row, idx) {
        var b = state.bodies[idx];
        b.dispEl = row.querySelector("[data-disp]");
        b.maxEl = row.querySelector("[data-max]");
        b.row = row;
        row.addEventListener("mouseenter", function () {
          b.mat.emissive.setHex(0x3a4a5c);
          row.classList.add("is-hover");
        });
        row.addEventListener("mouseleave", function () {
          b.mat.emissive.setHex(0x000000);
          row.classList.remove("is-hover");
        });
        row.addEventListener("click", function () {
          b.mesh.visible = !b.mesh.visible;
          row.classList.toggle("is-hidden", !b.mesh.visible);
          if (b.trail) b.trail.visible = state.showTrails && b.mesh.visible;
        });
      })(rows[r], r);
    }
  }

  function fillJoints() {
    var joints = state.data.joints || [];
    var html = "";
    for (var i = 0; i < joints.length; i++) {
      var jn = joints[i];
      var hex = JOINT_HEX[jn.type] || 0xffffff;
      html += '<div class="joint-item"><span class="swatch" style="background:' + cssHex(hex) +
        '"></span><div><span class="jid">' + jn.id + "</span> · " + jn.type +
        "<br>" + jn.body_a + " → " + jn.body_b;
      if (jn.limits) {
        html += "<br>限位 [" + fmtNum(jn.limits.min, 4) + ", " + fmtNum(jn.limits.max, 4) + "]";
      }
      html += "</div></div>";
    }
    el.joints.innerHTML = html || '<div class="muted">无关节</div>';
  }

  function fillLists() {
    var uns = state.data.unsupported_features || [];
    if (!uns.length) {
      el.unsupported.innerHTML = '<div class="muted">无</div>';
    } else {
      var u = "<ul class='plain-list'>";
      for (var i = 0; i < uns.length; i++) u += "<li>" + uns[i] + "</li>";
      el.unsupported.innerHTML = u + "</ul>";
    }
    var notes = state.data.adapter_notes || [];
    if (!notes.length) {
      el.adapter.innerHTML = '<div class="muted">无</div>';
    } else {
      var n = "<ul class='plain-list'>";
      for (var j = 0; j < notes.length; j++) n += "<li>" + notes[j] + "</li>";
      el.adapter.innerHTML = n + "</ul>";
    }
  }

  function setSpeed(speed) {
    state.speed = speed;
    var speeds = $("speed-btns").querySelectorAll("button");
    for (var k = 0; k < speeds.length; k++) {
      var s = parseFloat(speeds[k].getAttribute("data-speed"));
      speeds[k].classList.toggle("active", s === speed);
    }
  }

  function switchPhase(name) {
    var rec = state.data.phases[name];
    if (!rec || !rec.has_trace) return;
    state.phase = name;
    var tabs = el.tabs.querySelectorAll("button");
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].classList.toggle("active", tabs[i].getAttribute("data-phase") === name);
    }
    state.time = 0;
    if (name === "static_explode") {
      setSpeed(0.05);
      state.follow = true;
      $("chk-follow").checked = true;
    }
    bindRuntime();
    applyTime(0);
    fillVerdict();
    setTimeReadout();
  }

  function onResize() {
    var host = $("stage");
    var w = host.clientWidth;
    var h = Math.max(host.clientHeight, 1);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  function tick(now) {
    requestAnimationFrame(tick);
    var dt = state.lastTs ? Math.min(0.05, (now - state.lastTs) / 1000) : 0;
    state.lastTs = now;
    if (state.playing) {
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
    if (state.follow) followCamera(dt || 0.016);
    controls.update();
    renderer.render(scene, camera);
  }

  function buildScene(data) {
    canvas = $("view");
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x0b0d12, 1);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, 1, 0.001, 1e5);
    camera.up.set(0, 0, 1);
    controls = new THREE.OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.screenSpacePanning = true;

    scene.add(new THREE.HemisphereLight(0xdde7ff, 0x2a241c, 0.75));
    var dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(0.45, -0.7, 1.1);
    scene.add(dir);
    scene.add(new THREE.AmbientLight(0xffffff, 0.12));

    state.bodies = [];
    for (var i = 0; i < data.bodies.length; i++) {
      var src = data.bodies[i];
      var verts = decodeB64(src.verts, Float32Array);
      var indices = decodeB64(src.indices, Uint32Array);
      var geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
      if (indices.length) geo.setIndex(new THREE.BufferAttribute(indices, 1));
      geo.computeVertexNormals();
      geo.computeBoundingBox();
      geo.computeBoundingSphere();
      var color = bodyColor(src, i);
      var mat = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.12,
        roughness: 0.62,
        flatShading: false,
        emissive: 0x000000
      });
      var mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      state.bodies.push({
        name: src.name,
        mass: src.mass,
        grounded: !!src.grounded,
        color: color,
        mesh: mesh,
        mat: mat,
        rt: { times: [0], pos: new Float32Array(0), quat: new Float32Array(0) },
        t0Pos: new THREE.Vector3(),
        trail: null,
        dispEl: null,
        maxEl: null,
        row: null
      });
    }

    fillBodyTable();
    fillJoints();
    fillLists();
    fillContacts();

    var firstPhase = "static";
    if (!data.phases.static || !data.phases.static.has_trace) {
      if (data.phases.drive && data.phases.drive.has_trace) firstPhase = "drive";
      else if (data.phases.drive_nocontact && data.phases.drive_nocontact.has_trace) {
        firstPhase = "drive_nocontact";
      } else if (data.phases.drive_scale10 && data.phases.drive_scale10.has_trace) {
        firstPhase = "drive_scale10";
      }
    }
    var tabs = el.tabs.querySelectorAll("button");
    for (var t = 0; t < tabs.length; t++) {
      var ph = tabs[t].getAttribute("data-phase");
      var rec = data.phases[ph];
      tabs[t].disabled = !(rec && rec.has_trace);
      tabs[t].addEventListener("click", function (ev) {
        switchPhase(ev.currentTarget.getAttribute("data-phase"));
      });
    }
    state.phase = firstPhase;
    bindRuntime();
    applyTime(0);
    for (var b = 0; b < state.bodies.length; b++) state.bodies[b].mesh.updateMatrixWorld(true);
    var box = assemblyAABB(false);
    placeHelpers(box);
    buildJointHelpers();
    frameCamera(box, true);
    fillVerdict();
    var tabs2 = el.tabs.querySelectorAll("button");
    for (var u = 0; u < tabs2.length; u++) {
      tabs2[u].classList.toggle("active", tabs2[u].getAttribute("data-phase") === firstPhase);
    }
    onResize();
    $("load-msg").hidden = true;
    requestAnimationFrame(tick);
  }

  function wireUi() {
    el.btnPlay.addEventListener("click", function () {
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
      state.time = parseFloat(el.scrub.value) || 0;
      applyTime(state.time);
      setTimeReadout();
    });
    var speeds = $("speed-btns").querySelectorAll("button");
    for (var i = 0; i < speeds.length; i++) {
      speeds[i].addEventListener("click", function (ev) {
        setSpeed(parseFloat(ev.currentTarget.getAttribute("data-speed")));
      });
    }
    $("btn-reset").addEventListener("click", function () {
      camera.position.copy(state.initPos);
      controls.target.copy(state.initTarget);
      applyNearFar(state.extent);
      controls.update();
    });
    $("chk-follow").addEventListener("change", function (ev) {
      state.follow = ev.target.checked;
    });
    $("chk-axes").addEventListener("change", function (ev) {
      setJointVisible(ev.target.checked);
    });
    $("chk-trails").addEventListener("change", function (ev) {
      setTrailVisible(ev.target.checked);
    });
    $("chk-ghost").addEventListener("change", function (ev) {
      setGhostGround(ev.target.checked);
    });
    $("chk-wire").addEventListener("change", function (ev) {
      setWireframe(ev.target.checked);
    });
    window.addEventListener("keydown", function (ev) {
      var tag = (ev.target && ev.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (ev.code === "Space") {
        ev.preventDefault();
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

  function showError(msg) {
    var box = $("load-msg");
    box.hidden = false;
    box.classList.add("error");
    box.textContent = msg;
  }

  function boot() {
    var params = new URLSearchParams(window.location.search);
    if (params.get("pair")) return;

    el.tabs = $("phase-tabs");
    el.abortNote = $("abort-note");
    el.btnPlay = $("btn-play");
    el.chkLoop = $("chk-loop");
    el.btnStepBack = $("btn-step-back");
    el.btnStepFwd = $("btn-step-fwd");
    el.scrub = $("scrub");
    el.timeReadout = $("time-readout");
    el.verdict = $("verdict-block");
    el.contacts = $("contacts-block");
    el.bodyTable = $("body-table");
    el.joints = $("joint-list");
    el.unsupported = $("unsupported-block");
    el.adapter = $("adapter-block");

    var caseId = params.get("case");
    if (!caseId) {
      showError("缺少 case 参数。请从目录页打开。");
      return;
    }
    var script = document.createElement("script");
    script.src = "data/cases/" + caseId + ".js";
    script.onload = function () {
      var data = (window.VIEWER_CASES || {})[caseId];
      if (!data) {
        showError("已载入脚本，但没有找到案例 " + caseId);
        return;
      }
      state.data = data;
      $("short-id").textContent = data.short_id;
      $("full-id").textContent = data.case_id;
      $("source-label").textContent = data.source_label || data.source;
      $("description").textContent = data.description || "";
      document.title = data.short_id + " — 仿真回放";
      wireUi();
      buildScene(data);
    };
    script.onerror = function () {
      showError("无法载入 data/cases/" + caseId + ".js（file:// 下请确认已运行 build_viewer_data.py）");
    };
    document.head.appendChild(script);
  }

  if (!window.THREE || !THREE.OrbitControls) {
    showError("three.js / OrbitControls 未载入");
    return;
  }
  boot();
})();
