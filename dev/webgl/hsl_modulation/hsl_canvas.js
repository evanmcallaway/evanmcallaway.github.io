class HslCanvas extends WebGL2D {
  constructor(canvasId, imgSrc, modulate) {
    super()

    this.fps = 30

    this.canvas = document.getElementById(canvasId)

    this.img = new Image()
    this.img.src = imgSrc
    this.img.onload = function() { this.webGLInit() }.bind(this)

    this.modulate = modulate

    this.hue = 0
    this.hue_velocity = 0.005

    this.saturation = 1
    this.saturation_velocity = 0.025

    this.lightness = 1
    this.lightness_velocity = 0.0125
  }

  webGLStart() {
    this.hslLocation = this.gl.getUniformLocation(this.program, 'hsl_shift')

    super.webGLStart()
  }

  render() {
    if (this.modulate.hue)
      this.hue = (this.hue + this.hue_velocity) % 1.0

    if (this.modulate.saturation) {
      if (this.saturation <= 0 || this.saturation >= 2)
        this.saturation_velocity *= -1
      this.saturation += this.saturation_velocity
    }

    if (this.modulate.lightness) {
      if (this.lightness < 1 || this.lightness >= 2)
        this.lightness_velocity *= -1
      this.lightness += this.lightness_velocity
    }

    this.gl.uniform3f(this.hslLocation, this.hue, this.saturation, this.lightness)

    super.render()

    setTimeout(() => {
      requestAnimationFrame(function() { this.render() }.bind(this))
    }, 1000 / this.fps)
  }
}