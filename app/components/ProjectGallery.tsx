import { Vector2 } from 'three';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import GalleryImage from './GalleryImage';
import { useState, useEffect } from 'react';
import { mod } from '@/app/utils/MathUtils';
import gsap from 'gsap';

interface ProjectGalleryProps {
  gallery?: string[] | null;
  planeSize: Vector2;
  prog: number;
  calculateWrapHeight: (numColumns: number, gap: number) => number;
  isTransitioning: boolean;
  transitionDirection: 'in' | 'out';
}

const ProjectGallery = ({
  gallery,
  planeSize,
  prog,
  calculateWrapHeight,
}: ProjectGalleryProps) => {
  const [wrapHeight, setWrapHeight] = useState(0);
  const gap = 0.1;
  const fullWidth = planeSize.x;
  const fullHeight = planeSize.y;
  const halfWidth = fullWidth / 2;
  const halfHeight = fullHeight / 2;

  useEffect(() => {
    setWrapHeight(calculateWrapHeight(3.5, gap));
  }, [gap, calculateWrapHeight]);

  return (
    <>
      {/* Top-left box */}
      <Html position={[0, 0, 2]}>
        <h1>Test</h1>
      </Html>
      <GalleryImage
        planeSize={new THREE.Vector2(halfWidth - gap / 2, halfHeight - gap / 2)}
        pos={
          new THREE.Vector3(
            -halfWidth / 2 - gap / 4,
            mod(
              (5 * halfHeight) / 2 + (6 * gap) / 5 + prog + wrapHeight / 2,
              wrapHeight
            ) -
              wrapHeight / 2,
            1.501
          )
        }
        color='green'
        index={0}
        texture={gallery ? gallery[0] : null}
      />

      {/* Right box */}
      <GalleryImage
        planeSize={new THREE.Vector2(halfWidth - gap / 2, fullHeight)}
        pos={
          new THREE.Vector3(
            halfWidth / 2 + gap / 4,
            mod(fullHeight + gap + prog + wrapHeight / 2, wrapHeight) -
              wrapHeight / 2,
            1.501
          )
        }
        color='blue'
        index={1}
        texture={gallery ? gallery[1] : null}
      />
      <GalleryImage
        planeSize={new THREE.Vector2(halfWidth - gap / 2, halfHeight - gap / 2)}
        pos={
          new THREE.Vector3(
            -halfWidth / 2 - gap / 4,
            mod(
              (3 * halfHeight) / 2 + (7 * gap) / 10 + prog + wrapHeight / 2,
              wrapHeight
            ) -
              wrapHeight / 2,
            1.501
          )
        }
        color='red'
        index={2}
        texture={gallery ? gallery[2] : null}
      />

      <GalleryImage
        planeSize={new THREE.Vector2(halfWidth - gap / 2, halfHeight - gap / 2)}
        pos={
          new THREE.Vector3(
            -halfWidth / 2 - gap / 4,
            mod(
              -((3 * halfHeight) / 2 + (7 * gap) / 10) + prog + wrapHeight / 2,
              wrapHeight
            ) -
              wrapHeight / 2,
            1.5
          )
        }
        color='purple'
        index={3}
        texture={gallery ? gallery[3] : null}
      />

      <GalleryImage
        planeSize={new THREE.Vector2(halfWidth - gap / 2, halfHeight - gap / 2)}
        pos={
          new THREE.Vector3(
            halfWidth / 2 + gap / 4,
            mod(
              -((3 * halfHeight) / 2 + (7 * gap) / 10) + prog + wrapHeight / 2,
              wrapHeight
            ) -
              wrapHeight / 2,
            1.5
          )
        }
        color='yellow'
        index={4}
        texture={gallery ? gallery[4] : null}
      />

      <GalleryImage
        planeSize={new THREE.Vector2(fullWidth, fullHeight)}
        pos={
          new THREE.Vector3(
            0,
            mod(
              -(fullHeight + halfHeight + gap * 1.5) + prog + wrapHeight / 2,
              wrapHeight
            ) -
              wrapHeight / 2,
            1.5
          )
        }
        color='orange'
        index={5}
        texture={gallery ? gallery[5] : null}
      />
    </>
  );
};

export default ProjectGallery;
