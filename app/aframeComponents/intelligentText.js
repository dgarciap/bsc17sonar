// Registering component
AFRAME.registerComponent('intelligenttext', {
  init: function () {
      var sceneEl = document.querySelector('a-scene');
      var entityEl = document.createElement('a-entity');

      entityEl.setAttribute('position', this.el.getAttribute("position"));
      entityEl.setAttribute('rotation', this.el.getAttribute("rotation"));
      entityEl.setAttribute('geometry', "primitive: plane; width: 2; height: 0.7");
      entityEl.setAttribute('material', "color: brown");
      //TODO: Adjust width according to number of characters.
      entityEl.setAttribute('text', "color: white; align: center; value: SAGRADA FAMILIA; width: 5; ");
      entityEl.setAttribute('look-at', "[camera]");

      sceneEl.appendChild(entityEl);
  },

  update: function () {
  },

  tick: function (time, timeDelta) {
    
  },

});