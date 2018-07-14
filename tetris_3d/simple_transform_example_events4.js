/**
 * Created by C17Caleb.Winningham on 3/14/2016.
 */
/**
 * simple_transform_example_events4.js, By Wayne Brown, Spring 2016
 *
 * These event handlers can modify the characteristics of a scene.
 * These will be specific to a scene's models and the models' attributes.
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
 * Handle the events for a scene renderer.
 * @param scene SceneSimpleExampleRender
 * @param control_id_list Array A list of the ID's for HTML controls
 * @constructor
 */
window.SimpleTransformExampleEvents4 = function (scene, next, control_id_list) {

  var self = this; // Store a local reference to the new object.

  // Private variables
  var canvas = scene.canvas;

  // Remember the current state of events
  var start_of_mouse_drag = null;
  var previous_time = Date.now();
  var animate_is_on = scene.animate_active;
  var instant = false;

  // Control the rate at which animations refresh
  var frame_rate = 16; // 16 milliseconds = 1/60 sec

  //-----------------------------------------------------------------------
  self.mouse_drag_started = function (event) {

    //console.log("started mouse drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
    start_of_mouse_drag = event;
    event.preventDefault();

    if (animate_is_on) {
      scene.animate_active = false;
    }
  };

  //-----------------------------------------------------------------------
  self.mouse_drag_ended = function (event) {

    //console.log("ended mouse drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
    start_of_mouse_drag = null;

    event.preventDefault();

    if (animate_is_on) {
      scene.animate_active = true;
      self.animate();
    }
  };


  //-----------------------------------------------------------------------
  self.mouse_dragged = function (event) {
    var delta_x;
    var delta_y;
    //console.log("drag event x,y = " + event.clientX + " " + event.clientY + "  " + event.which);
    if (start_of_mouse_drag) {
      delta_x = event.clientX - start_of_mouse_drag.clientX;
      delta_y = event.clientY - start_of_mouse_drag.clientY;

      scene.view_angle_y += delta_x;
      scene.view_angle_x += delta_y;
      scene.render();

      start_of_mouse_drag = event;
      event.preventDefault();
    }
  };

  //-----------------------------------------------------------------------
  self.key_event = function (event) {
    var bounds, keycode;

    bounds = canvas.getBoundingClientRect();
    // console.log("bounds = " + bounds.left + " " + bounds.right + "  " + bounds.top + "  " + bounds.bottom);
    // console.log("target = " + event.target);
    if (event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom) {
      keycode = (event.keyCode ? event.keyCode : event.which);
      // console.log(keycode + " keyboard event in canvas");
    }

    event.preventDefault();

    return false;
  };

  //------------------------------------------------------------------------------
  self.html_control_event = function (event) {
    var control;
    var i = 0;
    control = $(event.target);
    if (control) {
      switch (control.attr('id')) {
        case "pause":
          scene.animate_active = false;
          break;
        case "ortho":
          $('input[id=pers]').attr('checked',false); //http://stackoverflow.com/questions/2554116/how-to-clear-radio-button-in-javascript
          scene.ortho();
          break;
        case "pers":
          $('input[id=ortho]').attr('checked',false);
          scene.perspective();
          break;
        case "cam1":
          $('input[id=cam2]').attr('checked',false);
          $('input[id=cam3]').attr('checked',false);
          $('input[id=cam4]').attr('checked',false);
          scene.straightside();
          break;
        case "cam2":
          $('input[id=cam1]').attr('checked',false);
          $('input[id=cam3]').attr('checked',false);
          $('input[id=cam4]').attr('checked',false);
          scene.sideview();
          break;
        case "cam3":
          $('input[id=cam1]').attr('checked',false);
          $('input[id=cam2]').attr('checked',false);
          $('input[id=cam4]').attr('checked',false);
          scene.topview();
          break;
        case "cam4":
          $('input[id=cam1]').attr('checked',false);
          $('input[id=cam2]').attr('checked',false);
          $('input[id=cam3]').attr('checked',false);
          scene.camreset();
          break;

        case "play":
          scene.animate_active = true;
          self.animate();
          break;
        case "drop":
          while(scene.translate(0,-1,0)){}
          instant = true;
          scene.render();
          break;
        case "ng":
          scene.newGame();
          instant = true;
          scene.render();
          break;
        case "xspos":
          scene.translate(2, 0, 0);
          instant = true;
          scene.render();
          break;
        case "zspos":
          scene.translate(0, 0, 2);
          instant = true;
          scene.render();
          break;
        case "xsneg":
          scene.translate(-2, 0, 0);
          instant = true;
          scene.render();
          break;
        case "zsneg":
          scene.translate(0, 0, -2);
          instant = true;
          scene.render();
          break;
        case "xpos":
          scene.rotate(90, 1, 0, 0);
          instant = true;
          scene.render();
          break;
        case "xneg":
          scene.rotate(-90, 1, 0, 0);
          instant = true;
          scene.render();
          break;
        case "ypos":
          scene.rotate(90, 0, 1, 0);
          instant = true;
          scene.render();
          break;
        case "yneg":
          scene.rotate(-90, 0, 1, 0);
          instant = true;
          scene.render();
          break;
        case "zpos":
          scene.rotate(90, 0, 0, 1);
          instant = true;
          scene.render();
          break;
        case "zneg":
          scene.rotate(-90, 0, 0, 1);
          instant = true;
          scene.render();
          break;
      }
    }
  };

  //------------------------------------------------------------------------------
  self.animate = function () {

    var now, elapsed_time;

    if (scene.animate_active) {

      now = Date.now();
      elapsed_time = now - previous_time;

      if (elapsed_time >= 800 || instant) {
        if(!scene.translate(0,-1,0)){
          scene.addWidget();
          scene.remove();
          scene.new_widget();
          next.new_widget();
          next.render();
        }
        scene.render();
        previous_time = now;
        instant = false;
      }

      requestAnimationFrame(self.animate);
    }
  };

  //------------------------------------------------------------------------------
  self.removeAllEventHandlers = function () {
    var k, element;
    for (k = 0; k < control_id_list.length; k += 1) {
      element = $('#' + control_id_list[k]);
      if (element) {
        element.unbind("click", self.html_control_event);
      }
    }

    // Remove the mouse event handlers
    var id = '#' + scene.canvas_id;
    $(id).off("mousedown");
    $(id).off("mouseup");
    $(id).off("mousemove");
  };

  // Constructor code that must be done after the appropriate functions
  // have been defined.

  // Add an onclick callback to each HTML control
  var j, control, control_type;
  for (j = 0; j < control_id_list.length; j += 1) {
    control = $('#' + control_id_list[j]);
    if (control) {
      control_type = control.prop('type');
      if (control_type === 'checkbox' ||control_type === 'button'||control_type === 'radio') {
        control.click(self.html_control_event);
      } else if (control_type === 'submit') {
        control.click(self.html_control_event);
      } else {
        //control.on( 'input', self.html_control_event );
        document.addEventListener('input', self.html_control_event);
      }
    }
  }

  // Register callback functions with mouse events
  var id = '#' + scene.canvas_id;
  $(id).mousedown(self.mouse_drag_started);
  $(id).mouseup(self.mouse_drag_ended);
  $(id).mousemove(self.mouse_dragged);
};


