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
      projection: ({}, { eye }) => {
        if (eye) {
          return frameData.rightProjectionMatrix
        } else {
          return frameData.leftProjectionMatrix
        }
      },
      view: ({}, { eye }) => {
        if (eye) {
          return frameData.rightViewMatrix
        } else {
          return frameData.leftViewMatrix
        }
      },
    },

    viewport: calculateViewport,

    scissor: {
      enable: true,
      box: calculateViewport,
    },

    uniforms: {
      projection: regl.context('projection'),
      view: regl.context('view'),
    }
  })

  return renderVr

  function calculateViewport ({ drawingBufferWidth, drawingBufferHeight }, { eye }) {
    return {
      x: eye * drawingBufferWidth / 2,
      y: 0,
      width: drawingBufferWidth / 2,
      height: drawingBufferHeight
    }
  }

  function renderVr (props, block) {
    const zNear = props.zNear || 1
    const zFar = props.zFar || 1000.0
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
      side: 'left',
      layers,
      vrDisplay,
    }, block)
    
    // render right
    setEye({
      eye: 1,
      side: 'right',
      layers,
      vrDisplay,
    }, block)

    vrDisplay.submitFrame()
  }
}
