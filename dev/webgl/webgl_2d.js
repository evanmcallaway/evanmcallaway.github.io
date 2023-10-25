class WebGL2D {
  async getShader(path, type) {
    return fetch(`${path}${type}_shader.glsl`).then(file => {
      return file.text().then(content => {
        var shader

        if (type === 'fragment')
          shader = this.gl.createShader(this.gl.FRAGMENT_SHADER)
        else if (type === 'vertex')
          shader = this.gl.createShader(this.gl.VERTEX_SHADER)
        else
          return null

        this.gl.shaderSource(shader, content)
        this.gl.compileShader(shader)

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
          alert(this.gl.getShaderInfoLog(shader))
          return null
        }

        return shader
      })
    })
  }

  async createProgram() {
    var vertShaderObj = await this.getShader('../', 'vertex')
    var fragShaderObj = await this.getShader('', 'fragment')
    this.program = this.gl.createProgram()

    this.gl.attachShader(this.program, vertShaderObj)
    this.gl.attachShader(this.program, fragShaderObj)

    this.gl.linkProgram(this.program)
    this.gl.useProgram(this.program)
  }

  setupTexture() {
    const tex = this.gl.createTexture()
    this.gl.bindTexture(this.gl.TEXTURE_2D, tex)

    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST)
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST)

    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.img)

    this.gl.enableVertexAttribArray(this.vloc)
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuff)
    this.gl.vertexAttribPointer(this.vloc, 2, this.gl.FLOAT, false, 0, 0)

    this.gl.enableVertexAttribArray(this.tloc)
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texBuff)
    this.gl.bindTexture(this.gl.TEXTURE_2D, tex)
    this.gl.vertexAttribPointer(this.tloc, 2, this.gl.FLOAT, false, 0, 0)
  }

  render() {
    this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, 4)
  }

  async webGLInit() {
    this.gl = this.canvas.getContext('experimental-webgl')

    await this.createProgram()
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)

    this.vertexBuff = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuff)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, -1, 1, 1]), this.gl.STATIC_DRAW)

    this.texBuff = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texBuff)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([0, 1, 0, 0, 1, 0, 1, 1]), this.gl.STATIC_DRAW)

    this.vloc = this.gl.getAttribLocation(this.program, 'aVertex')
    this.tloc = this.gl.getAttribLocation(this.program, 'aUV')
    this.uLoc = this.gl.getUniformLocation(this.program, 'pos')

    this.webGLStart()
  }

  webGLStart() {
    this.setupTexture()
    this.render()
  }
}