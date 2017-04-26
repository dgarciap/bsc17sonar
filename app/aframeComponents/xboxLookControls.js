var radToDeg = THREE.Math.radToDeg;
var PI_2 = Math.PI / 2;

AFRAME.registerComponent('xbox-look-controls', {
  dependencies: ['position', 'rotation'],

  schema: {
    enabled: {default: true},
    hmdEnabled: {default: true},
    reverseAxisDrag: {default: false},
    standing: {default: true},

    acceleration: {default: 9000},
    easing: {default: 20},
    hLookAxis: {default: 2},
    vLookAxis: {default: 3},
    hLookElem: {default: "x"},
    vLookElem: {default: "y"},
    horizontalLookEnabled: {default: true},
    verticalLookEnabled: {default: true},
    minAxisValue: {default: 0.5},
    fly: {default: false},
  },
  customConst: {
    MAX_DELTA: 0.2,
    CLAMP_VELOCITY: 0.00001,
  },

  init: function () {
    var sceneEl = this.el.sceneEl;

    this.currentGamepad = undefined;
    this.currentGamepad = this.findXboxController();

    this.velocity = new THREE.Vector3();

    // Aux variables
    this.previousHMDPosition = new THREE.Vector3();
    this.hmdQuaternion = new THREE.Quaternion();
    this.hmdEuler = new THREE.Euler();

    this.setupLookControls();
    this.setupHMDControls();

    // Reset previous HMD position when we exit VR.
    sceneEl.addEventListener('exit-vr', this.onExitVR);
  },

  update: function (oldData) {
    var data = this.data;
    var hmdEnabled = data.hmdEnabled;
    if (!data.enabled) { return; }
    if (!hmdEnabled && oldData && hmdEnabled !== oldData.hmdEnabled) {
      this.pitchObject.rotation.set(0, 0, 0);
      this.yawObject.rotation.set(0, 0, 0);
    }
    this.controls.standing = data.standing;
    this.controls.update();
    this.updateOrientation();
    this.updatePosition();
    
  },

  play: function () {
  },

  pause: function () {
  },

  tick: function (t, timeDelta) {
    var sceneEl = this.el.sceneEl;
    /*if(!sceneEl.is('vr-mode')) {*/
    if(this.currentGamepad && this.currentGamepad.connected) {
        this.readXboxInput(timeDelta);
        this.update();
    }
    else this.currentGamepad = this.findXboxController();
    /*}*/
  },

  remove: function () {
  },

  setupLookControls: function () {
    this.pitchObject = new THREE.Object3D();
    this.yawObject = new THREE.Object3D();
    this.yawObject.position.y = 10;
    this.yawObject.add(this.pitchObject);
  },

  setupHMDControls: function () {
    this.dolly = new THREE.Object3D();
    this.euler = new THREE.Euler();
    this.controls = new THREE.VRControls(this.dolly);
    this.controls.userHeight = 0.0;
  },

  updateOrientation: function () {
    var currentRotation;
    var deltaRotation;
    var hmdEuler = this.hmdEuler;
    var pitchObject = this.pitchObject;
    var yawObject = this.yawObject;
    var hmdQuaternion = this.calculateHMDQuaternion();
    var sceneEl = this.el.sceneEl;
    var rotation;
    hmdEuler.setFromQuaternion(hmdQuaternion, 'YXZ');
    if (!sceneEl.is('vr-mode') || isNullVector(hmdEuler) || !this.data.hmdEnabled) {
      currentRotation = this.el.getAttribute('rotation');
      deltaRotation = this.calculateDeltaRotation();
      // Mouse look only if HMD disabled or no info coming from the sensors
      if (this.data.reverseAxisDrag) {
        rotation = {
          x: currentRotation.x - deltaRotation.x,
          y: currentRotation.y - deltaRotation.y,
          z: currentRotation.z
        };
      } else {
        rotation = {
          x: currentRotation.x + deltaRotation.x,
          y: currentRotation.y + deltaRotation.y,
          z: currentRotation.z
        };
      }
    } else {
      // Mouse rotation ignored with an active headset.
      // The user head rotation takes priority
      rotation = {
        x: radToDeg(hmdEuler.x),
        y: radToDeg(hmdEuler.y),
        z: radToDeg(hmdEuler.z)
      };
    }
    this.el.setAttribute('rotation', rotation);
  },

  calculateDeltaRotation: function () {
    var currentRotationX = radToDeg(this.pitchObject.rotation.x);
    var currentRotationY = radToDeg(this.yawObject.rotation.y);
    var deltaRotation;
    this.previousRotationX = this.previousRotationX || currentRotationX;
    this.previousRotationY = this.previousRotationY || currentRotationY;
    deltaRotation = {
      x: currentRotationX - this.previousRotationX,
      y: currentRotationY - this.previousRotationY
    };
    this.previousRotationX = currentRotationX;
    this.previousRotationY = currentRotationY;
    return deltaRotation;
  },

  calculateHMDQuaternion: function () {
    var hmdQuaternion = this.hmdQuaternion;
    hmdQuaternion.copy(this.dolly.quaternion);
    return hmdQuaternion;
  },

  updatePosition: (function () {
    var deltaHMDPosition = new THREE.Vector3();
    return function () {
      var el = this.el;
      var currentPosition = el.getAttribute('position');
      var currentHMDPosition;
      var previousHMDPosition = this.previousHMDPosition;
      var sceneEl = this.el.sceneEl;
      currentHMDPosition = this.calculateHMDPosition();
      deltaHMDPosition.copy(currentHMDPosition).sub(previousHMDPosition);
      if (!sceneEl.is('vr-mode') || isNullVector(deltaHMDPosition)) { return; }
      previousHMDPosition.copy(currentHMDPosition);
      // Do nothing if we have not moved.
      if (!sceneEl.is('vr-mode')) { return; }
      el.setAttribute('position', {
        x: currentPosition.x + deltaHMDPosition.x,
        y: currentPosition.y + deltaHMDPosition.y,
        z: currentPosition.z + deltaHMDPosition.z
      });
    };
  })(),

  calculateHMDPosition: function () {
    var dolly = this.dolly;
    var position = new THREE.Vector3();
    dolly.updateMatrix();
    position.setFromMatrixPosition(dolly.matrix);
    return position;
  },

  readXboxInput: function (timeDelta) {
    var velocity = this.velocity;
    var pitchObject = this.pitchObject;
    var yawObject = this.yawObject;

    if (!this.data.enabled) { return; }

    // Use seconds.
    var delta = timeDelta / 1000;

    this.updateVelocity(delta);

    if (!velocity[this.data.hLookElem] && !velocity[this.data.vLookElem]) { return; }

    // Get movement vector and translate position.
    var movementVector = this.getMovementVector(delta);

    var movementX = movementVector.x;
    var movementY = movementVector.y;

    yawObject.rotation.y -= movementX * 0.002;
    pitchObject.rotation.x -= movementY * 0.002;
    pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
  },

  updateVelocity: function (delta) {
    var acceleration;
    var data = this.data;
    var velocity = this.velocity;
    var hLookElem;
    var vLookElem;

    hLookElem = data.hLookElem;
    vLookElem = data.vLookElem;

    // If FPS too low, reset velocity.
    if (delta > this.customConst.MAX_DELTA) {
      velocity[hLookElem] = 0;
      velocity[vLookElem] = 0;
      return;
    }

    // Decay velocity.
    if (velocity[hLookElem] !== 0) {
      velocity[hLookElem] -= velocity[hLookElem] * data.easing * delta;
    }
    if (velocity[vLookElem] !== 0) {
      velocity[vLookElem] -= velocity[vLookElem] * data.easing * delta;
    }

    // Clamp velocity easing.
    if (Math.abs(velocity[hLookElem]) < this.customConst.CLAMP_VELOCITY) { velocity[hLookElem] = 0; }
    if (Math.abs(velocity[vLookElem]) < this.customConst.CLAMP_VELOCITY) { velocity[vLookElem] = 0; }

    if (!data.enabled) { return; }

    // Update velocity using keys pressed.
    acceleration = data.acceleration;
    if (data.horizontalLookEnabled) {
      // 0: <- LeftAxis -> 
      if (Math.abs(this.currentGamepad.axes[data.hLookAxis]) > data.minAxisValue) { 
        velocity[hLookElem] += this.currentGamepad.axes[data.hLookAxis] * acceleration * delta;
      }
    }
    if (data.verticalLookEnabled) {
      // 1: ^ LeftAxis |
      //    |          V
      if (Math.abs(this.currentGamepad.axes[data.vLookAxis]) > data.minAxisValue) { 
        velocity[vLookElem] += this.currentGamepad.axes[data.vLookAxis] * acceleration * delta; 
      }
    }

  },

  getMovementVector: (function () {
    var directionVector = new THREE.Vector3(0, 0, 0);
    var rotationEuler = new THREE.Euler(0, 0, 0, 'YXZ');

    return function (delta) {
      var rotation = this.el.getAttribute('rotation');
      var velocity = this.velocity;

      directionVector.copy(velocity);
      directionVector.multiplyScalar(delta);

      // Absolute.
      if (!rotation) { return directionVector; }

      if (!this.data.fly) { rotation.x = 0; }

      // Transform direction relative to heading.
      //rotationEuler.set(THREE.Math.degToRad(rotation.x), THREE.Math.degToRad(rotation.y), 0);
      //directionVector.applyEuler(rotationEuler);
      return directionVector;
    };
  })(),

  /**
   * finds and returns the first xbox controller currently connected to the system.
   * Returns null otherwise.
   */
  findXboxController: function() {
    var gpads = navigator.getGamepads();
    for(var i = 0; i < gpads.length; ++i) {
      if(gpads[i] && gpads[i].id.indexOf("Xbox") !== -1) return gpads[i];
    }
    return null;
  },

  onExitVR: function () {
    this.previousHMDPosition.set(0, 0, 0);
  }
});

function isNullVector (vector) {
  return vector.x === 0 && vector.y === 0 && vector.z === 0;
}
