import * as THREE from 'three';
import type { ProceduralTextureSet } from './textures';

export interface BottleUnit {
  root: THREE.Group;
  height: number;
  neckTopY: number;
  tubeLength: number;
  radius: number;
  waterGroup: THREE.Group;
  meniscus: THREE.Mesh;
  materials: Array<{ mat: THREE.Material; baseOpacity: number }>;
  shadowMat: THREE.MeshBasicMaterial;
  setVisibilityFactor: (vis: number) => void;
}

interface BottleGeometryConfig {
  radius: number;
  height: number;
  neckRadius: number;
  neckHeight: number;
  shoulderHeight: number;
  tintHex: number;
  waterHex: number;
  fillHeight: number;
  ribs?: number[];
  hasHandle?: boolean;
  hasLabel?: boolean;
  hasNeckAdapter?: boolean;
}

function createSingleBottle(
  cfg: BottleGeometryConfig,
  textures: ProceduralTextureSet,
  isSoftwareGl: boolean,
): BottleUnit {
  const root = new THREE.Group();
  const materials: Array<{ mat: THREE.Material; baseOpacity: number }> = [];

  const registerMat = <T extends THREE.Material>(mat: T, baseOpacity: number): T => {
    mat.transparent = true;
    mat.opacity = baseOpacity;
    materials.push({ mat, baseOpacity });
    return mat;
  };

  // Outer bottle shell profile (pivoted cleanly at y = 0)
  const { radius: R, height: H, neckRadius: nR, neckHeight: nH, shoulderHeight: sh } = cfg;
  const pts: THREE.Vector2[] = [
    new THREE.Vector2(0.005, 0.01),
    new THREE.Vector2(R - 0.12, 0.01),
    new THREE.Vector2(R - 0.02, 0.08),
    new THREE.Vector2(R, 0.2),
    new THREE.Vector2(R, H - nH - sh),
  ];

  for (let i = 1; i <= 18; i++) {
    const t = i / 18;
    const x = nR + (R - nR) * (0.5 + 0.5 * Math.cos(t * Math.PI));
    const y = H - nH - sh + sh * t;
    pts.push(new THREE.Vector2(x, y));
  }
  pts.push(new THREE.Vector2(nR, H));
  pts.push(new THREE.Vector2(nR + 0.032, H - 0.02));

  const shellMat = registerMat(
    new THREE.MeshPhysicalMaterial({
      color: cfg.tintHex,
      roughness: 0.06,
      metalness: 0.02,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      ior: 1.48,
      reflectivity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false,
      envMapIntensity: isSoftwareGl ? 1.15 : 1.35,
    }),
    0.27,
  );
  const shellMesh = new THREE.Mesh(new THREE.LatheGeometry(pts, 72), shellMat);
  shellMesh.renderOrder = 3;
  root.add(shellMesh);

  // Inner animated water volume
  const waterGroup = new THREE.Group();
  const wR = R * 0.945;
  const wPts: THREE.Vector2[] = [
    new THREE.Vector2(0.005, 0.045),
    new THREE.Vector2(wR - 0.08, 0.045),
    new THREE.Vector2(wR, 0.14),
    new THREE.Vector2(wR, cfg.fillHeight),
    new THREE.Vector2(0.005, cfg.fillHeight),
  ];
  const waterMat = registerMat(
    new THREE.MeshPhysicalMaterial({
      color: cfg.waterHex,
      emissive: 0x073270,
      emissiveIntensity: 0.42,
      roughness: 0.08,
      metalness: 0.04,
      clearcoat: 0.8,
      depthWrite: false,
    }),
    0.46,
  );
  const waterMesh = new THREE.Mesh(new THREE.LatheGeometry(wPts, 64), waterMat);
  waterMesh.renderOrder = 1;
  waterGroup.add(waterMesh);

  // Shimmering water top meniscus surface
  const meniscusMat = registerMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x7dd3fc,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.35,
      roughness: 0.06,
      metalness: 0.1,
      depthWrite: false,
    }),
    0.58,
  );
  const meniscus = new THREE.Mesh(new THREE.CircleGeometry(wR * 0.99, 56), meniscusMat);
  meniscus.rotation.x = -Math.PI / 2;
  meniscus.position.y = cfg.fillHeight + 0.005;
  meniscus.renderOrder = 2;
  waterGroup.add(meniscus);
  root.add(waterGroup);

  // Horizontal reinforcement ribs (for 5-gallon barrel)
  if (cfg.ribs) {
    const ribMat = registerMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xb8e6ff,
        roughness: 0.08,
        clearcoat: 1.0,
        depthWrite: false,
      }),
      0.42,
    );
    cfg.ribs.forEach((y) => {
      const rib = new THREE.Mesh(new THREE.TorusGeometry(R + 0.012, 0.032, 10, 72), ribMat);
      rib.rotation.x = Math.PI / 2;
      rib.position.y = y;
      rib.renderOrder = 4;
      root.add(rib);
    });
  }

  // Sculpted side carry handle (for 3-gallon handle jug, matching photo 3)
  if (cfg.hasHandle) {
    const handleMat = registerMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xbae6fd,
        roughness: 0.12,
        clearcoat: 1.0,
        depthWrite: false,
      }),
      0.44,
    );
    const handleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-(R - 0.04), H * 0.66, 0),
      new THREE.Vector3(-(R + 0.32), H * 0.62, 0),
      new THREE.Vector3(-(R + 0.35), H * 0.42, 0),
      new THREE.Vector3(-(R - 0.04), H * 0.36, 0),
    ]);
    const handleMesh = new THREE.Mesh(
      new THREE.TubeGeometry(handleCurve, 32, 0.075, 14, false),
      handleMat,
    );
    handleMesh.renderOrder = 4;
    root.add(handleMesh);
  }

  // Crisp wrapped label (for 1.5 L compact bottle)
  if (cfg.hasLabel) {
    const labelMat = registerMat(
      new THREE.MeshStandardMaterial({
        map: textures.smallBottleLabel,
        roughness: 0.36,
        metalness: 0.02,
        side: THREE.DoubleSide,
      }),
      0.92,
    );
    const labelMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(R + 0.014, R + 0.014, 0.62, 56, 1, true),
      labelMat,
    );
    labelMesh.position.y = H * 0.42;
    labelMesh.renderOrder = 4;
    root.add(labelMesh);
  }

  // Molded bottle neck crown collar
  const neckCollarMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: cfg.hasNeckAdapter ? 0x6ee7b7 : 0x7dd3fc,
      roughness: 0.22,
      metalness: 0.1,
    }),
    0.72,
  );
  const neckRing = new THREE.Mesh(
    new THREE.TorusGeometry(nR + 0.028, 0.036, 12, 48),
    neckCollarMat,
  );
  neckRing.rotation.x = Math.PI / 2;
  neckRing.position.y = H - nH * 0.48;
  neckRing.renderOrder = 4;
  root.add(neckRing);

  const neckCapRing = new THREE.Mesh(
    new THREE.CylinderGeometry(nR + 0.03, nR + 0.03, 0.08, 40, 1, true),
    neckCollarMat,
  );
  neckCapRing.position.y = H - 0.04;
  neckCapRing.renderOrder = 4;
  root.add(neckCapRing);

  // Ground contact shadow plane right at y = 0.004
  const shadowMat = new THREE.MeshBasicMaterial({
    map: textures.contactShadow,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
  });
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(R * 2.9, R * 2.9),
    shadowMat,
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.004;
  root.add(shadowPlane);

  function setVisibilityFactor(vis: number) {
    const clamped = THREE.MathUtils.clamp(vis, 0, 1);
    root.visible = clamped > 0.01;
    for (let i = 0; i < materials.length; i++) {
      materials[i].mat.opacity = materials[i].baseOpacity * clamped;
    }
    shadowMat.opacity = 0.65 * clamped;
  }

  return {
    root,
    height: H,
    neckTopY: H - 0.22,
    tubeLength: H - 0.34,
    radius: R,
    waterGroup,
    meniscus,
    materials,
    shadowMat,
    setVisibilityFactor,
  };
}

