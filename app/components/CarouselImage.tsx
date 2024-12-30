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
}

const MAX_ROTATE_X = 0.1; // Approximately 5.7 degrees
const MAX_ROTATE_Y = 0.1; // Approximately 5.7 degrees

const CarouselImage = ({
  image,
  pos,
  materialRef,
  curveFactor,
  index,
  activeIndex,
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
  const currentRotateX = useRef(0.0); // Current rotation around X-axis
  const currentRotateY = useRef(0.0); // Current rotation around Y-axis

  const { size, camera } = useThree();
  const raycaster = useRef(new Raycaster());
  const mouse = useRef(new Vector2());

  // Handle pointer movements to set target mouse position using Raycaster
  interface PointerMoveEvent extends MouseEvent {
    clientX: number;
    clientY: number;
  }

  const handlePointerMove = (event: PointerMoveEvent) => {
    if (index !== activeIndex) return;

    // Calculate normalized device coordinates (-1 to +1) for both components
    mouse.current.x = (event.clientX / size.width) * 2 - 1;
    mouse.current.y = -(event.clientY / size.height) * 2 + 1;

    // Update the Raycaster with the camera and mouse position
    raycaster.current.setFromCamera(mouse.current, camera);

    // Calculate objects intersected by the ray
    const intersects = raycaster.current.intersectObject(
      groupRef.current as THREE.Object3D,
      true
    );

    if (intersects.length > 0) {
      const intersect = intersects[0];
      // Convert intersection point to local coordinates of the plane
      const localPoint = intersect.object.worldToLocal(intersect.point);
      setTargetMousePos(new Vector2(localPoint.x, localPoint.y));
    }
  };

  const handlePointerOver = () => {
    if (index === activeIndex) {
      setTargetHover(1.0);
    }
  };

  const handlePointerOut = () => {
    setTargetHover(0.0);
    setTargetMousePos(new Vector2(0, 0));
  };

  useEffect(() => {
    // Attach pointer move event to the mesh
    window.addEventListener('pointermove', handlePointerMove);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [activeIndex, index, camera, size]);

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
        uMouse: new Vector2(0, 0), // Mouse position
        uHover: 0.0, // Hover state
        uRotateX: 0.0, // Rotation around X-axis
        uRotateY: 0.0, // Rotation around Y-axis
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

  // Easing function for smooth transitions
  const easeInOut = (t: number): number =>
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  // Update shader uniforms with interpolated values
  useFrame((state, delta) => {
    if (localMaterialRef.current) {
      const interpolationSpeed = 5; // Adjust as needed

      // Interpolate currentHover towards targetHover with easing
      currentHover.current = THREE.MathUtils.lerp(
        currentHover.current,
        targetHover,
        easeInOut(interpolationSpeed * delta)
      );

      // Interpolate currentMousePos towards targetMousePos with easing
      currentMousePos.current.lerp(targetMousePos, interpolationSpeed * delta);

      // Clamp mouse position within plane bounds (assuming plane size [2.5, 1.7])
      currentMousePos.current.x = THREE.MathUtils.clamp(
        currentMousePos.current.x,
        -1.25,
        1.25
      ); // Half of plane width
      currentMousePos.current.y = THREE.MathUtils.clamp(
        currentMousePos.current.y,
        -0.85,
        0.85
      ); // Half of plane height

      // Calculate rotation angles based on mouse position
      const rotateXAngle = (currentMousePos.current.y / 0.85) * MAX_ROTATE_X; // Normalize and scale
      const rotateYAngle = -(currentMousePos.current.x / 1.25) * MAX_ROTATE_Y; // Negative to rotate in opposite direction

      // Interpolate current rotation angles towards target angles
      currentRotateX.current = THREE.MathUtils.lerp(
        currentRotateX.current,
        rotateXAngle,
        interpolationSpeed * delta
      );
      currentRotateY.current = THREE.MathUtils.lerp(
        currentRotateY.current,
        rotateYAngle,
        interpolationSpeed * delta
      );

      // Update shader uniforms
      localMaterialRef.current.uniforms.uHover.value = currentHover.current;
      localMaterialRef.current.uniforms.uMouse.value = currentMousePos.current;
      localMaterialRef.current.uniforms.uRotateX.value = currentRotateX.current;
      localMaterialRef.current.uniforms.uRotateY.value = currentRotateY.current;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh
        position={pos}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <planeGeometry args={[2.5, 1.7, 30, 30]} />
        <carouselMaterial ref={localMaterialRef} transparent={true} />
      </mesh>
    </group>
  );
};

export default CarouselImage;
