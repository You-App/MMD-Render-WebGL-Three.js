import * as THREE from 'three';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';
import { MMDLoader } from 'three/addons/loaders/MMDLoader.js';
import { MMDAnimationHelper } from 'three/addons/animation/MMDAnimationHelper.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as file from '../file.js';

//most is useless and trash but update later(or not)
window.cam3d = null;
window.data_file = file;
window.scene = null;
window.renderer  = null;
window.effect = null;
window.camera = null;
window.mesh = null;
window.helper = null;
window.loader = null;
window.dirLight = null;
window.hemiLight = null;
window.moveCam = null;
window.TH = THREE;
window.renderQuality = 1.0;
window.renderOption = {
    quality: "auto",
    plus: "auto",
    ratio: "auto"
}
window.ready = false;
window.clock = new THREE.Clock();
window.all_mesh = {};
window.all_vmd = {};
window.all_animation = {};
window.all_map = {};
window.all_cam = null;
var MorInfo;

Ammo().then(function () {
    init();
    render();
});
function init() {
    if(window.top.renderOption){
        window.renderOption = window.top.renderOption;
    }
    const container = document.createElement('div');
    container.className = "container-render";
    document.body.appendChild(container);
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    // scene
    scene = new THREE.Scene();
    //______Test
    // img("/img/sc1.png", {position: [0, 25, -60], scale: [20, 20, 0.1]});
    //______
    scene.add(camera);
    // window.ambient = new THREE.AmbientLight(0xdddddd, 3); //aaa
    // scene.add(ambient);
    hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 300, 0);
    scene.add(hemiLight);
    dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(75, 300, -75);
    scene.add(dirLight);
    window.directionalLight = new THREE.DirectionalLight(0xdddddd, 1);
    directionalLight.position.set(- 1, 1, 1).normalize();
    scene.add(directionalLight);
    renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
    // renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setPixelRatio(1);
    // renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping; //
    renderer.toneMappingExposure = 0.6; //
    container.appendChild(renderer.domElement);
    effect = new OutlineEffect(renderer);
    helper = new MMDAnimationHelper({ pmxAnimation: true });
    loader = new MMDLoader();
    onWindowResize();
    window.addEventListener('resize', onWindowResize);
    window.addEventListener("keydown", (e) => {
        if(e.code === "KeyK"){
            if(helper.enabled.animation === true){
                helper.enabled.animation = false;
            } else{
                helper.enabled.animation = true;
            }
        }
        if(e.code === "KeyP"){
            if(helper.enabled.physics === true){
                helper.enabled.physics = false;
            } else{
                helper.enabled.physics = true;
            }
        }
    });
    window.top.renderFrame = window;
    if(window.top.res){
        window.top.res();
    }
}
//currentTimeAnimation
//helper.objects.get(all_mesh['/src/mmd/model/blue_archive/mari_2/1.pmx']).mixer._actions[0].time

window.removeMesh = (url) => {
    if (all_mesh[url]) {
        scene.remove(all_mesh[url]);
        helper.objects.delete(helper.objects.get(all_mesh[url]).mixer._actions[0]._clip);
        helper.objects.get(all_mesh[url]).physics = null;
        helper.objects.get(all_mesh[url]).mixer = null;
        helper.remove(all_mesh[url]);
    }
}
window.removeMap = (url) => {
    if (all_map[url]) {
        scene.remove(all_map[url]);
    }
}

