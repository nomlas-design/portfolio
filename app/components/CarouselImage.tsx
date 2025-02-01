'use client';
import { extend, useFrame, useThree } from '@react-three/fiber';
import { shaderMaterial, useTexture } from '@react-three/drei';
import { useEffect, useRef, useCallback, useState } from 'react';
import { mod } from '@/app/utils/MathUtils';
import { useRouter } from 'next/navigation';
import { Group, Vector3, ShaderMaterial, Vector2, Raycaster } from 'three';
import gsap from 'gsap';
import * as THREE from 'three';
import {
  planeVertexShader,
  planeFragmentShader,
} from '@/app/shaders/planeShaders';
import ProjectGallery from './ProjectGallery';
import { useTransition } from '@/app/contexts/TransitionContext';

interface CarouselImageProps {
  index: number;
  slug: string;
  image: {
    name: string;
    texture: string;
  };
  pos: Vector3;
  materialRef: (ref: ShaderMaterial | null) => void;
  scrollIndex: number;
  onClick: (index: number) => void;
  duration: number;
  isDirectLoad: boolean;
  setIsDirectLoad: (value: boolean) => void;
  galleryProg: number;
  setGalleryProg: (value: number) => void;
  galleryScrollY: number;
  setGalleryScrollY: (value: number) => void;
}

const PLANE_SIZE = new THREE.Vector2(2.5, 1.7);

const CarouselMaterial = shaderMaterial(
  {
    uTexture: null,
    uProgress: 0,
    uRandom: Math.random(),
    uTime: 0,
    uActiveProgress: 0.0,
    uMouse: new THREE.Vector2(0, 0),
    uHover: 0.0,
    uActive: 0.0,
    uOpacity: 0,
    uZoomScale: new THREE.Vector2(1, 1),
    uScale: new THREE.Vector2(1, 1),
    uImageSize: new THREE.Vector2(1, 1),
    uPlaneSize: new THREE.Vector2(PLANE_SIZE.x, PLANE_SIZE.y),
    uFadeIn: 0.0,
  },
  planeVertexShader,
  planeFragmentShader,
  (material) => {
    if (material) {
      material.transparent = true;
      material.side = THREE.DoubleSide;
      material.needsUpdate = true;
      material.extensions = {
        derivatives: true,
        fragDepth: false,
        drawBuffers: false,
        shaderTextureLOD: false,
        clipCullDistance: false,
      };
    }
  }
);

extend({ CarouselMaterial });

