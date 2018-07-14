/**
 * Created by C17Caleb.Winningham on 3/9/2016.
 */
/**
 * TetrisContainer.js - By: Dr. Wayne Brown, Spring 2016
 * Defines a container for Tetris widgets to fall into.
 */

/** ===================================================================
 * An object that stores a single cube model and a transform to render
 * it at a specific location and orientation.
 * @param model Object  The model of a cube.
 * @param model_transform Float32Array Model transform. Does not contain
 *                               the camera or projection transform.
 * @constructor
 */
function ContainerCube (model, model_transform) {
  var self = this;
  // Remember the model
  self.model = model;
  // Remember the transformation matrix that will draw the model in its
  // correct location and orientation inside the container.
  self.transform = model_transform;
}

/** ===================================================================
 * Definition of a Tetris container - a 3D array of ContainerCube's
 * @param x_size: the number of cube positions along the x axis
 * @param y_size: the number of cube positions along the y axis
 * @param z_size: the number of cube positions along the z axis
 * @constructor
 */
function TetrisContainer (x_size, y_size, z_size) {

  var self = this;

  // A 3D array that holds references to the widget cubes in the container.
  // The container's base is assumed to be in the X-Z plane. The Y axis is vertical.
  // The indexes are [Y][X][Z]. That is, Container[j] is a 2D array that represents
  // the jth level of the container.
  var container = new Array(y_size);

  // Create the elements of the Container 3D array.
  for (y = 0; y  <y_size; y += 1) {
    container[y] = new Array(x_size);

    // Create layer y
    for (x=0; x < x_size; x += 1) {
      container[y][x] = new Array(z_size);
      for (z=0; z  < z_size; z += 1) {
        container[y][x][z] = null;
      }
    }
  }

  // Create a instance of the Learn_webgl_matrix class so the rendering
  // function can multiply matrices.
  var matrix = new Learn_webgl_matrix();
  var transform = matrix.create();

  /** -----------------------------------------------------------------
   * Determine if there is already a cube in a specific location in the
   * container.
   * @param x_index Integer The x index into the container
   * @param y_index Integer The y index into the container
   * @param z_index Integer The z index into the container
   * @returns {boolean} True if the indicated location has no
   *                    ContainerCube; otherwise false.
   */
  self.locationIsEmpty = function( x_index, y_index, z_index) {
    // Any location above the container is considered empty
    if (y_index >= y_size) return true;

    // Make sure this is a valid position in the container
    if (x_index < 0 || x_index >= x_size ||
        y_index < 0 ||
        z_index < 0 || z_index >= z_size) {
      return false;
    }

    // Return true if this position in the container is null
    return (container[y_index][x_index][z_index] === null);
  };

  /** -----------------------------------------------------------------
   * Empty the container of all ContainerCube objects
   */
  self.removeAllCubes = function() {
    var x,y,z;

    // Remove all the cubes currently in the container.
    for (y = 0; y < y_size; y += 1) {
      for (x = 0; x < x_size; x += 1) {
        for (z = 0; z < z_size; z += 1) {
          container[y][x][z] = null;
        }
      }
    }
  };

  self.array2index = function(x, y, z){
    var shifted = [];
    shifted.push(Math.round((x/2)+1.5));
    shifted.push(Math.abs(Math.round((y/2)-.51)));
    shifted.push(Math.round((z/2)+1.5));
    return shifted;
  };

  /** -----------------------------------------------------------------
   * Add a cube to the Tetris container.
   * @param x_index Integer The x index into the 3D container array
   * @param y_index Integer The y index into the 3D container array
   * @param z_index Integer The z index into the 3D container array
   * @param cube_model Model The model to render at a position in the container.
   * @param cube_transform: a transformation matrix that defines the
   *                        position and orientation of the cube.
   * @return {boolean} true if the widget was added to the container;
   *         false if the widget could not be added to the container.
   */
  self.addCube = function( x_index, y_index, z_index, cube_model, cube_transform) {
    // Make sure self is a valid position in the container.
    if (x_index < 0 || x_index >= x_size ||
        y_index < 0 || y_index >= y_size ||
        z_index < 0 || z_index >= z_size) {
      // The cube is not inside the container, so quit and return false.
      return false;
    }

    // Make sure the location is currently empty
    if (!self.locationIsEmpty(x_index, y_index, z_index) ) {
      return false;
    }

    // Make a copy of the cube transform so it remains static.
    var copy_of_cube_transform = matrix.create();
    matrix.copy(copy_of_cube_transform, cube_transform);

    container[y_index][x_index][z_index] = new ContainerCube(cube_model, copy_of_cube_transform);

    // Return true because the cube was successfully added to the container.
    return true;
  };

  /** -----------------------------------------------------------------
   * Draw all of the cubes that are currently in the Tetris container.
   * @param projection Float32Array The projection
   * @param container_transform Float32Array The camera and model transforms on the container.
   */
  self.renderAllCubes = function(projection,container_transform) {
    var x, y, z, cube;
    var transform2 = matrix.create();
    // For every position in the container ...
    for (y = 0; y < y_size; y += 1) {
      for (x = 0; x < x_size; x += 1) {
        for (z = 0; z < z_size; z += 1) {
          cube = container[y][x][z];
          if (cube) {
            // The cube needs all of the transformations applied to the
            // container, and the transformations applied to the cube.
            // When lighting is added, this matrix multiplication should
            // be optimized.

            matrix.multiplySeries(transform, container_transform, cube.transform);
            matrix.multiplySeries(transform2, cube.transform);
            // Draw the cube
            cube.model.render(transform, transform);
          }
        }
      }
    }
  };

  /** -----------------------------------------------------------------
   * Determine if a level in the container is full.
   * @param level Integer The level to check
   * @return Boolean If every position in the level contains a cube,
   *                 return true; false otherwise.
   * @private
   */
  function _levelIsFull(level) {
    var one_level, x, z;

    // Get the specified level
    one_level = container[level];

    // Return false if one element in the level is null
    for (x = 0; x < x_size; x += 1) {
      for (z = 0; z < z_size; z += 1) {
        if (one_level[x][z] == null) {
          //console.log("level " + level + " is not full because " + x + " " + z + " is null.");
          return false;
        }
      }
    }

    // console.log("level " + level + " is full");
    return true;
  }

  /** -----------------------------------------------------------------
   * Remove all the cubes on the specified level by shifting all of the
   * levels above it down one level.
   * @param start_level Integer The level to be removed.
   * @private
   */
  function _shiftLevelsDown(start_level) {
    var x,y,z;

    // Any cube that is shifted down will be rendered one level lower.
    // Create a transformation that moves -1 on the y axis.
    matrix.translate(transform, 0, -2, 0);

    // Shift all the levels down and change every transform to
    // render one position lower in the container
    for ( y = start_level; y < y_size-1; y += 1) {
      for ( x = 0; x < x_size; x += 1) {
        for (z = 0; z < z_size; z += 1) {
          container[y][x][z] = container[y+1][x][z];
          if (container[y][x][z]) {
            matrix.multiply(container[y][x][z].transform, transform, container[y][x][z].transform);
          }
        }
      }
    }

    // Remove everything on the top level
    y = y_size-1;
    for ( x = 0; x < x_size; x += 1) {
      for (z = 0; z < z_size; z += 1) {
        container[y][x][z] = null;
      }
    }
  }

  /** -----------------------------------------------------------------
   * Remove any level in the container that is full.
   * @returns {number} The number of levels that were removed.
   */
  self.removeFullLevels = function() {
    var y, number_levels_removed;

    number_levels_removed = 0;
    y = 0;
    while (y<y_size) {
      if ( _levelIsFull(y) ) {
        _shiftLevelsDown(y);
        number_levels_removed++;
      } else {
        y += 1;
      }
    }

    return number_levels_removed;
  };
}