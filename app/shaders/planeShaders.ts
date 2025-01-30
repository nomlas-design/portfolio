export const planeVertexShader = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  varying vec3 vPosition;
  varying float vActiveProgress;
  varying vec2 vMouse;
  uniform float uProgress;
  uniform float uActiveProgress;
  uniform float uRandom;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uActive;
  uniform vec2 uScale;
  uniform vec2 uZoomScale; // Add this: viewport scale
  uniform vec2 uImageSize; // Add this: texture dimensions
  uniform vec2 uPlaneSize; // Add this: plane dimensions
  uniform float uOpacity;

  float PI = 3.141592653589793238;

  vec2 coverUV(vec2 uv, vec2 textureSize, vec2 planeSize, vec2 scale) {
    // Adjust plane size by current scale
    vec2 scaledPlaneSize = planeSize * scale;
    
    float textureAspect = textureSize.x / textureSize.y;
    float planeAspect = scaledPlaneSize.x / scaledPlaneSize.y;
    
    vec2 newUV = uv - vec2(0.5);
    
    if (textureAspect > planeAspect) {
        // texture is wider than plane
        newUV.x *= planeAspect / textureAspect;
    } else {
        // texture is taller than plane
        newUV.y *= textureAspect / planeAspect;
    }
    
    return newUV + vec2(0.5);
  }

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
      float radius = 3.;
      float falloff = smoothstep(radius, 0.0, dist);
      
      vec2 toMouse = -(mouse - vertexUV);
      float xFactor = smoothstep(-1.0, 1.0, uv.x);
      
      float stretchIntensity = intensity * (1.0 - (dist / 2.)) * falloff;
      stretchIntensity *= (1. + xFactor * 0.5);
      
      vec2 stretch = toMouse * stretchIntensity;
      
      return vec3(
          pos.x + stretch.x * 0.2 * uHover,
          pos.y + stretch.y * 0.3 * uHover,
          pos.z
      );
  }

  void main() {
    vec2 adjustedUV = coverUV(uv, uImageSize, uPlaneSize, uScale);
    vUv = adjustedUV;
    vMouse = uMouse;
    vActiveProgress = uActiveProgress;
    vec3 pos = position;
    pos.x += uProgress * 1.65;
    
    float curveStrength = 1.0;
    if (uActive > 0.0) {
        curveStrength = smoothstep(1.0, 0.0, uActiveProgress);

        // float targetScale = uZoomScale.y; // Use the height scale
        // float currentScale = mix(1.0, targetScale, uActiveProgress);
        
        // // Scale width proportionally but slightly less to fit viewport
        // float widthScale = targetScale;
        
        if (uActiveProgress > 0.5) {
          float remap = clamp((uActiveProgress - 0.5) * 2., 0.0, 1.0);
          float targetScale = uZoomScale.y; // Use the height scale

                  float currentScale = mix(1.0, targetScale, remap);
        float widthScale = targetScale;

                 // pos.x *= mix(1.0, widthScale, remap);
      // pos.y *= currentScale;

        // pos.x -= (1.5) * remap;
        }
    }
    
    pos = rotateY(pos, -cos(smoothstep(200., 0., pos.x) * PI) * curveStrength);
    pos = rotateY(pos, -cos(smoothstep(0., 2., pos.x) * PI) * curveStrength);
    
    if (uActive > 0.0) {
        float foldX = mix(-1.5, 6.5, uActiveProgress);
        float foldX2 = mix(-1.5, 6.5, uActiveProgress);
        
        float distFromFold = pos.x - foldX;
        float distFromFold2 = pos.x - foldX2;
        float rotationAmount = smoothstep(0.0, 5.0, -distFromFold);
        float rotationAmount2 = smoothstep(0.0, 5.0, -distFromFold2);
        pos = rotateY(pos, rotationAmount * PI * 0.5);
        pos = rotateY(pos, rotationAmount2 * PI * 0.5);
        
        pos.z -= sin(rotationAmount * PI) * 0.1;
    }
    
    pos = bendPlane(pos, uMouse, 0.5 * curveStrength);
    
    vPosition = pos;

    if (pos.x > 0.0) {
    pos.x -= (1. - uOpacity) * 1.5 * pos.x;
    } else {
    pos.x -= (1. - uOpacity) * -pos.x;
    }
    
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
  varying float vActiveProgress;
  varying vec2 vMouse;
  uniform sampler2D uTexture;
  uniform float uHover;
  uniform float uActive;
  uniform float uActiveProgress;
  uniform float uOpacity;
  uniform float uFadeIn;
  
  float contrast(float x, float amount) {
    return clamp(((x - 0.5) * amount) + 0.5, 0.0, 1.0);
  }

  void main() {
    vec2 adjustedUv = gl_FrontFacing ? vUv : vec2(1.0 - vUv.x, vUv.y);

    float curveStrength = 1.0;
    if (uActive > 0.0) {
        curveStrength = smoothstep(1.0, 0.0, uActiveProgress);
    }
    
    vec4 tex = texture2D(uTexture, adjustedUv);
    float brightness = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    
    float contrastAmount = 1.1;
    float adjustedBrightness = contrast(brightness, contrastAmount);
    adjustedBrightness = pow(adjustedBrightness, 0.9);
    
    vec3 bw = vec3(adjustedBrightness);
    vec3 bwColor = pow(bw, vec3(0.9));
    
    float minBW = 0.5;
    vec3 finalColor = mix(tex.rgb, bwColor, minBW + curveStrength * (1.0 - minBW));

    vec2 vertexUV = vUv * 2.0 - 1.0;
    float shadowIntensity = 0.125  + 1.5 * uActiveProgress;;
    float dist = length(vertexUV - vMouse) - 0.5 * uActiveProgress;;
    float radius = 0.4;
    float falloff = smoothstep(radius, 1.5, dist);
    
    finalColor *= 1.0 - shadowIntensity * falloff * uHover * curveStrength * uActiveProgress;
    finalColor = min(vec3(1.0), finalColor + shadowIntensity * (1.0 - falloff) * uHover * curveStrength);
      
    float alpha = smoothstep(0., 0.05, vPosition.z + 2.25);

    gl_FragColor = vec4(finalColor, alpha * uOpacity * uFadeIn);
  }
`;
