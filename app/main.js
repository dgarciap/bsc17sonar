MainConsts = {};

//We are using EPGS 32631 for all geographic data on this application.
MainConsts.COORDS_CORNER = { x: 426000, y: 4582000 }; //Coords in meters for the origin corner of our map. (x=0, z=0);
//Size in meters of our tiles (square tiles). TILE_SIZExTILE_SIZE.
MainConsts.TILE_SIZE = 2000;
//Scale of our drawn map.
//So that the size of our tiles when drawn on screen is TILE_SIZE*SCALE.
MainConsts.SCALE = 0.02;

MainConsts.APP_COLOR = "black";

var loadedTiles = { tiles: {} };

var appLogic = {};

appLogic.currentTile = { tileR: 0, tileC: 0, tileNum: "00" };
appLogic.sphereBarrier = undefined;

/**
 * If there is no plane, create one.
 */
function addPlane(position, rotation, size, numTile) {
    var sceneEl = document.querySelector('a-scene');
    var entityEl = document.createElement('a-plane');

    entityEl.setAttribute('width', size);
    entityEl.setAttribute('height', size);
    entityEl.setAttribute('rotation', rotation);
    entityEl.setAttribute('position', position);
    entityEl.setAttribute('class', "plane" + numTile);
    entityEl.setAttribute('id', "plane-tile");
    entityEl.setAttribute('material', "src: ./resources/textures/prohibidowall.png;repeat: 10 10; transparent: true; color: black;");
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
        ws.send(JSON.stringify({position: {x: pos.x/MainConsts.SCALE+MainConsts.COORDS_CORNER.x, y: (pos.z*(-1))/MainConsts.SCALE+MainConsts.COORDS_CORNER.y}}));
    }, config.POSITION_SEND_INTERVAL);

};
*/

//Update tiles drawn on screen.
function tileManager() {
    var pos = document.querySelector('#app-camera').getAttribute('position');

    //Load a new tile if it is necessary.
    var tileCPos = pos.x / (MainConsts.SCALE * MainConsts.TILE_SIZE);
    var tileRPos = (pos.z * (-1)) / (MainConsts.SCALE * MainConsts.TILE_SIZE);
    var cTileC = Math.trunc(tileCPos);
    var cTileR = Math.trunc(tileRPos);

    var posInC = tileCPos - cTileC;
    var posInR = tileRPos - cTileR;

    //console.log("I'm in tile ", cTileR, ' ', cTileC);

    var numTile = "" + cTileR + cTileC;
    appLogic.currentTile = { tileR: cTileR, tileC: cTileC, numTile: numTile };

    var newLoadedTiles = { tiles: {} };

    //I have to load current tile.
    newLoadedTiles.tiles[numTile] = { tileR: cTileR, tileC: cTileC };

    //¿Do I have to load close tiles?
    if (posInC < config.tileLoadArea && isAValidTile(cTileR, cTileC - 1)) newLoadedTiles.tiles["" + cTileR + (cTileC - 1)] = { tileR: cTileR, tileC: cTileC - 1 };
    if (posInC > 1 - config.tileLoadArea && isAValidTile(cTileR, cTileC + 1)) newLoadedTiles.tiles["" + cTileR + (cTileC + 1)] = { tileR: cTileR, tileC: cTileC + 1 };
    if (posInR < config.tileLoadArea && isAValidTile(cTileR-1, cTileC)) newLoadedTiles.tiles["" + (cTileR - 1) + cTileC] = { tileR: cTileR - 1, tileC: cTileC };
    if (posInR > 1 - config.tileLoadArea && isAValidTile(cTileR+1, cTileC)) newLoadedTiles.tiles["" + (cTileR + 1) + cTileC] = { tileR: cTileR + 1, tileC: cTileC };

    if (posInR > 1 - config.tileLoadArea && posInC > 1 - config.tileLoadArea && isAValidTile(cTileR+1, cTileC+1)) newLoadedTiles.tiles["" + (cTileR + 1) + (cTileC + 1)] = { tileR: cTileR + 1, tileC: cTileC + 1 };
    if (posInR > 1 - config.tileLoadArea && posInC < config.tileLoadArea && isAValidTile(cTileR+1, cTileC-1)) newLoadedTiles.tiles["" + (cTileR + 1) + (cTileC - 1)] = { tileR: cTileR + 1, tileC: cTileC - 1 };
    if (posInR < config.tileLoadArea && posInC > 1 - config.tileLoadArea && isAValidTile(cTileR-1, cTileC+1)) newLoadedTiles.tiles["" + (cTileR - 1) + (cTileC + 1)] = { tileR: cTileR - 1, tileC: cTileC + 1 };
    if (posInR < config.tileLoadArea && posInC < config.tileLoadArea && isAValidTile(cTileR-1, cTileC-1)) newLoadedTiles.tiles["" + (cTileR - 1) + (cTileC - 1)] = { tileR: cTileR - 1, tileC: cTileC - 1 };


    loadNewTiles(newLoadedTiles, loadedTiles);
    removeOldTiles(newLoadedTiles, loadedTiles);

    loadedTiles = newLoadedTiles;

    requestAnimationFrame(tileManager);
}