const CarouselImage = ({
  image,
  slug,
  pos,
  materialRef,
  index,
  scrollIndex,
  onClick,
  duration,
  isDirectLoad,
  setIsDirectLoad,
  galleryProg,
  setGalleryProg,
  galleryScrollY,
  setGalleryScrollY,
}: CarouselImageProps) => {
  const groupRef = useRef<Group>(null);
  const localMaterialRef = useRef<ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(image.texture);
  const { activeIndex, displayedIndex } = useTransition();
  const { size, camera, viewport } = useThree();
  const raycaster = useRef(new Raycaster());
  const [wrapHeight, setWrapHeight] = useState(0);
  const hasBeenExpandedRef = useRef(false);
  const [targetHover, setTargetHover] = useState(0.0);
  const [targetMousePos, setTargetMousePos] = useState(new Vector2(0, 0));
  const currentHover = useRef(0.0);
  const currentMousePos = useRef(new Vector2(0, 0));
  const mouse = useRef(new Vector2());
  const hoverPlane = useRef<THREE.Mesh>(null);
  const scrollTimoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlePointerMove = useCallback(
    (event: MouseEvent) => {
      if (index !== scrollIndex) return;
      mouse.current.x = (event.clientX / size.width) * 2 - 1;
      mouse.current.y = -(event.clientY / size.height) * 2 + 1;
      raycaster.current.setFromCamera(mouse.current, camera);
      const intersects = raycaster.current.intersectObject(
        hoverPlane.current as THREE.Object3D,
        true
      );
      if (intersects.length > 0) {
        const intersect = intersects[0];
        const localPoint = intersect.object.worldToLocal(
          intersect.point.clone()
        );
        const uvX = (localPoint.x / 1.25) * 4;
        const uvY = (localPoint.y / 1.85) * 8;
        setTargetMousePos(new Vector2(uvX, uvY));
        setTargetHover(1.0);
        document.body.style.cursor = 'pointer';
      } else {
        setTargetHover(0.0);
        document.body.style.cursor = 'auto';
        setTargetMousePos(
          new Vector2(currentMousePos.current.x, currentMousePos.current.y)
        );
      }
    },
    [scrollIndex, index, camera, size]
  );

  // Remove VirtualScroll listener from here (handled in Carousel)

  // When active, reset the parent's gallery progress values
  useEffect(() => {
    if (activeIndex === index) {
      setGalleryProg(0);
      setGalleryScrollY(0);
      hasBeenExpandedRef.current = true;
    }
  }, [activeIndex, index, setGalleryProg, setGalleryScrollY]);

  useEffect(() => {
    if (!localMaterialRef.current) return;
    const uniforms = localMaterialRef.current.uniforms;
    if (activeIndex === index && isDirectLoad) {
      uniforms.uActive.value = 1.0;
      uniforms.uActiveProgress.value = 1.0;
    }
    const shouldFadeOut = activeIndex !== null && activeIndex !== index;
    if (isDirectLoad) {
      uniforms.uOpacity.value = shouldFadeOut ? 0.0 : 1.0;
      gsap.to(uniforms.uFadeIn, {
        value: 1.0,
        duration: duration * 0.5,
        ease: 'power2.inOut',
        delay: 0.5,
      });
    } else {
      uniforms.uFadeIn.value = 1.0;
      gsap.to(uniforms.uOpacity, {
        value: shouldFadeOut ? 0.0 : 1.0,
        duration: duration * 0.5,
        ease: 'power2.inOut',
      });
    }
  }, [activeIndex, index, isDirectLoad, duration]);

  useEffect(() => {
    window.addEventListener('pointermove', handlePointerMove);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.body.style.cursor = 'auto';
    };
  }, [handlePointerMove]);

  useEffect(() => {
    const scaleX = viewport.width / PLANE_SIZE.x;
    const scaleY = viewport.height / PLANE_SIZE.y;
    if (localMaterialRef.current) {
      localMaterialRef.current.uniforms.uZoomScale.value = new THREE.Vector2(
        scaleX,
        scaleY
      );
    }
  }, [viewport.width, viewport.height]);

  useEffect(() => {
    if (localMaterialRef.current) {
      const uniforms = localMaterialRef.current.uniforms;
      localMaterialRef.current.transparent = true;
      uniforms.uTexture.value = texture;
      uniforms.uImageSize.value = new THREE.Vector2(
        texture.image.width,
        texture.image.height
      );
      materialRef(localMaterialRef.current);
    }
    return () => materialRef(null);
  }, [texture, materialRef]);

  const calculateWrapHeight = (numColumns: number, gap: number): number => {
    const totalHeight = numColumns * PLANE_SIZE.y + gap * numColumns;
    setWrapHeight(totalHeight);
    return totalHeight;
  };

  useFrame((state, delta) => {
    if (localMaterialRef.current) {
      const scrollSpringStrength = 0.035;
      const newProg = THREE.MathUtils.lerp(
        galleryProg,
        galleryScrollY,
        scrollSpringStrength
      );
      setGalleryProg(newProg);

      const springStrength = targetHover === 1.0 ? 2.5 : 1.5;
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
    }
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={hoverPlane}
        position={
          new THREE.Vector3(
            pos.x,
            activeIndex === index
              ? mod(pos.y + galleryProg + wrapHeight / 2, wrapHeight) -
                wrapHeight / 2
              : pos.y,
            pos.z
          )
        }
        visible={false}
        onClick={() => onClick(index)}
        onPointerOut={() => {
          setTargetHover(0.0);
          document.body.style.cursor = 'auto';
        }}
      >
        <planeGeometry args={[PLANE_SIZE.x + 0.2, PLANE_SIZE.y + 0.2, 1, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <mesh
        ref={meshRef}
        position={
          new THREE.Vector3(
            pos.x,
            activeIndex === index
              ? mod(pos.y + galleryProg + wrapHeight / 2, wrapHeight) -
                wrapHeight / 2
              : pos.y,
            pos.z
          )
        }
      >
        <planeGeometry args={[PLANE_SIZE.x, PLANE_SIZE.y, 32, 32]} />
        <carouselMaterial ref={localMaterialRef} transparent />
      </mesh>
      {displayedIndex === index && (
        <ProjectGallery
          planeSize={PLANE_SIZE}
          prog={galleryProg}
          calculateWrapHeight={calculateWrapHeight}
        />
      )}
    </group>
  );
};

export default CarouselImage;
