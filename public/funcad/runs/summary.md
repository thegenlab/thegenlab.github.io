# M3 unified-sim summary

2026-09-03 17:04  |  19 STABLE / 8 COLLAPSE / 8 NOT_RUN; drive 4 OK / 15 DEAD / 0 ERRATIC

| case | source | bodies/joints(ground) | 未关节化体 | 静置 | max位移m | 机制 | 微驱动 | 运动量/阈值 | 诊断(去接触) | note |
|---|---|---|---|---|---|---|---|---|---|---|
| f360__55627 | f360 | 66/51(1) | 17 | COLLAPSE | 57.2029 | jointed bodies displaced beyond 10 mm (max 0.494 m); unjointed bodies fell: g52_Washer_D10_8, g50_Washer_D10_6, g49_Washer_D10_5, g59_Washer | - | - | - | joint Planar129 type PlanarJointType not mapped; skipped; joint Planar133 type PlanarJointType not mapped; ski |
| f360__56430 | f360 | 8/5(1) | 3 | COLLAPSE | 8888.7254 | jointed bodies fell (max 8888.725 m); unjointed bodies fell: g0_HandleFrame_1_1, g7_Axle_1; then numerical divergence (non-finite pose at t= | - | - | - | body g0_HandleFrame_1_1: merged mesh not watertight; volume-based mass approximate; rigid group rooted at 8eab |
| f360__58066 | f360 | 6/5(1) | 0 | STABLE | 0.0000 | stable (limits enforced) | MOTION_DEAD | +0.0002/0.010 m | MOTION_OK +0.011 | body g1_Component5_1: merged mesh not watertight; volume-based mass approximate; body g2_Component6_1: merged  |
| f360__53744 | f360 | 4/2(1) | 1 | STABLE | 0.0031 | stable (limits enforced) | MOTION_DEAD | +0.0000/0.010 m | MOTION_DEAD +0.000 | body g0_latch_1: merged mesh not watertight; volume-based mass approximate; body g1_nut_1: merged mesh not wat |
| f360__53631 | f360 | 9/7(1) | 1 | COLLAPSE | 0.0000 | numerical divergence (non-finite pose at t=0.0290) | - | - | - | body g5_Axis_1: merged mesh not watertight; volume-based mass approximate; body g7_Frame_1: merged mesh not wa |
| f360__56713 | f360 | 3/1(0) | 1 | COLLAPSE | 78.4996 | free fall: no grounded body | - | - | - |  |
| f360__53060 | f360 | 2/1(1) | 0 | STABLE | 0.0000 | stable (limits enforced) | MOTION_DEAD | +0.001/0.175 rad | MOTION_OK +1.571 |  |
| f360__60738 | f360 | 4/4(1) | 0 | STABLE | 0.0000 | stable | MOTION_DEAD | +0.001/0.175 rad | MOTION_ERRATIC +5.430 |  |
| automate__57555ede | automate | 5/4(1) | 0 | STABLE | 0.0000 | stable | MOTION_DEAD | +0.025/0.175 rad | MOTION_DEAD +0.025 | mateRelation GEAR (Gear 1): not simulated (round 1); mateRelation GEAR (Gear 3): not simulated (round 1) |
| automate__9657d303 | automate | 6/3(3) | 0 | STABLE | 0.0000 | stable | MOTION_DEAD | +0.064/0.175 rad | MOTION_OK +0.416 | mateRelation GEAR (Gear 1): not simulated (round 1) |
| automate__ab2d902d | automate | 3/2(1) | 0 | STABLE | 0.0000 | stable | MOTION_DEAD | +0.005/0.175 rad | MOTION_DEAD +0.004 | mateRelation GEAR (Gear 1): not simulated (round 1) |
| automate__072a9a43 | automate | 3/2(1) | 0 | STABLE | 0.0000 | stable | MOTION_DEAD | +0.170/0.175 rad (临界) | MOTION_OK +679.792 | body g0_MZDDSakNPsFm_2wCm: merged mesh not watertight; volume-based mass approximate; body g2_M5w6caxrthf51gt0 |
| automate__216064bc | automate | 4/4(1) | 0 | STABLE | 0.0000 | stable | MOTION_DEAD | +0.002/0.175 rad | MOTION_DEAD +0.001 |  |
| automate__7305d8b7 | automate | 4/3(1) | 0 | STABLE | 0.0002 | stable | MOTION_DEAD | +0.001/0.175 rad | MOTION_OK +0.229 | mateRelation RACK_AND_PINION (Rack and pinion 1): not simulated (round 1); body g1_MVmGTcwflqut46dlF: merged m |
| automate__109d26e5 | automate | 4/3(1) | 0 | STABLE | 0.0061 | stable | MOTION_DEAD | +0.129/0.175 rad | MOTION_DEAD -0.048 |  |
| automate__16a49d23 | automate | 6/3(0) | 0 | COLLAPSE | 78.5076 | free fall: no grounded body | - | - | - |  |
| articulate3d__89214f3ca0__8.1 | articulate3d | 0/0(0) | 0 | NOT_RUN | - | - | - | - | - | interactable-part and mass annotations described in the Articulate3D paper are absent from the public release; |
| articulate3d__7f4d173c9c__2.1 | articulate3d | 0/0(0) | 0 | NOT_RUN | - | - | - | - | - | interactable-part and mass annotations described in the Articulate3D paper are absent from the public release; |
| articulate3d__281bc17764__4.1 | articulate3d | 0/0(0) | 0 | NOT_RUN | - | - | - | - | - | interactable-part and mass annotations described in the Articulate3D paper are absent from the public release; |
| articulate3d__27dd4da69e__24.1 | articulate3d | 0/0(0) | 0 | NOT_RUN | - | - | - | - | - | interactable-part and mass annotations described in the Articulate3D paper are absent from the public release; |
| articulate3d__0a184cf634__4.1 | articulate3d | 0/0(0) | 0 | NOT_RUN | - | - | - | - | - | interactable-part and mass annotations described in the Articulate3D paper are absent from the public release; |
| articulate3d__50809ea0d8__7.1 | articulate3d | 0/0(0) | 0 | NOT_RUN | - | - | - | - | - | interactable-part and mass annotations described in the Articulate3D paper are absent from the public release; |
| articulate3d__8133208cb6__20.1 | articulate3d | 0/0(0) | 0 | NOT_RUN | - | - | - | - | - | interactable-part and mass annotations described in the Articulate3D paper are absent from the public release; |
| articulate3d__faec2f0468__6.1 | articulate3d | 0/0(0) | 0 | NOT_RUN | - | - | - | - | - | interactable-part and mass annotations described in the Articulate3D paper are absent from the public release; |
| articraft__rec_gear_assemblies_142e7f00a6734277b5f9bd587b2e2a5b | articraft | 5/4(1) | 0 | STABLE | 0.0000 | stable | MOTION_DEAD | +0.133/0.175 rad | - | body shaft_0: merged mesh not watertight; volume-based mass approximate; body shaft_1: merged mesh not waterti |
| articraft__rec_gear_assemblies_c734812ce04b4ae2bbf01bc5d56a225a | articraft | 6/5(1) | 0 | STABLE | 0.0000 | stable (limits enforced) | MOTION_DEAD | -0.000/0.175 rad | - |  |
| articraft__rec_jet_engine_926d0dbe3e974b68b2daedb78b28e03c | articraft | 10/9(1) | 0 | COLLAPSE | 0.0574 | jointed bodies displaced beyond 10 mm (max 0.057 m) | - | - | - | mimic petal_1_hinge of petal_0_hinge; mimic petal_2_hinge of petal_0_hinge; body petal_0: merged mesh not wate |
| articraft__rec_air_pump_with_t_handle_6f5ba9052dc8401c9142c43f31d8e9de | articraft | 4/3(1) | 0 | STABLE | 0.0000 | stable (limits enforced) | MOTION_DEAD | +0.0000/0.010 m | - |  |
| articraft__rec_opposed_twinslide_gripper_ba2bda6616c74cc89a68f7d6c4d87caf | articraft | 3/2(1) | 0 | STABLE | 0.0000 | stable (limits enforced) | MOTION_DEAD | +0.0000/0.010 m | - |  |
| articraft__rec_robotic_arms_0001 | articraft | 21/20(1) | 0 | COLLAPSE | 0.2436 | jointed bodies displaced beyond 10 mm (max 0.244 m) | - | - | - |  |
| articraft__rec_xyz_cartesian_stage_0003 | articraft | 4/3(1) | 0 | COLLAPSE | 0.0550 | jointed bodies displaced beyond 10 mm (max 0.055 m) | - | - | - | body base_frame: merged mesh not watertight; volume-based mass approximate; body z_carriage: merged mesh not w |
| articraft__rec_crane_tower_0001 | articraft | 3/2(1) | 0 | STABLE | 0.0000 | stable (limits enforced) | MOTION_OK | +0.178/0.175 rad | - |  |
| package__mechanical_alarm_clock_r37 | package | 15/14(1) | 0 | STABLE | 0.0021 | stable | MOTION_OK | +13.280/0.175 rad | MOTION_OK +13.280 | gear_meshe time_barrel_center: not simulated (round 1); gear_meshe time_center_third: not simulated (round 1) |
| package__rack_pinion_gate_r01 | package | 3/2(1) | 0 | STABLE | 0.0010 | stable | MOTION_OK | +1.914/0.175 rad | MOTION_OK +1.914 | connection module_5_rack_pinion_mesh (rack_pinion_mesh): not simulated (round 1) |
| package__four_bar_wiper_v1 | package | 4/4(1) | 0 | STABLE | 0.0000 | stable (limits enforced) | MOTION_OK | +1.129/0.175 rad | MOTION_OK +1.129 |  |

## 预测 vs 实测

| case | 预测死因 | 实测静置 | 实测机制 | 微驱动 | 判定 |
|---|---|---|---|---|---|
| f360__55627 | b_floating_occurrences (1) / d_limits_disabled (66) | COLLAPSE | jointed bodies displaced beyond 10 mm (max 0.494 m); unjointed bodies fell: g52_Washer_D10_8, g50_Washer_D10_6, g49_Washer_D10_5, g59_Washer | - | ✓ 如预测 |
| f360__56430 | b_floating_occurrences (2) / d_limits_disabled (5) | COLLAPSE | jointed bodies fell (max 8888.725 m); unjointed bodies fell: g0_HandleFrame_1_1, g7_Axle_1; then numerical divergence (non-finite pose at t= | - | ✓ 如预测 |
| f360__58066 | none | STABLE | stable (limits enforced) | MOTION_DEAD | △ 立得住但驱动不动 |
| f360__53744 | none | STABLE | stable (limits enforced) | MOTION_DEAD | △ 立得住但驱动不动 |
| f360__53631 | d_limits_disabled (7) | COLLAPSE | numerical divergence (non-finite pose at t=0.0290) | - | ✓ 如预测 |
| f360__56713 | b_floating_occurrences (1) / c_no_ground | COLLAPSE | free fall: no grounded body | - | ✓ 如预测 |
| f360__53060 | none | STABLE | stable (limits enforced) | MOTION_DEAD | △ 立得住但驱动不动 |
| f360__60738 | d_limits_disabled (4) | STABLE | stable | MOTION_DEAD | ✗ 预测落空（立得住） |
| automate__57555ede | none | STABLE | stable | MOTION_DEAD | △ 立得住但驱动不动 |
| automate__9657d303 | none | STABLE | stable | MOTION_DEAD | △ 立得住但驱动不动 |
| automate__ab2d902d | e_cylindrical_as_gear | STABLE | stable | MOTION_DEAD | ✗ 预测落空（立得住） |
| automate__072a9a43 | none | STABLE | stable | MOTION_DEAD | △ 立得住但驱动不动 |
| automate__216064bc | none | STABLE | stable | MOTION_DEAD | △ 立得住但驱动不动 |
| automate__7305d8b7 | none | STABLE | stable | MOTION_DEAD | △ 立得住但驱动不动 |
| automate__109d26e5 | none | STABLE | stable | MOTION_DEAD | △ 立得住但驱动不动 |
| automate__16a49d23 | d_no_fixed_occurrence | COLLAPSE | free fall: no grounded body | - | ✓ 如预测 |
| articulate3d__89214f3ca0__8.1 | none | NOT_RUN | - | - | ? 未跑成 |
| articulate3d__7f4d173c9c__2.1 | none | NOT_RUN | - | - | ? 未跑成 |
| articulate3d__281bc17764__4.1 | scan_shell_no_interior | NOT_RUN | - | - | ? 未跑成 |
| articulate3d__27dd4da69e__24.1 | none | NOT_RUN | - | - | ? 未跑成 |
| articulate3d__0a184cf634__4.1 | estimated_axis_chain | NOT_RUN | - | - | ? 未跑成 |
| articulate3d__50809ea0d8__7.1 | estimated_axis_chain | NOT_RUN | - | - | ? 未跑成 |
| articulate3d__8133208cb6__20.1 | scan_shell_no_interior | NOT_RUN | - | - | ? 未跑成 |
| articulate3d__faec2f0468__6.1 | scan_shell_no_interior | NOT_RUN | - | - | ? 未跑成 |
| articraft__rec_gear_assemblies_142e7f00a6734277b5f9bd587b2e2a5b | MOTION_DEAD | STABLE | stable | MOTION_DEAD | ✗ 预测落空（立得住） |
| articraft__rec_gear_assemblies_c734812ce04b4ae2bbf01bc5d56a225a | MOTION_DEAD | STABLE | stable (limits enforced) | MOTION_DEAD | ✗ 预测落空（立得住） |
| articraft__rec_jet_engine_926d0dbe3e974b68b2daedb78b28e03c | none | COLLAPSE | jointed bodies displaced beyond 10 mm (max 0.057 m) | - | ✗ 预测落空（散架） |
| articraft__rec_air_pump_with_t_handle_6f5ba9052dc8401c9142c43f31d8e9de | none | STABLE | stable (limits enforced) | MOTION_DEAD | △ 立得住但驱动不动 |
| articraft__rec_opposed_twinslide_gripper_ba2bda6616c74cc89a68f7d6c4d87caf | none | STABLE | stable (limits enforced) | MOTION_DEAD | △ 立得住但驱动不动 |
| articraft__rec_robotic_arms_0001 | COLLAPSE | COLLAPSE | jointed bodies displaced beyond 10 mm (max 0.244 m) | - | ✓ 如预测 |
| articraft__rec_xyz_cartesian_stage_0003 | none | COLLAPSE | jointed bodies displaced beyond 10 mm (max 0.055 m) | - | ✗ 预测落空（散架） |
| articraft__rec_crane_tower_0001 | none | STABLE | stable (limits enforced) | MOTION_OK | ✓ 如预测 |
| package__mechanical_alarm_clock_r37 | none (must be STABLE) | STABLE | stable | MOTION_OK | ✓ 如预测 |
| package__rack_pinion_gate_r01 | none (must be STABLE) | STABLE | stable | MOTION_OK | ✓ 如预测 |
| package__four_bar_wiper_v1 | none (must be STABLE) | STABLE | stable (limits enforced) | MOTION_OK | ✓ 如预测 |

## 限位与不支持特征

| case | 生效限位 | unsupported_features (前3条) |
|---|---|---|
| f360__55627 | - | joint Planar129 type PlanarJointType not mapped; skipped; joint Planar133 type PlanarJointType not mapped; skipped; joint Planar134 type PlanarJointType not map |
| f360__58066 | joint_0 [0, 0.35]; joint_1 [-0.35, 0]; joint_2 [0, 0.35]; joint_3 [-0.35, 0]; joint_4 [-0.1, 0] | - |
| f360__53744 | joint_0 [-0.01, 0]; joint_1 [-0.174533, 0.349066] | - |
| f360__56713 | joint_0 [0, 0.3] | - |
| f360__53060 | joint_0 [0, 1.5708] | - |
| automate__57555ede | - | mateRelation GEAR (Gear 1): not simulated (round 1); mateRelation GEAR (Gear 3): not simulated (round 1); mateRelation GEAR (Gear 2): not simulated (round 1) |
| automate__9657d303 | - | mateRelation GEAR (Gear 1): not simulated (round 1) |
| automate__ab2d902d | - | mateRelation GEAR (Gear 1): not simulated (round 1) |
| automate__7305d8b7 | - | mateRelation RACK_AND_PINION (Rack and pinion 1): not simulated (round 1) |
| articulate3d__89214f3ca0__8.1 | - | interactable-part and mass annotations described in the Articulate3D paper are absent from the public release |
| articulate3d__7f4d173c9c__2.1 | - | interactable-part and mass annotations described in the Articulate3D paper are absent from the public release |
| articulate3d__281bc17764__4.1 | - | interactable-part and mass annotations described in the Articulate3D paper are absent from the public release |
| articulate3d__27dd4da69e__24.1 | - | interactable-part and mass annotations described in the Articulate3D paper are absent from the public release |
| articulate3d__0a184cf634__4.1 | - | interactable-part and mass annotations described in the Articulate3D paper are absent from the public release |
| articulate3d__50809ea0d8__7.1 | - | interactable-part and mass annotations described in the Articulate3D paper are absent from the public release |
| articulate3d__8133208cb6__20.1 | - | interactable-part and mass annotations described in the Articulate3D paper are absent from the public release |
| articulate3d__faec2f0468__6.1 | - | interactable-part and mass annotations described in the Articulate3D paper are absent from the public release |
| articraft__rec_gear_assemblies_c734812ce04b4ae2bbf01bc5d56a225a | input_spin [-6.28319, 6.28319]; compound_0_spin [-6.28319, 6.28319]; compound_1_spin [-6.28319, 6.28319]; compound_2_spin [-6.28319, 6.28319]; output_spin [-6.2 | - |
| articraft__rec_jet_engine_926d0dbe3e974b68b2daedb78b28e03c | petal_0_hinge [0, 0.558505]; petal_1_hinge [0, 0.558505]; petal_2_hinge [0, 0.558505]; petal_3_hinge [0, 0.558505]; petal_4_hinge [0, 0.558505]; petal_5_hinge [ | mimic petal_1_hinge of petal_0_hinge; mimic petal_2_hinge of petal_0_hinge; mimic petal_3_hinge of petal_0_hinge |
| articraft__rec_air_pump_with_t_handle_6f5ba9052dc8401c9142c43f31d8e9de | frame_to_rod [0, 0.17]; frame_to_needle [-1.15, 1.15]; frame_to_button [0, 0.003] | - |
| articraft__rec_opposed_twinslide_gripper_ba2bda6616c74cc89a68f7d6c4d87caf | housing_to_jaw_0 [0, 0.025]; housing_to_jaw_1 [0, 0.025] | - |
| articraft__rec_robotic_arms_0001 | index_mcp_pitch [0, 1.2]; index_pip_pitch [0, 1.38]; index_dip_pitch [0, 1.05]; middle_mcp_pitch [0, 1.24]; middle_pip_pitch [0, 1.42]; middle_dip_pitch [0, 1.0 | - |
| articraft__rec_xyz_cartesian_stage_0003 | base_to_x [-0.16, 0.16]; x_to_y [-0.09, 0.09]; y_to_z [-0.055, 0.055] | - |
| articraft__rec_crane_tower_0001 | trolley_slide [0, 1.92] | - |
| package__mechanical_alarm_clock_r37 | - | gear_meshe time_barrel_center: not simulated (round 1); gear_meshe time_center_third: not simulated (round 1); gear_meshe time_third_fourth: not simulated (roun |
| package__rack_pinion_gate_r01 | - | connection module_5_rack_pinion_mesh (rack_pinion_mesh): not simulated (round 1) |
| package__four_bar_wiper_v1 | joint_0 [-0.2, 2.2]; joint_3 [-0.035, 0.506692] | - |

## Case id 对照

| short | full |
|---|---|
| f360__55627 | f360__55627_971fde61 |
| f360__56430 | f360__56430_4f35ba2f |
| f360__58066 | f360__58066_6e14ad68 |
| f360__53744 | f360__53744_eae4849e |
| f360__53631 | f360__53631_95d8fef3 |
| f360__56713 | f360__56713_c077e606 |
| f360__53060 | f360__53060_44095911 |
| f360__60738 | f360__60738_365811c2 |
| automate__57555ede | automate__57555edee4b0a0decb219237_2e956af37ef7be77add39161_55e0734829bec4ab2398a66a_default |
| automate__9657d303 | automate__9657d3031c46081679737420_9ac357d97a573f3a98dc5050_f1bf3a6ebcc306a2c5dfe811_default |
| automate__ab2d902d | automate__ab2d902d506ed87a0cc0cdee_ea1c399c251f13a331be7cce_05bc8260c358fe1f1ebbb333_default |
| automate__072a9a43 | automate__072a9a43dc902fcd281a8638_449d647ac759f51eb9b9a7c0_68fa8d720503d15c2a151214_default |
| automate__216064bc | automate__216064bc4968cdda13b3a608_b3cca79d64e03c00870e778f_c2daf93cd8f183d1dbd3f7cd_default |
| automate__7305d8b7 | automate__7305d8b7019d7e70217a2aa2_d49e7ae7039fce09ef95a492_c4287ae3556c17ac628a10f9_default |
| automate__109d26e5 | automate__109d26e59ad4988456731abe_da04eecfd84a25a151c465c8_009429e3967dd2b3d551bc70_default |
| automate__16a49d23 | automate__16a49d23b182c5334e31a17f_749e2e8c2aa43fbcfd08c8f5_364a5c85fc4d481b74a41577_default |
| articulate3d__89214f3ca0__8.1 | articulate3d__89214f3ca0__8.1 |
| articulate3d__7f4d173c9c__2.1 | articulate3d__7f4d173c9c__2.1 |
| articulate3d__281bc17764__4.1 | articulate3d__281bc17764__4.1 |
| articulate3d__27dd4da69e__24.1 | articulate3d__27dd4da69e__24.1 |
| articulate3d__0a184cf634__4.1 | articulate3d__0a184cf634__4.1 |
| articulate3d__50809ea0d8__7.1 | articulate3d__50809ea0d8__7.1 |
| articulate3d__8133208cb6__20.1 | articulate3d__8133208cb6__20.1 |
| articulate3d__faec2f0468__6.1 | articulate3d__faec2f0468__6.1 |
| articraft__rec_gear_assemblies_142e7f00a6734277b5f9bd587b2e2a5b | articraft__rec_gear_assemblies_142e7f00a6734277b5f9bd587b2e2a5b |
| articraft__rec_gear_assemblies_c734812ce04b4ae2bbf01bc5d56a225a | articraft__rec_gear_assemblies_c734812ce04b4ae2bbf01bc5d56a225a |
| articraft__rec_jet_engine_926d0dbe3e974b68b2daedb78b28e03c | articraft__rec_jet_engine_926d0dbe3e974b68b2daedb78b28e03c |
| articraft__rec_air_pump_with_t_handle_6f5ba9052dc8401c9142c43f31d8e9de | articraft__rec_air_pump_with_t_handle_6f5ba9052dc8401c9142c43f31d8e9de |
| articraft__rec_opposed_twinslide_gripper_ba2bda6616c74cc89a68f7d6c4d87caf | articraft__rec_opposed_twinslide_gripper_ba2bda6616c74cc89a68f7d6c4d87caf |
| articraft__rec_robotic_arms_0001 | articraft__rec_robotic_arms_0001 |
| articraft__rec_xyz_cartesian_stage_0003 | articraft__rec_xyz_cartesian_stage_0003 |
| articraft__rec_crane_tower_0001 | articraft__rec_crane_tower_0001 |
| package__mechanical_alarm_clock_r37 | package__mechanical_alarm_clock_r37 |
| package__rack_pinion_gate_r01 | package__rack_pinion_gate_r01 |
| package__four_bar_wiper_v1 | package__four_bar_wiper_v1 |
