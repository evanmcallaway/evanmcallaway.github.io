attribute vec2 aVertex;
attribute vec2 aUV;
varying vec2 vTex;
uniform vec2 pos;

void main(void) {
  gl_Position = vec4(aVertex + pos, 0.0, 1.0);
  vTex = aUV;
}