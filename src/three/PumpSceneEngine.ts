import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { buildAllBottles, buildPourRig, type BottleUnit, type PourRig } from './buildBottles';
import { buildPumpAssembly, type PumpAssembly } from './buildPump';
import { createProceduralTextures, type ProceduralTextureSet } from './textures';
import type { BottleIndex, DropPhase, PumpFinish, SceneControlState, SceneId } from './types';
import type { MotionCamera, MotionScript, MotionShot } from '../motion/types';

interface SectionVisualConfig {
  side: number; // +1 right, -1 left, 0 center
  showBottle: boolean;
  showCarouselWings: boolean;
  allowStream: boolean;
  baseRotY: number;
  assemble: boolean;
  spin: boolean;
  recede: boolean;
}

const SECTION_CONFIG: Record<SceneId, SectionVisualConfig> = {
  hero: {
    side: 1,
    showBottle: true,
    showCarouselWings: false,
    allowStream: true,
    baseRotY: -0.52,
    assemble: false,
    spin: false,
    recede: false,
  },
  bottles: {
    side: 1,
    showBottle: true,
    showCarouselWings: true,
    allowStream: true,
    baseRotY: -0.46,
    assemble: false,
    spin: false,
    recede: false,
  },
  assembly: {
    side: -1,
    showBottle: false,
    showCarouselWings: false,
    allowStream: false,
    baseRotY: -0.55,
    assemble: true,
    spin: false,
    recede: false,
  },
  features: {
    side: -1,
    showBottle: false,
    showCarouselWings: false,
    allowStream: false,
    baseRotY: -0.55,
    assemble: false,
    spin: true,
    recede: false,
  },
  install: {
    side: 1,
    showBottle: true,
    showCarouselWings: false,
    allowStream: false,
    baseRotY: -0.88,
    assemble: false,
    spin: false,
    recede: false,
  },
  real: {
    side: 0,
    showBottle: false,
    showCarouselWings: false,
    allowStream: false,
    baseRotY: -0.55,
    assemble: false,
    spin: true,
    recede: true,
  },
  order: {
    side: 1,
    showBottle: true,
    showCarouselWings: false,
    allowStream: true,
    baseRotY: -0.52,
    assemble: false,
    spin: false,
    recede: false,
  },
};

// Motion AI: per-action stage setup while a motion script is playing
function directorConfig(shot: MotionShot): SectionVisualConfig {
  const a = shot.action;
  return {
    side: 0,
    showBottle: a !== 'assemble' && a !== 'explode' && a !== 'spin',
    showCarouselWings: false,
    allowStream: a === 'pour',
    baseRotY: -0.52,
    assemble: false,
    spin: a === 'spin',
    recede: false,
  };
}

function defaultCamera(shot: MotionShot): MotionCamera {
  if (shot.camera) return shot.camera;
  if (shot.action === 'closeup') return 'close';
  if (shot.action === 'orbit') return 'orbit';
  return 'wide';
}

export interface DirectorStatus {
  index: number;
  shot: MotionShot;
  shotProgress: number; // 0..1
  progress: number; // 0..1 over whole script
  caption: string;
}

export type AfterRenderHook = (canvas: HTMLCanvasElement, status: DirectorStatus | null) => void;

export interface PumpSceneCallbacks {
  onPhaseChange?: (phase: DropPhase) => void;
  onDirectorShot?: (index: number, shot: MotionShot) => void;
  onDirectorEnd?: () => void;
  onDirectorFinish?: (finish: PumpFinish) => void;
  onBottleCycle?: (bottle: BottleIndex) => void;
  onPumpClick?: () => void;
  onContextLost?: (lost: boolean) => void;
}

// Reusable scratch vectors (zero per-frame GC allocation)
const _tipWorld = new THREE.Vector3();
const _ndc = new THREE.Vector2();

