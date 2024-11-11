import { MaterialProps } from '@react-three/fiber';
import { ShaderMaterial } from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      carouselMaterial: MaterialProps & {
        ref?: React.RefObject<ShaderMaterial>;
        uTexture?: any;
        uProgress?: number;
      };
    }
  }
}