window.addMesh = (url, data) => {
    if(!ready) return;
    if (all_mesh[url]) {
        scene.add(all_mesh[url]);
        helper.add(all_mesh[url], {
            animation: all_animation[url],
            physics: true
        });
    } else{
        let position = data.dataset.pos;
        let name = data.previousElementSibling.previousElementSibling.innerText;
        var CUSTOM;
        if(position && position.length){
            CUSTOM = window.top.addFile[position];
        }
        loader.load(url, (m) => {
            m.name = name;
            all_mesh[url] = m;
            loader.loadAnimation(window.top.selection.vmd, m, (mmd) => {
                all_animation[url] = mmd;
                setTimeout(() => {
                    scene.add(m);
                    helper.add(m, {
                        animation: mmd,
                        physics: true
                    });
                }, 200);
            });
        }, undefined, undefined, CUSTOM);
    }
}
window.addMap = (url, name) => {
    if(!ready) return;
    if (all_map[url]) {
        scene.add(all_map[url]);
    } else {
        const position = name.dataset.pos;
        var CUSTOM;
        if (position && position.length) {
            CUSTOM = window.top.addFileMap[position];
        }
        loader.load(url, function (e) {
            e.name = name.previousElementSibling.previousElementSibling.innerText;
            all_map[url] = e;
            scene.add(e);
            window.top.anyChange();
        }, undefined, undefined, CUSTOM);
    }
}
window.loadAll = (e) => {
    if(ready) return;
    var selection = e;
    if(!selection) return;
    var index = 0;
    var index_cam = 0;
    loadModel();
    function loadModel(){
        let {url, name, position} = selection.model[index];
        var CUSTOM;
        if(position && position.length){
            CUSTOM = window.top.addFile[position];
        }
        loader.load(url, (m) => {
            index++;
            m.name = name;
            all_mesh[url] = m;
            if(index < selection.model.length) {
                loadModel();
            } else{
                loadcam();
            }
        }, undefined, undefined, CUSTOM);
    }
    function loadcam(){
        if(selection.camera.length < 1){
            loadVmd();
            moveCam = new OrbitControls(camera, renderer.domElement);
            moveCam.minDistance = 10;
            moveCam.maxDistance = 100;
            return;
        }
        let url = selection.camera;
        loader.loadAnimation(url, camera, (cameraAnimation) => {
            all_cam = cameraAnimation;
            loadVmd()
        });
    }
    function loadVmd(){
        if(selection.vmd.length < 1){
            loadMap();
            return;
        }
        var key = Object.keys(all_mesh);
        var m = all_mesh[key[index_cam]];
        loader.loadAnimation(selection.vmd, m, (mmd) => {
            all_animation[key[index_cam]] = mmd;
            index_cam++;
            if (index_cam < key.length) {
                loadVmd();
            } else{
                loadMap();
            }
        });
    }
    function loadMap(){
        if(selection.map.length < 1){
            addAll();
            return;
        }
        var tur = 0;
        LoadBg();
        function LoadBg(){
            const {url, name, position} = selection.map[tur];
            var CUSTOM;
            if(position && position.length){
                CUSTOM = window.top.addFileMap[position];
            }
            loader.load(url, function (e) {
                e.name = name;
                all_map[url] = e;
                tur++;
                if(tur < selection.map.length){
                    LoadBg();
                } else{
                    addAll();
                } 
            }, undefined, undefined, CUSTOM);
        }
    }
    function addAll(){
        for (const k in all_mesh) {
            scene.add(all_mesh[k]);
            helper.add(all_mesh[k], {
                animation: all_animation[k],
                physics: true
            });
        }
        for (const k in all_map) {
            scene.add(all_map[k]);
        }
        if(all_cam){
            helper.add(camera, {
                animation: all_cam
            });
        }
        ready = true;
        animate();
        if(window.top._meshManager){
            window.top._meshManager.append();
        }
    }

}

window.onWindowResize = () => {
    var outValue = {
        width : window.innerWidth,
        height: window.innerHeight,
    }
    if(window.renderOption){
        let val = window.renderOption;
        
        if(val.quality !== "auto"){
            outValue.height = val.quality*1;
            if(val.quality !== "auto"){
                outValue.width = getRatio(val.quality);
            } else{
                outValue.width = getRatio(window.innerHeight);
            }
        } else{
            outValue.height = window.innerHeight;
            outValue.width = getRatio(window.innerHeight);
        }
        if(val.plus !== "auto"){
            outValue.width *= val.plus;
            outValue.height *= val.plus;
        }
        function getRatio(height){
            var ratio;
            if(val.ratio !== "auto"){
                if(val.ratio === "4:3"){
                    ratio = height * (4/3);
                }
                if(val.ratio === "16:9"){
                    ratio = height * (16/9);
                }
                if(val.ratio === "32:9"){
                    ratio = height * (32/9);
                }
                return ratio;
            } else{
                return window.innerWidth;
            }
        }
    }
    camera.aspect = outValue.width / outValue.height;
    camera.updateProjectionMatrix();

    effect.setSize(outValue.width, outValue.height);
}

//
window.animate = function () {
    window.requestAnimationFrame(animate);
    render();
}
function render() {
    var t = clock.getDelta();
    // document.querySelector(".info").innerText = "clock: " + t;
    if (ready) {
        helper.update(t);
        if(MorInfo){
            MorInfo.update(mesh);
        }
    } else {
        return;
    }
    effect.render(scene, camera);
}



//

window.addEventListener('beforeunload', (e) => {
    if (_setting.b4unload && !_commandData.reloadPage) {
        e.preventDefault()
        return (e.returnValue = 'Are you sure you want to close?');
    }
});
// Hide contextmenu when no hold ctrl
document.addEventListener("contextmenu", (e) => {
    if(!e.ctrlKey){
        e.preventDefault();
    }

}, {passive: false});