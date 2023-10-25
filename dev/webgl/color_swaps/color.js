async function getShader(gl, type) {
  return fetch(`/dev/webgl/color_swaps/${type}_shader.glsl`).then(file => {
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

async function webGLStart(target, colorPickerContainer, src) {
  const FPS = 30

  var img, tex, vloc, tloc, vertexBuff, texBuff, newColorsLoc, originalColorsLoc, colorsCountLoc

  var colorPickers

  var canvas = document.getElementById(target)
  var gl = canvas.getContext('experimental-webgl')
  var uLoc

  var colorVelocity = 0.01
  var colorDelta = 0

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

  newColorsLoc = gl.getUniformLocation(program, 'u_new_colors')
  originalColorsLoc = gl.getUniformLocation(program, 'u_original_colors')
  colorsCountLoc = gl.getUniformLocation(program, 'u_colors_count')

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

    colorPickers = Array.from(document.getElementById(colorPickerContainer).children)
    colorPickers.forEach(colorPicker => { colorPicker.addEventListener('input', render) })

    render()
  }

  function colorToVector(color) {
    if (color === undefined || color === null || color === NaN)
      return [-1, -1, -1, 1]

    const numeric_color = Number(color.replace('#', '0x'))

    return [
      (numeric_color & 0xFF0000) / 0xFF0000,
      (numeric_color & 0xFF00)   / 0xFF00,
      (numeric_color & 0xFF)     / 0xFF,
      1.0
    ]
  }

  function render() {
    gl.uniform1i(colorsCountLoc, colorPickers.length)

    var glOriginalColors = []
    var glNewColors = []


    colorPickers.forEach(colorPicker => {
      glOriginalColors = glOriginalColors.concat(colorToVector(colorPicker.getAttribute('original')))
      glNewColors = glNewColors.concat(colorToVector(colorPicker.value))
    })

    gl.uniform4fv(newColorsLoc, glNewColors)
    gl.uniform4fv(originalColorsLoc, glOriginalColors)

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)
  }

  img.onload = setup
}