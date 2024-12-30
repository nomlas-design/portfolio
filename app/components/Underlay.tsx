import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useThree, useFrame, extend } from '@react-three/fiber';
import { calculatePlaneSize } from '@/app/utils/Sizes';
import { shaderMaterial, useTrailTexture } from '@react-three/drei';
import {
  tileFragmentShader,
  tileVertexShader,
} from '@/app/shaders/tileShaders';

const TileDisplacementMaterial = shaderMaterial(
  {
    uMouse: null,
    uColor: new THREE.Color('#e93131'),
    uResolution: new THREE.Vector2(),
    uGridSize: 16.0,
    uPlaneSize: new THREE.Vector2(1, 1),
  },
  tileVertexShader,
  tileFragmentShader
);

extend({ TileDisplacementMaterial });

const Underlay = () => {
  const { viewport, camera, size } = useThree();
  const materialRefBottom = useRef();
  const materialRefTop = useRef();

  // Create separate trail textures for top and bottom planes
  const [trailBottom, onMoveBottom] = useTrailTexture({
    size: 256,
    radius: 0.1,
    maxAge: 600,
    interpolate: 1,
    ease: function easeInOutCirc(x) {
      return x < 0.5
        ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
        : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
    },
  });

  const [trailTop, onMoveTop] = useTrailTexture({
    size: 256,
    radius: 0.01,
    maxAge: 600,
    interpolate: 1,
    ease: function easeInOutCirc(x) {
      return x < 0.5
        ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
        : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
    },
  });

  const [planeSize, positions] = useMemo(() => {
    const [width, height] = calculatePlaneSize(
      16,
      camera as THREE.PerspectiveCamera,
      viewport,
      0.04,
      0.3625
    );
    const totalHeight =
      2 *
      Math.tan(((camera as THREE.PerspectiveCamera).fov * Math.PI) / 180 / 2) *
      16;
    const planeHeight = height;
    const topY = totalHeight / 2 - planeHeight / 2;
    const bottomY = -(totalHeight / 2 - planeHeight / 2);
    return [
      [width, height, 1, 1] as [number, number, number, number],
      { topY, bottomY },
    ];
  }, [viewport.aspect, camera]);

  useFrame((_, delta) => {
    // Update bottom plane
    if (materialRefBottom.current) {
      materialRefBottom.current.uniforms.uResolution.value = new THREE.Vector2(
        size.width * viewport.dpr,
        size.height * viewport.dpr
      );
      materialRefBottom.current.uniforms.uPlaneSize.value = new THREE.Vector2(
        planeSize[0],
        planeSize[1]
      );
      materialRefBottom.current.uniforms.uMouse.value = trailBottom;
    }

    // Update top plane
    if (materialRefTop.current) {
      materialRefTop.current.uniforms.uResolution.value = new THREE.Vector2(
        size.width * viewport.dpr,
        size.height * viewport.dpr
      );
      materialRefTop.current.uniforms.uPlaneSize.value = new THREE.Vector2(
        planeSize[0],
        planeSize[1]
      );
      materialRefTop.current.uniforms.uMouse.value = trailTop;
    }
  });

  // Handle pointer events for each plane separately
  // const handlePointerMove = (e, callback) => {
  //   e.stopPropagation(); // Prevent event from bubbling up
  //   callback(e);
  // };

  return (
    <group>
      <mesh
        position={[0, positions.bottomY, -10]}
        // onPointerMove={(e) => handlePointerMove(e, onMoveBottom)}
      >
        <planeGeometry args={planeSize} />
        <tileDisplacementMaterial ref={materialRefBottom} />
      </mesh>
      <mesh
        position={[0, positions.topY, -10]}
        // onPointerMove={(e) => handlePointerMove(e, onMoveTop)}
      >
        <planeGeometry args={planeSize} />
        <tileDisplacementMaterial ref={materialRefTop} />
      </mesh>
    </group>
  );
};

export default Underlay;
