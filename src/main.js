// Import the necessary modules from three.js and ModelHelper.js
import * as THREE from 'three'
import { LoadGLTFByPath } from './Helpers/ModelHelper.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


// Declare global variables
let mixers; // Mixer for controlling animations
let scene; // Three.js scene
let renderer; // Three.js renderer
let cameraList = []; // List of cameras in the scene
let camera; // Active camera
const clock = new THREE.Clock(); // Initialize clock for calculating deltaTime
let light;

let initPosCamera;
let initRotCamera;



// Initialize the scene and renderer
scene = new THREE.Scene(); // Create a new Three.js scene
renderer = new THREE.WebGLRenderer({ // Create a new WebGLRenderer for rendering graphics
  canvas: document.querySelector('#background'), // Specify the canvas element to render onto
  antialias: true, // Enable antialiasing for smoother edges
});
renderer.setSize(window.innerWidth, window.innerHeight); // Set the size of the renderer to match the window dimensions
//set up the renderer with the default settings for threejs.org/editor - revision r153
renderer.shadows = true;
renderer.shadowType = 1;
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = 0;
renderer.toneMappingExposure = 1
renderer.useLegacyLights = false;
renderer.toneMapping = THREE.NoToneMapping;
// renderer.setClearColor(0xffffff, 0);
//make sure three/build/three.module.js is over r152 or this feature is not available. 
renderer.outputColorSpace = THREE.SRGBColorSpace
// const bgTexture = new THREE.TextureLoader().load("./public/src/sky.jpg")
// scene.background = bgTexture;

let controls;

// Load the GLTF model and set up the scene, assigning the mixers to the global variable mixers in this script
LoadGLTFByPath(scene)
  .then(({ model, mixers: loadedMixers }) => { // Wait for the GLTF model to be loaded
    mixers = loadedMixers; // Store the mixers array for controlling animations
    retrieveListOfCameras(scene); // Retrieve the list of cameras in the scene
  })
  .catch((error) => { // Handle any errors that occur during loading
    console.error('Error loading JSON scene:', error);
  });

// Retrieve the list of cameras in the scene
function retrieveListOfCameras(scene) {
  scene.traverse(function (object) { // Traverse through all objects in the scene
    if (object.isCamera) { // Check if the object is a camera
      cameraList.push(object); // Add the camera to the cameraList array
    }
  });

  camera = cameraList[0]; // Set the active camera to the first camera in the list
  updateCameraAspect(); // Update the aspect ratio of the camera
  controls = new OrbitControls(camera, renderer.domElement)

  // const box = new THREE.Box3().setFromObject(scene); // Calculate the bounding box of the scene
  controls.target.set(0, 0, 0);
  controls.update();
  controls.enablePan = false;
  controls.enableDamping = true;

  initPosCamera = camera.position.clone();
  initRotCamera = camera.rotation.clone();


  // Find the light source object in the scene
  scene.traverse(function (object) {
    if (object.isLight) {
      light = object
      // const lightHelper = new THREE.PointLightHelper(light);
      // scene.add(lightHelper);

    }
  });


  animate(); // Start the animation loop after the model and cameras are loaded
}

// Update the aspect ratio of the camera to match the window dimensions
function updateCameraAspect() {
  const width = window.innerWidth; // Get the width of the window
  const height = window.innerHeight; // Get the height of the window
  camera.aspect = width / height; // Set the aspect ratio of the camera
  camera.updateProjectionMatrix(); // Update the camera's projection matrix
  renderer.setSize(width, height); // Resize the renderer
}

// Animation loop
function animate() {
  requestAnimationFrame(animate); // Request the browser to call animate() on the next frame
  light.rotation.x += 0.003;
  const deltaTime = clock.getDelta(); // Calculate the time elapsed since the last frame
  if (mixers) { // Check if the mixers array is defined (i.e., if animations are loaded)
    mixers.forEach(mixer => mixer.update(deltaTime * 0.2)); // Update all animations using their mixers
  }
  // if (mixer) { // Check if the mixer object is defined (i.e., if animations are loaded)
  //   mixer.update(deltaTime * 0.2); // Update the animations using the mixer
  // }


  // ####### !!!
  // controls.update();

  renderer.render(scene, camera); // Render the scene with the active camera
  console.log(camera.position);
  console.log(camera.rotation);
}

