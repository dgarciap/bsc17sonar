potreepointcloud = {};
//Constant to identify an instance of the component which has not been provided with pointcloud.
potreepointcloud.NO_POINTCLOUD = "NOPC";

potreepointcloud.POINT_BUDGET = 1*1000*1000;

// Registering component
AFRAME.registerComponent('potreepointcloud', {
  schema: {
    pointcloudUrl: {type: "string", default: potreepointcloud.NO_POINTCLOUD},
    scale: {type: "number", default: 0.02},
    tileC: {type: "number", default: 0},
    tileR: {type: "number", default: 0},
    tileSize: {type: "number", default: 2000},
  },
  init: function () {
    this.isInit = false;
    this.viewer = undefined;
    this.pointCloudMapper = [];

    if(!this.pointCloudMapper[this.data.tileR]) this.pointCloudMapper[this.data.tileR] = [];
    this.pointCloudMapper[this.data.tileR][this.data.tileC] = 'loading';

    var that = this;
    this.cloudLoadedMethod = function(e) {
        if(this.tileR === undefined || this.tileC === undefined) {
          throw "Error: cloudLoadedMethod should be provided with this.tileR and this.tileC.";
        }

        that.viewer.scene.addPointCloud(e.pointcloud);

        //Put it in our array.
        if(!that.pointCloudMapper[this.tileR]) that.pointCloudMapper[this.tileR] = [];
        that.pointCloudMapper[this.tileR][this.tileC] = e.pointcloud;

        e.pointcloud.position.x = this.tileC*that.data.tileSize*that.data.scale;
        e.pointcloud.position.y = tileHeights[this.tileR][this.tileC] || -15;
        e.pointcloud.position.z = -this.tileR*that.data.tileSize*that.data.scale;

        if(!tileHeights[this.tileR][this.tileC]) 
          console.error("There is no tile height for " + this.tileR + " , " + this.tileC);

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
    }
  },

  update: function () {
    console.log("Update.");
  },

  /**
   * Given a column and a row.
   * Find the 
   */
  setVisibility: function(tileR, tileC, visible) {
    //Sometimes the position is filled with a string which means that the tile is being loaded but not loaded yet.
    //This is being checked.
    if( typeof this.pointCloudMapper[tileR][tileC] === 'object') {
      this.pointCloudMapper[tileR][tileC].visible = visible;
    }
    else if (this.pointCloudMapper[tileR] && typeof this.pointCloudMapper[tileR][tileC] === 'string') {
      console.log("Trying to change visibility of not yet loaded tile. It will be visible when loaded anyway.");
    }
    else console.error("potreepointcloud Error: setVisibility error. TileR: ", tileR, " TileC: ", tileC);

  },

  isTileAdded: function(tileR, tileC) {
    //If it is loaded or loading
    if(this.pointCloudMapper[tileR] && this.pointCloudMapper[tileR][tileC]) return true;
    return false;
  },

  addPointCloud: function(pointcloudUrl, tileR, tileC) {
    var that = this;
    console.log("retrieving tile: ", pointcloudUrl);

    if(!this.pointCloudMapper[tileR]) this.pointCloudMapper[tileR] = [];
    this.pointCloudMapper[tileR][tileC] = 'loading';

    Potree.loadPointCloud(pointcloudUrl, "lion"+tileR+tileC, this.cloudLoadedMethod.bind({tileR: tileR, tileC: tileC}));
  },

  tick: function () {
    if(!this.isInit && this.data.pointcloudUrl === potreepointcloud.NO_POINTCLOUD) {
      console.error("No point cloud URL provided.");
      this.isInit = true;
    }
    else if(!this.isInit) {
      this.viewer = new Potree.CustomViewer(this.el.object3D, this.el.sceneEl.renderer, this.el.sceneEl.camera);

      this.viewer.setMaterial("Elevation");
      this.viewer.setPointSize(0.27);
      this.viewer.setPointSizing("Adaptive");
      this.viewer.setQuality("Squares");
      //viewer.setPointBudget(0.04*1000*1000);
      this.viewer.setPointBudget(potreepointcloud.POINT_BUDGET);
      this.viewer.setEDLEnabled(false);

      Potree.loadPointCloud(this.data.pointcloudUrl, "lion", this.cloudLoadedMethod.bind({tileR: this.data.tileR, tileC: this.data.tileC}));
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