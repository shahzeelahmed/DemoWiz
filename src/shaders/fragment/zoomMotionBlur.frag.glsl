#include "./zoomMotionBlurUtils.glsl"

varying vec2 vUv;
uniform vec2 resolution;
uniform float time;
uniform vec2 mouseClick;
uniform sampler2D inputTexture;

void main() {
  vec2 uv = vUv;
  float zoomLevel;
  vec2 focalPoint;
  getZoomParams(time, zoomLevel, focalPoint);
  vec2 zoomedUV = focalPoint + (uv - focalPoint) / zoomLevel;
  vec4 color = sampleWithMotionBlur(zoomedUV, time, mouseClick, inputTexture);
  gl_FragColor = color;
}