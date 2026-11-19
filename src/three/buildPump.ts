import * as THREE from 'three';
import type { ProceduralTextureSet } from './textures';
import type { PumpFinish } from './types';

export interface PumpAssembly {
  root: THREE.Group;
  parts: {
    tube: THREE.Group;
    base: THREE.Group;
    motor: THREE.Group;
    body: THREE.Group;
    spout: THREE.Group;
    cap: THREE.Group;
  };
  tubeMesh: THREE.Mesh;
  tipAnchor: THREE.Object3D;
  ledMat: THREE.MeshStandardMaterial;
  ledLight: THREE.PointLight;
  hitProxy: THREE.Mesh;
  setFinish: (finish: PumpFinish) => void;
  setExplodeProgress: (explodeAmount: number) => void;
  setButtonPressed: (pressedAmount: number) => void;
}

export function buildPumpAssembly(
  textures: ProceduralTextureSet,
  castShadows: boolean,
): PumpAssembly {
  const root = new THREE.Group();
  root.name = 'MokhsPumpRoot';

  // Calibrated PBR materials with strong roughness/metalness contrast
  const primaryShellMat = new THREE.MeshPhysicalMaterial({
    color: 0xf4f7fb,
    roughness: 0.24,
    metalness: 0.04,
    clearcoat: 0.55,
    clearcoatRoughness: 0.18,
  });

  const accentPanelMat = new THREE.MeshPhysicalMaterial({
    color: 0x0b0f17,
    roughness: 0.12,
    metalness: 0.25,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1,
    side: THREE.DoubleSide,
  });

  const matteCollarMat = new THREE.MeshStandardMaterial({
    color: 0x0e131c,
    roughness: 0.48,
    metalness: 0.12,
  });

  const brushedSteelMat = new THREE.MeshPhysicalMaterial({
    color: 0xe6edf5,
    roughness: 0.14,
    metalness: 0.96,
    bumpMap: textures.brushedBump,
    bumpScale: 0.002,
    clearcoat: 0.35,
  });

  const motorHousingMat = new THREE.MeshStandardMaterial({
    color: 0x3b4656,
    roughness: 0.42,
    metalness: 0.72,
  });

  const copperCoilMat = new THREE.MeshStandardMaterial({
    color: 0xd97a3a,
    roughness: 0.28,
    metalness: 0.92,
  });

  const batteryMat = new THREE.MeshStandardMaterial({
    color: 0x1d7dfa,
    roughness: 0.34,
    metalness: 0.22,
  });

  const pcbMat = new THREE.MeshStandardMaterial({
    color: 0x0f5132,
    roughness: 0.55,
    metalness: 0.25,
  });

  const siliconeMat = new THREE.MeshPhysicalMaterial({
    color: 0xe6f6ff,
    roughness: 0.32,
    metalness: 0.0,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
  });

  const ledMat = new THREE.MeshStandardMaterial({
    color: 0x67e8f9,
    emissive: 0x06b6d4,
    emissiveIntensity: 2.2,
    roughness: 0.22,
    metalness: 0.1,
  });

  const topCapFaceMat = new THREE.MeshStandardMaterial({
    map: textures.powerCapWhite,
    roughness: 0.25,
    metalness: 0.18,
  });

  const createPart = (name: string, explodeOffset: THREE.Vector3) => {
    const group = new THREE.Group();
    group.name = name;
    group.userData.explodeOffset = explodeOffset;
    root.add(group);
    return group;
  };

  // 01. Food-grade Silicone Intake Tube
  const pTube = createPart('tube', new THREE.Vector3(0, -1.75, 0));
  const tubeGeo = new THREE.CylinderGeometry(0.056, 0.056, 1, 18, 1, false);
  tubeGeo.translate(0, -0.5, 0);
  const tubeMesh = new THREE.Mesh(tubeGeo, siliconeMat);
  tubeMesh.position.y = 0.08;
  pTube.add(tubeMesh);

  // Brass intake fitting nozzle at top of silicone tube
  const intakeNozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.085, 0.072, 0.14, 24),
    brushedSteelMat,
  );
  intakeNozzle.position.y = 0.12;
  pTube.add(intakeNozzle);

  // 02. Universal Bottle-Neck Collar Base + Silicone Gasket
  const pBase = createPart('base', new THREE.Vector3(0, -1.05, 0));
  const baseProfile = [
    new THREE.Vector2(0.46, 0.0),
    new THREE.Vector2(0.76, 0.0),
    new THREE.Vector2(0.82, 0.05),
    new THREE.Vector2(0.83, 0.48),
    new THREE.Vector2(0.80, 0.50),
    new THREE.Vector2(0.46, 0.50),
  ];
  const baseMesh = new THREE.Mesh(
    new THREE.LatheGeometry(baseProfile, 72),
    matteCollarMat,
  );
  baseMesh.castShadow = castShadows;
  baseMesh.receiveShadow = castShadows;
  pBase.add(baseMesh);

  // Inner universal silicone neck gasket ring
  const gasketMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.36, 0.065, 16, 48),
    siliconeMat,
  );
  gasketMesh.rotation.x = Math.PI / 2;
  gasketMesh.position.y = 0.12;
  pBase.add(gasketMesh);

  // Crisp metallic waist separator trim
  const waistTrim = new THREE.Mesh(
    new THREE.TorusGeometry(0.822, 0.011, 10, 72),
    brushedSteelMat,
  );
  waistTrim.rotation.x = Math.PI / 2;
  waistTrim.position.y = 0.49;
  pBase.add(waistTrim);

  // 03. Internal Pump Motor, Copper Coils, 1200mAh Li-ion Battery & PCB
  const pMotor = createPart('motor', new THREE.Vector3(-1.35, 0.18, 0.1));
  const motorCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.56, 32),
    motorHousingMat,
  );
  motorCore.position.set(0.18, 0.92, 0);
  pMotor.add(motorCore);

  // Pump diaphragm head
  const pumpHead = new THREE.Mesh(
    new THREE.CylinderGeometry(0.31, 0.29, 0.16, 32),
    matteCollarMat,
  );
  pumpHead.position.set(0.18, 1.24, 0);
  pMotor.add(pumpHead);

  // 4 Copper stator windings
  for (let i = 0; i < 4; i++) {
    const coil = new THREE.Mesh(
      new THREE.TorusGeometry(0.292, 0.022, 10, 32),
      copperCoilMat,
    );
    coil.rotation.x = Math.PI / 2;
    coil.position.set(0.18, 0.72 + i * 0.115, 0);
    pMotor.add(coil);
  }

  // 18650 1200mAh Lithium-Ion Battery Cell
  const batteryCell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.165, 0.165, 0.84, 28),
    batteryMat,
  );
  batteryCell.position.set(-0.34, 1.06, 0.06);
  pMotor.add(batteryCell);

  const batteryCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.05, 24),
    brushedSteelMat,
  );
  batteryCap.position.set(-0.34, 1.49, 0.06);
  pMotor.add(batteryCap);

  // Control PCB chip
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.34, 0.045), pcbMat);
  pcb.position.set(-0.08, 1.56, -0.22);
  pMotor.add(pcb);

  // 04. Seamless Outer Body Shell + Iconic Rounded-Arch Front Accent Panel
  const pBody = createPart('body', new THREE.Vector3(0, 1.05, -0.18));
  const shellProfile: THREE.Vector2[] = [
    new THREE.Vector2(0.805, 0.48),
    new THREE.Vector2(0.815, 0.52),
    new THREE.Vector2(0.815, 1.76),
  ];
  for (let i = 1; i <= 14; i++) {
    const angle = (i / 14) * (Math.PI / 2);
    shellProfile.push(
      new THREE.Vector2(
        0.58 + 0.235 * Math.cos(angle),
        1.76 + 0.26 * Math.sin(angle),
      ),
    );
  }
  shellProfile.push(new THREE.Vector2(0.01, 2.02));

  const shellMesh = new THREE.Mesh(
    new THREE.LatheGeometry(shellProfile, 96),
    primaryShellMat,
  );
  shellMesh.castShadow = castShadows;
  shellMesh.receiveShadow = castShadows;
  pBody.add(shellMesh);

  // Glossy Front Arch Panel (spout side = +X, centered around theta = Math.PI/2)
  const archSpan = 0.88;
  const frontPanelMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.821,
      0.821,
      1.12,
      48,
      1,
      true,
      Math.PI / 2 - archSpan / 2,
      archSpan,
    ),
    accentPanelMat,
  );
  frontPanelMesh.position.y = 1.04;
  pBody.add(frontPanelMesh);

  // Rounded arch dome at top of front accent panel
  const archTop = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.345,
      32,
      18,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2,
    ),
    accentPanelMat,
  );
  archTop.scale.set(0.18, 0.72, 1.02);
  archTop.position.set(0.775, 1.59, 0);
  pBody.add(archTop);

  // Micro-USB charging slot recessed cleanly on back collar seam
  const usbPort = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.075, 0.2),
    brushedSteelMat,
  );
  usbPort.position.set(-0.805, 0.72, 0);
  pBody.add(usbPort);

  const usbRecess = new THREE.Mesh(
    new THREE.BoxGeometry(0.065, 0.042, 0.14),
    matteCollarMat,
  );
  usbRecess.position.set(-0.812, 0.72, 0);
  pBody.add(usbRecess);

  // 05. Curved 304 Stainless Steel Spout + Recessed Metallic Grommet
  const pSpout = createPart('spout', new THREE.Vector3(1.55, 0.42, 0));

  // Recessed outer metallic socket bezel
  const socketBezel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.155, 0.175, 0.09, 36),
    brushedSteelMat,
  );
  socketBezel.rotation.z = -Math.PI / 2;
  socketBezel.position.set(0.815, 0.98, 0);
  pSpout.add(socketBezel);

  const socketInner = new THREE.Mesh(
    new THREE.TorusGeometry(0.105, 0.028, 14, 36),
    brushedSteelMat,
  );
  socketInner.rotation.y = Math.PI / 2;
  socketInner.position.set(0.855, 0.98, 0);
  pSpout.add(socketInner);

  // Authentic upward-angled then downward-curved stainless spout (matching real product photo)
  const spoutCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.74, 0.98, 0),
    new THREE.Vector3(1.16, 1.11, 0),
    new THREE.Vector3(1.48, 1.18, 0),
    new THREE.Vector3(1.66, 1.12, 0),
    new THREE.Vector3(1.78, 0.92, 0),
    new THREE.Vector3(1.90, 0.66, 0),
  ]);
  const spoutMesh = new THREE.Mesh(
    new THREE.TubeGeometry(spoutCurve, 64, 0.046, 18, false),
    brushedSteelMat,
  );
  spoutMesh.castShadow = castShadows;
  pSpout.add(spoutMesh);

  // Dark inner bore at spout nozzle tip
  const nozzleBore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.032, 0.025, 16),
    matteCollarMat,
  );
  nozzleBore.position.set(1.90, 0.66, 0);
  nozzleBore.rotation.z = 0.42;
  pSpout.add(nozzleBore);

  const tipAnchor = new THREE.Object3D();
  tipAnchor.position.set(1.91, 0.64, 0);
  pSpout.add(tipAnchor);

  // 06. One-Touch Cyan LED Top Cap
  const pCap = createPart('cap', new THREE.Vector3(0, 2.05, 0));

  // Brushed silver beveled outer collar
  const capBezel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.57, 0.61, 0.065, 64),
    brushedSteelMat,
  );
  capBezel.position.y = 2.025;
  pCap.add(capBezel);

  // Emissive cyan LED light ring
  const ledRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.415, 0.036, 16, 72),
    ledMat,
  );
  ledRing.rotation.x = Math.PI / 2;
  ledRing.position.y = 2.062;
  pCap.add(ledRing);

  // Tactile top face disc with power icon graphic
  const capFaceGroup = new THREE.Group();
  capFaceGroup.position.y = 2.062;
  const topDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.535, 0.545, 0.028, 64),
    topCapFaceMat,
  );
  // Rotate so power icon faces user cleanly
  topDisc.rotation.y = Math.PI / 2;
  capFaceGroup.add(topDisc);
  pCap.add(capFaceGroup);

  const ledLight = new THREE.PointLight(0x22d3ee, 1.4, 3.6);
  ledLight.position.set(0, 2.35, 0);
  pCap.add(ledLight);

  // Invisible simplified raycast hit proxy on layer 1 (zero heavy mesh raycasting)
  const hitProxy = new THREE.Mesh(
    new THREE.CylinderGeometry(0.92, 0.92, 2.25, 16),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitProxy.position.y = 1.12;
  hitProxy.layers.set(1);
  root.add(hitProxy);

  const parts = {
    tube: pTube,
    base: pBase,
    motor: pMotor,
    body: pBody,
    spout: pSpout,
    cap: pCap,
  };

  function setFinish(finish: PumpFinish) {
    if (finish === 'white') {
      primaryShellMat.color.setHex(0xf4f7fb);
      primaryShellMat.roughness = 0.24;
      accentPanelMat.color.setHex(0x0b0f17);
      accentPanelMat.roughness = 0.12;
      matteCollarMat.color.setHex(0x0e131c);
      topCapFaceMat.map = textures.powerCapWhite;
    } else {
      primaryShellMat.color.setHex(0x121620);
      primaryShellMat.roughness = 0.22;
      accentPanelMat.color.setHex(0xf1f5f9);
      accentPanelMat.roughness = 0.16;
      matteCollarMat.color.setHex(0xe8eef6);
      topCapFaceMat.map = textures.powerCapBlack;
    }
    topCapFaceMat.needsUpdate = true;
  }

  function setExplodeProgress(explodeAmount: number) {
    // Staggered sequential snap feel per component
    const order: Array<keyof typeof parts> = [
      'tube',
      'base',
      'motor',
      'body',
      'spout',
      'cap',
    ];
    for (let i = 0; i < order.length; i++) {
      const key = order[i];
      const grp = parts[key];
      const offset = grp.userData.explodeOffset as THREE.Vector3;
      // Subtle stagger so parts snap home one after another as explodeAmount -> 0
      const start = i * 0.07;
      const localE = THREE.MathUtils.clamp(
        (explodeAmount - start * 0.5) / (1 - start * 0.5),
        0,
        1,
      );
      grp.position.copy(offset).multiplyScalar(localE);
    }
  }

  function setButtonPressed(pressedAmount: number) {
    capFaceGroup.position.y = 2.062 - pressedAmount * 0.032;
  }

  return {
    root,
    parts,
    tubeMesh,
    tipAnchor,
    ledMat,
    ledLight,
    hitProxy,
    setFinish,
    setExplodeProgress,
    setButtonPressed,
  };
}
