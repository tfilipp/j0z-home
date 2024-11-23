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
    uniform vec3 color1;
    uniform vec3 color2;

    vec2 rotate2D(vec2 uv, float a) {
        float s = sin(a);
        float c = cos(a);
        return mat2(c, -s, s, c) * uv;
    }

    void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * resolution.xy) / resolution.y;
        
        // Создаем несколько слоев волн
        float waves = 0.0;
        
        // Первый слой - медленные большие волны
        vec2 uv1 = rotate2D(uv, time * 0.1);
        waves += sin(uv1.x * 2.0 + time) * 0.5 + 0.5;
        waves += sin(uv1.y * 2.0 + time * 0.8) * 0.5 + 0.5;
        
        // Второй слой - быстрые маленькие волны
        vec2 uv2 = rotate2D(uv, -time * 0.2);
        waves += sin(uv2.x * 8.0 - time * 2.0) * 0.25 + 0.25;
        waves += sin(uv2.y * 8.0 - time * 1.6) * 0.25 + 0.25;
        
        // Добавляем круговые волны
        float dist = length(uv);
        waves += sin(dist * 10.0 - time * 2.0) * 0.2 + 0.2;
        
        // Нормализуем волны
        waves = waves / 3.0;
        
        // Смешиваем цвета
        vec3 finalColor = mix(color1, color2, waves);
        
        // Добавляем свечение
        float glow = pow(waves, 2.0) * 0.5;
        finalColor += glow * mix(color2, color1, waves);
        
        // Добавляем виньетку
        float vignette = 1.0 - smoothstep(0.5, 1.5, length(uv));
        finalColor *= vignette;
        
        gl_FragColor = vec4(finalColor * 0.3, 0.15);
    }
`;

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

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
const color1Location = gl.getUniformLocation(program, 'color1');
const color2Location = gl.getUniformLocation(program, 'color2');

function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}

setCanvasSize();
window.addEventListener('resize', setCanvasSize);

const colors = [
    { primary: [0.486, 0.227, 0.929], secondary: [0.176, 0.831, 0.749] },  // Фиолетовый и бирюзовый
    { primary: [0.925, 0.282, 0.600], secondary: [0.204, 0.827, 0.600] },  // Розовый и зеленый
    { primary: [0.231, 0.510, 0.965], secondary: [0.961, 0.620, 0.043] }   // Синий и оранжевый
];

let colorIndex = 0;
let lastColorChange = 0;
const COLOR_CHANGE_INTERVAL = 5000; // 5 секунд

function render(time) {
    time *= 0.001;

    if (time - lastColorChange > COLOR_CHANGE_INTERVAL / 1000) {
        colorIndex = (colorIndex + 1) % colors.length;
        lastColorChange = time;
    }

    const currentColors = colors[colorIndex];
    const nextColors = colors[(colorIndex + 1) % colors.length];
    const t = (time - lastColorChange) / (COLOR_CHANGE_INTERVAL / 1000);
    
    const interpolatedColor1 = currentColors.primary.map((c, i) => 
        c + (nextColors.primary[i] - c) * t
    );
    const interpolatedColor2 = currentColors.secondary.map((c, i) => 
        c + (nextColors.secondary[i] - c) * t
    );

    gl.uniform1f(timeLocation, time);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform3fv(color1Location, interpolatedColor1);
    gl.uniform3fv(color2Location, interpolatedColor2);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
}

requestAnimationFrame(render);