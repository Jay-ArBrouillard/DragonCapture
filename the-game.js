// the-game.js
/*
    Author: Jay-Ar Brouillard
    Extra Features/ GGW points:
    - Dragon Mesh with a dynamically changing color gradient Blue to Red based on X coordinate
    - Rotating players/ Ability to toggle rotating off and on
    - Respawning the boosts in new locations. Rise them from the floor.
    - Ironman and Thanos textures for the hero and Villain, respectively
    - In game sound effects for hero, villain, dragon, and other aspects.
    - Chat box to give valuable information about the game state
    - Ability to toggle from 1st person to overhead perspective (Press "r")
    - Confetti and "Pow" visual effects when scoring and getting attacked by the opponent
    - Villain  AI fairly smart: Villain will grab nearby boosts worth getting and avoid the Hero in some circumstances (See Hero.js line 68-152)
    - Dragon will "evade" the players trying to capture him about 10% of the time

*/

var g2;
var gl;
var swapPerspective = false;
var killedWithDragon;
// constants
const K = {
    arenaSize: 300,
    wallHeight: 20,
    speed: {
        hero: 0.6,
        villain: 0.6,
        dragon: 0.6,
        rats: 0.3,
        clouds: 0.05,
        carryMul: 0.75,
        boostMul: 2,
        turn: 2,
    },
    aiSmartTurn: false,
    bumpDistance: 4,
    time: {
        pow: 30,
        confetti: 60,
        booster: 120,
    },
    eye: {
        x: 20,
        y: 7,
        z: 20,
    },
    perspective: {
        fovX: 90,
        near: 1.5,
        far: 800,
    },
    display321: true,
    aspectRatio: {
        min: 1.0,
        max: 3.0,
        board: 8,
    },
};
// global variables in a variable for convenience
var G = {
    canvasDiv: null,
    canvas: null,
    canvas2: null,
    program: {
        id: null,
        // uniform
        u: {
            viewMatrix: null,
            modelViewMatrix: null,
            projectionMatrix: null,
            normalMatrix: null,
            textureMatrix: null,
            texture: null,
            lightPosition: null,
            ambient: null,
            diffuse: null,
            specular: null,
            shininess: null,
            glow: null,
        },
        // attribute
        a: {
            position: -1,
            normal: -1,
            texCoord: -1,
        },
        viewMatrix: mat4(),
        light: {
            position: null,
            ambient: null,
            diffuse: null,
            specular: null,
            shininess: null,
        }
    },
    objects: {
        pedestal: null,
        ground: null,
        wall: null,
        hero: null,
        heroGoalBottom: null,
        heroGoalTop: null,
        villain: null,
        villainGoalBottom: null,
        villainGoalTop: null,
        target: null,
        fireAttacks: {
            attacks: [],
            heightDecrement: [],
            inMotion: [],
            aim: [],
            target: [],
        },
        booster0: null,
        booster1: null,
        booster2: null,
        booster3: null,
        booster4: null,
        rats: null,
        clouds: [],
        light: null,
        sky: null,
        rock: {
            rock: null,
            inMotion: false,
            dir: null,
        },
        rocket: {
            rocket: null,
            fire: null,
            explosion: [],
        }
    },
    score: {
        hero: 0,
        villain: 0,
    },
    fps: {
        t0: 0, t1: 0, count: 0, sum: 0, accumulated: 0, display: 0, i: 0,
    },
    keys: [],
    toggleHeroSpin: true,
    heroSpin: null,
    gameSpin: null,
    pause: false,
    boosters: null,
    shrinkDragon: false,
    dragonScale: 100,
    numBoosts: 5,
    pow: {
        image: null,
        counter: 0,
        onDone: null,
    },
    confetti: {
        image: null,
        counter: 0,
        onDone: null,
    },
    overlay: null,
    boostImage: null,
    dragonImage: null,
    rainbowHeartImage: null,
    ironManImage: null,
    thanosImage: null,
    heartImage: null,
    fireBallImage: null,
    heroSound: null,
    villainSound: null,
    teleportSound: null,
    dragonFlying: null,
    shrinkSound: null,
    boostSound: null,
    yaySound: null,
    playerBumpSound: null,
    wallBumpSound: null,
    squelchSound: null,
    explosionSound: null,
    ratsMove: false,
    explosionDone: false,
    fireAttackAmmo: [],
    //Section to keep track of scoreBoard data
    teleportThreshold: 1.0,
    teleportStatus: null,
    fireBallStatus: null,
    prevHeroHealth: 3,
    prevVillainHealth: 3,
    prevDragonHealth: 3,
    prevBoostCount: 3,
    prevHeroScore: 0,
    prevVillainScore: 0,
    prevTeleportStatus: null,
    prevFireAttacksReady: null,


};
let _1stTime = true;
window.onload = function () {
    G.canvasDiv = document.getElementById("canvasDiv");
    G.canvasDiv.oldWidth = 0;
    G.canvasDiv.oldHeight = 0;
    // 2d
    G.canvas2 = document.getElementById("2d-canvas");
    g2 = G.canvas2.getContext("2d");
    g2.font = "16px consolas,monospace";
    g2.fillStyle = "white";
    // 3d
    G.canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(G.canvas);
    //gl = WebGLDebugUtils.makeDebugContext(G.canvas.getContext("webgl")); // For debugging
    if (!gl) {
        alert("WebGL isn't available");
    }
    // Configure WebGL
    gl.clearColor(0.2, 0.2, 0.2, 1.0);
    gl.enable(gl.DEPTH_TEST);
    // Load shaders and initialize attribute buffers
    const program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    initProgram(program);
    // load images
    G.pow.image = loadImage("assets/pow.png");
    G.confetti.image = loadImage("assets/confetti.png");
    G.overlay = loadImage("assets/Overlay.png");
    G.boostImage = loadImage("assets/boostImage.png");
    G.dragonImage = loadImage("assets/dragonImage.png");
    G.rainbowHeartImage = loadImage("assets/rainbowHeart.png");
    G.ironManImage = loadImage("assets/ironmanImage.png");
    G.thanosImage = loadImage("assets/thanosImage.png");
    G.heartImage = loadImage("assets/pixelHeart.png");
    G.fireBallImage = loadImage("assets/fireBall.png");
    // initialize game
    G.squelchSound = new Audio("sounds/squelch.mp3");
    villainSound = new Audio("sounds/VillainDied.mp3");
    heroSound = new Audio("sounds/HeroDied.mp3");
    teleportSound = new Audio("sounds/teleport.mp3");
    teleportSound.volume = 0.33;
    dragonFlying = new Audio("sounds/dragonFlying.mp3");
    G.shrinkSound = new Audio("sounds/shrink2.mp3");
    G.shrinkSound.volume = 0.33;
    boostSound = new Audio("sounds/boost.mp3");
    boostSound.volume = 0.2;
    yaySound = new Audio("sounds/Yay.mp3");
    yaySound.volume = .2;
    playerBumpSound = new Audio("sounds/playerBump.mp3");
    wallBumpSound = new Audio("sounds/wallBump.mp3");
    explosionSound = new Audio("sounds/explosion.mp3");

    //Mute game sounds
    /*document.getElementById("mute").onclick = function () {
        heroSound.muted = !heroSound.muted;
        villainSound.muted = !villainSound.muted;
        teleportSound.muted = !teleportSound.muted;
        dragonFlying.muted = !dragonFlying.muted;
        G.shrinkSound.muted = !G.shrinkSound.muted;
        boostSound.muted = !boostSound.muted;
        yaySound.muted = !yaySound.muted;
        wallBumpSound.muted = !wallBumpSound.muted;
        playerBumpSound.muted = !playerBumpSound.muted;
        explosionSound.muted = !explosionSound.muted;
        yaySound.muted ? document.getElementById("mute").innerHTML = "&#128263" :
            document.getElementById("mute").innerHTML = "&#128264";
    };
    */

    init();
    reset(true, true, true, true, true, false);
    requestAnimFrame(tick);
};
function tick(time) {
    G.fps.t0 = G.fps.t1; // previous time
    G.fps.t1 = time / 1000; // current time
    const dt = Math.min(0.1, G.fps.t1 - G.fps.t0); // avoid skip too many frames
    G.fps.sum += dt;
    G.fps.count++;
    // update fps display every second
    if (G.fps.sum >= 1) {
        G.fps.display = Math.round(G.fps.count / G.fps.sum);
        G.fps.sum = 0;
        G.fps.count = 0;
    }
    G.fps.accumulated += dt;

    // frame skip
    while (G.fps.accumulated >= 1.0 / 60) {
        if (!G.pause) {

            if (G.pow.counter > 0) {
                G.pow.counter--;
                if (G.pow.counter <= 0) {
                    G.pow.onDone();
                    G.pow.onDone = null;
                }
            }
            if (G.confetti.counter > 0) {
                G.confetti.counter--;
                if (G.confetti.counter <= 0) {
                    G.confetti.onDone();
                    G.confetti.onDone = null;
                }
            }

            if ((G.pow.counter <= 0) && (G.confetti.counter <= 0)) {
                G.fps.i++;
                update();
            }
        }
        G.fps.accumulated -= 1.0 / 60;
    }
    draw();
}
// Key listener
window.onkeydown = function (event) {
    G.keys[event.keyCode] = true;
    if (event.keyCode == 80) {
        G.pause = !G.pause;
    } else if (event.keyCode == 86) {
        K.speed.villain == 0.6 ? K.speed.villain = 0.0 : K.speed.villain = 0.6;
    } else if (event.keyCode == 82) {
        swapPerspective = !swapPerspective;
    } else if (event.keyCode == 70) {
        dropObject();
    } else if (event.keyCode == 84) {   //Toggle hero spinning
        G.toggleHeroSpin = !G.toggleHeroSpin;
    } else if (event.keyCode == 32 &&
        G.score.hero - 3 >= G.score.villain ||
        G.score.villain - 3 >= G.score.hero) { //Game over restart game
        K.speed.villain = 0.6;
        G.score.hero = 0;
        G.score.villain = 0;
        K.display321 = true;
        reset(true, true, true, true, true, true);
    } else if (event.keyCode == 32 && distance(G.objects.hero.x, G.objects.hero.z, G.objects.rock.rock.x, G.objects.rock.rock.z) <= 7) {
        G.objects.hero.fuelCell = G.objects.rock.rock;
    }
};
window.onkeyup = function (event) {
    G.keys[event.keyCode] = false;
};
// game
function init() {
    if (!G.objects.ground) {
        // create objects
        G.objects.ground = new Ground();
        G.objects.wall = new Wall();
        //Randomly place Rat pedestal on outer wall
        const random = Math.random();
        G.objects.pedestal = new Pedestal(0, 0, 0, 0, "assets/pedestal.png");
        if (random < 0.25) {  //Build pedestal on North Wall
            G.objects.pedestal.z = 20;
            G.objects.pedestal.x = Math.floor(Math.random() * (275 - 15 + 1) + 15);
            G.objects.pedestal.degrees = 0;
        } else if (random < 0.5) { //Build pedestal on South Wall
            G.objects.pedestal.z = 280;
            G.objects.pedestal.x = Math.floor(Math.random() * (275 - 15 + 1) + 15);
            G.objects.pedestal.degrees = 180;
        } else if (random < 0.75) { //Build pedestal on West Wall
            G.objects.pedestal.x = 20;
            if (random < 0.625) {  //Build above player goals
                G.objects.pedestal.z = Math.floor(Math.random() * (128 - 20 + 1) + 20);
                G.objects.pedestal.degrees = 90;
            } else {    //Build below player goals
                G.objects.pedestal.z = Math.floor(Math.random() * (278 - 172 + 1) + 172);
                G.objects.pedestal.degrees = 90;
            }
        } else { //Build pedestal on East Wall
            G.objects.pedestal.x = 280;
            if (random < 0.875) {  //Build above player goals
                G.objects.pedestal.z = Math.floor(Math.random() * (128 - 20 + 1) + 20);
                G.objects.pedestal.degrees = 270;
            } else {    //Build below player goals
                G.objects.pedestal.z = Math.floor(Math.random() * (278 - 172 + 1) + 172);
                G.objects.pedestal.degrees = 270;
            }
        }

        G.objects.rats = new Rat(G.objects.pedestal.x, 0, G.objects.pedestal.z, 0, "assets/ratTexture.png");
        G.objects.hero = new Hero(24, 0, K.arenaSize, 0, "assets/hero.png");
        G.objects.heroGoalBottom = new Cylinder10uR(12, -11.9, K.arenaSize / 2, 180, "assets/BarrierBlue.png");
        G.objects.heroGoalTop = new Cylinder10uR(12, 4, K.arenaSize / 2, 180, "assets/BarrierBlue.png");
        G.objects.villain = new Villain(K.arenaSize - 24, 0.0, K.arenaSize / 2, 180, "assets/villain.png");
        G.objects.villainGoalBottom = new Cylinder10uR(K.arenaSize - 12, -11.9, K.arenaSize / 2, 0, "assets/BarrierRed.png");
        G.objects.villainGoalTop = new Cylinder10uR(K.arenaSize - 12, 4, K.arenaSize / 2, 0, "assets/BarrierRed.png");
        G.objects.target = new Dragon(150, Math.floor(Math.random() * 10) + 30, 150, 0, "assets/rainbowSpiral.png");

        var numClouds = Math.floor(Math.random() * 10) + 5;
        for (var i = 0; i < numClouds; i++) {
            G.objects.clouds.push(new Cloud(Math.random() * 300, Math.random() * 45 + 20, Math.random() * 300, Math.random() * 360, "assets/cloudTexture.png"));
        }

        G.objects.rocket.rocket = new Rocket(Math.random() * (200 - 100) + 100, -9, Math.random() * (200 - 100) + 100, 0, "assets/camo.png");
        G.objects.rock.rock = new Rock(100, 1, 100, 0, "assets/rockTexture.png");
        G.objects.booster0 = new FuelCell(Math.random() * 100 + 100, -1.7, Math.random() * 100, 0, "assets/Booster.png"); //Quadrant 1
        G.objects.booster1 = new FuelCell(Math.random() * 100, -1.7, Math.random() * 100, 0, "assets/Booster.png");   //Quadrant 2
        G.objects.booster2 = new FuelCell(Math.random() * 100, -1.7, Math.random() * 100 + 100, 0, "assets/Booster.png");   //Quadrant 3
        G.objects.booster3 = new FuelCell(Math.random() * 100 + 100, -1.7, Math.random() * 100 + 100, 0, "assets/Booster.png");   //Quadrant 4
        G.objects.booster4 = new FuelCell(Math.random() * 100 + 100, -1.7, Math.random() * 100 + 50, 0, "assets/Booster.png");   //Center Square
        G.objects.light = new Sun(150, 70, 150, 90, "assets/sun.png");   //Center
        G.boosters = [G.objects.booster0, G.objects.booster1, G.objects.booster2, G.objects.booster3, G.objects.booster4];
        // set lights: target, boosters, hero, villain
        G.program.light.position = [
            [G.objects.booster0.x, 2, G.objects.booster0.z, 1],
            [G.objects.booster1.x, 2, G.objects.booster1.z, 1],
            [G.objects.booster2.x, 2, G.objects.booster2.z, 1],
            [G.objects.booster3.x, 2, G.objects.booster3.z, 1],
            [G.objects.booster4.x, 2, G.objects.booster4.z, 1],
            [G.objects.light.x, G.objects.light.y, G.objects.light.z, 1],
            [G.objects.villainGoalTop.x, 10, G.objects.villainGoalTop.z, 1],
            [G.objects.heroGoalTop.x, 10, G.objects.heroGoalTop.z, 1],
            [G.objects.target.x, G.objects.target.y, G.objects.target.z, 1],
        ];
        G.program.light.ambient = [
            [0.2, 0.2, 0.2, 1.0],
            [0.0, 0.0, 0.0, 0.5],
            [0.0, 0.0, 0.0, 0.5],
            [0.0, 0.0, 0.0, 0.5],
            [0.0, 0.0, 0.0, 0.5],
            [0.0, 0.0, 0.0, 0.5],
            [0.1, 0.1, 0.1, 1.0],
            [0.1, 0.1, 0.1, 1.0],
            [0.0, 0.0, 0.0, 0.5],

        ];
        G.program.light.diffuse = [
            [0.0, 0.01, 0.0, 1.0],
            [0.0, 0.01, 0.0, 1.0],
            [0.0, 0.01, 0.0, 1.0],
            [0.0, 0.01, 0.0, 1.0],
            [0.0, 0.01, 0.0, 1.0],
            [0.89, 0.67, 0.34, 1.0],
            [0.15, 0.0, 0.0, 1.0],
            [0.0, 0.0, 0.15, 1.0],
            [0.0, 0.0, 0.05, 1.0],

        ];
        G.program.light.specular = [
            [0.0, 0.01, 0.0, 1.0],
            [0.0, 0.01, 0.0, 1.0],
            [0.0, 0.01, 0.0, 1.0],
            [0.0, 0.01, 0.0, 1.0],
            [0.0, 0.01, 0.0, 1.0],
            [0.89, 0.67, 0.34, 1.0],
            [0.15, 0.0, 0.0, 1.0],
            [0.0, 0.0, 0.15, 1.0],
            [0.0, 0.0, 0.05, 1.0],

        ];
        G.program.light.shininess = [300, 300, 300, 300, 75, 75];
    }
    G.objects.sky = new Sky("assets/sky.jpg");
}

