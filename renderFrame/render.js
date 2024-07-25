import * as THREE from 'three';

import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';
import { MMDAnimationHelper } from 'three/addons/animation/MMDAnimationHelper.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Move3d } from '../js/move.js';

import { MMDLoader } from 'three/addons/loaders/MMDLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
// import { OutlinePass } from '../../jsm/postprocessing/OutlinePass.js'; // not use

// Global to use in parent window
window.THREE = THREE; // global module to debug 

window.cam3d = null;
window.scene = null;
window.renderer  = null;
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
window.THREE = THREE;
window.composer = null;
window.renderScene = null;
window.bloomPass = null;
window.outputPass = null;
window.outlinePass = null;
window.audioCtx = null;
window.addif = false;
window.delta = 0;
//test for new idea in future
if (addif) {
    import("/bk/beta/animation/build/three.module.min.js").then((mod2) => {
        console.log(mod2); 
    });

}
window.bloom = {
    threshold: 0.7,
    strength: 0.7,
    radius: 1,
    exposure: 1
};
window.renderOption = {
    quality: "auto",
    plus: "auto",
    ratio: "auto",
    fps: true,
    outline: true,
    toneMappingExposure: 1.1,
    toneMapping: THREE.ACESFilmicToneMapping,
    colorSpace: THREE.LinearSRGBColorSpace,
    toneMapping: THREE.ACESFilmicToneMapping,
    shadow: true,
    light: 1
}
window.moveConfig = {
    speed: 5,
    fast: 2,
    fly: 0.6,
    zoom: 3,
    _fast: false
}
window.physicConfig = {
    unitStep: 1/70,
    maxStepNum: 2,
    gravity: new THREE.Vector3(0, -90, 0)
}
window.runner = new AnimationRunner(true, true);
window.valManager = new ValueManager();
window.ready = false;
window.callAnimate = [];
window.lights = {};
window.lightsCustom = {};
window.clock = new THREE.Clock();
var _loading = {load:0, all: 0}
window.all_mesh = {};
window.all_vmd = {};
window.all_animation = {};
window.all_map = {};
window.all_audio = {};
window.all_cam = null;

var cmt = "====================";
Ammo().then(function () {
    init();
    render();
});

function lightSetUp(){
    lights.ambient = new THREE.AmbientLight(0x404040);
    let col = renderOption.light === 1 ? 0xeeeeee : 0x0000ff;
    lights.dirLight = new THREE.DirectionalLight(col);
    lights.dirLight.position.set(30, 300, 20); // 75 300 -75
    lights.dirLight.castShadow = true;
    lights.dirLight.shadow.camera.scale.set(2,2,2);

    lights.directionalLight = new THREE.DirectionalLight(0xeeeeee, 1);
    lights.directionalLight.position.set(-30, 300, -400);

    scene.add(lights.ambient);
    scene.add(lights.dirLight);
    scene.add(lights.directionalLight);

    lights.spotLight = new THREE.SpotLight(0xf6ffc6, 100);
    lights.spotLight.position.set(0, 40, 30);
    lights.spotLight.angle = 0.7; // 0.5 - 1
    lights.spotLight.penumbra = 1;
    lights.spotLight.decay = 0.8; //min
    lights.spotLight.distance = 0;
    lights.spotLight.intensity = 40;
    // lights.spotLight.map = texture2;

    lights.spotLight.castShadow = true;
    lights.spotLight.shadow.mapSize.width = 1024;
    lights.spotLight.shadow.mapSize.height = 1024;
    lights.spotLight.shadow.camera.near = 1;
    lights.spotLight.shadow.camera.far = 100;
    lights.spotLight.shadow.camera.updateProjectionMatrix();
    lights.spotLight.shadow.focus = 1;
    if (renderOption.light === 2) {
        bloomPass.enabled = false;
        scene.add(lights.spotLight);
    }
}

