function Rat(x, y, z, degrees, texSrc) {
    GameObj2.call(this, x, y, z, degrees, 0.5);
    const _ = this;
    _.scale = 0.9;
    _.mesh = ratMesh;
    _.texture = loadTexture(texSrc);
    _.textureMatrix = mult(rotateY(180), scalem(1, 1, 1/10)); // cylindrical texture mapping
    _.boosterCounter = 0;
    _.glow = [1.0,0.0,0.0, 0.0]; // red Color, off

}

Rat.prototype = Object.create(GameObj2.prototype);
// make degrees [0-360)
Rat.prototype.fixDegrees = function () {
    const _ = this;
    _.degrees %= 360;
    _.xdir = Math.cos(_.degrees * Math.PI / 180.0);
    _.zdir = Math.sin(_.degrees * Math.PI / 180.0);
};
Rat.prototype.turn = function (degreesRotation) {
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
Rat.prototype.update = function () {
    const _ = this;
    let move = K.speed.rats;

    if (_.fuelCell) {
        move *= K.speed.carryMul; // slower when carrying fuelcell
    }
    if (_.boosterCounter > 0) {
        move *= K.speed.boostMul;
    }
    _.fixDegrees();


    //Find the closest 
    var closestBoost = null;
    var closestBoostDist = Number.MAX_VALUE;
    var numVisibleBoosts = 0;
    for (var i = 0; i < G.boosters.length; i++) {
        if (G.boosters[i].isVisible) {
            numVisibleBoosts++;
            var dist = distance(G.boosters[i].x, G.boosters[i].z, G.objects.villain.x, G.objects.villain.z);

            if (dist < closestBoostDist) {
                closestBoost = G.boosters[i];
                closestBoostDist = dist;
            }
        }
    }

    var target = closestBoost;
    
    if (target != null) {
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
            if (length([target.x - x, target.z - z]) < radius) {
                keepMoving = 0;
            }
            else {
                // left turn
                x = _.x + _.zdir * radius;
                z = _.z - _.xdir * radius;
                if (length([target.x - x, target.z - z]) < radius) {
                    keepMoving = 0;
                }
            }
        }
        let targetDegrees = Math.atan2(target.z - _.z, target.x - _.x) * 180 / Math.PI;
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
    // get fuelcell
    /*if (_.isCollide(G.objects.target) && G.target.y <= 3) {
        _.fuelCell = G.objects.target;
        G.objects.target = null;
    }
    */
    // get booster
    for (const b of G.boosters) {
        if (b.isVisible && _.isCollide(b)) {
            b.isVisible = false;
            _.boosterCounter += K.time.booster;
            G.numBoosts--;
            boostSound.play();
        }
    }
    // decrement bster counter
    if (_.boosterCounter > 0) {
        _.boosterCounter--;
    }
    /*
    // set carried fuelcell positionwd
    if (_.fuelCell) {
        _.fuelCell.x = _.x - Math.sin(radians(armDir)) * (_.bounding_cir_rad + 1);
        _.fuelCell.z = _.z - Math.cos(radians(armDir)) * (_.bounding_cir_rad + 1);
        _.fuelCell.y = 0;

    }
    */
    
};

function distance (x,y,a,b) {
    return Math.sqrt((x-a)*(x-a)+(y-b)*(y-b));
}

Rat.prototype.show = function (degree) {
    //armDir = G.heroSpin;
    const _ = this;
    const d = _.degrees; // save degrees
    if (degree != undefined) _.degrees = degree; // rotate mesh
    _.glow[3] = _.boosterCounter > 0 ? 1 : 0;
    GameObj2.prototype.show.call(this); // show
    _.degrees = d; // restore degrees
    _.fuelCell && _.fuelCell.show(); // show carried fuelcell
};