function dropObject() {
    if (G.objects.hero.fuelCell == G.objects.target) {
        const dropX = G.objects.hero.x - Math.sin(radians(G.heroSpin)) * (G.objects.hero.bounding_cir_rad + 5);
        const dropZ = G.objects.hero.z - Math.cos(radians(G.heroSpin)) * (G.objects.hero.bounding_cir_rad + 5);
        G.objects.hero.fuelCell = null;
        G.objects.target = new Dragon(dropX, 0, dropZ, 0, "assets/rainbowSpiral.png");
        G.objects.target.scale = 20;
    } else if (G.objects.hero.fuelCell == G.objects.rock.rock) {
        G.objects.rock.inMotion = true;
        const dropX = G.objects.hero.x - Math.sin(radians(G.heroSpin)) * (G.objects.hero.bounding_cir_rad + 5);
        const dropZ = G.objects.hero.z - Math.cos(radians(G.heroSpin)) * (G.objects.hero.bounding_cir_rad + 5);
        G.objects.rock.rock.x = dropX;
        G.objects.rock.rock.y = 1;
        G.objects.rock.rock.z = dropZ;
    }

    G.objects.hero.fuelCell = null;
}

// reset objects position and direction
function reset(frameCounter, targetPos, hero, villain, booster, dragon) {
    if (frameCounter) {
        G.fps.i = -1;
    }
    var startingPositions = [[25, 100, 175, 100], [25, 175, 175, 25], [25, 25, 175, 175], [50, 100, 150, 100]];

    var pos;
    if (killedWithDragon) {    //If killed with the dragon, spawn in a random position in semicircle in front of your own goal
        var tempDegrees = [Math.random() * 90, Math.random() * 90 + 270, Math.random() * 180 + 90]; //Gets a value between 0-90 degrees, 270-360 degrees, and 90-270degrees
        var degree = tempDegrees[Math.floor(Math.random() * 2)];
        var heroX = Math.floor((Math.random() * 30 + 10) * Math.cos(radians(degree))) + 20;
        var heroY = Math.floor((Math.random() * 30 + 10) * Math.sin(radians(degree))) + 100;
        var villainX = Math.floor((Math.random() * 30 + 10) * Math.cos(radians(tempDegrees[2])) + 180);
        var villainY = Math.floor((Math.random() * 30 + 10) * Math.sin(radians(tempDegrees[2])) + 100);
        startingPositions.push([heroX, heroY, villainX, villainY]);
        pos = 4;
        killedWithDragon = false;
    } else {    //
        pos = Math.floor(Math.random() * 4);
    }

    if (hero) {
        G.objects.hero.degrees = 0;
        G.objects.hero.xdir = 1;
        G.objects.hero.zdir = 0;
        G.objects.hero.fuelCell = null;
        G.objects.hero.boosterCounter = 0;
        for (; ;) {
            G.objects.hero.x = startingPositions[pos][0];
            G.objects.hero.z = startingPositions[pos][1];
            if (villain || !G.objects.hero.isCollide(G.objects.villain)) {
                break;
            }
        }
    }
    if (villain) {
        G.objects.villain.degrees = 180;
        G.objects.villain.xdir = -1;
        G.objects.villain.zdir = 0;
        G.objects.villain.fuelCell = null;
        G.objects.villain.boosterCounter = 0;
        for (; ;) {
            G.objects.villain.x = startingPositions[pos][2];
            G.objects.villain.z = startingPositions[pos][3];
            if (hero || !G.objects.hero.isCollide(G.objects.villain)) {
                break;
            }
        }
    }
    if (G.objects.hero.fuelCell == null && G.objects.villain.fuelCell == null) {
        if (targetPos) {
            for (; ;) {
                G.objects.target.x = (0.25 + Math.random() * 0.5) * K.arenaSize;
                G.objects.target.z = (0.25 + Math.random() * 0.5) * K.arenaSize;
                let ok = true;
                for (const b of G.boosters) {
                    if (G.objects.target.isCollide(b)) {
                        ok = false;
                        break;
                    }
                }
                if (ok) {
                    break;
                }
            }

        }
    }

    if (booster) {
        G.objects.booster0 = new FuelCell(Math.random() * 100 + 100, -1.7, Math.random() * 100, 0, "assets/Booster.png"); //Quadrant 1
        G.objects.booster1 = new FuelCell(Math.random() * 100, -1.7, Math.random() * 100, 0, "assets/Booster.png");   //Quadrant 2
        G.objects.booster2 = new FuelCell(Math.random() * 100, -1.7, Math.random() * 100 + 100, 0, "assets/Booster.png");   //Quadrant 3
        G.objects.booster3 = new FuelCell(Math.random() * 100 + 100, -1.7, Math.random() * 100 + 100, 0, "assets/Booster.png");   //Quadrant 4
        G.objects.booster4 = new FuelCell(Math.random() * 100 + 100, -1.7, Math.random() * 100 + 50, 0, "assets/Booster.png");   //Center Square
        G.boosters = [G.objects.booster0, G.objects.booster1, G.objects.booster2, G.objects.booster3, G.objects.booster4];
        G.program.light.position[0] = [G.objects.booster0.x, 2, G.objects.booster0.z, 1];
        G.program.light.position[1] = [G.objects.booster1.x, 2, G.objects.booster1.z, 1];
        G.program.light.position[2] = [G.objects.booster2.x, 2, G.objects.booster2.z, 1];
        G.program.light.position[3] = [G.objects.booster3.x, 2, G.objects.booster3.z, 1];
        G.program.light.position[4] = [G.objects.booster4.x, 2, G.objects.booster4.z, 1];

        for (let b of G.boosters) {
            b.isVisible = true;
        }
    }

    if (dragon) {
        G.objects.target.update(false, true);
        G.objects.target.scale = 100;
        G.teleportThreshold = 1.0;
        G.objects.target = new Dragon(Math.random() * (K.arenaSize / 2), Math.floor(Math.random() * 10) + 30, Math.random() * (K.arenaSize / 2), 0, "assets/rainbowSpiral.png", G.objects.target.scale); 
    }

}

