function initProgram(program) {
    G.program.id = program;
    // uniform
    G.program.u.viewMatrix = gl.getUniformLocation(G.program.id, "uViewMatrix");
    G.program.u.modelViewMatrix = gl.getUniformLocation(G.program.id, "uModelViewMatrix");
    G.program.u.normalMatrix = gl.getUniformLocation(G.program.id, "uNormalMatrix");
    G.program.u.projectionMatrix = gl.getUniformLocation(G.program.id, "uProjectionMatrix");
    G.program.u.textureMatrix = gl.getUniformLocation(G.program.id, "uTextureMatrix");
    G.program.u.texture = gl.getUniformLocation(G.program.id, "uTexture");
    G.program.u.lightPosition = gl.getUniformLocation(G.program.id, "uLightPosition");
    G.program.u.ambient = gl.getUniformLocation(G.program.id, "uAmbient");
    G.program.u.diffuse = gl.getUniformLocation(G.program.id, "uDiffuse");
    G.program.u.specular = gl.getUniformLocation(G.program.id, "uSpecular");
    G.program.u.shininess = gl.getUniformLocation(G.program.id, "uShininess");
    G.program.u.glow = gl.getUniformLocation(G.program.id, "uGlow");
    // attribute
    G.program.a.position = gl.getAttribLocation(G.program.id, "aPosition");
    G.program.a.normal = gl.getAttribLocation(G.program.id, "aNormal");
    G.program.a.texCoord = gl.getAttribLocation(G.program.id, "aTexCoord");
    // assert
    for (const i in G.program.u) {
        console.assert(G.program.u[i], i);
    }
    for (const i in G.program.a) {
        console.assert(G.program.a[i] >= 0, i);
    }
}
// create buffers
function initMesh(mesh) {
    if (!mesh.vBuffer) {
        mesh.vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(!mesh.id ? mesh.vertices : mesh.vertices[0].values), gl.STATIC_DRAW);
        mesh.nBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.normals || mesh.vertices[1].values), gl.STATIC_DRAW);
        mesh.iBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.iBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indices || mesh.connectivity[0].indices), gl.STATIC_DRAW);
        mesh.indicesLength = mesh.indices ? mesh.indices.length : mesh.connectivity[0].indices.length;
        if (mesh.texCoord || mesh.vertices[2].values) {
            mesh.tBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.tBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mesh.texCoord || mesh.vertices[2].values), gl.STATIC_DRAW);
        }
    }
    return mesh;
}
// bind buffers
function bindMesh(mesh) {
    if (!mesh.vBuffer) {
        initMesh(mesh);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vBuffer);
    gl.vertexAttribPointer(G.program.a.position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(G.program.a.position);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.nBuffer);
    gl.vertexAttribPointer(G.program.a.normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(G.program.a.normal);
    if (mesh.tBuffer) {
        gl.bindBuffer(gl.ARRAY_BUFFER, mesh.tBuffer);
        gl.vertexAttribPointer(G.program.a.texCoord, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(G.program.a.texCoord);
    }
    else {
        gl.vertexAttrib2f(G.program.a.texCoord, 0.5, 0.5);
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.iBuffer);
}
function loadTexture(src) {
    const $ = loadTexture;
    $.assets = $.assets || [];
    let result = $.assets[src];
    if (result) {
        return result;
    }
    result = gl.createTexture();
    $.assets[src] = result;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = src;
    image.onload = function () {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, result);
        //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    };
    return result;
}
function loadImage(src) {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = src;
    return image;
}
