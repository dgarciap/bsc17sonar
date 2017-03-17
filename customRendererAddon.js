
class PotreeCustomRenderer{
	
	constructor(viewer){
		this.viewer = viewer;
	};

	render(){
		{// resize
			let width = viewer.scaleFactor * viewer.renderArea.clientWidth;
			let height = viewer.scaleFactor * viewer.renderArea.clientHeight;
			let aspect = width / height;
			
			viewer.scene.camera.aspect = aspect;
			viewer.scene.camera.updateProjectionMatrix();
			
			viewer.renderer.setSize(width, height);
		}
		
		for(let i = 0; i < viewer.scene.pointclouds.length; i++){
			let pointcloud = viewer.scene.pointclouds[i];
			if(pointcloud.originalMaterial){
				pointcloud.material = pointcloud.originalMaterial;
			}
			
			let bbWorld = Potree.utils.computeTransformedBoundingBox(pointcloud.boundingBox, pointcloud.matrixWorld);
			
			pointcloud.material.useEDL = false;
			pointcloud.material.size = viewer.pointSize;
			pointcloud.material.minSize = viewer.minPointSize;
			pointcloud.material.maxSize = viewer.maxPointSize;
			pointcloud.material.opacity = viewer.opacity;
			pointcloud.material.pointColorType = viewer.pointColorType;
			pointcloud.material.pointSizeType = viewer.pointSizeType;
			pointcloud.material.pointShape = (viewer.quality === "Circles") ? Potree.PointShape.CIRCLE : Potree.PointShape.SQUARE;
			pointcloud.material.interpolate = (viewer.quality === "Interpolation");
			pointcloud.material.weighted = false;
		}
	};
};
