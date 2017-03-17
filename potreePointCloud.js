var isInit = false;
var viewer = undefined;
// Registering component
AFRAME.registerComponent('potreepointcloud', {
  schema: {},
  init: function () {
  },
  update: function () {
    console.log("Update.");
  },
  tick: function () {
    if(!isInit) {
      //potreeCustomScene = new Potree.CustomScene(this.el.object3D);
      viewer = new Potree.CustomViewer(this.el.object3D, this.el.sceneEl.renderer, this.el.sceneEl.camera);
      var that = this;
      viewer.setMaterial("RGB");
      Potree.loadPointCloud("../pointclouds/lion_takanawa/cloud.js", "lion", function(e){
        viewer.scene.addPointCloud(e.pointcloud);

        that.material = e.pointcloud.material;
        that.geometry = e.pointcloud.pcoGeometry;

        that.mesh = e.pointcloud;

        that.el.setObject3D('lion', that.mesh);
        
        viewer.fitToScreen();
		  });
      isInit = true;
    }
    else
      viewer.loop();
  },
  remove: function () {},
  pause: function () {},
  play: function () {}
});