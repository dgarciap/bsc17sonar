// Registering component
AFRAME.registerComponent('soundwave', {
  schema: {
  },
  init: function () {
    this.material = new THREE.ShaderMaterial({
        uniforms: {
            tExplosion: {
                type: "t",
                value: THREE.ImageUtils.loadTexture( 'resources/textures/explosion.png' )
            },
            time: { // float initialized to 0
                type: "f",
                value: 0.0
            }
        },
        vertexShader: soundWaveVS,
        fragmentShader: soundSphereFS,
        side: THREE.DoubleSide
    });

    /*this.material = new THREE.MeshBasicMaterial({
        color: 0xb7ff00,
        wireframe: true
    });*/

    this.geometry = new THREE.PlaneGeometry( 5, 5, 8, 8 );

    this.mesh = new THREE.Mesh(
        this.geometry,
        this.material
    );

    //this.mesh.rotation.x = 90;

    this.el.setObject3D('soundwavemesh', this.mesh);

    this.start = Date.now();
  },
 
  update: function () {
  },

  tick: function () {
    this.material.uniforms['time'].value = .00009 * ( Date.now() - this.start );
  },

  remove: function () {},
  pause: function () {},
  play: function () {},
});