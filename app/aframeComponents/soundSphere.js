// Registering component
AFRAME.registerComponent('soundsphere', {
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
        vertexShader: soundSphereVS,
        fragmentShader: soundSphereFS
    });

    this.geometry = new THREE.IcosahedronGeometry( 3, 4 );

    this.mesh = new THREE.Mesh(
        this.geometry,
        this.material
    );

    this.el.setObject3D('soundsheremesh', this.mesh);

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