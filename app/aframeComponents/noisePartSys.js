
noisepartsys = {};
noisepartsys.DEFAULT_TEXTURE_SRC = "resources/textures/particledefault2.png";
noisepartsys.PARTICLE_HEIGHT = 0.1;
noisepartsys.PARTICLE_WIDTH = 0.2;
noisepartsys.PARTICLE_DEPTH = 10;

noisepartsys.PARTICLES_PER_UNIT = 20;

// Registering component
AFRAME.registerComponent('noisepartsys', {
  schema: {
      textureSrc: {type: "string", default: noisepartsys.DEFAULT_TEXTURE_SRC},
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
    var loader = new THREE.TextureLoader();
    var particles = new THREE.Geometry(),
        pMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 0.1,
            map: loader.load(
                this.data.textureSrc
            ),
            transparent: true,
            alphaTest: 0.5,
        });

    var originPoint = {x: (this.data.initX-MainConsts.COORDS_CORNER.x) * MainConsts.SCALE, z: (this.data.initZ-MainConsts.COORDS_CORNER.y) * (-1) * MainConsts.SCALE};
    var endPoint = {x: (this.data.endX-MainConsts.COORDS_CORNER.x) * MainConsts.SCALE, z: (this.data.endZ-MainConsts.COORDS_CORNER.y) * (-1) * MainConsts.SCALE};

    var longitude = this.pythagorean(endPoint.x-originPoint.x, endPoint.z-originPoint.z);

    this.el.setAttribute('position', originPoint.x + " -2.635 " + originPoint.z);

    var radAngle = Math.asin(Math.abs(endPoint.z-originPoint.z)/longitude);

    //let's interprete this angle. According to the quadrant our triangle is in.
    if(endPoint.x < originPoint.x) {
        if(endPoint.z > originPoint.z) {
            radAngle += Math.PI;
        }
        else {
            radAngle = Math.PI - radAngle;
        }
    }
    else if(endPoint.z > originPoint.z) radAngle = 2*Math.PI - radAngle;

    var degreeAngle = radAngle * 180 / Math.PI;

    this.el.setAttribute('rotation', "0 " + degreeAngle + " 0");

    //TODO: number of particles proportional to longitude.
    this.particleCount = Math.trunc(noisepartsys.PARTICLES_PER_UNIT*longitude);

    // now create the individual particles
    for (var p = 0; p < this.particleCount; p++) {

        // create a particle with random
        // position values, -250 -> 250
        var pX = Math.random() * longitude,
            pY = Math.random() * noisepartsys.PARTICLE_HEIGHT,
            pZ = Math.random() * (noisepartsys.PARTICLE_WIDTH - noisepartsys.PARTICLE_WIDTH/2) * (-1),
            particle = new THREE.Vector3(pX, pY, pZ);

        particle.velocity = new THREE.Vector3(
            0,              // x
            Math.random()*0.01, // y: random vel
            0);             // z

        // add it to the geometry
        particles.vertices.push(particle);
    }

    //this.geometry = particles;
    //this.material = pMaterial;

    // create the particle system
    /*this.mesh = new THREE.Points(
        this.geometry,
        this.material);*/

    //LINES 
    

    this.material = new THREE.LineBasicMaterial( { color: 'red', opacity: 1 } );
    this.geometry = new THREE.Geometry();
    this.geometry.vertices.push( {x: 0, y: 0, z: 0} );
    this.geometry.vertices.push( {x: longitude, y: 0, z: 0} );
    
    this.mesh = new THREE.Line( this.geometry, this.material);

    //this.mesh.visible = false;

    // add it to the scene.
    this.el.setObject3D('partyclesystem', this.mesh);
  },

  update: function () {
  },

  tick: function () {
    //this.mesh.rotation.y += 0.01;

    /*var pCount = this.particleCount;
    while (pCount--) {

        // get the particle
        var particle =
        this.geometry.vertices[pCount];

        // check if we need to reset
        if (particle.y > noisepartsys.PARTICLE_HEIGHT) {
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
        verticesNeedUpdate = true;*/
  },

  remove: function () {},
  pause: function () {},
  play: function () {},
});