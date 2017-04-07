var COORDS_CORNER = { x: 428000, y: 4582000}; //Coords in meters for the origin corner of our map. (x=0, z=0);
//Size in meters of our tiles (square tiles). TILE_SIZExTILE_SIZE.
var TILE_SIZE = 2000;
//Scale of our drawn map.
//So that the size of our tiles when drawn on screen is TILE_SIZE*SCALE.
var SCALE = 0.02;

var loadedTiles = {tiles: {"00": {tileC: 0, tileR: 0}} };

var appLogic = {};

appLogic.currentTile = {tileR: 0, tileC: 0, tileNum: "00"};

appLogic.errorLoadingPointcloud = function(tileC, tileR, numTile) {
    //If the tiles does not exist and we are trying to draw a border tile,
    //draw limit border.
    var rotationY = 0;
    var position = "0 0 0";
    var tileSize = SCALE*TILE_SIZE;
    if(tileR === appLogic.currentTile.tileR && tileC !== appLogic.currentTile.tileC) {
        // | 90   -90 |
        if(tileC < appLogic.currentTile.tileC) {
            rotationY = +90;
            position = (appLogic.currentTile.tileC*tileSize) + " -5 " + (-1*(appLogic.currentTile.tileR*tileSize+tileSize/2));
        }
        else {
            rotationY = -90;
            position = ((appLogic.currentTile.tileC+1)*tileSize) + " -5 " + (-1*(appLogic.currentTile.tileR*tileSize+tileSize/2));
        }
        addPlane(position, "0 " + rotationY + " 0", tileSize, numTile);
    }
    else if(tileC === appLogic.currentTile.tileC && tileR !== appLogic.currentTile.tileR) {
        // _ 0
        // _ -180
        if(tileR < appLogic.currentTile.tileR) {
            rotationY = 180;
            position = ((appLogic.currentTile.tileC*tileSize+tileSize/2)) + " -5 " + (-1*appLogic.currentTile.tileR*tileSize);
        }
        else {
            rotationY = 0;
            position = ((appLogic.currentTile.tileC*tileSize+tileSize/2)) + " -5 " + (-1*(appLogic.currentTile.tileR+1)*tileSize);
        }
        addPlane(position, "0 " + rotationY + " 0", tileSize, numTile);
    }
    
}

/**
 * If there is no plane, create one.
 */
function addPlane(position, rotation, size, numTile) {
    var sceneEl = document.querySelector('a-scene');
    var entityEl = document.createElement('a-plane');
    
    entityEl.setAttribute('width', size);
    entityEl.setAttribute('height', size);
    entityEl.setAttribute('color', "#FFF");
    entityEl.setAttribute('rotation', rotation);
    entityEl.setAttribute('position', position);
    entityEl.setAttribute('class', "plane"+numTile);
    entityEl.setAttribute('id', "plane-tile");
    sceneEl.appendChild(entityEl);
}

/*
//Let's start reporting our position.
var ws = new WebSocket(config.WS_HOST);
ws.onopen = function (event) {
    //Let's react to camera position.
    //Every half of a second, report camera position in meters (spherical marcator).
    setInterval(function() {
        var pos = document.querySelector('#app-camera').getAttribute('position');
        ws.send(JSON.stringify({position: {x: pos.x/SCALE+COORDS_CORNER.x, y: (pos.z*(-1))/SCALE+COORDS_CORNER.y}}));
    }, config.POSITION_SEND_INTERVAL);

};
*/

