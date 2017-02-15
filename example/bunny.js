const normals = require('angle-normals')
const bunny = require('bunny')
const quat = require('gl-quat')
const mat4 = require('gl-mat4')
const translate = require('gl-mat4/translate')
const scale = require('gl-mat4/scale')

module.exports = function generateBunnyDrawer({ regl, model }) {

  const drawMesh = regl({
    vert: `
    precision highp float;

    attribute vec3 position, normals;
    uniform mat4 projection, view, model;

    varying vec3 fragColor;

    void main () {
      vec3 color = normals;
      float minC = min(min(color.x, color.y), color.z);
      float maxC = max(max(color.x, color.y), color.z);
      fragColor = (color - minC) / (maxC - minC);
      gl_Position = projection * view * model * vec4(position, 1);
    }
    `,

    frag: `
    precision highp float;

    varying vec3 fragColor;

    void main () {
      gl_FragColor = vec4(fragColor, 1);
    }
    `,

    attributes: {
      position: bunny.positions,
      normals: normals(bunny.cells, bunny.positions)
    },

    elements: bunny.cells,

    uniforms: {
      model: model,
    }
  })

  return drawMesh

}