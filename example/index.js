const regl = require('regl')({
  pixelRatio: 1
})
const quat = require('gl-quat')
const mat4 = require('gl-mat4')
const translate = require('gl-mat4/translate')
const scale = require('gl-mat4/scale')

const generateBun = require('./bunny')
const generateWireBun = require('./wire')
const webVR = require('../vr')({regl})

// WebVR api to get HMD
navigator.getVRDisplays().then((vrDisplays) => {

  if (vrDisplays.length === 0) throw new Error('No VrDisplays.')

  const vrDisplay = vrDisplays[0]
  global.vrDisplay = vrDisplay
  console.log(`VR display detected: ${vrDisplay.displayName}`)
  
  // setup presenting
  vrDisplay.requestPresent([{ source: regl._gl.canvas }])
  startRender({ vrDisplay })

}).catch((err) => {
  console.error(err)
})

// start standard regl render loop
function startRender({ vrDisplay }) {

  // instantiate bun renderers
  const drawNormyBun = generateBun({ regl })
  const drawWireBun = generateWireBun({ regl })

  // start render loop
  regl.frame(({ tick }) => {
    regl.clear({
      color: [0, 0, 0, 1],
      depth: 1
    })
    // regl-vr calls the inner block twice
    // to draw each eye of the HMD
    // "projection" and "view" will be set for you
    webVR({ vrDisplay }, () => {
      
      drawWireBun({
        model: wireBunPos({ tick }),
      })
      drawNormyBun({
        model: normyBunPos({ tick }),
      })

    })
  })

}

function wireBunPos ({ tick }) {
  const mat = mat4.identity(mat4.create())
  translate(mat, mat, [0, -2.5, -2])
  mat4.rotateY(mat, mat, 0.0025 * tick)
  scale(mat, mat, [0.25, 0.25, 0.25])
  return mat
}

function normyBunPos ({ tick }) {
  const mat = mat4.identity(mat4.create())
  translate(mat, mat, [-1.5, -2.5, 0])
  mat4.rotateY(mat, mat, 0.0025 * tick)
  scale(mat, mat, [0.1, 0.1, 0.1])
  return mat
}