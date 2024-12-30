import { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, useTexture, Text } from '@react-three/drei';
import VirtualScroll from 'virtual-scroll';
import { mod } from '@/app/utils/MathUtils';
import * as THREE from 'three';
import gsap from 'gsap';
import CarouselImage from './CarouselImage';
import CarouselText from './CarouselText';

const images = {
  image1: {
    name: 'Mindil Chambers',
    firstLine: 'Mindil',
    secondLine: 'Chambers',
    texture: '/images/img4.jpg',
  },
  image2: {
    name: 'Postcards to Orpheus',
    firstLine: 'Postcards',
    secondLine: 'to Orpheus',
    texture: '/images/img5.jpg',
  },
  image3: {
    name: 'The School of St Jude',
    firstLine: 'School of ',
    secondLine: ' St Jude',
    texture: '/images/img6.jpg',
  },
  image4: {
    name: 'Sipakatuo: Glorify One Another',
    firstLine: 'Sipakatuo',
    secondLine: '',
    texture: '/images/img7.jpg',
  },
  image5: {
    name: 'APAC BGIS',
    firstLine: 'APAC',
    secondLine: 'BGIS',
    texture: '/images/img1.jpg',
  },
  image6: {
    name: 'Dogmilk Films',
    firstLine: 'Dogmilk',
    secondLine: 'Films',
    texture: '/images/img2.jpg',
  },
  image7: {
    name: 'Marine Migrations',
    firstLine: 'Marine',
    secondLine: 'Migrations',
    texture: '/images/img3.jpg',
  },
};

const WRAP_SPACING = 1.59;
const WRAP_START = -2.85;

const Carousel = () => {
  const [scrollY, setScrollY] = useState(0);
  const [prog, setProg] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [opacityScale, setOpacityScale] = useState(0.2);
  const [isCentered, setIsCentered] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [direction, setDirection] = useState(1);
  const targetScrollY = useRef(0);
  const itemRefs = useRef(new Map());
  const scrollerRef = useRef<VirtualScroll | null>(null);
  const scrollTimoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProgressRef = useRef(0);

  const { viewport } = useThree();

  const textures = useTexture(Object.values(images).map((img) => img.texture));
  const imageCount = Object.keys(images).length;

  const curveFactorRef = useRef(0);

  const texturesMap = useMemo(
    () =>
      Object.values(images).reduce(
        (acc, img, index) => ({
          ...acc,
          [img.name]: textures[index],
        }),
        {}
      ),
    [textures]
  );

  const getInterpolatedScale = (t: number) => {
    const minScale = 0.25;
    const maxScale = 1;

    // Convert to range -1 to 1
    const x = 2 * t - 1;
    // Use cosine for smooth transition
    const ease = Math.pow(Math.cos((x * Math.PI) / 2), 2);

    return minScale + (maxScale - minScale) * ease;
  };

  const getActiveIndexAndScale = (progress: number) => {
    const wrapLength = imageCount * WRAP_SPACING;
    const normalised = -progress;
    const adjusted = mod(normalised, wrapLength);
    const baseProgress = (adjusted - WRAP_START) / WRAP_SPACING;

    // Active index
    const rawIndex = Math.round(baseProgress);
    const activeIndex = mod(rawIndex, imageCount);

    // Fractional offset used for the triangle wave
    const fractional = baseProgress - rawIndex + 0.5;
    const clampedFrac = Math.min(Math.max(fractional, 0), 1);

    // Final scale
    const scale = getInterpolatedScale(clampedFrac);

    return { activeIndex, scale };
  };

  useEffect(() => {
    const handleScroll = (event: { deltaY: number }) => {
      setScrollY((prev) => prev - event.deltaY * 0.002);

      setIsScrolling(true);
      setIsCentered(false);

      if (scrollTimoutRef.current) {
        clearTimeout(scrollTimoutRef.current);
      }

      scrollTimoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 700);
    };

    scrollerRef.current = new VirtualScroll({
      useKeyboard: true,
      passive: false,
      useTouch: true,
    });

    scrollerRef.current?.on(handleScroll);

    return () => {
      if (scrollerRef.current) {
        scrollerRef.current.off(handleScroll);
        scrollerRef.current.destroy();
      }
    };
  }, []);

  const handleCenter = () => {
    if (isCentered || isScrolling) return;
    const fullWrap = imageCount * WRAP_SPACING;
    const rawProgress = -prog;
    const wraps =
      rawProgress >= 0
        ? Math.floor(rawProgress / fullWrap)
        : Math.ceil(rawProgress / fullWrap);
    const remainder = rawProgress - wraps * fullWrap;
    let baseProgress = (remainder - WRAP_START) / WRAP_SPACING;
    if (opacityScale < 0.75) {
      direction < 0
        ? (baseProgress += WRAP_SPACING / 2)
        : (baseProgress -= WRAP_SPACING / 2);
    }
    const snapIndex = Math.round(baseProgress);
    const finalIndex = wraps * imageCount + snapIndex;
    const finalProgress = -(finalIndex * WRAP_SPACING + WRAP_START);

    targetScrollY.current = finalProgress;
    setScrollY(finalProgress);
  };

  useFrame((state, delta) => {
    const springStrength = 0.035;
    const newProg = THREE.MathUtils.lerp(prog, scrollY, springStrength);
    setProg(newProg);

    if (Math.abs(newProg - lastProgressRef.current) > 0.005) {
      const direction = newProg > lastProgressRef.current ? 1 : -1;
      setDirection(direction);
      const newIndex = getActiveIndexAndScale(newProg);
      setCurrentImageIndex(newIndex.activeIndex);
      setOpacityScale(newIndex.scale);
      lastProgressRef.current = newProg;
    } else {
      handleCenter();
    }

    const imageCount = Object.keys(images).length;
    const wrapLength = imageCount * WRAP_SPACING;

    itemRefs.current.forEach((material, index) => {
      if (material?.uniforms) {
        let progress =
          mod(newProg + index * WRAP_SPACING, wrapLength) + WRAP_START;
        material.uniforms.uProgress.value = progress;
        material.uniforms.uTime.value = state.clock.elapsedTime;
      }
    });
  });

  const currentImage = Object.values(images)[currentImageIndex];

  const handleIntro = () => {
    gsap.to(curveFactorRef, {
      current: 1,
      duration: 2,
      ease: 'power1.inOut',
    });
  };

  return (
    <>
      <group position={[-5.5, 0, -5]}>
        <CarouselText
          progress={prog}
          projects={images}
          activeIndex={currentImageIndex}
          wrapSpacing={WRAP_SPACING}
          opacityScale={opacityScale}
        />
      </group>
      <group position={[-2, 0, -2]}>
        {Object.values(images).map((image, index) => (
          <CarouselImage
            key={image.name}
            index={index}
            image={image}
            pos={new THREE.Vector3(0.5, 0, 1.5)}
            curveFactor={curveFactorRef.current}
            materialRef={(ref) => {
              if (ref) {
                itemRefs.current.set(index, ref);
              } else {
                itemRefs.current.delete(index);
              }
            }}
            activeIndex={currentImageIndex}
          />
        ))}
      </group>
    </>
  );
};

export default Carousel;
