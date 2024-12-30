import { Text, shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { textFragmentShader, textVertexShader } from '../shaders/textShaders';

interface CarouselTextLineProps {
  text: string;
  position: [number, number, number];
  index: number;
  onWidthComputed: (index: number, width: number) => void;
  opacity: number;
  anchorX: number | 'center' | 'right' | 'left' | undefined;
}

const CarouselTextLine = ({
  text,
  position,
  index,
  onWidthComputed,
  opacity,
  anchorX,
}: CarouselTextLineProps) => {
  const textRef = useRef<THREE.Mesh>(null);

  const TextMaterial = useMemo(() => {
    return shaderMaterial(
      {
        uColour: new THREE.Color('#ebece9'),
        uOpacity: opacity,
        uFadeStart: 2.0,
        uFadeEnd: 4.0,
      },
      textVertexShader,
      textFragmentShader,
      (material) => {
        if (material) {
          material.transparent = true;
          material.side = THREE.DoubleSide;
        }
      }
    );
  }, [opacity]);

  extend({ TextMaterial });

  const handleSync = (mesh: THREE.Mesh) => {
    mesh.geometry.computeBoundingBox();
    if (mesh.geometry.boundingBox) {
      const { boundingBox } = mesh.geometry;
      const width = boundingBox.max.x - boundingBox.min.x;
      onWidthComputed(index, width);
    }
  };

  return (
    <Text
      ref={textRef}
      fontSize={0.6}
      font='./fonts/HelveticaNowDisplay-Bold.woff'
      anchorX={anchorX}
      anchorY='middle'
      position={position}
      onSync={handleSync}
    >
      <textMaterial
        transparent
        uColour={new THREE.Color('#ebece9')}
        uOpacity={opacity}
        uFadeStart={-5.0}
        uFadeEnd={10}
      />
      {text.toUpperCase()}
    </Text>
  );
};

export default CarouselTextLine;