function distance(x, y, a, b) {
    return Math.sqrt((x - a) * (x - a) + (y - b) * (y - b));
}

function update() {
    if (K.display321) {
        if (G.fps.i < 3 * 60) {
            return; // 3, 2, 1
        } else {
            K.display321 = false;
        }
    }
    //Respawn boosts after 10 game seconds
    if ((G.fps.i % (10 * 60)) == 0) {
        for (var i = 0; i < G.boosters.length; i++) {
            if (!G.boosters[i].isVisible) {
                G.boosters[i].isVisible = true;
                G.boosters[i].x = Math.random() * 180 + 10;
                G.boosters[i].y = -1.7;
                G.boosters[i].z = Math.random() * 180 + 10;
                G.program.light.position[i] = [G.boosters[i].x, 2, G.boosters[i].z, 1];
                G.numBoosts++;
                break;
            }
        }
    }

    for (let booster of G.boosters) {
        if (booster.y != 0) booster.update();  //Spawn the boosters
    }

    if (G.objects.rats != null && G.ratsMove) {
        G.objects.rats.update();
    }

    G.objects.rock.rock.update(G.objects.rock.inMotion);
    G.objects.hero.update();
    G.objects.villain.update();
    if (G.objects.rocket.rocket != null)  {     //Spawn Rocket
        G.objects.rocket.rocket.update();
    }

    if (G.objects.hero.fuelCell == G.objects.target || G.objects.villain.fuelCell == G.objects.target) {
        G.objects.target.update(true, false);
    } else {
        G.objects.target.update(false, false);
    }

    for (var i = 0; i < G.objects.clouds.length; i++) {
        if (Math.random() <= G.teleportThreshold && G.objects.target.isCollide(G.objects.clouds[i], i)) {
            //Find a cloud with a big enough bound radius
            for (var j = 0; j < G.objects.clouds.length; j++) {
                if (j == i) { j++; continue; }
                if (G.objects.clouds[j].bounding_cir_rad >= G.objects.clouds[i].bounding_cir_rad) {
                    teleportSound.play();
                    G.objects.target.x = G.objects.clouds[j].x;
                    G.objects.target.z = G.objects.clouds[j].z;
                    G.objects.target.y = G.objects.clouds[j].y;
                    G.teleportThreshold -= 0.02;
                    G.objects.target.update(false, false, true);
                    break;
                }
            }

        }
        G.objects.clouds[i].update();
    }


    //Evade and Movement for Dragon AI/////////
   /* if (G.objects.hero.fuelCell == null && G.objects.villain.fuelCell == null) {
        var targetToHero = distance(G.objects.hero.x, G.objects.hero.z, G.objects.target.x, G.objects.target.z);
        var targetToVillain = distance(G.objects.villain.x, G.objects.villain.z, G.objects.target.x, G.objects.target.z);
        var rand = Math.floor(Math.random() * 8);    //0, 1, 2, 3, 4, 5, 6, 7 for N, NE, E, SE, S, SW, W, NW
        const directions = ["North", "NorthEast", "East", "SouthEast", "South", "SouthWest", "West", "NorthWest"];
        var dir = directions[rand];
        var dragonMove;
        G.objects.target.scale == 100 ? dragonMove = 15 : dragonMove = 5;
        if (G.objects.target.y <= 0 && Math.random() < G.teleportThreshold) {
            var dist;
            dragonMove == 15 ? dist = 16 : dist = 6;
            if (dragonMove == 15 && targetToHero <= dist || dragonMove == 5 && targetToHero <= dist) {
                if (G.objects.hero.boosterCounter == 0) {   //Hero isn't carrying boost
                    teleportSound.play();
                    switch (dir) {
                        case "North":
                            G.objects.target.z = G.objects.hero.z - dragonMove;
                            break;
                        case "NorthEast":
                            G.objects.target.x = G.objects.hero.x - dragonMove;
                            G.objects.target.z = G.objects.hero.z - dragonMove;
                            break;
                        case "East":
                            G.objects.target.x = G.objects.hero.x + dragonMove;
                            break;
                        case "SouthEast":
                            G.objects.target.x = G.objects.hero.x + dragonMove;
                            G.objects.target.z = G.objects.hero.z + dragonMove;
                            break
                        case "South":
                            G.objects.target.z = G.objects.hero.z + dragonMove;
                            break;
                        case "SouthWest":
                            G.objects.target.x = G.objects.hero.x - dragonMove;
                            G.objects.target.z = G.objects.hero.z + dragonMove;
                            break;
                        case "West":
                            G.objects.target.x = G.objects.hero.x - dragonMove;
                            break;
                        case "NorthWest":
                            G.objects.target.x = G.objects.hero.x - dragonMove;
                            G.objects.target.z = G.objects.hero.z - dragonMove;
                            break;
                    }
                    G.objects.target.degrees = Math.random() * 360;
                    G.teleportThreshold -= 0.02;
                }
            } else if (dragonMove == 15 && targetToVillain <= dist || dragonMove == 5 && targetToVillain <= dist) {
                if (G.objects.villain.boosterCounter == 0) { //Villain isn't carrying boost
                    //Target move away from villain
                    teleportSound.play();
                    switch (dir) {
                        case "North":
                            G.objects.target.z = G.objects.villain.z - dragonMove;
                            break;
                        case "NorthEast":
                            G.objects.target.x = G.objects.villain.x - dragonMove;
                            G.objects.target.z = G.objects.villain.z - dragonMove;
                            break;
                        case "East":
                            G.objects.target.x = G.objects.villain.x + dragonMove;
                            break;
                        case "SouthEast":
                            G.objects.target.x = G.objects.villain.x + dragonMove;
                            G.objects.target.z = G.objects.villain.z + dragonMove;
                            break
                        case "South":
                            G.objects.target.z = G.objects.villain.z + dragonMove;
                            break;
                        case "SouthWest":
                            G.objects.target.x = G.objects.villain.x - dragonMove;
                            G.objects.target.z = G.objects.villain.z + dragonMove;
                            break;
                        case "West":
                            G.objects.target.x = G.objects.villain.x - dragonMove;
                            break;
                        case "NorthWest":
                            G.objects.target.x = G.objects.villain.x - dragonMove;
                            G.objects.target.z = G.objects.villain.z - dragonMove;
                            break;
                    }
                    G.objects.target.degrees = Math.random() * 360;
                    G.teleportThreshold -= 0.02;
                }
            }
        }
    }*/
    //////////////////////////// end Dragon AI//////////////////

    // collide
    if (G.objects.hero.fuelCell == G.objects.target) {
        dragonFlying.pause();
        // hero carry fuelcell
        if (G.objects.hero.isCollide(G.objects.villainGoalBottom)) {
            // hero arrive at villain's goal
            yaySound.play();
            G.objects.target.x = 185;
            G.objects.target.z = 150;
            G.objects.target.y = 10;
            G.objects.target.scale = 100;
            G.score.hero++;
            G.objects.target = G.objects.hero.fuelCell;
            G.objects.hero.fuelCell = null;;
            G.confetti.counter = K.time.confetti;
            G.objects.target.captured = false;
            G.confetti.onDone = function () {
                reset(true, true, false, false, false, true);
            };
        }
        else if (G.objects.villain.isCollide(G.objects.hero)) {
            // hero attacked
            killedWithDragon = true;
            G.objects.hero.fuelCell = null;
            G.pow.counter = K.time.pow;
            G.objects.target.captured = false;
            G.pow.onDone = function () {
                reset(true, false, true, false, false, false);
            };
            heroSound.play();
        }
    }
    else if (G.objects.villain.fuelCell == G.objects.target) {
        dragonFlying.pause();
        // villain carry fuelcell
        if (G.objects.villain.isCollide(G.objects.heroGoalBottom)) {
            // villain arrive at hero's goal
            G.objects.target.scale = 100;
            G.objects.target.x = 15;
            G.objects.target.z = 150;
            G.objects.target.y = 10;
            G.score.villain++;
            G.objects.target = G.objects.villain.fuelCell;
            G.objects.villain.fuelCell = null;
            G.confetti.counter = K.time.confetti;
            G.objects.target.captured = false;
            G.confetti.onDone = function () {
                reset(true, true, false, false, false, true);
            };

        }
        else if (G.objects.villain.isCollide(G.objects.hero)) {
            // villain attacked
            killedWithDragon = true;
            G.objects.villain.fuelCell = null;
            G.pow.counter = K.time.pow;
            G.objects.target.captured = false;
            G.pow.onDone = function () {
                reset(false, false, false, true, false, false);
            };
            villainSound.play();
        }
    }
    else if (G.objects.hero.isCollide(G.objects.villain)) {
        if (G.objects.hero.boosterCounter > 0 && G.objects.villain.boosterCounter > 0) {
            if (G.objects.hero.fuelCell == G.objects.target) {
                killedWithDragon = true;
                G.objects.hero.fuelCell = null;
            } else if (G.objects.villain.fuelCell) {
                killedWithDragon = true;
                G.objects.villain.fuelCell = null;
            }
            G.objects.hero.health -= 1;
            G.objects.villain.health -= 1;
            explosionSound.play();
            G.objects.target.captured = false;
            reset(false, false, true, true, false, true);
        } else if (G.objects.hero.boosterCounter > 0) {
            if (G.objects.hero.fuelCell == G.objects.target) {
                killedWithDragon = true;
                G.objects.hero.fuelCell = null;
                G.objects.target.captured = false;
                reset(false, false, false, true, false, false);
            } else {
                reset(false, false, false, true, false, false);
            }
            G.objects.villain.health -= 1;
            heroSound.play();
        } else if (G.objects.villain.boosterCounter > 0) {
            if (G.objects.villain.fuelCell == G.objects.target) {
                killedWithDragon = true;
                G.objects.villain.fuelCell = null;
                G.objects.target.captured = false;
                reset(false, false, true, false, false, true);
            } else {
                reset(false, false, true, false, false, false);
            }
            G.objects.hero.health -= 1;
            villainSound.play();
        } else {
            // bump
            playerBumpSound.play();
            const centerX = (G.objects.hero.x + G.objects.villain.x) / 2;
            const centerZ = (G.objects.hero.z + G.objects.villain.z) / 2;
            let v = [G.objects.hero.x - centerX, G.objects.hero.z - centerZ];
            normalize(v);
            v[0] *= K.bumpDistance;
            v[1] *= K.bumpDistance;
            for (const o of [G.objects.hero, G.objects.villain]) {
                if (o == G.objects.villain) {
                    v[0] *= -1;
                    v[1] *= -1;
                }
                o.x = clamp(o.x + v[0], 0 + o.bounding_cir_rad, K.arenaSize - o.bounding_cir_rad);
                o.z = clamp(o.z + v[1], 0 + o.bounding_cir_rad, K.arenaSize - o.bounding_cir_rad);
            }
        }


    }

    G.gameSpin += 1;
    G.gameSpin %= 360;
    if (G.toggleHeroSpin) {
        G.heroSpin += 1;
        G.heroSpin %= 360;
    }
}

