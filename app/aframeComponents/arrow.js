var MAX_GROWTH = 0.2;
var GROWTH_STEP = 0.6;

// Registering component
AFRAME.registerComponent('arrow', {
  schema: {
      initScale: {type: "string", default: "1 1 1"},
  },
  init: function () {
    var loader = new THREE.ObjectLoader();
    var that = this;
    loader.load(

        // resource URL
        'resources/models/arrow.json',

        // Function when resource is loaded
        function ( object ) {
            /*that.geometry = geometry;
            that.material = new THREE.MeshBasicMaterial({
                color: 0xb7ff00,
                wireframe: true
            });
            that.mesh = new THREE.Mesh( that.geometry, that.material );*/

            // add it to the scene
            that.mesh = object;
            that.el.setObject3D('partyclesystem', object);

        }
    );
  },
 
  update: function () {
  },

  tick: function (time, timeDelta) {
    //If 1 sec is GROWTH_STEP, timeDelta is ...
    var growth = timeDelta*GROWTH_STEP/1000;
    var rotation = timeDelta*(Math.PI/2)/1000;
    this.mesh.rotation.y += rotation % (Math.PI/2);

    /*if(!this.defScale) {
        var initScale = this.data.initScale.split(" ");
        this.defScale = {};
        this.defScale.x = parseInt(initScale[0]);
        this.defScale.y = parseInt(initScale[1]);
        this.defScale.z = parseInt(initScale[2]);

        this.mesh.scale.x = this.defScale.x;
        this.mesh.scale.y = this.defScale.y;
        this.mesh.scale.z = this.defScale.z;

        this.direction = -1;
    }
    if(this.direction < 0) {
        this.mesh.scale.x -= growth;
        this.mesh.scale.y -= growth;
        this.mesh.scale.z -= growth;

        if(this.mesh.scale.x < this.defScale.x-MAX_GROWTH)
            this.direction = 1;
    }
    else {
        this.mesh.scale.x += growth;
        this.mesh.scale.y += growth;
        this.mesh.scale.z += growth;

        if(this.mesh.scale.x > this.defScale.x+MAX_GROWTH)
            this.direction = -1;
    }*/
    
    //this.mesh.scale.
  },

  remove: function () {},
  pause: function () {},
  play: function () {},
});