export function buildAllBottles(
  textures: ProceduralTextureSet,
  isSoftwareGl: boolean,
): [BottleUnit, BottleUnit, BottleUnit] {
  const b5Gal = createSingleBottle(
    {
      radius: 1.38,
      height: 3.4,
      neckRadius: 0.28,
      neckHeight: 0.34,
      shoulderHeight: 0.78,
      tintHex: 0xbfe8ff,
      waterHex: 0x1d8ef8,
      fillHeight: 2.38,
      ribs: [0.76, 1.38, 2.02],
    },
    textures,
    isSoftwareGl,
  );

  const b3Gal = createSingleBottle(
    {
      radius: 1.06,
      height: 2.62,
      neckRadius: 0.27,
      neckHeight: 0.3,
      shoulderHeight: 0.56,
      tintHex: 0xcbeeff,
      waterHex: 0x2598ff,
      fillHeight: 1.76,
      hasHandle: true,
    },
    textures,
    isSoftwareGl,
  );

  const bSmall = createSingleBottle(
    {
      radius: 0.52,
      height: 1.94,
      neckRadius: 0.2,
      neckHeight: 0.24,
      shoulderHeight: 0.48,
      tintHex: 0xc8fae0,
      waterHex: 0x22c4cc,
      fillHeight: 1.28,
      hasLabel: true,
      hasNeckAdapter: true,
    },
    textures,
    isSoftwareGl,
  );

  return [b5Gal, b3Gal, bSmall];
}

