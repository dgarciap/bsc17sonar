AFRAME.registerComponent('pathgenerator', {
  schema: {
      pathJsonUrl: {type: "string", default: undefined},
  },

  pythagorean: function(sideA, sideB){
    return Math.sqrt(Math.pow(sideA, 2) + Math.pow(sideB, 2));
  },

  init: function () {
    if(!this.data.pathJsonUrl) console.error("Path Generator needs a json URL to load path from it.");
    else {
        var xmlhttp = new XMLHttpRequest();

        var that = this;

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
                if (xmlhttp.status == 200) {
                    that.data = []
                    var result = JSON.parse(this.responseText);
                    that.count = 0;
                    that.numRails = 0;
                    for(var key in result) {
                        that.data.push(result[key]);
                    }
                    /*var count = 0;
                    var sceneEl = document.querySelector('a-scene');
                    var resultJson = JSON.parse(this.responseText);
                    for(var key in resultJson) {
                        var entityEl = document.createElement('a-entity');

                        entityEl.setAttribute('noisepartsys', "initX: " + resultJson[key].start[0] + ";initZ: " + resultJson[key].start[1] + 
                            ";endX: " + resultJson[key].end[0] + ";endZ: " + resultJson[key].end[1] + ";");

                        if(count < 200) {
                            sceneEl.appendChild(entityEl);
                            console.log("initX: " + resultJson[key].start[0] + ";initZ: " + resultJson[key].start[1] + 
                            ";endX: " + resultJson[key].end[0] + ";endZ: " + resultJson[key].end[1] + ";");
                        }
                        ++count;
                    }

                    console.log("Number of fragments: ", count);*/
                }
                else if (xmlhttp.status == 400) {
                    console.error('PathGenerator Error 400');
                }
                else {
                    console.error('PathGenerator Error');
                }
            }
        };

        xmlhttp.open("GET", this.data.pathJsonUrl, true);
        xmlhttp.send();
    }
  },

  update: function () {
  },

  tick: function () {

      if(this.data && this.count < 1000) {
          if(this.data[this.count].start[0] > MainConsts.COORDS_CORNER.x && this.data[this.count].start[1] > MainConsts.COORDS_CORNER.y && this.data[this.count].end[0] > MainConsts.COORDS_CORNER.x && this.data[this.count].end[1] > MainConsts.COORDS_CORNER.y) {
            var sceneEl = document.querySelector('a-scene');
            var entityEl = document.createElement('a-entity');

            entityEl.setAttribute('noisepartsys', "initX: " + this.data[this.count].start[0] + ";initZ: " + this.data[this.count].start[1] + 
                ";endX: " + this.data[this.count].end[0] + ";endZ: " + this.data[this.count].end[1] + ";");

            sceneEl.appendChild(entityEl);
            ++this.numRails;
          }
          if(this.count === 2199) console.log("Num of rails: ", this.numRails);
          ++this.count;
      }
  },

  remove: function () {},
  pause: function () {},
  play: function () {},
});