pathgenerator = {};
pathgenerator.LONGITUDE_STEP = 0.25;
pathgenerator.PARTICLE_URL = "resources/textures/particledefault2.png";

//Contain ocean height in 3D space.
pathgenerator.OCEAN_HEIGHT = -4.320;

AFRAME.registerComponent('pathgenerator', {
  schema: {
      pathJsonUrl: {type: "string", default: undefined},
  },

  pythagorean: function(sideA, sideB){
    return Math.sqrt(Math.pow(sideA, 2) + Math.pow(sideB, 2));
  },

  /**
   * Given a geometry and its longitude, create its vertices.
   */
  initGeomParticles: function(geom, longitude) {
    geom.vertices.push(new THREE.Vector3(0, 0, 0));
    geom.vertices.push(new THREE.Vector3(longitude, 0, 0));

  },

  /** 
   * We try to discretice the problem of creating a geometry for each path. Multiple path will
   * have similar longited, so let's reuse its geometry. 
   */
  initialiceGeometries: function() {
        //NOTE: This.geometries is an array 
      for(i = 0; i < this.geometries.length; ++i) {
        if(typeof this.geometries[i] === 'object') 
            this.initGeomParticles(this.geometries[i].geom, i*pathgenerator.LONGITUDE_STEP);
      }
  },

  createMeshMaterial: function() {
        var loader = new THREE.TextureLoader();
        return new THREE.LineBasicMaterial({
            color: 'red',
            linewidth: 3,
        });
  },

  /**
   * Given the origin, end and longitude of a vector.
   * Returns the angle of this vector.
   */
  getAngle: function(originPoint, endPoint, longitude) {
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

    return radAngle;
  },

  addMesh: function(textureSrc, initX, initZ, endX, endZ, height, tiles) {

    var originPoint = {
        x: (initX-MainConsts.COORDS_CORNER.x) * MainConsts.SCALE,
        z: (initZ-MainConsts.COORDS_CORNER.y) * (-1) * MainConsts.SCALE};
    var endPoint = {
        x: (endX-MainConsts.COORDS_CORNER.x) * MainConsts.SCALE,
        z: (endZ-MainConsts.COORDS_CORNER.y) * (-1) * MainConsts.SCALE};

    var longitude = this.pythagorean(endPoint.x-originPoint.x, endPoint.z-originPoint.z);

    var height3DSpace = height*MainConsts.SCALE + pathgenerator.OCEAN_HEIGHT;

    //Will have a final geometry longer than the original longitude.
    //TODO: We can adjust this to get better results.
    var geomIndex = Math.trunc(longitude/pathgenerator.LONGITUDE_STEP) + 1;

    if(!this.geometries[geomIndex]) this.geometries[geomIndex] = {geom: new THREE.Geometry(), counter: 0};

    // create the particle system.
    mesh = new THREE.Line(
        this.geometries[geomIndex].geom,
        this.meshMaterial);

    mesh.rotation.y = this.getAngle(originPoint, endPoint, longitude);

    mesh.position.x = originPoint.x;
    mesh.position.y = height3DSpace;
    //mesh.position.y = -2.635;
    mesh.position.z = originPoint.z;

    mesh.visible = false;

    this.meshes.push({mesh: mesh, tiles: tiles, geomData: this.geometries[geomIndex]});
  },

  retrieveJsonData: function(callback) {
    var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
                if (xmlhttp.status == 200) {
                    var dataArray = []
                    var result = JSON.parse(this.responseText);

                    for(var key in result) {
                        dataArray.push(result[key]);
                    }

                    callback(dataArray);
                }
                else if (xmlhttp.status == 400) console.error('PathGenerator Error 400');
                else console.error('PathGenerator Error');
            }
        };

        xmlhttp.open("GET", this.data.pathJsonUrl, true);
        xmlhttp.send();
  },

  init: function () {
    this.geometries = [];
    this.meshes = [];
    //Create only one material which will be reused for all the geometries.
    this.meshMaterial = this.createMeshMaterial();

    var that = this;

    if(!this.data.pathJsonUrl) console.error("Path Generator needs a json URL to load path from it.");
    else this.retrieveJsonData(function (dataArray) {
        that.count = 0;
        that.numRails = 0;

        for(;;) {
            if(dataArray && that.count < 2200) {
                if(dataArray[that.count].start[0] > MainConsts.COORDS_CORNER.x && 
                    dataArray[that.count].start[1] > MainConsts.COORDS_CORNER.y && 
                    dataArray[that.count].end[0] > MainConsts.COORDS_CORNER.x && 
                    dataArray[that.count].end[1] > MainConsts.COORDS_CORNER.y) {

                    that.addMesh(pathgenerator.PARTICLE_URL, 
                        dataArray[that.count].start[0], dataArray[that.count].start[1], 
                        dataArray[that.count].end[0], dataArray[that.count].end[1], 
                        (dataArray[that.count].end[2]+dataArray[that.count].start[2])/2, 
                        dataArray[that.count].tiles);
                    ++that.numRails;
                }
                ++that.count;
            }
            else break;
        }
        //Fill used geometries with particles.
        that.initialiceGeometries();
        //Add all the new meshes to our scene.
        that.update();

        console.log("Num of rails: ", that.numRails);
        console.log("Number of fragments: ", that.count);
    });
  },

  update: function () {
      for(var i = 0; i < this.meshes.length; ++i) {
        this.el.setObject3D('partyclesystem'+i, this.meshes[i].mesh);
      }
  },

  updateGeomParticles: function(geom) {
    /*var particle;
    for(var i = 0; i < geom.vertices.length; ++i) {
        particle = geom.vertices[i];

        // check if we need to reset
        if (particle.y > noisepartsys.PARTICLE_HEIGHT) {
            particle.y = 0;
            particle.velocity.y = Math.random()*0.005;
        }

        // update the velocity with
        // a splat of randomniz
        particle.velocity.y += Math.random()* 0.00001;

        // and the position
        particle.add(particle.velocity);
    }

    geom.verticesNeedUpdate = true;*/
  },

  isMeshInTile: function(mesh, tile) {
    for(var i = 0; i < mesh.tiles.length; ++i) {
        if(mesh.tiles[i][0] === tile[1] && mesh.tiles[i][1] === tile[0]) return true;
    }
    //TODO: fill with code.
    return false;
  },

  /**
   * Change the visibility of certain paths. According to a tile Id.
   */
  changeVisibility: function(tile, visibility) {
    for(var i = 0; i < this.meshes.length; ++i) {
        if(this.isMeshInTile(this.meshes[i], tile) && this.meshes[i].mesh.visible !== visibility) {
            this.meshes[i].mesh.visible = visibility;
            if(visibility) ++this.meshes[i].geomData.counter;
            else --this.meshes[i].geomData.counter;
        }
    }
  },

  tick: function () {
      /*for(var i = 0; i < this.geometries.length; ++i) {
          if(this.geometries[i] && this.geometries[i].counter) 
            this.updateGeomParticles(this.geometries[i].geom);
      }*/
  },

  remove: function () {},
  pause: function () {},
  play: function () {},
});