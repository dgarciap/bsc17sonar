var DEFAULT_TEXTURE_SRC = "resources/textures/particledefault.png";
var PARTICLE_HEIGHT = 1;
var PARTICLE_WIDTH = 0.4;
var PARTICLE_DEPTH = 10;

// Registering component
AFRAME.registerComponent('particlesystem', {
  schema: {
      textureSrc: {type: "string", default: DEFAULT_TEXTURE_SRC},
  },

  init: function () {
    // create the particle variables
    this.particleCount = 1000;
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

    // now create the individual particles
    for (var p = 0; p < this.particleCount; p++) {

        // create a particle with random
        // position values, -250 -> 250
        var pX = Math.random() * PARTICLE_WIDTH - PARTICLE_WIDTH/2,
            pY = Math.random() * PARTICLE_HEIGHT,
            pZ = Math.random() * PARTICLE_DEPTH - PARTICLE_DEPTH/2,
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