'use client';

import React, { memo, useEffect, useRef, useState } from 'react';

/**
 * Flowing Energy Field Background
 * Cinematic neon strands rendered via WebGL fragment shader
 */
const GradientMeshBackground = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLowPerf, setIsLowPerf] = useState(false);

  const vsSource = `
    attribute vec4 aVertexPosition;
    void main() {
      gl_Position = aVertexPosition;
    }
  `;

  const fsSource = `
    precision mediump float;
    uniform vec2 iResolution;
    uniform float iTime;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      for (int i = 0; i < 5; i++) {
        value += noise(p * frequency) * amplitude;
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    vec3 neonPalette(float t) {
      vec3 warmWhite = vec3(0.95, 0.92, 0.88);
      vec3 pureWhite = vec3(1.0);
      vec3 coolWhite = vec3(0.92, 0.94, 0.98);
      return mix(mix(warmWhite, pureWhite, smoothstep(0.2, 0.6, t)), coolWhite, smoothstep(0.6, 1.0, t));
    }

    void main() {
      vec2 fragCoord = gl_FragCoord.xy;
      vec2 uv = fragCoord / iResolution.xy;
      vec2 aspectUV = uv;
      aspectUV.x *= iResolution.x / iResolution.y;

      float time = iTime * 0.12;

      vec2 warped = aspectUV;
      warped += 0.08 * vec2(fbm(aspectUV * 3.0 + vec2(time * 0.6, -time * 0.4)),
                            fbm(aspectUV * 3.0 + vec2(-time * 0.3, time * 0.5)));
      warped += 0.04 * vec2(
        sin(aspectUV.y * 6.0 - time * 2.0),
        cos(aspectUV.x * 6.0 + time * 1.6)
      );

      float crest = warped.y - 0.5 + 0.1 * sin(warped.x * 2.4 - time * 0.7);
      float crestHighlight = smoothstep(0.22, 0.0, abs(crest));

      float stripeCoord = warped.y * 36.0 + fbm(warped * 8.0 - time * 1.2) * 6.0;
      float microStripe = sin(stripeCoord);
      float lineMask = smoothstep(0.18, 0.0, abs(microStripe));

      float fineStripe = sin((warped.y + fbm(warped * 5.0 + time)) * 90.0);
      lineMask += 0.35 * smoothstep(0.12, 0.0, abs(fineStripe));

      float depthField = fbm(warped * 2.0 - time * 0.4);
      float parallax = fbm(aspectUV * 1.5 + time * 0.3);

      float colorMix = clamp(uv.x + 0.12 * sin(time * 0.4) + depthField * 0.2, 0.0, 1.0);
      vec3 energy = neonPalette(colorMix);
  energy = mix(energy, vec3(0.85), crestHighlight);

  vec3 base = mix(vec3(0.0, 0.0, 0.0), vec3(0.04, 0.04, 0.04), uv.y * 0.6);
  base *= 1.0 - 0.4 * smoothstep(0.6, 1.2, length(uv - 0.5));

      float glow = pow(lineMask, 1.6) * 0.9 + crestHighlight * 0.8;
      float subtleFlow = 0.25 + 0.75 * lineMask;

      vec3 color = base;
      color += energy * glow;
      color += energy * subtleFlow * 0.5;
  color += vec3(0.05) * parallax * 0.5;

      color = pow(color, vec3(0.92));

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const loadShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Flow-field shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  };

  const initShaderProgram = (gl: WebGLRenderingContext, vSource: string, fSource: string): WebGLProgram | null => {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fSource);

    if (!vertexShader || !fragmentShader) {
      return null;
    }

    const shaderProgram = gl.createProgram();
    if (!shaderProgram) return null;

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error('Flow-field shader link error:', gl.getProgramInfoLog(shaderProgram));
      return null;
    }

    return shaderProgram;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return () => undefined;
    }

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.warn('WebGL not available: falling back to solid background.');
      return () => undefined;
    }

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    if (!shaderProgram) {
      return () => undefined;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      },
      uniformLocations: {
        resolution: gl.getUniformLocation(shaderProgram, 'iResolution'),
        time: gl.getUniformLocation(shaderProgram, 'iTime'),
      },
    };

    const detectLowPerf = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const lowCpu = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false;
      return isMobile || lowCpu;
    };

    const resizeCanvas = () => {
      const lowPerf = detectLowPerf();
      const resolutionScale = lowPerf ? 0.55 : 0.85;
      canvas.width = Math.floor(window.innerWidth * resolutionScale);
      canvas.height = Math.floor(window.innerHeight * resolutionScale);
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      gl.viewport(0, 0, canvas.width, canvas.height);
      setIsLowPerf(lowPerf);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const startTime = performance.now();
    let animationFrameId = 0;
    let lastFrame = 0;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;

    const render = (timestamp: number) => {
      if (timestamp - lastFrame < frameInterval) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      lastFrame = timestamp;
      const elapsedSeconds = (timestamp - startTime) / 1000;

      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(programInfo.program);

      gl.uniform2f(programInfo.uniformLocations.resolution, canvas.width, canvas.height);
      gl.uniform1f(programInfo.uniformLocations.time, elapsedSeconds);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="absolute inset-0">
      <canvas ref={canvasRef} className="w-full h-full" role="presentation" aria-hidden="true" />
      {isLowPerf && (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#0f1729] to-[#06040f]" aria-hidden="true" />
      )}
    </div>
  );
});

GradientMeshBackground.displayName = 'GradientMeshBackground';

export default GradientMeshBackground;
