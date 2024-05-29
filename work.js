// Code for fun, look like trash :/
var render = document.querySelector(".render");
var renderWindow = document.querySelector("#main-render");
var fileList = document.querySelector("#setup-render");
var leftTopSelect = document.querySelector(".top-selection");
var setUp = document.querySelector("#setup-render");
var loadbtn = setUp.querySelector("#load-all");
var meshView = document.querySelector("#mesh-view-option");
var domAni = document.querySelector(".animation-time");
var domCam = document.querySelector(".camera-time");
var _sync = false;
var modelFile;
var cameraFile;
var vmdFile;
var mapFile;
var res;
var _meshManager;
var selection = {
    model: [],
    camera: [],
    vmd: [],
    map: []
};
var addFile = {};
var addFileMap = {};
var addFileVmd = {};
var renderOption = {
    quality: "auto",
    plus: "auto",
    ratio: "auto"
}
leftTopSelect.addEventListener("click", (e) => {
    if (e.target.className == "option-lf") {
        let a = document.querySelector(e.target.dataset.for);
        if (a) {
            a.style.display == "block" ? a.style.display = "" : a.style.display = "block";
        }
    }
});

function loadFileList() {
    modelFile = new FileControl(setUp, {file: window.file.models, style: true});
    modelFile.create();
    modelFile.on("left", (url, e) => {
        selection.model.push({
            url: url,
            name: e.previousElementSibling.previousElementSibling.innerText,
            position: e.dataset.pos
        });
        window.renderFrame.addMesh(url, e);
        anyChange();
    });
    modelFile.on("right", (url, e) => {
        removeItem(selection.model, {
            url: url,
            name: e.previousElementSibling.previousElementSibling.innerText,
            position: e.dataset.pos
        });
        window.renderFrame.removeMesh(url);
        anyChange();
    });

    cameraFile = new FileControl(setUp, {file: window.file.camera});
    cameraFile.create();
    cameraFile.on("left", (url) => {
        selection.camera.push(url);
    });
    cameraFile.on("right", (url) => {
        removeItem(selection.camera, url);
    });

    vmdFile = new FileControl(setUp, {file: window.file.vmd});
    vmdFile.create();
    vmdFile.on("left", (url) => {
        selection.vmd.push(url);
    });
    vmdFile.on("right", (url) => {
        removeItem(selection.vmd, url);
    });
    var decore = [];
    for (let i = 0; i < window.file._bg.length; i++) {
        const e = window.file._bg[i];
        if(!e.isPmx) continue;
        let ar = [...e.src];
        ar.shift();
        decore.push({
            name: e.name,
            src: e.src[0],
            extension: ar
        });
    }

    mapFile = new FileControl(setUp, {file: decore});
    mapFile.create();
    mapFile.on("left", (url, e) => {
        selection.map.push({
            url: url,
            name: e.previousElementSibling.previousElementSibling.innerText,
            position: e.dataset.pos
        });
        window.renderFrame.addMap(url, e);
        anyChange();
    });
    mapFile.on("right", (url, e) => {
        removeItem(selection.map, {
            url: url,
            name: e.previousElementSibling.previousElementSibling.innerText,
            position: e.dataset.pos
        });
        window.renderFrame.removeMap(url);
        anyChange();
    });
}
loadFileList()
loadbtn.addEventListener("click", ()=>{
    let wait = new Promise((resolve, reject) => {
        res = resolve;
        renderWindow.contentWindow.location.reload();
    })
    wait.then(() => {
        if (window.renderFrame) {
            const wd = window.renderFrame;
            wd.loadAll(selection);
            meshView.innerHTML = "";
            _meshManager = new MeshManager(meshView, wd.scene);
        }
    });
});
function anyChange(){
    if(_meshManager){
        _meshManager.update(window.renderFrame.scene);
    }
}
function removeItem(arr, value){
    if(!arr) return;
    for (let i = 0; i < arr.length; i++) {
        const e = arr[i];
        if (typeof e !== "object"){
            if(e == value){
                arr.splice(i, 1);
            }
        } else{
            if(e.url){
                if(e.url == value.url){
                    arr.splice(i, 1);
                }
            }
        }
        
    }
}

