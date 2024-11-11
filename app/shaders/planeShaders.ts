export const planeVertexShader = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float uProgress;
  uniform float uCurveFactor;
  
  float PI = 3.141592653589793238;
  
  vec3 rotateX(vec3 pos, float angle) {
    float c = cos(angle);
    float s = sin(angle); 
    return vec3(pos.x, c * pos.y - s * pos.z, s * pos.y + c * pos.z);
  }

  vec3 rotateY(vec3 pos, float angle) {
    float c = cos(angle);
    float s = sin(angle);
    return vec3(c * pos.x + s * pos.z, pos.y, -s * pos.x + c * pos.z);
  }
  
  void main() {
    vUv = uv;
    vec3 pos = position;
    pos.x += uProgress * 1.6;
    pos = rotateY(pos, smoothstep(-1.5, 1.5, -cos(uCurveFactor * smoothstep(-6.0, 6.0, pos.x) * 4.0)) * PI * 0.75); 
    vPosition = pos;
    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
  }
`;

export const planeFragmentShader = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform sampler2D uTexture;
  
  void main() {
    vec4 tex = texture2D(uTexture, vUv);
    float alpha = smoothstep(0., 1.9, vPosition.z + 2.5);
    gl_FragColor = vec4(tex.rgb, 1.0 * alpha);
  }
`;
