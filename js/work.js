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
var record;
var localSaveMeshOption = {};

var _re_size = {
    width: 1700,
    height: 800
}
var _setting = {
    oneSize: true
}
var isMobile = false;
// leftTopSelect.addEventListener("click", (e) => {
//     if (e.target.className == "option-lf") {
//         let a = document.querySelector(e.target.dataset.for);
//         if (a) {
//             a.style.display == "block" ? a.style.display = "" : a.style.display = "block";
//         }
//     }
// });
startPage();
function startPage(){
    var local = localStorage.getItem("LocalSave");
    if(local){
        localSaveMeshOption = JSON.parse(local);
    }
}
function loadFileList() {
    modelFile = new FileControl(setUp, {file: window.file.models, style: true, showPath: true});
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
    modelFile.on("allRight", (urls) => {
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            removeItem(selection.model, {
                url: url
            });
            window.renderFrame.removeMesh(url);
        }
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
    cameraFile.on("allRight", (urls) => {
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            removeItem(selection.camera, url);
        }
    });

    vmdFile = new FileControl(setUp, {file: window.file.vmd});
    vmdFile.create();
    vmdFile.on("left", (url) => {
        selection.vmd.push(url);
    });
    vmdFile.on("right", (url) => {
        removeItem(selection.vmd, url);
    });
    vmdFile.on("allRight", (urls) => {
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            removeItem(selection.vmd, url);
        }
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
    mapFile.on("allRight", (urls) => {
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            removeItem(selection.map, {
                url: url
            });
            window.renderFrame.removeMap(url);
        }
        anyChange();
    });
}
loadFileList()
/**
 * 
 * @param {MeshManager} obj 
 */
function setUpManager(obj){
    obj.on("posChange", (e) => {
        if (!localSaveMeshOption[e.modelName]) localSaveMeshOption[e.modelName] = {};
        if (!localSaveMeshOption[e.modelName].position) localSaveMeshOption[e.modelName].position = {};
        localSaveMeshOption[e.modelName].position[e.pos] = e.newValue;
        updateStorage();
    });
    obj.on("scaleChange", (e) => {
        if (!localSaveMeshOption[e.modelName]) localSaveMeshOption[e.modelName] = {};
        if (!localSaveMeshOption[e.modelName].scale) localSaveMeshOption[e.modelName].scale = {};
        localSaveMeshOption[e.modelName].scale[e.pos] = e.newValue;
        updateStorage();
    });
    obj.on("nameChange", (e) => {
        if (!localSaveMeshOption[e.modelName]) localSaveMeshOption[e.modelName] = {};
        if (!localSaveMeshOption[e.modelName].material) localSaveMeshOption[e.modelName].material = {};
        if (!localSaveMeshOption[e.modelName].material[e.index]) localSaveMeshOption[e.modelName].material[e.index] = {};
        localSaveMeshOption[e.modelName].material[e.index].name = e.newValue;
        updateStorage();
    });
    obj.on("visibleChange", (e) => {
        if (!localSaveMeshOption[e.modelName]) localSaveMeshOption[e.modelName] = {};
        if (!localSaveMeshOption[e.modelName].material) localSaveMeshOption[e.modelName].material = {};
        if (!localSaveMeshOption[e.modelName].material[e.index]) localSaveMeshOption[e.modelName].material[e.index] = {};
        localSaveMeshOption[e.modelName].material[e.index].visible = e.newValue;
        updateStorage();
    });
    obj.on("toneMappedChange", (e) => {
        if (!localSaveMeshOption[e.modelName]) localSaveMeshOption[e.modelName] = {};
        if (!localSaveMeshOption[e.modelName].material) localSaveMeshOption[e.modelName].material = {};
        if (!localSaveMeshOption[e.modelName].material[e.index]) localSaveMeshOption[e.modelName].material[e.index] = {};
        localSaveMeshOption[e.modelName].material[e.index].toneMapped = e.newValue;
        updateStorage();
    });
}
function updateStorage(){
    localStorage.setItem("LocalSave", JSON.stringify(localSaveMeshOption));
}
function anyChange(){
    if(_meshManager){
        _meshManager.update(window.renderFrame.scene);
        for (const key in _meshManager.objId) {
            let mesh = _meshManager.objId[key];
            for (const opt in localSaveMeshOption) {
                if(mesh.name == opt){
                    _meshManager.updateOption(mesh, localSaveMeshOption[opt]);
                }
            }
        }
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
function getHanderFile() {
    return new Promise(async (resolve, reject) => {
        if (window.showOpenFilePicker) {
            let files = await window.showOpenFilePicker({ multiple: false });
            let file = await files[0].getFile();
            resolve(file);
        } else{
            let input = document.querySelector("#__input_file");
            if(!input){
                input = document.createElement("input");
                input.type = "file";
                input.id = "__input_file";
            }
            input.click();
            input.onchange = () =>{
                resolve(input.files[0]);
            }
        }
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
function getBone(key, bone) {
    if (!bone) return;
    for (let i = 0; i < bone.length; i++) {
        if (bone[i].name.indexOf(key) !== -1) {
            console.log(i);
            console.log(bone[i]);
            return bone[i];
        }
    }
}
function resize(){
    if(window.innerWidth < _re_size.width){
        let zoom = window.innerWidth / _re_size.width;
        if(window.innerWidth < 1000){
            zoom = window.innerWidth / (_re_size.width * 0.5);
        }
        document.querySelector(".main-content").style.zoom = zoom;
    }
}
/**
 * 
 * @param {String | Number | undefined} type type: info | ok | warn | error 
 * @param {String} message out text
 */
function log(type, message){
    var name = "log-info";
    if(type == "ok" || type == 1) name = "log-ok";
    if(type == "warn" || type == 2) name = "log-warn";
    if(type == "error" || type == 3) name = "log-error";
    let target = document.querySelector(".log-content");
    let e = document.createElement("div");
    e.className = name;
    e.classList.add("log-message");
    let now = isMobile ? "" : Date.now();
    e.innerText = `[${new Date().toLocaleTimeString()}] ${message}`;
    e.title = now;
    target.appendChild(e);
    target.parentElement.scrollBy(0, 9999);
    let all = document.querySelectorAll(".log-content > .log-message");
    if(all.length > 199) all[0].remove();
}


window.onerror = (mess, file, line, col, error) => {
    var a = file;
    if(file && file.indexOf("/") !== -1){
        let sp = a.split("/");
        a = sp[sp.length - 1];
    }
    if(!file){a="console?"}
    log("error", `-Error on [${a}] - ${line}:${col}</br>>${mess}`);
}
window.addEventListener('unhandledrejection', function (e) {
    log("error", e.reason);
});

window.addEventListener('beforeunload', (e) => {
    e.preventDefault()
    return (e.returnValue = 'Are you sure you want to close?');

});
// Hide contextmenu when no hold ctrl
document.addEventListener("contextmenu", (e) => {
    if(!e.ctrlKey){
        e.preventDefault();
    }

}, {passive: false});

// from https://stackoverflow.com/a/11381730/21319279
window.mobileCheck = function() {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};
isMobile = mobileCheck();
(() => {
    var js = document.createElement("script");
    js.src = "js/selectorEvent.js";
    document.body.appendChild(js);
})();
