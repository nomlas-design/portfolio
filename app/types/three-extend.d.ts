import { MaterialProps } from '@react-three/fiber';
import { ShaderMaterial, Color } from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      carouselMaterial: MaterialProps & {
        ref?: React.RefObject<ShaderMaterial>;
        uTexture?: any;
        uProgress?: number;
        uHover?: number;
        uMouse?: any;
        uCurveFactor?: number;
        uClick?: number;
      };
      textMaterial: MaterialProps & {
        uColour?: Color;
        uOpacity?: number;
        uFadeStart?: number;
        uFadeEnd?: number;
        uTransition?: number;
        uTransitionDuration?: number;
      };
      backgroundMaterial: MaterialProps & {
        uColour?: Color;
        uTime?: number;
      };
      galleryMaterial: MaterialProps & {
        uIndex?: number;
        uTexture?: any;
      };
    }
  }
}
