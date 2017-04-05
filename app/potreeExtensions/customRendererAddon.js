
class PotreeCustomRenderer{
	
	constructor(viewer){
		this.viewer = viewer;
	};

	render(){
		{// resize
			let width = this.viewer.scaleFactor * this.viewer.renderArea.clientWidth;
			let height = this.viewer.scaleFactor * this.viewer.renderArea.clientHeight;
			let aspect = width / height;
			
			this.viewer.scene.camera.aspect = aspect;
			this.viewer.scene.camera.updateProjectionMatrix();
			
			this.viewer.renderer.setSize(width, height);
		}
		
		for(let i = 0; i < this.viewer.scene.pointclouds.length; i++){
			let pointcloud = this.viewer.scene.pointclouds[i];
			if(pointcloud.originalMaterial){
				pointcloud.material = pointcloud.originalMaterial;
			}
			
			let bbWorld = Potree.utils.computeTransformedBoundingBox(pointcloud.boundingBox, pointcloud.matrixWorld);
			
			pointcloud.material.useEDL = false;
			pointcloud.material.size = this.viewer.pointSize;
			pointcloud.material.minSize = this.viewer.minPointSize;
			pointcloud.material.maxSize = this.viewer.maxPointSize;
			pointcloud.material.opacity = this.viewer.opacity;
			pointcloud.material.pointColorType = this.viewer.pointColorType;
			pointcloud.material.pointSizeType = this.viewer.pointSizeType;
			pointcloud.material.pointShape = (this.viewer.quality === "Circles") ? Potree.PointShape.CIRCLE : Potree.PointShape.SQUARE;
			pointcloud.material.interpolate = (this.viewer.quality === "Interpolation");
			pointcloud.material.weighted = false;
		}
	};
};
