(function () {
  "use strict";

  var specificPairs = [
    ["Animation 对照 — 按公式转完，再进物理", "Animation comparison — kinematic track first, then physics"],
    ["Animation 对照 — 正向运动学 vs 物理仿真", "Animation comparison — forward kinematics vs physics replay"],
    ["数据集条目", "Dataset entry"],
    ["左边匀速转到同一行程，右边是接触仿真回放。", "The left track moves at constant speed to the same travel; the right track replays contact physics."],
    ["左边平滑运动学，右边带齿条-齿轮 mate 的物理，整扇门一起升。", "The left track uses smooth kinematics; the right uses rack-and-pinion physics and lifts the whole gate."],
    ["左边按公式转完，右边同一套零件进物理。", "The left track completes by formula; the right puts the same parts into physics."],
    ["左边按公式转完，右边", "The left track completes by formula; the right track uses physics"],
    ["左边是时间轴正向运动学，无质量无碰撞，看起来能转完。右边是同一套零件进 unified_sim（重力、接触）。", "The left pane is forward kinematics without mass or collision. The right pane puts the same parts into unified_sim with gravity and contact."],
    ["穿模高亮在对照页侧栏：零件高亮标整块穿进的零件，相交区域只标相交三角。", "Use the comparison sidebar to highlight whole interpenetrating parts or only intersecting triangles."],
    ["脚与地面是滑块，腿杆不能绕脚俯仰，交叉架在物理里合不上。", "The feet are sliders, the leg links cannot pitch at the feet, and the crossed frame cannot close in physics."],
    ["微驱动几乎转不动。", "The micro-drive produces almost no rotation."],
    ["静置关：无输入、重力 4 s。每个非接地体位移都 < 10 mm → STABLE，否则 COLLAPSE。", "Static: no input, gravity for 4 s. Every non-grounded body displacement < 10 mm → STABLE; otherwise COLLAPSE."],
    ["微驱动关：仅静置 STABLE 的案例；给第一个可动关节加恒定小载荷。关节坐标前进 ≥ 0.175 rad / 10 mm → MOTION_OK。", "Micro-drive: only cases that are STABLE at rest; apply a constant small load to the first movable joint. Joint travel ≥ 0.175 rad / 10 mm → MOTION_OK."],
    ["诊断：同样的微驱动，但关掉被驱动一对的接触。只作对照，不是判定。", "Diagnostic: the same micro-drive with contact disabled for the driven pair. For comparison only; not a verdict."],
    ["10× 驱动关：载荷乘 10，其余与微驱动相同。只作对照，不是判定。", "10× drive: multiply the load by 10; all other conditions match the micro-drive. For comparison only; not a verdict."],
    ["逐步发散：个别静置中途炸掉的案例另有 1 ms 采样回放。飞出位移会夹到 12 m，只为看清方向；真实位移是天文数字。", "Stepwise divergence: selected cases that explode during static settling have a 1 ms replay. Escaped displacement is clamped to 12 m for direction; the true displacement is enormous."],
    ["：个别静置中途炸掉的案例另有 1 ms 采样回放。飞出位移会夹到 12 m，只为看清方向。", ": selected cases that explode during static settling have a 1 ms replay. Escaped displacement is clamped to 12 m for direction."],
    ["真齿轮轮系：单件渲染可见行星齿轮(~10齿)与环形大齿轮的齿；装配态可见4柱塞缸+框架(行星齿轮柱塞泵类)", "True gear train: individual renders show a planetary gear (~10 teeth) and ring-gear teeth; the assembly shows four plunger cylinders and a frame."],
    ["真齿轮轮系：装配态iso可见机架+双通轴+轴端轮，框架中央紫色带齿圆盘齿距分明(组件名PinionWheel)", "True gear train: the ISO assembly shows a frame, two through-shafts, and end gears; the central purple toothed disk has clear pitch (PinionWheel)."],
    ["零死因对照：圆鼓内5个扇形滑瓣围成整圆+底部旋钮，Slider:5与5瓣径向滑块一一对应", "No-death comparison: five sector sliders form a circle inside a drum with a bottom knob; Slider:5 matches the five radial sliders."],
    ["零死因对照：盒式外壳+长杠杆手柄的锁扣/插销机构(lever/latch/threaded rod/spring)", "No-death comparison: a box housing with a long lever handle and latch/bolt mechanism."],
    ["限位未启用代表：两轮车(两大轮+车架+车把)，轮子转动无限位的典型形态", "Limit-disabled example: a two-wheel vehicle with frame and handlebar, representing an unbounded wheel joint."],
    ["悬空件代表：书桌+一把明显悬空的绿色椅子(渲染直接可见悬浮)，b死因直观物证", "Floating-part example: a desk and a clearly floating green chair, directly visible in the render."],
    ["零死因对照：橙色门框+蓝色门板的单铰链门(Panel Puerta/Marco puerta)", "No-death comparison: an orange door frame and blue door panel with a single hinge."],
    ["纯铰链代表：U形底座两端圆柱塔+两根平行长连杆的双摇杆/平行四连杆，与Revolute:4吻合", "Pure-hinge example: a U-shaped base with two cylindrical towers and parallel links, matching Revolute:4."],
    ["真齿轮：内齿圈+大中小三个外齿轮的四件轮系（内齿与小齿轮齿形清晰）", "True gear train: an internal ring gear plus three external gears of different sizes, with visible tooth profiles."],
    ["真齿轮：三根长轴顶端各一个直齿小齿轮，三齿轮啮合（放大确认齿形）", "True gear train: three long shafts each carry a spur pinion, and the three gears mesh."],
    ["真齿轮：大齿圈（433 面整圈齿）+10 齿小齿轮+鼓形壳+摆臂；原 7 个 e_cylindrical 候选中唯一真齿轮", "True gear train: a large 433-face ring gear, 10-tooth pinion, drum housing, and arm; the only true gear train among seven e_cylindrical candidates."],
    ["台虎钳：固定钳身+活动钳口（滑块）+T 柄丝杠（铰链）", "Bench vise: fixed body, sliding jaw, and T-handle screw."],
    ["杠杆压紧机构：底座+带槽杠杆臂+旋钮，双铰双滑", "Lever clamp: base, slotted lever arm, and knob with two revolute and two slider joints."],
    ["手动压力机：C 形框架+手扳杠杆+竖直柱塞（柱塞侧有齿条状特征）", "Manual press: C-frame, hand lever, and vertical plunger with rack-like features."],
    ["双滚筒连杆机构：红架+蓝色滚轮+双紫色连杆+绿色滚筒；无预测死因", "Twin-drum linkage: red frame, blue rollers, two purple links, and green drum; no predicted failure cause."],
    ["铰接夹爪两簇（黄蓝组与红紫组空间分离），d_no_fixed_occurrence 无锚定代表", "Articulated gripper in two spatially separated clusters; a no-anchor d_no_fixed_occurrence example."],
    ["整间房的门：门框 + 门，一个 rotation，竖直铰轴，行程 90°。扫描面数 180020，是单自由度候选里最完整的几何。竖直铰轴上重力不产生绕轴力矩，静态应当 STABLE；门朝走廊一侧摆出，标注轴若准确则 drive 应当能动。", "Room door: frame and door with one rotation, a vertical hinge axis, and 90° travel. With 180020 scan faces it is the most complete single-DOF geometry; static stability is expected and the door should move if the annotated axis is correct."],
    ["窗：窗框 + 窗扇，一个 rotation，行程 93°。与门同为竖直铰轴，但窗扇薄、悬臂短，转动惯量小一个量级，用来看同一套阈值在小尺度铰接上是否仍然判得动。", "Window: frame and sash with one rotation and 93° travel. Like the door it has a vertical hinge, but its thin short-arm sash has an order-of-magnitude smaller inertia."],
    ["抽屉：柜体 + 抽屉 + 一个未标注铰接的把手（并入抽屉刚体），一个 translation，行程 0.29 m，是选样里唯一的单自由度 slider。抽屉在扫描时关闭，只有正面面片被扫到，抽屉体本身没有几何；其凸包会填满抽屉正面所在的那一层，driven 时可能与柜体面片互穿或被挡死。", "Drawer: cabinet, drawer, and an unannotated handle hinge merged into the drawer body; one translation with 0.29 m travel. The scan captures only the front surface, so its convex hull may intersect or block against the cabinet."],
    ["垃圾桶盖：桶身 + 盖，一个 rotation，行程 133°，水平铰轴。选它是因为前三个 case 的重力都不绕关节轴作功，而水平铰轴的盖子重力力矩直接压在关节坐标 0 上——标注的 closed 态恰好等于 rangeMin，所以下限正好托住盖子，静态是否 STABLE 完全取决于 runner 是否真的执行了下限。", "Trash-bin lid: body and lid with one rotation and 133° travel around a horizontal hinge. Gravity acts directly on the joint coordinate at the closed lower limit, so static stability depends on enforcing that limit."],
    ["门 + 把手串联链：门框 → 门 → 把手座 → 把手，chain_depth 3，三个 rotation 串成一条链，子树里没有未标注铰接的部件。这是全部无违规候选里最深的链，也是唯一一个末端关节的 body_a 自身还是可动体的 case（把手挂在门上，门挂在门框上）。", "Door and handle serial chain: frame → door → handle base → handle, with chain depth 3 and three rotations. The handle is the only end joint whose body_a is itself movable."],
    ["四扇窗 + 三个把手：一个窗框上 7 个 rotation，chain_depth 2，扫描面数 229489，是多自由度候选里自由度最多、几何最完整的。四扇窗共用同一个 grounded 窗框，互相之间没有关节，只在接触上相邻——正好压在 PROTOCOL §3「关节对之间也开接触」这条规则上。", "Four windows and three handles: one frame with seven rotations and chain depth 2; 229489 scan faces. The windows share one grounded frame and touch without joints."],
    ["柜子：4 门 + 2 把手共 6 个 rotation，另有 7 个未标注铰接的部件（隔板、抽屉面板一类）被并进各自父刚体。并进去之后柜体刚体是若干互不相连的面片的并集，凸包按连通分量取，所以柜体内部不会被填成一整块。", "Cabinet: four doors and two handles with six rotations, plus seven unannotated hinged parts merged into parent bodies. Convex hulls are taken per connected component, so the cabinet interior is not filled solid."],
    ["书桌柜：3 个抽屉 translation + 1 个门 rotation，混合运动类型，是选样里唯一一个同时含 revolute 与 slider 的 case。PROTOCOL §5 只驱动 joints[] 里第一个可动关节，这里按 pid 升序排，驱动的是抽屉还是门取决于标注顺序，逐 case 记在 build_log 里。", "Desk cabinet: three drawer translations and one door rotation, the only mixed revolute/slider case in the sample. The first movable joint is driven in pid order."],
    ["四轴平行齿轮系，模数 2.000 mm 精确，节圆误差 0.001 mm。无 <collision>、无 <mimic>。几何啮合成立，声明层没有传动，接触体要由适配器从 visual 推导。", "Four-axis parallel gear train with exact 2.000 mm module and 0.001 mm pitch-circle error. Geometry meshes, but transmission must be inferred by the adapter."],
    ["五轴复合直齿轮，模数全是 4.000 mm，齿数与文件名 spur_N_tooth 一致。四对副轴距偏大 10–11 mm，齿顶差 2–3 mm 够不着。惯性完整。", "Five-axis compound spur gear train with 4.000 mm modules. Four shaft pairs are 10–11 mm too far apart for their 2–3 mm tooth clearance."],
    ["九级转子，33 个碰撞体，惯性完整。full 层里机械类少有的完整 URDF。", "Nine-stage rotor with 33 collision bodies and complete inertias; an unusually complete mechanical URDF."],
    ["T 柄气泵：两个棱柱副加一个转动副，24 个碰撞体。活塞压缩靠接触。", "T-handle air pump: two prismatic joints and one revolute joint, with 24 collision bodies. Piston compression depends on contact."],
    ["对置双滑夹爪，72 个碰撞体，壳体 grounded。夹紧靠接触。", "Opposed dual-slide gripper with 72 collision bodies and a grounded housing; gripping depends on contact."],
    ["20 自由度串联臂加五指，无保持力矩。基座 grounded。静置关很可能 COLLAPSE。", "20-DOF serial arm with five fingers and no holding torques; the grounded base is likely to collapse under static gravity."],
    ["三轴正交滑台。无碰撞体，接触由 visual 固体推导。问嵌套滑台在重力下守不守位。", "Three-axis orthogonal linear stage with no collision bodies; visual solids provide contact. Tests whether nested sliders hold under gravity."],
    ["塔吊：回转 + 小车，314 个图元拼桁架，跨度 3.62 m。机器尺度静力。", "Tower crane: slew joint plus trolley, 314 primitives forming a 3.62 m truss; a large-scale static test."],
    ["ours, 闹钟齿轮轮系主选", "Our design, selected alarm-clock gear train"],
    ["ours, 认证样例", "Our design, certification example"],
    ["ours, 铰链/连杆对照", "Our design, hinge/linkage comparison"],
    ["单缸柴油机曲柄连杆", "Single-cylinder diesel crank linkage"],
    ["剖视单缸：飞轮、曲轴、连杆、活塞、带翅片的缸体。A 轨按公式把曲轴走完两圈（四个冲程）；B 轨同一套零件进有质量有接触的物理。", "Sectioned single cylinder: flywheel, crankshaft, rod, piston, and finned cylinder. Track A completes two crankshaft turns by formula; Track B uses the same parts in physics with mass and contact."],
    ["时间轴正向运动学，无质量无碰撞。", "Timeline forward kinematics, without mass or collision."],
    ["同一 meshes/ 做静置与微驱动。", "The same meshes run through static and micro-drive tests."],
    ["折叠凳", "Folding stool"],
    ["X 形马扎。A 轨把交叉腿收到更窄的 X；B 轨同一套零件进物理。", "X-frame folding stool. Track A folds the crossed legs into a narrower X; Track B puts the same parts into physics."],
    ["正向运动学。两侧腿杆在铆钉处错开，收到约 20° 余角，交叉架仍是 X，不再叠成两根立柱。", "Forward kinematics. The leg links are offset at the rivets and retain about 20° between them, so the frame remains an X."],
    ["同一 meshes/ 做静置与微驱动。脚是滑块，物理里交叉架合不上。", "The same meshes run through static and micro-drive tests. The feet are sliders, so the physical frame cannot close."],
    ["四杆雨刮", "Four-bar wiper"],
    ["设计包四杆机构。A 轨平面四杆解析运动学；B 轨现有 unified_sim 回放。", "Four-bar mechanism design package. Track A uses planar analytical kinematics; Track B is the existing unified_sim replay."],
    ["曲柄从作者位姿转 1.5 rad，连杆按交圆求解。", "The crank rotates 1.5 rad from the authored pose; the link is solved by circle intersection."],
    ["现有 package 静置 / 微驱动回放。", "Existing package static and micro-drive replay."],
    ["机械闹钟", "Mechanical alarm clock"],
    ["A 轨按仿真净转角做平滑动画；B 轨是现有接触仿真回放，走起来一顿一顿。", "Track A is a smooth animation from the simulated net angles; Track B is the existing contact replay and moves intermittently."],
    ["各件按 B 轨净转角匀速转。无质量无碰撞。", "Each part rotates uniformly by the net angle from Track B, without mass or collision."],
    ["现有 package 静置 / 微驱动回放。齿轮啮合未建模。", "Existing package static and micro-drive replay; gear meshing is not modeled."],
    ["齿条齿轮门", "Rack-and-pinion gate"],
    ["A 轨按 B 轨净行程做平滑运动学，整扇门跟着齿条走；B 轨是 Chrono 物理：有质量有接触，并加了齿条-齿轮 mate，整扇门一起平移。", "Track A uses smooth kinematics from Track B's net travel; Track B is Chrono physics with mass, contact, and a rack-and-pinion mate."],
    ["齿轮转角和齿条位移按 B 轨净行程匀速走到同一终点。无质量无碰撞。", "Gear angle and rack displacement move uniformly to the same endpoint as Track B, without mass or collision."],
    ["有质量有接触，加上齿条-齿轮 mate，整扇门沿滑轨平移。", "Mass and contact are enabled with a rack-and-pinion mate; the whole gate translates along its rail."],
    ["行星齿轮", "Planetary gear"],
    ["太阳轮、三个行星轮、齿圈和行星架。A 轨按齿数比把太阳轮走完两圈；B 轨同一套齿形进有质量有接触的物理。", "Sun gear, three planet gears, ring gear, and carrier. Track A turns the sun gear two revolutions by tooth ratio; Track B uses the same teeth in physics with mass and contact."],
    ["齿圈固定。正向运动学按 Willis 公式转，行星轮在销上自转。无质量无碰撞。", "The ring is fixed. Forward kinematics follows the Willis equation and planet gears spin on their pins, without mass or collision."],
    ["同一 meshes/。行星轮销轴转角锁在 0，心距偏近。默认打开穿模高亮。", "The same meshes are used. Planet-pin rotation is locked at zero and the center distance is slightly too close; interpenetration highlighting is enabled by default."],
  ];

  var pairs = [
    ["公开 CAD 数据集 vs simulation-ready 设计包 — 统一仿真回放", "Public CAD datasets vs simulation-ready design packages — unified simulation replay"],
    ["仿真回放", "Simulation replay"],
    ["目录切换", "Catalog navigation"],
    ["数据集", "Dataset"],
    ["Animation 对照", "Animation comparison"],
    ["静置：逐步发散", "Static: stepwise divergence"],
    ["静置终点", "Static endpoint"],
    ["静置稳定", "static stable"],
    ["静置坍塌", "static collapse"],
    ["静置", "Static"],
    ["微驱动", "Micro-drive"],
    ["驱动终点", "Drive endpoint"],
    ["诊断：去接触驱动", "Diagnostic: no-contact drive"],
    ["诊断：10× 驱动", "Diagnostic: 10× drive"],
    ["诊断 / 10×（描边）", "Diagnostics / 10× (outlined)"],
    ["逐步发散", "Stepwise divergence"],
    ["正在载入网格与轨迹…", "Loading meshes and trajectories…"],
    ["参考网格（仿真中没有地面）", "Reference grid (no ground in simulation)"],
    ["← 返回 Animation 目录", "← Back to Animation catalog"],
    ["← 返回目录", "← Back to catalog"],
    ["查看动画", "View animation"],
    ["打开对照", "Open comparison"],
    ["播放", "Play"],
    ["循环", "Loop"],
    ["帧", "frame"],
    ["重置视角", "Reset view"],
    ["跟随运动", "Follow motion"],
    ["接地体半透明", "Transparent grounded bodies"],
    ["关节轴", "Joint axes"],
    ["轨迹", "Trails"],
    ["线框", "Wireframe"],
    ["剖视", "Section view"],
    ["本相位判定", "Phase verdict"],
    ["B 本相位判定", "Track B phase verdict"],
    ["t = 0 接触", "t = 0 contacts"],
    ["刚体", "Rigid bodies"],
    ["名称", "Name"],
    ["质量 kg", "Mass kg"],
    ["现位移", "Current displacement"],
    ["关节", "Joints"],
    ["未映射特征", "Unmapped features"],
    ["适配器备注", "Adapter notes"],
    ["A 轨 · 时间轴动画", "Track A · timeline animation"],
    ["B 轨 · 有质量有接触", "Track B · mass and contact"],
    ["B 相位", "Track B phase"],
    ["A 轨是时间轴姿态，没有物理判定。", "Track A is kinematic and has no physics verdict."],
    ["穿模", "Interpenetration"],
    ["穿模高亮在对照页侧栏：", "Interpenetration highlighting in the comparison sidebar: "],
    ["标红互相穿进的零件，或只标相交三角。", "Highlight interpenetrating parts, or only the intersecting triangles."],
    ["标整块穿进的零件，", " highlights whole interpenetrating parts, "],
    ["只标相交三角。", " highlights only intersecting triangles."],
    ["零件高亮", "Part highlight"],
    ["相交区域", "Intersection region"],
    ["机制：", "Mechanism: "],
    ["机制 ", "Mechanism "],
    ["（", " ("],
    ["）", ")"],
    ["对比报告", "Comparison report"],
    ["汇总表", "Summary table"],
    ["未找到 data/index.js，请先运行 build_viewer_data.py。", "data/index.js was not found. Run build_viewer_data.py first."],
    ["未找到 data/animation_index.js，请先运行 animation/pack_animation_viewer.py。", "data/animation_index.js was not found. Run animation/pack_animation_viewer.py first."],
    ["对照机械", "Comparison mechanisms"],
    ["共 ", "Total "],
    [" 例", " cases"],
    ["体 / ", " bodies / "],
    ["关节（接地 ", " joints (grounded "],
    ["接地 ", "grounded "],
    ["接地", "grounded"],
    ["未找到 data/animation_index.js", "data/animation_index.js was not found"],
    ["按公式转完，无质量无碰撞。", "Completes by formula, without mass or collision."],
    ["同一套零件进物理。", "The same parts enter physics."],
    ["A · 运动学", "A · kinematic"],
    ["B · 驱动终点", "B · drive endpoint"],
    ["静置关", "Static"],
    ["：无输入、重力 4 s。每个非接地体位移都 < 10 mm → STABLE，否则 COLLAPSE。", ": no input, gravity for 4 s. Every non-grounded body displacement < 10 mm → STABLE; otherwise COLLAPSE."],
    ["微驱动关", "Micro-drive"],
    ["：仅静置 STABLE 的案例；给第一个可动关节加恒定小载荷。关节坐标前进 ≥ 0.175 rad / 10 mm → MOTION_OK。", ": only cases that are STABLE at rest; apply a constant small load to the first movable joint. Joint travel ≥ 0.175 rad / 10 mm → MOTION_OK."],
    ["驱动 ", "Drive "],
    ["诊断", "Diagnostic"],
    ["：同样的微驱动，但关掉被驱动一对的接触。只作对照，不是判定。", ": the same micro-drive with contact disabled for the driven pair. For comparison only; not a verdict."],
    ["10× 驱动关", "10× drive"],
    ["10× 驱动", "10× drive"],
    ["：载荷乘 10，其余与微驱动相同。只作对照，不是判定。", ": multiply the load by 10; all other conditions match the micro-drive. For comparison only; not a verdict."],
    ["只作对照，不是判定。", "For comparison only; not a verdict."],
    ["：个别静置中途炸掉的案例另有 1 ms 采样回放。飞出位移会夹到 12 m，只为看清方向；真实位移是天文数字。", ": selected cases that explode during static settling have a 1 ms replay. Escaped displacement is clamped to 12 m for direction; the true displacement is enormous."],
    ["播放", "Play"],
    ["STABLE 静置稳定", "STABLE static stable"],
    ["COLLAPSE 静置坍塌", "COLLAPSE static collapse"],
    ["MOTION_OK 驱动有效", "MOTION_OK drive effective"],
    ["MOTION_DEAD 驱动无运动", "MOTION_DEAD no motion"],
    ["MOTION_ERRATIC 驱动失控", "MOTION_ERRATIC erratic motion"],
    ["max位移", "max displacement"],
    ["阈值", "threshold"],
    ["bbox_exit", "bbox exit"],
    ["驱动关节", "drive joint"],
    ["载荷倍数", "load scale"],
    ["载荷", "load"],
    ["协议 ×", "protocol ×"],
    ["大于 1× 自重", "> 1× body weight"],
    ["运动量", "motion"],
    ["偏轴", "off-axis"],
    ["上限", "limit"],
    ["诊断标签", "diagnostic label"],
    ["限位", "Limits"],
    ["备注", "Notes"],
    ["接触点", "Contact points"],
    ["接触对", "Contact pairs"],
    ["最大穿透", "Max penetration"],
    ["最近 3 对", "Nearest 3 pairs"],
    ["同关节", "same joint"],
    ["无关节", "No joints"],
    ["暂停", "Pause"],
    ["临界", "Borderline"],
    ["可看逐步发散", "Stepwise divergence available"],
    ["此相位在 t=", "This phase stopped at t="],
    ["中止（数值发散）", " (numerical divergence)"],
    ["逐步发散：t=", "Stepwise divergence: t="],
    ["起位移超出可积范围。飞出零件已夹到 12 m，便于看方向；真实位移是天文数字。", "displacement exceeded the display range. Escaped parts are clamped to 12 m for direction; the true displacement is enormous."],
    ["尚无 B 轨轨迹，没有物理判定。", "No Track B trace is available; there is no physics verdict."],
    ["关掉被驱动关节那一对的接触后再驱动，不是协议判定。", "Drive again after disabling contact for the driven pair; this is not a protocol verdict."],
    ["橙色是被驱动件（行程 ≈ 0）。", "Orange marks the driven part (travel ≈ 0)."],
    ["无物理判定", "No physics verdict"],
    ["A 轨没有这个约束。", "Track A does not have this constraint."],
    ["没有找到案例", "Case not found"],
    ["缺少 case 参数。请从目录页打开。", "Missing case parameter. Open a case from the catalog."],
    ["已载入脚本，但没有找到案例", "The script loaded, but the case was not found"],
    ["无法载入", "Unable to load"],
    ["请先运行", "Run first"],
    ["我们的设计包", "Our design package"],
    ["曲轴", "Crankshaft"],
    ["连杆", "Connecting rod"],
    ["活塞", "Piston"],
    ["缸体", "Cylinder"],
    ["太阳轮", "Sun gear"],
    ["行星轮", "Planet gear"],
    ["齿圈", "Ring gear"],
    ["行星架", "Carrier"],
    ["发条桶", "Mainspring barrel"],
    ["分针", "Minute hand"],
    ["时针", "Hour hand"],
    ["秒针", "Second hand"],
    ["齿轮", "Gear"],
    ["齿条", "Rack"],
    ["网上同类：", "Related cases online: "],
    ["例对照", "cases"],
    ["A · 时间轴动画", "A · kinematic animation"],
    ["B · 有质量有接触", "B · mass and contact"]
  ];

  var original = new WeakMap();
  var originalAttrs = new WeakMap();
  var applying = false;
  var observer;
  var titleObserver;
  var lang = "en";
  var button;
  var titleSource = document.title;
  var titleChanging = false;

  function translate(value) {
    var out = value;
    var trimmed = out.trim();
    var exact = { "是": "yes", "否": "no", "无": "None" };
    if (lang === "en" && exact[trimmed]) return out.replace(trimmed, exact[trimmed]);
    var all = specificPairs.concat(pairs).sort(function (a, b) { return b[0].length - a[0].length; });
    for (var i = 0; i < all.length; i++) out = out.split(all[i][0]).join(all[i][1]);
    return out;
  }

  function sourceText(node) {
    if (!original.has(node)) original.set(node, node.nodeValue);
    return original.get(node);
  }

  function apply(root) {
    if (applying) return;
    applying = true;
    var base = root || document.body;
    var walker = document.createTreeWalker(base, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      if (!node.nodeValue.trim()) continue;
      var parent = node.parentElement;
      if (!parent || parent.closest("script,style") || parent.closest(".lang-toggle")) continue;
      var source = sourceText(node);
      var next = lang === "en" ? translate(source) : source;
      if (node.nodeValue !== next) node.nodeValue = next;
    }
    var elements = base.querySelectorAll ? base.querySelectorAll("*[aria-label], *[alt], *[title]") : [];
    for (var e = 0; e < elements.length; e++) {
      var element = elements[e];
      if (element.classList.contains("lang-toggle")) continue;
      var attrs = ["aria-label", "alt", "title"];
      for (var a = 0; a < attrs.length; a++) {
        var attr = attrs[a];
        if (!element.hasAttribute(attr)) continue;
        var saved = originalAttrs.get(element) || {};
        if (saved[attr] == null) saved[attr] = element.getAttribute(attr);
        originalAttrs.set(element, saved);
        var attrSource = saved[attr];
        var attrNext = lang === "en" ? translate(attrSource) : attrSource;
        if (element.getAttribute(attr) !== attrNext) element.setAttribute(attr, attrNext);
      }
    }
    applying = false;
  }

  function updateTitle() {
    var next = lang === "en" ? translate(titleSource) : titleSource;
    if (document.title === next) return;
    titleChanging = true;
    document.title = next;
  }

  function setLanguage(next) {
    lang = next === "zh" ? "zh" : "en";
    document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
    if (button) {
      button.textContent = lang === "en" ? "中文" : "English";
      button.setAttribute("aria-label", lang === "en" ? "Switch to Chinese" : "切换到英文");
    }
    apply(document.body);
    updateTitle();
  }

  function init() {
    button = document.createElement("button");
    button.type = "button";
    button.className = "lang-toggle";
    button.setAttribute("aria-label", "Switch language");
    button.addEventListener("click", function () { setLanguage(lang === "en" ? "zh" : "en"); });
    document.body.appendChild(button);
    lang = "en";
    setLanguage(lang);
    observer = new MutationObserver(function () { apply(document.body); });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    var titleElement = document.querySelector("title");
    if (titleElement) {
      titleObserver = new MutationObserver(function () {
        if (titleChanging) {
          titleChanging = false;
          return;
        }
        titleSource = document.title;
        updateTitle();
      });
      titleObserver.observe(titleElement, { childList: true, characterData: true, subtree: true });
    }
    setInterval(function () {
      var expected = lang === "en" ? translate(titleSource) : titleSource;
      if (document.title === expected) return;
      if (lang === "en" && /[\u4e00-\u9fff]/.test(document.title)) titleSource = document.title;
      else if (lang === "zh") titleSource = document.title;
      updateTitle();
    }, 100);
    setTimeout(function () { apply(document.body); }, 300);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
