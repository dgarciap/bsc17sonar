var sample_numbers = {
    "construction": 18,
    "leisure": 23,
    "industrial": 22,
    "trains": 14,
    "mountain": 19,
    "ocean": 21,
    "wind": 20,
    "subterranean": 17
};

var sample_list = [
    {"name": "traffic_light_1", type: "traffic", file: "124492__miastodzwiekow__street-crickets-120711.mp3" }, //0
    {"name": "traffic_light_2", type: "traffic", file: "City_Centre-Hopeinawe-377331566.mp3"}, //1 325246__jeffreys2__traffic2.mp3
    {"name": "traffic_light_3", type: "traffic", file: "234243__jessiep__traffic-to-alley-quiet.mp3"}, //2
    {"name": "traffic_light_4", type: "traffic", file: "84646__cmusounddesign__traffic-night.mp3"}, //3
    {"name": "traffic_light_5", type: "traffic", file: "Driving Ambiance-SoundBible.com-670322941.mp3"}, //4  
    {"name": "traffic_medium_1", type: "traffic", file: "131259__jcgd2__traffic-noise-in-the-street.mp3"}, //5
    {"name": "traffic_medium_2", type: "traffic", file: "street-daniel_simon.mp3"}, //6
    {"name": "traffic_medium_3", type: "traffic", file: "Urban Traffic-SoundBible.com-1217469275.mp3"}, //7
    {"name": "traffic_medium_4", type: "traffic", file: "medium_traffic.mp3"}, //8
    {"name": "traffic_medium_5", type: "traffic", file: "17869__cognito-perceptu__traffic-on-i-359.mp3"}, //9
    {"name": "traffic_hard_1", type: "traffic", file: "Background Noise-SoundBible.com-190168996.mp3"}, //10
    {"name": "traffic_hard_2", type: "traffic", file: "160684__antique98__fast-traffic-on-the-highway.mp3"}, //11
    { "name": "traffic_hard_3", type: "traffic", file: "253760__caculo__highway-traffic-sounds-in-the-background.mp3"}, //12
    { "name": "traffic_jam", type: "traffic", file: "Traffic_Jam-Yo_Mama-1164700013-3.mp3"},  //13
    { "name": "train_horn", type: "train", file: "Train_Honk_Horn_Distance-Mike_Koenig-1905511933.mp3"},//14
    { "name": "train_street_car", type: "train", file: "341569__dggrunzweig__street-car.mp3"},     //15
    { "name": "street_conversation", type: "tourists", file: "City_Centre-Hopeinawe-377331566.mp3"}, //16
    { "name": "cabin", type: "ambience", file: "Cargo Plane Cabin Ambiance-SoundBible.com-589803489.mp3"}, //17
    { "name": "construction_drills", type: "construction", file: "Builders Drilling-SoundBible.com-2062910629.mp3"}, //18
    { "name": "crickets", type: "mountain", file: "352514__inspectorj__ambience-night-wildlife-a.mp3"}, //19
    { "name": "wind", type: "wind", file: "205966__kangaroovindaloo__medium-wind.mp3"}, //20
    { "name": "ocean", type: "ocean", file: "174763__corsica-s__pacific-ocean.mp3"}, //21
    { "name": "industry", type: "industry", file: "103267__robinhood76__01760-industrial-noise.mp3"}, //22
    { "name": "bar_1", type: "leisure", file: "383265__deleted-user-7146007__busy-bar-ambience.mp3"}, //23
    { "name": "bar_2", type: "leisure", file: "32319__oniwe__barnoisyambience.mp3"}, //24
    { "name": "bar_3", type: "leisure", file: "16198__andriala__in-music-bar.mp3"}, //25
    { "name": "construction_ambience", type: "construction", file: "246171__ajexk__construction-soundscape.mp3"}, //26
    { "name": "construction_ambience", type: "construction", file: "69891__costamonteiro__metro-under-construction.mp3"} //27
];

var sample_num_from_traffic_type = function(typ){
    switch(typ) {
    case 11:
        return 0;
    case 12:
        return 1;
    case 13:
        return 2;
    case 14:
        return 3;
    case 15:
        return 4;
    case 21:
        return 5;
    case 22:
        return 6;
    case 23:
        return 7;
    case 24:
        return 8;
    case 25:
        return 9;
    case 31:
    case 32:
        return 10;
    case 33:
        return 11;
    case 34:
    case 35:
        return 12;
    case 41:
    case 42:
    case 43:
    case 44:
    case 45:                
        return 13;
    default:
        return 19; // crickets
    }
}

var plane_directions = ["north","south","east","west"];
var all_directions = ["north","south","east","west","up","down"];

dataMatrix = function(){
    var data = new Array(1920);
    for (var n=0;n<1920;n++){
        data[n] = new Array(1080);
        data[n].fill(0);
    }  
    return data;
} 

