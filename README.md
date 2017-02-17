regl-vr
===========
A WebVR renderer for [`regl`](https://regl.party/).

<img src="./vr.png">

## Example

```javascript
const regl = require('regl')({
  pixelRatio: 1
})
const quat = require('gl-quat')
const mat4 = require('gl-mat4')
const translate = require('gl-mat4/translate')
const scale = require('gl-mat4/scale')

const generateBun = require('./bunny')
const generateWireBun = require('./wire')
const webVR = require('regl-vr')({regl})

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
```

## API

#### `const webVR = require('regl-vr')(options)`
Creates a new webVR camera. `options` has the following parameters:

* `regl` is a reference to the `regl` context

**Returns** A new webVR renderer

#### `webVR(props, block)`
Renders a webVR view with the given properties.  `block` is a command that draws the scene.

`props` has the following arguments:

* `vrDisplay` is the WebVR API's vrDisplay you want to render to

This sets the viewport, scissor box, projection and view matrix uniforms.

## License
(c) 2016 kumavis. MIT License
