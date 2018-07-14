///**
// * simple_transform_example_render4.js, By Wayne Brown, Spring 2016*
// */
//
///**
// * The MIT License (MIT)
// *
// * Copyright (c) 2015 C. Wayne Brown
// *
// * Permission is hereby granted, free of charge, to any person obtaining a copy
// * of this software and associated documentation files (the "Software"), to deal
// * in the Software without restriction, including without limitation the rights
// * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// * copies of the Software, and to permit persons to whom the Software is
// * furnished to do so, subject to the following conditions:
// *
// * The above copyright notice and this permission notice shall be included in all
// * copies or substantial portions of the Software.
//
// * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// * SOFTWARE.
// */

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
window.nextpiece = function (learn, vshaders_dictionary,
                                         fshaders_dictionary, models, controls, main) {

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
  var render_models = {};

  self.new_widget = function(){
    self.current_widget = main.next_widget;
    self.widget_location = new Component(0,1,0);
  };

  self.new_widget();

  var matrix = new Learn_webgl_matrix();
  var transform = matrix.create();
  var projection = matrix.createOrthographic(-5, 5, -5, 5, -5, 5);//
  var view = matrix.create();
  var container_rotate_x= matrix.create();
  var container_rotate_y= matrix.create();
  var new_rotation = matrix.create();
  var cube_rotation = matrix.create();
  var cube_rotation_x = matrix.create();
  var cube_rotation_y = matrix.create();
  var con_transform = matrix.create();
  var transformed = matrix.create();
  var translated = matrix.create();
  var cube_translate = matrix.create();
  var widget_translate = matrix.create();
  var transform2 = matrix.create();
  var camera = matrix.create();
  var V = new Learn_webgl_vector3();
  var P = new Learn_webgl_point4();

  self.eye       = P.create(10, 1, 1);  // (x,y,z), origin
  self.center    = P.create(0, 0, 0); // (x,y,z), down -Z axis
  self.up_vector = V.create(0, 1, 0);  // <dx,dy,dz>, up Y axis
  matrix.lookAt(camera, self.eye[0], self.eye[1], self.eye[2], self.center[0], self.center[1], self.center[2],
    self.up_vector[0], self.up_vector[1], self.up_vector[2]);
  self.view_angle_x = 0;
  self.view_angle_y = 0;
  var projection = matrix.createOrthographic(-5, 5, -5, 5, -5, 5);//

  // Set the forearm_translate to a constant translation along the Y axis
  //matrix.translate(models.Container, 0, 0, 0);
  matrix.translate(models.Cube, 0, 1, 0);

  // Manipulates the view by x degrees to x y and z
  matrix.setIdentity(cube_rotation);
  matrix.setIdentity(view);
  matrix.setIdentity(new_rotation);
  matrix.setIdentity(transformed);
  matrix.setIdentity(translated);

  // Light model
  var P4 = new Learn_webgl_point4();
  var V2 = new Learn_webgl_vector3();
  self.light_position = P4.create(20,20,20,1);
  self.light_color = V2.create(1,1,1); // white light
  self.shininess = 30;
  self.ambient_color = V2.create(.2,.2,.2); // low level white light
  var light_in_camera_space = P4.create();
  var vm_transform = matrix.create();

  // Public variables that will be changed by event handlers or that
  // the event handlers need access to.
  self.canvas_id = learn.canvas_id;
  self.container_angle_x = -20.0;
  self.container_angle_y = 10.0;

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

  self.new_widget();

  //-----------------------------------------------------------------------
  // Public function to render the scene.
  self.render = function () {

    // Clear the entire canvas window background with the clear color and
    // the depth buffer to perform hidden surface removal.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // The base is being rotated by the animation callback so the rotation
    // about the y axis must be calculated on every frame.
    matrix.rotate(container_rotate_y, self.container_angle_y, 1, 0, 0);
    matrix.rotate(container_rotate_x, self.container_angle_x, 0, 1, 0);
    matrix.rotate(cube_rotation_y, self.container_angle_y, 1, 0, 0);
    matrix.rotate(cube_rotation_x, self.container_angle_x, 0, 1, 0);


    matrix.multiplyP4(light_in_camera_space, camera, self.light_position);
    gl.uniform3f(program.u_Light_position, light_in_camera_space[0],
                                             light_in_camera_space[1],
                                             light_in_camera_space[2]);
    gl.uniform3fv(program.u_Light_color, self.light_color);
    gl.uniform3fv(program.u_Ambient_color, self.ambient_color);
    gl.uniform1f(program.u_Shininess, self.shininess);

    // Combine the transforms into a single transformation
    matrix.multiplySeries(con_transform, projection, view, container_rotate_y, container_rotate_x);

    matrix.translate(widget_translate, self.widget_location.x, self.widget_location.y, self.widget_location.z);

    // Calculate the transform for the forearm
    for (var i = 0; i<self.current_widget.length; i++) {
      matrix.translate(cube_translate, self.current_widget[i].x, self.current_widget[i].y, self.current_widget[i].z);
      matrix.multiplySeries(transform, projection, view, cube_rotation_y, cube_rotation_x, widget_translate, cube_rotation, cube_translate);
      matrix.multiplySeries(transform2, view, cube_rotation_y, cube_rotation_x, widget_translate, cube_rotation, cube_translate);
      render_models.cube.render(transform, transform2);
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



  //-----------------------------------------------------------------------
  // Object constructor. One-time initialization of the scene.

  // Get the rendering context for the canvas
  canvas = learn.getCanvas("W2_canvas");
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
  render_models.cube = new Learn_webgl_model_render_05(gl, program, models.Cube, out);

  self.widget = self.new_widget();
};