function draw() {
    //Notes
    //Only redraw canvas if the width and/or height of the client changed
    resizeCanvas();
    //Only redraw overlay if a player won, display 3 2 1, confetti/pow, and for game pause
    drawOverlay();
    //Only redraw Board if someone scores, 
    drawBoard();
    draw3d();   //Do this everyframe
}

function resizeCanvas() {
    let width = G.canvasDiv.clientWidth;
    let height = G.canvasDiv.clientHeight;
    if ((width == G.canvasDiv.oldWidth) && (height == G.canvasDiv.oldHeight)) {
        return; // no changes
    }
    G.canvasDiv.oldWidth = width;
    G.canvasDiv.oldHeight = height;
    let top = 0;
    let left = 0;
    let aspectRatio = width / height;
    if (aspectRatio < K.aspectRatio.min) {
        height = Math.floor(width / K.aspectRatio.min);
        top = Math.floor((G.canvasDiv.clientHeight - height) / 2);
    } else if (aspectRatio > K.aspectRatio.max) {
        width = Math.floor(height * K.aspectRatio.max);
        left = Math.floor((G.canvasDiv.clientWidth - width) / 2);
    }
    const boardHeight = Math.floor(height / K.aspectRatio.board);
    const canvas3dHeight = height - boardHeight;
    G.canvas.style.width = G.canvas2.style.width = width + "px";
    G.canvas.style.height = canvas3dHeight + "px";
    G.canvas2.style.height = height + "px";
    G.canvas.style.top = G.canvas2.style.top = top + "px";
    G.canvas.style.left = G.canvas2.style.left = left + "px";
    G.canvas.width = width;
    G.canvas.height = canvas3dHeight;
    G.canvas2.width = width;
    G.canvas2.height = height;
}

