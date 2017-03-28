var isInit = false;
var viewer = undefined;

var lastUpdate

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
      viewer = new Potree.CustomViewer(this.el.object3D, this.el.sceneEl.renderer, this.el.sceneEl.camera);
      var that = this;

      viewer.setMaterial("Elevation");
      viewer.setPointSize(10);
      viewer.setPointSizing("Fixed");
      viewer.setQuality("Squares");
      //viewer.setPointBudget(0.04*1000*1000);
      viewer.setPointBudget(1*1000*1000);
      viewer.setEDLEnabled(true);

      Potree.loadPointCloud("pointclouds/bcnfrag/cloud.js", "lion", function(e){
        viewer.scene.addPointCloud(e.pointcloud);

        e.pointcloud.position.x = 0;
        e.pointcloud.position.y = -40;
        e.pointcloud.position.z = 0;

        e.pointcloud.rotation.x = 0;
        e.pointcloud.rotation.y = 0;
        e.pointcloud.rotation.z = 0;

        e.pointcloud.scale.x = 0.05;
        e.pointcloud.scale.y = 0.05;
        e.pointcloud.scale.z = 0.05;

        that.material = e.pointcloud.material;
        that.geometry = e.pointcloud.pcoGeometry;

        that.mesh = e.pointcloud;

        that.el.setObject3D('lion', that.mesh);
      
		  });
      isInit = true;

    }
    else viewer.loop();
  },

  tock: function (time) {
    console.log("¡TOCK!");
  },

  remove: function () {},
  pause: function () {},
  play: function () {}
});