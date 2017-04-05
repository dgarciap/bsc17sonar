var COORDS_CORNER = { x: 428000, y: 4582000}; //Coords in meters for the origin corner of our map. (x=0, z=0);
//Size in meters of our tiles (square tiles). TILE_SIZExTILE_SIZE.
var TILE_SIZE = 2000;
//Scale of our drawn map.
//So that the size of our tiles when drawn on screen is TILE_SIZE*SCALE.
var SCALE = 0.02;

var loadedTiles = {tiles: {"00": true} };

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

        var newLoadedTiles = {tiles: {}};

        //I have to load current tile.
        newLoadedTiles.tiles[numTile] = true;
        
        //¿Do I have to load close tiles?
        if(posInC < 0.3) newLoadedTiles.tiles[""+cTileR+(cTileC-1)] = true;
        if(posInC > 0.7) newLoadedTiles.tiles[""+cTileR+(cTileC+1)] = true;
        if(posInR < 0.3) newLoadedTiles.tiles[""+(cTileR-1)+cTileC] = true;
        if(posInR > 0.7) newLoadedTiles.tiles[""+(cTileR+1)+cTileC] = true;

        if(posInR > 0.7 && posInC > 0.7) newLoadedTiles.tiles[""+(cTileR+1)+(cTileC+1)] = true;
        if(posInR > 0.7 && posInC < 0.3) newLoadedTiles.tiles[""+(cTileR+1)+(cTileC-1)] = true;
        if(posInR < 0.3 && posInC > 0.7) newLoadedTiles.tiles[""+(cTileR-1)+(cTileC+1)] = true;
        if(posInR < 0.3 && posInC < 0.3) newLoadedTiles.tiles[""+(cTileR-1)+(cTileC-1)] = true;

        loadNewTiles(newLoadedTiles, loadedTiles);
        removeOldTiles(newLoadedTiles, loadedTiles);

        loadedTiles = newLoadedTiles;
    }, config.UPDATE_TILES_INTERVAL);


/**
 * Loads tiles on newLoadedTiles which are not in loadedTiles, because
 * those should be already visible on screen.
 */
function loadNewTiles(newTiles, oldTiles) {
    for(var k in newTiles.tiles) {
        if(!oldTiles.tiles[k]) {
            var sceneEl = document.querySelector('a-scene');
            var entityEl = document.createElement('a-entity');
            
            entityEl.setAttribute('id', 'tile'+k);
            entityEl.setAttribute('class', 'tile');
            entityEl.setAttribute('potreepointcloud', "pointcloudUrl: pointclouds/test"+k+"/cloud.js;tileC: "+k[1]+";tileR: "+k[0]);
            sceneEl.appendChild(entityEl);
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
            pointcloud.parentNode.removeChild(pointcloud);
        }
    }
}

