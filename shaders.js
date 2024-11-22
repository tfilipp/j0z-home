const canvas = document.getElementById('shader-canvas');
const gl = canvas.getContext('webgl');

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    return program;
}

const vertexShaderSource = `
    attribute vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    uniform float time;
    uniform vec2 resolution;

    void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        float wave = sin(uv.x * 10.0 + time) * 0.5 + 0.5;
        wave *= sin(uv.y * 8.0 + time * 0.5) * 0.5 + 0.5;
        vec3 color1 = vec3(0.306, 0.806, 0.769);
        vec3 color2 = vec3(1.0, 0.42, 0.42);
        vec3 finalColor = mix(color1, color2, wave);
        float glow = pow(wave, 3.0) * 0.5;
        finalColor += glow * vec3(0.2, 0.4, 0.6);
        gl_FragColor = vec4(finalColor * 0.3, 0.1);
    }
`;

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}

gl.useProgram(program);

const positions = new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    1, 1,
]);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(program, 'position');
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

const timeLocation = gl.getUniformLocation(program, 'time');
const resolutionLocation = gl.getUniformLocation(program, 'resolution');

setCanvasSize();
window.addEventListener('resize', setCanvasSize);

function render(time) {
    time *= 0.001;
    gl.uniform1f(timeLocation, time);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
}

requestAnimationFrame(render);