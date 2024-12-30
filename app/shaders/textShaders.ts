// Vertex Shader
export const textVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;

    // Calculate world position
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment Shader
export const textFragmentShader = `
  uniform vec3 uColour;
  uniform float uOpacity;

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    if (vWorldPosition.x < -0.5) {
      discard;
    }

    gl_FragColor = vec4(uColour, uOpacity);
  }
`;
