function Sun(x, y, z, degrees, texSrc) {
    GameObj2.call(this, x, y, z, degrees, 5);
    const _ = this;
    _.scale = 5.0;
    _.mesh = sphereGridMesh;
    _.texture = loadTexture(texSrc);
    _.textureMatrix = mult(rotateZ(90), scalem(1, 1/10, 1)); // cylindrical texture mapping
};

Sun.prototype = Object.create(GameObj2.prototype);
Sun.prototype.show = function () {
    const _ = this;
    _.glow[3] = _.boosterCounter > 0 ? 1 : 0;
    GameObj2.prototype.show.call(this); // show
    _.degrees = (_.degrees + 0.1) % 360;

};