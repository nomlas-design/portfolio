export const planeVertexShader = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  varying vec3 vPosition;
  varying float vCurveFactor;
  varying vec2 vMouse;
  uniform float uProgress;
  uniform float uCurveFactor;
  uniform float uRandom;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uRotateX;
  uniform float uRotateY;
 
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
 
vec3 bendPlane(vec3 pos, vec2 mouse, float intensity) {
    vec2 vertexUV = uv * 2.0 - 1.0;
    float dist = length(vertexUV - mouse);
    float radius = 1.25;
    float falloff = smoothstep(radius, 0.0, dist);
    
    vec2 toMouse = -(mouse - vertexUV);
    
    // Calculate stretching effect that increases as we get closer to mouse
    float stretchIntensity = intensity * (1.0 - (dist * dist)) * falloff;
    
    vec2 stretch = toMouse * stretchIntensity;
    
    // Invert Z offset so it comes towards the screen (negative Z is towards viewer)
    float zOffset = -(falloff * intensity * (1.0 - (dist * dist)));
    
    return vec3(
        pos.x + stretch.x * 0.75 * uHover,
        pos.y + stretch.y * 0.75 * uHover,
        pos.z + zOffset * 0.2 * uHover  // Increased z-movement and inverted direction
    );
}
  void main() {
    vUv = uv;
    vMouse = uMouse;
    vCurveFactor = uCurveFactor;
    vec3 pos = position;
    
    pos.x += uProgress * 1.65;
    pos = rotateY(pos, -cos(smoothstep(200., 0., pos.x) * PI));
    pos = rotateY(pos, -cos(smoothstep(0., 2., pos.x) * PI));
    pos = rotateX(pos, uRotateX);
    pos = rotateY(pos, uRotateY);
   
    pos = bendPlane(pos, uMouse, 0.5);
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
  varying float vCurveFactor;
  varying vec2 vMouse;
  uniform sampler2D uTexture;
  uniform float uHover;
  
  float contrast(float x, float amount) {
    return clamp(((x - 0.5) * amount) + 0.5, 0.0, 1.0);
  }

  float calculateShadow(vec2 uv, vec2 mousePos) {
    vec2 uvNorm = uv * 2.0 - 1.0;
    float dist = length(uvNorm - mousePos);
    
    // Create directional shadow from top-left to bottom-right
    float dirX = uvNorm.x * 0.5 + 0.5;
    float dirY = uvNorm.y * 0.5 + 0.5;
    float directionalGradient = (1.0 - dirX + dirY) * 0.5;
    
    // Create soft shadow with mouse interaction
    float shadowRadius = 1.25;
    float baseShadowStrength = 0.3;
    float shadowFalloff = smoothstep(shadowRadius, 0.0, dist);
    float mouseShadow = shadowFalloff * baseShadowStrength * uHover;
    
    // Combine directional gradient with mouse shadow
    float finalShadow = mix(baseShadowStrength, 0.0, directionalGradient) + mouseShadow;
    
    return 1.0 - finalShadow;
  }
  
  void main() {
    vec4 tex = texture2D(uTexture, vUv);
    float brightness = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    
    float contrastAmount = 1.1;
    float adjustedBrightness = contrast(brightness, contrastAmount);
    adjustedBrightness = pow(adjustedBrightness, 0.9);
    
    vec3 bw = vec3(adjustedBrightness);
    
    vec3 redTint = mix(
      vec3(0.05, 0.0, 0.0),
      vec3(0.3, 0.0, 0.0),
      pow(adjustedBrightness, 1.3)
    );
    
    float threshold = 0.5;
    float redAmount = smoothstep(threshold, 1.0, adjustedBrightness) * 0.35;
    vec3 finalColor = mix(bw, redTint, redAmount);
    finalColor = pow(bw, vec3(1.1));
    
    float shadowMultiplier = calculateShadow(vUv, vMouse);
    finalColor *= shadowMultiplier;
    
    float alpha = smoothstep(0., 0.01, vPosition.z + 1.5);
    gl_FragColor = vec4(finalColor, 1.0 * alpha);
  }
`;
