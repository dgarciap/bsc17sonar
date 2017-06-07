triangularanimation = {};

triangularanimation.X_RANGE = 2;

triangularanimation.Y_RANGE = 1;

triangularanimation.MOV_PHASE = 70;

triangularanimation.NUM_VERTEX = 15;

triangularanimation.RADIUS = 1.5;

triangularanimation.MINIMUM_Y = -4;

triangularanimation.ACTIVATION_DISTANCE = 7;

// Registering component
AFRAME.registerComponent('triangularanimation', {

  pythagorean: function(sideA, sideB){
    return Math.sqrt(Math.pow(sideA, 2) + Math.pow(sideB, 2));
  },

  init: function () {

    var initAngle = 1.5 * Math.PI;

    //Calculate three points of a circunference to create a triangle.
    var initPX = triangularanimation.RADIUS * Math.cos(initAngle);
    var initPY = triangularanimation.RADIUS * Math.sin(initAngle);

    this.geometry = new THREE.Geometry();

    this.geometry.vertices.push( {x: initPX, y: initPY, z: 0} );

    this.angles = [];
    this.angles[0] = initAngle;

    for ( var i = 0; i < triangularanimation.NUM_VERTEX-1; i ++ )
        this.geometry.vertices.push( {x: initPX, y: initPY, z: 0} );

    this.material = new THREE.LineBasicMaterial( { color: 0xffba00, opacity: 1 } );

    this.mesh = new THREE.Line( this.geometry, this.material);

    this.mesh2 = new THREE.Points( this.geometry, new THREE.PointsMaterial( { size: 0.1, sizeAttenuation: true } ));

    this.counter = 0;
    this.currentVertex = 1;
    this.lastY = -triangularanimation.RADIUS;
    this.el.setAttribute("visible", false);
  },

  assignTrianglePoint: function() {
      //Let's fill two of the remaining points of our rectangle. The first point (0) is
      //always the same, so does not net to be filled again.
      if(this.currentVertex > 0 && this.currentVertex < 3) {
          if(this.currentVertex === 4) {
            this.geometry.vertices[this.currentVertex].y = this.geometry.vertices[0].y;
            this.geometry.vertices[this.currentVertex].x = this.geometry.vertices[0].x;
          }
          else {
            var midAngle = Math.random() * Math.PI / 2;

            var midPX = triangularanimation.RADIUS * Math.cos(this.angles[this.currentVertex-1]+midAngle+Math.PI / 4);
            var midPY = triangularanimation.RADIUS * Math.sin(this.angles[this.currentVertex-1]+midAngle+Math.PI / 4);
            this.geometry.vertices[this.currentVertex].y = midPY;
            this.geometry.vertices[this.currentVertex].x = midPX;

            this.angles[this.currentVertex] = midAngle;
         }

      }
      else if(this.currentVertex < 3) console.error("Current Vertex is not one of the triangle vertex: ", this.currentVertex);
  },

  update: function () {
      this.el.setObject3D('triangularanimation', this.mesh);
      this.el.setObject3D('triangularanimation3', this.mesh2);
  },

  disassemble: function(time, timeDelta) {
    if(!this.disasembled && this.counter > triangularanimation.MOV_PHASE) {
        this.counter -= triangularanimation.MOV_PHASE;

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
    if(!this.assembled && this.counter > triangularanimation.MOV_PHASE && this.currentVertex < triangularanimation.NUM_VERTEX) {
        this.counter -= triangularanimation.MOV_PHASE;

        if(this.currentVertex < 4) {
            this.assignTrianglePoint();
            ++this.currentVertex;
        }
        else {

            var newY = this.lastY - Math.random() * triangularanimation.Y_RANGE;

            //If it is the last vertex, we place it in our minimum Y.
            if(this.currentVertex >= triangularanimation.NUM_VERTEX - 1) newY = triangularanimation.MINIMUM_Y;

            var newX = Math.random() * triangularanimation.X_RANGE - triangularanimation.X_RANGE/2;
            if(!this.geometry.vertices[this.currentVertex]) console.log(this.currentVertex);
            this.geometry.vertices[this.currentVertex].y = newY;
            this.geometry.vertices[this.currentVertex].x = newX;
            this.geometry.verticesNeedUpdate = true;

            //Change location of remaining vertex.
            for(var i = this.currentVertex+1; i < triangularanimation.NUM_VERTEX; ++i) {
                this.geometry.vertices[i].y = this.geometry.vertices[this.currentVertex].y;
                this.geometry.vertices[i].x = this.geometry.vertices[this.currentVertex].x;
            }

            //If we reach the floor limit (y === 0), we stop descending.
            if(this.lastY <= triangularanimation.MINIMUM_Y) this.assembled = true;
            else ++this.currentVertex;
            this.lastY = newY;
        }

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