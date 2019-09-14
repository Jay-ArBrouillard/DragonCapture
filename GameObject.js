function GameObject(program, x, y, z, degrees, bounding_cir_rad, ) {
    this.health = 3;
    this.x = x;
    this.y = y;
    this.z = z;
    this.degrees = degrees; 
    this.normalDegrees = degrees;
    this.degreesX;
    this.degreesZ;
    this.xdir = Math.cos(this.degrees * Math.PI / 180.0);
    this.zdir = Math.sin(this.degrees * Math.PI / 180.0);
    this.bounding_cir_rad = bounding_cir_rad;
    GameObject.prototype.turn = function (degreesRotation) {
        this.degrees = (this.degrees + degreesRotation) % 360;
        this.xdir = Math.cos(this.degrees * Math.PI / 180.0);
        this.zdir = Math.sin(this.degrees * Math.PI / 180.0);
    };
    // Pass in negative speed for backward motion
    GameObject.prototype.move = function (speed) {
        this.x = this.x + speed * this.xdir;
        this.z = this.z + speed * this.zdir;
    };
}
;
// more standarized game object
function GameObj2(x, y, z, degrees, bounding_cir_rad) {
    GameObject.call(this, G.program, x, y, z, degrees, bounding_cir_rad);
    const _ = this;
    _.scale = 1;
    _.textureMatrix = mat4();
    _.textureMatrix[3][3] = 0; // set to non 0 for cylindrical texture mapping
    _.isVisible = true;
    _.glow = [0, 0, 0, 0]; // no glow
    _.cullFace = gl.BACK;
}
GameObj2.prototype = Object.create(GameObject.prototype);
GameObj2.prototype.show = function () {
    const _ = this;
    if (!_.isVisible) {
        return;
    }
    bindMesh(_.mesh);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, _.texture);
    let m = G.program.viewMatrix;
    m = mult(m, translate(_.x, _.y, _.z));
    if (_ == G.objects.hero || _ == G.objects.villain) {
        m = mult(m, rotateY(-90));
    } else if (_ == G.objects.target) {
        m = mult(m, rotateY(180));
    }
    if (_.degreesX != null) {
        m = mult(m, rotateX(_.degreesX));
    }
    if (_.degreesZ != null) {
        m = mult(m, rotateX(_.degreesZ));
    }
    m = mult(m, rotateY(-_.degrees));
    m = mult(m, _.scaleMatrix || scalem(_.scale, _.scale, _.scale));
    gl.uniformMatrix4fv(G.program.u.modelViewMatrix, false, flatten(m));
    m = transpose(inverse(m));
    gl.uniformMatrix4fv(G.program.u.normalMatrix, false, flatten(m));
    gl.uniformMatrix4fv(G.program.u.textureMatrix, false, flatten(_.textureMatrix));
    gl.uniform4fv(G.program.u.glow, _.glow);
    if (_.cullFace) {
        gl.enable(gl.CULL_FACE);
        gl.cullFace(_.cullFace);
    } else {
        gl.disable(gl.CULL_FACE);
    }
    gl.drawElements(gl.TRIANGLES, _.mesh.indicesLength, gl.UNSIGNED_SHORT, 0);
    if (_.cullFace) {
        gl.disable(gl.CULL_FACE);
    }
    gl.disableVertexAttribArray(G.program.a.position);
    gl.disableVertexAttribArray(G.program.a.normal);
    gl.disableVertexAttribArray(G.program.a.texCoord);
};
GameObj2.prototype.isCollide = function (that, cloudIndex) {
    if (this.isVisible && that && that.isVisible) {
        if (this == G.objects.hero && that == G.objects.target && that.captured == false) {
            if (that.scale == 100) {
                return (length([that.x - this.x, that.z - this.z]) < that.bounding_cir_rad + this.bounding_cir_rad) && that.y <= -3;
            } else {
                return (length([that.x - this.x, that.z - this.z]) < that.bounding_cir_rad + this.bounding_cir_rad) && that.y <= 0;
            }
        } else if (this == G.objects.villain && that == G.objects.target && that.captured == false) {
            if (that.scale == 100) {
                return (length([that.x - this.x, that.z - this.z]) < that.bounding_cir_rad + this.bounding_cir_rad) && that.y <= -3;
            } else {
                return (length([that.x - this.x, that.z - this.z]) < that.bounding_cir_rad + this.bounding_cir_rad) && that.y <= 0;
            }
        } else if (this == G.objects.target && that == G.objects.hero && this.captured == false) {
            if (that.scale == 100) {
                return (length([that.x - this.x, that.z - this.z]) < that.bounding_cir_rad + this.bounding_cir_rad) && this.y <= -3;
            } else {
                return (length([that.x - this.x, that.z - this.z]) < that.bounding_cir_rad + this.bounding_cir_rad) && this.y <= 0;
            }
        } else if (this == G.objects.target && that == G.objects.villain && this.captured == false) {
            if (that.scale == 100) {
                return (length([that.x - this.x, that.z - this.z]) < that.bounding_cir_rad + this.bounding_cir_rad) && this.y <= -3;
            } else {
                return (length([that.x - this.x, that.z - this.z]) < that.bounding_cir_rad + this.bounding_cir_rad) && this.y <= 0;
            }
        }  

        if (this == G.objects.rock.rock && that == G.objects.rocket.rocket) {
            return (length([that.x - this.x, that.z - this.z]) < that.bounding_cir_rad + this.bounding_cir_rad) && that.y >= 9;
        }

        if (that == G.objects.booster0 || that == G.objects.booster1 || that == G.objects.booster2 || that == G.objects.booster3 || that == G.objects.booster4) {
            return (length([that.x - this.x, that.z - this.z]) < that.bounding_cir_rad + this.bounding_cir_rad) && that.y >= -1;
        }

        if (this == G.objects.target && that == G.objects.clouds[cloudIndex]) {
            const cMax = that.y + that.height/2;
            const cMin = that.y - that.height/2;
            return (length([that.x - this.x, that.z - this.z]) < that.bounding_cir_rad + this.bounding_cir_rad) && this.y >= cMin && this.y <= cMax;
        }

    }
    return this.isVisible && that && that.isVisible && (length([that.x - this.x, that.z - this.z]) <= that.bounding_cir_rad + this.bounding_cir_rad);

};

function distance(x, y, a, b) {
    return Math.sqrt((x - a) * (x - a) + (y - b) * (y - b));
}