function drawOverlay() {
    const g = g2;
    const width = G.canvas.width;
    const height = G.canvas.height;
    const fontBig = Math.floor(height * 0.1) + "px consolas,monospace"
    const fontSmall = Math.floor(height * 0.025) + "px consolas,monospace"
    // 2d
    g.clearRect(0, 0, width, height);
    if (G.score.hero - 3 >= G.score.villain) {  //Hero win
        g.globalAlpha = 0.666;
        g.fillStyle = "#000";
        g.fillRect(0, 0, width, height);
        g.globalAlpha = 1;
        g.font = fontBig;
        g.fillStyle = "#FFF";
        g.textAlign = `center`;
        g.textBaseline = `middle`;
        g.fillText("You won! :) ", width / 2, height / 2);
        g.font = fontSmall;
        g.fillText("(Press Spacebar to reset game)", width / 2, height * 0.75);
        K.speed.villain = 0.0;
    } else if (G.score.villain - 3 >= G.score.hero) { //Villain win
        g.globalAlpha = 0.666;
        g.fillStyle = "#000";
        g.fillRect(0, 0, width, height);
        g.globalAlpha = 1;
        g.font = fontBig;
        g.fillStyle = "#FFF";
        g.textAlign = `center`;
        g.textBaseline = `middle`;
        g.fillText("You lost :(", width / 2, height / 2);
        g.font = fontSmall;
        g.fillText("(Press Spacebar to reset game)", width / 2, height * 0.75);
        K.speed.villain = 0.0;
    }

    g.globalAlpha = 1;

    if (K.display321) { //Display 3 2 1
        if (G.fps.i < 3 * 60) {
            g.font = fontBig;
            g.fillStyle = "#FFF";
            g.textAlign = `center`;
            g.textBaseline = `middle`;
            g.fillText(`${3 - ((G.fps.i / 60) | 0)}`, width / 2, height * 0.375);
        }
    }

    
    // must be last
    if (G.pow.counter > 0) {
        const side = height;
        g.drawImage(G.pow.image, (width - side) / 2, (height - side) / 2, side, side);
    } else if (G.confetti.counter > 0) {
        g.drawImage(G.confetti.image, 0, height * (1 - G.confetti.counter / K.time.confetti), width, G.confetti.image.height * width / G.confetti.image.width);
        _1stTime = true;
    }

    if (G.pause) {
        g.globalAlpha = 0.666;
        g.fillStyle = "#000";
        g.fillRect(0, 0, width, height);
        g.globalAlpha = 1;
        g.font = fontBig;
        g.fillStyle = "#FFF";
        g.textAlign = `center`;
        g.textBaseline = `middle`;
        g.fillText("PAUSE", width / 2, height / 2);
    }

}

