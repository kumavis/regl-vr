const mat4 = require('gl-mat4')
const perspective = require('gl-mat4/perspective')
const translate = require('gl-mat4/translate')
const quat = require('gl-quat')
const quatInvert = require('gl-quat/invert')

module.exports = function ({regl}) {
  const mat = new Float32Array(16)
  const frameData = new global.VRFrameData()
  const defaultBounds = {
    leftBounds: [ 0.0, 0.0, 0.5, 1.0 ],
    rightBounds: [ 0.5, 0.0, 0.5, 1.0 ],
  }
  const setEye = regl({
    context: {
      projection: ({viewportWidth, viewportHeight}, {eye, fov, zNear, zFar, side, vrDisplay}) => {
        const projectionMatrix = frameData[`${side}ProjectionMatrix`]
        const eyeParams = vrDisplay.getEyeParameters(side)
        translate(mat, projectionMatrix, eyeParams.offset)
        return mat
      },
    },

    viewport: ({drawingBufferWidth, drawingBufferHeight}, {eye, side, layers}) => {
      const layer = layers[0] || {}
      const boundsName = `${side}Bounds`
      let bounds = layer[boundsName]
      if (!bounds || bounds.length !== 4) bounds = defaultBounds[boundsName]
      return {
        x: Math.round( drawingBufferWidth * bounds[0] ),
        y: Math.round( drawingBufferHeight * bounds[1] ),
        width: Math.round( drawingBufferWidth * bounds[2] ),
        height: Math.round( drawingBufferHeight * bounds[3] ),
      }
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
      projection: regl.context('projection'),
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
    const pose = vrDisplay.getPose();
    
    // render left
    setEye({
      eye: 0,
      side: 'left',
      layers,
      vrDisplay,
      pose,
      // deprecated
      fov,
      zNear,
      zFar,
      separation
    }, block)
    
    // render right
    setEye({
      eye: 1,
      side: 'right',
      layers,
      vrDisplay,
      pose,
      // deprecated
      fov,
      zNear,
      zFar,
      separation
    }, block)

    vrDisplay.submitFrame()
  }
}
