// Vertex Shader
export const textVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  uniform float uTransition;

  void main() {
    vUv = uv;

    // Calculate world position
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;

    vec3 pos = position;
    pos.x -= uTransition * 3.5;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

// Fragment Shader
export const textFragmentShader = `
  uniform vec3 uColour;
  uniform float uOpacity;
  uniform float uTransition;

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    if (vWorldPosition.x < -0.5) {
      discard;
    }

    float alpha = uOpacity * (1.0 - uTransition);
    gl_FragColor = vec4(uColour, alpha);
  }
`;