function drawBoard() {
    const g = g2;
    const width = G.canvas2.width;
    const height = G.canvas2.height - G.canvas.height;
    const top = G.canvas2.height - height;
    const fontSize = document.documentElement.clientWidth * 0.022;
    // teleportThreshold: 1.0,
    // teleportStatus: null,
    // fireBallStatus: null,
    // prevHeroHealth: 3,
    // prevVillainHealth: 3,
    // prevDragonHealth: 3,
    // prevBoostCount: 3,
    // prevHeroScore: 0,
    // prevVillainScore: 0,

    if (_1stTime || G.numBoosts != G.prevBoostCount || G.objects.hero.health != G.prevHeroHealth || G.objects.villain.health != G.prevVillainHealth || G.objects.target.health != G.prevDragonHealth || 
        G.teleportStatus != G.prevTeleportStatus || (G.fireAttackAmmo == 0 && G.prevFireAttacksReady != 0) || (G.fireAttackAmmo != 0 && G.prevFireAttacksReady == 0)) {
        _1stTime = false;
        G.prevHeroHealth = G.objects.hero.health;
        G.prevVillainHealth = G.objects.villain.health;
        G.prevDragonHealth = G.objects.target.health;
        G.prevTeleportStatus = G.teleportStatus;
        G.prevFireAttacksReady = G.fireAttackAmmo;
        G.prevBoostCount = G.numBoosts;

        g.clearRect(0, top, width, height);
        g.globalAlpha = 1.0;
        g.fillStyle = "#000";
        g.drawImage(G.overlay, 0, top, width, height);
        g.drawImage(G.boostImage, width*0.375, top, width *0.05, height);
        g.drawImage(G.dragonImage, width*0.675, top, width *0.05, height);
        g.drawImage(G.ironManImage, width*0.01, top, width *0.05, height);
        g.drawImage(G.thanosImage, width*0.45, top, width *0.05, height);
        g.textBaseline = `top`;
        g.textAlign = `left`;
        g.font = Math.floor(fontSize) + "px consolas,monospace";
        g.fillStyle = "#228B22";
        g.fillText(`Teleport`, width*0.82, top+height*0.1);
        
        for (var i = 0; i < G.objects.target.health; i++) {
            g.drawImage(G.rainbowHeartImage, width*(0.72 + i*0.03), top+height*0.25, width *0.025, height/2);
        }
        for (var i = 0; i < G.objects.hero.health; i++) {
            g.drawImage(G.heartImage, width*(0.06 + i*0.03), top+height*0.25, width *0.025, height/2);
        }
        for (var i = 0; i < G.objects.villain.health; i++) {
            g.drawImage(G.heartImage, width*(0.51 + i*0.03), top+height*0.25, width *0.025, height/2);
        }
        g.font = height + "px consolas,monospace";
        g.textBaseline = `top`;
        g.textAlign = `right`;
        g.fillStyle = "#55F";
        g.fillText(`${G.score.villain}`, width * 0.66, top);
        g.textAlign = `left`;
        g.fillStyle = "#F55";
        g.fillText(`${G.score.hero}`, width * 0.33, top);
        // g.font = Math.floor(fontSize / 1.5) + "px consolas,monospace"
        // //g.fillText(`Thanos Proximity: ${Math.floor(distance(G.objects.hero.x, G.objects.hero.z, G.objects.villain.x, G.objects.villain.z)-3)}`, width * 0.15, top);
        // g.font = Math.floor(fontSize / 2) + "px consolas,monospace";
        // g.fillStyle = "#228B22";
        // //g.fillText(`Teleport`, width*0.82, top+height*0.1);
        g.font = Math.floor(fontSize) + "px consolas,monospace"
    
        if (G.teleportThreshold >= 0.75) {
            if (G.teleportStatus !== "High") {
                g.fillStyle = "#FF0000";
                g.fillText(`High`, width*0.82, top+height*0.25);
                G.teleportStatus = "High";
            }
        } else if (G.teleportThreshold >= 0.5) {
            if (G.teleportStatus !== "Moderate") {
                g.fillStyle = "#FF4500";
                g.fillText(`Moderate`, width*0.82, top+height*0.25);
                G.teleportStatus = "Moderate";
            }
        } else if (G.teleportThreshold >= 0.25) {
            if (G.teleportStatus !== "Low") {
                g.fillStyle = "#FF0000";
                g.fillText(`Low`, width*0.82, top+height*0.25);
                G.teleportStatus = "Low";
            }
        } else {
            if (G.teleportStatus !== "Very Low") {
                g.fillStyle = "#008000";
                g.fillText(`Very Low`, width*0.82, top+height*0.25);
                G.teleportStatus = "Very Low";
            }
        }
    
        g.fillStyle = "#8eff55";
        g.fillText(` x${G.numBoosts}`, width * 0.4, top + height * 0.33);
    
        if (G.objects.hero.fuelCell == null && distance(G.objects.hero.x, G.objects.hero.z, G.objects.rock.rock.x, G.objects.rock.rock.z) <= 7) {
            g.fillText(`Press spacebar to pick up rock`, width * 0.33, top-100);
        }
    
        if (G.objects.hero.fuelCell == G.objects.rock.rock && G.objects.hero.isCollide(G.objects.target)) {
            g.fillText(`Drop the rock first!`, width * 0.33, top-100);
        }
    
        g.lineWidth = 8;
        g.strokeStyle = 'yellow';
        g.rect(width-(0.070 * width), top + (0.020 * width), width*0.05, height*0.5);
        g.stroke();
        if (G.fireAttackAmmo > 0) {
            g.fillStyle = "#FF4500";
        } else {
            g.fillStyle = "#FFF";
        }
        g.fill();
        g.drawImage(G.fireBallImage, width-(0.070 * width), top + (0.020 * width), width *0.05, height*0.5);
    
    }

    //FPS display
    g.font = fontSize + "px consolas,monospace";
    g.fillStyle = "#FFF";
    g.fillText(` ${G.fps.display}`, 20, 20, 100, 100);


}

