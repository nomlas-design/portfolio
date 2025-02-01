import { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, useTexture } from '@react-three/drei';
import VirtualScroll from 'virtual-scroll';
import { mod } from '@/app/utils/MathUtils';
import * as THREE from 'three';
import { ShaderMaterial } from 'three';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import CarouselImage from './CarouselImage';
import CarouselText from './CarouselText';
import { useTransition } from '@/app/contexts/TransitionContext';
import ProjectInfo from './ProjectInfo';

const images = {
  image1: {
    name: 'Mindil Chambers',
    firstLine: 'Mindil',
    secondLine: 'Chambers',
    texture: '/images/img4.jpg',
    gallery: [
      '/images/img4.jpg',
      '/images/img5.jpg',
      '/images/img6.jpg',
      '/images/img7.jpg',
      '/images/img1.jpg',
      '/images/img2.jpg',
      '/images/img3.jpg',
    ],
  },
  image2: {
    name: 'Postcards to Orpheus',
    firstLine: 'Postcards',
    secondLine: 'to Orpheus',
    texture: '/images/img5.jpg',
    gallery: [
      '/images/img4.jpg',
      '/images/img5.jpg',
      '/images/img6.jpg',
      '/images/img7.jpg',
      '/images/img1.jpg',
      '/images/img2.jpg',
      '/images/img3.jpg',
    ],
  },
  image3: {
    name: 'The School of St Jude',
    firstLine: 'School of ',
    secondLine: ' St Jude',
    texture: '/images/img6.jpg',
    gallery: [
      '/images/img4.jpg',
      '/images/img5.jpg',
      '/images/img6.jpg',
      '/images/img7.jpg',
      '/images/img1.jpg',
      '/images/img2.jpg',
      '/images/img3.jpg',
    ],
  },
  image4: {
    name: 'Sipakatuo: Glorify One Another',
    firstLine: 'Sipakatuo',
    secondLine: '',
    texture: '/images/img7.jpg',
    gallery: [
      '/images/img4.jpg',
      '/images/img5.jpg',
      '/images/img6.jpg',
      '/images/img7.jpg',
      '/images/img1.jpg',
      '/images/img2.jpg',
      '/images/img3.jpg',
    ],
  },
  image5: {
    name: 'APAC BGIS',
    firstLine: 'APAC',
    secondLine: 'BGIS',
    texture: '/images/img1.jpg',
    gallery: [
      '/images/img4.jpg',
      '/images/img5.jpg',
      '/images/img6.jpg',
      '/images/img7.jpg',
      '/images/img1.jpg',
      '/images/img2.jpg',
      '/images/img3.jpg',
    ],
  },
  image6: {
    name: 'Dogmilk Films',
    firstLine: 'Dogmilk',
    secondLine: 'Films',
    texture: '/images/img2.jpg',
    gallery: [
      '/images/img4.jpg',
      '/images/img5.jpg',
      '/images/img6.jpg',
      '/images/img7.jpg',
      '/images/img1.jpg',
      '/images/img2.jpg',
      '/images/img3.jpg',
    ],
  },
  image7: {
    name: 'Marine Migrations',
    firstLine: 'Marine',
    secondLine: 'Migrations',
    texture: '/images/img3.jpg',
    gallery: [
      '/images/img4.jpg',
      '/images/img5.jpg',
      '/images/img6.jpg',
      '/images/img7.jpg',
      '/images/img1.jpg',
      '/images/img2.jpg',
      '/images/img3.jpg',
    ],
  },
};

const WRAP_SPACING = 1.59;
const WRAP_START = -2.85;
const TRANSITION_DURATION = 1.5;

interface CarouselProps {
  slug: string | null;
  isDirectLoad: boolean;
  setIsDirectLoad: (isDirectLoad: boolean) => void;
  isTransitioning: boolean;
}

