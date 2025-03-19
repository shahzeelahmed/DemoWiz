attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = vec2(0.5 * (position.x + 1.0), 0.5 * (1.0 - position.y));
  gl_Position = vec4(position, 0.0, 1.0);
}