function init() {
    if(window.top.renderOption){
        window.renderOption = structuredClone(window.top.renderOption);
        renderOption.toneMapping = THREE[renderOption.toneMapping];
        renderOption.colorSpace = THREE[renderOption.colorSpace];
        renderOption.toneMapping = THREE[renderOption.toneMapping];
    }

    const container = document.createElement('div');
    container.className = "container-render";
    document.body.appendChild(container);
    window.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    // scene
    scene = new THREE.Scene();

    scene.add(camera);


    renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
    renderer.setPixelRatio(1);
    renderer.toneMapping = renderOption.toneMapping; //
    renderer.toneMappingExposure = renderOption.toneMappingExposure; //
    // renderer.outputEncoding = THREE.LinearEncoding;
    renderer.outputColorSpace = renderOption.colorSpace;
    renderer.shadowMap.enabled = true;

    //auto update when value on option change
    valManager.add(renderOption, "toneMapping", renderer, "toneMapping");
    valManager.add(renderOption, "colorSpace", renderer, "outputColorSpace");
    valManager.add(renderOption, "toneMappingExposure", renderer, "toneMappingExposure");
    valManager.add(renderOption, "shadow", renderer.shadowMap, "enabled");

    container.appendChild(renderer.domElement);

    renderScene = new RenderPass( scene, camera );

    bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = bloom.threshold;
    bloomPass.strength = bloom.strength;
    bloomPass.radius = bloom.radius;

    outputPass = new OutputPass();
    // outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);

    composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composer.addPass(outputPass);
    // composer.addPass(outlinePass);

    lightSetUp();

    effect = new OutlineEffect(renderer);
    let renderingOutline = false;
    scene.onAfterRender = function () {
        if (renderingOutline || !renderOption.outline) return;
        renderingOutline = true;
        effect.renderOutline(scene, camera);
        renderingOutline = false;
    };

    helper = new MMDAnimationHelper({
        pmxAnimation: true,
        afterglow: 2.0,
        sync: false
    });
    loader = new MMDLoader();
    ObjLoader = new OBJLoader();
    MtlLoader = new MTLLoader();
    audioCtx = new AudioCtx();

    runner.addCall(()=>{
        audioCtx.update(delta);
        valManager.updateAll();
    });
    valManager.add(renderOption, "fps", runner, "fps");

    onWindowResize();
    window.addEventListener('resize', onWindowResize);
    
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

window.changeLight = (type) => {
    if(type === 1){
        checkObj();
        lights.dirLight.color.set(0xeeeeee);
        scene.remove(lights.spotLight);
        bloomPass.enabled = true;
    } else if(type === 2){
        checkObj();
        lights.dirLight.color.set(0x0000ff);

        scene.add(lights.spotLight);
        bloomPass.enabled = false;
    } else if(type === 0){
        for (const key in lights) {
            let value = lights[key];
            scene.remove(value);
        }
    }
    function checkObj(){
        for (const key in lightsCustom) {
            let value = lightsCustom[key];
            scene.remove(value);
        }
        scene.add(lights.ambient);
        scene.add(lights.dirLight);
        scene.add(lights.directionalLight);
    }
}
window.removeMesh = (url) => {
    if (all_mesh[url]) {
        all_mesh[url].pose();
        helper._restoreBones(all_mesh[url]);
        scene.remove(all_mesh[url]);
        helper.objects.delete(helper.objects.get(all_mesh[url]).mixer._actions[0]._clip);
        var physic = helper.objects.get(all_mesh[url]).physics;
        physic.reset();
        physic = null;
        helper.objects.get(all_mesh[url]).mixer = null;
        helper.remove(all_mesh[url]);
        _loading.all--;
    }
}
window.removeMap = (url) => {
    if (all_map[url]) {
        scene.remove(all_map[url]);
        _loading.all--;
    }
}

window.addMesh = (url, data) => {
    if(!ready) return;
    if (all_mesh[url]) {
        scene.add(all_mesh[url]);
        helper.add(all_mesh[url], {
            animation: all_animation[url],
            physics: true,
            unitStep: physicConfig.unitStep,
            maxStepNum: physicConfig.maxStepNum,
            gravity: physicConfig.physics
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
            m.castShadow = true;
            all_mesh[url] = m;
            loader.loadAnimation(window.top.selection.vmd, m, (mmd) => {
                window.top.log("ok", `| Complete (animation): ${window.top.selection.vmd}`);
                all_animation[url] = mmd;
                load.innerText = "Ok";
                setTimeout(() => {
                    scene.add(m);
                    window.top.anyChange();
                    helper.add(m, {
                        animation: mmd,
                        physics: true,
                        unitStep: physicConfig.unitStep,
                        maxStepNum: physicConfig.maxStepNum,
                        gravity: physicConfig.physics
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
        
        if((url.indexOf(".obj") !== -1 && url.indexOf(".mtl") !== -1) || (name.dataset.pos && fromName.endsWith(".obj.mtl"))){
            let urls = url.split(" && ");
            loadObjMtl(urls[1], urls[0], (gr) => {
                window.top.log("ok", `| Complete (map): ${url}`);
                gr.name = fromName;
                gr.receiveShadow = true;
                all_map[url] = gr;
                scene.add(gr);
                _loading.load++;
                load.innerText = "Ok";
                window.top.anyChange();
            });
        } else if(url.indexOf(".obj") !== -1 || (name.dataset.pos && fromName.endsWith(".obj"))){
            // for single .obj file
            ObjLoader.load(url, function (e) {
                window.top.log("ok", `| Complete (map): ${url}`);
                e.name = fromName;
                all_map[url] = e;
                e.receiveShadow = true;
                scene.add(e);
                _loading.load++;
                element.innerText = "Ok";
                window.top.anyChange();
            }, (e) => {
                loading(e, "map/object");
                load.innerText = `${(e.loaded / e.total * 100).toFixed(0)}%`;
            }, undefined, CUSTOM);
        } else{
            loader.load(url, function (e) {
                window.top.log("ok", `| Complete (map): ${url}`);
                e.name = fromName;
                all_map[url] = e;
                e.receiveShadow = true;
                scene.add(e);
                _loading.load++;
                load.innerText = "Ok";
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
    if(selection.model.length == 0){
        window.top.log("error", "No model select");
        return;
    }
    var index = 0;
    var index_cam = 0;
    var k = selection.model.length + selection.camera.length + selection.vmd.length + selection.map.length;
    _loading.all = k;
    loadModel();

 //-Slow load because potato device maybe crash
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
            m.castShadow = true;
            all_mesh[url] = m;
            window.top.log("ok", `| Complete (model): ${url}`);
            element.innerText = "Ok";
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
                moveCam = new Move3d(camera, { speed: 50, fly: 0.5, position: [0, 9, 25] });
                // moveCam = setUpMoveControl();
                setUpControl({
                    noUse: ["#-i-menu-cam"],
                    pc: true
                });
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
            setUpControl({
                noUse: ["#-i-menu-speed", "#-i-menu-fly"]
            });
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
            // addAll();
            loadAudio();
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
            if ((url.indexOf(".obj") !== -1 && url.indexOf(".mtl") !== -1) || (position && name.endsWith(".obj.mtl"))) {
                //for .obj file + .mtl file
                let urls = url.split(" && ");
                loadObjMtl(urls[1], urls[0], (gr) => {
                    window.top.log("ok", `| Complete (map): ${url}`);
                    _loading.load += 2;
                    gr.name = name;
                    gr.receiveShadow = true;
                    all_map[url] = gr;
                    tur++;
                    element.innerText = "Ok";
                    if (tur < selection.map.length) {
                        LoadBg();
                    } else {
                        // addAll();
                        loadAudio();
                    }
                });
            } else if(url.indexOf(".obj") !== -1 || (position && name.endsWith(".obj"))){
                // for single .obj file
                ObjLoader.load(url, function (e) {
                    window.top.log("ok", `| Complete (map): ${url}`);
                    e.name = name;
                    all_map[url] = e;
                    e.receiveShadow = true;
                    _loading.load++;
                    tur++;
                    element.innerText = "Ok";
                    if (tur < selection.map.length) {
                        LoadBg();
                    } else {
                        // addAll();
                        loadAudio();
                    }
                }, (e) => {
                    loading(e, "map/object");
                    element.innerText = `${(e.loaded / e.total * 100).toFixed(0)}%`;
                }, undefined, CUSTOM);
            } else {
                //default pmx
                loader.load(url, function (e) {
                    window.top.log("ok", `| Complete (map): ${url}`);
                    e.name = name;
                    all_map[url] = e;
                    e.receiveShadow = true;
                    _loading.load++;
                    tur++;
                    element.innerText = "Ok";
                    if (tur < selection.map.length) {
                        LoadBg();
                    } else {
                        // addAll();
                        loadAudio();
                    }
                }, (e) => {
                    loading(e, "map/object");
                    element.innerText = `${(e.loaded / e.total * 100).toFixed(0)}%`;
                }, undefined, CUSTOM);
            }
        }
    }

    function loadAudio(){
        if(!selection.audio[0]) {
            addAll();
            return;
        }
        const { url, name, position, element } = selection.audio[0]; // only 1 audio
        if(!url){
            addAll();
            return;
        } else{
            if(url.indexOf("blob:") !== -1){
                all_audio[url] = url;
                let k = Object.keys(all_animation);
                addAll();
                element.innerText = "Ok";
                audioCtx.setUrl(url, true).setOption({
                    smoothingTimeConstant: 0.2
                });
            } else {
                element.innerText = "Ok";
                fetch(url).then(e => e.blob()).then(blob => {
                    addAll();
                    element.innerText = "Ok";
                    let u = URL.createObjectURL(blob);
                    all_audio[url] = u;
                    let k = Object.keys(all_animation);
                    audioCtx.setUrl(u, true).setOption({
                        smoothingTimeConstant: 0.2
                    });
                });
            }
        }

    }
    function addAll(){
        for (const k in all_mesh) {
            scene.add(all_mesh[k]);
            helper.add(all_mesh[k], {
                animation: all_animation[k],
                physics: true,
                unitStep: physicConfig.unitStep,
                maxStepNum: physicConfig.maxStepNum,
                gravity: physicConfig.physics
            });
            audioCtx.setLimit(0, all_animation[k].duration);
        }
        for (const k in all_map) {
            scene.add(all_map[k]);
        }
        for (const k in all_audio) {
            if(all_audio[k].isUse){
                helper.add(all_audio[k].audio);
            }
        }
        if(all_cam){
            helper.add(camera, {
                animation: all_cam
            });
        }
        animate();
        if (window.top._meshManager) {
            window.top._meshManager.append();
            window.top.anyChange();
            runner.addCall(() => window.top._meshManager.updateMorph(window.top._meshManager.mesh));

        }
        ready = true;

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
    runner.start();
}
runner.addCall(render);

function render() {
    var t = clock.getDelta();
    window.delta = t;
    // t = 0.019;

    if (ready) {
        helper.update(t);
    } else{
        return;
    }
    composer.render(t);
    if(window.moveCam){
        if(moveCam.update) moveCam.update(t);
    } 
}

//sample check fps maybe not true
runner.onSecond = (stat) => {
    let a = window.top.document.querySelector(".-render-fps");
    let b = window.top.document.querySelector(".-objects-render");
    a.innerText = `FPS: ${stat.fps} - ${stat.fps_2}`;
    if(scene){
        b.innerText = `Objects: ${scene.children.length}`;
    }
};

function setUpControl(opt = {}){
    let cont = document.querySelector(".control-ui");
    let menu = document.querySelector(".lock-menu");
    let box = menu.querySelector(".menu");
    cont.style.display = "block";
    !opt.pc ? cont.querySelector(".bottom-tips").style.display = "none" : null;
    if(opt.noUse && Array.isArray(opt.noUse)){
        for (let i = 0; i < opt.noUse.length; i++) {
            const e = opt.noUse[i];
            let a = menu.querySelector(e);
            if(a){
                a.classList.add("-ct-no-use");
            }
        }
    }
    document.addEventListener("keydown", (e) => {
        var {code} = e;
        if(code == "KeyM"){
            menu.style.display == "block" ? menu.style.display = "" : menu.style.display = "block";
        }
        if(menu.style.display == "block"){
            var all = box.querySelectorAll(".item-menu");
            var index = getIndex(all);
            if(code == "ArrowUp"){
                all[index].classList.remove("-ct-selected");
                check(all, [index - 1]).classList.add("-ct-selected");
            } if(code == "ArrowDown"){
                all[index].classList.remove("-ct-selected");
                check(all, [index + 1]).classList.add("-ct-selected");
            } if(code == "ArrowRight"){
                sendValue(all[index], "1", all[index].querySelector(".option-value"));
            } if(code == "ArrowLeft"){
                sendValue(all[index], "-1", all[index].querySelector(".option-value"));
            }
            function check(e, i){
                if(i >= e.length) {
                    return e[0];
                } else if(i < 0){
                    return e[e.length-1];
                } else{
                    return e[i];
                }
            }
            function getIndex(list) {
                for (let i = 0; i < list.length; i++) {
                    const e = list[i];
                    if (e.classList.value.indexOf("-ct-selected") !== -1) {
                        return i;
                    }
                }
            }
        }
    });
    function sendValue(e, v, set){
        if(e.classList.value.indexOf("-ct-no-use") !== -1) return;
        if(e.id == "-i-menu-animate"){
            helper.enabled.animation ? helper.enabled.animation = false : helper.enabled.animation = true;
            set.innerText = helper.enabled.animation;
        } if(e.id == "-i-menu-cam"){
            helper.enabled.cameraAnimation ? helper.enabled.cameraAnimation = false : helper.enabled.cameraAnimation = true;
            set.innerText = helper.enabled.cameraAnimation;
        } if(e.id == "-i-menu-physic"){
            helper.enabled.physics ? helper.enabled.physics = false : helper.enabled.physics = true;
            set.innerText = helper.enabled.physics;
        } if(e.id == "-i-menu-speed"){
            let value = v * 5;
            moveCam.speed += value;
            set.innerText = moveCam.speed;
        } if(e.id == "-i-menu-fly"){
            let value = v * 0.1;
            moveCam.fly += value;
            set.innerText = moveCam.fly.toFixed(1);
        } if(e.id == "-i-menu-fov"){
            let value = v * 5;
            camera.fov += value;
            camera.updateProjectionMatrix();
            set.innerText = camera.fov;
        } if(e.id == "-i-menu-far"){
            let value = v * 50;
            camera.far += value;
            camera.updateProjectionMatrix();
            set.innerText = camera.far;
        }
    }
}

//not use
function setUpMoveControl(){
    var movement = new PointerLockControls(camera, renderer.domElement);
    document.addEventListener("keydown", (e) => {
        var {code} = e;
        var up = 1;
        if(code == "KeyR"){
            moveConfig._fast = !moveConfig._fast;
            if(moveConfig._fast) up = moveConfig.fast;
        }
        if(code == "KeyW"){
            movement.moveForward(moveConfig.speed*up);
        } if(code == "KeyA"){
            movement.moveRight(-moveConfig.speed*up);
        } if(code == "KeyS"){
            movement.moveForward(-moveConfig.speed*up);
        } if(code == "KeyD"){
            movement.moveRight(moveConfig.speed*up);
        } if(code == "Space"){
            movement.camera.position.y += moveConfig.fly * up;
        } if(code == "ShiftLeft"){
            movement.camera.position.y -= moveConfig.fly * up;
        }
    });
    movement.connect();
    return movement;
}

//
window.addEventListener("click", () => {
    if(!window.moveCam || window.top.isMobile) return;
    window.moveCam.lock();
});


window.addEventListener("blur", () => {
    window.top.focusPage = false;
});
window.addEventListener("focus", () => {
    window.top.focusPage = true;
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