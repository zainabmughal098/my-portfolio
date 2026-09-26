import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeCanvasProps {
  currentStepIndex: number;
  interactive?: boolean;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  currentStepIndex,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const targetRotationRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const stepIndexRef = useRef(currentStepIndex);

  useEffect(() => {
    stepIndexRef.current = currentStepIndex;
  }, [currentStepIndex]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 18;

    // WebGL Renderer with antialiasing & alpha transparency
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    } catch (e) {
      console.warn('WebGL initialization failed', e);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // 1. Interactive Starfield / Particle Cloud
    const particleCount = 700;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const baseColorA = new THREE.Color(0x3b82f6); // blue-500
    const baseColorB = new THREE.Color(0x8b5cf6); // purple-500
    const baseColorC = new THREE.Color(0x06b6d4); // cyan-500

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 50;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 35;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 5;

      const mixed = baseColorA.clone().lerp(
        Math.random() > 0.5 ? baseColorB : baseColorC,
        Math.random()
      );
      particleColors[i * 3] = mixed.r;
      particleColors[i * 3 + 1] = mixed.g;
      particleColors[i * 3 + 2] = mixed.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 2. Main Central 3D Group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 3. Central Glass Slate (Double-sided Portfolio / Resume Monolith)
    const slateGeo = new THREE.BoxGeometry(6.4, 4.4, 0.35);
    const slateMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.6,
      thickness: 1.2,
      transparent: true,
      opacity: 0.9,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const centralSlate = new THREE.Mesh(slateGeo, slateMat);
    mainGroup.add(centralSlate);

    // Edge Wireframe for high-tech architectural feel
    const wireGeo = new THREE.EdgesGeometry(slateGeo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.85, linewidth: 2 });
    const wireframe = new THREE.LineSegments(wireGeo, wireMat);
    centralSlate.add(wireframe);

    // Front UI mockup elements (Screen header bar + mini content blocks)
    const headerGeo = new THREE.BoxGeometry(5.8, 0.4, 0.05);
    const headerMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.5, roughness: 0.3 });
    const headerMesh = new THREE.Mesh(headerGeo, headerMat);
    headerMesh.position.set(0, 1.7, 0.2);
    centralSlate.add(headerMesh);

    // Mini preview blocks simulating code/design cards
    const cardBlockGeo = new THREE.BoxGeometry(2.6, 2.5, 0.05);
    const cardBlockMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.4, roughness: 0.4 });
    const leftCard = new THREE.Mesh(cardBlockGeo, cardBlockMat);
    leftCard.position.set(-1.45, 0.05, 0.2);
    centralSlate.add(leftCard);

    const rightCard = new THREE.Mesh(cardBlockGeo, cardBlockMat);
    rightCard.position.set(1.45, 0.05, 0.2);
    centralSlate.add(rightCard);

    // Glowing accent lines on the screen
    const lineGeo = new THREE.PlaneGeometry(2.2, 0.12);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const line1 = new THREE.Mesh(lineGeo, lineMat);
    line1.position.set(0, 0.7, 0.04);
    leftCard.add(line1);

    const lineGeo2 = new THREE.PlaneGeometry(1.6, 0.08);
    const lineMat2 = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
    const line2 = new THREE.Mesh(lineGeo2, lineMat2);
    line2.position.set(-0.3, 0.35, 0.04);
    leftCard.add(line2);

    // 4. Orbiting 3D Floating Badges / Rings
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    // Ring 1 (Horizontal tilt)
    const ringGeo1 = new THREE.TorusGeometry(5.5, 0.035, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI * 0.4;
    orbitGroup.add(ring1);

    // Ring 2 (Vertical tilt)
    const ringGeo2 = new THREE.TorusGeometry(6.2, 0.025, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.5 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI * 0.35;
    ring2.rotation.x = Math.PI * 0.2;
    orbitGroup.add(ring2);

    // Floating satellite diamonds / nodes
    const nodeGeo = new THREE.OctahedronGeometry(0.35, 0);
    const nodeMatA = new THREE.MeshStandardMaterial({ color: 0x60a5fa, metalness: 0.8, roughness: 0.2, emissive: 0x1d4ed8, emissiveIntensity: 0.4 });
    const nodeMatB = new THREE.MeshStandardMaterial({ color: 0xc084fc, metalness: 0.8, roughness: 0.2, emissive: 0x7e22ce, emissiveIntensity: 0.4 });
    const nodeMatC = new THREE.MeshStandardMaterial({ color: 0x34d399, metalness: 0.8, roughness: 0.2, emissive: 0x059669, emissiveIntensity: 0.4 });

    const nodeA = new THREE.Mesh(nodeGeo, nodeMatA);
    const nodeB = new THREE.Mesh(nodeGeo, nodeMatB);
    const nodeC = new THREE.Mesh(nodeGeo, nodeMatC);
    orbitGroup.add(nodeA);
    orbitGroup.add(nodeB);
    orbitGroup.add(nodeC);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const light1 = new THREE.PointLight(0x38bdf8, 3.5, 30);
    light1.position.set(6, 6, 8);
    scene.add(light1);

    const light2 = new THREE.PointLight(0xa855f7, 3.0, 30);
    light2.position.set(-6, -5, 6);
    scene.add(light2);

    const light3 = new THREE.PointLight(0x10b981, 2.0, 25);
    light3.position.set(0, 8, -4);
    scene.add(light3);

    // Mouse movement listener
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current = { x, y };
      targetRotationRef.current = {
        x: y * 0.4,
        y: x * 0.6,
      };
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize listener
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();
      const step = stepIndexRef.current;

      // Rotate particle field slowly
      particles.rotation.y = elapsed * 0.04;
      particles.rotation.x = Math.sin(elapsed * 0.02) * 0.05;

      // Orbiting satellites calculation
      const angleA = elapsed * 0.7;
      nodeA.position.set(Math.cos(angleA) * 5.6, Math.sin(angleA * 0.5) * 2.2, Math.sin(angleA) * 5.6);
      nodeA.rotation.x += 0.02;
      nodeA.rotation.y += 0.03;

      const angleB = elapsed * 0.6 + 2.1;
      nodeB.position.set(Math.cos(angleB) * 6.3, Math.sin(angleB * 0.7) * 2.5, Math.sin(angleB) * 6.3);
      nodeB.rotation.x -= 0.02;
      nodeB.rotation.z += 0.02;

      const angleC = elapsed * 0.5 + 4.2;
      nodeC.position.set(Math.cos(angleC) * 5.0, Math.cos(angleC * 0.6) * 2.8, Math.sin(angleC) * 5.0);
      nodeC.rotation.y -= 0.03;

      // Orbit rings rotation
      orbitGroup.rotation.y = elapsed * 0.15;
      orbitGroup.rotation.z = Math.sin(elapsed * 0.1) * 0.1;

      // Target poses based on step
      let stepTargetY = targetRotationRef.current.y;
      let stepTargetX = targetRotationRef.current.x;
      let stepTargetZ = 0;
      let slateTargetZ = 0;

      switch (step) {
        case 0: // Welcome: gentle floating yaw
          stepTargetY += Math.sin(elapsed * 0.8) * 0.25;
          stepTargetX += Math.cos(elapsed * 0.6) * 0.12;
          break;
        case 1: // Step 1: Details - tilt towards code/input focus
          stepTargetY += -0.4 + Math.sin(elapsed * 0.5) * 0.1;
          stepTargetX += 0.2;
          slateTargetZ = 1.2;
          break;
        case 2: // Step 2: Themes - dramatic side perspective angle showcasing depth
          stepTargetY += 0.6 + Math.sin(elapsed * 0.6) * 0.1;
          stepTargetX += -0.15;
          stepTargetZ = 0.1;
          break;
        case 3: // Step 3: Resume - upright portrait alignment
          stepTargetY += Math.sin(elapsed * 0.5) * 0.1;
          stepTargetX += -0.25;
          slateTargetZ = 1.5;
          break;
        case 4: // Step 4: Preview - full dynamic multi-axis showcase
          stepTargetY += Math.sin(elapsed * 1.0) * 0.45;
          stepTargetX += Math.cos(elapsed * 0.8) * 0.2;
          break;
      }

      // Smooth interpolation (lerp)
      mainGroup.rotation.y += (stepTargetY - mainGroup.rotation.y) * 0.05;
      mainGroup.rotation.x += (stepTargetX - mainGroup.rotation.x) * 0.05;
      mainGroup.rotation.z += (stepTargetZ - mainGroup.rotation.z) * 0.05;

      // Floating bobbing motion
      mainGroup.position.y = Math.sin(elapsed * 1.5) * 0.35;
      mainGroup.position.z += (slateTargetZ - mainGroup.position.z) * 0.05;

      // Dynamic light animation
      light1.position.x = 6 + Math.sin(elapsed * 1.2) * 2;
      light1.position.y = 6 + Math.cos(elapsed * 1.0) * 2;
      light2.position.x = -6 + Math.cos(elapsed * 0.9) * 2;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (rendererRef.current && rendererRef.current.domElement) {
        if (container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
      }

      // Dispose geometries & materials
      particleGeo.dispose();
      particleMat.dispose();
      slateGeo.dispose();
      slateMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      headerGeo.dispose();
      headerMat.dispose();
      cardBlockGeo.dispose();
      cardBlockMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      nodeGeo.dispose();
      nodeMatA.dispose();
      nodeMatB.dispose();
      nodeMatC.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden"
      style={{ touchAction: 'none' }}
    />
  );
};
