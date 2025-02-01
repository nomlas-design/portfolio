import { Text } from '@react-three/drei';
import { useRef } from 'react';

const ProjectTitle = ({ title = 'Project Info' }) => {
  const textRef = useRef<THREE.Mesh>(null);
  return (
    <Text
      ref={textRef}
      fontSize={0.2}
      font='/fonts/HelveticaNowDisplay-Bold.woff'
      anchorX={'left'}
      anchorY='middle'
      color='white'
    >
      {title.toUpperCase()}
    </Text>
  );
};

export default ProjectTitle;
