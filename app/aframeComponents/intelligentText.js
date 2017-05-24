// Registering component
AFRAME.registerComponent('intelligenttext', {
  schema: {
    title: {type: "string", default: 'SAGRADA FAMILIA'},
  },

  init: function () {
      var sceneEl = document.querySelector('a-scene');
      var entityEl = document.createElement('a-entity');

      entityEl.setAttribute('position', this.el.getAttribute("position"));
      entityEl.setAttribute('rotation', this.el.getAttribute("rotation"));
      entityEl.setAttribute('material', "color: brown");
      //TODO: Adjust width according to number of characters.
      entityEl.setAttribute('text', "color: white; align: center; value: "+this.data.title+"; width: 5; ");
      entityEl.setAttribute('look-at', "[camera]");

      sceneEl.appendChild(entityEl);
  },

  update: function () {
  },

  tick: function (time, timeDelta) {
    
  },

});