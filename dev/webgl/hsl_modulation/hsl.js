async function getShader(gl, type) {
  return fetch(`/dev/webgl/hsl_modulation/${type}_shader.glsl`).then(file => {
    return file.text().then(content => {
      var shader

      if (type === 'fragment')
        shader = gl.createShader(gl.FRAGMENT_SHADER)
      else if (type === 'vertex')
        shader = gl.createShader(gl.VERTEX_SHADER)
      else
        return null

      gl.shaderSource(shader, content)
      gl.compileShader(shader)

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader))
        return null
      }

      return shader
    })
  })
}

async function createProgram(gl) {
  var vertShaderObj = await getShader(gl, 'vertex')
  var fragShaderObj = await getShader(gl, 'fragment')
  var program = gl.createProgram()

  gl.attachShader(program, vertShaderObj)
  gl.attachShader(program, fragShaderObj)

  gl.linkProgram(program)
  gl.useProgram(program)
  return program
}

async function webGLStart(target, src, modulate) {
  const FPS = 30
  const HUE_VELOCITY = 0.005

  var img, tex, vloc, tloc, vertexBuff, texBuff

  var hue = 0

  var saturation = 1
  var saturation_velocity = 0.025

  var lightness = 1
  var lightness_velocity = 0.0125

  var canvas = document.getElementById(target)
  var gl = canvas.getContext('experimental-webgl')
  var uLoc

  var program = await createProgram(gl)
  gl.viewport(0, 0, canvas.width, canvas.height)

  vertexBuff = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuff)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, -1, 1, 1]), gl.STATIC_DRAW)

  texBuff = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, texBuff)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 1, 0, 0, 1, 0, 1, 1]), gl.STATIC_DRAW)

  vloc = gl.getAttribLocation(program, 'aVertex')
  tloc = gl.getAttribLocation(program, 'aUV')
  uLoc = gl.getUniformLocation(program, 'pos')
  var hslLocation = gl.getUniformLocation(program, "u_hsl")

  var setupImage = function(imgobj) {
    tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgobj)

    gl.enableVertexAttribArray(vloc)
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuff)
    gl.vertexAttribPointer(vloc, 2, gl.FLOAT, false, 0, 0)

    gl.enableVertexAttribArray(tloc)
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuff)
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.vertexAttribPointer(tloc, 2, gl.FLOAT, false, 0, 0)
  }

  img = new Image()
  img.src = src

  function setup() {
    setupImage(img)
    render()
  }

  function render() {
    if (modulate.hue)
      hue = (hue + HUE_VELOCITY) % 1.0

    if (modulate.saturation) {
      if (saturation <= 0 || saturation >= 2)
        saturation_velocity *= -1
      saturation += saturation_velocity
    }

    if (modulate.lightness) {
      if (lightness < 1 || lightness >= 2)
        lightness_velocity *= -1
      lightness += lightness_velocity
    }

    gl.uniform3f(hslLocation, hue, saturation, lightness)

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)

    setTimeout(() => {
      requestAnimationFrame(render)
    }, 1000 / FPS)
  }

  img.onload = setup
}