updownConst = {};

updownConst.CLAMP_VELOCITY = 0.00001;
updownConst.MAX_DELTA = 0.2;

updownConst.KEYCODE_TO_CODE = {
    '81': 'KeyQ',
    '69': 'KeyE',
};

updownConst.shouldCaptureKeyEvent = function (event) {
  if (event.metaKey) { return false; }
  return document.activeElement === document.body;
};


// Registering component
AFRAME.registerComponent('updown-controls', {
  schema: {
    acceleration: {default: 65},
    qeAxis: {default: 'y', oneOf: ['x', 'y', 'z']},
    easing: {default: 20},
    enabled: {default: true},
    fly: {default: false},
    qeInverted: {default: false}
  },

  init: function () {
    // To keep track of the pressed keys.
    this.keys = {};

    this.velocity = new THREE.Vector3();

    // Bind methods and add event listeners.
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);
    this.attachVisibilityEventListeners();
  },

  tick: function (time, delta) {
    var data = this.data;
    var el = this.el;
    var movementVector;
    var position;
    var velocity = this.velocity;

    // Use seconds.
    delta = delta / 1000;

    // Get velocity.
    this.updateVelocity(delta);
    if (!velocity[data.qeAxis]) { return; }

    // Get movement vector and translate position.
    movementVector = this.getMovementVector(delta);
    position = el.getAttribute('position');
    el.setAttribute('position', {
      x: position.x + movementVector.x,
      y: position.y + movementVector.y,
      z: position.z + movementVector.z
    });
  },

  remove: function () {
    this.removeKeyEventListeners();
    this.removeVisibilityEventListeners();
  },

  play: function () {
    this.attachKeyEventListeners();
  },

  pause: function () {
    this.keys = {};
    this.removeKeyEventListeners();
  },

  updateVelocity: function (delta) {
    var acceleration;
    var qeSign;
    var data = this.data;
    var keys = this.keys;
    var velocity = this.velocity;
    var qeAxis;

    qeAxis = data.qeAxis;

    // If FPS too low, reset velocity.
    if (delta > updownConst.MAX_DELTA) {
      velocity[qeAxis] = 0;
      return;
    }

    // Decay velocity.
    if (velocity[qeAxis] !== 0) {
      velocity[qeAxis] -= velocity[qeAxis] * data.easing * delta;
    }

    // Clamp velocity easing.
    if (Math.abs(velocity[qeAxis]) < updownConst.CLAMP_VELOCITY) { velocity[qeAxis] = 0; }

    if (!data.enabled) { return; }

    // Update velocity using keys pressed.
    acceleration = data.acceleration;

    qeSign = data.wsInverted ? -1 : 1;
    if (keys.KeyQ) { velocity[qeAxis] -= qeSign * acceleration * delta; }
    if (keys.KeyE) { velocity[qeAxis] += qeSign * acceleration * delta; }
  },

  getMovementVector: (function () {
    var directionVector = new THREE.Vector3(0, 0, 0);
    var rotationEuler = new THREE.Euler(0, 0, 0, 'YXZ');

    return function (delta) {
      var rotation = this.el.getAttribute('rotation');
      var velocity = this.velocity;
      var xRotation;

      directionVector.copy(velocity);
      directionVector.multiplyScalar(delta);

      // Absolute.
      if (!rotation) { return directionVector; }

      xRotation = this.data.fly ? rotation.x : 0;

      // Transform direction relative to heading.
      rotationEuler.set(THREE.Math.degToRad(xRotation), THREE.Math.degToRad(rotation.y), 0);
      directionVector.applyEuler(rotationEuler);
      return directionVector;
    };
  })(),

  attachVisibilityEventListeners: function () {
    window.addEventListener('blur', this.onBlur);
    window.addEventListener('focus', this.onFocus);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  },

  removeVisibilityEventListeners: function () {
    window.removeEventListener('blur', this.onBlur);
    window.removeEventListener('focus', this.onFocus);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  },

  attachKeyEventListeners: function () {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  },

  removeKeyEventListeners: function () {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  },

  onBlur: function () {
    this.pause();
  },

  onFocus: function () {
    this.play();
  },

  onVisibilityChange: function () {
    if (document.hidden) {
      this.onBlur();
    } else {
      this.onFocus();
    }
  },

  onKeyDown: function (event) {
    var code;
    if (!updownConst.shouldCaptureKeyEvent(event)) { return; }
    code = event.code || KEYCODE_TO_CODE[event.keyCode];
    this.keys[code] = true;
  },

  onKeyUp: function (event) {
    var code;
    code = event.code || KEYCODE_TO_CODE[event.keyCode];
    this.keys[code] = false;
  }
});