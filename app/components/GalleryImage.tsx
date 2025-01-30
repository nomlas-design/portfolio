import { Vector2, Vector3 } from 'three';
import { useRef, useEffect } from 'react';
import { useTexture, shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import {
  galleryVertexShader as vertexShader,
  galleryFragmentShader as fragmentShader,
} from '../shaders/galleryShaders';
import { useTransition } from '@/app/contexts/TransitionContext';

// Create the material outside the component
const GalleryMaterial = shaderMaterial(
  {
    uTexture: new THREE.Texture(),
    uImageSize: new Vector2(1, 1),
    uPlaneSize: new Vector2(1, 1),
    uProgress: 0,
    uIndex: 0,
  },
  vertexShader,
  fragmentShader,
  (material) => {
    if (material) {
      material.transparent = true;
    }
  }
);

// Extend once, outside the component
extend({ GalleryMaterial });

// Animation order mapping
const animationOrder = {
  2: 0, // First
  3: 1, // Second
  1: 2, // Third
  4: 3, // Fourth
  0: 4, // Fifth
  5: 5, // Sixth
  6: 6, // Seventh
};

interface GalleryImageProps {
  planeSize: Vector2;
  pos: Vector3;
  color?: string;
  index: number;
}

const GalleryImage = ({
  planeSize,
  pos,
  color = 'white',
  index,
}: GalleryImageProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const { isBack } = useTransition();

  const gallery = [
    '/images/img4.jpg',
    '/images/img5.jpg',
    '/images/img6.jpg',
    '/images/img7.jpg',
    '/images/img1.jpg',
    '/images/img2.jpg',
    '/images/img3.jpg',
  ];

  const textures = useTexture(gallery);

  useEffect(() => {
    if (!materialRef.current || !textures[index]) return;

    const texture = textures[index];
    texture.needsUpdate = true;

    if (!materialRef.current) return;
    const uniforms = materialRef.current.uniforms;
    uniforms.uTexture.value = texture;
    uniforms.uIndex.value = index;
    uniforms.uImageSize.value.set(texture.image.width, texture.image.height);
    uniforms.uPlaneSize.value.set(planeSize.x, planeSize.y);
  }, [textures, index]);

  useEffect(() => {
    if (!materialRef.current) return;

    // Kill any existing animation
    if (animationRef.current) {
      animationRef.current.kill();
    }

    const delay =
      0.25 + animationOrder[index as keyof typeof animationOrder] * 0.15;

    if (isBack) {
      // Reverse animation for back transition
      animationRef.current = gsap.to(materialRef.current.uniforms.uProgress, {
        value: 0,
        duration: 0.5,
        delay: delay,
        ease: 'power2.inOut',
      });
    } else {
      // Forward animation
      animationRef.current = gsap.fromTo(
        materialRef.current.uniforms.uProgress,
        {
          value: 0,
        },
        {
          value: 1,
          duration: 0.5,
          delay: delay,
          ease: 'power2.inOut',
        }
      );
    }

    // Cleanup
    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [index, isBack]);

  return (
    <mesh position={pos}>
      <planeGeometry args={[planeSize.x, planeSize.y, 32, 32]} />
      <galleryMaterial ref={materialRef} />
    </mesh>
  );
};

export default GalleryImage;
