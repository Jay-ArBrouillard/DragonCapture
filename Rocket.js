var rocketInMotion = false;
var destinationHeight = 30;
var rocketHeight;
var tweenFactor = "increasing";
var fireTween = 0;
var explosionIndex = 0;
function Rocket(x, y, z, degrees, texSrc) {
    GameObj2.call(this, x, y, z, degrees, 2);
    const _ = this;
    _.scale = 0.25;
    _.mesh = bombMesh;
    _.texture = loadTexture(texSrc);
    _.textureMatrix = mult(rotateZ(90), scalem(1, 1, 1)); // cylindrical texture mapping
};

Rocket.prototype = Object.create(GameObj2.prototype);
Rocket.prototype.update = function (inMotion) {
    const _ = this;
    rocketHeight = _.y;
    if (_.y < 9) {  //Rise rocket from floor
        _.y += 0.05;
        _.degrees += 1;
    } 

    if (inMotion != null) {
        rocketInMotion = inMotion;
    }

    if (rocketInMotion) {
        if (_.y <= destinationHeight) {
            _.y += 0.1;
        }

        if (G.objects.rocket.fire != null) {
            G.objects.rocket.fire.update();
        } 
    }

    if (_.y >= destinationHeight && explosionIndex < explosionCuts.length) {
        if (G.objects.rocket.rocket.scale >= 0) {
            _.scale -= 0.01;
        }

        if (G.objects.rocket.fire.scale >= 0) {
            G.objects.rocket.fire.scale -= 0.04;
        } 

        if (_.y >= destinationHeight && explosionIndex < explosionCuts.length) {
            G.objects.rocket.explosion.push(new Explosion(G.objects.rocket.rocket.x, 0, G.objects.rocket.rocket.z, 0, "assets/explosionTexture.png"));
        }
    }

    if (explosionIndex >= explosionCuts.length) {
        G.objects.rocket.rocket = null;
        G.objects.rocket.fire = null;
    }

};

Rocket.prototype.inMotion = function () { return rocketInMotion;}

Rocket.prototype.show2 = function () {
    const _ = this;
    GameObj2.prototype.show.call(this); // show
};
Rocket.prototype.show = function (degrees) {
    const _ = this;
    const d = _.degrees; // save degrees
    _.degrees = degrees+2; // rotate mesh faster than normal
    GameObj2.prototype.show.call(this); // show
    _.degrees = d; // restore degrees
};

function Fire(x, y, z, degrees, texSrc) {
    GameObj2.call(this, x, y, z, degrees, 2);
    const _ = this;
    _.scale = 1;
    _.mesh = fireMesh;
    _.texture = loadTexture(texSrc);
    _.textureMatrix = mult(rotateZ(90), scalem(1, 1, 1)); // cylindrical texture mapping
};

Fire.prototype = Object.create(GameObj2.prototype);
Fire.prototype.update = function () {
    const _ = this;
    if (rocketInMotion) {
        if (tweenFactor === "increasing") {
            _.y += 0.05;
            fireTween++;
        } else if (tweenFactor === "decreasing") {
            _.y -= 0.05;
            fireTween++;
        }

        if (fireTween == 30 && tweenFactor == "increasing") {
            tweenFactor = "decreasing";
            fireTween = 0;
        } else if (fireTween == 30 && tweenFactor == "decreasing") {
            tweenFactor = "increasing";
            fireTween = 0;
        }

        if (_.y <= destinationHeight-13) {
            _.y += 0.1;
        }
    }

};

Fire.prototype.show = function (degrees) {
    const _ = this;
    const d = _.degrees; // save degrees
    _.degrees = degrees+1; // rotate mesh faster than normal
    GameObj2.prototype.show.call(this); // show
    _.degrees = d; // restore degrees
};

function Explosion(x, y, z, degrees, texSrc) {
    GameObj2.call(this, x, y, z, degrees, 35);
    const _ = this;
    _.scale = 0.5;
    _.mesh = explosionCuts[explosionIndex];
    explosionIndex++;
    _.texture = loadTexture(texSrc);
    _.textureMatrix = mult(rotateZ(90), scalem(1, 1, 1)); // cylindrical texture mapping
};

Explosion.prototype = Object.create(GameObj2.prototype);
Explosion.prototype.isDone = function () {
    var done = true;
    for (const key in G.objects.rocket.explosion) {
        if (G.objects.rocket.explosion[key].scale < 2) {
            return false;
        }
    }
    return done;
};

Explosion.prototype.show = function () {
    const _ = this;
    GameObj2.prototype.show.call(this); // show
};