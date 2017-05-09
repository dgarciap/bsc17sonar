var AUDIOS = [
    {src: "#engaud", color: "white"},
    {src: "#spaaud", color: "red"},
    {src: "#frenchaud", color: "blue"},
];

// Registering component
AFRAME.registerComponent('audiocreator', {
  init: function () {
      this.created = false;

      this.GROWTH_STEP = 10;
      this.TILES_PER_SIDE = 4;
  },

  update: function () {
  },

  tick: function (time, timeDelta) {
    //If 1 sec is GROWTH_STEP, timeDelta is ...
    if(!this.created) {
        var sceneEl = document.querySelector('a-scene');
        for(var i = 0; i < this.TILES_PER_SIDE; ++i) {
            for(var j = 0; j < this.TILES_PER_SIDE; ++j) {
                var entityEl = document.createElement('a-sound');
                var x = i*this.GROWTH_STEP;
                var z = -j*this.GROWTH_STEP;
                entityEl.setAttribute('autoplay', "true");
                entityEl.setAttribute('loop', "true");
                entityEl.setAttribute('position', x+" 0 "+z);
                entityEl.setAttribute('src', AUDIOS[j % AUDIOS.length].src);
                sceneEl.appendChild(entityEl);

                entityEl = document.createElement('a-box');
                entityEl.setAttribute('position', x+" 0 "+z);
                entityEl.setAttribute('width', "0.5");
                entityEl.setAttribute('height', "0.5");
                entityEl.setAttribute('depth', "0.5");
                entityEl.setAttribute('color', AUDIOS[j % AUDIOS.length].color);
                sceneEl.appendChild(entityEl);

            }  
        }
    }

    this.created = true;

  },

});