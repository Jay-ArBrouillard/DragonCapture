function Pedestal(x, y, z, degrees, texSrc) {
    GameObj2.call(this, x, y, z, degrees, 5);
    const _ = this;
    _.scale = 0.3;
    _.mesh = pedestalMeshv2;
    _.texture = loadTexture(texSrc);
    //_.textureMatrix = mult(rotateZ(90), scalem(1, 1, 1)); // cylindrical texture mapping
}

Pedestal.prototype = Object.create(GameObj2.prototype);
Pedestal.prototype.show = function () {
    const _ = this;
    _.glow[3] = _.boosterCounter > 0 ? 1 : 0;
    GameObj2.prototype.show.call(this); // show
    //_.fuelCell && _.fuelCell.show(); // show carried fuelcell
};