## Demo


https://github.com/user-attachments/assets/412557a6-bd6e-40ae-9da9-e6bf6037660b




## How To Use

```bash
# Install dependencies
$ npm install

# Start the local development server (on port 8080)
$ npm run local

# Ready for production?
# Build the production ready code to the /dist folder
$ npm run build
```

## Third Party Documentation

Phaser:

-   https://rexrainbow.github.io/phaser3-rex-notes/docs/site/
-   https://photonstorm.github.io/phaser3-docs/

## Code structure

All assets need to be inside the **/src/assets** folder.
All game code lies inside the **/src/scripts** folder.

The code is divided into two parts:
**/src/engine.ts** - this part is responsible for physics.
In the current implementation, physics works inside the WebWorker, this is done in order to minimize losses during multiple calculations. All code and settings are inside **/src/engine/**

**/src/game.ts** - this part is responsible for the visual part.
The structure of this part should be familiar to you, inside you will see the scene files as well as additional accompanying code.

## Resources

All resources are stored in the **/src/assets** folder. At build time, the **/src/assets** folder is copied directly to **/dist**.
The configuration file for the game is located: **/src/scripts/game/scenes/Boot/config.ts**
Top-level folders like "image, spine, audio, aseprite" are the type name and are used by the Phaser loader, do not change the names of these folders and objects in any case, otherwise the load will break.

Access to all resources is carried out according to the `key-frame` pattern, where the frame is the name of the file and the key is its folder.
Spine files are only accessed by filename.

### Questions

-   I have added a new file type, what should I do?

You will need to make a few edits:

1. Open the file **/src/scripts/game/scenes/Boot.ts** and add a condition to load the files into the game. You can find the current conditions in the `preload` function
2. Open the file **/pwa/sw.js** and add a condition to load the files into the cache. You can find the current conditions in the `preload` function

-   I have added several spine files but only one of them works correctly.

Please make sure that the files you added have different names. This is important even if they are in different folders.

-   I added new spine animations and the game broke.

Most likely you made a mistake with the spine version, all animations must be exported from version 3.8

## PWA

На текущий момент он активен для игры без интернета. All PWA configs are in the **pwa** folder.

## Webpack

All webpack configs are in the **webpack** folder.
