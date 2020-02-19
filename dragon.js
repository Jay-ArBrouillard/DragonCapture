var destination = [Math.floor(Math.random() * 200) + 50, Math.floor(Math.random() * 10) + 30, Math.floor(Math.random() * 200) + 50]; //Where the dragon will move to (x,y,z location)
var previousDir;
function Dragon(x, y, z, degrees, texSrc) {
    GameObj2.call(this, x, y, z, degrees);
    const _ = this;
    _.scale = 100;
    _.mesh = dragonMesh;
    _.texture = loadTexture(texSrc);
    _.textureMatrix = mult(rotateY(-90), scalem(1, 5, 1)); // cylindrical texture mapping
    _.captured = false;
    _.food = 0;
    _.boosterCounter = 0;
    _.glow = [1.0,0.0,0.0, 0.0]; // red Color, off
}
Dragon.prototype = Object.create(GameObj2.prototype);
Dragon.prototype.update = function (isCaptured, reset, teleportedChangeDest) {
    const _ = this;
    _.bounding_cir_rad = _.scale / 19;

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

    //Shoot fireAttacks and only updates the attacks shot
    //Add fireAttack every 3 seconds
    if (G.objects.fireAttacks.attacks.length < 10 && (G.fps.i % (3*60)) == 0) {
        G.fireAttackAmmo++;
    }

    //Can only shoot once per second
    if ((G.fps.i % 60) == 0) {
        if (G.fireAttackAmmo > 0) {
            let targetDegrees = Math.atan2(G.objects.hero.z - _.z, G.objects.hero.x - _.x) * 180 / Math.PI;
            targetDegrees %= 360;
            if (Math.abs(targetDegrees) <= 100) {
            //const heroNormalDegree = G.objects.hero.normalDegrees;
            //if ((G.objects.target.normalDegrees + 180) % 360 >= (heroNormalDegree - 45) && (G.objects.target.normalDegrees + 180) % 360 <= (heroNormalDegree + 45)) {
                G.fireAttackAmmo--;
                G.objects.fireAttacks.attacks.push(new FireAttack(0,0,0,0,"assets/fireTexture.png")); //Create fireAttack off map
                G.objects.fireAttacks.inMotion.push(false);
                G.objects.fireAttacks.heightDecrement.push(null);
                G.objects.fireAttacks.aim.push(true);
                G.objects.fireAttacks.target.push(G.objects.hero);
            }
        }

        if (G.fireAttackAmmo > 0) {
            let targetDegrees = Math.atan2(G.objects.villain.z - _.z, G.objects.villain.x - _.x) * 180 / Math.PI;
            targetDegrees %= 360;
            if (Math.abs(targetDegrees) <= 100) {
            //const villainNormalDegree = G.objects.villain.normalDegrees;
            //if ((G.objects.target.normalDegrees + 180) % 360 >= (villainNormalDegree - 45) && (G.objects.target.normalDegrees + 180) % 360 <= (villainNormalDegree + 45)) {
                G.fireAttackAmmo--;
                G.objects.fireAttacks.attacks.push(new FireAttack(0,0,0,0,"assets/fireTexture.png")); //Create fireAttack off map
                G.objects.fireAttacks.inMotion.push(false);
                G.objects.fireAttacks.heightDecrement.push(null);
                G.objects.fireAttacks.aim.push(true);
                G.objects.fireAttacks.target.push(G.objects.villain);
            } 
        }
    }

    //Update all fireAttacks
    for (const key in G.objects.fireAttacks.attacks) {
        const target = G.objects.fireAttacks.target[key];
        G.objects.fireAttacks.attacks[key] && G.objects.fireAttacks.attacks[key].update(key, target);
    }


    if (reset) {
        destination = [Math.floor(Math.random() * 200) + 50, Math.floor(Math.random() * 10) + 30, Math.floor(Math.random() * 200) + 50];
    }
    else if (isCaptured == false) {
        var closestBoost = null;
        //If small dragon run away from villain and hero and get 3 food to grow back to normal size
        if (_.scale != 100) {
            //Find the closest Boost to the Villain
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
                destination[0] = Math.random() * 200 + 50;  //Not 300 Because the dragon's size prevents going all the way to the edge
                destination[2] = Math.random() * 200 + 50;
            } else {
                destination[0] = closestBoost.x;
                destination[2] = closestBoost.z;
            }

        } else {
            //If the dragons current position is equal to destination pick a new destination and start moving there
            if (closestBoost != null && _.isCollide(closestBoost)) {
                var destinationHeight;
                if (_.scale != 100) {
                    _.y = 0;
                    destinationHeight = 0;
                } else {
                    destinationHeight = -5;
                }

                destination[0] = Math.random() * 200 + 50;  //Not 300 Because the dragon's size prevents going all the way to the edge
                destination[1] = destinationHeight;
                destination[2] = Math.random() * 200 + 50;
            }
            else if (Math.abs(_.x - destination[0]) <= 0.5 && Math.abs(_.z - destination[2] <= 0.5)) {
                var destinationHeight;
                if (_.scale != 100) {
                    _.y = 0;
                    destinationHeight = 0;
                } else {
                    destinationHeight = -5;
                }

                destination[0] = Math.random() * 200 + 50;  //Not 300 Because the dragon's size prevents going all the way to the edge
                destination[1] = destinationHeight;
                destination[2] = Math.random() * 200 + 50;

            } 
        }

        //Move towards the destination
        let move = K.speed.dragon;
        if (_.boosterCounter > 0) {
            move *= 1.2;
        }
        _.fixDegrees();

        let keepMoving = 1;
        if ((G.fps.i % (5* 60)) == 0) { //Prevent Ai from running in circles because it cant reach something
            K.aiSmartTurn = false;
        }
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
        K.aiSmartTurn = true;
        let targetDegrees = Math.atan2(destination[2] - _.z, destination[0] - _.x) * (180 / Math.PI);
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

    if (degreesRotation > 0) {  //Turning right\
        if (_.normalDegrees == 0) {
            _.normalDegrees += 360;
        }
        _.normalDegrees -= degreesRotation;

        if (_.normalDegrees - 1 == 0) {
            _.normalDegrees %= 360;
        }
    } else {    //Turning left
        if (_.normalDegrees == 360) {
            _.normalDegrees -= 360;
        }
        _.normalDegrees -= degreesRotation;

        if (_.normalDegrees + 1 == 360) {
            _.normalDegrees %= 360;
        }
    }

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
    _.degrees = d; // restore degrees
};

