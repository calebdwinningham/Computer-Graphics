/**
 * simple_transform_example_render4.js, By Wayne Brown, Spring 2016*
 */

/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 C. Wayne Brown
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

"use strict";

//-------------------------------------------------------------------------
/**
 * Initialize and render a scene.
 * @param learn Learn_webgl An instance of Learn_webgl
 * @param vshaders_dictionary Object a set of vertex shaders
 * @param fshaders_dictionary Object a set of fragment shaders
 * @param models Object a set of models
 * @param controls Array a list of control id's
 * @constructor
 */
window.SceneSimpleExampleRender4 = function (learn, vshaders_dictionary,
                                         fshaders_dictionary, models, controls) {

  var Component = function(x, y , z){
    this.x = x;
    this.y = y;
    this.z = z;
  };

  // Private variables
  var self = this; // Store a local reference to the new object.

  var out = learn.out;
  var events;
  var canvas;//
  var gl = null;//
  var program = null;
  var next = null;
  var render_models = {};

  var matrix = new Learn_webgl_matrix();
  var transform = matrix.create();
  var view = matrix.create();
  var view_rotate_x= matrix.create();
  var view_rotate_y= matrix.create();
  var new_rotation = matrix.create();
  var cube_rotation = matrix.create();
  var con_transform = matrix.create();
  var transformed = matrix.create();
  var translated = matrix.create();
  var cube_translate = matrix.create();
  var widget_translate = matrix.create();
  var transformer = matrix.create();
  var offset = matrix.create();
  var camera = matrix.create();
  var p4 = new Learn_webgl_point4();
  var V = new Learn_webgl_vector3();
  var P = new Learn_webgl_point4();

  //Container Limits
  this.max_x = 4.0;
  this.max_y = 18.0;
  this.max_z = 4.0;

  var tetris = new TetrisContainer(self.max_x, self.max_y, self.max_z);
  self.widget = null;
  self.allCubes = [];
  self.allCubesLocations = [];
  self.next_widget = null;

  self.eye       = P.create(20, 20, 20);  // (x,y,z), origin
  self.center    = P.create(0, 7, 0); // (x,y,z), down -Z axis
  self.up_vector = V.create(0, 1, 0);  // <dx,dy,dz>, up Y axis
  matrix.lookAt(camera, self.eye[0], self.eye[1], self.eye[2], self.center[0], self.center[1], self.center[2],
    self.up_vector[0], self.up_vector[1], self.up_vector[2]);
  self.view_angle_x = 0;
  self.view_angle_y = 0;
  var projection = matrix.createPerspective(65, 350/450, 1, 100);

  // Set the forearm_translate to a constant translation along the Y axis
  //matrix.translate(models.Container, 0, 0, 0);
  matrix.translate(models.Cube, 0, 1, 0);

  // Manipulates the view by x degrees to x y and z
  matrix.setIdentity(cube_rotation);
  matrix.setIdentity(view);
  matrix.setIdentity(new_rotation);
  matrix.setIdentity(translated);

  // Public variables that will be changed by event handlers or that
  // the event handlers need access to.
  self.canvas_id = learn.canvas_id;

  self.animate_active = true;//

  var widget1 = [new Component(0,0,0),
                 new Component(-2,0,0),
                 new Component(0,-2,0)];
  var widget2 = [new Component(0,0,0),
                 new Component(2,0,0),
                 new Component(-2,0,0),
                 new Component(0,-2,0)];
  var widget3 = [new Component(0,0,0),
                 new Component(2,0,0),
                 new Component(-2,0,0),

                 new Component(2,-2,0)];
  var widget4 = [new Component(0,0,0),
                 new Component(2,0,0)];
  var widget5 = [new Component(0,0,0)];

  var all_widgets = [widget1, widget2, widget3, widget4, widget5];//widget4 and widget3 and widget2
  self.next_widget = all_widgets[Math.floor(Math.random()*all_widgets.length)];

  self.new_widget = function(){
    self.current_widget = self.next_widget;
    self.next_widget = all_widgets[Math.floor(Math.random()*all_widgets.length)];
    self.widget_location = new Component(1.0,16.0,1.0);
    if(!self.isValid()){
      alert("Game Over. Press Okay to Play Again.");
      self.newGame();
    }
  };

  // Light model
  var P4 = new Learn_webgl_point4();
  var V2 = new Learn_webgl_vector3();
  self.light_position = P4.create(20,20,20,1);
  self.light_color = V2.create(1,1,1); // white light
  self.shininess = 30;
  self.ambient_color = V2.create(.2,.2,.2); // low level white light
  var light_in_camera_space = P4.create();
  var vm_transform = matrix.create();

  self.addWidget = function() {
    var centers = [];
    for (var j = 0; j < self.current_widget.length; j++) {
      centers.push(p4.create(self.current_widget[j].x, self.current_widget[j].y, self.current_widget[j].z))
    }
    var pt = p4.create();
    matrix.translate(widget_translate, self.widget_location.x, self.widget_location.y, self.widget_location.z);
    for (var k = 0; k < centers.length; k++) {
      matrix.translate(offset, centers[k][0], centers[k][1], centers[k][2]);
      matrix.multiplySeries(transformed, widget_translate, cube_rotation, offset);
      matrix.multiplyP4(pt, transformed, [0,0,0,1]);
      var index = tetris.array2index(pt[0], pt[1], pt[2]);
      tetris.addCube(index[0], index[1], index[2], render_models.cube, transformed);
    }
  };

  //-----------------------------------------------------------------------
  // Public function to render the scene.
  self.render = function () {

    // Clear the entire canvas window background with the clear color and
    // the depth buffer to perform hidden surface removal.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // The base is being rotated by the animation callback so the rotation
    // about the y axis must be calculated on every frame.
    matrix.rotate(view_rotate_y, self.view_angle_y, 0, 1, 0);
    matrix.rotate(view_rotate_x, self.view_angle_x, 1, 0, 0);

    matrix.multiplyP4(light_in_camera_space, camera, self.light_position);
    gl.uniform3f(program.u_Light_position, light_in_camera_space[0],
                                             light_in_camera_space[1],
                                             light_in_camera_space[2]);
    gl.uniform3fv(program.u_Light_color, self.light_color);
    gl.uniform3fv(program.u_Ambient_color, self.ambient_color);
    gl.uniform1f(program.u_Shininess, self.shininess);

    // Combine the transforms into a single transformation

    matrix.multiplySeries(con_transform, projection, camera, view_rotate_y, view_rotate_x);
    matrix.multiplySeries(vm_transform, camera, view_rotate_y, view_rotate_x);


    // Draw the base model
    render_models.container.render(con_transform, vm_transform);

    tetris.renderAllCubes(projection, con_transform);

    next.render();

    matrix.translate(widget_translate, self.widget_location.x, self.widget_location.y, self.widget_location.z);

    // Calculate the transform for the forearm
    for (var i = 0; i<self.current_widget.length; i++) {
      matrix.translate(cube_translate, self.current_widget[i].x, self.current_widget[i].y, self.current_widget[i].z);
      matrix.multiplySeries(transform, projection, camera, view, view_rotate_y, view_rotate_x, widget_translate, cube_rotation, cube_translate);
      matrix.multiplySeries(vm_transform, camera, view, view_rotate_y, view_rotate_x, widget_translate, cube_rotation, cube_translate);
      render_models.cube.render(transform, vm_transform);
    }
  };

  //-----------------------------------------------------------------------
  // Public function to delete and reclaim all rendering objects.
  self.delete = function () {
    // Clean up shader programs
    gl.deleteShader(program.vShader);
    gl.deleteShader(program.fShader);
    gl.deleteProgram(program);
    program = null;

    // Delete each model's buffer objects
    render_models.container.delete();
    render_models.cube.delete();
    render_models = null;

    // Disable any animation
    self.animate_active = false;

    // Remove all event handlers
    events.removeAllEventHandlers();
    events = null;

    // Release the GL graphics context
    gl = null;
  };

  self.ortho = function(){
    var l = -17;
    var r = -l;
    var t = 21.428;
    var b = -21;
    var depth = 40;
    projection = matrix.createOrthographic(l, r, b, t, -depth, depth);
  };

  self.perspective = function(){
    projection = matrix.createPerspective(65, canvas.width/canvas.height, 1, 100);
  };

  self.sideview = function(){
    self.view_angle_y = -45;
    self.view_angle_x = 0;
  };

  self.straightside = function(){
    self.view_angle_y = 45;
    self.view_angle_x = 0;
  };

  self.topview = function(){
    self.view_angle_y = -180;
    self.view_angle_x = 0;
  };

  self.camreset = function(){
    self.view_angle_y = 0;
    self.view_angle_x = 0;
  };

  self.rotate = function(angle, dx, dy, dz){
    var success = true;
    matrix.rotate(new_rotation, angle, dx, dy, dz);
    matrix.multiplySeries(cube_rotation, new_rotation, cube_rotation);
    var valid = self.isValid();
    if (valid === false) {
      matrix.rotate(new_rotation, -angle, dx, dy, dz);
      matrix.multiplySeries(cube_rotation, new_rotation, cube_rotation);
      success = false;
    }
    return success;
  };

  self.translate = function(dx, dy, dz) {
    var success = true;
    self.widget_location.x += dx;
    self.widget_location.y += dy;
    self.widget_location.z += dz;
    var valid = self.isValid();
    if (valid === false) {
      self.widget_location.x -= dx;

      self.widget_location.y -= dy;
      self.widget_location.z -= dz;
      success = false;
    }
    return success;
  };

  self.isValid = function(){
    var works = true;
    var centers = [];
    for(var j = 0; j<self.current_widget.length; j++) {
      centers.push(p4.create(self.current_widget[j].x, self.current_widget[j].y, self.current_widget[j].z))
    }
    var pt = p4.create();
    matrix.translate(widget_translate, self.widget_location.x, self.widget_location.y, self.widget_location.z);
    for (var k = 0; k < centers.length; k++) {
      matrix.translate(offset, centers[k][0], centers[k][1], centers[k][2]);
      matrix.multiplySeries(transformer, widget_translate, cube_rotation, offset);
      matrix.multiplyP4(pt, transformer, [0,0,0,1]);
        var index = tetris.array2index(pt[0], pt[1], pt[2]);
        if ((pt[0] > self.max_x) ||
          (pt[0] < (-1 * self.max_x)) ||
          (pt[1] > self.max_y) ||
          (pt[1] < 1) ||
          (pt[2] > self.max_z) ||
          (pt[2] < (-1 * self.max_z))||
          (!tetris.locationIsEmpty(index[0], index[1], index[2]))) {
          works = false;
        }
      }
    return works;
  };

  self.newGame = function(){
    tetris.removeAllCubes();
    self.new_widget();
  };

  self.remove = function(){
    tetris.removeFullLevels();
  };


  //-----------------------------------------------------------------------
  // Object constructor. One-time initialization of the scene.

  // Get the rendering context for the canvas
  canvas = learn.getCanvas(self.canvas_id);
  if (canvas) {
    gl = learn.getWebglContext(canvas);
    if (!gl) {
      return;
    }
  }


  // Enable hidden-surface removal
  gl.enable(gl.DEPTH_TEST);

  // Set up the rendering shader program and make it the active shader program
  program = learn.createProgram(gl, vshaders_dictionary.shader05, fshaders_dictionary.shader05);
  gl.useProgram(program);

  // Create the Buffer Objects needed for this model and copy
  // the model data to the GPU.
  render_models.container = new Learn_webgl_model_render_05(gl, program, models.Container, out);
  render_models.cube = new Learn_webgl_model_render_05(gl, program, models.Cube, out);

  // Set up callbacks for the user and timer events
  next = new window.nextpiece(learn, vshaders_dictionary,
                                         fshaders_dictionary, models, controls, self);
  events = new SimpleTransformExampleEvents4(self, next, controls);
  events.animate();
  self.widget = self.new_widget();
};
