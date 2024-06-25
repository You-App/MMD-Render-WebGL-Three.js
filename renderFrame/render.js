import * as THREE from 'three';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';
import { MMDLoader } from 'three/addons/loaders/MMDLoader.js';
import { MMDAnimationHelper } from 'three/addons/animation/MMDAnimationHelper.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Move3d } from '../js/move.js';

import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// Global to use in parent window
window.cam3d = null;
window.scene = null;
window.renderer = null;
window.effect = null;
window.camera = null;
window.mesh = null;
window.helper = null;
window.loader = null;
window.ObjLoader = null;
window.MtlLoader = null;
window.dirLight = null;
window.hemiLight = null;
window.moveCam = null;
window.TH = THREE; //...
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
window.callAnimate = [];
window.clock = new THREE.Clock();
window.all_mesh = {};
window.all_vmd = {};
window.all_animation = {};
window.all_map = {};
window.all_cam = null;

var _loading = {load:0, all: 0}
var checkTime = 0;
var fps = 0;
var cmt = "===================="; //wut

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
    // scene
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    scene.add(camera);

    window.ambient = new THREE.AmbientLight(0x505050); 
    scene.add(ambient);
    
    dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(30, 300, 300); // 75 300 -75
    scene.add(dirLight);

    window.directionalLight = new THREE.DirectionalLight(0xcccccc, 1);
    directionalLight.position.set(-30, 300, -300);
    scene.add(directionalLight);

    renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
    renderer.setPixelRatio(1);
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


    effect = new OutlineEffect(renderer);
    let renderingOutline = false;
    scene.onAfterRender = function () {
  	  if ( renderingOutline ) return;
  	  renderingOutline = true;
  	  effect.renderOutline( scene, camera );
  	  renderingOutline = false;
    };
    
    helper = new MMDAnimationHelper({ pmxAnimation: true });
    loader = new MMDLoader();
    ObjLoader = new OBJLoader();
    MtlLoader = new MTLLoader();
    
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

function loadObjMtl(mtl, obj, callback, onProgress){
    MtlLoader.load(mtl, (m) => {
        m.preload();
        ObjLoader.setMaterials( m );
        ObjLoader.load( obj, function ( object ) {
            callback(object);
        }, (pr) => {
            if(onProgress) onProgress("obj", pr);
        });
    }, (pr) => {
        if(onProgress) onProgress("mtl", pr);
    });
}
//currentTimeAnimation
//helper.objects.get(all_mesh['url']).mixer._actions[0].time
window.removeMesh = (url) => {
    if (all_mesh[url]) {
        scene.remove(all_mesh[url]);
        helper.objects.delete(helper.objects.get(all_mesh[url]).mixer._actions[0]._clip);
        helper.objects.get(all_mesh[url]).physics = null;
        helper.objects.get(all_mesh[url]).mixer = null;
        helper.remove(all_mesh[url]);
        _loading.all--;
        _loading.load--;
    }
}
window.removeMap = (url) => {
    if (all_map[url]) {
        scene.remove(all_map[url]);
        _loading.all--;
        _loading.load--;
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
        let load = data.previousElementSibling;
        load.innerText = "Loading";
        var CUSTOM;
        if(position && position.length){
            CUSTOM = window.top.addFile[position];
        }
        _loading.all++;
        
        loader.load(url, (m) => {
            window.top.log("ok", `| Complete (model): ${url}`);
            m.name = name;
            all_mesh[url] = m;
            _loading.load++;
            loader.loadAnimation(window.top.selection.vmd, m, (mmd) => {
                window.top.log("ok", `| Complete (animation): ${window.top.selection.vmd}`);
                all_animation[url] = mmd;
                load.innerText = "Loaded";
                setTimeout(() => {
                    scene.add(m);
                    window.top.anyChange();
                    helper.add(m, {
                        animation: mmd,
                        physics: true
                    });
                }, 200);
            });
        }, (e) => {
            loading(e, "model");
            load.innerText =  `${(e.loaded / e.total * 100).toFixed(0)}%`; 
        }, undefined, CUSTOM);
    }
}

