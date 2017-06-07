/**
 * Web Audio Sound component.
 */
AFRAME.registerComponent('webaudiosound', {
  schema: {
    autoplay: {default: false},
    loop: {default: false},
    maxDistance: {default: 10000},
    on: {default: ''},
    poolSize: {default: 1},
    positional: {default: true},
    refDistance: {default: 1},
    rolloffFactor: {default: 1},
    src: {type: 'audio'},
    volume: {default: 1},
  },

  multiple: true,

  init: function () {
    this.listener = null;
    this.audioLoader = new THREE.AudioLoader();
    this.pool = new THREE.Group();
    this.loaded = false;
    this.mustPlay = false;
    this.playSound = this.playSound.bind(this);

    this.sourceList = [];

    this.ids = [
      'testaudio',
      'testaudio1',
      'testaudio2',
      'testaudio3',
      'testaudio4',
      'testaudio5',
    ];

    this.urls = [
      /*'./resources/music/street.mp3',
      './resources/music/trafficjam.mp3',
      './resources/music/urban.mp3',
      './resources/music/train.mp3',
      './resources/music/drilling.mp3',
      './resources/music/bus.mp3',*/
      './resources/music/english.ogg',
      './resources/music/spanish.ogg',
      './resources/music/french.ogg',
    ];
    this.sources = [];
    this.loadCount = 0;
  },

  loadCachedRes: function() {
    loadCachedRes();
    for(var i = 0; i < this.ids.length; ++i) {
      THREE.Cache(this.ids)
    }
  },

  getData: function() {
    if(this.ids && false) {
      loadCachedRes();
      for(var i = 0; i < this.ids.length; ++i) {
        //TODO: THREE.Cache(this.ids[i])
      }
    }
    else {
      var self = this;

      var request = new XMLHttpRequest();
      request.open('GET', this.urls[Math.trunc(Math.random()*(this.urls.length-1))/*this.loadCount*/], true);
      request.responseType = 'arraybuffer';

      request.onload = function() {
        var audioData = request.response;
        self.listener.context.decodeAudioData(audioData, function(buffer) {
            var source  = self.listener.context.createBufferSource();
            self.sources[self.sources.length] = source;
            source.buffer = buffer;

            var gainNode = self.listener.context.createGain();
            //source.connect(gainNode);
            //gainNode.connect(that.audioCtx.destination);
            source.loop = true;
            source.connect(gainNode);
            gainNode.connect(self.listener.context.destination);

            gainNode.gain.value = 1;

            self.loaded = true;

            // Remove this key from cache, otherwise we can't play it again
            self.el.emit('sound-loaded');

            ++self.loadCount;
            if(self.loadCount < self.urls.length && false) self.getData();
            else if(self.data.autoplay || self.mustPlay) self.playSound();
        },
        function(e){ console.log("Error with decoding audio data" + e.err); });

      }

      request.send();
    }
  },

  update: function (oldData) {
    var data = this.data;
    var srcChanged = data.src !== oldData.src;
    // Create new sound if not yet created or changing `src`.
    if (srcChanged) {
      if (!data.src) {
        warn('Audio source was not specified with `src`');
        return;
      }
      this.setupSound();
    }

    this.pool.children.forEach(function (sound) {
      if (data.positional) {
        sound.setDistanceModel(data.distanceModel);
        sound.setMaxDistance(data.maxDistance);
        sound.setRefDistance(data.refDistance);
        sound.setRolloffFactor(data.rolloffFactor);
      }
      sound.setLoop(data.loop);
      sound.setVolume(data.volume);
      sound.isPaused = false;
    });

    if (data.on !== oldData.on) {
      this.updateEventListener(oldData.on);
    }
    // All sound values set. Load in `src`.
    if (false) {
      var self = this;

      this.loaded = false;
        self.pool.children.forEach(function (sound) {
            /*sound.setBuffer(self.audioCtx.destination);
            sound.setFilter();*/
        });
        self.loaded = true;

        // Remove this key from cache, otherwise we can't play it again
        THREE.Cache.remove(data.src);
        if (self.data.autoplay || self.mustPlay) { self.playSound(); }
        self.el.emit('sound-loaded');
    }
  },

  pause: function () {
    this.stopSound();
    this.removeEventListener();
  },

  play: function () {
    /*if (this.data.autoplay) { this.playSound(); }*/
    this.updateEventListener();
  },

  remove: function () {
    this.removeEventListener();
    this.el.removeObject3D(this.attrName);
    try {
      this.pool.children.forEach(function (sound) {
        sound.disconnect();
      });
    } catch (e) {
      // disconnect() will throw if it was never connected initially.
      warn('Audio source not properly disconnected');
    }
  },

  /**
   *  Update listener attached to the user defined on event.
   */
  updateEventListener: function (oldEvt) {
    var el = this.el;
    if (oldEvt) { el.removeEventListener(oldEvt, this.playSound); }
    el.addEventListener(this.data.on, this.playSound);
  },

  removeEventListener: function () {
    this.el.removeEventListener(this.data.on, this.playSound);
  },

  /**
   * Removes current sound object, creates new sound object, adds to entity.
   *
   * @returns {object} sound
   */
  setupSound: function () {
    var el = this.el;
    var sceneEl = el.sceneEl;

    if (this.pool.children.length > 0) {
      this.stopSound();
      el.removeObject3D('sound');
    }

    // Only want one AudioListener. Cache it on the scene.
    var listener = this.listener = sceneEl.audioListener || new THREE.AudioListener();
    sceneEl.audioListener = listener;

    if (sceneEl.camera) {
      sceneEl.camera.add(listener);
    }

    // Wait for camera if necessary.
    sceneEl.addEventListener('camera-set-active', function (evt) {
      evt.detail.cameraEl.getObject3D('camera').add(listener);
    });

    // Create [poolSize] audio instances and attach them to pool
    this.pool = new THREE.Group();
    for (var i = 0; i < this.data.poolSize; i++) {
      var sound = this.data.positional ? new THREE.PositionalAudio(listener) : new THREE.Audio(listener);
      this.pool.add(sound);
    }
    el.setObject3D(this.attrName, this.pool);

    this.pool.children.forEach(function (sound) {
      sound.onEnded = function () {
        sound.isPlaying = false;
        el.emit('sound-ended', {index: i});
      };
    });
  },

  /**
   * Pause all the sounds in the pool.
   */
  pauseSound: function () {
    this.isPlaying = false;
    this.pool.children.forEach(function (sound) {
      if (!sound.source || !sound.source.buffer || !sound.isPlaying || sound.isPaused) { return; }
      sound.isPaused = true;
      sound.pause();
    });
  },

  /**
   * Look for an unused sound in the pool and play it if found.
   */
  playSound: function () {
    if (!this.loaded) {
      warn('Sound not loaded yet. It will be played once it finished loading');
      this.mustPlay = true;
      return;
    }

    var found = false;
    this.isPlaying = true;
    this.sources.forEach(function (source) {
      source.start(0);
    });

    this.mustPlay = false;
  },

  /**
   * Stop all the sounds in the pool.
   */
  stopSound: function () {
    this.isPlaying = false;
    this.pool.children.forEach(function (sound) {
      if (!sound.source || !sound.source.buffer) { return; }
      sound.stop();
    });
  }
});