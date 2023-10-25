#define MAX_COLORS 24
#define COLOR_TOLERANCE 0.001

precision highp float;
varying vec2 vTex;
uniform sampler2D sampler0;

uniform vec4 u_new_colors[MAX_COLORS];
uniform vec4 u_original_colors[MAX_COLORS];
uniform int u_colors_count;

vec4 colorSwap(vec4 oldColor[MAX_COLORS], vec4 newColor[MAX_COLORS], vec4 imageColor) {
  for (int i = 0; i < MAX_COLORS; i++) {
    if (i < u_colors_count) {
      // Calculate distance^2 to avoid using an expensive square root operation
      vec4 delta = oldColor[i] - imageColor;
      float distSquared = dot(delta, delta);

      if (distSquared < COLOR_TOLERANCE) return newColor[i];
    }
  }
  return imageColor; // No Match, keep the original color
}

void main(void){
  gl_FragColor = colorSwap(u_original_colors, u_new_colors, texture2D(sampler0, vTex));
}