window.addMap = (url, name) => {
    if(!ready) return;
    if (all_map[url]) {
        scene.add(all_map[url]);
    } else {
        const position = name.dataset.pos;
        let load = name.previousElementSibling;
        var CUSTOM;
        if (position && position.length) {
            CUSTOM = window.top.addFileMap[position];
        }
        _loading.all++;
        var fromName = name.previousElementSibling.previousElementSibling.innerText;
        
        if((url.indexOf(".obj") !== -1 && url.indexOf(".mtl") !== -1) || (name.dataset.pos && fromName.endsWith(".obj"))){
            let urls = url.split(" && ");
            loadObjMtl(urls[1], urls[0], (gr) => {
                window.top.log("ok", `| Complete (map): ${url}`);
                gr.name = fromName;
                all_map[url] = gr;
                scene.add(gr);
                load.innerText = "Loaded";
                window.top.anyChange();
            });
        } else{
            loader.load(url, function (e) {
                window.top.log("ok", `| Complete (map): ${url}`);
                e.name = fromName;
                _loading.load++;
                all_map[url] = e;
                scene.add(e);
                load.innerText = "Loaded";
                window.top.anyChange();
            }, (e) => {
                loading(e, "map/object");
                load.innerText =  `${(e.loaded / e.total * 100).toFixed(0)}%`; 
            }, undefined, CUSTOM);
        }
    }
}
window.loadAll = (e) => {
    if(ready) return;
    var selection = e;
    if(!selection) return;
    var index = 0;
    var index_cam = 0;
    var k = selection.model.length + selection.camera.length + selection.vmd.length + selection.map.length;
    _loading.all = k;
    loadModel();
    
    function loadModel(){
        let {url, name, position, element} = selection.model[index];
        var CUSTOM;
        if(position && position.length){
            CUSTOM = window.top.addFile[position];
        }
        loader.load(url, (m) => {
            index++;
            _loading.load++;
            m.name = name;
            all_mesh[url] = m;
            window.top.log("ok", `| Complete (model): ${url}`);
            element.innerText = "Loaded";
            if(index < selection.model.length) {
                loadModel();
            } else{
                loadcam();
            }
        }, (e) => {
            loading(e, "model");
            element.innerText =  `${(e.loaded / e.total * 100).toFixed(0)}%`; 
        }, undefined, CUSTOM);
    }

    function loadcam(){
        if(selection.camera.length < 1){
            if (window.top.isMobile) {
                //if this site run on mobile device use this
                moveCam = new OrbitControls(camera, renderer.domElement);
                moveCam.minDistance = 5;
                moveCam.maxDistance = 150;
                // moveCam.position.set(0, 10, 10); // default pos
            } else {
                //if on pc/laptop use this to control with "WASD", "R" to swich to up speed, hold "C" to zoom
                moveCam = new Move3d(camera, { speed: 50, fly: 0.55, position: [0, 9, 25] });
            }
            loadVmd();
            window.top.log("info", `No Camera select, use control Type: ${window.top.isMobile ? "mobile" : "pc"}`);
            return;
        }
        let url = selection.camera;
        loader.loadAnimation(url, camera, (cameraAnimation) => {
            window.top.log("ok", `| Complete (camera): ${url}`);
            _loading.load += url.length;
            all_cam = cameraAnimation;
            loadVmd()
        }, (e) => {loading(e, "model")});
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
            _loading.load += selection.vmd.length;
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
            const { url, name, position, element } = selection.map[tur];
            var CUSTOM;
            if(position && position.length){
                CUSTOM = window.top.addFileMap[position];
            }
            if ((url.indexOf(".obj") !== -1 && url.indexOf(".mtl") !== -1) || (position && fromName.endsWith(".obj"))) {
                let urls = url.split(" && ");
                loadObjMtl(urls[1], urls[0], (gr) => {
                    window.top.log("ok", `| Complete (map): ${url}`);
                    _loading.load += 2;
                    gr.name = name;
                    all_map[url] = gr;
                    tur++;
                    element.innerText = "Loaded";
                    if (tur < selection.map.length) {
                        LoadBg();
                    } else {
                        addAll();
                    }
                });
            } else {
                loader.load(url, function (e) {
                    window.top.log("ok", `| Complete (map): ${url}`);
                    e.name = name;
                    all_map[url] = e;
                    _loading.load++;
                    tur++;
                    element.innerText = "Loaded";
                    if (tur < selection.map.length) {
                        LoadBg();
                    } else {
                        addAll();
                    }
                }, (e) => {
                    loading(e, "map/object");
                    element.innerText = `${(e.loaded / e.total * 100).toFixed(0)}%`;
                }, undefined, CUSTOM);
            }
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

var timeoutLoad = 0;
function loading(xhr, type){
    let value = xhr.loaded / xhr.total * 20;
    let val100 = xhr.loaded / xhr.total * 100;
    window.top.log("info", `${type}: ${cmt.slice(-value)}>`);
    let load = window.top.document.querySelector(".-progress-info");
    if(!val100 || val100 == Infinity) val100 = 100;
    load.innerText = `${type}: ${val100.toFixed(1)}% - (${_loading.load}/${_loading.all})`;
    clearTimeout(timeoutLoad);
    timeoutLoad = setTimeout(()=>{
        load.innerText = "";
    },3000);
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
                let currentRatio = window.innerWidth / window.innerHeight;
                return (height * currentRatio);
            }
        }
    }

    if (window.moveCam && !window.top.isMobile) {
        window.moveCam.camera.aspect = outValue.width / outValue.height;
        window.moveCam.camera.updateProjectionMatrix();
    } else {
        camera.aspect = outValue.width / outValue.height;
        camera.updateProjectionMatrix();
    }
    renderer.setSize(outValue.width, outValue.height);
    composer.setSize(outValue.width, outValue.height);
}

