import { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame, extend, useThree } from '@react-three/fiber';
import { shaderMaterial, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ShaderMaterial } from 'three';
import { useControls } from 'leva';
import { easing } from 'maath';
import { calculatePlaneSize } from '@/app/utils/Sizes';
import {
  backgroundVertexShader,
  backgroundFragmentShader,
} from '@/app/shaders/backgroundShaders';

interface BackgroundImageProps {
  image: THREE.Texture;
  prog: number;
  heading: string;
}

const BackgroundImage = ({ image, prog, heading }: BackgroundImageProps) => {
  const localMaterialRef = useRef<ShaderMaterial>(null);
  const { viewport, camera } = useThree();
  const [previousTexture, setPreviousTexture] = useState<THREE.Texture | null>(
    null
  );
  const [lastProg, setLastProg] = useState(0);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [textWidth, setTextWidth] = useState(1);

  const planeSize = useMemo(() => {
    const [x, y] = calculatePlaneSize(
      16,
      camera as THREE.PerspectiveCamera,
      viewport,
      0.04,
      0.275
    );
    return [x, y, 1, 1];
  }, [viewport.aspect, camera]);

  const handleTextWidth = (width: number) => {
    const worldWidth = (width / window.innerWidth) * planeSize[0];
    setTextWidth(worldWidth);
  };

  const getImageDimensions = (texture: THREE.Texture) => {
    return {
      width: texture.image?.width || 1,
      height: texture.image?.height || 1,
    };
  };

  const BackgroundImageMaterial = useMemo(() => {
    return shaderMaterial(
      {
        uCurrentTexture: null,
        uPreviousTexture: null,
        uTransitionProgress: 0,
        uEffectFactor: 1.2,
        uImageSize: new THREE.Vector2(1, 1),
        uMeshSize: new THREE.Vector2(planeSize[0], planeSize[1]),
        uTime: 0,
        uIsReversed: true,
      },
      backgroundVertexShader,
      backgroundFragmentShader
    );
  }, [backgroundFragmentShader, backgroundVertexShader]);

  extend({ BackgroundImageMaterial });

  useEffect(() => {
    if (localMaterialRef.current) {
      if (localMaterialRef.current.uniforms.uCurrentTexture.value !== image) {
        // Store current texture as previous before updating
        setPreviousTexture(
          localMaterialRef.current.uniforms.uCurrentTexture.value
        );

        // Update textures
        localMaterialRef.current.uniforms.uPreviousTexture.value =
          localMaterialRef.current.uniforms.uCurrentTexture.value;
        localMaterialRef.current.uniforms.uCurrentTexture.value = image;

        // Update image size uniform when the texture changes
        const { width, height } = getImageDimensions(image);
        localMaterialRef.current.uniforms.uImageSize.value.set(width, height);

        // Reset transition
        setTransitionProgress(0);
        setIsTransitioning(true);
      }

      // Always update mesh size uniform in case viewport changes
      localMaterialRef.current.uniforms.uMeshSize.value.set(
        planeSize[0],
        planeSize[1]
      );
    }
  }, [image, planeSize]);

  useFrame((_, delta) => {
    if (localMaterialRef.current) {
      localMaterialRef.current.uniforms.uTime.value += delta;
    }
    if (localMaterialRef.current && isTransitioning) {
      // Update transition progress
      if (lastProg < prog) {
        localMaterialRef.current.uniforms.uIsReversed.value = false;
      } else {
        localMaterialRef.current.uniforms.uIsReversed.value = true;
      }
      setLastProg(prog);

      const newProgress = Math.min(transitionProgress + delta * 2, 1);
      setTransitionProgress(newProgress);

      localMaterialRef.current.uniforms.uTransitionProgress.value = newProgress;

      // Check if transition is complete
      if (newProgress >= 1) {
        setIsTransitioning(false);
        setPreviousTexture(null);
      }
    }
  });

  return (
    <>
      <mesh position={[0, 0, -10]}>
        <planeGeometry args={planeSize} />
        <backgroundImageMaterial ref={localMaterialRef} transparent={true} />
      </mesh>
    </>
  );
};

export default BackgroundImage;
