import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scenePath = '/scene2.gltf';

// LoadGLTFByPath: Loads a GLTF model and adds it to the scene
export const LoadGLTFByPath = (scene) => {
    return new Promise((resolve, reject) => {
        // Create a loader
        const loader = new GLTFLoader();

        // Load the GLTF file
        loader.load(scenePath, (gltf) => {
            const model = gltf.scene;
            scene.add(model);

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