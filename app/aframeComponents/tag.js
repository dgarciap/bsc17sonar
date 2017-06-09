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
  },

  update: function () {
  },

  tick: function (time, timeDelta) {
    
  },

});