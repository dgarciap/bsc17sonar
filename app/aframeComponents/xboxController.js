// Registering component
AFRAME.registerComponent('xbox-controller', {
  schema: {
      acceleration: {default: 65},
      easing: {default: 20},
      fly: {default: false},
      enabled: {default: true},
      verticalMovEnabled: {default: true},
      horizontalMovEnabled: {default: true},
      minAxisValue: {default: 0.5},
      hMovAxis: 0,
      vMovAxis: 1,
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
      if(gpads[i].id.indexOf("Xbox") !== -1) return gpads[i];
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
    var hMovAxis;
    var vMovAxis;

    hMovAxis = data.hMovAxis;
    vMovAxis = data.vMovAxis;

    // If FPS too low, reset velocity.
    if (delta > customConst.MAX_DELTA) {
      velocity[hMovAxis] = 0;
      velocity[vMovAxis] = 0;
      return;
    }

    // Decay velocity.
    if (velocity[hMovAxis] !== 0) {
      velocity[hMovAxis] -= velocity[hMovAxis] * data.easing * delta;
    }
    if (velocity[vMovAxis] !== 0) {
      velocity[vMovAxis] -= velocity[vMovAxis] * data.easing * delta;
    }

    // Clamp velocity easing.
    if (Math.abs(velocity[hMovAxis]) < customConst.CLAMP_VELOCITY) { velocity[hMovAxis] = 0; }
    if (Math.abs(velocity[vMovAxis]) < customConst.CLAMP_VELOCITY) { velocity[vMovAxis] = 0; }

    if (!data.enabled) { return; }

    // Update velocity using keys pressed.
    acceleration = data.acceleration;
    if (data.horizontalMovEnabled) {
      // 0: <- LeftAxis -> 
      if (Math.abs(this.currentGamepad.axes[0]) > data.minAxisValue) { 
        velocity[hMovAxis] += this.currentGamepad.axes[0] * acceleration * delta; 
      }
    }
    if (data.verticalMovEnabled) {
      // 1: ^ LeftAxis |
      //    |          V
      if (Math.abs(this.currentGamepad.axes[1]) > data.minAxisValue) { 
        velocity[vMovAxis] += this.currentGamepad.axes[1] * acceleration * delta; 
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

      if (!velocity[data.adAxis] && !velocity[data.wsAxis]) { return; }

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