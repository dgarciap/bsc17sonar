tag = {};

tag.ACTIVATION_DISTANCE = 15;

// Registering component
AFRAME.registerComponent('tag', {
  schema: {
    pngFile: {type: "string", default: 'SAGRADA FAMILIA'},
  },

  init: function () {
      var spriteMap = new THREE.TextureLoader().load(this.data.pngFile);
      var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff } );
      var sprite = new THREE.Sprite( spriteMaterial );

      this.el.setObject3D('sprite', sprite);
      this.el.setAttribute('visible', false);
  },

  pythagorean: function(sideA, sideB){
    return Math.sqrt(Math.pow(sideA, 2) + Math.pow(sideB, 2));
  },

  update: function () {
  },

  tick: function (time, timeDelta) {
    var camPos = document.querySelector('#app-camera').getAttribute('position');
    var position = this.el.getAttribute('position');

    var distance = this.pythagorean(position.x-camPos.x, position.z-camPos.z);

    this.counter += timeDelta;
    if(distance <= tag.ACTIVATION_DISTANCE) this.el.setAttribute('visible', true);
    else this.el.setAttribute('visible', false);
  },

});