//Update tiles drawn on screen.
setInterval(function() {
        var pos = document.querySelector('#app-camera').getAttribute('position');

        //Load a new tile if it is necessary.
        var tileCPos = pos.x/(SCALE*TILE_SIZE);
        var tileRPos = (pos.z*(-1))/(SCALE*TILE_SIZE);
        var cTileC = Math.trunc(tileCPos);
        var cTileR = Math.trunc(tileRPos);

        var posInC = tileCPos-cTileC;
        var posInR = tileRPos-cTileR;

        console.log("I'm in tile " , cTileR,  ' ' , cTileC);

        var numTile = ""+cTileR+cTileC;
        appLogic.currentTile = {tileR: cTileR, tileC: cTileC, numTile: numTile};

        var newLoadedTiles = {tiles: {}};

        //I have to load current tile.
        newLoadedTiles.tiles[numTile] = {tileR: cTileR, tileC: cTileC};

        //¿Do I have to load close tiles?
        if(posInC < 0.3) newLoadedTiles.tiles[""+cTileR+(cTileC-1)] = {tileR: cTileR, tileC: cTileC-1};
        if(posInC > 0.7) newLoadedTiles.tiles[""+cTileR+(cTileC+1)] = {tileR: cTileR, tileC: cTileC+1};
        if(posInR < 0.3) newLoadedTiles.tiles[""+(cTileR-1)+cTileC] = {tileR: cTileR-1, tileC: cTileC};
        if(posInR > 0.7) newLoadedTiles.tiles[""+(cTileR+1)+cTileC] = {tileR: cTileR+1, tileC: cTileC};

        if(posInR > 0.7 && posInC > 0.7) newLoadedTiles.tiles[""+(cTileR+1)+(cTileC+1)] = {tileR: cTileR+1, tileC: cTileC+1};
        if(posInR > 0.7 && posInC < 0.3) newLoadedTiles.tiles[""+(cTileR+1)+(cTileC-1)] = {tileR: cTileR+1, tileC: cTileC-1};
        if(posInR < 0.3 && posInC > 0.7) newLoadedTiles.tiles[""+(cTileR-1)+(cTileC+1)] = {tileR: cTileR-1, tileC: cTileC+1};
        if(posInR < 0.3 && posInC < 0.3) newLoadedTiles.tiles[""+(cTileR-1)+(cTileC-1)] = {tileR: cTileR-1, tileC: cTileC-1};


        loadNewTiles(newLoadedTiles, loadedTiles);
        removeOldTiles(newLoadedTiles, loadedTiles);

        loadedTiles = newLoadedTiles;
    }, config.UPDATE_TILES_INTERVAL);


/**
 * Returns true if the tile is in our map.
 */
function isNotAValidTile(tileR, tileC) {
  return (tileR < 0 || tileC < 0 || 
    tileHeights[tileR] === undefined || 
    tileHeights[tileR][tileC] === undefined);
}

/**
 * Loads tiles on newLoadedTiles which are not in loadedTiles, because
 * those should be already visible on screen.
 */
function loadNewTiles(newTiles, oldTiles) {
    for(var k in newTiles.tiles) {
        if(!oldTiles.tiles[k]) {
            if(isNotAValidTile(newTiles.tiles[k].tileR, newTiles.tiles[k].tileC)) {
                appLogic.errorLoadingPointcloud(newTiles.tiles[k].tileC, newTiles.tiles[k].tileR, k);
            }
            else {
                var sceneEl = document.querySelector('a-scene');
                var entityEl = document.createElement('a-entity');
                var c, f;

                if(k.length > 2) c = k[1]+k[2];
                
                entityEl.setAttribute('id', 'tile'+k);
                entityEl.setAttribute('class', 'tile');
                entityEl.setAttribute('potreepointcloud', 
                    "pointcloudUrl: pointclouds/test"+k+"/cloud.js;tileC: "+
                    newTiles.tiles[k].tileC+";tileR: "+newTiles.tiles[k].tileR);
                sceneEl.appendChild(entityEl);
            }
        }
    }
}

/**
 * Removes old tiles which are not on the new tile list.
 */
function removeOldTiles(newTiles, oldTiles) {
    for(var k in oldTiles.tiles) {
        if(!newTiles.tiles[k]) {
            var pointcloud = document.querySelector('#tile'+k);
            if(pointcloud) pointcloud.parentNode.removeChild(pointcloud);
            else {
                //If there is no tile, remove borders.
                var planes = document.querySelectorAll('.plane' + k);
                for(var i = 0; i < planes.length; ++i) planes[i].parentNode.removeChild(planes[i]);
            }
        }
    }
}

