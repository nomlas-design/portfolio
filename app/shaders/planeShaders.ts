export const planeVertexShader = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  varying vec3 vPosition;
  varying float vCurveFactor;
  uniform float uProgress;
  uniform float uCurveFactor;
  uniform float uRandom;
  uniform float uTime;
  
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
    vCurveFactor = uCurveFactor;

    vec3 pos = position;
    pos.x += uProgress * 1.65;
    //pos.y += sin(uRandom  * PI + uTime) * 0.02;
    pos = rotateY(pos,   -cos(smoothstep(200., 0., pos.x) * PI));
    pos = rotateY(pos, -cos(smoothstep(0., 2., pos.x) * PI));

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
  uniform sampler2D uTexture;

  float contrast(float x, float amount) {
      // Adjust around the midpoint 0.5
      return clamp(((x - 0.5) * amount) + 0.5, 0.0, 1.0);
  }

  void main() {
      // Sample the texture
      vec4 tex = texture2D(uTexture, vUv);
     
      // Calculate brightness using luminance formula
      float brightness = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
     
      // Apply S-curve contrast enhancement
      float contrastAmount = 1.1;
      float adjustedBrightness = contrast(brightness, contrastAmount);
     
      // Further enhance contrast with power function
      adjustedBrightness = pow(adjustedBrightness, 0.9);
     
      // Create high contrast black and white base
      vec3 bw = vec3(adjustedBrightness);
     
      vec3 redTint = mix(
          vec3(0.05, 0.0, 0.0),
          vec3(0.3, 0.0, 0.0),
          pow(adjustedBrightness, 1.3)
      );
     
      // Create a threshold for where red tint begins
      float threshold = 0.5; // Adjust this to control where red starts
      float redAmount = smoothstep(threshold, 1.0, adjustedBrightness) * 0.35;
     
      // Mix between high contrast B&W and red tint based on brightness
      vec3 finalColor = mix(bw, redTint, redAmount);
     
      // Final contrast boost
      finalColor = pow(bw, vec3(1.1));
     
      // Apply the alpha fade
      float alpha = smoothstep(0., 0.01, vPosition.z + 20.);
     
      gl_FragColor = vec4(finalColor, 1.0 * alpha);
  }
`;
