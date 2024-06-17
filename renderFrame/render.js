import * as THREE from 'three';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';
import { MMDLoader } from 'three/addons/loaders/MMDLoader.js';
import { MMDAnimationHelper } from 'three/addons/animation/MMDAnimationHelper.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Move3d } from '../js/move.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

window.cam3d = null;
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
window.composer = null;
window.renderScene = null;
window.bloomPass = null;
window.outputPass = null;
window.bloom = {
    threshold: 0.7,
    strength: 0.7,
    radius: 1,
    exposure: 1
};
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
var cmt = "====================";
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
    // hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    // hemiLight.position.set(0, 300, 0);
    // scene.add(hemiLight);
    dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(-20, 300, 400);
    scene.add(dirLight);
    window.directionalLight = new THREE.DirectionalLight(0xdddddd, 1);
    directionalLight.position.set(20, 350, -200);
    scene.add(directionalLight);
    renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
    // renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setPixelRatio(1);
    // renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping; //
    renderer.toneMappingExposure = 0.65; //
    container.appendChild(renderer.domElement);

    renderScene = new RenderPass( scene, camera );

    bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = bloom.threshold;
    bloomPass.strength = bloom.strength;
    bloomPass.radius = bloom.radius;

    outputPass = new OutputPass();

    composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composer.addPass( outputPass );


    // effect = new OutlineEffect(renderer);
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
        window.top.anyChange();
    } else{
        let position = data.dataset.pos;
        let name = data.previousElementSibling.previousElementSibling.innerText;
        var CUSTOM;
        if(position && position.length){
            CUSTOM = window.top.addFile[position];
        }
        loader.load(url, (m) => {
            window.top.log("ok", `| Complete (model): ${url}`);
            m.name = name;
            all_mesh[url] = m;
            loader.loadAnimation(window.top.selection.vmd, m, (mmd) => {
                window.top.log("ok", `| Complete (animation): ${window.top.selection.vmd}`);
                all_animation[url] = mmd;
                setTimeout(() => {
                    scene.add(m);
                    window.top.anyChange();
                    helper.add(m, {
                        animation: mmd,
                        physics: true
                    });
                }, 200);
            });
        }, (e) => {loading(e, "model")}, undefined, CUSTOM);
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
            window.top.log("ok", `| Complete (map): ${url}`);
            e.name = name.previousElementSibling.previousElementSibling.innerText;
            all_map[url] = e;
            scene.add(e);
            window.top.anyChange();
        }, (e) => {loading(e, "map/object")}, undefined, CUSTOM);
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
            window.top.log("ok", `| Complete (model): ${url}`);
            if(index < selection.model.length) {
                loadModel();
            } else{
                loadcam();
            }
        }, (e) => {loading(e, "model")}, undefined, CUSTOM);
    }
    function loadcam(){
        if(selection.camera.length < 1){
            loadVmd();
            if (window.top.isMobile) {
                moveCam = new OrbitControls(camera, renderer.domElement);
                 moveCam.minDistance = 5;
                 moveCam.maxDistance = 120;
            } else {
                moveCam = new Move3d(camera, { speed: 50, fly: 0.55, position: [0, 9, 25] });
            }
            return;
        }
        let url = selection.camera;
        loader.loadAnimation(url, camera, (cameraAnimation) => {
            window.top.log("ok", `| Complete (camera): ${url}`);
            all_cam = cameraAnimation;
            loadVmd()
        }, (e) => {loading(e, "camera")});
    }
    function loadVmd(){
        if(selection.vmd.length < 1){
            loadMap();
            return;
        }
        var key = Object.keys(all_mesh);
        var m = all_mesh[key[index_cam]];
        loader.loadAnimation(selection.vmd, m, (mmd) => {
            window.top.log("ok", `| Complete (animation): ${selection.vmd}`);
            all_animation[key[index_cam]] = mmd;
            index_cam++;
            if (index_cam < key.length) {
                loadVmd();
            } else{
                loadMap();
            }
        }, (e) => {loading(e, "vmd/animation")});
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
                window.top.log("ok", `| Complete (map): ${url}`);
                e.name = name;
                all_map[url] = e;
                tur++;
                if(tur < selection.map.length){
                    LoadBg();
                } else{
                    addAll();
                } 
            }, (e) => {loading(e, "map/object")}, undefined, CUSTOM);
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
        if (window.top._meshManager) {
            window.top._meshManager.append();
            window.top.anyChange();
        }
        window.top.log("ok", `| Complete all`);
        
    }

}
function loading(xhr, type){
    let value = xhr.loaded / xhr.total * 20;
    window.top.log("info", `${type}: ${cmt.slice(-value)}>`);
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

    renderer.setSize(outValue.width, outValue.height);
    composer.setSize(outValue.width, outValue.height);

    if (window.moveCam && !window.top.isMobile) {
        window.moveCam.camera.aspect = outValue.width / outValue.height;
        window.moveCam.camera.updateProjectionMatrix();
    } else {
        camera.aspect = outValue.width / outValue.height;
        camera.updateProjectionMatrix();
    }
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
    } else{
        return;
    }
    composer.render(t);
    // camera.updateProjectionMatrix();
    try {
        if (window.moveCam) {
            moveCam.update(t);
        }
    } catch (w) {
    }
}


//
window.addEventListener("dblclick", () => {
    if(!window.moveCam) return;
    if(!window.moveCam.lockmouse) return;
    window.moveCam.lockmouse();
});


window.onerror = (mess, file, line, col, error) => {
    var a = file;
    if(file && file.indexOf("/") !== -1){
        let sp = a.split("/");
        a = sp[sp.length - 1];
    }
    if(!file){a="console?"}
    window.top.log("error", `-Error on [${a}] - ${line}:${col}</br>>${mess}`);
}
window.addEventListener('unhandledrejection', function (e) {
    window.top.log("error", e.reason);
});
