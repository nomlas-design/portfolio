import { extend, useFrame } from '@react-three/fiber';
import { shaderMaterial, useTexture } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import { Group, Vector3, ShaderMaterial } from 'three';
import { useControls } from 'leva';
import * as THREE from 'three';
import {
  planeVertexShader,
  planeFragmentShader,
} from '@/app/shaders/planeShaders';

interface CarouselItemProps {
  index: number;
  image: {
    name: string;
    texture: string;
  };
  pos: Vector3;
  materialRef: (ref: ShaderMaterial | null) => void;
}

const CarouselItem = ({ image, pos, materialRef }: CarouselItemProps) => {
  const groupRef = useRef<Group>(null);
  const localMaterialRef = useRef<ShaderMaterial>(null);
  const texture = useTexture(image.texture);

  // Controls

  const { curveFactor } = useControls({
    curveFactor: {
      value: 0,
      min: -10,
      max: 10,
      step: 0.01,
      label: 'Curve Factor',
    },
  });

  const CarouselMaterial = useMemo(() => {
    return shaderMaterial(
      {
        uTexture: null,
        uProgress: 0,
        uCurveFactor: 0,
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
  }, [planeFragmentShader, planeVertexShader]);

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

  useFrame(() => {
    if (
      localMaterialRef.current?.uniforms.uCurveFactor?.value <= 1 &&
      localMaterialRef.current
    ) {
      localMaterialRef.current.uniforms.uCurveFactor.value += 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={pos}>
        <planeGeometry args={[2.5, 2, 100, 100]} />
        <carouselMaterial ref={localMaterialRef} transparent={true} />
      </mesh>
    </group>
  );
};

export default CarouselItem;
