AFRAME.registerComponent('pathgenerator', {
  schema: {
      pathJsonUrl: {type: "string", default: undefined},
  },

  pythagorean: function(sideA, sideB){
    return Math.sqrt(Math.pow(sideA, 2) + Math.pow(sideB, 2));
  },

  createPartSys: function (textureSrc, initX, initZ, endX, endZ, numSys) {
    // create the particle variables
    var loader = new THREE.TextureLoader();
    var particles = new THREE.Geometry(),
        pMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 0.1,
            map: loader.load(
                textureSrc
            ),
            transparent: true,
            alphaTest: 0.5,
        });

    var originPoint = {x: (initX-MainConsts.COORDS_CORNER.x) * MainConsts.SCALE, z: (initZ-MainConsts.COORDS_CORNER.y) * (-1) * MainConsts.SCALE};
    var endPoint = {x: (endX-MainConsts.COORDS_CORNER.x) * MainConsts.SCALE, z: (endZ-MainConsts.COORDS_CORNER.y) * (-1) * MainConsts.SCALE};

    if(!this.max) this.max = 0;
    var longitude = this.pythagorean(endPoint.x-originPoint.x, endPoint.z-originPoint.z);

    this.max = Math.max(this.max, longitude);

    console.log(longitude);

    //this.el.setAttribute('position', originPoint.x + " -2.635 " + originPoint.z);

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

    //this.el.setAttribute('rotation', "0 " + degreeAngle + " 0");

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

    // PARTICLES
    this.geometry = particles;
    this.material = pMaterial;

    // create the particle system.
    mesh = new THREE.Points(
        this.geometry,
        this.material);

    //LINES
    /*
    if(!this.material) this.material = new THREE.LineBasicMaterial( { color: 'red', opacity: 1 } );
    geometry = new THREE.Geometry();
    geometry.vertices.push( {x: 0, y: 0, z: 0} );
    geometry.vertices.push( {x: longitude, y: 0, z: 0} );

    
    var mesh = new THREE.Line( geometry, this.material);
    */
    //END-LINES

    mesh.rotation.y = radAngle;

    mesh.position.x = originPoint.x;
    mesh.position.y = -2.635;
    mesh.position.z = originPoint.z;

    //this.mesh.visible = false;

    // add it to the scene.
    //this.el.setObject3D('partyclesystem'+numSys, mesh);
    this.meshes.push(mesh);
  },

  init: function () {
      this.meshes = [];
    if(!this.data.pathJsonUrl) console.error("Path Generator needs a json URL to load path from it.");
    else {
        var xmlhttp = new XMLHttpRequest();

        var that = this;

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
                if (xmlhttp.status == 200) {
                    that.data = []
                    var result = JSON.parse(this.responseText);
                    that.count = 0;
                    that.numRails = 0;
                    for(var key in result) {
                        that.data.push(result[key]);
                    }
                    /*var count = 0;
                    var sceneEl = document.querySelector('a-scene');
                    var resultJson = JSON.parse(this.responseText);
                    for(var key in resultJson) {
                        var entityEl = document.createElement('a-entity');

                        entityEl.setAttribute('noisepartsys', "initX: " + resultJson[key].start[0] + ";initZ: " + resultJson[key].start[1] + 
                            ";endX: " + resultJson[key].end[0] + ";endZ: " + resultJson[key].end[1] + ";");

                        if(count < 200) {
                            sceneEl.appendChild(entityEl);
                            console.log("initX: " + resultJson[key].start[0] + ";initZ: " + resultJson[key].start[1] + 
                            ";endX: " + resultJson[key].end[0] + ";endZ: " + resultJson[key].end[1] + ";");
                        }
                        ++count;
                    }*/
                    that.particles = [];

                    for(;;) {
                        if(that.data && that.count < 1700) {
                            if(that.data[that.count].start[0] > MainConsts.COORDS_CORNER.x && 
                                that.data[that.count].start[1] > MainConsts.COORDS_CORNER.y && 
                                that.data[that.count].end[0] > MainConsts.COORDS_CORNER.x && 
                                that.data[that.count].end[1] > MainConsts.COORDS_CORNER.y) {
                            that.createPartSys("resources/textures/particledefault2.png", that.data[that.count].start[0], that.data[that.count].start[1], that.data[that.count].end[0], that.data[that.count].end[1], that.count);
                            /*var sceneEl = document.querySelector('a-scene');
                            var entityEl = document.createElement('a-entity');

                            entityEl.setAttribute('noisepartsys', "initX: " + that.data[that.count].start[0] + ";initZ: " + that.data[that.count].start[1] + 
                                ";endX: " + that.data[that.count].end[0] + ";endZ: " + that.data[that.count].end[1] + ";");

                            sceneEl.appendChild(entityEl);*/
                            ++that.numRails;
                            }
                            ++that.count;
                        }
                        else break;
                    }
                    console.log("MAX: ", that.max);
                    that.update();

                    console.log("Num of rails: ", that.numRails);
                    console.log("Number of fragments: ", that.count);
                }
                else if (xmlhttp.status == 400) {
                    console.error('PathGenerator Error 400');
                }
                else {
                    console.error('PathGenerator Error');
                }
            }
        };

        xmlhttp.open("GET", this.data.pathJsonUrl, true);
        xmlhttp.send();
    }
  },

  update: function () {
      for(var i = 0; i < this.meshes.length; ++i) {
        this.el.setObject3D('partyclesystem'+i, this.meshes[i]);
      }
  },

  tick: function () {

      /*if(this.data && this.count < 2200) {
          if(this.data[this.count].start[0] > MainConsts.COORDS_CORNER.x && this.data[this.count].start[1] > MainConsts.COORDS_CORNER.y && this.data[this.count].end[0] > MainConsts.COORDS_CORNER.x && this.data[this.count].end[1] > MainConsts.COORDS_CORNER.y) {
            var sceneEl = document.querySelector('a-scene');
            var entityEl = document.createElement('a-entity');

            entityEl.setAttribute('noisepartsys', "initX: " + this.data[this.count].start[0] + ";initZ: " + this.data[this.count].start[1] + 
                ";endX: " + this.data[this.count].end[0] + ";endZ: " + this.data[this.count].end[1] + ";");

            sceneEl.appendChild(entityEl);
            ++this.numRails;
          }
          if(this.count === 2199) console.log("Num of rails: ", this.numRails);
          ++this.count;
      }*/
  },

  remove: function () {},
  pause: function () {},
  play: function () {},
});