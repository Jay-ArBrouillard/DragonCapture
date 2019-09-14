function Cloud(x, y, z, degrees, texSrc) {
    GameObj2.call(this, x, y, z, degrees, 10);
    const _ = this;
    _.scale = Math.random()*20+5;
    if (_.scale >= 15) {    //Prevent big clouds on ground
        _.y += 5;
    }

    _.bounding_cir_rad = _.scale;
    _.height = _.scale*1.5;
    switch (Math.floor(Math.random()*4)) {
        case 0: 
            _.mesh = cloud1Mesh;
            break;
        case 1:
            _.mesh = cloud2Mesh;
            break;
        case 2:
            _.mesh = cloud3Mesh;
            break;
        case 3:
            _.mesh = cloud4Mesh;
            break;
    }
    _.texture = loadTexture(texSrc);
}
Cloud.prototype = Object.create(GameObj2.prototype);
Cloud.prototype.update = function () {
    const _ = this;
    let move = K.speed.clouds;
    _.move(move);

        // bounce left or right wall
        if ((_.x < 0 + _.bounding_cir_rad) || (_.x > K.arenaSize - _.bounding_cir_rad)) {
            _.x = clamp(_.x, 0 + _.bounding_cir_rad, K.arenaSize - _.bounding_cir_rad);
            _.xdir = -_.xdir; // bounce
            _.degrees = Math.atan2(_.zdir, _.xdir) * 180 / Math.PI;

        }
        // bounce top or bottom wall
        if ((_.z < 0 + _.bounding_cir_rad) || (_.z > K.arenaSize - _.bounding_cir_rad)) {
            _.z = clamp(_.z, 0 + _.bounding_cir_rad, K.arenaSize - _.bounding_cir_rad);
            _.zdir = -_.zdir; // bounce
            _.degrees = Math.atan2(_.zdir, _.xdir) * 180 / Math.PI;

        }
};

Cloud.prototype.show = function (degree) {
    const _ = this;
    const d = _.degrees; // save degrees
    //_.degrees = degree; // rotate mesh
    GameObj2.prototype.show.call(this); // show
    _.degrees = d; // restore degrees
};