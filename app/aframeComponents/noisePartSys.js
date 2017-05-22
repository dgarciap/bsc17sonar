var DEFAULT_TEXTURE_SRC = "resources/textures/particledefault.png";
var PARTICLE_HEIGHT = 1;
var PARTICLE_WIDTH = 0.4;
var PARTICLE_DEPTH = 10;

// Registering component
AFRAME.registerComponent('noisepartsys', {
  schema: {
      textureSrc: {type: "string", default: DEFAULT_TEXTURE_SRC},
      initX: {type: "number", default: 0},
      initZ: {type: "number", default: 0},
      endX: {type: "number", default: 0},
      endZ: {type: "number", default: 0},
  },

  pythagorean: function(sideA, sideB){
    return Math.sqrt(Math.pow(sideA, 2) + Math.pow(sideB, 2));
  },

  init: function () {
    // create the particle variables
    this.particleCount = 2000;
    var particles = new THREE.Geometry(),
        pMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 0.07,
            map: THREE.ImageUtils.loadTexture(
                this.data.textureSrc
            ),
            transparent: true,
            alphaTest: 0.5,
        });

    var originPoint = {x: Math.abs(this.data.initX-MainConsts.COORDS_CORNER.x) * MainConsts.SCALE, z: Math.abs(this.data.initZ-MainConsts.COORDS_CORNER.y) * (-1) * MainConsts.SCALE}
    var endPoint = {x: Math.abs(this.data.endX-MainConsts.COORDS_CORNER.x) * MainConsts.SCALE, z: Math.abs(this.data.endZ-MainConsts.COORDS_CORNER.y) * (-1) * MainConsts.SCALE}

    var longitude = this.pythagorean(endPoint.x-originPoint.x, endPoint.z-originPoint.z);

    this.el.setAttribute('position', originPoint.x + " -3.635 " + originPoint.z);

    var radAngle = Math.PI/2 - Math.asin(Math.abs(endPoint.z-originPoint.z)/longitude);

    var degreeAngle = radAngle * 180 / Math.PI;

    this.el.setAttribute('rotation', "0 -" + degreeAngle + " 0");

    //TODO: number of particles proportional to longitude.

    // now create the individual particles
    for (var p = 0; p < this.particleCount; p++) {

        // create a particle with random
        // position values, -250 -> 250
        var pX = Math.random() * PARTICLE_WIDTH - PARTICLE_WIDTH/2,
            pY = Math.random() * PARTICLE_HEIGHT,
            pZ = Math.random() * longitude * (-1),
            particle = new THREE.Vector3(pX, pY, pZ);

        particle.velocity = new THREE.Vector3(
            0,              // x
            Math.random()*0.01, // y: random vel
            0);             // z

        // add it to the geometry
        particles.vertices.push(particle);
    }

    this.geometry = particles;
    this.material = pMaterial;

    // create the particle system
    this.mesh = new THREE.Points(
        this.geometry,
        this.material);

    // add it to the scene
    this.el.setObject3D('partyclesystem', this.mesh);
  },

  update: function () {
  },

  tick: function () {
    //this.mesh.rotation.y += 0.01;

    var pCount = this.particleCount;
    while (pCount--) {

        // get the particle
        var particle =
        this.geometry.vertices[pCount];

        // check if we need to reset
        if (particle.y > PARTICLE_HEIGHT) {
            particle.y = 0;
            particle.velocity.y = Math.random()*0.01;
        }

        // update the velocity with
        // a splat of randomniz
        particle.velocity.y += Math.random()* 0.00001;

        // and the position
        particle.add(particle.velocity);
    }

    // flag to the particle system
    // that we've changed its vertices.
    this.geometry.
        verticesNeedUpdate = true;

  },

  remove: function () {},
  pause: function () {},
  play: function () {},
});