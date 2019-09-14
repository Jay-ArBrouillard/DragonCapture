var armDir;
var villainInvulnerableTimer = 0; //Don't want to get damaged too quickly in succession
function Villain(x, y, z, degrees, texSrc) {
    GameObj2.call(this, x, y, z, degrees, 2);
    const _ = this;
    _.scale = .1;
    _.mesh = Villain.mesh;
    _.texture = loadTexture(texSrc);
    _.textureMatrix = mult(rotateY(-90), scalem(1, 1/25, 1)); // cylindrical texture mapping
    _.boosterCounter = 0;
    _.glow = [1.0,0.0,0.0,0.0]; // red Color, off

}
Villain.mesh = {
    vertices: [0.000000, 18.506506, -10.514622, -6.180340, 14.999998, -16.180340, 6.180340, 14.999998, -16.180340, -10.514622, 9.999998, -16.013016, -16.180340, 13.090168, -10.000000, -17.013016, 15.257309, 0.000000, -10.000000, 18.090168, -6.180340, -10.000000, 18.090168, 6.180340, 0.000000, 18.506506, 10.514622, 0.000000, 19.999998, 0.000000, 10.000000, 18.090168, -6.180340, 10.000000, 18.090168, 6.180340, 17.013016, 15.257309, 0.000000, 16.180340, 13.090168, -10.000000, 10.514622, 9.999998, -16.013016, 20.000000, 9.999998, 0.000000, 17.013016, 4.742687, 0.000000, 16.180340, 6.909828, -10.000000, 16.180340, 13.090168, 10.000000, 10.514622, 9.999998, 17.013016, 16.180340, 6.909828, 10.000000, 6.180340, 14.999998, 16.180340, -6.180340, 14.999998, 16.180340, -10.514622, 9.999998, 17.013016, 0.000000, 9.999998, 20.000000, -6.180340, 4.999998, 16.180340, 6.180340, 4.999998, 16.180340, 0.000000, 1.493490, 10.514622, 10.000000, 1.909828, 6.180340, 0.000000, -0.000002, 0.000000, 0.000000, 1.493490, -10.514622, 10.000000, 1.909828, -6.180340, -10.000000, 1.909828, 6.180340, -17.013016, 4.742687, 0.000000, -10.000000, 1.909828, -6.180340, -16.180340, 6.909828, -10.000000, -6.180340, 4.999998, -16.180340, 6.180340, 4.999998, -16.180340, -20.000000, 9.999998, 0.000000, -16.180340, 13.090168, 10.000000, -16.180340, 6.909828, 10.000000, 0.000000, 1.493469, 21.988331, -6.180359, 5.000000, 21.981195, 6.180359, 5.000000, 21.981195, 0.000000, 1.493490, 10.514622, -6.180340, 4.999998, 16.180340, 6.180340, 4.999998, 16.180340, -10.514648, 10.000000, -27.012939, -16.180359, 6.909851, -21.000000, -6.180359, 5.000000, -27.180420, -10.000000, 1.909851, -17.180359, -10.514648, 10.000000, -17.013000, -10.514622, 9.999998, -16.013016, -16.180340, 6.909828, -10.000000, -16.180359, 6.909851, -11.000000, -6.180359, 5.000000, -17.180359, -6.180340, 4.999998, -16.180340, -10.000000, 1.909828, -6.180340, -10.000000, 1.909851, -7.180359, -10.514648, 10.000000, -27.013000, -6.180359, 5.000000, -27.180359, 10.514648, 10.000000, -26.888000, 6.180359, 5.000000, -27.055359, 16.180359, 6.909851, -20.875000, 10.000000, 1.909851, -16.180359, 10.514622, 9.999998, -16.013016, 6.180340, 4.999998, -16.180340, 16.180340, 6.909828, -10.000000, 10.000000, 1.909828, -6.180340, -10.514622, 9.999998, -16.013016, 0.000000, 9.999998, -16.000000, -6.180340, 14.999998, -16.180340, 10.514622, 9.999998, -16.013016, 6.180340, 14.999998, -16.180340, -6.180340, 4.999998, -16.180340, 6.180340, 4.999998, -16.180340],
    normals: [0.000000, 0.950597, -0.310427, -0.297859, 0.793781, -0.530275, 0.297859, 0.793781, -0.530275, -0.648809, 0.224952, -0.726941, -0.739165, 0.474887, -0.477616, -0.663470, 0.748203, 0.000000, -0.306594, 0.932128, -0.192713, -0.306594, 0.932128, 0.192713, 0.000000, 0.950597, 0.310427, 0.000000, 1.000000, 0.000000, 0.306594, 0.932128, -0.192713, 0.306594, 0.932128, 0.192713, 0.663470, 0.748203, 0.000000, 0.739165, 0.474887, -0.477616, 0.648809, 0.224952, -0.726941, 1.000000, 0.000000, -0.000000, 0.663470, -0.748203, 0.000000, 0.842688, -0.361691, -0.398819, 0.741954, 0.494623, 0.452607, 0.526330, -0.000000, 0.850280, 0.741954, -0.494623, 0.452607, 0.241608, 0.726781, 0.642974, -0.241608, 0.726781, 0.642974, -0.526330, 0.000000, 0.850280, 0.000000, -0.000000, 1.000000, -0.290216, -0.692409, 0.660564, 0.290216, -0.692409, 0.660564, -0.000000, -0.967558, 0.252650, 0.306594, -0.932128, 0.192713, 0.000000, -1.000000, 0.000000, 0.000000, -0.950597, -0.310427, 0.283138, -0.947758, -0.146924, -0.306594, -0.932128, 0.192713, -0.663470, -0.748203, 0.000000, -0.283138, -0.947758, -0.146924, -0.842688, -0.361691, -0.398819, -0.097055, -0.890215, -0.445083, 0.097055, -0.890215, -0.445083, -1.000000, 0.000000, -0.000000, -0.741954, 0.494623, 0.452607, -0.741954, -0.494623, 0.452607, -0.174021, -0.919434, 0.352643, -0.310517, 0.712481, 0.629245, 0.621972, -0.464763, 0.630195, 0.185828, -0.982582, -0.000002, -0.800268, -0.599643, -0.000003, 0.400134, 0.916457, -0.000002, -0.359485, -0.875630, -0.322556, -0.587396, -0.750438, -0.302998, -0.132593, -0.865413, -0.483197, 0.210427, -0.972367, -0.101105, 0.177699, 0.984085, 0.000005, 0.426745, 0.904372, -0.000007, -0.851167, 0.524895, 0.000020, -0.995912, 0.090329, 0.000002, 0.996113, -0.088081, -0.000011, 0.912965, -0.408038, -0.000020, -0.260375, -0.965508, -0.000017, -0.000009, -1.000000, -0.000011, 0.177692, 0.984086, 0.000000, 0.993298, 0.115586, 0.000000, -0.255330, 0.893224, -0.370078, -0.407679, -0.814595, -0.412593, 0.910384, -0.107805, -0.399473, 0.304743, -0.945796, -0.112256, 0.083507, 0.996507, 0.000001, -0.970405, 0.241485, -0.000002, 0.931721, -0.363176, 0.000000, -0.260368, -0.965509, -0.000002, 0.001238, 0.000000, -0.999999, 0.000000, 0.000000, -1.000000, 0.000619, -0.035281, -0.999377, -0.001238, 0.000000, -0.999999, -0.000619, -0.035281, -0.999377, 0.000619, 0.035281, -0.999377, -0.000619, 0.035281, -0.999377],
    //texCoord: [0.161133, 0.032784, 0.112547, 0.100586, 0.209718, 0.100586, 0.078474, 0.197266, 0.033934, 0.137514, 0.027388, 0.095611, 0.082520, 0.040835, 0.082520, 0.040835, 0.161133, 0.032784, 0.161133, 0.003906, 0.239746, 0.040835, 0.239746, 0.040835, 0.294878, 0.095611, 0.288332, 0.137514, 0.243792, 0.197266, 0.318359, 0.197266, 0.294878, 0.298921, 0.288332, 0.257017, 0.288332, 0.137514, 0.243792, 0.197266, 0.288332, 0.257017, 0.209718, 0.100586, 0.112547, 0.100586, 0.078474, 0.197266, 0.161133, 0.197266, 0.112547, 0.293945, 0.209718, 0.293945, 0.161133, 0.361747, 0.239746, 0.353697, 0.161133, 0.390625, 0.161133, 0.361747, 0.239746, 0.353697, 0.082520, 0.353697, 0.027388, 0.298921, 0.082520, 0.353697, 0.033934, 0.257017, 0.112547, 0.293945, 0.209718, 0.293945, 0.003906, 0.197266, 0.033934, 0.137514, 0.033934, 0.257017, 0.812500, 0.386719, 0.626953, 0.001953, 0.998047, 0.001953, 0.812500, 0.386716, 0.626954, 0.001953, 0.998046, 0.001953, 0.493266, 0.001953, 0.326172, 0.150412, 0.621093, 0.242165, 0.508444, 0.390624, 0.493266, 0.001953, 0.493267, 0.001953, 0.326172, 0.150413, 0.326172, 0.150412, 0.621093, 0.242165, 0.621094, 0.242166, 0.508444, 0.390625, 0.508444, 0.390624, 0.493266, 0.001953, 0.621093, 0.242165, 0.451787, 0.001953, 0.322266, 0.244580, 0.621094, 0.151904, 0.436408, 0.394530, 0.451786, 0.001953, 0.322266, 0.244580, 0.621093, 0.151905, 0.436408, 0.394531, -0.001953, 0.696289, 0.498047, 0.696289, 0.204154, 0.398438, 0.998047, 0.696289, 0.791939, 0.398438, 0.204154, 0.994141, 0.791939, 0.994141],
    indices: [0, 2, 1, 3, 4, 1, 5, 6, 4, 0, 1, 6, 4, 6, 1, 5, 7, 6, 8, 9, 7, 0, 6, 9, 7, 9, 6, 0, 9, 10, 8, 11, 9, 12, 10, 11, 9, 11, 10, 0, 10, 2, 12, 13, 10, 14, 2, 13, 10, 13, 2, 12, 15, 13, 16, 17, 15, 14, 13, 17, 15, 17, 13, 12, 18, 15, 19, 20, 18, 16, 15, 20, 18, 20, 15, 8, 21, 11, 19, 18, 21, 12, 11, 18, 21, 18, 11, 8, 22, 21, 23, 24, 22, 19, 21, 24, 22, 24, 21, 23, 25, 24, 19, 24, 26, 25, 26, 24, 27, 28, 26, 16, 20, 28, 19, 26, 20, 28, 20, 26, 27, 29, 28, 30, 31, 29, 16, 28, 31, 29, 31, 28, 27, 32, 29, 33, 34, 32, 30, 29, 34, 32, 34, 29, 33, 35, 34, 30, 34, 36, 30, 36, 37, 30, 37, 31, 16, 31, 17, 5, 4, 38, 3, 35, 4, 33, 38, 35, 4, 35, 38, 5, 38, 39, 33, 40, 38, 23, 39, 40, 38, 40, 39, 5, 39, 7, 23, 22, 39, 8, 7, 22, 39, 22, 7, 27, 25, 32, 23, 40, 25, 33, 32, 40, 25, 40, 32, 41, 43, 42, 41, 45, 44, 41, 42, 45, 42, 46, 45, 42, 43, 46, 43, 44, 46, 43, 41, 44, 41, 42, 41, 41, 42, 42, 42, 43, 42, 42, 43, 43, 43, 41, 43, 43, 41, 41, 47, 49, 48, 48, 49, 50, 51, 53, 52, 51, 54, 53, 55, 52, 56, 55, 51, 52, 54, 57, 53, 54, 58, 57, 58, 56, 57, 58, 55, 56, 59, 54, 51, 59, 48, 54, 60, 51, 55, 60, 59, 51, 48, 58, 54, 48, 50, 58, 50, 55, 58, 50, 60, 55, 47, 48, 59, 47, 48, 48, 49, 59, 60, 49, 47, 59, 48, 50, 48, 48, 50, 50, 50, 60, 50, 50, 49, 60, 61, 63, 62, 62, 63, 64, 61, 66, 65, 61, 62, 66, 63, 65, 67, 63, 61, 65, 62, 68, 66, 62, 64, 68, 64, 67, 68, 64, 63, 67, 69, 71, 70, 72, 70, 73, 71, 73, 70, 69, 70, 74, 72, 75, 70, 70, 75, 74]
};
Villain.prototype = Object.create(GameObj2.prototype);
// make degrees [0-360)
Villain.prototype.fixDegrees = function () {
    const _ = this;
    _.degrees %= 360;
    _.xdir = Math.cos(_.degrees * Math.PI / 180.0);
    _.zdir = Math.sin(_.degrees * Math.PI / 180.0);
};
Villain.prototype.turn = function (degreesRotation) {
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
Villain.prototype.update = function () {
    const _ = this;
    let move = K.speed.villain;

    if (_.fuelCell) {
        move *= K.speed.carryMul; // slower when carrying fuelcell
    }
    if (_.boosterCounter > 0) {
        move *= K.speed.boostMul;
    }

    _.fixDegrees();

    //Villain
    var target = _.fuelCell ? G.objects.heroGoalBottom : G.objects.target;

    //Find the closest Boost to the Villain
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
    
    //If the dragon is collided with a cloud then the villain can't see him
    for (var i = 0; i < G.objects.clouds.length; i++) {
        if (G.objects.target.isCollide(G.objects.clouds[i]) && G.objects.target.y > 0 ) {
            if (closestBoost != null) {
                target = closestBoost;
            } else {
                target = new FuelCell(Math.random()*300, 0, Math.random()*300, 0, 1);
            }
        }

    }


    //If Villain is carrying the fuelcell only go for a boost within a threshold
    const threshold = 20;
    var heroDist = distance(G.objects.hero.x, G.objects.hero.z, G.objects.villain.x, G.objects.villain.z);
    if (closestBoost != null)  {
        if (_.fuelCell) {
            if (heroDist <= 15) {
                target = G.boosters[Math.floor(Math.random()*numVisibleBoosts)];
            } else if (closestBoostDist <= threshold) {
                target = closestBoost;
            } 
            
        } else {    //Not holding the fuel cell
            if (closestBoostDist <= threshold) {
                target = closestBoost;
            }
        }
        
    }

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
    K.aiSmartTurn = true;
    let targetDegrees = Math.atan2(target.z - _.z, target.x - _.x) * 180 / Math.PI;
    targetDegrees %= 360;

    // degrees to turn
    const rightDegrees = targetDegrees + (targetDegrees >= _.degrees ? 0 : 360) - _.degrees;
    const leftDegrees = _.degrees - (targetDegrees - (targetDegrees <= _.degrees ? 0 : 360));
    // turn
    if (rightDegrees < leftDegrees) {
        _.turn(Math.min(K.speed.turn, rightDegrees));
    }
    else {
        _.turn(Math.max(-K.speed.turn, -leftDegrees));
    }
    _.move(+move * keepMoving); // forward
    
    //Collide with rocket
    if (_.isCollide(G.objects.rocket.rocket)) {
        const centerX = (_.x + G.objects.rocket.rocket.x) / 2;
        const centerZ = (_.z + G.objects.rocket.rocket.z) / 2;
        let v = [_.x - centerX, _.z - centerZ];
        normalize(v);
        v[0] *= -0.5;
        v[1] *= -0.5;
        const o = G.objects.rock.rock;
        o.x = clamp(o.x + v[0], 0 + o.bounding_cir_rad, K.arenaSize - o.bounding_cir_rad);
        o.z = clamp(o.z + v[1], 0 + o.bounding_cir_rad, K.arenaSize - o.bounding_cir_rad); 
    }

    //collide with rock
    if (villainInvulnerableTimer != 0 && villainInvulnerableTimer < 120) {
        villainInvulnerableTimer++;
        _.glow = [0.0,0.0,1.0,1.0]; // blue Color, on
    } else {
        villainInvulnerableTimer = 0;
        _.glow = [1.0,0.0,0.0,0.0]; // red Color, off
        if (_.isCollide(G.objects.rock.rock) && G.objects.rock.inMotion) {
            _.health -= 1;
            villainInvulnerableTimer++;
        }
    }

    if (_.isCollide(G.objects.rock.rock)) {
        const centerX = (_.x + G.objects.rock.rock.x) / 2;
        const centerZ = (_.z + G.objects.rock.rock.z) / 2;
        let v = [_.x - centerX, _.z - centerZ];
        normalize(v);
        v[0] *= -0.5;
        v[1] *= -0.5;
        const o = G.objects.rock.rock;
        o.x = clamp(o.x + v[0], 0 + o.bounding_cir_rad, K.arenaSize - o.bounding_cir_rad);
        o.z = clamp(o.z + v[1], 0 + o.bounding_cir_rad, K.arenaSize - o.bounding_cir_rad); 
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

    // collide with pedestal
    if (_.isCollide(G.objects.pedestal)) {
        G.ratsMove = true;
    } 

    // get fuelcell
    if (_.fuelCell == null && G.objects.target.captured == false && _.isCollide(G.objects.target)) {
        _.fuelCell = G.objects.target;
        G.objects.target.captured = true;
    }
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
    // set carried fuelcell positionwd
    if (_.fuelCell) {
        if (_.fuelCell == G.objects.rock.rock) {
            _.fuelCell.x = _.x - Math.sin(radians(armDir)) * (_.bounding_cir_rad + 2);
            _.fuelCell.z = _.z - Math.cos(radians(armDir)) * (_.bounding_cir_rad + 2);
            _.fuelCell.y = 1;
        } else {
            _.fuelCell.x = _.x - Math.sin(radians(armDir)) * (_.bounding_cir_rad + 1);
            _.fuelCell.z = _.z - Math.cos(radians(armDir)) * (_.bounding_cir_rad + 1);
            _.fuelCell.y = 0;
        }
    }

};

function distance (x,y,a,b) {
    return Math.sqrt((x-a)*(x-a)+(y-b)*(y-b));
}

Villain.prototype.show = function (degrees) {
    armDir = G.heroSpin;
    const _ = this;
    //const d = _.degrees; // save degrees
    //if (degree != undefined) _.degrees = degrees; // rotate mesh
    if (villainInvulnerableTimer > 0 && _.boosterCounter > 0) {
        _.glow = [1.0, 0.0, 1.0, 1.0];
    } else if (villainInvulnerableTimer > 0) {
        _.glow = [0.0, 0.0, 1.0, 1.0];
    } else if (_.boosterCounter > 0) {
        _.glow = [1.0, 0.0, 0.0, 1.0];
    } else {
        _.glow[3] = 0.0;
    }
    GameObj2.prototype.show.call(this); // show
    //_.degrees = d; // restore degrees
};