export interface PourRig {
  glassGroup: THREE.Group;
  glassMat: THREE.MeshPhysicalMaterial;
  glassWaterMesh: THREE.Mesh;
  glassWaterMat: THREE.MeshPhysicalMaterial;
  glassMeniscus: THREE.Mesh;
  streamMesh: THREE.Mesh;
  streamMat: THREE.MeshPhysicalMaterial;
  drops: THREE.Points;
  dropPos: Float32Array;
  dropVel: Float32Array;
  dropLife: Float32Array;
  dropGeo: THREE.BufferGeometry;
  dropCount: number;
  impactRing: THREE.Mesh;
  impactRingMat: THREE.MeshBasicMaterial;
}

export function buildPourRig(textures: ProceduralTextureSet): PourRig {
  const glassGroup = new THREE.Group();

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xecfbff,
    roughness: 0.05,
    metalness: 0.02,
    clearcoat: 1.0,
    transparent: true,
    opacity: 0.26,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  // Tapered crystal drinking tumbler
  const tumblerBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.41, 0.32, 1.06, 44, 1, true),
    glassMat,
  );
  tumblerBody.renderOrder = 5;
  glassGroup.add(tumblerBody);

  const tumblerRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.41, 0.012, 10, 44),
    glassMat,
  );
  tumblerRim.rotation.x = Math.PI / 2;
  tumblerRim.position.y = 0.53;
  glassGroup.add(tumblerRim);

  const tumblerBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.32, 0.09, 44),
    glassMat,
  );
  tumblerBase.position.y = -0.49;
  glassGroup.add(tumblerBase);

  // Rising water inside tumbler
  const glassWaterGeo = new THREE.CylinderGeometry(0.375, 0.305, 1.0, 40);
  glassWaterGeo.translate(0, 0.5, 0);
  const glassWaterMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    emissive: 0x0369a1,
    emissiveIntensity: 0.45,
    roughness: 0.08,
    transparent: true,
    opacity: 0.62,
    depthWrite: false,
  });
  const glassWaterMesh = new THREE.Mesh(glassWaterGeo, glassWaterMat);
  glassWaterMesh.position.y = -0.45;
  glassWaterMesh.renderOrder = 4;
  glassGroup.add(glassWaterMesh);

  const glassMeniscus = new THREE.Mesh(
    new THREE.CircleGeometry(0.365, 36),
    new THREE.MeshBasicMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    }),
  );
  glassMeniscus.rotation.x = -Math.PI / 2;
  glassMeniscus.position.y = -0.45;
  glassGroup.add(glassMeniscus);

  // Continuous pouring water stream
  const streamGeo = new THREE.CylinderGeometry(0.025, 0.033, 1, 14, 1, true);
  streamGeo.translate(0, -0.5, 0);
  const streamMat = new THREE.MeshPhysicalMaterial({
    color: 0xa5f3fc,
    emissive: 0x22d3ee,
    emissiveIntensity: 0.55,
    roughness: 0.05,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });
  const streamMesh = new THREE.Mesh(streamGeo, streamMat);
  streamMesh.renderOrder = 6;

  // Splash droplet particle system (180 particles)
  const dropCount = 180;
  const dropPos = new Float32Array(dropCount * 3);
  const dropVel = new Float32Array(dropCount * 3);
  const dropLife = new Float32Array(dropCount);
  for (let i = 0; i < dropCount; i++) {
    dropLife[i] = -1;
    dropPos[i * 3 + 1] = -999;
  }
  const dropGeo = new THREE.BufferGeometry();
  dropGeo.setAttribute('position', new THREE.BufferAttribute(dropPos, 3));
  const drops = new THREE.Points(
    dropGeo,
    new THREE.PointsMaterial({
      size: 0.1,
      map: textures.droplet,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  drops.frustumCulled = false;

  // Cyan neck-lock impact pulse ring (fires right when pump drops & locks onto a bottle!)
  const impactRingMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const impactRing = new THREE.Mesh(
    new THREE.RingGeometry(0.32, 0.52, 48),
    impactRingMat,
  );
  impactRing.rotation.x = -Math.PI / 2;
  impactRing.visible = false;

  return {
    glassGroup,
    glassMat,
    glassWaterMesh,
    glassWaterMat,
    glassMeniscus,
    streamMesh,
    streamMat,
    drops,
    dropPos,
    dropVel,
    dropLife,
    dropGeo,
    dropCount,
    impactRing,
    impactRingMat,
  };
}
