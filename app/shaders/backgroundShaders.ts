export const backgroundVertexShader = /* glsl */ `
  precision mediump float;
  
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const backgroundFragmentShader = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  
  varying vec2 vUv;

  // Noise function for grain effect
  float noise(vec2 co) {
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    // Base gray color
    vec3 baseColor = vec3(0.2);
    
    // Constants for shadow
    float shadowSize = 0.001;        // Size of shadow (smaller value = smaller shadow)
    float shadowStrength = 0.35;     // Maximum shadow darkness
    float shadowSoftness = 0.2;    // Edge softness
    
    // Calculate shadows using UV coordinates
    float topShadow = smoothstep(shadowSize, shadowSize + shadowSoftness, vUv.y);
    float bottomShadow = smoothstep(shadowSize, shadowSize + shadowSoftness, 1.0 - vUv.y);
    
    // Combine shadows
    float shadowMask = min(topShadow, bottomShadow);
    shadowMask = mix(1.0 - shadowStrength, 1.0, shadowMask);
    
    // Generate time-based noise
    vec2 noiseCoord = vUv * 2.0 + uTime * 0.1;
    float grainAmount = noise(noiseCoord) * 0.05;
    
    // Apply noise and shadows to base color
    vec3 finalColor = baseColor * shadowMask + vec3(grainAmount);
    finalColor = clamp(finalColor, vec3(0.0), vec3(1.0));
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
