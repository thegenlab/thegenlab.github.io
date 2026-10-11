(function () {
  var isAnim = new URLSearchParams(window.location.search).get("mode") === "animation";
  document.getElementById("tab-dataset").classList.toggle("active", !isAnim);
  document.getElementById("tab-animation").classList.toggle("active", isAnim);

  var SECTIONS = [
    { source: "package", title: "我们的设计包" },
    { source: "f360", title: "Fusion 360 Gallery" },
      { source: "automate", title: "AutoMate" },
      { source: "articulate3d", title: "Articulate3D (ScanNet++)" },
      { source: "articraft", title: "Articraft-10K" }
  ];

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fmtDisp(m) {
    if (m == null || !isFinite(m)) return "—";
    var a = Math.abs(m);
    if (a < 1e-6) return "≈ 0";
    if (a >= 1) return m.toFixed(2) + " m";
    return (m * 1000).toFixed(1) + " mm";
  }

  function fmtMotion(val, thr, unit) {
    if (val == null || !isFinite(val)) return "";
    var u = unit || "rad";
    var vs, ts;
    if (u === "m") {
      vs = (Math.abs(val) >= 1) ? val.toFixed(2) + " m" : (val * 1000).toFixed(1) + " mm";
      ts = (thr >= 1) ? thr.toFixed(2) + " m" : (thr * 1000).toFixed(0) + " mm";
    } else {
      vs = (Math.abs(val) >= 10) ? val.toFixed(2) : val.toFixed(3);
      ts = String(thr);
      vs += " rad";
      ts += " rad";
    }
    return vs + " / " + ts;
  }

  function vClass(v) {
    if (v === "STABLE" || v === "MOTION_OK") return "badge-ok";
    if (v === "COLLAPSE") return "badge-collapse";
    if (v === "MOTION_DEAD") return "badge-dead";
    if (v === "MOTION_ERRATIC") return "badge-erratic";
    return "";
  }

  var CACHE_BUST = Date.now();

  function thumbFig(src, caption) {
    if (!src) return "";
    return '<figure><img src="thumbs/' + esc(src) + "?t=" + CACHE_BUST + '" alt="' +
      esc(caption) + '" loading="lazy" decoding="async"><figcaption>' +
      esc(caption) + "</figcaption></figure>";
  }

  function cardHtml(row) {
    var t = row.thumbs || {};
    var t0cap = t.t0_s != null ? "t = " + Number(t.t0_s).toFixed(2) + " s" : "t = 0";
    var tendCap = t.tend_s != null ? "静置 t = " + Number(t.tend_s).toFixed(2) + " s" : "静置终点";
    var driveCap = t.drive_tend_s != null ? "驱动 t = " + Number(t.drive_tend_s).toFixed(2) + " s" : "驱动终点";
    var badges = [];
    if (row.static_verdict) {
      badges.push('<span class="badge ' + vClass(row.static_verdict) + '">' + esc(row.static_verdict) +
        " · max位移 " + esc(fmtDisp(row.max_displacement_m)) + "</span>");
    }
    var dv = row.drive_verdict;
    if (dv && dv !== "-") {
      var mot = fmtMotion(row.drive_motion, row.drive_threshold, row.drive_unit);
      badges.push('<span class="badge ' + vClass(dv) + '">' + esc(dv) +
        (mot ? " · " + esc(mot) : "") + "</span>");
      if (row.drive_borderline) badges.push('<span class="badge badge-warn">临界</span>');
    }
    if (row.diag_nocontact_verdict) {
      badges.push('<span class="badge badge-diag ' + vClass(row.diag_nocontact_verdict) + '">诊断 ' +
        esc(row.diag_nocontact_verdict) + "</span>");
    }
    if (row.diag_scale10_verdict) {
      var mot10 = fmtMotion(row.diag_scale10_motion, row.drive_threshold, row.drive_unit);
      badges.push('<span class="badge badge-diag ' + vClass(row.diag_scale10_verdict) + '">10× ' +
        esc(row.diag_scale10_verdict) + (mot10 ? " · " + esc(mot10) : "") + "</span>");
    }
    if (row.phases && row.phases.static_explode) {
      badges.push('<span class="badge badge-diag badge-collapse">可看逐步发散</span>');
    }
    var href = "case/?case=" + encodeURIComponent(row.case_id);
    return (
      '<article class="card">' +
        '<div class="thumbs">' +
          thumbFig(t.t0, t0cap) +
          thumbFig(t.tend, tendCap) +
          thumbFig(t.drive_tend, driveCap) +
        "</div>" +
        "<h3>" + esc(row.short_id) + "</h3>" +
        '<div class="full-id">' + esc(row.case_id) + "</div>" +
        '<p class="desc">' + esc(row.description) + "</p>" +
        '<div class="meta-line">' + row.n_bodies + " 体 / " + row.n_joints +
          " 关节（接地 " + row.n_grounded + "）</div>" +
        '<div class="badges">' + badges.join("") + "</div>" +
        '<p class="mechanism">机制：' + esc(row.mechanism || "—") + "</p>" +
        '<a class="btn" href="' + href + '">查看动画</a>' +
      "</article>"
    );
  }

  function animCardHtml(row) {
    var t = row.thumbs || {};
    var badges = [];
    if (row.static_verdict) {
      badges.push('<span class="badge ' + vClass(row.static_verdict) + '">' + esc(row.static_verdict) + "</span>");
    }
    var dv = row.drive_verdict;
    if (dv && dv !== "-") {
      badges.push('<span class="badge ' + vClass(dv) + '">' + esc(dv) + "</span>");
    }
    if (row.diag_nocontact_verdict) {
      badges.push('<span class="badge badge-diag ' + vClass(row.diag_nocontact_verdict) + '">诊断 ' +
        esc(row.diag_nocontact_verdict) + "</span>");
    }
    var href = "case/?pair=" + encodeURIComponent(row.id);
    var html =
      '<article class="card note-card">' +
        "<h3>" + esc(row.title || row.id) + "</h3>" +
        '<div class="full-id">' + esc(row.id) + "</div>" +
        '<p class="desc">' + esc(row.description || "") + "</p>" +
        '<div class="note-cols">' +
          '<div class="note-col"><span class="note-kicker">A · 时间轴动画</span>' +
            thumbFig(t.a, "A · 运动学") +
            esc(row.a_note || "按公式转完，无质量无碰撞。") + "</div>" +
          '<div class="note-col"><span class="note-kicker">B · 有质量有接触</span>' +
            thumbFig(t.b, "B · 驱动终点") +
            esc(row.b_note || "同一套零件进物理。") + "</div>" +
        "</div>";
    if (badges.length) html += '<div class="badges">' + badges.join("") + "</div>";
    if (row.dead_note) {
      html += '<p class="dead-note">' + esc(row.dead_note) + "</p>";
    }
    html += '<a class="btn" href="' + href + '">打开对照</a></article>';
    return html;
  }

  function renderAnimation(rows) {
    document.body.classList.add("anim-catalog");
    document.title = "Animation 对照 — 正向运动学 vs 物理仿真";
    document.getElementById("page-title").textContent = "Animation 对照 — 按公式转完，再进物理";
    document.getElementById("page-legend").innerHTML =
      "<p>左边是时间轴正向运动学，无质量无碰撞，看起来能转完。右边是同一套零件进 unified_sim（重力、接触）。</p>" +
      "<p><b>诊断</b>：同样的微驱动，但关掉被驱动一对的接触。只作对照，不是判定。</p>" +
      "<p>穿模高亮在对照页侧栏：<b>零件高亮</b>标整块穿进的零件，<b>相交区域</b>只标相交三角。</p>";
    if (!rows || !rows.length) {
      document.getElementById("tallies").textContent = "Animation 目录为空。";
      document.getElementById("sections").innerHTML = "";
      return;
    }
    document.getElementById("tallies").innerHTML =
      '<span class="tally">共 <b>' + rows.length + "</b> 例对照</span>";
    var html = '<section class="section"><h2>对照机械</h2>';
    html += '<p class="count">' + rows.length + " 例</p>";
    html += '<div class="card-grid">';
    for (var i = 0; i < rows.length; i++) html += animCardHtml(rows[i]);
    html += "</div></section>";
    document.getElementById("sections").innerHTML = html;
  }

  function renderDataset(rows) {
    if (!rows || !rows.length) {
      document.getElementById("tallies").textContent = "未找到 data/index.js，请先运行 build_viewer_data.py。";
      return;
    }

    var nStable = 0, nCollapse = 0, nOk = 0, nDead = 0, nErr = 0;
    var n10Ok = 0, n10Dead = 0, n10Err = 0, n10 = 0;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (r.static_verdict === "STABLE") nStable++;
      if (r.static_verdict === "COLLAPSE") nCollapse++;
      if (r.drive_verdict === "MOTION_OK") nOk++;
      if (r.drive_verdict === "MOTION_DEAD") nDead++;
      if (r.drive_verdict === "MOTION_ERRATIC") nErr++;
      if (r.diag_scale10_verdict) {
        n10++;
        if (r.diag_scale10_verdict === "MOTION_OK") n10Ok++;
        if (r.diag_scale10_verdict === "MOTION_DEAD") n10Dead++;
        if (r.diag_scale10_verdict === "MOTION_ERRATIC") n10Err++;
      }
    }
    document.getElementById("tallies").innerHTML =
      '<span class="tally">静置 <b>' + nStable + "</b> STABLE / <b>" + nCollapse + "</b> COLLAPSE</span>" +
      '<span class="tally">微驱动 <b>' + nOk + "</b> OK / <b>" + nDead + "</b> DEAD / <b>" + nErr + "</b> ERRATIC</span>" +
      '<span class="tally">10× <b>' + n10Ok + "</b> OK / <b>" + n10Dead + "</b> DEAD / <b>" + n10Err + "</b> ERRATIC（" + n10 + " 例）</span>" +
      '<span class="tally">共 <b>' + rows.length + "</b> 例</span>";

    var host = document.getElementById("sections");
    var html = "";
    for (var s = 0; s < SECTIONS.length; s++) {
      var sec = SECTIONS[s];
      var items = rows.filter(function (x) { return x.source === sec.source; });
      if (!items.length) continue;
      html += '<section class="section"><h2>' + esc(sec.title) + "</h2>";
      html += '<p class="count">' + items.length + " 例</p>";
      html += '<div class="card-grid">';
      for (var j = 0; j < items.length; j++) html += cardHtml(items[j]);
      html += "</div></section>";
    }
    host.innerHTML = html;
  }

  function loadScript(src, onload, onerror) {
    var el = document.createElement("script");
    el.src = src;
    el.onload = onload;
    el.onerror = onerror;
    document.head.appendChild(el);
  }

  if (isAnim) {
    document.body.classList.add("anim-catalog");
    loadScript("data/animation_index.js?t=" + CACHE_BUST, function () {
      if (!window.ANIMATION_INDEX) {
        document.getElementById("tallies").textContent =
          "未找到 data/animation_index.js，请先运行 animation/pack_animation_viewer.py。";
        return;
      }
      renderAnimation(window.ANIMATION_INDEX);
    }, function () {
      document.title = "Animation 对照";
      document.getElementById("page-title").textContent = "Animation 对照 — 正向运动学 vs 物理仿真";
      document.getElementById("page-legend").innerHTML =
        "<p>左边是时间轴正向运动学，无质量无碰撞，看起来能转完。右边是同一套零件进 unified_sim（重力、接触）。</p>" +
        "<p><b>诊断</b>：同样的微驱动，但关掉被驱动一对的接触。只作对照，不是判定。</p>" +
        "<p>穿模高亮在对照页侧栏：<b>零件高亮</b>标整块穿进的零件，<b>相交区域</b>只标相交三角。</p>";
      document.getElementById("tallies").textContent =
        "未找到 data/animation_index.js，请先运行 animation/pack_animation_viewer.py。";
    });
    return;
  }

  loadScript("data/index.js?t=" + CACHE_BUST, function () {
    renderDataset(window.VIEWER_INDEX);
  }, function () {
    document.getElementById("tallies").textContent = "未找到 data/index.js，请先运行 build_viewer_data.py。";
  });
})();
