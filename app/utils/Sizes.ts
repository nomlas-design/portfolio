import * as THREE from 'three';

interface Viewport {
  aspect: number;
}

export const calculatePlaneSize = (
  distance: number,
  camera: THREE.PerspectiveCamera,
  viewport: Viewport,
  padding: number = 0.01,
  heightRatio: number
) => {
  const vFov = (camera.fov * Math.PI) / 180;
  const height = 2 * Math.tan(vFov / 2) * distance;
  const width = height * viewport.aspect;
  const finalWidth = width;
  const finalHeight = height * heightRatio;
  return [finalWidth, finalHeight];
};
