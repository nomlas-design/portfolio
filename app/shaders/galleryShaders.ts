export const galleryVertexShader = /* glsl */ `
  uniform float uProgress;
  uniform float uIndex;
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    
    // Calculate direction based on index
    float direction = uIndex <= 2.0 ? 1.0 : -1.0;
    
    // Simply apply the offset based on progress
    float offset = 0.2 * direction * (1.0 - uProgress);
    pos.y += offset;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const galleryFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2 uImageSize;
  uniform vec2 uPlaneSize;
  uniform float uProgress;
  varying vec2 vUv;

  vec2 getCoverUV(vec2 uv, vec2 resolution, vec2 texResolution) {
    vec2 ratio = resolution / texResolution;
    float maxRatio = max(ratio.x, ratio.y);
    vec2 scale = maxRatio * texResolution / resolution;
    vec2 offset = (1.0 - scale) * 0.5;
    return (uv - offset) / scale;
  }

  void main() {
  vec2 adjustedUV = getCoverUV(vUv, uPlaneSize, uImageSize);
  
  if (adjustedUV.x < 0.0 || adjustedUV.x > 1.0 ||
      adjustedUV.y < 0.0 || adjustedUV.y > 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
  } else {
    vec4 tex = texture2D(uTexture, adjustedUV);
    float opacity = clamp(uProgress, 0.0, 1.0);
    
    // Apply opacity by multiplying the alpha channel
    gl_FragColor = vec4(tex.rgb, tex.a * opacity);

    }
  }
`;