/**
 * Returns true if the tile is in our map.
 */
function isAValidTile(tileR, tileC) {
    return !(tileR < 0 || tileC < 0 ||
        tileHeights[tileR] === undefined ||
        tileHeights[tileR][tileC] === undefined);
}


function createFloor(position, size, numTile) {
    var sceneEl = document.querySelector('a-scene');
    var entityEl = document.createElement('a-plane');

    entityEl.setAttribute('width', size);
    entityEl.setAttribute('height', size);
    entityEl.setAttribute('rotation', "-90 0 0");
    entityEl.setAttribute('position', position);
    entityEl.setAttribute('class', "plane" + numTile);
    entityEl.setAttribute('material', "color: "+MainConsts.APP_COLOR+";");
    sceneEl.appendChild(entityEl);
}


/**
 * Given a tile num returns 
 */
function createBorders(tileNum, tileR, tileC) {

    var tileSize = MainConsts.SCALE * MainConsts.TILE_SIZE;
    var position;

   /* var floorPosition = (tileC * tileSize + tileSize / 2) + " -4 " + (-1 * tileR * tileSize - tileSize / 2);
    createFloor(floorPosition, tileSize, tileNum);
*/
    /*if (isNotAValidTile(tileR + 1, tileC)) {
        position = ((tileC * tileSize + tileSize / 2)) + " -5 " + (-1 * (tileR + 1) * tileSize);
        addPlane(position, "0 0 0", tileSize, tileNum);
    }
    if (isNotAValidTile(tileR - 1, tileC)) {
        position = ((tileC * tileSize + tileSize / 2)) + " -5 " + (-1 * tileR * tileSize);
        addPlane(position, "0 180 0", tileSize, tileNum);
    }
    if (isNotAValidTile(tileR, tileC + 1)) {
        position = ((tileC + 1) * tileSize) + " -5 " + (-1 * (tileR * tileSize + tileSize / 2));
        addPlane(position, "0 -90 0", tileSize, tileNum);
    }
    if (isNotAValidTile(tileR, tileC - 1)) {
        position = (tileC * tileSize) + " -5 " + (-1 * (tileR * tileSize + tileSize / 2));
        addPlane(position, "0 90 0", tileSize, tileNum);
    }*/
}

/*appLogic.errorLoadingPointcloud = function (tileC, tileR, numTile) {
    //If the tiles does not exist and we are trying to draw a border tile,
    //draw limit border.
    var rotationY = 0;
    var position = "0 0 0";
    var tileSize = MainConsts.SCALE * MainConsts.TILE_SIZE;
    if (tileR === appLogic.currentTile.tileR && tileC !== appLogic.currentTile.tileC) {
        // | 90   -90 |
        if (tileC < appLogic.currentTile.tileC) {
            rotationY = +90;
            position = (appLogic.currentTile.tileC * tileSize) + " -5 " + (-1 * (appLogic.currentTile.tileR * tileSize + tileSize / 2));
        }
        else {
            rotationY = -90;
            position = ((appLogic.currentTile.tileC + 1) * tileSize) + " -5 " + (-1 * (appLogic.currentTile.tileR * tileSize + tileSize / 2));
        }
        addPlane(position, "0 " + rotationY + " 0", tileSize, numTile);
    }
    else if (tileC === appLogic.currentTile.tileC && tileR !== appLogic.currentTile.tileR) {
        // _ 0
        // _ -180
        if (tileR < appLogic.currentTile.tileR) {
            rotationY = 180;
            position = ((appLogic.currentTile.tileC * tileSize + tileSize / 2)) + " -5 " + (-1 * appLogic.currentTile.tileR * tileSize);
        }
        else {
            rotationY = 0;
            position = ((appLogic.currentTile.tileC * tileSize + tileSize / 2)) + " -5 " + (-1 * (appLogic.currentTile.tileR + 1) * tileSize);
        }
        addPlane(position, "0 " + rotationY + " 0", tileSize, numTile);
    }

}*/

/**
 * Loads tiles on newLoadedTiles. Or set them to visible if they are already loaded.
 */
