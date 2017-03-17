// Registering component
AFRAME.registerComponent('potreematerial', {
  schema: {isInit: false},
  init: function () {
      this.material = new  Potree.PointCloudMaterial();
  },
  update: function () {},
  tick: function () {
    console.log("Tick!");
  },
  remove: function () {},
  pause: function () {},
  play: function () {}
});