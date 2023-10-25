class ColorSwapper extends WebGL2D {
  constructor(canvasId, colorsContainerId, imgSrc) {
    super()

    this.canvas = document.getElementById(canvasId)

    this.colorPickers = Array.from(document.getElementById(colorsContainerId).children)
    this.colorPickers.forEach(colorPicker => { colorPicker.addEventListener('input', function() { this.render() }.bind(this)) })

    this.img = new Image()
    this.img.src = imgSrc
    this.img.onload = function() { this.webGLInit() }.bind(this)
  }

  static colorToVector(color) {
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

  webGLStart() {
    this.newColorsLoc = this.gl.getUniformLocation(this.program, 'u_new_colors')
    this.originalColorsLoc = this.gl.getUniformLocation(this.program, 'u_original_colors')
    this.colorsCountLoc = this.gl.getUniformLocation(this.program, 'u_colors_count')

    super.webGLStart()
  }

  render() {
    this.gl.uniform1i(this.colorsCountLoc, this.colorPickers.length)

    var glOriginalColors = []
    var glNewColors = []

    this.colorPickers.forEach(colorPicker => {
      glOriginalColors = glOriginalColors.concat(ColorSwapper.colorToVector(colorPicker.getAttribute('original')))
      glNewColors = glNewColors.concat(ColorSwapper.colorToVector(colorPicker.value))
    })

    this.gl.uniform4fv(this.newColorsLoc, glNewColors)
    this.gl.uniform4fv(this.originalColorsLoc, glOriginalColors)

    super.render()
  }
}