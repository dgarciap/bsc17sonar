// Registering component
AFRAME.registerComponent('soundsphere', {
  schema: {
  },
  init: function () {
    this.material = new THREE.MeshBasicMaterial({
        color: 0xb7ff00,
        wireframe: true
    });

    this.geometry = new THREE.IcosahedronGeometry( 20, 4 );

    this.mesh = new THREE.Mesh(
        this.geometry,
        this.material
    );

    this.el.setObject3D('soundsheremesh', this.mesh);
  },
  
  update: function () {
  },

  tick: function () {
  },

  remove: function () {},
  pause: function () {},
  play: function () {},
});