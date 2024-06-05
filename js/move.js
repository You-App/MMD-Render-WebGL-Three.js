import {Vector3} from 'three';
import { Capsule } from 'three/addons/math/Capsule.js';

class Move3d {
    constructor(camera, option = {}) {
        if(!camera) return;
        this.camera = camera;
        this.camera.rotation.order = 'YXZ';
        this.STEPS_PER_FRAME = option.step ? option.step : 5;
        this.fly = option.fly ? option.fly : 0.3;
        this.speed = option.speed ? option.speed : 25;
        this.speedUp = option.speedUp ? option.speedUp : 5;
        this.zoom = option.zoom ? option.zoom : 2;
        this.pos = option.position ? option.position : [0,0,0];
        this.keyStates = {};
        this.fast = false;
        this.playerCollider = new Capsule(new Vector3(0, 0.35, 0), new Vector3(0, 1, 0), 0.35);
        this.playerVelocity = new Vector3();
        this.playerDirection = new Vector3();
        this.camera.position.set(this.pos[0],this.pos[1],this.pos[2],);
        document.addEventListener('keydown', (event) => {
            this.keyStates[event.code] = true;
            if (this.keyStates['KeyR']) {
                if(this.fast){
                    this.fast = false;
                } else{
                    this.fast = true;
                }
            }
            if (this.keyStates['KeyC']) {
                this.camera.zoom = this.zoom;
                this.camera.updateProjectionMatrix();
            } 
        });
        document.addEventListener('keyup', (event) => {
            this.keyStates[event.code] = false;
            if (event.code == 'KeyC') {
                this.camera.zoom = 1;
                this.camera.updateProjectionMatrix();
            } 
        });
        // document.body.addEventListener('mousedown', () => {
        //     document.body.requestPointerLock();
        // });
        document.addEventListener('mouseup', () => {
        
        });
        
        document.body.addEventListener('mousemove', (event) => {
            if (document.pointerLockElement === document.body) {
                var d1 = this.camera.rotation.x - event.movementY / 500;
                // var d2 = this.camera.rotation.y - event.movementX / 500;
                this.camera.rotation.y -= event.movementX / 500;
                if(d1 >= -1.49 && d1 <= 1.49){
                    this.camera.rotation.x -= event.movementY / 500;
                }
            }
        });
    }
    lockmouse(){
        document.body.requestPointerLock();
    }
    update(clock = 1){
        let deltaTime = Math.min(0.05, clock) / this.STEPS_PER_FRAME;
        for (let i = 0; i < this.STEPS_PER_FRAME; i++) {
            this._controls(deltaTime);
            this._updatePlayer(deltaTime);
        }
    }
    _updatePlayer(deltaTime) {
        let damping = Math.exp(- 4 * deltaTime) - 1;
        this.playerVelocity.addScaledVector(this.playerVelocity, damping);
        const deltaPosition = this.playerVelocity.clone().multiplyScalar(deltaTime);
        this.playerCollider.translate(deltaPosition);
        this.camera.position.copy(this.playerCollider.end);
    }
    _getForwardVector() {
        this.camera.getWorldDirection(this.playerDirection);
        this.playerDirection.y = 0;
        this.playerDirection.normalize();
    
        return this.playerDirection;
    }
    _getSideVector() {
    
        this.camera.getWorldDirection(this.playerDirection);
        this.playerDirection.y = 0;
        this.playerDirection.normalize();
        this.playerDirection.cross(this.camera.up);
    
        return this.playerDirection;
    
    }
    _controls(deltaTime) {
        // gives a bit of air control
        var up = this.fast ? this.speedUp : 1;
        const speedDelta = deltaTime * (this.speed * up);
        if (this.keyStates['KeyW']) {
            this.playerVelocity.add(this._getForwardVector().multiplyScalar(speedDelta));
        }
        if (this.keyStates['KeyS']) {
            this.playerVelocity.add(this._getForwardVector().multiplyScalar(- speedDelta));
        }
        if (this.keyStates['KeyA']) {
            this.playerVelocity.add(this._getSideVector().multiplyScalar(- speedDelta));
        }
        if (this.keyStates['KeyD']) {
            this.playerVelocity.add(this._getSideVector().multiplyScalar(speedDelta));
        }
        if (this.keyStates['Space']) {
            this.playerVelocity.y += this.fly * up;
        }
        if (this.keyStates['ShiftLeft']) {
            this.playerVelocity.y -= this.fly * up;
        }
        

    }
}
export {Move3d}