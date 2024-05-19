import * as THREE from 'three';
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';

const scenePath = '/public/models/scene2.gltf';


// FD. LoadGLTFPath
// Signature: Scene to render -> Null
// purp. find the gltf model, place it into the scene and get the mixer if animated
export const LoadGLTFByPath = (scene) => {
    return new Promise((resolve, reject) => {
        // Create a loader
        const loader = new GLTFLoader();

        // Load the GLTF file
        loader.load(scenePath, (gltf) => {
            const model = gltf.scene;
            scene.add(model);

            // // Assuming the model contains an animation named "MyAnimation"
            // const mixer = new THREE.AnimationMixer(model);
            // // console.log(mixer);
            // const clips = gltf.animations;
            // if (clips && clips.length) {
            //     const action = mixer.clipAction(clips[0]); // Assuming there's only one animation
            //     // console.log(action);
            //     action.play(); // Start the animation
            // }

            // Create an array to store mixers
            const mixers = [];
            // Assuming the model contains multiple animations
            const clips = gltf.animations;
            if (clips && clips.length) {
                // Iterate over each animation clip
                clips.forEach((clip) => {
                    const mixer = new THREE.AnimationMixer(model);
                    mixers.push(mixer);
                    const action = mixer.clipAction(clip);
                    action.play(); // Start the animation
                });
            }

            resolve({ model, mixers });
        }, undefined, (error) => {
            reject(error);
        });
    });
};

// // Update function to be called in your render loop
// export const updateAnimation = (mixer, deltaTime) => {
//     if (mixer) {
//         mixer.update(deltaTime);
//     }
// };