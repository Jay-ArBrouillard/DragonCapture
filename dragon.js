var destination = [Math.floor(Math.random() * 200) + 50, Math.floor(Math.random() * 10) + 30, Math.floor(Math.random() * 200) + 50]; //Where the dragon will move to (x,y,z location)
var previousDir;
function Dragon(x, y, z, degrees, texSrc, scale) {
    GameObj2.call(this, x, y, z, degrees, 6);
    const _ = this;
    _.scale = 100;
    _.mesh = dragonMesh;
    _.texture = loadTexture(texSrc);
    _.textureMatrix = mult(rotateY(-90), scalem(1, 5, 1)); // cylindrical texture mapping
    _.bounding_cir_rad = 5;
    _.captured = false;
    _.food = 0;
    _.boosterCounter = 0;
    _.glow = [1.0,0.0,0.0, 0.0]; // red Color, off
}
Dragon.prototype = Object.create(GameObj2.prototype);
Dragon.prototype.update = function (isCaptured, reset, teleportedChangeDest) {
    const _ = this;
    _.bounding_cir_rad = _.scale / 19;

    if (destination == null) {
    console.log(destination);

    }


    if (teleportedChangeDest) {
        destination[0] = Math.floor(Math.random() * 200) + 50;
        destination[2] = Math.floor(Math.random() * 200) + 50;
        return;
    }

    if (isCaptured) {
        if (_.scale - 1 > 20) {
            G.shrinkSound.play();
            _.scale -= 1;
        }
    }
    //Make sure dragon shrinks all the way
    if (_.scale != 100 && _.scale > 20) {
        _.scale -= 1;
    }

    if (reset) {
        destination = [Math.floor(Math.random() * 200) + 50, Math.floor(Math.random() * 10) + 30, Math.floor(Math.random() * 200) + 50];
    }
    else if (isCaptured == false) {
        //If small dragon run away from villain and hero and get 3 food to grow back to normal size
        if (_.scale != 100) {
            var distanceHero = distance(_.x, _.z, G.objects.hero.x, G.objects.hero.z);
            var distanceVillain = distance(_.x, _.z, G.objects.villain.x, G.objects.villain.z);
            //Choose a direction both the hero and villain arent in: 1-top right, 2: top-left, 3: bottom-left, 4: bottom-right
            /*var heroQuadrant;
            var villainQuadrant;
            var randomArray = [1,2,3,4];

            if (_.x - G.objects.hero.x > 0 && _.z - G.objects.hero.z > 0) {
                randomArray.splice(randomArray.indexOf(1), 1);
            } else if (_.x - G.objects.hero.x <= 0 && _.z - G.objects.hero.z <= 0) {
                randomArray.splice(randomArray.indexOf(4), 1);
            } else if (_.x - G.objects.hero.x > 0 && _.z - G.objects.hero.z <= 0 ) {
                randomArray.splice(randomArray.indexOf(3), 1); 
            } else {
                randomArray.splice(randomArray.indexOf(2), 1);
            }
 
            var xMax;
            var xMin;
            var zMax;
            var zMin;
            heroQuadrant = randomArray[Math.floor(Math.random()*randomArray.length)];
            if (heroQuadrant == 1) {
                xMax = 300;
                xMin = _.x+20;
                zMax = 300;
                zMin = _.z+20;
            } else if (heroQuadrant == 2) {
                xMax = _.x-20;
                xMin = 10;
                zMax = 300;
                zMin = _.z-20;
            } else if (heroQuadrant == 3) {
                xMax = _.x-20;
                xMin = 10;
                zMax = _.z-20;
                zMin = 10;
            } else if (heroQuadrant == 4) {
                xMax = 300;
                xMin = _.x-20;
                zMax = _.z-20;
                zMin = 10;
            }
            */



            //Find the closest Boost to the Villain
            var closestBoost = null;
            var closestBoostDist = Number.MAX_VALUE;
            for (var i = 0; i < G.boosters.length; i++) {
                if (G.boosters[i].isVisible) {
                    var dist = distance(G.boosters[i].x, G.boosters[i].z, _.x, _.z);

                    if (dist < closestBoostDist) {
                        closestBoost = G.boosters[i];
                        closestBoostDist = dist;
                    }
                }
            }
            if (closestBoost == null) {
                destination[0] = Math.floor(Math.random() * 200) + 50;  //Not 300 Because the dragon's size prevents going all the way to the edge
                destination[2] = Math.floor(Math.random() * 200) + 50;
            } else {
                destination[0] = closestBoost.x;
                destination[2] = closestBoost.z;
            }

        }

        //If the dragons current position is equal to destination pick a new destination and start moving there
        if (Math.abs(_.x - destination[0]) <= 0.5 && Math.abs(_.z - destination[2] <= 0.5)) {
            var destinationHeight;
            if (_.scale != 100) {
                _.y = 0;
                destinationHeight = 0;
            } else {
                destinationHeight = -5;
            }

            destination[0] = Math.floor(Math.random() * 200) + 50;  //Not 300 Because the dragon's size prevents going all the way to the edge
            destination[1] = destinationHeight;
            destination[2] = Math.floor(Math.random() * 200) + 50;


        } else {   //Move towards the destination
            let move = K.speed.dragon;
            if (_.boosterCounter > 0) {
                move *= 1.2;
            }
            _.fixDegrees();

            let keepMoving = 1;
            if (K.aiSmartTurn) {
                // smart turn
                const fullTurnTime = 360 / K.speed.turn;
                const circumference = move * fullTurnTime;
                const radius = circumference / (2 * Math.PI);
                let x;
                let z;
                // right turn
                x = _.x - _.zdir * radius;
                z = _.z + _.xdir * radius;
                if (length([destination[0] - x, destination[2] - z]) < radius) {
                    keepMoving = 0;
                }
                else {
                    // left turn
                    x = _.x + _.zdir * radius;
                    z = _.z - _.xdir * radius;
                    if (length([destination[0] - x, destination[2] - z]) < radius) {
                        keepMoving = 0;
                    }
                }
            }
            let targetDegrees = Math.atan2(destination[2] - _.z, destination[0] - _.x) * 180 / Math.PI;
            targetDegrees %= 360;

            // degrees to turn
            const rightDegrees = targetDegrees + (targetDegrees >= _.degrees ? 0 : 360) - _.degrees;
            const leftDegrees = _.degrees - (targetDegrees - (targetDegrees <= _.degrees ? 0 : 360));
            // turn
            if (rightDegrees < leftDegrees) {
                _.turn(Math.min(+K.speed.turn, rightDegrees));
            }
            else {
                _.turn(Math.max(-K.speed.turn, -leftDegrees));
            }
            _.move(+move * keepMoving); // forward

            // Going up and down (ascending/descending)
            if (_.scale == 100) {
                if (_.y > destination[1] && _.y - 0.1 >= -5) {
                    _.y -= 0.1;
                } else if (_.y < destination[1] && _.y + 0.5 <= destination[1]) {
                    _.y += 0.1;
                }
            } else {
                if (_.y > destination[1] && _.y - 0.1 >= 0) {
                    _.y -= 0.1;
                } else if (_.y < destination[1] && _.y + 0.1 <= destination[1]) {
                    _.y += 0.1;
                }
            }

            _.fixDegrees();
            // bounce left or right wall
            if ((_.x < 0 + _.bounding_cir_rad) || (_.x > K.arenaSize - _.bounding_cir_rad)) {
                wallBumpSound.play();
                _.x = clamp(_.x, 0 + _.bounding_cir_rad, K.arenaSize - _.bounding_cir_rad);
                _.xdir = -_.xdir; // bounce
                _.degrees = Math.atan2(_.zdir, _.xdir) * 180 / Math.PI;
                _.fixDegrees();
            }
            // bounce top or bottom wall
            if ((_.z < 0 + _.bounding_cir_rad) || (_.z > K.arenaSize - _.bounding_cir_rad)) {
                wallBumpSound.play();
                _.z = clamp(_.z, 0 + _.bounding_cir_rad, K.arenaSize - _.bounding_cir_rad);
                _.zdir = -_.zdir; // bounce
                _.degrees = Math.atan2(_.zdir, _.xdir) * 180 / Math.PI;
                _.fixDegrees();
            }
            //collide with Rat
            if (_.isCollide(G.objects.rats)) {
                G.squelchSound.play();
                G.objects.rats = null;
            }

            // get booster
            for (const b of G.boosters) {
                if (b.isVisible && _.isCollide(b)) {
                    b.isVisible = false;
                    _.boosterCounter += K.time.booster;
                    G.numBoosts--;
                    _.food++;
                    boostSound.play();
                }
            }
            // decrement bster counter
            if (_.boosterCounter > 0) {
                _.boosterCounter--;
            }


        }
    } 
};

// make degrees [0-360)
Dragon.prototype.fixDegrees = function () {
    const _ = this;
    _.degrees %= 360;
    _.xdir = Math.cos(_.degrees * Math.PI / 180.0);
    _.zdir = Math.sin(_.degrees * Math.PI / 180.0);
};
Dragon.prototype.turn = function (degreesRotation) {
    const _ = this;
    _.degrees += degreesRotation;
    _.fixDegrees();
};

// clamp number
function clamp(val, min, max) {
    if (val <= min)
        return min;
    if (val >= max)
        return max;
    return val;
}

function distance (x,y,a,b) {
    return Math.sqrt((x-a)*(x-a)+(y-b)*(y-b));
}

Dragon.prototype.show = function () {
    const _ = this;
    const d = _.degrees; // save degrees
    _.glow[3] = _.boosterCounter > 0 ? 1 : 0;
    GameObj2.prototype.show.call(this); // show
    _.fixDegrees();
    _.degrees = (d + 180) % 360; // restore degrees
};
