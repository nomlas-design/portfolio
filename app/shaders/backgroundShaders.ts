// backgroundShaders.ts

export const backgroundVertexShader = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const backgroundFragmentShader = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  uniform float uTransitionProgress;
  uniform vec3 uColour1;
  uniform vec3 uColour2;
  uniform vec3 uColour3;
  varying vec2 vUv;

  #define GRAIN_INTENSITY 0.1

  // Film grain utilities
  vec2 grainHash(vec2 coord) {
    coord = vec2(
      dot(coord, vec2(2127.1, 81.17)),
      dot(coord, vec2(1269.5, 283.37))
    );
    return fract(sin(coord) * 43758.5453);
  }

  float generateFilmGrain(vec2 coord) {
    return length(grainHash(vec2(coord.x, coord.y)));
  }

  // Fractal noise utilities
  float generateRandomNoise(vec2 coord) {
    return fract(sin(dot(coord, vec2(12.99, 78.233))) * 43758.545);
  }

  float generatePerlinNoise(vec2 coord) {
    vec2 fractionalCoord = fract(coord);
    fractionalCoord = fractionalCoord * fractionalCoord * (3.0 - 2.0 * fractionalCoord);
    vec2 integerCoord = floor(coord);
   
    return mix(
      mix(
        generateRandomNoise(integerCoord + vec2(0.0, 0.0)),
        generateRandomNoise(integerCoord + vec2(1.0, 0.0)),
        fractionalCoord.x
      ),
      mix(
        generateRandomNoise(integerCoord + vec2(0.0, 1.0)),
        generateRandomNoise(integerCoord + vec2(1.0, 1.0)),
        fractionalCoord.x
      ),
      fractionalCoord.y
    );
  }

  float generateFractalNoise(vec2 coord) {
    float noiseValue = 0.0;
    float amplitude = 0.5;
    mat2 rotationMatrix = mat2(0.8, -0.6, 0.6, 0.8);
   
    for (int i = 0; i < 7; ++i) {
      noiseValue += amplitude * generatePerlinNoise(coord);
      coord = rotationMatrix * coord * vec2(1.5, 0.7);
      amplitude *= 0.5;
    }
   
    return noiseValue;
  }

  void main() {
    vec2 normalizedCoord = (2.0 * vUv - 1.0);
    float timeScale = uTime * 0.1;
   
    // Generate primary noise layers
    float primaryNoise = generateFractalNoise(normalizedCoord * 1.0 + timeScale);
    float secondaryNoise = generateFractalNoise(normalizedCoord * 0.2 - timeScale * 1.5 + primaryNoise);
   
    // Combine noise layers
    vec2 noiseVector = vec2(primaryNoise, secondaryNoise);
    float finalNoise = generateFractalNoise(normalizedCoord * 1.0 + noiseVector * 2.0);
   
    // Color blending with noise
    vec3 colorOutput = mix(uColour1, uColour2, smoothstep(0.2, 0.9, finalNoise));
    colorOutput = mix(colorOutput, uColour3, smoothstep(0.8, 1.0, finalNoise));
   
    // Enhanced color adjustments during transition
    float transitionEffect = uTransitionProgress * 0.3;
    colorOutput = mix(
      colorOutput,
      colorOutput * (1.0 + finalNoise * transitionEffect),
      uTransitionProgress
    );

    // Add subtle vignette during transition
    float vignette = length(normalizedCoord);
    vignette = smoothstep(1.0, 0.0, vignette);
    colorOutput = mix(colorOutput, colorOutput * (0.85 + vignette * 0.15), uTransitionProgress);
   
    // Color adjustments
    colorOutput = pow(colorOutput, vec3(1.5));
    colorOutput = mix(colorOutput, colorOutput * colorOutput * (3.0 - 2.0 * colorOutput), 0.15);
   
    // Apply film grain
    colorOutput = colorOutput - generateFilmGrain(vUv) * GRAIN_INTENSITY;
   
    gl_FragColor = vec4(colorOutput, 1.0);
  }
`;
