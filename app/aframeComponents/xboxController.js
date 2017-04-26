// Registering component
AFRAME.registerComponent('xbox-controller', {
  schema: {
      acceleration: {default: 65},
      easing: {default: 20},
      fly: {default: false},
      enabled: {default: true},
      zMovEnabled: {default: true},
      horizontalMovEnabled: {default: true},
      verticalMovEnabled: {default: true},
      minAxisValue: {default: 0.5},
      hMovElem: {default: "x"},
      zMovElem: {default: "z"},
      vMovElem: {default: "y"},
      hMovAxis: {default: 0},
      zMovAxis: {default: 1},
      vMovButtonUp: {default: 3},
      vMovButtonDown: {default: 0},
  },
  customConst: {
    MAX_DELTA: 0.2,
    CLAMP_VELOCITY: 0.00001,
  },

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

  init: function () {
    this.currentGamepad = undefined;
    this.currentGamepad = this.findXboxController();

    this.velocity = new THREE.Vector3();

    //Let's listen to the gamepad connected event.
    //THIS CALLBACKS ARE NOT WORKING PROPERLY ON CHROME 57 (Windows 7).
    /*window.addEventListener("gamepadconnected", function(e) {
      if(e.gamepad.id.indexOf("Xbox") != -1) {
        that.xboxGamepadIndex = e.gamepad.index;
        that.gamepad = e.gamepad;
        console.log("Xbox controller connected.");
      }
      else {
        console.warn("xbox-controls: A non-recogniced controller has been connected: ", e.gamepad.id);
      }
    });

    window.addEventListener("gamepaddisconnected", function(e) {
      if(that.xboxGamepadIndex && that.xboxGamepadIndex === e.gamepad.index) {
        that.xboxGamepadIndex = null;
        console.log("Xbox controller disconnected.");
      }
    });*/
  },

  updateVelocity: function (delta) {
    var acceleration;
    var data = this.data;
    var velocity = this.velocity;
    var hMovElem;
    var zMovElem;
    var vMovElem;

    hMovElem = data.hMovElem;
    zMovElem = data.zMovElem;
    vMovElem = data.vMovElem;

    // If FPS too low, reset velocity.
    if (delta > this.customConst.MAX_DELTA) {
      velocity[hMovElem] = 0;
      velocity[zMovElem] = 0;
      velocity[vMovElem] = 0;
      return;
    }

    // Decay velocity.
    if (velocity[hMovElem] !== 0) {
      velocity[hMovElem] -= velocity[hMovElem] * data.easing * delta;
    }
    if (velocity[zMovElem] !== 0) {
      velocity[zMovElem] -= velocity[zMovElem] * data.easing * delta;
    }
    if (velocity[vMovElem] !== 0) {
      velocity[vMovElem] -= velocity[vMovElem] * data.easing * delta;
    }

    // Clamp velocity easing.
    if (Math.abs(velocity[hMovElem]) < this.customConst.CLAMP_VELOCITY) { velocity[hMovElem] = 0; }
    if (Math.abs(velocity[zMovElem]) < this.customConst.CLAMP_VELOCITY) { velocity[zMovElem] = 0; }
    if (Math.abs(velocity[vMovElem]) < this.customConst.CLAMP_VELOCITY) { velocity[vMovElem] = 0; }

    if (!data.enabled) { return; }

    // Update velocity using keys pressed.
    acceleration = data.acceleration;
    if (data.horizontalMovEnabled) {
      // 0: <- LeftAxis -> 
      if (Math.abs(this.currentGamepad.axes[data.hMovAxis]) > data.minAxisValue) { 
        velocity[hMovElem] += this.currentGamepad.axes[data.hMovAxis] * acceleration * delta; 
      }
    }
    if (data.zMovEnabled) {
      // 1: ^ LeftAxis |
      //    |          V
      if (Math.abs(this.currentGamepad.axes[data.zMovAxis]) > data.minAxisValue) { 
        velocity[zMovElem] += this.currentGamepad.axes[data.zMovAxis] * acceleration * delta; 
      }
    }
    if (data.verticalMovEnabled) {
      // 1: Y:   (Buttons)  Up
      //    A:              Down
      velocity[vMovElem] -= this.currentGamepad.buttons[data.vMovButtonDown].value * acceleration * delta;
      velocity[vMovElem] += this.currentGamepad.buttons[data.vMovButtonUp].value * acceleration * delta;
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
      rotationEuler.set(THREE.Math.degToRad(rotation.x), THREE.Math.degToRad(rotation.y), 0);
      directionVector.applyEuler(rotationEuler);
      return directionVector;
    };
  })(),

  update: function () {
  },

  tick: function (time, timeDelta) {
    var velocity = this.velocity;
    var el = this.el;
    
    if(this.currentGamepad && this.currentGamepad.connected) {

      // Use seconds.
      delta = timeDelta / 1000;

      this.updateVelocity(delta);
      console.log("Current velocity: ", this.velocity);
      /*// 0: <- LeftAxis -> 
      if(Math.abs(this.currentGamepad.axes[0]) > 0.5)
      // 1: ^ LeftAxis |
      //    |          V
      if(Math.abs(this.currentGamepad.axes[1]) > 0.5)
      // 2: <- RightAxis ->
      if(Math.abs(this.currentGamepad.axes[2]) > 0.5)
      // 3: ^ RightAxis |
      //    |           V
      if(Math.abs(this.currentGamepad.axes[3]) > 0.5) */

      if (!velocity[this.data.hMovElem] && !velocity[this.data.zMovElem] && !velocity[this.data.vMovElem]) { return; }

      // Get movement vector and translate position.
      var movementVector = this.getMovementVector(delta);
      var position = el.getAttribute('position');
      el.setAttribute('position', {
        x: position.x + movementVector.x,
        y: position.y + movementVector.y,
        z: position.z + movementVector.z
      });
    }
    else this.currentGamepad = this.findXboxController();
  },

  remove: function () {},
  pause: function () {},
  play: function () {},
});