function loadNewTiles(newTiles, oldTiles) {
    var pointcloudContainer = document.querySelector('.pointcloudContainer').components.potreepointcloud;
    var pathgenerator = document.querySelector('#path-generator').components.pathgenerator;
    for (var k in newTiles.tiles) {
        if(!oldTiles.tiles[k]) {
            if(pointcloudContainer.isTileAdded(newTiles.tiles[k].tileR, newTiles.tiles[k].tileC)) {
                    pointcloudContainer.setVisibility(newTiles.tiles[k].tileR, newTiles.tiles[k].tileC, true);
            }
            else {
                console.log("TILE IS NOT LOADED: ", newTiles.tiles[k].tileR, " ", newTiles.tiles[k].tileC);
                var pointcloudUrl = 'pointclouds/test' + newTiles.tiles[k].tileR + '' + newTiles.tiles[k].tileC + '/cloud.js'
                pointcloudContainer.addPointCloud(pointcloudUrl, newTiles.tiles[k].tileR, newTiles.tiles[k].tileC);
            }

            //Set to visible paths on this tile.
            pathgenerator.changeVisibility([newTiles.tiles[k].tileR, newTiles.tiles[k].tileC], true);
        }
    }
}

/**
 * Hide old tiles which are not on the new tile list.
 */
function removeOldTiles(newTiles, oldTiles) {
    for (var k in oldTiles.tiles) {
        if (!newTiles.tiles[k]) {
            var pointcloudContainer = document.querySelector('.pointcloudContainer').components.potreepointcloud;
            pointcloudContainer.setVisibility(oldTiles.tiles[k].tileR, oldTiles.tiles[k].tileC, false);
            //Set to visible paths on this tile.
            var pathgenerator = document.querySelector('#path-generator').components.pathgenerator;
            pathgenerator.changeVisibility([oldTiles.tiles[k].tileR, oldTiles.tiles[k].tileC], false);
        }
    }
}


/**
 * Manage sphere.
 */
function manageSphere() {
    if (config.WITH_SPHERE_BARRIER) {
        var sceneEl = document.querySelector('a-scene');
        if (sceneEl) {
            if (!this.sphereBarrier) {

                this.sphereBarrier = document.createElement('a-sphere');

                this.sphereBarrier.setAttribute('color', MainConsts.APP_COLOR);
                this.sphereBarrier.setAttribute('radius', '20');
                this.sphereBarrier.setAttribute('side', 'back');
                this.sphereBarrier.setAttribute('opacity', '1');
                sceneEl.appendChild(this.sphereBarrier);
            }
            else {
                var position = document.querySelector('#app-camera').getAttribute('position');
                this.sphereBarrier.setAttribute('position', position);
            }
        }
        requestAnimationFrame(manageSphere);
    }
}

document.querySelector('a-scene').addEventListener('loaded', function () {
    requestAnimationFrame(manageSphere);
    requestAnimationFrame(tileManager);
})

/**
 * End. Manage sphere.
 */


/** WIND EFFECT. */

/*var degreeX = Math.random()*2*Math.PI;
var degreeY = Math.random()*2*Math.PI;
var degreeZ = Math.random()*2*Math.PI;
var signX = -1;
var signY = 1;
var signZ = -1;
var spatialStep = 0.008;
var spatialHeight = 0.003;
var cicleDuration = 4000;//(millisecs)
var startTime = new Date().getTime();

function getRandomSign() {
    return Math.random() >= 0.5 ? 1 : -1;
}

function windEffect() {
    var currentTime = new Date().getTime();
    var delta = currentTime-startTime;
    var degreeStep = delta*2*Math.PI/cicleDuration;

    degreeX += degreeStep;
    if(degreeX > Math.PI*2) signX = getRandomSign();
    degreeX %= Math.PI*2;

    degreeY += degreeStep;
    if(degreeY > Math.PI*2) signY = getRandomSign();
    degreeY %= Math.PI*2;

    degreeZ += degreeStep;
    if(degreeZ > Math.PI*2) signZ = getRandomSign();
    degreeZ %= Math.PI*2;

    var xIncrement = Math.sin(degreeX);
    var yIncrement = Math.sin(degreeY);
    var zIncrement = Math.sin(degreeZ);

    var position = document.querySelector('#app-camera').getAttribute('position');

    position.x += xIncrement*spatialStep*signX;
    position.y += yIncrement*spatialHeight*signY;
    position.z += zIncrement*spatialStep*signZ;

    document.querySelector('#app-camera').setAttribute('position', position);

    startTime = new Date().getTime();

    requestAnimationFrame(windEffect);
}
requestAnimationFrame(windEffect);*/
/** END. WIND EFFECT. */