const Carousel = ({ slug, isDirectLoad, setIsDirectLoad }: CarouselProps) => {
  const { activeIndex, displayedIndex, startTransition, transitioning } =
    useTransition();
  const [scrollY, setScrollY] = useState<number>(0);
  const [progState, setProgState] = useState(0);
  const [galleryProg, setGalleryProg] = useState(0);
  const [galleryScrollY, setGalleryScrollY] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [opacityScale, setOpacityScale] = useState(0.2);
  const [isCentered, setIsCentered] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const targetScrollY = useRef(0);
  const itemRefs = useRef(new Map<number, ShaderMaterial>());
  const scrollerRef = useRef<VirtualScroll | null>(null);
  const scrollTimoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastProgressRef = useRef(0);
  const router = useRouter();
  const textures = useTexture(Object.values(images).map((img) => img.texture));
  const imageCount = Object.keys(images).length;

  // If coming from a slug, initialise the progress state accordingly
  useEffect(() => {
    if (slug) {
      const idx = Object.values(images).findIndex((img) => {
        const slugName = img.name.replace(/\s+/g, '-').toLowerCase();
        return slugName === slug;
      });
      if (idx !== -1 && isDirectLoad) {
        const finalProgress = -(idx * WRAP_SPACING + WRAP_START);
        setScrollY(finalProgress);
        setProgState(finalProgress);
        startTransition(idx);
      }
    }
  }, [slug]);

  const texturesMap = useMemo(
    () =>
      Object.values(images).reduce(
        (acc, img, index) => ({ ...acc, [img.name]: textures[index] }),
        {}
      ),
    [textures]
  );

  useEffect(() => {
    const handleScroll = (event: { deltaY: number }) => {
      setGalleryScrollY((prev) => prev - event.deltaY * 0.002);
    };

    const scroller = new VirtualScroll({
      useKeyboard: true,
      passive: false,
      useTouch: true,
    });
    scroller.on(handleScroll);
    return () => {
      scroller.off(handleScroll);
      scroller.destroy();
    };
  }, []);

  useEffect(() => {
    console.log(transitioning);
  }, [transitioning]);

  // Combined click handler that merges scroll logic and GSAP animations.
  const handleClick = (index: number) => {
    console.log(transitioning);
    if (index !== currentImageIndex) return; // Only proceed if the clicked image is active

    // Transition logic (for expanding)
    if (activeIndex !== index) {
      const fullWrap = imageCount * WRAP_SPACING;
      const rawProgress = -progState;
      const wraps =
        rawProgress >= 0
          ? Math.floor(rawProgress / fullWrap)
          : Math.ceil(rawProgress / fullWrap);
      const remainder = rawProgress - wraps * fullWrap;
      const baseProgress = (remainder - WRAP_START) / WRAP_SPACING;
      const currentIndex = Math.round(baseProgress);
      const diff = index - mod(currentIndex, imageCount);
      const finalIndex = wraps * imageCount + currentIndex + diff;
      const finalProgress = -(finalIndex * WRAP_SPACING + WRAP_START);
      setScrollY(finalProgress);
      setIsCentered(true);
      startTransition(index);
    } else {
      startTransition(null);
    }

    // GSAP animation logic – target the material of the clicked image.
    const material = itemRefs.current.get(index);
    if (!material) return;
    const isExpanding = activeIndex !== index;
    const tl = gsap.timeline({ defaults: { ease: 'power1.inOut' } });
    if (isExpanding) {
      const imageObj = Object.values(images)[index];
      const path = imageObj.name.replace(/\s+/g, '-').toLowerCase();
      router.push(`/projects/${path}`);
      if (isDirectLoad) {
        material.uniforms.uActive.value = 1.0;
        material.uniforms.uActiveProgress.value = 1.0;
        material.uniforms.uOpacity.value = 0;
      } else {
        tl.to(material.uniforms.uActive, {
          value: 1.0,
          duration: TRANSITION_DURATION * 0.75,
        })
          .to(
            material.uniforms.uActiveProgress,
            { value: 1.0, duration: TRANSITION_DURATION * 0.75 },
            '<'
          )
          .to(
            material.uniforms.uOpacity,
            { value: 1.0, duration: TRANSITION_DURATION * 0.5 },
            '<'
          );
      }
    } else {
      router.push('/');
      setIsDirectLoad(false);
      tl.to(material.uniforms.uActive, {
        value: 0.0,
        duration: TRANSITION_DURATION,
      })
        .to(
          material.uniforms.uActiveProgress,
          {
            value: 0.0,
            duration: TRANSITION_DURATION * 0.75,
            ease: 'power1.out',
          },
          '<'
        )
        .to(
          material.uniforms.uOpacity,
          {
            value: 0.0,
            duration: TRANSITION_DURATION * 0.5,
            ease: 'power2.inOut',
          },
          '<'
        );
    }
  };

  // Scroll for carousel
  useEffect(() => {
    const handleScroll = (event: { deltaY: number }) => {
      if (activeIndex !== null) return;
      setScrollY((prev) => prev - event.deltaY * 0.002);
      setIsScrolling(true);
      setIsCentered(false);
      if (scrollTimoutRef.current) clearTimeout(scrollTimoutRef.current);
      scrollTimoutRef.current = setTimeout(() => setIsScrolling(false), 700);
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
  }, [activeIndex]);

  // Center images gradually when not scrolling
  const handleCenter = () => {
    if (isCentered || isScrolling || activeIndex !== null) return;
    const fullWrap = imageCount * WRAP_SPACING;
    const rawProgress = -progState;
    const wraps =
      rawProgress >= 0
        ? Math.floor(rawProgress / fullWrap)
        : Math.ceil(rawProgress / fullWrap);
    const remainder = rawProgress - wraps * fullWrap;
    let baseProgress = (remainder - WRAP_START) / WRAP_SPACING;
    const snapIndex = Math.round(baseProgress);
    const finalIndex = wraps * imageCount + snapIndex;
    const finalProgress = -(finalIndex * WRAP_SPACING + WRAP_START);
    targetScrollY.current = finalProgress;
    setScrollY(finalProgress);
    setIsCentered(true);
  };

  useFrame((state, delta) => {
    const springStrength = 0.035;
    const newProg = THREE.MathUtils.lerp(progState, scrollY, springStrength);
    if (!isDirectLoad) setProgState(newProg);
    if (Math.abs(newProg - lastProgressRef.current) > 0.005) {
      const direction = newProg > lastProgressRef.current ? 1 : -1;
      setDirection(direction);
      // Update current image index & opacity scale (logic remains unchanged)
      const wrapLength = imageCount * WRAP_SPACING;
      const normalised = -newProg;
      const adjusted = mod(normalised, wrapLength);
      const baseProgress = (adjusted - WRAP_START) / WRAP_SPACING;
      const rawIndex = Math.round(baseProgress);
      setCurrentImageIndex(mod(rawIndex, imageCount));
      lastProgressRef.current = newProg;
    } else {
      handleCenter();
    }
    const wrapLength = imageCount * WRAP_SPACING;
    itemRefs.current.forEach((material, index) => {
      if (material?.uniforms) {
        const progress =
          mod(newProg + index * WRAP_SPACING, wrapLength) + WRAP_START;
        material.uniforms.uProgress.value = progress;
        material.uniforms.uTime.value = state.clock.elapsedTime;
      }
    });
  });

  return (
    <>
      <group position={[-5.5, 0, -5]}>
        <CarouselText
          progress={progState}
          projects={images}
          activeIndex={currentImageIndex}
          wrapSpacing={WRAP_SPACING}
          opacityScale={opacityScale}
          expandedIndex={activeIndex}
          duration={TRANSITION_DURATION}
          isDirectLoad={isDirectLoad}
          setIsDirectLoad={setIsDirectLoad}
        />
      </group>
      <group position={[-1.5, 0, -2]}>
        {Object.values(images).map((image, index) => (
          <CarouselImage
            key={image.name}
            slug={slug ?? ''}
            index={index}
            image={image}
            pos={new THREE.Vector3(0, 0, 1.5)}
            materialRef={(ref) => {
              if (ref) {
                itemRefs.current.set(index, ref);
              } else {
                itemRefs.current.delete(index);
              }
            }}
            scrollIndex={currentImageIndex}
            onClick={handleClick}
            duration={TRANSITION_DURATION}
            isDirectLoad={isDirectLoad}
            setIsDirectLoad={setIsDirectLoad}
            galleryProg={galleryProg}
            setGalleryProg={setGalleryProg}
            galleryScrollY={galleryScrollY}
            setGalleryScrollY={setGalleryScrollY}
          />
        ))}
      </group>
      <group>
        {displayedIndex !== null && activeIndex !== null && (
          <ProjectInfo handleBack={() => handleClick(activeIndex)} />
        )}
      </group>
    </>
  );
};

export default Carousel;
