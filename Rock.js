var turn = true;
var startCounter = false;
var count = 60;
function Rock(x, y, z, degrees, texSrc) {
    GameObj2.call(this, x, y, z, degrees, 2);
    const _ = this;
    _.scale = 5.0;
    _.mesh = smallRockMesh;
    _.texture = loadTexture(texSrc);
    _.textureMatrix = mult(rotateZ(90), scalem(1, 1/25, 1)); // cylindrical texture mapping
};

Rock.prototype = Object.create(GameObj2.prototype);

Rock.prototype.fixDegrees = function () {
    const _ = this;
    _.degrees %= 360;
    _.xdir = Math.cos(_.degrees * Math.PI / 180.0);
    _.zdir = Math.sin(_.degrees * Math.PI / 180.0);
};
Rock.prototype.turn = function (degreesRotation) {
    const _ = this;
   // _.degrees += degreesRotation;

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
    _.degrees = G.objects.hero.degrees;    
    
    _.fixDegrees();
};

Rock.prototype.update = function (inMotion) {
    const _ = this;
    if (inMotion) {
        const percent = count / 60;
        let move = 1 * percent;
        if (turn) {
            _.turn();
            startCounter = true;
            turn = false;
        }

        if (startCounter && count > 0) {
            _.move(+move * 1); // forward
            count--;
        } else if (count < 60) {
            startCounter = false;
            turn = true;
            count = 60;
            G.objects.rock.inMotion = false;
        }

        //Collide with rocket
        if (G.objects.rocket.rocket != null && _.isCollide(G.objects.rocket.rocket)) {
            G.objects.rocket.fire = new Fire(G.objects.rocket.rocket.x, G.objects.rocket.rocket.y-13, G.objects.rocket.rocket.z, 0, "assets/fireTexture.png");
            G.objects.rocket.rocket.update(true);
        }


        //Collide with Dragon
        if (_.isCollide(G.objects.target)) {
            G.objects.target.health -= 1;
        }
    }

};

Rock.prototype.show = function () {
    const _ = this;
    GameObj2.prototype.show.call(this); // show
};