Potree.CustomScene = class extends THREE.EventDispatcher{
	constructor(scene, camera){
		super();
		
		this.annotations = [];


		this.scenePointCloud = scene;

		this.pointclouds = [];
		this.referenceFrame;
		
		this.measurements = [];
		this.profiles = [];
		this.volumes = [];

		this.camera = new THREE.PerspectiveCamera(this.fov, 1, 0.1, 1000*1000);
		if(camera) this.camera = camera;
		
		this.fpControls;
		this.orbitControls;
		this.earthControls;
		this.geoControls;
		this.inputHandler;
		this.view = new Potree.View();
		
		//this.directionalLight = null;
		
		this.initialize();
		
	}
	
	addPointCloud(pointcloud){
		this.pointclouds.push(pointcloud);
		this.scenePointCloud.add(pointcloud);
		
		this.dispatchEvent({
			type: "pointcloud_added",
			pointcloud: pointcloud
		});
	};
	
	addVolume(volume){
		this.volumes.push(volume);
		this.dispatchEvent({
			"type": "volume_added",
			"scene": this,
			"volume": volume
		});
	};
	
	removeVolume(volume){
		let index = this.volumes.indexOf(volume);
		if (index > -1) {
			this.volumes.splice(index, 1);
			this.dispatchEvent({
				"type": "volume_removed",
				"scene": this,
				"volume": volume
			});
		}
	};
	
	addMeasurement(measurement){
		this.measurements.push(measurement);
		this.dispatchEvent({
			"type": "measurement_added",
			"scene": this,
			"measurement": measurement
		});
	};
	
	removeMeasurement(measurement){
		let index = this.measurements.indexOf(measurement);
		if (index > -1) {
			this.measurements.splice(index, 1);
			this.dispatchEvent({
				"type": "measurement_removed",
				"scene": this,
				"measurement": measurement
			});
		}
	}
	
	addProfile(profile){
		this.profiles.push(profile);
		this.dispatchEvent({
			"type": "profile_added",
			"scene": this,
			"profile": profile
		});
	}
	
	removeProfile(profile){
		let index = this.profiles.indexOf(profile);
		if (index > -1) {
			this.profiles.splice(index, 1);
			this.dispatchEvent({
				"type": "profile_removed",
				"scene": this,
				"profile": profile
			});
		}
	}
	
	removeAllMeasurements(){
		while(this.measurements.length > 0){
			this.removeMeasurement(this.measurements[0]);
		}
		
		while(this.profiles.length > 0){
			this.removeProfile(this.profiles[0]);
		}
	}
	
	initialize(){
		
		this.referenceFrame = new THREE.Object3D();
		this.referenceFrame.matrixAutoUpdate = false;
		this.scenePointCloud.add(this.referenceFrame);

		//this.camera.up.set(0, 0, 1);
		//this.camera.position.set(1000, 1000, 1000);
		
		/*this.directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
		this.directionalLight.position.set( 10, 10, 10 );
		this.directionalLight.lookAt( new THREE.Vector3(0, 0, 0));
		this.scenePointCloud.add( this.directionalLight );*/
		
		//var light = new THREE.AmbientLight( 0x555555 ); // soft white light
		//this.scenePointCloud.add( light );
	}
	
	addAnnotation(position, args = {}){
		if(position instanceof Array){
			args.position = new THREE.Vector3().fromArray(position);
		}else if(position instanceof THREE.Vector3){
			args.position = position;
		}
		
		
		if(!args.cameraTarget){
			args.cameraTarget = position;
		}
		
		var annotation = new Potree.Annotation(this, args);
		
		this.annotations.push(annotation);
		
		this.dispatchEvent({
			"type": "annotation_added", 
			"scene": this,
			"annotation": annotation});
		
		return annotation;
	}
	
	getAnnotations(){
		return this.annotations;
	};
	
}