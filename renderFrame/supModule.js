import {
    AnimationClip,
    Quaternion,
    Vector3,
    QuaternionKeyframeTrack,
    VectorKeyframeTrack,
    SkinnedMesh

} from 'three';
import { MMDAnimationHelper } from 'three/addons/animation/MMDAnimationHelper.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { MMDLoader } from 'three/addons/loaders/MMDLoader.js';

class FBX2PMXAnimation extends MMDAnimationHelper {
    /**
     * @param {Object} params - (optional)
     * @param {boolean} params.sync - Whether animation durations of added objects are synched. Default is true.
     * @param {Number} params.afterglow - Default is 0.0.
     * @param {boolean} params.resetPhysicsOnLoop - Default is true.
     */
    constructor(opt) {
        super(opt);
    }
    /**
     * 
     * @param {SkinnedMesh} mesh mesh need to get animation info
     * @returns {Array<Object>} currentTime and duration
     */
    getTimeAnimation(mesh = undefined){
        if(mesh){
            let object = this.objects.get(mesh);

            let value = [{
                currentTime: object.mixer._actions[0]?.time || 0,
                duration: object.mixer._actions[0]?._clip.duration || 0
            }];
            return value;
        } else{
            let value = [];
            for (let i = 0; i < this.meshes.length; i++) {
                const object = this.objects(this.meshes[i]);
                value.push({
                    currentTime: object.mixer._actions[0]?.time || 0,
                    duration: object.mixer._actions[0]?._clip.duration || 0
                });
            }
            return value;
        }
    }
    /**
     * 
     * @param {Number} value
     * @param {SkinnedMesh} mesh mesh need to change animation time, empty for all mesh
     */
    setTimeAnimation(value = 0, mesh = undefined){
        if(mesh){
            let object = this.objects.get(mesh);
            if(object.mixer._actions[0]){

                object.mixer._actions[0].time = value;
                
                return true;
                
            } else{

                return false;
                
            }
        } else {
            for (let i = 0; i < this.meshes.length; i++) {
                const object = this.objects(this.meshes[i]);
                if (object.mixer._actions[0]) {

                    object.mixer._actions[0].time = value;

                }
            }
        }
    }
    /**
     * 
     * @param {SkinnedMesh} mesh 
     * @param {AnimationClip} clip 
     */
    changeAnimation(mesh, clip) {
        if (!mesh || !clip) return;

        let object = this.objects.get(mesh);
        object.mixer.stopAllAction();
        mesh.pose();
        object.mixer.clipAction(clip).play();
    }
    /**
     * 
     * @param {SkinnedMesh} mesh 
     */
    removeNotDelete(mesh){
        let object = this.objects.get(mesh);
        if(!object) return;

        object.isActive = false;
    }
    /**
     * 
     * @param {SkinnedMesh} mesh 
     */
    reAdd(mesh){
        let object = this.objects.get(mesh);
        if(!object) return;

        object.isActive = true;
    }

}
