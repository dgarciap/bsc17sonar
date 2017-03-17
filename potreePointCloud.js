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
      viewer = new Potree.Viewer(null, {customScene: this.el.sceneEl.object3D, camera: this.el.sceneEl.camera, renderer: this.el.sceneEl.renderer});
      var that = this;
      viewer.setMaterial("RGB");
      Potree.loadPointCloud("../pointclouds/lion_takanawa/cloud.js", "lion", function(e){
        viewer.scene.addPointCloud(e.pointcloud);

        that.material = e.pointcloud.material;
        that.geometry = e.pointcloud.pcoGeometry;

        that.mesh = e.pointcloud;

        that.el.setObject3D('lion', that.mesh);
        
        //viewer.fitToScreen();
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