precision highp float;

const float ZOOM_DURATION = 0.8;
const float HOLD_DURATION = 2.0;
const float MAX_ZOOM = 2.0;
const float MOTION_BLUR_STRENGTH = 5.0;
const int MOTION_BLUR_SAMPLES = 100;

float easeInOutSine(float t) {
  float eased = 0.5 * (1.0 - cos(3.141592653589793 * pow(t, 0.95)));
  return eased + (sin(t * 3.141592653589793) * 0.02 * (1.0 - t));
}

void getZoomParams(float animTime, out float zoomLevel, out vec2 focalPoint) {
  float totalDuration = ZOOM_DURATION * 2.0 + HOLD_DURATION;
  float cyclicTime = mod(animTime, totalDuration);
  if (cyclicTime < ZOOM_DURATION) {
    float t = cyclicTime / ZOOM_DURATION;
    zoomLevel = 1.0 + (MAX_ZOOM - 1.0) * easeInOutSine(t);
    focalPoint = mouseClick;
  } else if (cyclicTime < ZOOM_DURATION + HOLD_DURATION) {
    zoomLevel = MAX_ZOOM;
    focalPoint = mouseClick;
  } else {
    float t = (cyclicTime - ZOOM_DURATION - HOLD_DURATION) / ZOOM_DURATION;
    zoomLevel = MAX_ZOOM - (MAX_ZOOM - 1.0) * easeInOutSine(t);
    focalPoint = mouseClick;
  }
}

vec4 sampleWithMotionBlur(vec2 uv, float animTime, vec2 mouseClick, sampler2D inputTexture) {
  float totalDuration = ZOOM_DURATION * 2.0 + HOLD_DURATION;
  float cyclicTime = mod(animTime, totalDuration);
  bool isZooming = cyclicTime < ZOOM_DURATION || cyclicTime > ZOOM_DURATION + HOLD_DURATION;
  if (!isZooming) {
    return texture2D(inputTexture, uv);
  }
  float zoomSpeed;
  if (cyclicTime < ZOOM_DURATION) {
    float t = cyclicTime / ZOOM_DURATION;
    float dt = 0.01;
    float z1 = 1.0 + (MAX_ZOOM - 1.0) * easeInOutSine(t);
    float z2 = 1.0 + (MAX_ZOOM - 1.0) * easeInOutSine(t + dt);
    zoomSpeed = (z2 - z1) / dt;
  } else {
    float t = (cyclicTime - ZOOM_DURATION - HOLD_DURATION) / ZOOM_DURATION;
    float dt = 0.01;
    float z1 = MAX_ZOOM - (MAX_ZOOM - 1.0) * easeInOutSine(t);
    float z2 = MAX_ZOOM - (MAX_ZOOM - 1.0) * easeInOutSine(t + dt);
    zoomSpeed = (z2 - z1) / dt;
  }
  vec4 color = vec4(0.0);
  vec2 focusUV = mouseClick;
  float blurAmount = abs(zoomSpeed) * MOTION_BLUR_STRENGTH / float(MOTION_BLUR_SAMPLES);
  for (int i = 0; i < MOTION_BLUR_SAMPLES; i++) {
    float t = float(i) / float(MOTION_BLUR_SAMPLES - 1);
    float zoomFactor = 1.0 + (zoomSpeed * blurAmount * (t - 0.5));
    vec2 offsetUV = focusUV + (uv - focusUV) * zoomFactor;
    color += texture2D(inputTexture, offsetUV);
  }
  return color / float(MOTION_BLUR_SAMPLES);
}