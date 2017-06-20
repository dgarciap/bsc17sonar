webaudiosound = {};
webaudiosound.VOLCHANGE_PER_SECOND = 2;

//Cache shared between all the webaudiosounds.
//It contains the loaded and decoded audio source that are
//going to be used on multiple positional audio containers.
webaudiosound.loadedSources = {};

/**
 * Sound component.
 */
AFRAME.registerComponent('webaudiosound', {
  schema: {
    autoplay: {default: false},
    distanceModel: {default: 'inverse',
      oneOf: ['linear', 'inverse', 'exponential']},
    loop: {default: false},
    maxDistance: {default: 10000},
    on: {default: ''},
    positional: {default: true},
    refDistance: {default: 1},
    rolloffFactor: {default: 1},
    volume: {default: 1}
  },

  multiple: true,

  init: function () {
    this.listener = null;
    this.audioLoader = new THREE.AudioLoader();
    this.pool = new THREE.Group();
    this.loaded = false;
    this.mustPlay = false;
    this.playSound = this.playSound.bind(this);

    this.urls = [];
    this.urlsChanged = false;
    this.gains = {};
  },

  addSounds: function(urls) {
    oldUrls = this.urls;
    this.urls = this.urls.concat(urls);
    this.urlsChanged = true;
    this.update(this.data);
  },

  /**
   * We want to go from the original volume to the new one 'this.pendentVolume' without a drastic and annoying change.
   * This method, will process one step in this change. And how much of volume can be changed depends on 'delta' and
   * webaudiosound.VOLCHANGE_PER_SECOND.
   */
  modifyStepOfVolume: function(delta) {

    var maxVolAdded = delta*webaudiosound.VOLCHANGE_PER_SECOND/1000;
    if(this.pendentVolume && this.loaded) {
      var volumeApplied = true;
      var self = this;
      this.pool.children.forEach(function (sound, index) {
        if(self.pendentVolume[index] !== undefined) {
          var finalVol = self.pendentVolume[index];
          if(finalVol < 0) finalVol = 0;
          if(finalVol > 1) finalVol = 1;

          var volDiff = Math.min(Math.abs(finalVol - sound.getVolume()), maxVolAdded);

          if(finalVol - sound.getVolume() > 0) sound.setVolume(Math.min(sound.getVolume()+volDiff, 1));
          else sound.setVolume(Math.max(sound.getVolume()-volDiff, 0));

          //Reduce precision of the numbers compared to two decimals.
          if(finalVol.toFixed(2) !== sound.getVolume().toFixed(2)) {
            volumeApplied = false;
            //console.log("AudioChange. ", index, " ", sound.getVolume());
          }

          if(sound.getVolume() === 0 && !sound.isPaused) {
            sound.pause();
            sound.isPaused = true;
          }
          else if(sound.getVolume() !== 0 && sound.isPaused) {
            sound.play();
            sound.isPaused = false;
          }
        }
      });

      //If we reached the desired volume configuration.
      if(volumeApplied) { this.pendentVolume = null; }
    }
  },

  tick: function(time, delta) {
    this.modifyStepOfVolume(delta);
  },

  /**
   * Given an array of volumes. Applies those volumes on the current sounds.
   * Volume order must match url order.
   * TODO: Use keys to identify each sound.
   */
  changeVolumes: function(volumes) {
    this.pendentVolume = volumes;
    /*if(this.loaded) {
      console.log(this.el.getAttribute("id"), " ", volumes);
      this.pool.children.forEach(function (sound, index) {
        if(volumes[index] !== undefined) {
          sound.setVolume(volumes[index] > 0 ? volumes[index] : 0);

          if(volumes[index] === 0 && !sound.isPaused) {
            sound.pause();
            sound.isPaused = true;
          }
          else if(volumes[index] !== 0 && sound.isPaused) {
            sound.play();
            sound.isPaused = false;
          }

        }
      });
    }*/
  },

  update: function (oldData) {
    var data = this.data;
    // Create new sound if not yet created.
    if (this.urlsChanged) {
      if (!this.urls.length) {
        warn('Audio source was not specified');
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
    if (this.urlsChanged) {
      this.loaded = false;
      this.urlsCounter = 0;
      this.loadUrls();
      this.urlsChanged = false;
    }
  },

  processLoadedAudioSource: function (buffer) {
    //Save this decoded audio source into our custom cache.
    webaudiosound.loadedSources[this.urls[this.urlsCounter]] = buffer;
    
    this.pool.children[this.urlsCounter].setBuffer(buffer);
    this.pool.children[this.urlsCounter].setVolume(0);

    // Remove this key from cache, otherwise we can't play it again.
    THREE.Cache.remove(this.urls[this.urlsCounter]);

    ++this.urlsCounter;
    if(this.urlsCounter < this.urls.length) this.loadUrls();
    else {
        this.loaded = true;
        this.el.emit('sound-loaded');
        if (this.data.autoplay || this.mustPlay) { this.playSound(); }
    }
  },

  loadUrls: function() {

    if(webaudiosound.loadedSources[this.urls[this.urlsCounter]])
      this.processLoadedAudioSource(webaudiosound.loadedSources[this.urls[this.urlsCounter]]);
    else
      this.audioLoader.load(this.urls[this.urlsCounter], this.processLoadedAudioSource.bind(this));
  },

  pause: function () {
    this.stopSound();
    this.removeEventListener();
  },

  play: function () {
    if (this.data.autoplay && this.loaded) { this.playSound(); }
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
    for (var i = 0; i < this.urls.length; i++) {
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
   * Look for all unused sound in the pool and play them if found.
   */
  playSound: function () {
    if (!this.loaded) {
      warn('Sound not loaded yet. It will be played once it finished loading');
      this.mustPlay = true;
      return;
    }

    var found = false;
    this.isPlaying = true;
    this.pool.children.forEach(function (sound) {
      if (!sound.isPlaying && sound.buffer) {
        sound.play();
        sound.isPaused = false;
        found = true;
        return;
      }
    });

    if (!found) {
      warn('All the sounds are playing. If you need to play more sounds simultaneously ' +
           'consider increasing the size of pool with the `poolSize` attribute.', this.el);
      return;
    }

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