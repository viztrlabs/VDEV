# SDD ledger — plan: docs/superpowers/plans/2026-10-02-marzipano-full-parity.md
BASE at start: 657f0c2 (plan committed as db43257)
Mode: inline execution (tightly coupled tasks; controller = implementer with per-task verification + scoped commits)

Task 1: complete (commit 05a74d6, 16/16 tests, tsc scoped clean). Deviation from plan: readHotspots MERGES defaultHotspots after canonical (no id collisions) instead of canonical-only-preference — discovered by Task 2's mixed-arrays test, strictly more lossless.
Task 2: complete (commit a36fe2b, 21/21 combined, tsc scoped clean)
Task 3: complete (commit e90aaf2, 21/21 combined, tsc scoped clean)
Task 4: complete (commit 3bc13c1, d.ts rewritten + api-probe, tsc scoped clean)
Task 5: complete (commit c8e24e8, 4/4 tests — fixes public-viewer blank screen)
Task 6: complete (commit b9a4663, 2/2 tests)
Task 7: complete (commit fd0c160, 7/7 tests)
Task 8: complete (commit 72c56ab, 7/7 tests)
Task 9: complete (commit 126fb4e, 11/11 tests)
Task 10: complete (commit 65d52d1, 5/5 tests)
Task 11: complete (commit 8342072, 4/4 tests)
Task 12: complete (commit ace6abc, 3/3 tests, qrcode + @types/qrcode installed)
Task 13: complete (commit 47a9847, Task 5 baseline tests pass unchanged, tsc scoped clean)
Task 14: complete (commit 728e097, 2/2 tests)
Task 15: complete (commit 253dbe7, 5/5 tests; fixed infinite render loop — engine obj removed from projected effect deps)
Task 16: complete (commit 0efd134, 5/5 tests)
Task 17: complete (commits 26950b4 + 676ab29, 3/3 tests; tileUrl dropped from hotspot patch — not a TourHotspot field)
Task 18: complete (commit 5b03007 — NOTE: commit includes pre-existing uncommitted shell work from another stream; my preview edits are interwoven with it and tsc/jest pass)

Task 19: complete (commit 2a83b9a) — verification + browser-found fixes:
- Baselines held: full jest 15 failed/11 failed suites (740 passed, +2 new tests), scoped tsc clean (539 total = pre-existing), safe-build passes.
- Runtime bugs found via playwright e2e against temp public copy of tour 911be3c8 (slug zz-smoke-test-tour) and fixed: fromTileUrl nonexistent (real API = fromString template), zoomBy fovRange/fov(value) no-ops (setFov + viewConstraints clamp), hotspot sync race vs async switchTo (activatedSceneId gate + idempotent sync sig), positionless legacy hotspots hidden behind camera (fallback to scene initial view), point+targetRoomId nav on public page, share URL roomId bug (tourId prop), TourViewer keyboard/shared-sync getter-as-setter no-ops (setYaw/setPitch), MessagingAgent overlay covering viewer controls (hide on /virtual-tour; NOTE: that file swept another stream's uncommitted pathname restructure — inseparable, same situation as Task 18).
- E2E results post-fix: scene menu 18 items + switch keeps canvas alive, point hotspot click -> nav, room_link click -> nav, zoom/autorotate/share(dlg+QR)/gyro buttons all toggle without errors. Pre-existing homepage regex error ignored per baseline.
- Left for manual checks (need builder auth in browser): builder preview mode + hotspot editor wiring (unit-tested), mobile gyroscope sensor behavior, QR scan.