function FireAttack(x, y, z, degrees, texSrc) {
    GameObj2.call(this, x, y, z, degrees);
    const _ = this;
    _.scale = G.objects.target.scale == 100 ? 1 : 0.5;
    _.bounding_cir_rad = G.objects.target.scale == 100 ? 6 : 3;
    _.mesh = fireMesh;
    _.texture = loadTexture(texSrc);
    _.textureMatrix = mult(rotateZ(90), scalem(1, 1, 1)); // cylindrical texture mapping
}
FireAttack.prototype = Object.create(GameObj2.prototype);

FireAttack.prototype.turn = function (degreesRotation) {
    const _ = this;
    _.degrees += degreesRotation;
    _.fixDegrees();
};

FireAttack.prototype.update = function (index, t) {
    const _ = this;
    let move = 1.0;
    let target = t;


    if (G.objects.fireAttacks.heightDecrement[index] == null) {
        if (G.objects.target.scale == 100) {   //Large Dragon
            _.x = G.objects.target.x - Math.sin(radians(G.objects.target.degrees)) * (G.objects.target.bounding_cir_rad + 5);
            _.z = G.objects.target.z - Math.cos(radians(G.objects.target.degrees)) * (G.objects.target.bounding_cir_rad + 5);
            _.y = G.objects.target.y + 13;
        } else {    //Small dragon
            _.x = G.objects.target.x - Math.sin(radians(G.objects.target.degrees)) * (G.objects.target.bounding_cir_rad);
            _.z = G.objects.target.z - Math.cos(radians(G.objects.target.degrees)) * (G.objects.target.bounding_cir_rad);
            _.y = G.objects.target.y + 5;
        }

        G.objects.fireAttacks.inMotion[index] = true;
        G.objects.fireAttacks.heightDecrement[index] = _.y / (distance(_.x, _.z, G.objects.hero.x, G.objects.hero.z) / move);
        //How many update calls until fireAttack reaches heros original location?
    }
    
    if (G.objects.fireAttacks.inMotion[index]) {
        if (_.y <= -3) {
            G.objects.fireAttacks.heightDecrement.splice(index, 1);
            G.objects.fireAttacks.attacks.splice(index, 1);
            G.objects.fireAttacks.inMotion.splice(index, 1);
            G.objects.fireAttacks.heightDecrement.splice(index, 1);
            G.objects.fireAttacks.aim.splice(index, 1);
            G.objects.fireAttacks.target.splice(index, 1);
        } else {
            _.y -= G.objects.fireAttacks.heightDecrement[index];
        }
    }

    //Move towards the destination
    _.fixDegrees();

    if (G.objects.fireAttacks.aim[index]) {
        let targetDegrees = Math.atan2(target.z - _.z, target.x - _.x) * (180 / Math.PI);
        targetDegrees %= 360;
        _.turn(targetDegrees);
        _.degreesX = targetDegrees;
        G.objects.fireAttacks.aim[index] = false;
    }

    _.move(+move); // forward

    _.fixDegrees();
    // bounce left or right wall
    // if ((_.x < 0 + _.bounding_cir_rad) || (_.x > K.arenaSize - _.bounding_cir_rad)) {
    //     wallBumpSound.play();
    //     _.x = clamp(_.x, 0 + _.bounding_cir_rad, K.arenaSize - _.bounding_cir_rad);
    //     _.xdir = -_.xdir; // bounce
    //     _.degrees = Math.atan2(_.zdir, _.xdir) * 180 / Math.PI;
    //     _.fixDegrees();
    // }
    // // bounce top or bottom wall
    // if ((_.z < 0 + _.bounding_cir_rad) || (_.z > K.arenaSize - _.bounding_cir_rad)) {
    //     wallBumpSound.play();
    //     _.z = clamp(_.z, 0 + _.bounding_cir_rad, K.arenaSize - _.bounding_cir_rad);
    //     _.zdir = -_.zdir; // bounce
    //     _.degrees = Math.atan2(_.zdir, _.xdir) * 180 / Math.PI;
    //     _.fixDegrees();
    // }
    //collide with Rat
    if (_.isCollide(G.objects.rats)) {
        G.squelchSound.play();
        G.objects.rats = null;
    }

    //collide with Hero
    if (_.isCollide(G.objects.hero) && heroInvulnerableTimer == 0) {
        G.objects.hero.health -= 1;
        heroInvulnerableTimer = 1;
    }

    //collide with Villain
    if (_.isCollide(G.objects.villain) && villainInvulnerableTimer == 0) {
        G.objects.villain.health -= 1;
        villainInvulnerableTimer = 1;
    }

    
};

// make degrees [0-360)
FireAttack.prototype.fixDegrees = function () {
    const _ = this;
    _.degrees %= 360;
    _.xdir = Math.cos(_.degrees * Math.PI / 180.0);
    _.zdir = Math.sin(_.degrees * Math.PI / 180.0);
};
FireAttack.prototype.turn = function (degreesRotation) {
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

FireAttack.prototype.show = function (degrees) {
    const _ = this;
    const d = _.degrees; // save degrees
    if (degrees != undefined) _.degrees = degrees; // rotate mesh
    _.glow[3] = _.boosterCounter > 0 ? 1 : 0;
    GameObj2.prototype.show.call(this); // show
    _.degrees = d; // restore degrees
};
