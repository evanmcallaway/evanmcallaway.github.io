precision highp float;
varying vec2 vTex;
uniform sampler2D sampler0;

uniform vec4 u_new_colors[24];
uniform vec4 u_original_colors[24];
uniform int u_colors_count;

float colorTolerance = 0.001;

vec4 colorSwap(vec4 oldColor[24], vec4 newColor[24], vec4 imageColor) {
  for (int i = 0; i < 24; i++) {
    if (i < u_colors_count) {
      vec4 oldC = oldColor[i];
      float thisDist = sqrt(
        pow(oldC.x - imageColor.x, 2.0) +
        pow(oldC.y - imageColor.y, 2.0) +
        pow(oldC.z - imageColor.z, 2.0)
      );
      if (thisDist < colorTolerance) {
        return newColor[i];
      }
    }
  }
  return imageColor;
}

void main(void){
  vec4 imageColor = texture2D(sampler0, vTex);
  gl_FragColor = colorSwap(u_original_colors, u_new_colors, imageColor);
}