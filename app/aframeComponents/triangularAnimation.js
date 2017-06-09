triangularanimation = {};

triangularanimation.X_RANGE = 1;

triangularanimation.Y_RANGE = 1;

triangularanimation.MOV_PHASE = 70;

triangularanimation.NUM_VERTEX = 15;

triangularanimation.RADIUS = 1.5;

triangularanimation.MINIMUM_Y = -4.320;

triangularanimation.MAXIMUM_Y = 1.15;

triangularanimation.ACTIVATION_DISTANCE = 15;

// Registering component
AFRAME.registerComponent('triangularanimation', {

  pythagorean: function(sideA, sideB){
    return Math.sqrt(Math.pow(sideA, 2) + Math.pow(sideB, 2));
  },

  init: function () {

    var initAngle = 1.5 * Math.PI;

    //Calculate three points of a circunference to create a triangle.
    this.initPX = triangularanimation.RADIUS * Math.cos(initAngle);
    this.initPY = triangularanimation.RADIUS * Math.sin(initAngle);

    this.geometry = new THREE.Geometry();

    //this.geometry.vertices.push( {x: this.initPX, y: initPY, z: 0} );

    this.angles = [];
    this.angles[0] = initAngle;

    for ( var i = 0; i < triangularanimation.NUM_VERTEX; i ++ )
        this.geometry.vertices.push( {x: 0, y: triangularanimation.MINIMUM_Y, z: 0} );

    this.material = new THREE.LineBasicMaterial( { color: '#eaeaea', opacity: 1 } );

    this.mesh = new THREE.Line( this.geometry, this.material);

    this.counter = 0;
    this.currentVertex = 1;
    this.lastY = triangularanimation.MINIMUM_Y;
    this.el.setAttribute("visible", false);
  },

/*  assignTrianglePoint: function() {
      //Let's fill two of the remaining points of our rectangle. The first point (0) is
      //always the same, so does not net to be filled again.
      if(this.currentVertex >= triangularanimation.NUM_VERTEX-4 && this.currentVertex < triangularanimation.NUM_VERTEX) {
          if(this.currentVertex === triangularanimation.NUM_VERTEX-4 || this.currentVertex === triangularanimation.NUM_VERTEX-1) {
            this.geometry.vertices[this.currentVertex].y = this.initPY;
            this.geometry.vertices[this.currentVertex].x = this.initPX;
          }
          else {
            var lastVertexId = this.currentVertex - (triangularanimation.NUM_VERTEX-3);
            var currentVertexId = this.currentVertex - (triangularanimation.NUM_VERTEX-3) + 1;
            var midAngle = Math.random() * Math.PI / 2;

            var midPX = triangularanimation.RADIUS * Math.cos(this.angles[lastVertexId]+midAngle+Math.PI / 4);
            var midPY = triangularanimation.RADIUS * Math.sin(this.angles[lastVertexId]+midAngle+Math.PI / 4);
            this.geometry.vertices[this.currentVertex].y = midPY;
            this.geometry.vertices[this.currentVertex].x = midPX;

            this.angles[currentVertexId] = midAngle;
         }

          if(this.currentVertex < triangularanimation.NUM_VERTEX-1) ++this.currentVertex;
      }
      else if(this.currentVertex < 3) console.error("Current Vertex is not one of the triangle vertex: ", this.currentVertex);
  },*/

  update: function () {
      this.el.setObject3D('triangularanimation', this.mesh);
      //this.el.setObject3D('triangularanimation2', this.mesh2);
  },

  isSameVertex: function(i, j) {
      return this.geometry.vertices[i].x == this.geometry.vertices[j].x && 
        this.geometry.vertices[i].y == this.geometry.vertices[j].y && 
        this.geometry.vertices[i].z == this.geometry.vertices[j].z;
  },

  disassemble: function(time, timeDelta) {
    if(!this.disasembled && this.counter > triangularanimation.MOV_PHASE) {
        this.counter -= triangularanimation.MOV_PHASE;

        while(this.isSameVertex(this.currentVertex, this.currentVertex-1) && this.currentVertex > 1) 
            --this.currentVertex;

        //Change location of remaining vertex.
        for(var i = this.currentVertex; i < triangularanimation.NUM_VERTEX; ++i) {
            this.geometry.vertices[i].y = this.geometry.vertices[this.currentVertex-1].y;
            this.geometry.vertices[i].x = this.geometry.vertices[this.currentVertex-1].x;
        }

        this.geometry.verticesNeedUpdate = true;

        this.lastY = this.geometry.vertices[this.currentVertex].y;

        if(this.currentVertex === 1) {
            this.disasembled = true;
            this.el.setAttribute("visible", false);
        }
        else --this.currentVertex;

        this.assembled = false;
    }
    else if(this.counter > triangularanimation.MOV_PHASE) this.counter -= triangularanimation.MOV_PHASE;
  },

  assembly: function() {
    if(this.counter > triangularanimation.MOV_PHASE) {
        this.counter -= triangularanimation.MOV_PHASE;

        if(!this.assembled) {

            var newY = this.lastY + triangularanimation.Y_RANGE;

            var newX = this.currentVertex % 2 ? triangularanimation.X_RANGE/2 : -triangularanimation.X_RANGE/2;

            //If we reach the maximum height
            if(newY > triangularanimation.MAXIMUM_Y || this.currentVertex >= triangularanimation.NUM_VERTEX-1) {
                newY = triangularanimation.MAXIMUM_Y;
                newX = 0;
            }

            this.geometry.vertices[this.currentVertex].y = newY;
            this.geometry.vertices[this.currentVertex].x = newX;

            //Change location of remaining vertex.
            for(var i = this.currentVertex+1; i < triangularanimation.NUM_VERTEX; ++i) {
                this.geometry.vertices[i].y = this.geometry.vertices[this.currentVertex].y;
                this.geometry.vertices[i].x = this.geometry.vertices[this.currentVertex].x;
            }

            if(newY >= triangularanimation.MAXIMUM_Y) this.assembled = true;
            else ++this.currentVertex;
            this.lastY = newY;
        }

        this.geometry.verticesNeedUpdate = true;
        this.disasembled = false;
        this.el.setAttribute("visible", true);
    }
    else if(this.counter > triangularanimation.MOV_PHASE) this.counter -= triangularanimation.MOV_PHASE;
  },

  tick: function (time, timeDelta) {
    var camPos = document.querySelector('#app-camera').getAttribute('position');
    var position = this.el.getAttribute('position');

    var distance = this.pythagorean(position.x-camPos.x, position.z-camPos.z);

    this.counter += timeDelta;
    if(distance <= triangularanimation.ACTIVATION_DISTANCE) this.assembly(time, timeDelta);
    else this.disassemble(time, timeDelta);
  },

  remove: function () {},
  pause: function () {},
  play: function () {},
});