function detectSoftwareWebGL(): boolean {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export class PumpSceneEngine {
  private container: HTMLElement;
  private stateRef: { current: SceneControlState };
  private callbacks: PumpSceneCallbacks;
  private isSoftwareGl: boolean;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private stage: THREE.Group;
  private pedestalMesh: THREE.Mesh;
  private pedestalMat: THREE.MeshBasicMaterial;
  private textures: ProceduralTextureSet;
  private pump: PumpAssembly;
  private bottles: [BottleUnit, BottleUnit, BottleUnit];
  private pourRig: PourRig;
  private bubbles: THREE.Points;
  private bubbleGeo: THREE.BufferGeometry;
  private bubblePos: Float32Array;
  private bubbleSpeed: Float32Array;
  private bubbleCount = 280;
  private raycaster = new THREE.Raycaster();
  private envTexture: THREE.Texture;

  private disposed = false;
  private frameId = 0;
  private clock = new THREE.Clock();
  private elapsed = 0;

  // Pointer parallax
  private pointerX = 0;
  private pointerY = 0;

  // Animated kinematics state
  private currentFinish: PumpFinish = 'white';
  private seatedBottle: BottleIndex = 0;
  private prevBottle: BottleIndex = 0;
  private targetBottle: BottleIndex = 0;
  private dropTransition = 1; // 1 = seated, 0..1 = lift -> swap -> drop
  private dropDuration = 1.48;
  private impactPulse = 0; // 0..1 expanding neck-lock cyan ring
  private buttonPressPulse = 0;
  private waterImpactRipple = 0;
  private autoDropClock = 0;
  private lastReportedPhase: DropPhase = 'seated';

  private anim = {
    explode: 0,
    rotY: -0.52,
    pumpY: 3.18,
    tubeLen: 3.06,
    stageX: 2.4,
    dist: 11.8,
    camY: 2.75,
    streamOn: 0,
    recede: 0,
    glassFill: 0.16,
  };

  // Motion AI director state
  private director: {
    script: MotionScript;
    index: number;
    t: number;
    done: number; // seconds of finished shots
    total: number;
  } | null = null;
  private directorStatus: DirectorStatus | null = null;
  private afterRenderHook: AfterRenderHook | null = null;
  /** Extra camera distance while recording a narrow 9:16 reel. */
  public framingBoost = 1;

  private bottleAnim: Array<{ x: number; z: number; scale: number; vis: number }> = [
    { x: 0, z: 0, scale: 1, vis: 1 },
    { x: 3.8, z: -2.2, scale: 0.65, vis: 0 },
    { x: -3.8, z: -2.2, scale: 0.65, vis: 0 },
  ];

  constructor(
    container: HTMLElement,
    stateRef: { current: SceneControlState },
    callbacks: PumpSceneCallbacks = {},
  ) {
    this.container = container;
    this.stateRef = stateRef;
    this.callbacks = callbacks;
    this.isSoftwareGl = detectSoftwareWebGL();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2),
    );
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x030b17, 0.024);

    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 140);
    this.camera.position.set(0, 2.7, 12);

    // Procedural Studio Environment Map (RoomEnvironment on every device)
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = this.envTexture;
    pmrem.dispose();

    // Balanced 3-Point Warm/Cool Studio Rig
    const hemi = new THREE.HemisphereLight(0xcbeeff, 0x071730, 0.72);
    this.scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff6ea, 1.85);
    keyLight.position.set(5.5, 9.5, 6.5);
    if (!this.isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 26;
      const d = 6;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x22c7ff, 2.8, 28, 1.4);
    rimLight.position.set(-5.2, 4.6, -4.4);
    this.scene.add(rimLight);

    const fillLight = new THREE.PointLight(0x3b82f6, 1.35, 24, 1.5);
    fillLight.position.set(5.2, 1.8, 4.8);
    this.scene.add(fillLight);

    // Studio Softbox RectAreaLight on hardware GPU for crisp chrome & polycarbonate highlights
    if (!this.isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const softbox = new THREE.RectAreaLight(0xe0f7ff, 2.6, 5.0, 2.5);
      softbox.position.set(0, 6.2, 5.2);
      softbox.lookAt(0, 2.2, 0);
      this.scene.add(softbox);
    }

    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    this.textures = createProceduralTextures(maxAniso);

    // Stage group (holds pedestal, bottles, pump, and impact ring)
    this.stage = new THREE.Group();
    this.scene.add(this.stage);

    // Subtle grounded caustic studio floor disc at y = 0
    this.pedestalMat = new THREE.MeshBasicMaterial({
      map: this.textures.pedestalCaustic,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
    });
    this.pedestalMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(7.2, 7.2),
      this.pedestalMat,
    );
    this.pedestalMesh.rotation.x = -Math.PI / 2;
    this.pedestalMesh.position.y = 0.0;
    this.stage.add(this.pedestalMesh);

    // Build 3 photo-accurate bottle sizes
    this.bottles = buildAllBottles(this.textures, this.isSoftwareGl);
    this.bottles.forEach((b) => this.stage.add(b.root));

    // Build MOKHS composite pump
    this.pump = buildPumpAssembly(this.textures, !this.isSoftwareGl);
    this.stage.add(this.pump.root);

    // Build crystal glass tumbler, pouring water stream, splash droplets & neck-lock pulse
    this.pourRig = buildPourRig(this.textures);
    this.scene.add(this.pourRig.glassGroup);
    this.scene.add(this.pourRig.streamMesh);
    this.scene.add(this.pourRig.drops);
    this.stage.add(this.pourRig.impactRing);

    // Ambient floating aquatic bokeh bubbles in background depth
    this.bubblePos = new Float32Array(this.bubbleCount * 3);
    this.bubbleSpeed = new Float32Array(this.bubbleCount);
    for (let i = 0; i < this.bubbleCount; i++) {
      this.bubblePos[i * 3] = (Math.random() - 0.5) * 32;
      this.bubblePos[i * 3 + 1] = Math.random() * 28 - 9;
      this.bubblePos[i * 3 + 2] = -4.5 - Math.random() * 14;
      this.bubbleSpeed[i] = 0.16 + Math.random() * 0.45;
    }
    this.bubbleGeo = new THREE.BufferGeometry();
    this.bubbleGeo.setAttribute(
      'position',
      new THREE.BufferAttribute(this.bubblePos, 3),
    );
    this.bubbles = new THREE.Points(
      this.bubbleGeo,
      new THREE.PointsMaterial({
        size: 0.25,
        map: this.textures.bubble,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
      }),
    );
    this.bubbles.frustumCulled = false;
    this.scene.add(this.bubbles);

    // Raycaster checks only layer 1 (pump simplified hit proxy)
    this.raycaster.layers.set(1);

    // Initial finish & sizing
    this.currentFinish = this.stateRef.current.finish;
    this.pump.setFinish(this.currentFinish);
    this.handleResize();

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    // Event listeners
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
    window.addEventListener('click', this.handleWindowClick);
    this.renderer.domElement.addEventListener(
      'webglcontextlost',
      this.handleContextLost,
    );
    this.renderer.domElement.addEventListener(
      'webglcontextrestored',
      this.handleContextRestored,
    );

    // Kick off render loop
    this.clock.start();
    this.scheduleNextFrame();
  }

  private handleResize = () => {
    if (this.disposed) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  };

  private handlePointerMove = (e: PointerEvent) => {
    this.pointerX = e.clientX / Math.max(1, window.innerWidth) - 0.5;
    this.pointerY = e.clientY / Math.max(1, window.innerHeight) - 0.5;
  };

  private handleWindowClick = (e: MouseEvent) => {
    // Only trigger 3D pump click if user didn't click an interactive DOM control
    const target = e.target as HTMLElement | null;
    if (
      target &&
      target.closest('button, a, input, select, textarea, label, form, [data-ui-interactive]')
    ) {
      return;
    }
    _ndc.set(
      (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1,
      -(e.clientY / Math.max(1, window.innerHeight)) * 2 + 1,
    );
    this.raycaster.setFromCamera(_ndc, this.camera);
    const hits = this.raycaster.intersectObject(this.pump.hitProxy, false);
    if (hits.length > 0) {
      this.buttonPressPulse = 1;
      this.callbacks.onPumpClick?.();
    }
  };

  private handleContextLost = (event: Event) => {
    event.preventDefault();
    this.callbacks.onContextLost?.(true);
  };

  private handleContextRestored = () => {
    this.callbacks.onContextLost?.(false);
    this.scheduleNextFrame();
  };

  public triggerBottleDrop(nextBottle: BottleIndex) {
    if (nextBottle === this.targetBottle && this.dropTransition >= 0.99) {
      // Replay a crisp micro-drop bounce on the same bottle if user taps it again
      this.prevBottle = nextBottle;
      this.targetBottle = nextBottle;
      this.dropTransition = 0.52;
      return;
    }
    this.prevBottle = this.seatedBottle;
    this.targetBottle = nextBottle;
    this.dropTransition = 0;
    this.autoDropClock = 0;
  }

  public triggerButtonPress() {
    this.buttonPressPulse = 1;
  }

  // ---------------- Motion AI director ----------------
  public playMotion(script: MotionScript) {
    const total = script.shots.reduce((n, s) => n + s.duration, 0);
    this.director = { script, index: 0, t: 0, done: 0, total: Math.max(0.1, total) };
    this.startShot(script.shots[0], 0);
  }

  public stopMotion() {
    if (!this.director) return;
    this.director = null;
    this.directorStatus = null;
    this.callbacks.onDirectorEnd?.();
  }

  public isDirecting() {
    return this.director !== null;
  }

  public setAfterRender(hook: AfterRenderHook | null) {
    this.afterRenderHook = hook;
  }

  private startShot(shot: MotionShot, index: number) {
    const st = this.stateRef.current;
    if (shot.finish && shot.finish !== st.finish) {
      st.finish = shot.finish;
      this.callbacks.onDirectorFinish?.(shot.finish);
    }
    if (shot.bottle !== undefined) {
      if (shot.bottle !== st.activeBottle) {
        st.activeBottle = shot.bottle; // tick() launches the lift-swap-drop
        this.callbacks.onBottleCycle?.(shot.bottle);
      } else if (shot.action === 'drop') {
        // Same bottle: full lift and re-seat
        this.prevBottle = shot.bottle;
        this.targetBottle = shot.bottle;
        this.dropTransition = 0;
      }
    }
    if (shot.action === 'assemble') {
      this.anim.explode = 1; // assembly always starts from fully exploded parts
    }
    if (shot.action === 'reveal') {
      this.anim.recede = 1; // start below frame, rise up
    }
    if (shot.action === 'closeup' || shot.action === 'pour') {
      this.buttonPressPulse = 1;
    }
    this.callbacks.onDirectorShot?.(index, shot);
  }

  private updateDirector(dt: number): DirectorStatus | null {
    const d = this.director;
    if (!d) return null;
    d.t += dt;
    let shot = d.script.shots[d.index];
    while (d.t >= shot.duration) {
      d.t -= shot.duration;
      d.done += shot.duration;
      d.index += 1;
      if (d.index >= d.script.shots.length) {
        this.stopMotion();
        return null;
      }
      shot = d.script.shots[d.index];
      this.startShot(shot, d.index);
    }
    this.directorStatus = {
      index: d.index,
      shot,
      shotProgress: d.t / shot.duration,
      progress: Math.min(1, (d.done + d.t) / d.total),
      caption: shot.caption ?? '',
    };
    return this.directorStatus;
  }

  private reportPhase(phase: DropPhase) {
    if (phase !== this.lastReportedPhase) {
      this.lastReportedPhase = phase;
      this.callbacks.onPhaseChange?.(phase);
    }
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (!gl || typeof gl.fenceSync !== 'function') {
      this.frameId = window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) {
        if (sync) gl.deleteSync(sync);
        return;
      }
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private scheduleNextFrame() {
    if (this.disposed) return;
    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  }

  private tick = () => {
    if (this.disposed) return;

    const rawDt = this.clock.getDelta();
    const dt = Math.min(rawDt, 0.055);
    const st = this.stateRef.current;
    const motionScale = st.reducedMotion ? 0.25 : 1.0;
    this.elapsed += dt * motionScale;

    // Sync finish swap instantly
    if (st.finish !== this.currentFinish) {
      this.currentFinish = st.finish;
      this.pump.setFinish(this.currentFinish);
    }

    // Motion AI: advance the shot list (may change finish / bottle)
    const dir = this.updateDirector(dt);
    if (st.finish !== this.currentFinish) {
      this.currentFinish = st.finish;
      this.pump.setFinish(this.currentFinish);
    }

    // Sync active bottle change -> launch step-by-step drop sequence
    if (st.activeBottle !== this.targetBottle) {
      this.prevBottle = this.seatedBottle;
      this.targetBottle = st.activeBottle;
      this.dropTransition = 0;
      this.autoDropClock = 0;
    }

    // Auto-drop step-by-step cycle when user enables Auto-Drop
    if (st.autoDrop && this.dropTransition >= 1) {
      this.autoDropClock += dt;
      if (this.autoDropClock >= 3.2) {
        this.autoDropClock = 0;
        const next = ((this.targetBottle + 1) % 3) as BottleIndex;
        this.callbacks.onBottleCycle?.(next);
      }
    } else {
      this.autoDropClock = 0;
    }

    const cfg = dir ? directorConfig(dir.shot) : SECTION_CONFIG[st.activeSection];
    const isMobile = window.innerWidth < 900;

    // --- 1. Step-by-Step 3-Bottle Drop Kinematics ---
    let dropLiftOffset = 0;
    let phase: DropPhase = 'seated';

    if (this.dropTransition < 1) {
      const prevT = this.dropTransition;
      this.dropTransition = Math.min(1, this.dropTransition + dt / this.dropDuration);
      const p = this.dropTransition;

      // Crossed swap midpoint -> switch seated bottle reference
      if (prevT < 0.45 && p >= 0.45) {
        this.seatedBottle = this.targetBottle;
      }

      // Crossed touchdown impact point -> trigger cyan lock ring, button press & water ripple!
      if (prevT < 0.88 && p >= 0.88) {
        this.impactPulse = 1.0;
        this.waterImpactRipple = 1.0;
        this.buttonPressPulse = 0.85;
      }

      if (p < 0.32) {
        phase = 'lifting';
        // Smooth crisp lift off the departing bottle
        const u = smoothstep(0, 0.32, p);
        dropLiftOffset = u * 2.25;
      } else if (p < 0.58) {
        phase = 'swapping';
        // Hover steadily while bottles smoothly glide past each other
        const sway = Math.sin(((p - 0.32) / 0.26) * Math.PI) * 0.14;
        dropLiftOffset = 2.25 + sway;
      } else {
        phase = 'dropping';
        // Weighted downward plunge onto the target bottle neck with crisp spring settle
        const u = (p - 0.58) / 0.42;
        if (u < 0.78) {
          const d = u / 0.78;
          // Accelerating gravity-like drop into soft deceleration right before seat
          const easeInOut = d < 0.5 ? 2 * d * d : 1 - Math.pow(-2 * d + 2, 2) / 2;
          dropLiftOffset = (1 - easeInOut) * 2.25;
        } else {
          // Tiny tactile spring rebound right on the neck collar
          const b = (u - 0.78) / 0.22;
          dropLiftOffset = Math.sin(b * Math.PI) * 0.08 * (1 - b);
        }
      }
    } else {
      this.seatedBottle = this.targetBottle;
      phase = 'seated';
    }
    this.reportPhase(phase);

    // --- 2. Compute Target Pose for Pump, Tube, Assembly & Camera ---
    const activeBottleUnit = this.bottles[this.seatedBottle];
    const targetH = activeBottleUnit.height;

    let targetExplode = 0;
    let targetRotY =
      cfg.baseRotY + (st.reducedMotion ? 0 : Math.sin(this.elapsed * 0.55) * 0.12);
    let targetPumpY = cfg.showBottle ? activeBottleUnit.neckTopY : 0.42;

    if (cfg.assemble) {
      targetExplode = 1 - smoothstep(0.06, 0.88, st.assemblyProgress);
      targetRotY =
        -0.55 +
        st.assemblyProgress * Math.PI * 2 +
        Math.sin(this.elapsed * 0.45) * 0.32 * (1 - st.assemblyProgress);
    } else if (cfg.spin) {
      const spinSpeed = dir ? 1.7 * (dir.shot.speed ?? 1) : 1;
      targetRotY = this.anim.rotY + dt * 0.52 * (dir ? 1 : motionScale) * spinSpeed;
    } else {
      // Shortest angular path
      const twoPi = Math.PI * 2;
      targetRotY += twoPi * Math.round((this.anim.rotY - targetRotY) / twoPi);
    }

    // Motion AI overrides for exploded / assembly shots
    let dirExplodeShot = false;
    if (dir && (dir.shot.action === 'assemble' || dir.shot.action === 'explode')) {
      dirExplodeShot = true;
      const p = dir.shotProgress;
      targetExplode =
        dir.shot.action === 'assemble' ? 1 - smoothstep(0.05, 0.85, p) : smoothstep(0.08, 0.8, p);
      targetRotY = -0.55 + p * Math.PI * 1.3 * (dir.shot.speed ?? 1);
    }

    const dampK = cfg.assemble || dirExplodeShot ? 7.5 : 4.2;
    this.anim.explode = THREE.MathUtils.damp(this.anim.explode, targetExplode, dampK, dt);
    this.anim.rotY = cfg.spin
      ? targetRotY
      : THREE.MathUtils.damp(this.anim.rotY, targetRotY, dampK, dt);

    // Faster vertical adaptation during bottle swap so drop lands precisely on new neck height
    const pumpYDamp = this.dropTransition < 1 ? 8.5 : 4.5;
    this.anim.pumpY = THREE.MathUtils.damp(this.anim.pumpY, targetPumpY, pumpYDamp, dt);

    // Silicone dip tube retracts slightly during lift/swap and extends smoothly to new bottle floor on drop
    const targetTubeLen = cfg.showBottle
      ? phase === 'swapping'
        ? Math.min(activeBottleUnit.tubeLength, 1.55)
        : activeBottleUnit.tubeLength
      : 1.45;
    this.anim.tubeLen = THREE.MathUtils.damp(this.anim.tubeLen, targetTubeLen, 6.2, dt);
    this.anim.recede = THREE.MathUtils.damp(this.anim.recede, cfg.recede ? 1 : 0, 3.8, dt);

    const isSeatedAndReady =
      cfg.allowStream &&
      (dir ? true : st.pourEnabled) &&
      this.dropTransition >= 0.94 &&
      this.anim.explode < 0.05 &&
      Math.abs(this.anim.pumpY - targetPumpY) < 0.14;
    this.anim.streamOn = THREE.MathUtils.damp(
      this.anim.streamOn,
      isSeatedAndReady ? 1 : 0,
      7.5,
      dt,
    );

    // Framing math (keeps the 3D subject comfortably in its dedicated open lane)
    const totalHeight = cfg.showBottle
      ? targetH + 2.25 + dropLiftOffset * 0.22
      : 2.35 + 2.65 * this.anim.explode;
    const baseDist = Math.max(7.9, totalHeight * 2.02 + 1.35);
    const dirCam: MotionCamera | null = dir ? defaultCamera(dir.shot) : null;
    const camMul = dirCam === 'close' ? 0.56 : dirCam === 'low' ? 0.92 : dirCam === 'orbit' ? 0.96 : 1;
    const targetDist = dir
      ? baseDist * camMul * this.framingBoost
      : baseDist * (isMobile ? 1.24 : cfg.showCarouselWings ? 1.12 : 1.0);
    this.anim.dist = THREE.MathUtils.damp(this.anim.dist, targetDist, 3.6, dt);

    const visH = 2 * this.anim.dist * Math.tan(THREE.MathUtils.degToRad(17));
    const visW = visH * this.camera.aspect;
    let targetCamY =
      (cfg.showBottle ? totalHeight * 0.5 : 1.35 + 0.45 * this.anim.explode) -
      (isMobile && !dir ? visH * 0.14 : 0);
    if (dirCam === 'close') {
      targetCamY = this.anim.pumpY + dropLiftOffset + 1.0;
    }
    this.anim.camY = THREE.MathUtils.damp(this.anim.camY, targetCamY, 3.6, dt);

    const targetStageX = isMobile || dir ? 0 : cfg.side * visW * 0.215;
    this.anim.stageX = THREE.MathUtils.damp(this.anim.stageX, targetStageX, 3.8, dt);

    // Apply transforms to stage & pump
    this.stage.position.x = this.anim.stageX;
    this.stage.position.y = -this.anim.recede * 6.5;

    this.pump.root.position.y = this.anim.pumpY + dropLiftOffset;
    this.pump.root.rotation.y = this.anim.rotY;
    this.pump.root.rotation.z = st.reducedMotion
      ? 0
      : Math.sin(this.elapsed * 0.85) * 0.012 * (1 - this.anim.streamOn * 0.6);

    this.pump.setExplodeProgress(this.anim.explode);
    this.pump.tubeMesh.scale.y = this.anim.tubeLen;

    // Tactile top button press pulse
    if (this.buttonPressPulse > 0) {
      this.buttonPressPulse = Math.max(0, this.buttonPressPulse - dt * 3.4);
      this.pump.setButtonPressed(Math.sin(this.buttonPressPulse * Math.PI));
    } else {
      this.pump.setButtonPressed(0);
    }

    // Glowing cyan LED ring intensifies smoothly while pouring or locking
    const ledBase = st.pourEnabled ? 1.75 : 0.7;
    this.pump.ledMat.emissiveIntensity =
      ledBase +
      Math.sin(this.elapsed * 2.8) * 0.35 +
      this.anim.streamOn * 1.15 +
      this.impactPulse * 1.6;
    this.pump.ledLight.intensity = 1.1 + this.anim.streamOn * 1.2 + this.impactPulse * 1.5;

    // Ground pedestal visibility
    this.pedestalMat.opacity = cfg.showBottle ? 0.82 * (1 - this.anim.recede) : 0.28;

    // Camera with smooth pointer parallax
    this.camera.position.set(
      this.pointerX * 0.72,
      this.anim.camY - this.pointerY * 0.42 + 0.55,
      this.anim.dist,
    );
    this.camera.lookAt(0, this.anim.camY, 0);

    // Motion AI cinematic cameras
    if (dir && dirCam) {
      const D = this.anim.dist;
      const y = this.anim.camY;
      if (dirCam === 'orbit') {
        const a = -0.7 + dir.shotProgress * Math.PI * 1.1 * (dir.shot.speed ?? 1);
        this.camera.position.set(Math.sin(a) * D, y + 0.9, Math.cos(a) * D);
        this.camera.lookAt(0, y, 0);
      } else if (dirCam === 'low') {
        this.camera.position.set(D * 0.18, y - visH * 0.3, D * 0.98);
        this.camera.lookAt(0, y + 0.35, 0);
      } else if (dirCam === 'top') {
        this.camera.position.set(D * 0.12, y + D * 0.55, D * 0.84);
        this.camera.lookAt(0, y - 0.2, 0);
      } else {
        // wide / close: slow push-in for life
        const push = 1 - dir.shotProgress * 0.06;
        this.camera.position.set(D * 0.1 * (1 - dir.shotProgress), y + 0.45, D * push);
        this.camera.lookAt(0, y, 0);
      }
    }

    // --- 3. 3-Bottle Carousel & Visibility Kinematics ---
    for (let i = 0; i < 3; i++) {
      const b = this.bottles[i];
      const ba = this.bottleAnim[i];
      const isTarget = i === this.seatedBottle;

      let goalX = 0;
      let goalZ = 0;
      let goalScale = 1.0;
      let goalVis = 0;

      if (cfg.showBottle) {
        if (isTarget) {
          // If we are mid-swap incoming, glide cleanly in from the side
          if (this.dropTransition < 0.62 && this.prevBottle !== this.targetBottle) {
            const slideIn = smoothstep(0.32, 0.6, this.dropTransition);
            const slideDir = this.targetBottle > this.prevBottle ? 1 : -1;
            goalX = (1 - slideIn) * slideDir * 3.6;
            goalZ = (1 - slideIn) * -1.4;
            goalScale = 0.78 + 0.22 * slideIn;
            goalVis = 0.25 + 0.75 * slideIn;
          } else {
            goalX = 0;
            goalZ = 0;
            goalScale = 1.0;
            goalVis = 1.0;
          }
        } else if (cfg.showCarouselWings && !isMobile) {
          // Show the other 2 bottle sizes flanking cleanly on stage wings for instant size comparison!
          const relOffset = i - this.seatedBottle;
          // Place non-active bottles cleanly to the left/right back wings
          const wingDir = relOffset > 0 ? 1 : -1;
          const farShift = Math.abs(relOffset) === 2 ? 1.35 : 1.0;
          goalX = wingDir * 2.95 * farShift;
          goalZ = -2.35;
          goalScale = 0.64;
          goalVis = 0.34;
        } else {
          const sideDir = i > this.seatedBottle ? 1 : -1;
          goalX = sideDir * 3.4;
          goalZ = -1.6;
          goalScale = 0.74;
          goalVis = 0;
        }
      }

      ba.x = THREE.MathUtils.damp(ba.x, goalX, 6.2, dt);
      ba.z = THREE.MathUtils.damp(ba.z, goalZ, 6.2, dt);
      ba.scale = THREE.MathUtils.damp(ba.scale, goalScale, 6.2, dt);
      ba.vis = THREE.MathUtils.damp(ba.vis, goalVis, 6.8, dt);

      b.root.position.set(ba.x, 0, ba.z);
      b.root.scale.setScalar(ba.scale);
      b.setVisibilityFactor(ba.vis * (1 - this.anim.recede));

      // Gentle alive liquid shimmer + impact slosh ripple when pump lands!
      const rippleAmp = isTarget ? 0.006 + this.waterImpactRipple * 0.032 : 0.004;
      b.waterGroup.scale.y = 1 + Math.sin(this.elapsed * 2.1 + i * 1.7) * rippleAmp;
      b.meniscus.rotation.z = this.elapsed * 0.4;
    }

    if (this.waterImpactRipple > 0) {
      this.waterImpactRipple = Math.max(0, this.waterImpactRipple - dt * 1.9);
    }

    // --- 4. Cyan Neck-Lock Impact Pulse Ring ---
    if (this.impactPulse > 0) {
      this.impactPulse = Math.max(0, this.impactPulse - dt * 1.85);
      const u = 1 - this.impactPulse;
      this.pourRig.impactRing.visible = true;
      this.pourRig.impactRing.position.set(0, activeBottleUnit.neckTopY + 0.14, 0);
      this.pourRig.impactRing.scale.setScalar(1 + u * 2.8);
      this.pourRig.impactRingMat.opacity = Math.sin(this.impactPulse * Math.PI) * 0.85;
    } else {
      this.pourRig.impactRing.visible = false;
    }

    // --- 5. Crystal Tumbler, Pour Stream & Splash Droplets ---
    this.scene.updateMatrixWorld();
    this.pump.tipAnchor.getWorldPosition(_tipWorld);

    const gs = this.anim.streamOn;
    const {
      glassGroup,
      glassMat,
      glassWaterMesh,
      glassWaterMat,
      glassMeniscus,
      streamMesh,
      streamMat,
      dropPos,
      dropVel,
      dropLife,
      dropGeo,
      dropCount,
    } = this.pourRig;

    glassGroup.visible = gs > 0.02;
    const gScale = 0.68 + 0.32 * gs;
    glassGroup.scale.setScalar(gScale);
    glassGroup.position.set(_tipWorld.x, _tipWorld.y - 1.82, _tipWorld.z);
    glassMat.opacity = 0.26 * gs;
    glassWaterMat.opacity = 0.62 * gs;
    (glassMeniscus.material as THREE.MeshBasicMaterial).opacity = 0.68 * gs;

    if (gs > 0.55) {
      this.anim.glassFill += dt * 0.13 * motionScale;
      if (this.anim.glassFill > 0.88) {
        this.anim.glassFill = 0.12;
      }
    }
    glassWaterMesh.scale.y = this.anim.glassFill;
    glassMeniscus.position.y = -0.45 + this.anim.glassFill;

    const waterSurfaceY = glassGroup.position.y + (-0.45 + this.anim.glassFill) * gScale;
    streamMesh.visible = gs > 0.05;
    streamMesh.position.copy(_tipWorld);
    const streamLen = Math.max(0.02, _tipWorld.y - waterSurfaceY);
    const streamPulse = 1 + Math.sin(this.elapsed * 22) * 0.08;
    streamMesh.scale.set(streamPulse, streamLen, streamPulse);
    streamMat.opacity = 0.72 * gs;

    // Gravity-driven splash droplets bouncing off the rising water surface
    for (let i = 0; i < dropCount; i++) {
      const idx = i * 3;
      if (dropLife[i] < 0) {
        if (gs > 0.6 && Math.random() < 0.38) {
          dropLife[i] = 0;
          dropPos[idx] = _tipWorld.x + (Math.random() - 0.5) * 0.045;
          dropPos[idx + 1] = _tipWorld.y;
          dropPos[idx + 2] = _tipWorld.z + (Math.random() - 0.5) * 0.045;
          dropVel[idx] = (Math.random() - 0.5) * 0.14;
          dropVel[idx + 1] = -1.75;
          dropVel[idx + 2] = (Math.random() - 0.5) * 0.14;
        }
        continue;
      }
      dropLife[i] += dt;
      dropVel[idx + 1] -= 9.8 * dt;
      dropPos[idx] += dropVel[idx] * dt;
      dropPos[idx + 1] += dropVel[idx + 1] * dt;
      dropPos[idx + 2] += dropVel[idx + 2] * dt;

      if (dropPos[idx + 1] < waterSurfaceY) {
        if (dropVel[idx + 1] < -2.1 && Math.random() < 0.55) {
          dropVel[idx + 1] = 1.1 + Math.random() * 0.9;
          dropVel[idx] = (Math.random() - 0.5) * 1.15;
          dropVel[idx + 2] = (Math.random() - 0.5) * 1.15;
          dropPos[idx + 1] = waterSurfaceY + 0.015;
        } else {
          dropLife[i] = -1;
          dropPos[idx + 1] = -999;
        }
      }
    }
    dropGeo.attributes.position.needsUpdate = true;

    // Gentle rising aquatic bokeh bubbles in background
    for (let i = 0; i < this.bubbleCount; i++) {
      const idx = i * 3;
      this.bubblePos[idx + 1] += this.bubbleSpeed[i] * dt * motionScale;
      this.bubblePos[idx] += Math.sin(this.elapsed * 0.8 + i) * 0.0018 * motionScale;
      if (this.bubblePos[idx + 1] > 19) {
        this.bubblePos[idx + 1] = -9;
      }
    }
    this.bubbleGeo.attributes.position.needsUpdate = true;
    this.bubbles.position.y = -st.scrollY * 0.0018;

    this.renderer.render(this.scene, this.camera);
    if (this.afterRenderHook) {
      this.afterRenderHook(this.renderer.domElement, this.directorStatus);
    }
    this.scheduleNextFrame();
  };

  public dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('click', this.handleWindowClick);
    this.renderer.domElement.removeEventListener(
      'webglcontextlost',
      this.handleContextLost,
    );
    this.renderer.domElement.removeEventListener(
      'webglcontextrestored',
      this.handleContextRestored,
    );

    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });

    this.textures.dispose();
    this.envTexture.dispose();
    this.renderer.dispose();

    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
