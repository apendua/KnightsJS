// -------------------
// --- actor types ---
// -------------------
export const KNIGHT = 'KNIGHT';

// --------------------
// --- player types ---
// --------------------
export const ATTACKER = 'ATTACKER';
export const DEFENDER = 'DEFENDER';

// --------------------------------
// --- actor attributes by type ---
// --------------------------------
export const ATTRIBUTES = {
  [ KNIGHT ]: {

    speed     : 5,
    strength  : 2,
    toughness : 5,
  },
};

export const MAP_COLUMNS = 12;
export const MAP_ROWS    = 16;
export const SVG_WIDTH   = 1024;
export const SVG_HEIGHT  = 640;

export const TIMING_FRAMES_PER_SECOND = 10;
export const TIMING_MOVE_BY_ONE_FIELD = 750;

export const ANIMATION_ATTACK  = 'ANIMATION_ATTACK';
export const ANIMATION_HIT     = 'ANIMATION_HIT';
export const ANIMATION_WALK    = 'ANIMATION_WALK';
export const ANIMATION_ACTIVE  = 'ANIMATION_ACTIVE';
export const ANIMATION_IDLE    = 'ANIMATION_IDLE';
export const ANIMATION_FALL    = 'ANIMATION_FALL';
export const ANIMATION_DEAD    = 'ANIMATION_DEAD';
export const ANIMATION_KNOCKOUT= 'ANIMATION_KNOCKOUT';

export const animationsDb = {

  [ KNIGHT ]: {

    sheets: [
      {
        source      : '/assets/knight_320x320.png',
        nRows       : 19,
        nColumns    : 8,
        offsetX     : 125,
        offsetY     : 250,
        frameWidth  : 320,
        frameHeight : 320,
        actorHeight : 160,
      }
      // {
      //   source      : '/assets/knight_128x128.png',
      //   nRows       : 19,
      //   nColumns    : 8,
      //   offsetX     : 50,
      //   offsetY     : 100,
      //   frameWidth  : 128,
      //   frameHeight : 128,
      //   actorHeight : 70,
      // }
    ],

    animations: [

      {
        type     : ANIMATION_ATTACK,
        nFrames  : 8,
        variants : [
          {
            direction : 1,
            frames    : [ [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7] ],
          },
          {
            direction : 2,
            frames    : [ [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7] ],
          },
          {
            direction : 3,
            frames    : [ [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7] ],
          },
        ],
      },

      {
        type     : ANIMATION_HIT,
        nFrames  : 8,
        variants : [
          {
            direction : 1,
            frames    : [ [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7] ],
          },
          {
            direction : 2,
            frames    : [ [4, 0], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6], [4, 7] ],
          },
          {
            direction : 3,
            frames    : [ [5, 0], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5], [5, 6], [5, 7] ],
          },
        ],
      },

      {
        type     : ANIMATION_WALK,
        nFrames  : 8,
        isLoop   : true,
        variants : [
          {
            direction : 1,
            frames    : [ [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6], [6, 7] ],
          },
          {
            direction : 2,
            frames    : [ [7, 0], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7] ],
          },
          {
            direction : 3,
            frames    : [ [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 6], [8, 7] ],
          },
        ],
      },

      {
        type     : ANIMATION_KNOCKOUT,
        nFrames  : 12,
        variants : [
          {
            direction : 1,
            frames    : [ [ 9, 0], [ 9, 1], [ 9, 2], [ 9, 3], [ 9, 4], [ 9, 5], [ 9, 6], [ 9, 7],
                          [10, 0], [10, 1], [10, 2], [10, 3] ],
          },
          {
            direction : 2,
            frames    : [                                     [10, 4], [10, 5], [10, 6], [10, 7],
                          [11, 0], [11, 1], [11, 2], [11, 3], [11, 4], [11, 5], [11, 6], [11, 7] ],
          },
          {
            direction : 3,
            frames    : [ [12, 0], [12, 1], [12, 2], [12, 3], [12, 4], [12, 5], [12, 6], [12, 7],
                          [13, 0], [13, 1], [13, 2], [13, 3] ],
          },
        ],
      },

      {
        type     : ANIMATION_ACTIVE,
        nFrames  : 10,
        isLoop   : true,
        variants : [
          {
            direction : 2,
            frames    : [                                     [13, 4], [13, 5], [13, 6], [13, 7],
                          [14, 0], [14, 1], [14, 2], [14, 3], [14, 4], [14, 5] ],
          },
        ],
      },

      // {
      //   type     : ANIMATION_IDLE,
      //   nFrames  : 10,
      //   isLoop   : true,
      //   variants : [
      //     {
      //       direction : 2,
      //       frames    : [                                                       [14, 6], [14, 7],
      //                     [15, 0], [15, 1], [15, 2], [15, 3], [15, 4], [15, 5], [15, 6], [15, 7]],
      //     },
      //   ],
      // },

      {
        type     : ANIMATION_IDLE,
        nFrames  : 1,
        variants : [
          {
            direction : 2,
            frames    : [ [14, 6] ],
          },
        ],
      },

      {
        type     : ANIMATION_DEAD,
        nFrames  : 1,
        variants : [
          {
            direction : 1,
            frames    : [ [16, 7] ],
          },
          {
            direction : 2,
            frames    : [ [17, 7] ],
          },
          {
            direction : 3,
            frames    : [ [18, 7] ],
          },
        ],
      },

      {
        type     : ANIMATION_FALL,
        nFrames  : 8,
        variants : [
          {
            direction : 1,
            frames    : [ [16, 0], [16, 1], [16, 2], [16, 3], [16, 4], [16, 5], [16, 6], [16, 7] ],
          },
          {
            direction : 2,
            frames    : [ [17, 0], [17, 1], [17, 2], [17, 3], [17, 4], [17, 5], [17, 6], [17, 7] ],
          },
          {
            direction : 3,
            frames    : [ [18, 0], [18, 1], [18, 2], [18, 3], [18, 4], [18, 5], [18, 6], [18, 7] ],
          },
        ],
      },

    ],

  }

};
