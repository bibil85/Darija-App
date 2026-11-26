/**
 * ToddlerUXGuard — Dedicated Toddler-Proof Touch & Ergonomics Layer for Ages 1–3 on iPad Safari.
 *
 * Responsibilities:
 * 1. Palm & Edge-Rest Rejection:
 *    - Ignores `pointerdown` originating inside a 24px dead-zone along the bottom, left, and right
 *      screen edges (or oversized palm contact patches) unless the finger deliberately drags inward.
 *    - Tracks each `pointerId` independently so a resting palm never blocks active multi-touch taps!
 * 2. Anti-Mash Per-Object Debounce:
 *    - Enforces a 120ms cooldown per 3D object ID so jittery toddler taps never double-fire one item,
 *      while simultaneous multi-finger taps across DIFFERENT objects trigger immediately!
 * 3. Generous Tap Slop (< 25px):
 *    - Converts small accidental finger slips (< 25px movement) into clean taps rather than failed drags.
 * 4. Idle Attention Timer (5s):
 *    - Tracks seconds since last meaningful touch so the 3D scene can gently display diegetic
 *      3D visual signposting (glowing 3D pointer hand & pulsing target ring) after 5s of inactivity.
 * 5. iPad Safari Gesture Lockdown:
 *    - Suppresses accidental pinch-zoom (`gesturestart`/`gesturechange`) and multi-touch browser gestures.
 */

interface TrackedPointer {
  pointerId: number;
  startX: number;
  startY: number;
  isEdgeDeferred: boolean;
  isPalmRejected: boolean;
}

export const TODDLER_UX_CONFIG = {
  /** 24px bezel dead-zone along left, right, and bottom screen edges */
  EDGE_DEADZONE_PX: 24,
  /** Inward drag distance required to promote an edge-started touch to active */
  EDGE_PROMOTE_DRAG_PX: 18,
  /** Contact patch width/height (px) indicative of a resting palm on iPad */
  PALM_CONTACT_PX: 62,
  /** Per-object anti-mash debounce window in ms */
  OBJECT_COOLDOWN_MS: 120,
  /** Movement under 25px counts as a clean tap instead of a failed drag */
  TAP_SLOP_PX: 25,
  /** Hitbox inflation multiplier (+30% beyond visual mesh bounds) */
  HITBOX_FORGIVENESS_SCALE: 1.3,
  /** Idle seconds before diegetic 3D pointer hand & target pulse appear */
  IDLE_HINT_SECONDS: 5.0,
  /** Parent-gate hold duration for protected navigation controls */
  PARENT_GATE_HOLD_MS: 1500,
} as const;

class ToddlerUXGuardImpl {
  private pointers = new Map<number, TrackedPointer>();
  private objectCooldowns = new Map<string, number>();
  private lastActivityMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
  private viewportLockInstalled = false;

