// Registering component
AFRAME.registerComponent('traingularanimation', {

  pythagorean: function(sideA, sideB){
    return Math.sqrt(Math.pow(sideA, 2) + Math.pow(sideB, 2));
  },

  init: function () {
    // create the particle variables
    this.particleCount = 200;
    var particles = new THREE.Geometry();
    var material = new THREE.SpriteCanvasMaterial( {
        color: 0xffffff,
        program: function ( context ) {

            context.beginPath();
            context.arc( 0, 0, 0.5, 0, PI2, true );
            context.fill();

        }
    } );

    var geometry = new THREE.Geometry();

    var particle;

    for ( var i = 0; i < 3; i ++ ) {

        particle = new THREE.Sprite( material );
        particle.position.x = Math.random() * 2 - 1;
        particle.position.y = Math.random() * 2 - 1;
        particle.position.z = Math.random() * 2 - 1;
        particle.position.normalize();
        particle.position.multiplyScalar( Math.random() * 10 + 450 );
        particle.scale.x = particle.scale.y = 10;

        this.el.setObject3D('animationparticle', particle);

        geometry.vertices.push( particle.position );

    }

    var line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 0.5 } ) );

    // add it to the scene
    this.el.setObject3D('animationline', line);
  },

  update: function () {
  },

  tick: function () {
    /*//this.mesh.rotation.y += 0.01;

    var pCount = this.particleCount;
    while (pCount--) {

        // get the particle
        var particle =
        this.geometry.vertices[pCount];

        // check if we need to reset
        if (particle.y > noisePartSys.PARTICLE_HEIGHT) {
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