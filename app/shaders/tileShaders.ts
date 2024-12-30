export const tileVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const tileFragmentShader = /* glsl */ `
  varying vec2 vUv;
  uniform float uGridSize;
  uniform vec2 uResolution;
  uniform vec2 uPlaneSize;
  uniform sampler2D uMouse;

  float sdfCircle(vec2 p, float r) {
    return length(p - 0.5) - r;
  }

  void main() {
    // Calculate aspect-corrected UVs
    vec2 aspect = vec2(max(uPlaneSize.x/uPlaneSize.y, 1.0), max(uPlaneSize.y/uPlaneSize.x, 1.0));
    vec2 aspectUv = vUv * aspect;
   
    // Use aspect-corrected UVs for grid calculation and center position
    vec2 gridPos = aspectUv * uGridSize;
    vec2 gridUv = fract(gridPos);
   
    // Calculate grid center using aspect-corrected coordinates
    vec2 gridUvCenter = (floor(aspectUv * uGridSize) + 0.5) / (uGridSize * aspect);
   
    float trail = texture2D(uMouse, gridUvCenter).r;
    
    // Calculate displacement based on mouse trail
    vec2 displacement = vec2(
      sin(trail * 10.0) * 0.2,  // X displacement
      cos(trail * 10.0) * 0.2   // Y displacement
    ) * trail;
    
    // Apply displacement to UV coordinates
    vec2 displacedUv = gridUv + displacement;
    
    // Check if we're outside the square after displacement
    bool outsideSquare = displacedUv.x < 0.0 || displacedUv.x > 1.0 || 
                        displacedUv.y < 0.0 || displacedUv.y > 1.0;
    
    // Set colors based on trail and displacement
    vec3 color;
    if (trail > 0.1) {
      // Where mouse influences, show black if displaced UV is outside square
      color = outsideSquare ? vec3(0.0) : vec3(1.0, 0.0, 0.0);
    } else {
      // Default red background
      color = vec3(1.0, 0.0, 0.0);
    }
    
    gl_FragColor = vec4(color, 1.0);
  }
`;
