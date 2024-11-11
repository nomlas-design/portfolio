import { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import VirtualScroll from 'virtual-scroll';
import { Vector3 } from 'three';
import * as THREE from 'three';
import CarouselItem from './CarouselItem';

const images = {
  image1: {
    name: 'image1',
    texture: '/images/img1.jpg',
  },
  image2: {
    name: 'image2',
    texture: '/images/img2.jpg',
  },
  image3: {
    name: 'image3',
    texture: '/images/img3.jpg',
  },
  image4: {
    name: 'image4',
    texture: '/images/img2.jpg',
  },
  image5: {
    name: 'image5',
    texture: '/images/img2.jpg',
  },
};
const minScroll = -7.2; // Adjust these values based on your needs
const maxScroll = 2.2;

// Add dampening factor
const dampeningFactor = 0.3;

const Carousel = () => {
  const [scrollY, setScrollY] = useState(0);
  const [prog, setProg] = useState(0);
  const [animating, setAnimating] = useState(false);
  const itemRefs = useRef(new Map());

  useEffect(() => {
    const scroller = new VirtualScroll({
      useKeyboard: false,
      passive: false,
    });

    const handleScroll = (event: any) => {
      if (animating) return;
      setScrollY((prev) => {
        const delta = event.deltaY * 0.005;
        const nextScroll = prev + delta;

        // Apply dampening when approaching bounds
        if (nextScroll < minScroll) {
          const overflow = minScroll - nextScroll;
          return minScroll - overflow * dampeningFactor;
        }

        if (nextScroll > maxScroll) {
          const overflow = nextScroll - maxScroll;
          return maxScroll + overflow * dampeningFactor;
        }

        return nextScroll;
      });
    };

    scroller.on(handleScroll);

    return () => {
      scroller.off(handleScroll);
      scroller.destroy();
    };
  }, []);

  useFrame(() => {
    // Add spring effect to make the movement smoother
    const springStrength = 0.1;

    // Clamp the scroll value to bounds
    const clampedScroll = THREE.MathUtils.clamp(scrollY, minScroll, maxScroll);

    // Smoothly interpolate to the clamped value
    const newProg = THREE.MathUtils.lerp(prog, clampedScroll, springStrength);
    setProg(newProg);

    // Update shader uniforms
    itemRefs.current.forEach((material, index) => {
      if (material?.uniforms) {
        material.uniforms.uProgress.value = newProg + index * 2;
      }
    });
  });

  return (
    <group>
      {Object.values(images).map((image, index) => (
        <CarouselItem
          key={image.name}
          index={index}
          image={image}
          pos={new THREE.Vector3(0, 0, 0)}
          materialRef={(ref) => {
            if (ref) {
              itemRefs.current.set(index, ref);
            } else {
              itemRefs.current.delete(index);
            }
          }}
        />
      ))}
    </group>
  );
};

export default Carousel;
