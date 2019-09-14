function Ground() {
    GameObj2.call(this, 0, 0, 0, 0, 0);
    const _ = this;
    _.scale = K.arenaSize;
    _.mesh = Ground.mesh;
    _.texture = loadTexture("assets/stoneFloor.png");
}
Ground.mesh = {
    vertices: [
        1, 0, 1,
        0, 0, 1,
        0, 0, 0,
        1, 0, 0,
    ],
    normals: [
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
    ],
    texCoord: [
        0, 0,
        0, 32,
        32, 32,
        32, 0,
    ],
    indices: [
        0, 2, 1,
        0, 3, 2,
    ]
};

Ground.prototype = Object.create(GameObj2.prototype);
function Wall() {
    GameObj2.call(this, 0, 0, 0, 0, 0);
    const _ = this;
    _.scale = K.arenaSize;
    _.scaleMatrix = scalem(K.arenaSize, K.wallHeight, K.arenaSize);
    _.mesh = Wall.mesh;
    _.texture = loadTexture("assets/Wall.png");
}
Wall.mesh = {
    vertices: [
        // north
        0, 0, 0,
        0, 1, 0,
        1, 1, 0,
        1, 0, 0,
        // south
        0, 0, 1,
        0, 1, 1,
        1, 1, 1,
        1, 0, 1,
        // west
        0, 0, 0,
        0, 1, 0,
        0, 1, 1,
        0, 0, 1,
        // east
        1, 0, 0,
        1, 1, 0,
        1, 1, 1,
        1, 0, 1,
    ],
    normals: [
        // north
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        // south
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
    ],
    texCoord: [
        0, 0, 0, 1, 32, 1, 32, 0,
        0, 0, 0, 1, 32, 1, 32, 0,
        0, 0, 0, 1, 32, 1, 32, 0,
        0, 0, 0, 1, 32, 1, 32, 0,
    ],
    indices: [
        0, 2, 1,
        0, 3, 2,
        4 + 0, 4 + 1, 4 + 2,
        4 + 0, 4 + 2, 4 + 3,
        8 + 0, 8 + 1, 8 + 2,
        8 + 0, 8 + 2, 8 + 3,
        12 + 0, 12 + 2, 12 + 1,
        12 + 0, 12 + 3, 12 + 2,
    ]
};
Wall.prototype = Object.create(GameObj2.prototype);
