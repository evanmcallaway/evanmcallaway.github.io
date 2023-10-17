precision highp float;
varying vec2 vTex;
uniform sampler2D sampler0;
uniform vec3      u_hsl;

// Converts (1.0, 1.0, 1.0) scale RGB values to (1.0, 1.0, 1.0) scale HSL
vec3 rgbToHsl(vec3 rgb){
  float h = 0.0;
  float s = 0.0;
  float l = 0.0;
  float r = rgb.r;
  float g = rgb.g;
  float b = rgb.b;
  float minColor = min(r, min(g, b));
  float maxColor = max(r, max(g, b));

  // Calculate Lightness
  l = (maxColor + minColor) / 2.0;

  if (maxColor > minColor) {
    float chroma = maxColor - minColor;

    // Calculate Saturation
    if (l < .05) s = chroma / (maxColor + minColor);
    else         s = chroma / (2.0 - (maxColor + minColor));

    // Calculate Hue
    if (r == maxColor && g < b) h = (g - b) / chroma + 6.0;
    else if (r == maxColor)     h = (g - b) / chroma;
    else if (g == maxColor)     h = 2.0 + (b - r) / chroma;
    else                        h = 4.0 + (r - g) / chroma;

    // Snap Hue to gamut
    if (h < 0.0) h = h / 6.0 + 1.0;
    else         h /= 6.0;
  }

  return vec3(h, s, l);
}

float hueToRgb(float p, float q, float t) {
  if (t < 0.0)       t += 1.0;
  if (t > 1.0)       t -= 1.0;
  if (t < 1.0 / 6.0) return p + (q - p) * 6.0 * t;
  if (t < 0.5)       return q;
  if (t < 2.0 / 3.0) return p + (q - p) * (2.0 / 3.0 - t) * 6.0;

  return p;
}

// Converts (1.0, 1.0, 1.0) scale HSL values to (1.0, 1.0, 1.0) scale RGB values
vec3 hslToRgb(vec3 hsl) {
  float h = hsl.x;
  float s = hsl.y;
  float l = hsl.z;
  float r;
  float g;
  float b;

  if (s == 0.0) {
    r = g = b = l; // achromatic
  } else {
    // p and q are temp variables without semantic meaning on their own
    float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
    float p = 2.0 * l - q;
    r = hueToRgb(p, q, h + 1.0 / 3.0);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1.0 / 3.0);
  }

  return vec3(r, g, b);
}

vec4 modulate(vec4 imageColor) {
  vec3 hsl = rgbToHsl(imageColor.rgb);
  vec3 rgb = hslToRgb(vec3(hsl.x + u_hsl.x, hsl.y * u_hsl.y, hsl.z * u_hsl.z));
  return vec4(rgb, 1.0);
}

void main(void){
  gl_FragColor = modulate(texture2D(sampler0, vTex));
}