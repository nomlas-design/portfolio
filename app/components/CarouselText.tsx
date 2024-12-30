import { useEffect, useState } from 'react';
import { mod } from '@/app/utils/MathUtils';
import CarouselTextLine from './CarouselTextLine';

interface Project {
  name: string;
  firstLine: string;
  secondLine: string;
  texture: string;
}

interface CarouselTextProps {
  projects: Record<string, Project>;
  progress: number;
  activeIndex: number;
  wrapSpacing: number;
  opacityScale: number;
}

export default function CarouselText({
  projects,
  progress,
  activeIndex,
  wrapSpacing,
  opacityScale = 0.2,
}: CarouselTextProps) {
  const projectArray = Object.values(projects);
  const totalItems = projectArray.length;

  const [maxWidth, setMaxWidth] = useState(0);

  const handleWidth = (_: number, w: number) => {
    setMaxWidth((prev) => Math.max(prev, w));
  };

  const gap = 0.5;

  const textPerIndex = maxWidth + gap;

  const finalWidth = textPerIndex * totalItems;

  const textSpeedFactor = textPerIndex / wrapSpacing;

  return (
    <group>
      {/* LINE 1 */}
      {[...Array(2)].map((_, repIndex) => (
        <group key={`line1-rep-${repIndex}`}>
          {projectArray.map((project, index) => {
            const textOpacity = index === activeIndex ? opacityScale : 0.25;
            const baseOffset = index * textPerIndex;
            const offsetX = mod(
              progress * textSpeedFactor + baseOffset,
              finalWidth
            );
            const finalX = offsetX - finalWidth * repIndex;

            return (
              <CarouselTextLine
                key={`line1-${project.name}-${index}-rep-${repIndex}`}
                text={project.firstLine}
                position={[finalX, 0.275, 0]}
                index={index}
                onWidthComputed={handleWidth}
                opacity={textOpacity}
                anchorX='center'
              />
            );
          })}
        </group>
      ))}

      {/* LINE 2 */}

      {[...Array(2)].map((_, repIndex) => (
        <group key={`line2-rep-${repIndex}`}>
          {projectArray.map((project, index) => {
            const textOpacity = index === activeIndex ? opacityScale : 0.25;
            const baseOffset = -index * textPerIndex + finalWidth / 2 + 0.7;
            const offsetX = mod(
              -progress * textSpeedFactor + baseOffset,
              finalWidth
            );
            const finalX = offsetX - finalWidth * repIndex;

            return (
              <CarouselTextLine
                key={`line2-${project.name}-${index}-rep-${repIndex}`}
                text={project.secondLine}
                position={[finalX, -0.275, 0]}
                index={index}
                onWidthComputed={handleWidth}
                opacity={textOpacity}
                anchorX='center'
              />
            );
          })}
        </group>
      ))}
    </group>
  );
}
