import { extend, useFrame, useThree } from '@react-three/fiber';
import { shaderMaterial, useTexture } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Group, Vector3, ShaderMaterial, Vector2, Raycaster } from 'three';
import { useControls } from 'leva';
import * as THREE from 'three';
import {
  planeVertexShader,
  planeFragmentShader,
} from '@/app/shaders/planeShaders';

interface CarouselImageProps {
  index: number;
  image: {
    name: string;
    texture: string;
  };
  pos: Vector3;
  materialRef: (ref: ShaderMaterial | null) => void;
  curveFactor: number;
  activeIndex: number;
  bendIntensity?: number;
}

const CarouselImage = ({
  image,
  pos,
  materialRef,
  curveFactor,
  index,
  activeIndex,
  bendIntensity = 1.15,
}: CarouselImageProps) => {
  const groupRef = useRef<Group>(null);
  const localMaterialRef = useRef<ShaderMaterial>(null);
  const texture = useTexture(image.texture);

  // Target states for interpolation
  const [targetHover, setTargetHover] = useState(0.0);
  const [targetMousePos, setTargetMousePos] = useState(new Vector2(0, 0));

  // Current states that will be interpolated
  const currentHover = useRef(0.0);
  const currentMousePos = useRef(new Vector2(0, 0));
  const currentRotateX = useRef(0.0);
  const currentRotateY = useRef(0.0);

  const { size, camera } = useThree();
  const raycaster = useRef(new Raycaster());
  const mouse = useRef(new Vector2());
  const hoverPlane = useRef<THREE.Mesh>(null);

  interface PointerMoveEvent extends MouseEvent {
    clientX: number;
    clientY: number;
  }

  const handlePointerMove = (event: PointerMoveEvent) => {
    if (index !== activeIndex) return;

    mouse.current.x = (event.clientX / size.width) * 2 - 1;
    mouse.current.y = -(event.clientY / size.height) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);

    const intersects = raycaster.current.intersectObject(
      hoverPlane.current as THREE.Object3D,
      true
    );

    if (intersects.length > 0) {
      const intersect = intersects[0];
      const localPoint = intersect.object.worldToLocal(intersect.point.clone());

      const uvX = (localPoint.x / 1.25) * 4;
      const uvY = (localPoint.y / 1.85) * 8;

      setTargetMousePos(new Vector2(uvX, uvY));
      setTargetHover(1.0);
      document.body.style.cursor = 'pointer';
    } else {
      handlePointerOut();
    }
  };

  const handlePointerOut = () => {
    setTargetHover(0.0);
    document.body.style.cursor = 'auto';
    setTargetMousePos(
      new Vector2(currentMousePos.current.x, currentMousePos.current.y)
    );
  };

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [activeIndex, index, camera, size]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  const CarouselMaterial = useMemo(() => {
    return shaderMaterial(
      {
        uTexture: null,
        uProgress: 0,
        uRandom: Math.random(),
        uTime: 0,
        uContrast: 1.0,
        uExposure: 1.0,
        uCurveFactor: 0.0,
        uMouse: new Vector2(0, 0),
        uHover: 0.0,
        uRotateX: 0.0,
        uRotateY: 0.0,
      },
      planeVertexShader,
      planeFragmentShader,
      (material) => {
        if (material) {
          material.transparent = true;
          material.side = THREE.DoubleSide;
        }
      }
    );
  }, []);

  extend({ CarouselMaterial });

  useEffect(() => {
    if (localMaterialRef.current) {
      localMaterialRef.current.uniforms.uCurveFactor.value = curveFactor;
    }
  }, [curveFactor]);

  useEffect(() => {
    if (localMaterialRef.current) {
      localMaterialRef.current.transparent = true;
      localMaterialRef.current.uniforms.uTexture.value = texture;
      materialRef(localMaterialRef.current);
    }
    return () => materialRef(null);
  }, [texture, materialRef]);

  useFrame((state, delta) => {
    if (localMaterialRef.current) {
      const springStrength = targetHover === 1.0 ? 2.5 : 1.5; // Slower reset
      const damping = targetHover === 1.0 ? 0.85 : 0.95;

      const hoverDiff = targetHover - currentHover.current;
      currentHover.current += hoverDiff * springStrength * delta;
      currentHover.current *= damping;

      const mouseDiffX = targetMousePos.x - currentMousePos.current.x;
      const mouseDiffY = targetMousePos.y - currentMousePos.current.y;

      currentMousePos.current.x += mouseDiffX * springStrength * delta;
      currentMousePos.current.y += mouseDiffY * springStrength * delta;

      currentMousePos.current.multiplyScalar(damping);

      const uniforms = localMaterialRef.current.uniforms;
      uniforms.uHover.value = currentHover.current;
      uniforms.uMouse.value.copy(currentMousePos.current);
      uniforms.uRotateX.value = currentRotateX.current;
      uniforms.uRotateY.value = currentRotateY.current;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Invisible larger plane for hover detection */}
      <mesh
        ref={hoverPlane}
        position={pos}
        visible={false}
        // onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <planeGeometry args={[2.7, 1.9, 1, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <mesh position={pos}>
        <planeGeometry args={[2.5, 1.7, 32, 32]} />
        <carouselMaterial ref={localMaterialRef} transparent={true} />
      </mesh>
    </group>
  );
};

export default CarouselImage;