//
window.animate = function () {
    window.requestAnimationFrame(animate);
    render();
    
    for (let i = 0; i < window.callAnimate.length; i++) {
        const f = window.callAnimate[i];
        if (!f) continue;
        if(typeof f.function === "function"){
            f.function.call();
        }
    }
}
// for debug, not important
window.addCall = (f) => {
    if(typeof f === "function"){
        var id = performance.now()
        window.callAnimate.push({function: f, id: id});
        return id;
    }
}
window.removeCall = (id) => {
    for (let i = 0; i < window.callAnimate.length; i++) {
        const f = window.callAnimate[i];
        if(f.id == id){
            window.callAnimate.splice(i, 1);
            return;
        }
    }
    if(typeof f === "function"){
        var id = performance.now()
        window.callAnimate.push({function: f, id: id});
        return id;
    }
}
//

function render() {
    var t = clock.getDelta();
    checkTime++;
    // document.querySelector(".info").innerText = "clock: " + t;
    if (ready) {
        helper.update(t);
    } else{
        return;
    }
    
    composer.render(t);
    // camera.updateProjectionMatrix();
    if(window.moveCam){
        moveCam.update(t);
    } 
}
//sample check fps
setInterval(() => {
    fps = checkTime;
    checkTime = 0;
    let a = window.top.document.querySelector(".-render-fps");
    let b = window.top.document.querySelector(".-objects-render");
    a.innerText = `FPS: ${fps}`;
    b.innerText = `Objects: ${scene.children.length}`;
}, 999);

//
window.addEventListener("dblclick", () => {
    if(!window.moveCam || window.top.isMobile) return;
    window.moveCam.lockmouse();
});


window.onerror = (mess, file, line, col, error) => {
    var a = file;
    if(file && file.indexOf("/") !== -1){
        let sp = a.split("/");
        a = sp[sp.length - 1];
    }
    if(!file){a="console?"}
    window.top.log("error", `-Error on [${a}] - ${line}:${col}\n>${mess}`);
}
window.addEventListener('unhandledrejection', function (e) {
    window.top.log("error", e.reason);
});