  /** Install global iPad Safari gesture lockdown listeners (pinch-zoom, context menu, double-tap zoom) */
  installViewportLock(): () => void {
    if (typeof window === 'undefined' || this.viewportLockInstalled) {
      return () => {};
    }
    this.viewportLockInstalled = true;

    const preventDefault = (e: Event) => {
      e.preventDefault();
    };

    // Safari iOS proprietary pinch-zoom gesture events
    window.addEventListener('gesturestart', preventDefault, { passive: false });
    window.addEventListener('gesturechange', preventDefault, { passive: false });
    window.addEventListener('gestureend', preventDefault, { passive: false });
    window.addEventListener('contextmenu', preventDefault);

    // Prevent iOS Safari accidental double-tap zoom while allowing rapid taps on canvas/buttons
    let lastTouchEnd = 0;
    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 280) {
        // Only suppress default browser double-tap zoom; pointer events still fire cleanly!
        if ((e.target as HTMLElement | null)?.tagName === 'CANVAS') {
          e.preventDefault();
        }
      }
      lastTouchEnd = now;
    };
    window.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      this.viewportLockInstalled = false;
      window.removeEventListener('gesturestart', preventDefault);
      window.removeEventListener('gesturechange', preventDefault);
      window.removeEventListener('gestureend', preventDefault);
      window.removeEventListener('contextmenu', preventDefault);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }

  /** Check whether a client coordinate lies in the 24px bottom/left/right iPad bezel dead-zone */
  isInEdgeDeadZone(clientX: number, clientY: number, width: number, height: number): boolean {
    const margin = TODDLER_UX_CONFIG.EDGE_DEADZONE_PX;
    return clientX < margin || clientX > width - margin || clientY > height - margin;
  }

  /** Check whether PointerEvent contact geometry looks like a flat resting palm on iPad */
  isLikelyPalm(e: PointerEvent): boolean {
    if (e.pointerType !== 'touch') return false;
    const w = e.width || 0;
    const h = e.height || 0;
    return w >= TODDLER_UX_CONFIG.PALM_CONTACT_PX || h >= TODDLER_UX_CONFIG.PALM_CONTACT_PX;
  }

  /**
   * Evaluate a `pointerdown` event on the 3D stage.
   * Returns `true` if the touch is accepted immediately, or `false` if deferred (edge/palm rest).
   * Note: Rejected/deferred pointers are tracked separately so other simultaneous fingers still work!
   */
  evaluatePointerDown(e: PointerEvent, width: number, height: number): boolean {
    const palm = this.isLikelyPalm(e);
    const edge = !palm && this.isInEdgeDeadZone(e.clientX, e.clientY, width, height);

    this.pointers.set(e.pointerId, {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      isEdgeDeferred: edge,
      isPalmRejected: palm,
    });

    if (palm || edge) {
      return false;
    }

    this.recordActivity();
    return true;
  }

  /**
   * Evaluate a `pointermove` event.
   * - If the pointer was palm-rejected, continues ignoring it without blocking other fingers.
   * - If the pointer was edge-deferred and dragged clearly inward past the 24px bezel, promotes it
   *   and returns `'promote'` so SceneManager dispatches a clean activation!
   */
  evaluatePointerMove(
    e: PointerEvent,
    width: number,
    height: number
  ): 'active' | 'promote' | 'ignore' {
    const tracked = this.pointers.get(e.pointerId);
    if (!tracked) return 'active';
    if (tracked.isPalmRejected) return 'ignore';

    if (tracked.isEdgeDeferred) {
      const moved = Math.hypot(e.clientX - tracked.startX, e.clientY - tracked.startY);
      const stillInEdge = this.isInEdgeDeadZone(e.clientX, e.clientY, width, height);
      if (!stillInEdge && moved >= TODDLER_UX_CONFIG.EDGE_PROMOTE_DRAG_PX) {
        tracked.isEdgeDeferred = false;
        this.recordActivity();
        return 'promote';
      }
      return 'ignore';
    }

    this.recordActivity();
    return 'active';
  }

  /** Evaluate `pointerup` / `pointercancel`. Returns `true` only if this pointer was active. */
  evaluatePointerUp(e: PointerEvent): boolean {
    const tracked = this.pointers.get(e.pointerId);
    this.pointers.delete(e.pointerId);
    if (!tracked) return true;
    return !tracked.isPalmRejected && !tracked.isEdgeDeferred;
  }

  /**
   * Per-object anti-mash debounce (120ms default).
   * Simultaneous multi-finger hits on DIFFERENT objectKeys succeed immediately;
   * rapid double-taps on the SAME objectKey within 120ms are cleanly filtered out.
   */
  canTriggerObject(objectKey: string, cooldownMs: number = TODDLER_UX_CONFIG.OBJECT_COOLDOWN_MS): boolean {
    const now = performance.now();
    const last = this.objectCooldowns.get(objectKey) ?? -Infinity;
    if (now - last < cooldownMs) {
      return false;
    }
    this.objectCooldowns.set(objectKey, now);

    // Periodically prune stale keys so map never grows unbounded
    if (this.objectCooldowns.size > 160) {
      for (const [k, ts] of this.objectCooldowns.entries()) {
        if (now - ts > 4000) this.objectCooldowns.delete(k);
      }
    }
    return true;
  }

  /** Clear per-object cooldowns when switching scenes/rounds */
  resetObjectCooldowns() {
    this.objectCooldowns.clear();
  }

  /** Forgiving toddler tap detection: accidental finger slips < 25px count as clean taps */
  isTapGesture(startX: number, startY: number, endX: number, endY: number): boolean {
    return Math.hypot(endX - startX, endY - startY) < TODDLER_UX_CONFIG.TAP_SLOP_PX;
  }

  /** Record meaningful child interaction (resets 5-second idle hint timer) */
  recordActivity() {
    this.lastActivityMs = performance.now();
  }

  /** Seconds elapsed since the child's last touch */
  getIdleSeconds(): number {
    return Math.max(0, (performance.now() - this.lastActivityMs) / 1000);
  }

  /** True when the child has been inactive for >= 5s and should see a gentle 3D visual hint */
  isIdleHintActive(): boolean {
    return this.getIdleSeconds() >= TODDLER_UX_CONFIG.IDLE_HINT_SECONDS;
  }
}

export const ToddlerUXGuard = new ToddlerUXGuardImpl();