function distance (x,y,a,b) {
    return Math.sqrt((x-a)*(x-a)+(y-b)*(y-b));
}

function draw3d() {
    const width = G.canvas.width;
    const height = G.canvas.height;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //update light position information
    G.program.light.position[5] = [G.objects.light.x, G.objects.light.y, G.objects.light.z, 1];
    G.program.light.position[8] = [G.objects.target.x, G.objects.target.y, G.objects.target.z, 1];

    //Update diffuse and specular lights for boosts
    for (let i = 0; i < G.boosters.length; i++) {
        G.boosters[i].isVisible ? G.program.light.diffuse[i][1] = 0.5 : G.program.light.diffuse[i][1] = 0;
        G.boosters[i].isVisible ? G.program.light.specular[i][1] = 0.5 : G.program.light.specular[i][1] = 0;
    }

    // send to gpu
    gl.uniform4fv(G.program.u.lightPosition, flatten(G.program.light.position));
    gl.uniform4fv(G.program.u.ambient, flatten(G.program.light.ambient));
    gl.uniform4fv(G.program.u.diffuse, flatten(G.program.light.diffuse));
    gl.uniform4fv(G.program.u.specular, flatten(G.program.light.specular));
    gl.uniform1fv(G.program.u.shininess, flatten(G.program.light.shininess));
    for (var i = 0; i < 2; i++) {
        let projectionMatrix;
        if (i == 0) { //Main view port (Hero view port)
            if (swapPerspective) {
                gl.viewport(Math.floor((width - height) / 2), 0, height, height);
                G.program.viewMatrix = lookAt(vec3(K.arenaSize / 2, 100.0, K.arenaSize / 2), vec3(K.arenaSize / 2, 0.0, K.arenaSize / 2), vec3(0.0, 0.0, -1.0));
                projectionMatrix = ortho(-150, 150, -150, 150, 0, 200); // harcoded because of m$ edge
            } else {
                gl.viewport(0, 0, width, height);
                const hero = G.objects.hero;
                const eye = vec3(hero.x - hero.xdir * K.eye.x, K.eye.y, hero.z - hero.zdir * K.eye.z);
                G.program.viewMatrix = lookAt(eye, vec3(hero.x + hero.xdir, K.eye.y, hero.z + hero.zdir), vec3(0, 1, 0));
                G.objects.sky.update(eye);
                projectionMatrix = perspectiveX(K.perspective.fovX, width / height, K.perspective.near, K.perspective.far);
            }
        } else {  //Minimap viewport
            const r = Math.floor(height / 3);
            gl.viewport(width - r, height - r, r, r);
            if (swapPerspective) {
                gl.clear(gl.DEPTH_BUFFER_BIT);
                const hero = G.objects.hero;
                const eye = vec3(hero.x - hero.xdir * K.eye.x, K.eye.y, hero.z - hero.zdir * K.eye.z);
                G.program.viewMatrix = lookAt(eye, vec3(hero.x + hero.xdir, K.eye.y, hero.z + hero.zdir), vec3(0, 1, 0));
                G.objects.sky.update(eye);
                projectionMatrix = perspectiveX(K.perspective.fovX, 1, K.perspective.near, K.perspective.far);
            } else {
                G.program.viewMatrix = lookAt(vec3(K.arenaSize / 2, 100.0, K.arenaSize / 2), vec3(K.arenaSize / 2, 0.0, K.arenaSize / 2), vec3(0.0, 0.0, -1.0));
                projectionMatrix = ortho(-150, 150, -150, 150, 0, 200); // harcoded because of m$ edge
            }
        }
        gl.uniformMatrix4fv(G.program.u.viewMatrix, false, flatten(G.program.viewMatrix));
        gl.uniformMatrix4fv(G.program.u.projectionMatrix, false, flatten(projectionMatrix));

        // draw objects
        G.objects.rock.rock.show();
        G.objects.pedestal.show();
        G.objects.ground.show();
        G.objects.wall.show();
        G.objects.hero.show(G.heroSpin);
        G.objects.heroGoalBottom.show(G.gameSpin);
        G.objects.heroGoalTop.show(G.gameSpin);
        G.objects.villain.show(G.gameSpin);
        G.objects.villainGoalBottom.show(G.gameSpin);
        G.objects.villainGoalTop.show(G.gameSpin);
        G.objects.target && G.objects.target.show();
        G.objects.booster0.show();
        G.objects.booster1.show();
        G.objects.booster2.show();
        G.objects.booster3.show();
        G.objects.booster4.show();
        G.objects.rats && G.objects.rats.show(G.gameSpin);

        for (const key in G.objects.fireAttacks.attacks) {
            G.objects.fireAttacks.attacks[key] && G.objects.fireAttacks.attacks[key].show(G.gameSpin);    //added code
        }

        if (G.objects.rocket.rocket && G.objects.rocket.rocket.inMotion()) { //rock is off the ground so spin it
            G.objects.rocket.rocket.show(G.gameSpin);
        } else {
            G.objects.rocket.rocket && G.objects.rocket.rocket.show2();
        }
        if (G.objects.rocket.fire) {
            G.objects.rocket.fire.show(G.gameSpin);
        }
        for (const explosionKey in G.objects.rocket.explosion) {
            G.objects.rocket.explosion[explosionKey] && G.objects.rocket.explosion[explosionKey].show();
            if (G.objects.rocket.explosion[explosionKey].scale < 2) {
                G.objects.rocket.explosion[explosionKey].scale += 0.05;
            } else {
                if (G.explosionDone) {
                    G.objects.rocket.explosion[explosionKey].y -= 1.0;
                    G.objects.rocket.explosion[explosionKey].degrees += 1.0;
                } else {
                    G.explosionDone = G.objects.rocket.explosion[explosionKey].isDone();
                }
            }

            if (G.objects.rocket.explosion[explosionKey].y <= -120) {
                G.objects.rocket.explosion.splice(G.objects.rocket.explosion.indexOf(explosionKey), 1);
            }

        }
        for (const cloudKey in G.objects.clouds) {
            G.objects.clouds[cloudKey].show();
        }
        G.objects.light.show(G.gameSpin);
        G.objects.sky.show(); // last draw to minimize pixel fill
    }
    requestAnimFrame(tick);
};