function getTimeAnimation(url){
    if(window.renderFrame){
        var time = {
            currentTime: 0,
            duration: 0
        }
        if(!window.renderFrame.helper) return time;
        let wd = window.renderFrame;
        let mesh = wd.all_mesh[url];
        if(!mesh) return time;
        try {
            time.currentTime = wd.helper.objects.get(mesh).mixer._actions[0].time;
        } catch (e) {
            return time;
        }
        time.duration = wd.all_animation[url].duration;
        return time;
    }
}
function getTimeCamera(){
    if(window.renderFrame){
        var time = {
            currentTime: 0,
            duration: 0.1
        }
        if(!window.renderFrame.helper) return time;
        let wd = window.renderFrame;
        let cam = wd.camera;
        if(!cam) return time;
        try {
            time.currentTime = wd.helper.objects.get(cam).mixer._actions[0].time;
        } catch (e) {
            return time;
        }
        time.duration = wd.all_cam.duration;
        return time;
    }
}
function setTimeForAnimate(url, value = 0){
    if(!url) return;
    let wd = window.renderFrame;
    let mesh = wd.all_mesh[url];
    wd.helper.objects.get(mesh).mixer._actions[0].time = value;
}
function setTimeForCam(value = 0){
    let wd = window.renderFrame;
    let cam = wd.camera;
    wd.helper.objects.get(cam).mixer._actions[0].time = value;
}
setInterval(() => {
    if(window.renderFrame){
        if(window.renderFrame.ready){
            var animate = getTimeAnimation(selection.model[0].url);
            var cam = getTimeCamera();
            var aniCurrent = domAni.querySelector(".bar-time-current");
            var aniDur = domAni.querySelector(".bar-time-duration");
            var camCurrent = domCam.querySelector(".bar-time-current");
            var camDur = domCam.querySelector(".bar-time-duration");
            var bar1 = domAni.querySelector(".prog-bar");
            var bar2 = domCam.querySelector(".prog-bar");
            aniCurrent.innerText = timeToMin(secondsToTime(animate.currentTime));
            aniDur.innerText = timeToMin(secondsToTime(animate.duration));
            camCurrent.innerText = timeToMin(secondsToTime(cam.currentTime));
            camDur.innerText = timeToMin(secondsToTime(cam.duration));
            bar1.style.width = `${(animate.currentTime/animate.duration)*100}%`;
            bar2.style.width = `${(cam.currentTime/cam.duration)*100}%`;
        }
    }
}, 999);
domAni.querySelector(".bar-progress").addEventListener("click", (e) =>{
    if(!window.renderFrame) return;
    if(!window.renderFrame.ready) return;
    var tar = e.target;
    var x = e.layerX;
    var w = tar.offsetWidth;
    var per = x / w;
    var time = getTimeAnimation(selection.model[0].url);
    var value = per * time.duration;
    setTimeForAnimate(selection.model[0].url, value);
    if(_sync === true){
        setTimeForCam(value);
    }
});
domCam.querySelector(".bar-progress").addEventListener("click", (e) =>{
    if(!window.renderFrame) return;
    if(!window.renderFrame.ready) return;
    var tar = e.target;
    var x = e.layerX;
    var w = tar.offsetWidth;
    var per = x / w;
    var time = getTimeCamera();
    var value = per * time.duration;
    setTimeForCam(value);
    if(_sync === true){
        setTimeForAnimate(selection.model[0].url, value);
    }
});
document.querySelector(".right-menu > .rt-container").addEventListener("click", (e) => {barSwich(e, document.querySelector(".right-menu > .rt-container"))});
document.querySelector(".left-menu > .lf-container").addEventListener("click", (e) => {barSwich(e, document.querySelector(".left-menu > .lf-container"))});
function barSwich(e, element){
    var {target} = e;
    var clas = target.classList;
    if(clas[0] == "option-rt"){
        let cont = target.dataset.for;
        let show = element.querySelector(".-option-show-");
        if(show){ show.classList.remove("-option-show-") }
        document.querySelector(cont).classList.add("-option-show-");
    }
}
document.querySelector("#graph-render-option").addEventListener("change", (e) => {
    var {target} = e;
    if(!window.renderFrame) return;
    if(target.id == "graph-render-qualiti"){
        window.renderFrame.renderOption.quality = target.value;
        renderOption.quality = target.value;
    }
    if(target.id == "graph-render-qualiti-plus"){
        window.renderFrame.renderOption.plus = target.value;
        renderOption.plus = target.value;               
    }
    if(target.id == "graph-render-ratio"){
        window.renderFrame.renderOption.ratio = target.value;
        renderOption.ratio = target.value;
    }
    window.renderFrame.onWindowResize();
});
document.querySelector(".time-control").addEventListener("click", (e)=>{
    var tar = e.target;
    if (tar.classList[0] == "cs-btn") {
        if (tar.classList[1] == "play-mode") {
            if(window.renderFrame){
                if(renderFrame.helper){
                    let enabled = renderFrame.helper.enabled.animation;
                    if(enabled){
                        renderFrame.helper.enabled.animation = false;
                        tar.innerText = "Play"
                    } else{
                        renderFrame.helper.enabled.animation = true;
                        tar.innerText = "Pause"
                    }
                }
            }
        }
        if (tar.classList[1] == "play-sync") {
            if (_sync) {
                _sync = false;
                tar.classList.remove("active-option-");
            } else {
                _sync = true;
                tar.classList.add("active-option-");
            }
        }

        if (tar.classList[1] == "get-render-image") {
            if (window.renderFrame) {
                if (window.renderFrame.renderer) {
                    window.renderFrame.renderer.domElement.toBlob(data => {
                        downloadBlob(data, `MMD renderer - ${Date.now()}`);
                    });
                }
            }
        }
    }

    if (tar.parentElement.className == "time-sync") {
        let value = tar.innerText * 1;
        var {duration} = getTimeAnimation(selection.model[0].url);
        let time = duration * (value/100);
        setTimeForCam(time);
        setTimeForAnimate(selection.model[0].url, time);

    }
});
document.querySelector(".camera-control").addEventListener("click", (e)=>{
    var tar = e.target;
    if (tar.classList[0] == "cs-btn") {
        if (tar.classList[1] == "play-mode") {
            if(window.renderFrame){
                if(renderFrame.helper){
                    let enabled = renderFrame.helper.enabled.cameraAnimation;
                    if(enabled){
                        renderFrame.helper.enabled.cameraAnimation = false;
                        tar.innerText = "Play"
                    } else{
                        renderFrame.helper.enabled.cameraAnimation = true;
                        tar.innerText = "Pause"
                    }
                }
            }
        }
    }
});
function secondsToTime(e = 0) {
    if(!e) e = 0;
    const h = Math.floor(e / 3600).toString().padStart(2, '0'),
        m = Math.floor(e % 3600 / 60).toString().padStart(2, '0'),
        s = Math.floor(e % 60).toString().padStart(2, '0');
    return (h + ':' + m + ':' + s);
}
function timeToMin(time){
    let a = time.split(":");
    return `${a[1]}:${a[2]}`;
}
document.querySelector(".top-bar-list").addEventListener("click", async (e) => {
    var {target} = e;
    if (target.classList[0] == "top-select") {
        if (target.classList[1] == "open-drop-menu") {
            let a = document.querySelector(".file-drop-menu");
            a.style.display == "block" ? a.style.display = "" : a.style.display = "block";
        }
        
    }
});
document.querySelector(".file-drop-menu").addEventListener("click", async (e) => {
    var {target} = e;
    if (target.classList[0] == "item-box-menu") {
        if (target.classList[1] == "open-zip-mode") {
            if (window.showOpenFilePicker) {
                file = await getHanderFile();
                if(file.type == "application/zip"){
                    let allFile = await readZip(file, true);
                    let key = file.name + Date.now();
                    addFile[key] = allFile;
                    for (let i = 0; i < allFile.length; i++) {
                        const e = allFile[i];
                        if(e.name.endsWith(".pmx")){
                            modelFile.addObject({
                                name: e.name,
                                url: e.url,
                                position: key
                            });
                        }
                    }
                    
                }
            }
        }
        if (target.classList[1] == "open-zip-mode-map") {
            if (window.showOpenFilePicker) {
                file = await getHanderFile();
                if(file.type == "application/zip"){
                    let allFile = await readZip2(file, true);
                    let key = file.name + Date.now();
                    addFileMap[key] = allFile;
                    for (let i = 0; i < allFile.length; i++) {
                        const e = allFile[i];
                        if(e.name.endsWith(".pmx")){
                            mapFile.addObject({
                                name: e.name,
                                url: e.url,
                                position: key
                            });
                        }
                    }
                    
                }
            }
        }
        if (target.classList[1] == "open-zip-mode-vmd") {
            if (window.showOpenFilePicker) {
                file = await getHanderFile();
                if(file.type == "application/zip"){
                    let allFile = await readZip2(file, true);
                    let key = file.name + Date.now();
                    addFileVmd[key] = allFile;
                    for (let i = 0; i < allFile.length; i++) {
                        const e = allFile[i];
                        if(e.name.endsWith(".vmd")){
                            vmdFile.addObject({
                                name: e.name,
                                url: e.url,
                            });
                        }
                    }
                    
                }
            }
        }
        if (target.classList[1] == "open-zip-mode-file-cam") {
            if (window.showOpenFilePicker) {
                file = await getHanderFile();
                if (file.name.endsWith(".vmd")) {
                    cameraFile.addObject({
                        name: file.name,
                        url: URL.createObjectURL(file),
                    });
                }
            }
        }
        if (target.classList[1] == "open-zip-mode-file-mot") {
            if (window.showOpenFilePicker) {
                file = await getHanderFile();
                if (file.name.endsWith(".vmd")) {
                    vmdFile.addObject({
                        name: file.name,
                        url: URL.createObjectURL(file)
                    });
                }
            }
        }
    }
});
document.addEventListener("click", (e) => {
    if (e.target.classList[0] !== "top-select") {
        document.querySelector(".file-drop-menu").style.display = "";
    }
});
function getHanderFile(){
    return new Promise(async (resolve, reject) => {
        let files = await window.showOpenFilePicker({multiple: false});
        let file = await files[0].getFile();
        resolve(file);
    });
}
function downloadBlob(file, name) {
    let u = URL.createObjectURL(file);
    let a = document.createElement("a");
    a.setAttribute("download", name);
    a.setAttribute("target", "_blank");
    a.href = u;
    document.body.appendChild(a);
    a.click();
    a.remove();
}
function getBone(key, bone){
    if(!bone) return;
    for (let i = 0; i < bone.length; i++) {
    if(bone[i].name.indexOf(key) !== -1){
        console.log(i);
        console.log(bone[i]);
        return bone[i];
    }
}
}