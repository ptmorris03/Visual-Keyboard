//canvas will display 1/zoom seconds of data
var zoom = 21.5;

function simHertz(hz) {
    var audio = new Audio();
    var wave = new RIFFWAVE();
    var data = [];

    wave.header.sampleRate = 44100;

    var seconds = 8;

    for (var i = 0; i < wave.header.sampleRate * seconds; i ++) {
        data[i] = Math.round(128 + (30 - (20 * Math.pow(Math.abs((i % (wave.header.sampleRate/8)) - (wave.header.sampleRate / 16))/(wave.header.sampleRate/16),2))) * Math.sin(i * 2 * Math.PI * hz / wave.header.sampleRate));
        //data[i] = Math.round(128 + 20 * Math.sin(i * 2 * Math.PI * hz / wave.header.sampleRate));
    }

    wave.Make(data);
    audio.src = wave.dataURI;
    return audio;
}

var freqs = {
    "A3": 220,
    "Bb": 233.08,
    "B" : 246.94,
    "C" : 261.643,
    "Db": 277.18,
    "D" : 293.66,
    "Eb": 311.13,
    "E" : 329.63,
    "F" : 349.23,
    "Gb": 369.99,
    "G" : 392,
    "Ab": 415.30,
    "A4": 440
}

var notes = {
    "A3": simHertz(freqs["A3"]),
    "Bb": simHertz(freqs["Bb"]),
    "B" : simHertz(freqs["B" ]),
    "C" : simHertz(freqs["C" ]),
    "Db": simHertz(freqs["Db"]),
    "D" : simHertz(freqs["D" ]),
    "Eb": simHertz(freqs["Eb"]),
    "E" : simHertz(freqs["E" ]),
    "F" : simHertz(freqs["F" ]),
    "Gb": simHertz(freqs["Gb"]),
    "G" : simHertz(freqs["G" ]),
    "Ab": simHertz(freqs["Ab"]),
    "A4": simHertz(freqs["A4"])
}

var keys = {
    81 : false,
    87 : false,
    69 : false,
    82 : false,
    84 : false,
    89 : false,
    85 : false,
    73 : false,
    79 : false,
    80 : false,
    219: false,
    221: false,
    220: false
}

var keyToNote = {
    81 : "A3",
    87 : "Bb",
    69 : "B",
    82 : "C",
    84 : "Db",
    89 : "D",
    85 : "Eb",
    73 : "E",
    79 : "F",
    80 : "Gb",
    219: "G",
    221: "Ab",
    220: "A4"
}

var validKeys = Object.keys(keys);

function play(note) {
    notes[note].play();
}

function stop(note) {
    if(!notes[note].paused){
        notes[note].pause();
        notes[note].currentTime = 0;
    }
}

function stopAll() {
    for(var Note in notes){
        if(!notes[Note].paused){
            notes[Note].pause();
            notes[Note].currentTime = 0;
        }
    }
}

function getAmplitudeAtTime(time, note) {
    var i = time * 44100;
    var hz = freqs[note];
    return Math.round(128 + (30 - (20 * Math.pow(Math.abs((i % (44100/8)) - (44100 / 16))/(44100/16),2))) * Math.sin(i * 2 * Math.PI * hz / 44100));
}

document.onkeydown = function(e){
    if(validKeys.indexOf(e.keyCode.toString()) > -1 && keys[e.keyCode] === false){
        play(keyToNote[e.keyCode]);
        document.getElementById(keyToNote[e.keyCode]).style.backgroundColor = "blue";
    }
    keys[e.keyCode] = true;
    
    if(e.keyCode === 38){
        zoom = Math.max(1, zoom * 0.9);
        document.getElementById("num").innerHTML = (1/zoom).toString();
    }else if(e.keyCode === 40){
        zoom = Math.min(1000, zoom * 1.1);
        document.getElementById("num").innerHTML = (1/zoom).toString();
    }
};

document.onkeyup = function(e){
    if(validKeys.indexOf(e.keyCode.toString()) > -1){
        stop(keyToNote[e.keyCode]);
        keys[e.keyCode] = false;
        if(keyToNote[e.keyCode].slice(-1) === "b"){
            document.getElementById(keyToNote[e.keyCode]).style.backgroundColor = "black";
        }else{
            document.getElementById(keyToNote[e.keyCode]).style.backgroundColor = "white";
        }
    }
};

//######################################################

//create canvas
var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");

//set canvas background
var background = c.createLinearGradient(0,0,0,canvas.height);
background.addColorStop(0, "gray");
background.addColorStop(0.5, "white");
background.addColorStop(1, "gray");
c.fillStyle = background;
c.fillRect(0,0,canvas.width,canvas.height);

//create "pixel drawer" a 1x1 image data object
var drawer = c.createImageData(3, 3);

function drawPixel(x, y, r, g, b){
    drawer.data[0] = drawer.data[4] = drawer.data[8] = drawer.data[12] = drawer.data[16] = drawer.data[20] = drawer.data[24] = drawer.data[28] = drawer.data[32] = r;
    drawer.data[1] = drawer.data[5] = drawer.data[9] = drawer.data[13] = drawer.data[17] = drawer.data[21] = drawer.data[25] = drawer.data[29] = drawer.data[33] = g;
    drawer.data[2] = drawer.data[6] = drawer.data[10] = drawer.data[14] = drawer.data[18] = drawer.data[22] = drawer.data[26] = drawer.data[30] = drawer.data[34] = b;
    drawer.data[3] = drawer.data[7] = drawer.data[11] = drawer.data[15] = drawer.data[19] = drawer.data[23] = drawer.data[27] = drawer.data[31] = drawer.data[35] = 255;
    c.putImageData(drawer, x*2, y);
}

function drawAmplitude(){
    c.clearRect(0, 0, canvas.width, canvas.height);
    var slice = (44100 / zoom) / (canvas.width / 2);
    var time = 0;
    for(var i = 0; i < (canvas.width / 2); ++i){
        var amp = 128;
        for(var key in validKeys){
            if(keys[validKeys[key]] === true){
                amp += getAmplitudeAtTime(notes[keyToNote[validKeys[key]]].currentTime + time, keyToNote[validKeys[key]]) - 128;
            }
        }
        drawPixel(i, amp, 255, Math.pow(2*Math.abs(amp-128),2)/255, Math.pow(2*Math.abs(amp-128),2)/510);
        time += slice;
    }
}

setInterval(function() {drawAmplitude();},33);

document.getElementById("num").innerHTML = (1/zoom).toString();