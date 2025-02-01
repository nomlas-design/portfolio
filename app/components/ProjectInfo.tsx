import { Html } from '@react-three/drei';
import { useLayoutEffect, useRef } from 'react';
import { useTransition } from '../contexts/TransitionContext';

interface ProjectInfoProps {
  handleBack: () => void;
}

const ProjectInfo = ({ handleBack }: ProjectInfoProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { progress, startTransition } = useTransition();

  // useLayoutEffect runs synchronously after DOM mutations
  // ensuring our element’s style is set before the browser paints.
  useLayoutEffect(() => {
    if (contentRef.current) {
      // At progress 0: content is off-screen (300px right) and fully transparent.
      // At progress 1: content is in place (x = 0) and fully opaque.
      const xOffset = 300 * (1 - progress);
      contentRef.current.style.transform = `translateX(${xOffset}px)`;
      contentRef.current.style.opacity = progress.toString();
    }
  }, [progress]);

  return (
    <Html>
      <div className='wrapper'>
        <div className='container'>
          <main
            ref={contentRef}
            className='content content--right'
            // Set initial inline styles to prevent flash before animation kicks in.
            style={{ transform: 'translateX(300px)', opacity: 0 }}
          >
            <button onClick={handleBack}>Back</button>
            <h1>Project Title</h1>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sed
              justo blandit, scelerisque turpis vel, laoreet elit.
            </p>
            <p>
              Suspendisse vestibulum diam sed mauris feugiat, ut eleifend mauris
              fringilla. Sed pellentesque maximus malesuada.
            </p>
          </main>
        </div>
      </div>
    </Html>
  );
};

export default ProjectInfo;
