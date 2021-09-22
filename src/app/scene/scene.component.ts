import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-scene',
  templateUrl: './scene.component.html',
  styleUrls: ['./scene.component.scss']
})
export class SceneComponent implements AfterViewInit {

  canvasDimensions = {x: 720, y: 480};
  canvasClearColor = {r: 0, g: 0, b: 0, a: 1};

  @ViewChild('sceneCanvas') private canvas: ElementRef<HTMLCanvasElement> | undefined;
  private _renderingContext: CanvasRenderingContext2D | ImageBitmapRenderingContext | WebGLRenderingContext | WebGL2RenderingContext | null | undefined;

  private get gl(): WebGLRenderingContext {
    return this._renderingContext as WebGLRenderingContext;
  }

  constructor() { }

  ngAfterViewInit(): void {
    if (!this.canvas) {
      console.log('Canvas not supplied! Cannot bind WebGL context!');
      return;
    }

    //Initialize WebGL context
    this._renderingContext = this.canvas.nativeElement.getContext('webgl');
    if(!this.gl) {
      console.log("Unable to initialize WebGL. Your browser may not support it.")
      return;
    }

    //Set Canvas Dimensions
    this.gl.canvas.width = this.canvas.nativeElement.clientWidth;
    this.gl.canvas.height = this.canvas.nativeElement.clientHeight;

    //Initialize Canvas
    this.gl.clearColor(
      this.canvasClearColor.r,
      this.canvasClearColor.g,
      this.canvasClearColor.b,
      this.canvasClearColor.a
    );

    // Clear the colour as well as the depth buffer.
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.drawCircle(360, 100, this.gl.canvas.width/2, this.gl.canvas.height/2);
  }

  private drawCircle(resolution: number, radius: number, x: number, y: number): void {
    //Vertex Shader
    const vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
    if (!vertexShader) {
      console.log("Failed to create vertex shader.");
      return;
    }

    this.gl.shaderSource(vertexShader, [
      'attribute vec2 position;',
      'void main() {',
      ' gl_Position = vec4(position, 0.0, 1.0);',
      '}'
    ].join('\n'));

    this.gl.compileShader(vertexShader);

    if (!this.gl.getShaderParameter(vertexShader, this.gl.COMPILE_STATUS)) {
      console.log('An error occurred compiling the vertex shader: ' + this.gl.getShaderInfoLog(vertexShader));
      this.gl.deleteShader(vertexShader);
      return;
    }

    //Fragment Shader
    const fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    if (!fragmentShader) {
      console.log("Failed to create fragment shader.");
      return;
    }

    this.gl.shaderSource(fragmentShader, [
      'precision highp float;',
      'uniform vec4 color;',
      'void main() {',
      ' gl_FragColor = color;',
      '}'
    ].join('\n'));

    this.gl.compileShader(fragmentShader);

    if (!this.gl.getShaderParameter(fragmentShader, this.gl.COMPILE_STATUS)) {
      console.log('An error occurred compiling the fragment shader: ' + this.gl.getShaderInfoLog(fragmentShader));
      this.gl.deleteShader(fragmentShader);
      return;
    }

    //Initialize the Shader Program
    const circleProgram = this.gl.createProgram();
    if (!circleProgram) {
      console.log("Failed to create shader program.");
      return;
    }

    this.gl.attachShader(circleProgram, vertexShader);
    this.gl.attachShader(circleProgram, fragmentShader);
    this.gl.linkProgram(circleProgram);

    if (!this.gl.getProgramParameter(circleProgram, this.gl.LINK_STATUS)) {
      console.log('Unable to initialize the circle shader program: ' + this.gl.getProgramInfoLog(circleProgram));
      return;
    }

    //Create ProgramInfo
    const circleProgramInfo = {
      program: circleProgram,
      attribLocations: {
        position: this.gl.getAttribLocation(circleProgram, 'position'),
      },
      uniformLocations: {
        color: this.gl.getUniformLocation(circleProgram, 'color'),
      },
    }

    //Initialize Buffer
    const circleBuffer = this.gl.createBuffer();

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, circleBuffer);

    //Circle positions
    const positions = [];

    //Centre point
    positions.push(this.toCanvasCoordinate(x, this.gl.canvas.width)); //x
    positions.push(this.toCanvasCoordinate(y, this.gl.canvas.height)); //y

    for(let i = 0; i<resolution+1; i++){
      let angle = (i * 2 * Math.PI) / resolution;
      let pointX = x + (radius * Math.cos(angle))
      let pointY = y + (radius * -Math.sin(angle));

      positions.push(this.toCanvasCoordinate(pointX, this.gl.canvas.width));
      positions.push(this.toCanvasCoordinate(pointY, this.gl.canvas.height));
    }

    console.log(positions);

    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);

    //Draw the circle
    this.gl.useProgram(circleProgram);

    //Color the circle white
    circleProgramInfo.uniformLocations.color = this.gl.getUniformLocation(circleProgram, 'color');
    this.gl.uniform4fv(circleProgramInfo.uniformLocations.color, [1, 1, 1, 1]);

    circleProgramInfo.attribLocations.position = this.gl.getAttribLocation(circleProgram, 'position');
    this.gl.enableVertexAttribArray(circleProgramInfo.attribLocations.position);
    this.gl.vertexAttribPointer(circleProgramInfo.attribLocations.position, 2, this.gl.FLOAT, false, 0, 0);

    this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, positions.length/2);
  }

  private toCanvasCoordinate(c: number, resolution: number): number {
    return (c - (resolution/2)) / (resolution/2);
  }

  private toScreenCoordinate(c: number, resolution: number): number {
    return (c * (resolution/2)) + (resolution/2)
  }

}
