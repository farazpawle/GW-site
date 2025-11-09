"use client";

import React, { useEffect, useRef, memo } from "react";

const ShaderBackground = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Vertex shader source code
  const vsSource = `
    attribute vec4 aVertexPosition;
    void main() {
      gl_Position = aVertexPosition;
    }
  `;

  // Lightweight Fragment shader - optimized for low-end devices
  const fsSource = `
    precision mediump float;
    uniform vec2 iResolution;
    uniform float iTime;

  const float overallSpeed = 0.15;
  const float scale = 3.5;
  const vec4 lineColor = vec4(0.72, 0.24, 0.96, 1.0);
  const vec4 glowColor = vec4(0.32, 0.11, 0.45, 1.0);
  const float lineSpeed = 0.8 * overallSpeed;
  const float lineAmplitude = 0.85;
  const float lineFrequency = 0.27;
  const float lineWidth = 0.065;
  const float lineSharpness = 1.6;
  const float offsetSpeed = 1.0 * overallSpeed;
  const int linesPerGroup = 22;

    float random(float t) {
      return cos(t) * 0.5 + 0.5;
    }

    float getPlasmaY(float x, float fade, float offset, float seed) {
      float amplitudeFactor = lineAmplitude * (0.55 + random(seed + 1.0) * 1.6);
      float frequencyFactor = lineFrequency * (0.75 + random(seed + 2.0) * 1.8);
      float secondaryFrequency = frequencyFactor * (1.4 + random(seed + 4.0) * 1.2);
      float phaseShift = seed * 0.7 + iTime * lineSpeed * (0.8 + random(seed + 3.0) * 1.4);
      float baseWave = sin(x * frequencyFactor + phaseShift);
      float layeredWave = baseWave + 0.45 * sin(x * secondaryFrequency + phaseShift * 1.3);
      float curvature = 0.35 * cos((x + seed) * frequencyFactor * 0.6 + phaseShift * 0.5);
      return (layeredWave + curvature) * amplitudeFactor * fade + offset;
    }

    void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  vec2 uv = fragCoord.xy / iResolution.xy;
      
  vec2 space = (fragCoord - iResolution.xy / 2.0) / iResolution.x * 2.0 * scale;
  space.y = (space.y) * 0.6;

  float horizontalFade = smoothstep(-0.25, 0.5, uv.x) * smoothstep(-0.25, 0.5, 1.0 - uv.x);
  float verticalFade = smoothstep(-0.15, 1.05, uv.y);

      vec4 lines = vec4(0.0);
  vec4 bgColor1 = vec4(0.04, 0.04, 0.12, 1.0);
  vec4 bgColor2 = vec4(0.12, 0.04, 0.22, 1.0);
  vec4 bgColor3 = vec4(0.06, 0.03, 0.16, 1.0);

      for(int l = 0; l < linesPerGroup; l++) {
        float offsetTime = iTime * offsetSpeed;
        float offsetPosition = float(l) + space.x * 0.3;
  float baseSeed = offsetPosition + offsetTime;
  float rand = random(baseSeed);
  float offset = (random(baseSeed * 1.7) - 0.5) * 2.8;
  float linePosition = getPlasmaY(space.x, horizontalFade, offset, offsetPosition);
        float dist = abs(linePosition - space.y);
        float line = smoothstep(lineWidth, 0.0, dist);
        line = pow(line, lineSharpness);

        float glow = smoothstep(0.35, 0.0, dist) * 0.35;

        lines += line * lineColor * rand * 1.05;
        lines += glow * glowColor * rand;
      }

      vec4 fragColor = mix(bgColor1, bgColor2, uv.x);
      fragColor = mix(fragColor, bgColor3, uv.y * 0.6);
      fragColor *= verticalFade;
      fragColor += lines;

      gl_FragColor = fragColor;
    }
  `;

  // Helper function to compile shader
  const loadShader = (
    gl: WebGLRenderingContext,
    type: number,
    source: string,
  ): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compile error: ", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  };

  // Initialize shader program
  const initShaderProgram = (
    gl: WebGLRenderingContext,
    vsSource: string,
    fsSource: string,
  ): WebGLProgram | null => {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader) return null;

    const shaderProgram = gl.createProgram();
    if (!shaderProgram) return null;

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error(
        "Shader program link error: ",
        gl.getProgramInfoLog(shaderProgram),
      );
      return null;
    }

    return shaderProgram;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.warn("WebGL not supported.");
      return;
    }

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    if (!shaderProgram) return;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      },
      uniformLocations: {
        resolution: gl.getUniformLocation(shaderProgram, "iResolution"),
        time: gl.getUniformLocation(shaderProgram, "iTime"),
      },
    };

    // Detect low-performance devices
    const checkPerformance = () => {
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        );
      const isLowEnd = navigator.hardwareConcurrency
        ? navigator.hardwareConcurrency <= 4
        : false;
      return isMobile || isLowEnd;
    };

    const resizeCanvas = () => {
      const isLowPerformance = checkPerformance();
      const scale = isLowPerformance ? 0.5 : 0.75; // Render at lower resolution

      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
      canvas.style.width = "100%";
      canvas.style.height = "100%";

      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const startTime = Date.now();
    let animationFrameId: number;
    let lastFrameTime = 0;
    const targetFPS = 30; // Throttle to 30 FPS for better performance
    const frameInterval = 1000 / targetFPS;

    const render = (currentTimestamp: number) => {
      const elapsed = currentTimestamp - lastFrameTime;

      // Throttle to target FPS
      if (elapsed < frameInterval) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      lastFrameTime = currentTimestamp - (elapsed % frameInterval);
      const currentTime = (Date.now() - startTime) / 1000;

      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(programInfo.program);

      gl.uniform2f(
        programInfo.uniformLocations.resolution,
        canvas.width,
        canvas.height,
      );
      gl.uniform1f(programInfo.uniformLocations.time, currentTime);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        2,
        gl.FLOAT,
        false,
        0,
        0,
      );
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
    // Shader sources are static and don't change - only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
          imageRendering: "pixelated",
        }}
      />
      {/* CSS Fallback for devices without WebGL */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, #0a0a14 0%, #1a0a1f 50%, #0f0a1a 100%)",
          opacity: 0,
          transition: "opacity 0.3s",
        }}
        onLoad={(e) => {
          // Show fallback if canvas is not rendering
          if (!canvasRef.current?.getContext("webgl")) {
            (e.target as HTMLElement).style.opacity = "1";
          }
        }}
      />
    </>
  );
});

ShaderBackground.displayName = "ShaderBackground";

export default ShaderBackground;
