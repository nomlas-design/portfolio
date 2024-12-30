import { MaterialProps } from '@react-three/fiber';
import { ShaderMaterial, Color } from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      carouselMaterial: MaterialProps & {
        ref?: React.RefObject<ShaderMaterial>;
        uTexture?: any;
        uProgress?: number;
      };
      backgroundImageMaterial: MaterialProps & {
        ref?: React.RefObject<ShaderMaterial>;
        uTexture?: any;
      };
      textMaterial: MaterialProps & {
        uColour?: Color;
        uOpacity?: number;
        uFadeStart?: number;
        uFadeEnd?: number;
      };
    }
  }
}
