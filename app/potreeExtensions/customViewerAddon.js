Potree.CustomViewer = class PotreeCustomViewer extends THREE.EventDispatcher{
	
	constructor(aScene, aRenderer, aCamera, args){
		super();
		
		var a = args || {};
		this.pointCloudLoadedCallback = a.onPointCloudLoaded || function(){};
		

        this.renderer = aRenderer;

		this.renderArea = this.renderer.domElement;
		
		//if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		//	defaultSettings.navigation = "Orbit";
		//}
		
		this.fov = 60;
		this.pointSize = 1;
		this.minPointSize = 1;
		this.maxPointSize = 50;
		this.opacity = 1;
		this.sizeType = "Fixed";
		this.pointSizeType = Potree.PointSizeType.FIXED;
		this.pointColorType = null;
		this.clipMode = Potree.ClipMode.HIGHLIGHT_INSIDE;
		this.quality = "Squares";
		this.isFlipYZ = false;
		this.useDEMCollisions = false;
		this.minNodeSize = 100;
		this.directionalLight;
		this.edlStrength = 1.0;
		this.edlRadius = 1.4;
		this.useEDL = false;
		this.intensityMax = null;
		this.heightMin = 0;
		this.heightMax = 1;
		this.materialTransition = 0.5;
		this.weightRGB = 1.0;
		this.weightIntensity = 0.0;
		this.weightElevation = 0.0;
		this.weightClassification = 0.0;
		this.weightReturnNumber = 0.0;
		this.weightSourceID = 0.0;
		this.intensityRange = [0, 65000];
		this.intensityGamma = 1;
		this.intensityContrast = 0;
		this.intensityBrightness = 0;
		this.rgbGamma = 1;
		this.rgbContrast = 0;
		this.rgbBrightness = 0;
		
		this.moveSpeed = 10;

		this.showDebugInfos = false;
		this.showBoundingBox = false;
		this.freeze = false;

		this.mapView;

		this.stats = new Stats();
		//this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
		//document.body.appendChild( this.stats.dom );
		//this.stats.dom.style.left = "100px";
		
		this.potreeRenderer = null;
		this.highQualityRenderer = null;
		this.edlRenderer = null;
		
		this.scene = null;
		
		this.skybox = null;
		this.clock = new THREE.Clock();
		this.background = null;
		
		this.initThree();
		
		let scene = new Potree.CustomScene(aScene, aCamera);
		this.setScene(scene);
		
		{
			
			this.createControls();
			
			
			let onPointcloudAdded = (e) => {
				this.updateHeightRange();
				
				if(this.scene.pointclouds.length === 1){
					let speed = e.pointcloud.boundingBox.getSize().length();
					speed = speed / 5;
					this.setMoveSpeed(speed);
					//this.scene.view.radius = speed * 2.5;
				}
				
				
				//if(e.pointcloud.projection){
				//	this.mapView = new Potree.MapView(this);
				//	this.mapView.init();
				//}
				
			};
			
			this.addEventListener("scene_changed", (e) => {
				this.updateHeightRange();
				
				if(!e.scene.hasEventListener("pointcloud_added", onPointcloudAdded)){
					e.scene.addEventListener("pointcloud_added", onPointcloudAdded);
				}
			});
			
			this.scene.addEventListener("pointcloud_added", onPointcloudAdded);
		}
		
		{// set defaults
			this.setPointSize(1);
			this.setFOV(60);
			this.setOpacity(1);
			this.setEDLEnabled(false);
			this.setEDLRadius(1.4);
			this.setEDLStrength(1.0);
			this.setClipMode(Potree.ClipMode.HIGHLIGHT_INSIDE);
			this.setPointBudget(1*1000*1000);
			this.setShowBoundingBox(false);
			this.setFreeze(false);
			this.setBackground("gradient");
			
			this.scaleFactor = 1;
		
			this.loadSettingsFromURL();
		}

		// start rendering!
		//requestAnimationFrame(this.loop.bind(this));
		
	}

//------------------------------------------------------------------------------------
// Viewer API 
//------------------------------------------------------------------------------------

	
	
	setScene(scene){
		
		if(scene === this.scene){
			return;
		}
		
		let oldScene = scene;
		this.scene = scene;
		
		this.dispatchEvent({
			type: "scene_changed",
			oldScene: oldScene,
			scene: scene
		});
		
		
		{ // Annotations
			$(".annotation").detach();
			
			for(let annotation of this.scene.annotations){
				this.renderArea.appendChild(annotation.domElement);
			}
		
			// TODO make sure this isn't added multiple times on scene switches
			this.scene.addEventListener("annotation_added", (e) => {
				if(e.scene === this.scene){
					this.renderArea.appendChild(e.annotation.domElement);
				}
				
				//focusing_finished
				e.annotation.addEventListener("focusing_finished", (event) => {
					let distance = this.scene.view.position.distanceTo(this.scene.view.getPivot());
					//this.setMoveSpeed(distance / 3);
					this.setMoveSpeed(Math.pow(distance, 0.4));
					this.renderer.domElement.focus();
				});
			});
		}
		
	};
	
	getControls(navigationMode){
		if(navigationMode === Potree.OrbitControls){
			return this.orbitControls;
		}else if(navigationMode === Potree.FirstPersonControls){
			return this.fpControls;
		}else if(navigationMode === Potree.EarthControls){
			return this.earthControls;
		}else{
			return null;
		}
	}
	
	//loadPointCloud(path, name, callback){
    //
	//	// load pointcloud
	//	if(!path){
    //
	//	}else if(path.indexOf("greyhound://") === 0){
	//		// We check if the path string starts with 'greyhound:', if so we assume it's a greyhound server URL.
	//		Potree.GreyhoundLoader.load(path, function(geometry) {
	//			if(!geometry){
	//				callback({type: "loading_failed"});
	//			}else{
	//				pointcloud = new Potree.PointCloudOctree(geometry);
	//				initPointcloud(pointcloud);
	//			}
	//		});
	//	}else if(path.indexOf("cloud.js") > 0){
	//		Potree.POCLoader.load(path, function(geometry){
	//			if(!geometry){
	//				callback({type: "loading_failed"});
	//			}else{
	//				let pointcloud = new Potree.PointCloudOctree(geometry);
    //                pointcloud.name = name;
	//				initPointcloud(pointcloud);				
	//			}
	//		}.bind(this));
	//	}else if(path.indexOf(".vpc") > 0){
	//		Potree.PointCloudArena4DGeometry.load(path, function(geometry){
	//			if(!geometry){
	//				callback({type: "loading_failed"});
	//			}else{
	//				let pointcloud = new Potree.PointCloudArena4D(geometry);
    //                pointcloud.name = name;
	//				initPointcloud(pointcloud);
	//			}
	//		});
	//	}else{
	//		callback({"type": "loading_failed"});
	//	}
	//}
	
	getMinNodeSize(){
		return this.minNodeSize;
	};
	
	setMinNodeSize(value){
		if(this.minNodeSize !== value){
			this.minNodeSize = value;
			this.dispatchEvent({"type": "minnodesize_changed", "viewer": this});
		}
	};
	
	getBackground(){
		return this.background;
	};
	
	setBackground(bg){
		if(this.background === bg){
			return;
		}
		
		this.background = bg;
		this.dispatchEvent({"type": "background_changed", "viewer": this});
	}
	
	setDescription(value){
		$('#potree_description')[0].innerHTML = value;
	};
	
	setNavigationMode(value){
		this.scene.view.navigationMode = value;
	};
	
	setShowBoundingBox(value){
		if(this.showBoundingBox !== value){
			this.showBoundingBox = value;
			this.dispatchEvent({"type": "show_boundingbox_changed", "viewer": this});
		}
	};
	
	getShowBoundingBox(){
		return showBoundingBox;
	};
	
	setMoveSpeed(value){
		if(this.moveSpeed !== value){
			this.moveSpeed = value;
			//this.fpControls.setSpeed(value);
			//this.geoControls.setSpeed(value);
			//this.earthControls.setSpeed(value);
			this.dispatchEvent({"type": "move_speed_changed", "viewer": this, "speed": value});
		}
	};
	
	getMoveSpeed(){
		return this.moveSpeed;
	};
	
	//setShowSkybox(value){
	//	if(this.showSkybox !== value){
	//		this.showSkybox = value;
	//		this.dispatchEvent({"type": "show_skybox_changed", "viewer": this});
	//	}
	//};
	//
	//getShowSkybox(){
	//	return this.showSkybox;
	//};
	
	setHeightRange(min, max){
		if(this.heightMin !== min || this.heightMax !== max){
			this.heightMin = min || this.heightMin;
			this.heightMax = max || this.heightMax;
			this.dispatchEvent({"type": "height_range_changed", "viewer": this});
		}
	};
	
	getHeightRange(){
		return {min: this.heightMin, max: this.heightMax};
	};
	
	getElevationRange(){
		return this.getHeightRange();
	};
	
	setElevationRange(min, max){
		this.setHeightRange(min, max);
	}
	
	setIntensityRange(min, max){
		if(this.intensityRange[0] !== min || this.intensityRange[1] !== max){
			this.intensityRange[0] = min || this.intensityRange[0];
			this.intensityRange[1] = max || this.intensityRange[1];
			this.dispatchEvent({"type": "intensity_range_changed", "viewer": this});
		}
	};
	
	getIntensityRange(){
		return this.intensityRange;
	};
	
	setIntensityGamma(value){
		if(this.intensityGamma !== value){
			this.intensityGamma = value;
			this.dispatchEvent({"type": "intensity_gamma_changed", "viewer": this});
		}
	};
	
	getIntensityGamma(){
		return this.intensityGamma;
	};
	
	setIntensityContrast(value){
		if(this.intensityContrast !== value){
			this.intensityContrast = value;
			this.dispatchEvent({"type": "intensity_contrast_changed", "viewer": this});
		}
	};
	
	getIntensityContrast(){
		return this.intensityContrast;
	};
	
	setIntensityBrightness(value){
		if(this.intensityBrightness !== value){
			this.intensityBrightness = value;
			this.dispatchEvent({"type": "intensity_brightness_changed", "viewer": this});
		}
	};
	
	getIntensityBrightness(){
		return this.intensityBrightness;
	};
	
	setRGBGamma(value){
		if(this.rgbGamma !== value){
			this.rgbGamma = value;
			this.dispatchEvent({"type": "rgb_gamma_changed", "viewer": this});
		}
	};
	
	getRGBGamma(){
		return this.rgbGamma;
	};
	
	setRGBContrast(value){
		if(this.rgbContrast !== value){
			this.rgbContrast = value;
			this.dispatchEvent({"type": "rgb_contrast_changed", "viewer": this});
		}
	};
	
	getRGBContrast(){
		return this.rgbContrast;
	};
	
	setRGBBrightness(value){
		if(this.rgbBrightness !== value){
			this.rgbBrightness = value;
			this.dispatchEvent({"type": "rgb_brightness_changed", "viewer": this});
		}
	};
	
	getRGBBrightness(){
		return this.rgbBrightness;
	};
	
	setMaterialTransition(t){
		if(this.materialTransition !== t){
			this.materialTransition = t;
			this.dispatchEvent({"type": "material_transition_changed", "viewer": this});
		}
	};
	
	getMaterialTransition(){
		return this.materialTransition;
	};
	
	setWeightRGB(w){
		if(this.weightRGB !== w){
			this.weightRGB = w;
			this.dispatchEvent({"type": "attribute_weights_changed", "viewer": this});
		}
	};
	
	getWeightRGB(){
		return this.weightRGB;
	};
	
	setWeightIntensity(w){
		if(this.weightIntensity !== w){
			this.weightIntensity = w;
			this.dispatchEvent({"type": "attribute_weights_changed", "viewer": this});
		}
	};
	
	getWeightIntensity(){
		return this.weightIntensity;
	};
	
	setWeightElevation(w){
		if(this.weightElevation !== w){
			this.weightElevation = w;
			this.dispatchEvent({"type": "attribute_weights_changed", "viewer": this});
		}
	};
	
	getWeightElevation(){
		return this.weightElevation;
	};
	
	setWeightClassification(w){
		if(this.weightClassification !== w){
			this.weightClassification = w;
			this.dispatchEvent({"type": "attribute_weights_changed", "viewer": this});
		}
	};
	
	getWeightClassification(){
		return this.weightClassification;
	};
	
	setWeightReturnNumber(w){
		if(this.weightReturnNumber !== w){
			this.weightReturnNumber = w;
			this.dispatchEvent({"type": "attribute_weights_changed", "viewer": this});
		}
	};
	
	getWeightReturnNumber(){
		return this.weightReturnNumber;
	};
	
	setWeightSourceID(w){
		if(this.weightSourceID !== w){
			this.weightSourceID = w;
			this.dispatchEvent({"type": "attribute_weights_changed", "viewer": this});
		}
	};
	
	getWeightSourceID(){
		return this.weightSourceID;
	};
	
	setIntensityMax(max){
		if(this.intensityMax !== max){
			this.intensityMax = max;
			this.dispatchEvent({"type": "intensity_max_changed", "viewer": this});
		}
	};
	
	getIntensityMax(){
		return this.intensityMax;
	};
	
	setFreeze(value){
		if(this.freeze != value){
			this.freeze = value;
			this.dispatchEvent({"type": "freeze_changed", "viewer": this});
		}
	};
	
	getFreeze(){
		return this.freeze;
	};
	
	setPointBudget(value){

		if(Potree.pointBudget != value){
			Potree.pointBudget = parseInt(value);
			this.dispatchEvent({"type": "point_budget_changed", "viewer": this});
		}
	};
	
	getPointBudget(){
		return Potree.pointBudget;
	};
	
	setClipMode(clipMode){
		if(this.clipMode != clipMode){
			this.clipMode = clipMode;
			this.dispatchEvent({"type": "clip_mode_changed", "viewer": this});
		}
	};
	
	getClipMode(){
		return this.clipMode;
	};
	
	setDEMCollisionsEnabled(value){
		if(this.useDEMCollisions !== value){
			this.useDEMCollisions = value;
			this.dispatchEvent({"type": "use_demcollisions_changed", "viewer": this});
		};
	};
	
	getDEMCollisionsEnabled(){
		return this.useDEMCollisions;
	};
	
	setEDLEnabled(value){
		if(this.useEDL != value){
			this.useEDL = value;
			this.dispatchEvent({"type": "use_edl_changed", "viewer": this});
		}
	};
	
	getEDLEnabled(){
		return this.useEDL;
	};
	
	setEDLRadius(value){
		if(this.edlRadius !== value){
			this.edlRadius = value;
			this.dispatchEvent({"type": "edl_radius_changed", "viewer": this});
		}
	};
	
	getEDLRadius(){
		return this.edlRadius;
	};
	
	setEDLStrength(value){
		if(this.edlStrength !== value){
			this.edlStrength = value;
			this.dispatchEvent({"type": "edl_strength_changed", "viewer": this});
		}
	};
	
	getEDLStrength(){
		return this.edlStrength;
	};
	
	setPointSize(value){
		if(this.pointSize !== value){
			this.pointSize = value;
			this.dispatchEvent({"type": "point_size_changed", "viewer": this});
		}
	};
	
	getPointSize(){
		return this.pointSize;
	};
	
	setMinPointSize(value){
		if(this.minPointSize !== value){
			this.minPointSize = value;
			this.dispatchEvent({"type": "min_point_size_changed", "viewer": this});
		}
	}
	
	getMinPointSize(){
		return this.minPointSize;
	}
	
	setMaxPointSize(value){
		if(this.maxPointSize !== value){
			this.maxPointSize = value;
			this.dispatchEvent({"type": "max_point_size_changed", "viewer": this});
		}
	}
	
	getMaxPointSize(){
		return this.maxPointSize;
	}
	
	setFOV(value){
		if(this.fov !== value){
			this.fov = value;
			this.dispatchEvent({"type": "fov_changed", "viewer": this});
		}
	};
	
	getFOV(){
		return this.fov;
	};
	
	setOpacity(value){
		if(this.opacity !== value){
			this.opacity = value;
			this.dispatchEvent({"type": "opacity_changed", "viewer": this});
		}
	};
	
	getOpacity(){
		return this.opacity;
	};

	setPointSizing(value){
		if(this.sizeType !== value){
			this.sizeType = value;
			if(value === "Fixed"){
				this.pointSizeType = Potree.PointSizeType.FIXED;
			}else if(value === "Attenuated"){
				this.pointSizeType = Potree.PointSizeType.ATTENUATED;
			}else if(value === "Adaptive"){
				this.pointSizeType = Potree.PointSizeType.ADAPTIVE;
			}
			
			this.dispatchEvent({"type": "point_sizing_changed", "viewer": this});
		}
	};
	
	getPointSizing(){
		return this.sizeType;
	};

	setQuality(value){
		var oldQuality = this.quality;
		if(value == "Interpolation" && !Potree.Features.SHADER_INTERPOLATION.isSupported()){
			this.quality = "Squares";
		}else if(value == "Splats" && !Potree.Features.SHADER_SPLATS.isSupported()){
			this.quality = "Squares";
		}else{
			this.quality = value;
		}
		
		if(oldQuality !== this.quality){
			this.dispatchEvent({"type": "quality_changed", "viewer": this});
		}
	};
	
	getQuality(){
		return this.quality;
	};
	
	disableAnnotations(){
		for(var i = 0; i < this.scene.annotations.length; i++){
			var annotation = this.scene.annotations[i];
			annotation.domElement.style.pointerEvents = "none";
		};
	};
	
	enableAnnotations(){
		for(var i = 0; i < this.scene.annotations.length; i++){
			var annotation = this.scene.annotations[i];
			annotation.domElement.style.pointerEvents = "auto";
		};
	};
	
	setClassificationVisibility(key, value){

		var changed = false;
		for(var i = 0; i < this.scene.pointclouds.length; i++){
			var pointcloud = this.scene.pointclouds[i];
			var newClass = pointcloud.material.classification;
			var oldValue = newClass[key].w;
			newClass[key].w = value ? 1 : 0;

			if(oldValue !== newClass[key].w){
				changed = true;
			}

			pointcloud.material.classification = newClass;
		}

		if(changed){
			this.dispatchEvent({"type": "classification_visibility_changed", "viewer": this});
		}
	};

	setMaterial(value){
		if(this.pointColorType !== this.toMaterialID(value)){
			this.pointColorType = this.toMaterialID(value);
			
			this.dispatchEvent({"type": "material_changed", "viewer": this});
		}
	};
	
	setMaterialID(value){
		if(this.pointColorType !== value){
			this.pointColorType = value;
			
			this.dispatchEvent({"type": "material_changed", "viewer": this});
		}
	}
	
	getMaterial(){
		return this.pointColorType;
	};
	
	getMaterialName(){
		return this.toMaterialName(this.pointColorType);
	};
	
	toMaterialID(materialName){

		if(materialName === "RGB"){
			return Potree.PointColorType.RGB;
		}else if(materialName === "Color"){
			return Potree.PointColorType.COLOR;
		}else if(materialName === "Elevation"){
			return Potree.PointColorType.HEIGHT;
		}else if(materialName === "Intensity"){
			return Potree.PointColorType.INTENSITY;
		}else if(materialName === "Intensity Gradient"){
			return Potree.PointColorType.INTENSITY_GRADIENT;
		}else if(materialName === "Classification"){
			return Potree.PointColorType.CLASSIFICATION;
		}else if(materialName === "Return Number"){
			return Potree.PointColorType.RETURN_NUMBER;
		}else if(materialName === "Source"){
			return Potree.PointColorType.SOURCE;
		}else if(materialName === "Level of Detail"){
			return Potree.PointColorType.LOD;
		}else if(materialName === "Point Index"){
			return Potree.PointColorType.POINT_INDEX;
		}else if(materialName === "Normal"){
			return Potree.PointColorType.NORMAL;
		}else if(materialName === "Phong"){
			return Potree.PointColorType.PHONG;
		}else if(materialName === "RGB and Elevation"){
			return Potree.PointColorType.RGB_HEIGHT;
		}else if(materialName === "Composite"){
			return Potree.PointColorType.COMPOSITE;
		}
	};
	
	toMaterialName(materialID){

		if(materialID === Potree.PointColorType.RGB){
			return "RGB";
		}else if(materialID === Potree.PointColorType.COLOR){
			return "Color";
		}else if(materialID === Potree.PointColorType.HEIGHT){
			return "Elevation";
		}else if(materialID === Potree.PointColorType.INTENSITY){
			return "Intensity";
		}else if(materialID === Potree.PointColorType.INTENSITY_GRADIENT){
			return "Intensity Gradient";
		}else if(materialID === Potree.PointColorType.CLASSIFICATION){
			return "Classification";
		}else if(materialID === Potree.PointColorType.RETURN_NUMBER){
			return "Return Number";
		}else if(materialID === Potree.PointColorType.SOURCE){
			return "Source";
		}else if(materialID === Potree.PointColorType.LOD){
			return "Level of Detail";
		}else if(materialID === Potree.PointColorType.POINT_INDEX){
			return "Point Index";
		}else if(materialID === Potree.PointColorType.NORMAL){
			return "Normal";
		}else if(materialID === Potree.PointColorType.PHONG){
			return "Phong";
		}else if(materialID === Potree.PointColorType.RGB_HEIGHT){
			return "RGB and Elevation";
		}else if(materialID === Potree.PointColorType.COMPOSITE){
			return "Composite";
		}
	};
	
	showAbout(){
		$(function() {
			$( "#about-panel" ).dialog();
		});
	};
	
	getBoundingBox(pointclouds){
		pointclouds = pointclouds || this.scene.pointclouds;
		
		var box = new THREE.Box3();
		
		this.scene.scenePointCloud.updateMatrixWorld(true);
		this.scene.referenceFrame.updateMatrixWorld(true);
		
		for(var i = 0; i < this.scene.pointclouds.length; i++){
			var pointcloud = this.scene.pointclouds[i];
			
			pointcloud.updateMatrixWorld(true);
			
			let pointcloudBox = pointcloud.pcoGeometry.tightBoundingBox ?  pointcloud.pcoGeometry.tightBoundingBox : pointcloud.boundingBox;
			var boxWorld = Potree.utils.computeTransformedBoundingBox(pointcloudBox, pointcloud.matrixWorld)
			box.union(boxWorld);
		}

		return box;
	};
	
	setTopView(){
		this.scene.view.yaw = 0;
		this.scene.view.pitch = -Math.PI / 2;
		
		this.fitToScreen();
	};
	
	setFrontView(){
		this.scene.view.yaw = 0;
		this.scene.view.pitch = 0;
		
		this.fitToScreen();
	};
	
	setLeftView(){
		this.scene.view.yaw = -Math.PI / 2;
		this.scene.view.pitch = 0;
		
		this.fitToScreen();
	};
	
	setRightView(){
		this.scene.view.yaw = Math.PI / 2;
		this.scene.view.pitch = 0;
		
		this.fitToScreen();
	};
	
	flipYZ(){
		this.isFlipYZ = !this.isFlipYZ
		
		// TODO flipyz 
		console.log("TODO");
	}
	
	updateHeightRange(){
		var bbWorld = this.getBoundingBox();
		this.setHeightRange(bbWorld.min.z, bbWorld.max.z);
	};
	
	loadSettingsFromURL(){
		if(Potree.utils.getParameterByName("pointSize")){
			this.setPointSize(parseFloat(Potree.utils.getParameterByName("pointSize")));
		}
		
		if(Potree.utils.getParameterByName("FOV")){
			this.setFOV(parseFloat(Potree.utils.getParameterByName("FOV")));
		}
		
		if(Potree.utils.getParameterByName("opacity")){
			this.setOpacity(parseFloat(Potree.utils.getParameterByName("opacity")));
		}
		
		if(Potree.utils.getParameterByName("edlEnabled")){
			var enabled = Potree.utils.getParameterByName("edlEnabled") === "true";
			this.setEDLEnabled(enabled);
		}
		
		if(Potree.utils.getParameterByName("edlRadius")){
			this.setEDLRadius(parseFloat(Potree.utils.getParameterByName("edlRadius")));
		}
		
		if(Potree.utils.getParameterByName("edlStrength")){
			this.setEDLStrength(parseFloat(Potree.utils.getParameterByName("edlStrength")));
		}
		
		if(Potree.utils.getParameterByName("clipMode")){
			var clipMode = Potree.utils.getParameterByName("clipMode");
			if(clipMode === "HIGHLIGHT_INSIDE"){
				this.setClipMode(Potree.ClipMode.HIGHLIGHT_INSIDE);
			}else if(clipMode === "CLIP_OUTSIDE"){
				this.setClipMode(Potree.ClipMode.CLIP_OUTSIDE);
			}else if(clipMode === "DISABLED"){
				this.setClipMode(Potree.ClipMode.DISABLED);
			}
		}

		if(Potree.utils.getParameterByName("pointBudget")){
			this.setPointBudget(parseFloat(Potree.utils.getParameterByName("pointBudget")));
		}

		if(Potree.utils.getParameterByName("showBoundingBox")){
			var enabled = Potree.utils.getParameterByName("showBoundingBox") === "true";
			if(enabled){
				this.setShowBoundingBox(true);
			}else{
				this.setShowBoundingBox(false);
			}
		}

		if(Potree.utils.getParameterByName("material")){
			var material = Potree.utils.getParameterByName("material");
			this.setMaterial(material);
		}

		if(Potree.utils.getParameterByName("pointSizing")){
			var sizing = Potree.utils.getParameterByName("pointSizing");
			this.setPointSizing(sizing);
		}

		if(Potree.utils.getParameterByName("quality")){
			var quality = Potree.utils.getParameterByName("quality");
			this.setQuality(quality);
		}
		
		if(Potree.utils.getParameterByName("position")){
			let value = Potree.utils.getParameterByName("position");
			value = value.replace("[", "").replace("]", "");
			let tokens = value.split(";");
			let x = parseFloat(tokens[0]);
			let y = parseFloat(tokens[1]);
			let z = parseFloat(tokens[2]);
			
			this.scene.view.position.set(x, y, z);
		}
		
		if(Potree.utils.getParameterByName("target")){
			let value = Potree.utils.getParameterByName("target");
			value = value.replace("[", "").replace("]", "");
			let tokens = value.split(";");
			let x = parseFloat(tokens[0]);
			let y = parseFloat(tokens[1]);
			let z = parseFloat(tokens[2]);
			
			this.scene.view.lookAt(new THREE.Vector3(x, y, z));
		}
		
		if(Potree.utils.getParameterByName("background")){
			let value = Potree.utils.getParameterByName("background");
			this.setBackground(value);
		}
		
		//if(Potree.utils.getParameterByName("elevationRange")){
		//	let value = Potree.utils.getParameterByName("elevationRange");
		//	value = value.replace("[", "").replace("]", "");
		//	let tokens = value.split(";");
		//	let x = parseFloat(tokens[0]);
		//	let y = parseFloat(tokens[1]);
		//	
		//	this.setElevationRange(x, y);
		//	//this.scene.view.target.set(x, y, z);
		//}
		
	};
	
	
	
	

	
	
	
//------------------------------------------------------------------------------------
// Viewer Internals
//------------------------------------------------------------------------------------

	createControls(){
		{ // create FIRST PERSON CONTROLS
			this.fpControls = new Potree.FirstPersonControls(this);
			this.fpControls.enabled = false;
			this.fpControls.addEventListener("start", this.disableAnnotations.bind(this));
			this.fpControls.addEventListener("end", this.enableAnnotations.bind(this));
			//this.fpControls.addEventListener("double_click_move", (event) => {
			//	let distance = event.targetLocation.distanceTo(event.position);
			//	this.setMoveSpeed(Math.pow(distance, 0.4));
			//});
			//this.fpControls.addEventListener("move_speed_changed", (event) => {
			//	this.setMoveSpeed(this.fpControls.moveSpeed);
			//});
		}
		
		//{ // create GEO CONTROLS
		//	this.geoControls = new Potree.GeoControls(this.scene.camera, this.renderer.domElement);
		//	this.geoControls.enabled = false;
		//	this.geoControls.addEventListener("start", this.disableAnnotations.bind(this));
		//	this.geoControls.addEventListener("end", this.enableAnnotations.bind(this));
		//	this.geoControls.addEventListener("move_speed_changed", (event) => {
		//		this.setMoveSpeed(this.geoControls.moveSpeed);
		//	});
		//}
	
		{ // create ORBIT CONTROLS
			this.orbitControls = new Potree.OrbitControls(this);
			this.orbitControls.enabled = false;
			this.orbitControls.addEventListener("start", this.disableAnnotations.bind(this));
			this.orbitControls.addEventListener("end", this.enableAnnotations.bind(this));
		}
		
		{ // create EARTH CONTROLS
			this.earthControls = new Potree.EarthControls(this);
			this.earthControls.enabled = false;
			this.earthControls.addEventListener("start", this.disableAnnotations.bind(this));
			this.earthControls.addEventListener("end", this.enableAnnotations.bind(this));
		}
	};

	toggleSidebar(){
		
		var renderArea = $('#potree_render_area');
		var sidebar = $('#potree_sidebar_container');
		var isVisible = renderArea.css("left") !== "0px";

		if(isVisible){
			renderArea.css("left", "0px");
		}else{
			renderArea.css("left", "300px");
		}
	};
	
	toggleMap(){
		var map = $('#potree_map');
		map.toggle(100);

	};

	loadGUI(callback){
		var sidebarContainer = $('#potree_sidebar_container');
		sidebarContainer.load(new URL(Potree.scriptPath + "/sidebar.html").href, () => {
			
			sidebarContainer.css("width", "300px");
			sidebarContainer.css("height", "100%");

			var imgMenuToggle = document.createElement("img");
			imgMenuToggle.src = new URL(Potree.resourcePath + "/icons/menu_button.svg").href;
			imgMenuToggle.onclick = this.toggleSidebar;
			imgMenuToggle.classList.add("potree_menu_toggle");

			var imgMapToggle = document.createElement("img");
			imgMapToggle.src = new URL(Potree.resourcePath + "/icons/map_icon.png").href;
			imgMapToggle.style.display = "none";
			imgMapToggle.onclick = this.toggleMap;
			imgMapToggle.id = "potree_map_toggle";
			
			viewer.renderArea.insertBefore(imgMapToggle, viewer.renderArea.children[0]);
			viewer.renderArea.insertBefore(imgMenuToggle, viewer.renderArea.children[0]);
			
			this.mapView = new Potree.MapView(this);
			this.mapView.init();
			
			i18n.init({ 
				lng: 'en',
				resGetPath: Potree.resourcePath + '/lang/__lng__/__ns__.json',
				preload: ['en', 'fr', 'de'],
				getAsync: true,
				debug: false
				}, function(t) { 
				// Start translation once everything is loaded
				$("body").i18n();
			});
			
			$(function() {
				initSidebar();
			});
			
			let elProfile = $('<div>').load(new URL(Potree.scriptPath + "/profile.html").href, () => {
				$('#potree_render_area').append(elProfile.children());
				this._2dprofile = new Potree.Viewer.Profile(this, document.getElementById("profile_draw_container"));
				
				if(callback){
					$(callback);
				}
			});
			
		});
		
		
		
	}
    
    setLanguage(lang){
        i18n.setLng(lang);
        $("body").i18n();
    }	
	
	initThree(){

		if(!this.renderer) {
			let width = this.renderArea.clientWidth;
			let height = this.renderArea.clientHeight;

			this.renderer = new THREE.WebGLRenderer({premultipliedAlpha: false});
			this.renderer.setSize(width, height);
			this.renderer.autoClear = false;
			this.renderArea.appendChild(this.renderer.domElement);
			this.renderer.domElement.tabIndex = "2222";
			this.renderer.domElement.addEventListener("mousedown", function(){
				this.renderer.domElement.focus();
			}.bind(this));
		}

		// enable frag_depth extension for the interpolation shader, if available
		this.renderer.context.getExtension("EXT_frag_depth");
	}

	update(delta, timestamp){
		
		//if(window.urlToggle === undefined){
		//	window.urlToggle = 0;
		//}else{
		//	
		//	if(window.urlToggle > 1){
		//		{
		//			
		//			let currentValue = Potree.utils.getParameterByName("position");
		//			let strPosition = "["  
		//				+ this.scene.view.position.x.toFixed(3) + ";"
		//				+ this.scene.view.position.y.toFixed(3) + ";"
		//				+ this.scene.view.position.z.toFixed(3) + "]";
		//			if(currentValue !== strPosition){
		//				Potree.utils.setParameter("position", strPosition);
		//			}
		//			
		//		}
		//		
		//		{
		//			let currentValue = Potree.utils.getParameterByName("target");
		//			let pivot = this.scene.view.getPivot();
		//			let strTarget = "["  
		//				+ pivot.x.toFixed(3) + ";"
		//				+ pivot.y.toFixed(3) + ";"
		//				+ pivot.z.toFixed(3) + "]";
		//			if(currentValue !== strTarget){
		//				Potree.utils.setParameter("target", strTarget);
		//			}
		//		}
		//		
		//		window.urlToggle = 0;
		//	}
		//	
		//	window.urlToggle += delta;
		//}
		
		
		
		
		let scene = this.scene;
		let camera = this.scene.camera;
		
		Potree.pointLoadLimit = Potree.pointBudget * 2;
		
		this.scene.directionalLight.position.copy(camera.position);
		this.scene.directionalLight.lookAt(new THREE.Vector3().addVectors(camera.position, camera.getWorldDirection()));
		
		var visibleNodes = 0;
		var visiblePoints = 0;
		var progress = 0;
		
		for(var i = 0; i < this.scene.pointclouds.length; i++){
			var pointcloud = this.scene.pointclouds[i];
			var bbWorld = Potree.utils.computeTransformedBoundingBox(pointcloud.boundingBox, pointcloud.matrixWorld);
				
			if(!this.intensityMax){
				var root = pointcloud.pcoGeometry.root;
				if(root != null && root.loaded){
					var attributes = pointcloud.pcoGeometry.root.geometry.attributes;
					if(attributes.intensity){
						var array = attributes.intensity.array;

						// chose max value from the 0.75 percentile
						var ordered = [];
						for(var j = 0; j < array.length; j++){
							ordered.push(array[j]);
						}
						ordered.sort();
						var capIndex = parseInt((ordered.length - 1) * 0.75);
						var cap = ordered[capIndex];

						if(cap <= 1){
							this.intensityMax = 1;
						}else if(cap <= 256){
							this.intensityMax = 255;
						}else{
							this.intensityMax = cap;
						}
					}
				}
			}
			
			//if(this.heightMin === null){
			//	this.setHeightRange(bbWorld.min.y, bbWorld.max.y);
			//}
				
			pointcloud.material.clipMode = this.clipMode;
			pointcloud.material.heightMin = this.heightMin;
			pointcloud.material.heightMax = this.heightMax;
			//pointcloud.material.intensityMin = 0;
			//pointcloud.material.intensityMax = this.intensityMax;
			pointcloud.material.uniforms.intensityRange.value = this.getIntensityRange();
			pointcloud.material.uniforms.intensityGamma.value = this.getIntensityGamma();
			pointcloud.material.uniforms.intensityContrast.value = this.getIntensityContrast();
			pointcloud.material.uniforms.intensityBrightness.value = this.getIntensityBrightness();
			pointcloud.material.uniforms.rgbGamma.value = this.getRGBGamma();
			pointcloud.material.uniforms.rgbContrast.value = this.getRGBContrast();
			pointcloud.material.uniforms.rgbBrightness.value = this.getRGBBrightness();
			pointcloud.showBoundingBox = this.showBoundingBox;
			pointcloud.generateDEM = this.useDEMCollisions;
			pointcloud.minimumNodePixelSize = this.minNodeSize;
			pointcloud.material.uniforms.transition.value = this.materialTransition;
			
			pointcloud.material.uniforms.wRGB.value = this.getWeightRGB();
			pointcloud.material.uniforms.wIntensity.value = this.getWeightIntensity();
			pointcloud.material.uniforms.wElevation.value = this.getWeightElevation();
			pointcloud.material.uniforms.wClassification.value = this.getWeightClassification();
			pointcloud.material.uniforms.wReturnNumber.value = this.getWeightReturnNumber();
			pointcloud.material.uniforms.wSourceID.value = this.getWeightSourceID();
			
			//if(!this.freeze){
			//	pointcloud.update(this.scene.camera, this.renderer);
			//}

			visibleNodes += pointcloud.numVisibleNodes;
			visiblePoints += pointcloud.numVisiblePoints;

			progress += pointcloud.progress;
		}
		
		if(!this.freeze){
			var result = Potree.updatePointClouds(scene.pointclouds, camera, this.renderer);
			visibleNodes = result.visibleNodes.length;
			visiblePoints = result.numVisiblePoints;
			/*camera.near = result.lowestSpacing * 10.0;
			camera.far = -this.getBoundingBox().applyMatrix4(camera.matrixWorldInverse).min.z;
			camera.far = Math.max(camera.far * 1.5, 1000);*/
		}
		
		//camera.fov = this.fov;

		{ // update clip boxes
			//let boxes = this.scene.profiles.reduce( (a, b) => {return a.boxes.concat(b.boxes)}, []);
			//boxes = boxes.concat(this.scene.volumes.filter(v => v.clip));
			
			let boxes = this.scene.volumes.filter(v => v.clip);
			for(let profile of this.scene.profiles){
				boxes = boxes.concat(profile.boxes);
			}
			
			
			let clipBoxes = boxes.map( box => {
				box.updateMatrixWorld();
				let boxInverse = new THREE.Matrix4().getInverse(box.matrixWorld);
				let boxPosition = box.getWorldPosition();
				return {inverse: boxInverse, position: boxPosition};
			});
			
			for(let pointcloud of this.scene.pointclouds){
				pointcloud.material.setClipBoxes(clipBoxes);
			}
		}
		
		if(this.showDebugInfos){
			this.infos.set("camera.position", "camera.position: " + 
				this.scene.camera.position.x.toFixed(2) 
				+ ", " + this.scene.camera.position.y.toFixed(2) 
				+ ", " + this.scene.camera.position.z.toFixed(2)
			);
		}
		
		if(this.mapView){
			this.mapView.update(delta, this.scene.camera);
			if(this.mapView.sceneProjection){
				$( "#potree_map_toggle" ).css("display", "block");
			}
		}

		TWEEN.update(timestamp);
		
		this.dispatchEvent({
			"type": "update", 
			"delta": delta, 
			"timestamp": timestamp});
	}


	loop(timestamp) {
		
		//requestAnimationFrame(this.loop.bind(this));
		
		this.stats.begin();
		
		//var start = new Date().getTime();
		this.update(this.clock.getDelta(), timestamp);
		//var end = new Date().getTime();
		//var duration = end - start;
		//toggleMessage++;
		//if(toggleMessage > 30){
		//	document.getElementById("lblMessage").innerHTML = "update: " + duration + "ms";
		//	toggleMessage = 0;
		//}
		
		let queryAll = Potree.startQuery("All", this.renderer.getContext());
		
		if(this.useEDL && Potree.Features.SHADER_EDL.isSupported()){
			if(!this.edlRenderer){
				this.edlRenderer = new EDLRenderer(this);
			}
			this.edlRenderer.render(this.renderer);
		}else if(this.quality === "Splats"){
			if(!this.highQualityRenderer){
				this.highQualityRenderer = new HighQualityRenderer(this);
			}
			this.highQualityRenderer.render(this.renderer);
		}else{
			if(!this.potreeRenderer){
				this.potreeRenderer = new PotreeCustomRenderer(this);
			}
			
			this.potreeRenderer.render();
		}
		
		Potree.endQuery(queryAll, this.renderer.getContext());
		Potree.resolveQueries(this.renderer.getContext());
		
		//if(this.takeScreenshot == true){
		//	this.takeScreenshot = false;
		//	
		//	var screenshot = this.renderer.domElement.toDataURL();
		//	
		//	//document.body.appendChild(screenshot); 
		//	var w = this.open();
		//	w.document.write('<img src="'+screenshot+'"/>');
		//}	
		
		this.stats.end();

		
		Potree.framenumber++;
	};

	
};