//#################### CONTROL SCROLLING BEHAVIORS ####################

// FD. mapParameter()
// purp. get a set of intermediate values and a point from 0 to 1 to map an expected output value
function mapParameter(t, _y0, _y1, _y2, _y3, _y4) {
  let y;

  // Define easing functions
  function easeInOutSine(t) {
    return (1 - Math.cos(Math.PI * t)) / 2;
  }

  // Define ease-in function
  function easeIn(t) {
    return t * t;
  }

  function easeInOutCirc(t){
    return t < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;
  }

  if (t <= 0) {
    return _y0;
  }
  if (t <= 0.25) {
    y = _y0 + (_y1 - _y0) * easeInOutCirc(t / 0.25);
    return y;
  }
  if (t <= 0.5) {
    y = _y1 + (_y2 - _y1) * easeInOutCirc((t - 0.25) / 0.25);
    return y;
  }
  if (t <= 0.75) {
    y = _y2 + (_y3 - _y2) * easeInOutCirc((t - 0.5) / 0.25);
    return y;
  }
  if (t <= 1) {
    y = _y3 + (_y4 - _y3) * easeInOutCirc((t - 0.75) / 0.25);
    return y;
  }
  return _y4;
}

// let maxT;


// Get the minimum value of t (how much scrolling down)
// function getMinTopValue() {
//   const docHeight = Math.max(
//     document.body.scrollHeight,
//     document.documentElement.scrollHeight,
//     document.body.offsetHeight,
//     document.documentElement.offsetHeight,
//     document.body.clientHeight,
//     document.documentElement.clientHeight
//   );
//   const viewportHeight = window.innerHeight;
//   const minTop = docHeight - viewportHeight;
//   return minTop;
// }

function calculateRelativePosition() {
  const mainElement = document.getElementById("main-content");
  if (!mainElement) {
    return 0; // Return 0 if the main element is not found
  }

  const scrollPosition = window.scrollY;
  const mainHeight = mainElement.offsetHeight;
  const maxScroll = mainHeight - window.innerHeight;

  let t = 0;
  if (maxScroll > 0) {
    t = scrollPosition / maxScroll;
  }

  console.log(t);
  return t;
}

// console.log(getMinTopValue());
// maxT = getMaxHeightOfMainById();

// Changing perspective based on scrolling behavior
function moveCamera() {
  // const t = -document.body.getBoundingClientRect().top/maxT;
  const t = calculateRelativePosition();
  camera.position.x = mapParameter(t, 0, -2.931747956, 2.311733814, -1.518037794, -0.2729408031172346);
  camera.position.y = mapParameter(t, 5, 0.230870801, 0.096824512, -1.360170561, -0.19809507976519075);
  camera.position.z = mapParameter(t, 0, -0.139653689, -0.964268477, 4.344828768, -6.664800906507112);
  camera.rotation.x = mapParameter(t, -1.570795327, -3.058252972, 3.058114909, 0.224596241, 3.111878821331579)
  camera.rotation.y = mapParameter(t, 0, -1.425795735, 1.12826088, -0.267951432, 0.04091166340793191);
  camera.rotation.z = mapParameter(t, 0, -3.059123573, -3.066124306, 0.060410167, 3.140376993177893)


  // light.rotation.x = (t/maxT) * 6.28;
  // camera.position.z = initPosCamera.z + (t * -0.005);
  // camera.position.y = initPosCamera.y + (t * 0.005);
  // camera.rotation.x = initRotCamera.x + (t * -0.001);
  // camera.position.z = initPosCamera.z + (t / maxT)
  // camera.position.y = initPosCamera.y + (t / maxT)
  // camera.rotation.x = initRotCamera.x + (t / maxT)


}


document.body.onscroll = moveCamera;


window.addEventListener('resize', updateCameraAspect, false); // Add event listener for window resize

// Initialize the scene and start the animation loop
// retrieveListOfCameras(scene); // Call retrieveListOfCameras() to initialize the scene and cameras

