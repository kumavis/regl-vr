const VRFrameData = global.VRFrameData

module.exports = function ({regl}) {
  const frameData = new VRFrameData()
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

  function renderVr ({ vrDisplay }, renderScene) {
    // load VR data
    const vrDisplay = props.vrDisplay
    vrDisplay.getFrameData(frameData)
    
    // render left
    setEye({
      eye: 0,
      side: 'left',
      vrDisplay,
    }, renderScene)
    
    // render right
    setEye({
      eye: 1,
      side: 'right',
      vrDisplay,
    }, renderScene)

    // push frame to HMD
    vrDisplay.submitFrame()
  }
}
