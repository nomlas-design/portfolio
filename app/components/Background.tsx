import { shaderMaterial } from '@react-three/drei';
import { extend, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useTransition } from '@/app/contexts/TransitionContext';
import { baseColours, alternativeColourSchemes } from '../config/colourSchemes';
import {
  backgroundFragmentShader as fragmentShader,
  backgroundVertexShader as vertexShader,
} from '../shaders/backgroundShaders';

interface CarouselTextLineProps {
  position: [number, number, number];
  colour: string;
}

const Background = ({ position, colour }: CarouselTextLineProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const currentAnimations = useRef<gsap.core.Tween[]>([]);
  const [size, setSize] = useState([0, 0]);
  const { viewport } = useThree();
  const { activeIndex, progress } = useTransition();

  useEffect(() => {
    const handleResize = () => {
      setSize([viewport.width, viewport.height]);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewport, setSize]);

  // Cleanup function for GSAP animations
  const cleanupAnimations = () => {
    currentAnimations.current.forEach((tween) => {
      tween.kill();
    });
    currentAnimations.current = [];
  };

  // Color transition effect
  useEffect(() => {
    if (!materialRef.current) return;

    const material = materialRef.current;
    cleanupAnimations();

    // If activeIndex is null or out of bounds, transition to base colours
    const targetColours =
      activeIndex !== null ? alternativeColourSchemes[0].colours : baseColours;

    // Create new animations
    const colour1Tween = gsap.to(material.uniforms.uColour1.value, {
      x: targetColours.colour1.x,
      y: targetColours.colour1.y,
      z: targetColours.colour1.z,
      duration: 1.5,
      ease: 'power2.inOut',
    });

    const colour2Tween = gsap.to(material.uniforms.uColour2.value, {
      x: targetColours.colour2.x,
      y: targetColours.colour2.y,
      z: targetColours.colour2.z,
      duration: 1.5,
      ease: 'power2.inOut',
    });

    const colour3Tween = gsap.to(material.uniforms.uColour3.value, {
      x: targetColours.colour3.x,
      y: targetColours.colour3.y,
      z: targetColours.colour3.z,
      duration: 1.5,
      ease: 'power2.inOut',
    });

    // Store current animations for cleanup
    currentAnimations.current = [colour1Tween, colour2Tween, colour3Tween];

    return () => {
      cleanupAnimations();
    };
  }, [activeIndex]);

  const BackgroundMaterial = useMemo(() => {
    return shaderMaterial(
      {
        uTime: 0,
        uColour1: baseColours.colour1.clone(),
        uColour2: baseColours.colour2.clone(),
        uColour3: baseColours.colour3.clone(),
        uTransitionProgress: 0,
      },
      vertexShader,
      fragmentShader
    );
  }, []);

  extend({ BackgroundMaterial });

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
      materialRef.current.uniforms.uTransitionProgress.value = progress.value;
    }
  });

  return (
    <mesh position={position}>
      <planeGeometry
        args={[viewport.width + viewport.width, viewport.height * 2]}
      />
      <backgroundMaterial ref={materialRef} />
    </mesh>
  );
};

export default Background;
