//Constant to identify an instance of the component which has not been provided with pointcloud.
var NO_POINTCLOUD = "NOPC";

// Registering component
AFRAME.registerComponent('potreepointcloud', {
  schema: {
    pointcloudUrl: {type: "string", default: NO_POINTCLOUD},
    scale: {type: "number", default: 0.02},
    tileC: {type: "number", default: 0},
    tileR: {type: "number", default: 0},
    tileSize: {type: "number", default: 2000},
  },
  init: function () {
    this.isInit = false;
    this.viewer = undefined;
  },
  
  update: function () {
    console.log("Update.");
  },

  addPointCloud: function(pointcloudUrl, tileR, tileC) {
    var that = this;
    Potree.loadPointCloud(pointcloudUrl, "lion"+tileR+tileC, function(e) {
          that.viewer.scene.addPointCloud(e.pointcloud);

          e.pointcloud.position.x = tileC*that.data.tileSize*that.data.scale;
          e.pointcloud.position.y = tileHeights[tileR][tileC] || -15;
          e.pointcloud.position.z = -tileR*that.data.tileSize*that.data.scale;

          if(!tileHeights[tileR][tileC]) 
            console.error("There is no tile height for " + tileR + " , " + tileC);

          e.pointcloud.rotation.x = -0.5*Math.PI;
          e.pointcloud.rotation.y = 0;
          e.pointcloud.rotation.z = 0;

          e.pointcloud.scale.x = that.data.scale;
          e.pointcloud.scale.y = that.data.scale;
          e.pointcloud.scale.z = that.data.scale;

          that.material = e.pointcloud.material;
          that.geometry = e.pointcloud.pcoGeometry;

          //that.mesh = e.pointcloud;

          //that.el.setObject3D('lion'+tileR+tileC, that.mesh);

          //that.viewer.setElevationRange(-4, -1);
          //viewer.setElevationRange(-100, 1);
      });
  },

  tick: function () {
    if(!this.isInit && this.data.pointcloudUrl === NO_POINTCLOUD) {
      console.error("No point cloud URL provided.");
      this.isInit = true;
    }
    else if(!this.isInit) {
      this.viewer = new Potree.CustomViewer(this.el.object3D, this.el.sceneEl.renderer, this.el.sceneEl.camera);
      var that = this;

      this.viewer.setMaterial("Elevation");
      this.viewer.setPointSize(0.23);
      this.viewer.setPointSizing("Adaptive");
      this.viewer.setQuality("Squares");
      //viewer.setPointBudget(0.04*1000*1000);
      this.viewer.setPointBudget(1*1000*1000);
      this.viewer.setEDLEnabled(false);

      var that = this;

      Potree.loadPointCloud(this.data.pointcloudUrl, "lion", function(e) {
          that.viewer.scene.addPointCloud(e.pointcloud);

          e.pointcloud.position.x = that.data.tileC*that.data.tileSize*that.data.scale;
          e.pointcloud.position.y = tileHeights[that.data.tileR][that.data.tileC] || -15;
          e.pointcloud.position.z = -that.data.tileR*that.data.tileSize*that.data.scale;

          if(!tileHeights[that.data.tileR][that.data.tileC]) 
            console.error("There is no tile height for " + that.data.tileR + " , " + that.data.tileC);

          e.pointcloud.rotation.x = -0.5*Math.PI;
          e.pointcloud.rotation.y = 0;
          e.pointcloud.rotation.z = 0;

          e.pointcloud.scale.x = that.data.scale;
          e.pointcloud.scale.y = that.data.scale;
          e.pointcloud.scale.z = that.data.scale;

          //that.material = e.pointcloud.material;
          //that.geometry = e.pointcloud.pcoGeometry;

          //that.mesh = e.pointcloud;

          //that.el.setObject3D('lion', that.mesh);

          that.viewer.setElevationRange(-4, -1);
          //viewer.setElevationRange(-100, 1);
      });
      this.isInit = true;

    }
    else this.viewer.loop();
  },

  tock: function (time) {
    console.log("¡TOCK!");
  },

  remove: function () {},
  pause: function () {},
  play: function () {},
});