import { Injectable } from '@angular/core';
import {WebGLService} from "../WebGL/web-gl.service";
import {Circle} from "../../../models/circle";
import {toCanvasCoordinate} from "../../../models/coordinate";

@Injectable({
  providedIn: 'root'
})
export class CircleDrawerService extends WebGLService {

  private vertexSrc = [
    'attribute vec2 position;',
    'void main() {',
    ' gl_Position = vec4(position, 0.0, 1.0);',
    '}'
  ].join('\n');

  private fragmentSrc = [
    'precision highp float;',
    'uniform vec4 color;',
    'void main() {',
    ' gl_FragColor = color;',
    '}'
  ].join('\n');

  constructor() {
    super();
  }

  /**
   * Draws a circle to the WebGL Canvas
   * @param circle the circle to be drawn
   */
  public drawCircle(circle: Circle): void {
    //Ensure the WebGL components have been initialized
    if(!this.initialize()){
      console.log("Failed to initialize Circle Drawer Service.");
      return;
    }

    //Set the WebGL context to use the Circle Program and Buffer
    this.updateContext();

    //Insert the vertex positions into the buffer
    const positions = this.calculatePositions(circle);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);

    //Pass the circle color into the fragment shader color uniform
    const colorUniform = this.gl.getUniformLocation(this.program, 'color');
    this.gl.uniform4fv(colorUniform, [circle.color.r, circle.color.g, circle.color.b, circle.color.a]);

    //Pass the circle vertices into the vertex shader position attribute
    const positionAttrib = this.gl.getAttribLocation(this.program, 'position');
    this.gl.enableVertexAttribArray(positionAttrib);
    this.gl.vertexAttribPointer(positionAttrib, 2, this.gl.FLOAT, false, 0, 0);

    //Draw the circle
    this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, positions.length/2);
  }

  /**
   * Initializes all of the service's WebGL components
   * @private
   * @return boolean specifies whether initialization was successful
   */
  private initialize(): boolean {
    if(this.isInitialized()){
      return true;
    }

    //Initialize Shaders
    this.initializeShader(this.gl.VERTEX_SHADER, this.vertexSrc);
    this.initializeShader(this.gl.FRAGMENT_SHADER, this.fragmentSrc);

    if(!this.vertexShader || !this.fragmentShader){
      return false;
    }

    //Initialize Program
    this.initializeProgram(this.vertexShader, this.fragmentShader);

    if(!this.program){
      return false;
    }

    this.initializeBuffer();

    return this.buffer != null;
  }

  private isInitialized(): boolean {
    return this.gl != null
      && this.vertexShader != null
      && this.fragmentShader != null
      && this.program != null
      && this.buffer != null;
  }

  private updateContext(){
    this.gl.useProgram(this.program);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
  }

  /**
   * Calculates the vertices of the circle
   * @param circle
   * @private
   * @return number[] an array of calculated vertex positions
   */
  private calculatePositions(circle: Circle): number[] {
    const positions: number[] = [];

    //Centre Point
    positions.push(toCanvasCoordinate(circle.location.x, this.gl.canvas.width)); //x
    positions.push(toCanvasCoordinate(circle.location.y, this.gl.canvas.height));

    for(let i = 0; i<circle.resolution+1; i++){
      const angle = (i * 2 * Math.PI) / circle.resolution;
      const pointX = circle.location.x + (circle.radius * Math.cos(angle))
      const pointY = circle.location.y + (circle.radius * -Math.sin(angle));

      positions.push(toCanvasCoordinate(pointX, this.gl.canvas.width));
      positions.push(toCanvasCoordinate(pointY, this.gl.canvas.height));
    }

    return positions;
  }

}

