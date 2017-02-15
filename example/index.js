const regl = require('regl')({
  pixelRatio: 1
})
const normals = require('angle-normals')
const bunny = require('bunny')
const quat = require('gl-quat')
const mat4 = require('gl-mat4')
const translate = require('gl-mat4/translate')
const scale = require('gl-mat4/scale')

const generateBunnyDrawer = require('./bunny')
const generateLodBunnyDrawer = require('./morph')
const webVR = require('../vr')({regl})

window.addEventListener( 'vrdisplaypresentchange', onVRDisplayPresentChange, false )

function onVRDisplayPresentChange(){
  console.log('onVRDisplayPresentChange', arguments)
}

navigator.getVRDisplays().then((vrDisplays) => {

  if (vrDisplays.length === 0) throw new Error('No VrDisplays.')

  const vrDisplay = vrDisplays[0]
  console.log('VR display detected: ' + vrDisplay.displayName);

  // setup presenting
  vrDisplay.requestPresent([{ source: regl._gl.canvas }])
  window.addEventListener('beforeunload', (e) => {
    vrDisplay.exitPresent()
  })

  const layers = vrDisplay.getLayers()
  console.log('layers:', layers)

  const eyeParams = vrDisplay.getEyeParameters('left')
  console.log(eyeParams)
  
  
  // vrDisplay.requestAnimationFrame
  // vrDisplay.submitFrame();
  const pose = vrDisplay.getPose();
  console.log('pose:', pose)
  // vrDisplay.resetPose();
  console.log('stageParameters:', vrDisplay.stageParameters)
  // standingMatrix.fromArray( vrDisplay.stageParameters.sittingToStandingTransform );

  startRender({ vrDisplay })

}).catch((err) => {
  console.error(err)
})

function startRender({ vrDisplay }) {

  const drawMesh = generateBunnyDrawer({
  // const drawMesh = generateLodBunnyDrawer({
    regl,
    view: ({tick}) => {
      const pose = vrDisplay.getPose()
      if (pose && pose.position) {
        // invert for some reason
        const rot = quat.create()
        quat.invert(rot, pose.orientation)
        // invert for some reason
        const scale = -1
        const pos = pose.position.map((value) => value*scale )
        return mat4.fromRotationTranslation(mat4.create(), rot, pos)
      } else {
        return mat4.lookAt(
          mat4.create(),
          [0, 2.5, -20],
          [0, 2.5, 0],
          [0, 1, 0]
        )
      }
    },
  })

  regl.frame(({tick}) => {
    regl.clear({
      color: [0, 0, 0, 1],
      depth: 1
    })

    webVR({
      zNear: 0.5,
      zFar: 1000.0,
      separation: 0.5,
      vrDisplay,
    }, () => {
      const NUM_LODS = 4
      const lod = Math.min(NUM_LODS, Math.max(0,0.5 * NUM_LODS * (1 + Math.cos(0.003 * tick))))
      drawMesh({ lod })
    })
  })

}