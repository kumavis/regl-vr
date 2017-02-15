const perspective = require('gl-mat4/perspective')
const translate = require('gl-mat4/translate')

module.exports = function ({regl}) {
  const mat = new Float32Array(16)
  const frameData = new global.VRFrameData()
  const defaultBounds = {
    leftBounds: [ 0.0, 0.0, 0.5, 1.0 ],
    rightBounds: [ 0.5, 0.0, 0.5, 1.0 ],
  }
  const setEye = regl({
    context: {
      projection: ({viewportWidth, viewportHeight}, {eye, vrDisplay}) => {
        // perspective(
        //   mat,
        //   fov,
        //   0.5 * viewportWidth / viewportHeight,
        //   zNear,
        //   zFar)
        // translate(mat, mat, [eye ? separation : -separation, 0, 0])

        const side = eye ? 'left' : 'right'

        const eyeParams = vrDisplay.getEyeParameters(side)
        // perspective(
        //   mat,
        //   fov,
        //   0.5 * viewportWidth / viewportHeight,
        //   zNear,
        //   zFar)
        const projectionMatrix = frameData[`${side}ProjectionMatrix`]
        translate(mat, projectionMatrix, eyeParams.offset)

        return mat
      }
    },

    viewport: ({drawingBufferWidth, drawingBufferHeight}, {eye, layers}) => {
      const layer = layers[0]
      const boundsName = eye ? 'leftBounds' : 'rightBounds'
      let bounds = layer[boundsName]
      if (!bounds || bounds.length !== 4) bounds = defaultBounds[boundsName]
      return {
        x: Math.round( drawingBufferWidth * bounds[0] ),
        y: Math.round( drawingBufferHeight * bounds[1] ),
        width: Math.round( drawingBufferWidth * bounds[2] ),
        height: Math.round( drawingBufferHeight * bounds[3] ),
      }  
      // return {
      //   x: eye * drawingBufferWidth / 2,
      //   y: 0,
      //   width: drawingBufferWidth / 2,
      //   height: drawingBufferHeight
      // }
    },

    scissor: {
      enable: true,
      box: ({drawingBufferWidth, drawingBufferHeight}, {eye}) => {
        return {
          x: eye * drawingBufferWidth / 2,
          y: 0,
          width: drawingBufferWidth / 2,
          height: drawingBufferHeight
        }
      }
    },

    uniforms: {
      projection: regl.context('projection')
    }
  })

  return function (props, block) {
    const zNear = props.zNear || 1
    const zFar = props.zFar || 1000.0
    const separation = props.separation || 0.25
    const fov = props.fov || (Math.PI / 4.0)
    // update VR display
    const vrDisplay = props.vrDisplay
    vrDisplay.depthNear = zNear
    vrDisplay.depthFar = zFar
    // load VR data
    vrDisplay.getFrameData(frameData)
    const layers = vrDisplay.getLayers()
    // render left
    setEye({
      eye: 0,
      layers,
      //
      fov,
      zNear,
      zFar,
      separation
    }, block)
    // render right
    setEye({
      eye: 1,
      layers,
      //
      fov,
      zNear,
      zFar,
      separation
    }, block)
  }
}