volumeEstimator = function(){  
    var traffic = new dataMatrix();
    var trains = new dataMatrix();
    var industrial = new dataMatrix();
    var traffic_type = new dataMatrix();
    var avg_height = new dataMatrix();
    var construction_sites = new Array();
    var leisure_sites = new Array();
    var special_sites = new Array();
    let x_bounds = 4574934.60525;
    let y_bounds = 423032.210894;
    let angle = 0.803923213179;
    let co=Math.cos(angle);
    let si=Math.sin(angle);
    let x_min= 5511.11111111, x_max = 18488.8888889;
    let y_min=-5100, y_max = 2200;
    let cell_length = 6.75925925926;
    let max_dB= 85.0, max_volume = 1.0;
    let sites_volume = {
        "construction": (Math.pow( 50 /10.0,10)),
        "leisure": (Math.pow( 70 /10.0,10))
    };
    let background_volume = 65;
    let background_intensity = (Math.pow( background_volume /10.0,10));
    let NUM_SAMPLES = 6;

    let getTrafficVolume = function(nx,ny){
        let vol=0, sam=0;
        if (nx>=0 && ny>=0 && nx < 1920 && ny < 1080) {
            //vol = Math.min(max_volume,traffic[nx][ny]/max_dB);
            vol = Math.pow(traffic[nx][ny]/10.0,10);
            sam = sample_num_from_traffic_type ( traffic_type[nx][ny] );
        }
        return [sam,vol];
    };

    let singular_places = [
        {name: "construction", data: construction_sites},
        {name: "leisure", data: leisure_sites},
        {name: "special", data: special_sites}
    ];

    var volume = function(user_x,user_y,user_z) {
        // Rotate and shrink x,y, then digitize
        let rx = user_y-x_bounds, ry = user_x-y_bounds; // NOTICE THAT X AND Y ARE EXCHANGED
        let x = co * rx + si * ry, y = -si * rx + co * ry;
        let nx = Math.max(0,Math.min(1920-1,Math.round((x-x_min)/cell_length)));
        let ny = Math.max(0,Math.min(1080-1,Math.round((y-y_min)/cell_length))); 
        let deltanxny = { 
            "north": [nx,ny+1], 
            "south": [nx,ny-1], 
            "east": [nx+1,ny],
            "west": [nx-1,ny]                   
        };
        
        let volumes = {};
        all_directions.forEach(function(dir){
            volumes[dir]=new Array(sample_list.length);;
            volumes[dir].fill(0.0);
        });        
        /**
         * for each directions
         *   get traffic type -> this selects sample
         *   get volume
         */
        plane_directions.forEach(function(dir){
            let pos = deltanxny[dir];
            // Get traffic volume/type
            let source_volume = getTrafficVolume(pos[0], pos[1]);
            volumes[dir][source_volume[0]]+=source_volume[1];
            // Get constructions/leisure
            volumes[dir][sample_numbers.industrial] += Math.pow(industrial[nx][ny]/10.0,10); //Math.min(max_volume,construction[nx][ny]/max_dB);;
            volumes[dir][sample_numbers.trains] += Math.pow(trains[nx][ny]/10.0,10);// Math.min(max_volume,leisure[nx][ny]/max_dB);;
        });        
        /** 
         * loop over bars and constructions 
         *   get volume of near ones, put in corresponding samples 
         **/    
        singular_places.forEach(function(place_type){
            place_type.data.forEach(function(s){
                let s_vol = sites_volume[place_type];
                let dx = (s.x-x), dy = (s.y-y);
                let r2 = dx*dx+dy*dy; // Intensity is proportional to 1/r^2       
                if (r2 < 3600) { //Distance in meters to sound source -- 60 mts reduces to 2.4% 
                    console.log("in");
                    let alpha = Math.atan2(y,x);
                    let cos = Math.cos(alpha);
                    let sin = Math.sin(alpha);
                    if (dx>=0 && dy>=0) { // north east
                        volumes["east"][s.sample_number] += s_vol*cos*cos/r2; //cos^2
                        volumes["north"][s.sample_number] += s_vol*sin*sin/r2; //sin^2                    
                    }
                    else if (dx>=0 && dy<0) { // south east
                        volumes["east"][s.sample_number] += s_vol*cos*cos/r2; //cos^2
                        volumes["south"][s.sample_number] += s_vol*sin*sin/r2; //sin^2                    
                    }
                    else if (dx<0 && dy<0) { // south west
                        volumes["west"][s.sample_number] += s_vol*cos*cos/r2; //cos^2
                        volumes["south"][s.sample_number] += s_vol*sin*sin/r2; //sin^2                    
                    }
                    else if (dx<0 && dy>=0) { // north west
                        volumes["west"][s.sample_number] += s_vol*cos*cos/r2; //cos^2
                        volumes["north"][s.sample_number] += s_vol*sin*sin/r2; //sin^2                    
                    }
                }
            });
        });
        // estimate y range -- ocean, city, mountain
        volumes["north"][sample_numbers["mountain"]] = background_intensity/(1.0+Math.exp(-(130-ny)/10));  // ny < 130
        volumes["south"][sample_numbers["ocean"]] = background_intensity/(1.0+Math.exp(-(ny-1000)/10));;  // 1000   
        // We convert sound intensity to dB
        all_directions.forEach(function(dir){
            for (var n=0;n<volumes[dir].length;n++){
                volumes[dir][n] = volumes[dir][n]>1.0e-12 ? Math.min ( max_volume, (Math.log10(volumes[dir][n])*10) / max_dB)  : 0.0;
            }
        });
        // Estimate z range and move sounds to up or down accordingly
        let ATTENUATION_THRESHOLD = 100; // meters
        let z_loc = (user_z - avg_height[nx][ny])/ATTENUATION_THRESHOLD;        
        let updown_factor = Math.pow( Math.sin(Math.min(1,Math.abs(z_loc))*Math.PI/2.0), 6);
        console.log("attenuation factor: "+updown_factor);
        var direction_to_boost = z_loc>=0 ? "down" : "up";
        for (var n=0;n<volumes[direction_to_boost].length;n++) {
            nvolume = 0.0;
            plane_directions.forEach(function(d){
                nvolume += volumes[d][n];
                volumes[d][n] = (1-updown_factor)*volumes[d][n];
            })
            volumes[direction_to_boost][n] = updown_factor*nvolume;                
        }
        // add wind and subterranean noise        
        volumes["up"][sample_numbers["wind"]] = z_loc>=0 ? updown_factor : 0;
        volumes["down"][sample_numbers["subterranean"]] = z_loc<=0 ? updown_factor : 0;
        console.log("Z difference: "+z_loc);
        console.log("up noise: "+volumes["up"][sample_numbers["wind"]])
        console.log("down noise: "+volumes["down"][sample_numbers["subterranean"]]);
        return volumes; 
    }   

    d3.text("data/1920_noise_kernelized_total.csv", function(error,string){
      if (error) throw error;
      data = d3.csvParseRows(string);
        for (var x=0;x<data.length;x++){
            for (var y=0;y<data[x].length;y++){
                traffic[x][y] = +data[x][y];
            }
        }
        console.log("traffic done");
    });
    d3.text("data/1920_noise_kernelized_train.csv", function(error,string){
      if (error) throw error;
      data = d3.csvParseRows(string);
        for (var x=0;x<data.length;x++){
            for (var y=0;y<data[x].length;y++){
                trains[x][y] = +data[x][y];
            }
        }
        console.log("trains done");
    });    
    d3.text("data/1920_noise_kernelized_industrial.csv", function(error,string){
      if (error) throw error;
      data = d3.csvParseRows(string);
        for (var x=0;x<data.length;x++){
            for (var y=0;y<data[x].length;y++){
                industrial[x][y] = +data[x][y];
            }
        }
        console.log("industry done");
    });    
    d3.text("data/1920_traffic_level_in_pixel.csv", function(error,string){
      if (error) throw error;
      data = d3.csvParseRows(string);
        for (var x=0;x<data.length;x++){
            for (var y=0;y<data[x].length;y++){
                traffic_type[x][y] = +data[x][y];
            }
        }
        console.log("type of traffic done");
    }); 
    d3.text("data/1920_average_height.csv", function(error,string){
      if (error) throw error;
      data = d3.csvParseRows(string);
        for (var x=0;x<data.length;x++){
            for (var y=0;y<data[x].length;y++){
                avg_height[x][y] = +data[x][y];
            }
        }
        console.log("type of traffic done");
    });     
    d3.csv("data/constructions_data.csv", function(error,data){
      if (error) throw error;
      data.forEach(function(d){
          construction_sites.push({x: +d.x,y: +d.y, sample_number: sample_numbers["construction"]});
      });
    console.log("constructions done");
    });  
    d3.csv("data/leisure_data.csv", function(error,data){
      if (error) throw error;
      data.forEach(function(d){
          leisure_sites.push({x: +d.x, y: +d.y, sample_number: sample_numbers["leisure"]});
      });
    console.log("leisure done");      
    });  
/*
    leisure_data
    constructions_data
*/
    return volume;    
}


function erf(x) {
    // constants
    var a1 =  0.254829592;
    var a2 = -0.284496736;
    var a3 =  1.421413741;
    var a4 = -1.453152027;
    var a5 =  1.061405429;
    var p  =  0.3275911;

    // Save the sign of x
    var sign = 1;
    if (x < 0) {
        sign = -1;
    }
    x = Math.abs(x);

    // A&S formula 7.1.26
    var t = 1.0/(1.0 + p*x);
    var y = 1.0 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*Math.exp(-x*x);

    return sign*y;
}
