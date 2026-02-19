import React, { useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

// Simple loading component for 3D scene
const Loader = () => {
  return (
    <Html center>
      <motion.div
        className="flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.p
          className="text-white font-mono text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Initializing Globe...
        </motion.p>
      </motion.div>
    </Html>
  );
};

// Smaller Interactive Globe with rotating rings
const InteractiveGlobe = ({ onBrandClick, showAuth }) => {
  const meshRef = useRef();
  const wireframeRef = useRef();
  const innerGlowRef = useRef();
  const outerRingRef = useRef();
  const innerRingRef = useRef();
  const diagonalRingRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.05;
      meshRef.current.rotation.y += delta * 0.08;
    }

    if (wireframeRef.current) {
      wireframeRef.current.rotation.x -= delta * 0.03;
      wireframeRef.current.rotation.y += delta * 0.12;
    }

    if (innerGlowRef.current) {
      innerGlowRef.current.rotation.z += delta * 0.1;
    }

    // Rotating rings
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z -= delta * 0.3;
    }

    if (innerRingRef.current) {
      innerRingRef.current.rotation.z += delta * 0.2;
    }

    if (diagonalRingRef.current) {
      diagonalRingRef.current.rotation.x += delta * 0.15;
      diagonalRingRef.current.rotation.y += delta * 0.1;
    }
  });

  const handleClick = () => {
    onBrandClick();
  };

  return (
    <group>
      {/* Outer rotating ring - smaller */}
      <mesh ref={outerRingRef} rotation={[Math.PI / 2, 0, 0]} scale={[3, 3, 1]}>
        <ringGeometry args={[0.98, 1.02, 64]} />
        <meshBasicMaterial
          color="#0066cc"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Main solid sphere - smaller */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? [1.6, 1.6, 1.6] : [1.4, 1.4, 1.4]}
      >
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial color="#001133" transparent opacity={0.6} />
      </mesh>

      {/* Inner glow effect - smaller */}
      <mesh ref={innerGlowRef} scale={[1.3, 1.3, 1.3]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#0088ff" transparent opacity={0.1} />
      </mesh>

      {/* Detailed wireframe overlay - smaller */}
      <mesh ref={wireframeRef} scale={[1.5, 1.5, 1.5]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial
          color="#00aaff"
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Inner rotating ring - smaller */}
      <mesh ref={innerRingRef} rotation={[0, 0, 0]} scale={[2.2, 2.2, 1]}>
        <ringGeometry args={[0.96, 1.04, 48]} />
        <meshBasicMaterial
          color="#0099dd"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Diagonal rotating ring - smaller */}
      <mesh
        ref={diagonalRingRef}
        rotation={[Math.PI / 4, Math.PI / 4, 0]}
        scale={[2.6, 2.6, 1]}
      >
        <ringGeometry args={[0.99, 1.01, 32]} />
        <meshBasicMaterial
          color="#00ccff"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

// Large spaced brand text positioned over the globe like Richard Mattka
const BrandText = ({ visible, onClick }) => {
  if (!visible) return null;

  return (
    <Html position={[0, 0, 0]} center distanceFactor={12} transform sprite>
      <motion.div
        className="pointer-events-auto cursor-pointer select-none text-center"
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
      >
        {/* Main Brand Name - Small */}
        <motion.h1
          className="text-base md:text-lg lg:text-xl font-thin text-white tracking-[0.2em] text-center whitespace-nowrap mb-3"
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 200,
            letterSpacing: "0.25em",
          }}
          animate={{
            textShadow: [
              "0 0 20px rgba(255, 255, 255, 0.3)",
              "0 0 30px rgba(6, 182, 212, 0.4)",
              "0 0 20px rgba(255, 255, 255, 0.3)",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          COMMUNIATEC
        </motion.h1>

        {/* Subtitle - Very Small and Subtle */}
        <motion.div
          className="text-[8px] md:text-[10px] lg:text-xs text-gray-600 tracking-[0.15em] font-extralight mb-6 opacity-70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.8, duration: 1 }}
          style={{ letterSpacing: "0.2em" }}
        >
          COMMUNITY | TECHNOLOGY | DEVELOPER
        </motion.div>
      </motion.div>
    </Html>
  );
};

// Navigation options positioned below the globe - bold and higher up
const NavOptions = ({ visible, onPrivacyClick }) => {
  if (!visible) return null;

  return (
    <Html position={[0, -2.5, 0]} center distanceFactor={8} transform sprite>
      <motion.div
        className="pointer-events-auto flex gap-12 items-center justify-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        {/* Privacy */}
        <motion.button
          onClick={onPrivacyClick}
          className="text-gray-400 hover:text-white transition-all duration-300 text-xs tracking-[0.2em] font-bold uppercase"
          whileHover={{
            scale: 1.1,
            textShadow: "0 0 8px rgba(255, 255, 255, 0.8)",
          }}
          whileTap={{ scale: 0.95 }}
          style={{ letterSpacing: "0.2em" }}
        >
          PRIVACY
        </motion.button>
      </motion.div>
    </Html>
  );
};

// Camera Controller
const CameraController = ({ showAuth }) => {
  const { camera } = useThree();

  useFrame((state, delta) => {
    if (showAuth) {
      // Move camera to focus on auth panel
      camera.position.lerp(new THREE.Vector3(-3, 0, 8), delta * 2);
      camera.lookAt(0, 0, 0);
    } else {
      // Default camera position
      camera.position.lerp(new THREE.Vector3(0, 0, 10), delta * 2);
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
};

// Main Globe3D Component
const Globe3D = ({
  onBrandClick,
  onPrivacyClick,
  showAuth = false,
  className = "",
}) => {
  const [showBrandText, setShowBrandText] = useState(true);

  const handleBrandClick = () => {
    setShowBrandText(false);
    setTimeout(() => {
      onBrandClick();
    }, 500);
  };

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={<Loader />}>
          {/* Basic Lighting */}
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} intensity={0.3} color="#0088ff" />

          {/* Background particles for depth */}
          {[...Array(30)].map((_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 30 - 10,
              ]}
              scale={[0.02, 0.02, 0.02]}
            >
              <sphereGeometry args={[1, 4, 4]} />
              <meshBasicMaterial
                color="#00aaff"
                transparent
                opacity={Math.random() * 0.3 + 0.1}
              />
            </mesh>
          ))}

          {/* Main Components */}
          <InteractiveGlobe
            onBrandClick={handleBrandClick}
            showAuth={showAuth}
          />
          <BrandText
            visible={showBrandText && !showAuth}
            onClick={handleBrandClick}
          />
          <NavOptions
            visible={showBrandText && !showAuth}
            onPrivacyClick={onPrivacyClick}
          />

          {/* Camera Animation Controller */}
          <CameraController showAuth={showAuth} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Globe3D;
