
class FileControl{
    /**
     * 
     * @param {HTMLElement} conatiner container
     * @param {Object} params option
     * @param {Array} params.file files list
     * @param {Boolean} params.style add css
     */
    constructor(conatiner, params = {}){
        this.params = params;
        this.conatiner = conatiner;
        if(params.style === true){
            this.createCSS();
        }
        this.callbackLeft = [];
        this.callbackRight = [];
    }
    create(){
        if(!this.params.file) return;
        var fileList = "";
        this.count = 1;
        for (let i = 0; i < this.params.file.length; i++) {
            const e = this.params.file[i];
            let src = this.getSrc(e);
            for (let k = 0; k < src.length; k++) {
                const s = src[k];
                if(k === 0){
                    fileList += `
                    <div class="mmd-item" style="--s: ${this.count}">
                        <div class="mmd-item-name">${e.name}</div>
                        <div class="mmd-item-stat">unload</div>
                        <div class="mi-ovl" data-src="${s}"></div>
                    </div>
                    `;
                    this.count++;
                    continue;
                }
                fileList += `
                <div class="mmd-item small-child" style="--s: ${this.count}">
                    <div class="mmd-item-name">${e.name}</div>
                    <div class="mmd-item-stat">unload</div>
                    <div class="mi-ovl" data-src="${s}"></div>
                </div>
                `;
                this.count++;
            }
            this.count++;
        }
        let html = `
        <div class="map-ct m-box mmd-box-left"></div>
        <div class="map-sw mid-control">
            <div class="mid-ct-btn">&lt;</div>
            <div class="mid-ct-btn">&gt;</div>
        </div>
        <div class="map-ct m-box mmd-box-right">
            ${fileList}
        </div>
        `;
        let cont = document.createElement("div");
        cont.className = "mmd-block";
        cont.innerHTML = html;
        this.manager = cont;
        this.conatiner.appendChild(cont);
        this.left = this.manager.querySelector(".mmd-box-left");
        this.right = this.manager.querySelector(".mmd-box-right");

        this._addEvent();
    }
    addObject(param = {}){
        var {name, url, position} = param;
        var html = `
        <div class="mmd-item add-zip-child" style="--s: ${this.count}">
            <div class="mmd-item-name">${name}</div>
            <div class="mmd-item-stat">unload</div>
            <div class="mi-ovl" data-src="${url}" data-pos="${position}"></div>
        </div>
        `;
        this.count++;
        this.manager.querySelector(".mmd-box-right").insertAdjacentHTML("beforeend", html);
    }
    getSrc(obj){
        if(obj){
            if(obj.src){
                var list = [];
                if(obj.path && obj.path.length){
                    var path = obj.path;
                    if(!path.endsWith("/")){
                        path += "/"
                    }
                    list.push(path + obj.src);
                } else {
                    list.push(obj.src);
                }
                if(Array.isArray(obj.extension)){
                    for (let i = 0; i < obj.extension.length; i++) {
                        const e = obj.extension[i];
                        if(obj.path && obj.path.length){
                            var path = obj.path;
                            if(!path.endsWith("/")){
                                path += "/"
                            }
                            list.push(path + e);
                        } else {
                            list.push(e);
                        }
                    }
                }
                return list;
            }
        }
    }
    createCSS(){
        let style = document.createElement("style");
        style.innerHTML = `
        .mmd-mor{ position: absolute; width: 100%; height: 100%; left: 0; top: 0; display: flex; flex-direction: row; flex-wrap: wrap; overflow-y: scroll; }
        .mor-block{ position: relative; height: 40px; width: 3 }
        .mor-name{ font-size: 1.1em; color: #fff; position: relative; }
        .mor-value{ border: 1px solid #ddd; position: relative; width: 100%; height: 20px; }
        .mor-value > div{ position: absolute; top: 0; width: 5px; height: 100%; background-color: #00ffff; left: 20px; }
        .mmd-container { position: absolute; left: 0; top: 40px; width: 100%; height: calc(100% - 40px); display: flex; flex-direction: row; flex-wrap: wrap; user-select: none; overflow-y: scroll; background: #000000d3; }
        .mmd-block { position: relative; width: 475px; height: 240px; border: 1px solid #ddd; display: flex; flex-direction: row; margin: 5px; }
        .big-block{ width: 600px; }
        .m-box { position: relative; width: calc(50% - 15px); height: 100%; overflow-y: scroll; display: flex; flex-direction: column; }
        .mid-control { position: relative; width: 30px; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .mid-ct-btn { font-size: 2em; border: 1px solid #ddd; width: 28px; text-align: center; margin: 4px 0px 4px 0px; }
        .mid-ct-btn:hover { border: 1px solid #00ffff; color: #00ffff; }
        .mmd-box-left { border-right: 1px solid #ddd; }
        .mmd-box-right { border-left: 1px solid #ddd; }
        .mmd-item { display: flex; flex-direction: row; position: relative; justify-content: space-between; height: 20px; font-size: 1.1em; order: var(--s); margin-top: 2px; }
        .mmd-box-left > .mmd-item{ order: unset !important; }
        .mi-ovl { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
        .mmd-item-name{ white-space: nowrap; overflow: hidden; padding-left: 2px; }
        .mi-ovl:hover { background-color: #ffffff32; }
        .mmd-selected { background-color: #00ffff35 !important; }
        .small-child, .add-zip-child { width: calc(100% - 15px); margin-left: 15px; }
        .small-child::before { content: '|'; position: absolute; left: -11px; }
        .add-zip-child::before { content: '+'; position: absolute; left: -10px; }
        .mmd-item-stat { padding-right: 2px; }

        `;
        document.head.appendChild(style);
    }
    _addEvent(){
        if(this.manager){
            const scope = this;
            this.manager.addEventListener("click", (event) => {
                scope.clickEnent = event;
                let {target} = event;
                if(target.classList[0] == "mi-ovl"){
                    let {url} = target.dataset;
                    let deep = target.parentElement.parentElement;
                    let select = scope.manager.querySelector(".mmd-selected");
                    if(select){ select.classList.remove("mmd-selected") }
                    target.classList.add("mmd-selected");
                    if(deep.classList[2] == "mmd-box-right"){

                    }
                }
                if(target.className == "mid-ct-btn"){
                    let select = scope.manager.querySelector(".mmd-selected");
                    let deep = select.parentElement.parentElement;
                    if(target.innerHTML == "&lt;"){
                        if(deep.classList[2] == "mmd-box-right"){
                            scope.left.appendChild(select.parentElement);
                            scope._callEvent(scope, "left", select.dataset.src, select);
                        }
                    }
                    if(target.innerHTML == "&gt;"){
                        if(deep.classList[2] == "mmd-box-left"){
                            scope.right.appendChild(select.parentElement);
                            scope._callEvent(scope, "right", select.dataset.src, select);
                        }
                    }


                }
            })
        }
    }
    _callEvent(scope, type, data, element){
        if(type == "left"){
            for (let i = 0; i < scope.callbackLeft.length; i++) {
                const f = scope.callbackLeft[i];
                f(data, element);
            }
        }
        if(type == "right"){
            for (let i = 0; i < scope.callbackRight.length; i++) {
                const f = scope.callbackRight[i];
                f(data, element);
            }
        }
    }
    /**
     * 
     * @param {String} type type event when file move: left | right
     * @param {Function} callback callback event
     */
    on(type, callback){
        if(type){
            if(type === "left" && typeof callback === "function"){
                this.callbackLeft.push(callback)
            } else if(type === "right" && typeof callback === "function"){
                this.callbackRight.push(callback)
            }
        }
    }

}

class InfoMor{
    constructor(container, defaultValue, min, max) {
        if (typeof container == "string") {
            let a = document.querySelector(container);
            if (a) {
                this.cont = a;

            }
        } else if (typeof container == "object") {
            this.cont = container;
        } else {
            throw new Error(`No container with selector: ${container}`);

        }
        this.default = defaultValue ? defaultValue : 0;
        this.min = min ? min : 0;
        this.max = max ? max : 2;
        this.per = 0;
        if(this.min < this.max){
            for (let i = this.min; i < this.max; i++) {
                this.per++;
            }
        }
    }
    append(morphTargetDictionary, morphTargetInfluences, value = 0) {
        var key = [];
        var str = '';
        for (const k in morphTargetDictionary) {
            key.push(k);
        }
        for (let i = 0; i < key.length; i++) {
            const e = key[i];
            str +=
                `
            <div class="mor-block" data-num="${morphTargetDictionary[e]}">
                <div class="mor-name" data-mor="${e}">${e}</div>
                <div class="mor-value"><div></div></div>
            </div>
            `;
        }
        let a = document.createElement("div");
        a.className = "mmd-mor";
        a.innerHTML = str;
        this.cont.appendChild(a);
    }
    update(mesh) {
        let m = mesh.morphTargetInfluences;
        for (let i = 0; i < m.length; i++) {
            const e = m[i];
            let a = this.cont.querySelector(`.mor-block[data-num="${i}"] > .mor-value > div`);
            a.style.left = `${e*100}%`;
        }
    }
}
class MeshManager{
    constructor(conatiner, scene, params = {}){
        if(!conatiner) return;
        this.conatiner = conatiner;
        this.scene = scene;
        this.params = params;
        this.objId = {};
    }
    append(){
        this.mesh = this.getMesh(this.scene);
        var htName = "";
        var htMesh = "";
        for (let i = 0; i < this.mesh.length; i++) {
            const e = this.mesh[i];
            htName += `<div class="mesh-item" data-id="${e.uuid}">${e.name}</div>`;
            var htMaterial = "";

            for (let k = 0; k < e.material.length; k++) {
                const m = e.material[k];
                htMaterial += this._getHtmlMaterial({uuid: e.uuid, k, name: m.name});
            }
            htMesh += this._getHtmlCont({htMaterial, e});
        }

        var html = `
        <div class="mesh-select">
            ${htName}
        </div>
        ${htMesh}
        `; 
        var box = document.createElement("div");
        box.className = "mesh-view-box";
        box.innerHTML = html;
        this.conatiner.appendChild(box);
        this.target = box;
        this._addEvent();
    }
    update(scene){
        var filter = [];
        let list = this._getEleArr(".mesh-select > .mesh-item");
        var allList = [...list];
        for (let i = 0; i < scene.children.length; i++) {
            const e = scene.children[i];
            if(e.type === "SkinnedMesh"){
                filter.push(e);
                var isNoDelete = false;
                for (let k = 0; k < list.length; k++) {
                    const s = list[k];
                    if(s.dataset.id == e.uuid){
                        list.splice(k, 1);
                    }

                }
            }
        }
        this.mesh = [...filter];
        var needAdd = [...filter];
        for (let i = 0; i < allList.length; i++) {
            const e = allList[i];
            for (let k = 0; k < needAdd.length; k++) {
                const s = needAdd[k];
                if(e.dataset.id == s.uuid){
                    needAdd.splice(k, 1);
                }    
            }
        }
        list.forEach(e => {
            let select = this.target.querySelector(`.mesh-option[data-mesh="${e.dataset.id}"]`);
            select.remove();
            e.remove();
        });

        var htName = "";
        var htMesh = "";
        for (let i = 0; i < needAdd.length; i++) {
            const e = needAdd[i];
            htName += `<div class="mesh-item" data-id="${e.uuid}">${e.name}</div>`;
            var htMaterial = "";

            for (let k = 0; k < e.material.length; k++) {
                const m = e.material[k];
                htMaterial += this._getHtmlMaterial({uuid: e.uuid, k, name: m.name});
            }
            htMesh += this._getHtmlCont({htMaterial, e});
        }
        this.target.querySelector(".mesh-select").insertAdjacentHTML("beforeend", htName);
        this.target.insertAdjacentHTML("beforeend", htMesh);

    }
    _getHtmlMaterial(data = {}){
        return `
        <div class="material-item" data-for="${data.uuid}" data-index="${data.k}">
            <div class="mt-name">
                <input type="text" id="" class="mt-name-edit" value="${data.name}">
            </div>
            <div class="mt-option">
                <div class="option-item change-visible-" title="visible Show/Hide" data-active="true">S</div>
                <div class="option-item change-tonemapped-" title="ToneMapped True/False" data-active="true">T</div>
                <div class="option-item" title="">C</div>
            </div>
        </div>
        `;
    }
    _getHtmlCont(data = {}){
        return `
        <div class="mesh-option" data-mesh="${data.e.uuid}">
            <div class="mesh-show">material</div>
            <div class="mesh-value mesh-material">
                <div class="material-box">
                    <div class="material-item" data-for="${data.e.uuid}" data-index="__all__">
                        <div class="mt-name">
                            <input type="text" id="" class="mt-name-edit" value="____ALL____">
                        </div>
                        <div class="mt-option">
                            <div class="option-item change-visible-" title="visible Show/Hide all" data-type="t">S</div>
                            <div class="option-item change-tonemapped-" title="ToneMapped True/False all" data-type="t">T</div>
                            <div class="option-item" title="">C</div>
                        </div>
                    </div>
                    ${data.htMaterial}
                </div>
            </div>
            <div class="mesh-show">misc</div>
            <div class="mesh-value mesh-misc">
                <div class="misc-title">Position</div>
                <div class="misc-box">
                    <div class="misc-inner-title">X</div>
                    <input type="number" class="input-mesh-option inp-mesh-x" data-mode="position" value="${data.e.position.x}">
                    <div class="misc-inner-title">Y</div>
                    <input type="number" class="input-mesh-option inp-mesh-y" data-mode="position" value="${data.e.position.y}">
                    <div class="misc-inner-title">Z</div>
                    <input type="number" class="input-mesh-option inp-mesh-z" data-mode="position" value="${data.e.position.z}">
                </div>
                <div class="misc-title">Scale</div>
                <div class="misc-box">
                    <div class="misc-inner-title">X</div>
                    <input type="number" class="input-mesh-option inp-mesh-x" data-mode="scale" value="${data.e.scale.x}">
                    <div class="misc-inner-title">Y</div>
                    <input type="number" class="input-mesh-option inp-mesh-y" data-mode="scale" value="${data.e.scale.y}">
                    <div class="misc-inner-title">Z</div>
                    <input type="number" class="input-mesh-option inp-mesh-z" data-mode="scale" value="${data.e.scale.z}">
                </div>
            </div>
            <div class="mesh-show">morph</div>
            <div class="mesh-value mesh-morph"></div>
        </div>
    `;
    }
    _getEleArr(s){
        var ar = [];
        let a = this.target.querySelectorAll(s);
        a.forEach(e =>{
            ar.push(e);
        });
        return ar;
    }
    getMesh(scene){
        var filter = [];
        for (let i = 0; i < scene.children.length; i++) {
            const e = scene.children[i];
            if(e.type === "SkinnedMesh"){
                filter.push(e);
            }
        }
        return filter;
    }
    _addEvent(){
        if(!this.target) return;
        let scope = this;
        function changeValue(e){
            var {target} = e;
            if(target.classList[0] == "input-mesh-option"){
                let {mode} = target.dataset;
                if(mode == "position" || mode == "scale"){
                    let p = "parentElement";
                    let meshId = target[p][p][p].dataset.mesh;
                    if(!scope.objId[meshId]){
                        for (let i = 0; i < scope.mesh.length; i++) {
                            const m = scope.mesh[i];
                            if(m.uuid == meshId){
                                scope.objId[meshId] = m;
                                break;
                            }
                        }
                    } 
                    if(target.classList[1] == "inp-mesh-x"){ scope.objId[meshId][mode].x = target.valueAsNumber }
                    if(target.classList[1] == "inp-mesh-y"){ scope.objId[meshId][mode].y = target.valueAsNumber }
                    if(target.classList[1] == "inp-mesh-z"){ scope.objId[meshId][mode].z = target.valueAsNumber }
                }
            }
        }
        this.target.addEventListener("change", changeValue);
        this.target.addEventListener("click", (e) => {
            scope.clickEnent = e;
            var {target} = e;
            if(target.className == "mesh-item"){
                let allOp = scope.target.querySelectorAll(".mesh-option");
                allOp.forEach(el => {
                    el.style.display = "";
                });
                let select = scope.target.querySelector(`.mesh-option[data-mesh="${target.dataset.id}"]`);
                select.style.display = "block";
                scope.selectOption = select;
            }
            if (target.classList[0] == "option-item") {
                let deep = target.parentElement.parentElement.dataset;
                let id = deep.for;
                let index = deep.index;
                if(index == "__all__"){
                    let all = target.parentElement.parentElement.parentElement.querySelectorAll(".material-item");
                    var filter;
                    for (let i = 0; i < this.mesh.length; i++) {
                        const e = this.mesh[i];
                        if (e.uuid == id) {
                            filter = e;
                        }
                    }
                    function setAll(att, value){
                        for (let i = 1; i < all.length; i++) {
                            const e = all[i];
                            filter.material[i - 1][att] = value;
                            if (att == "visible") {
                                var t = e.querySelector(".change-visible-");
                                t.dataset.active = value ? "true" : "false";;
                                t.innerText = value ? "S" : "H";
                            }
                            if (att == "toneMapped") {
                                var t = e.querySelector(".change-tonemapped-");
                                t.dataset.active = value ? "true" : "false";;
                                t.innerText = value ? "T" : "F";
                            }
                        }
                    }
                    if (target.classList[1] == "change-visible-") {
                        if (target.dataset.type == "t") {
                            setAll("visible", false);
                            target.dataset.type = "f";
                            target.innerText = "H";
                        } else {
                            setAll("visible", true);
                            target.dataset.type = "t";
                            target.innerText = "S";
                        }
                    }
                    if (target.classList[1] == "change-tonemapped-") {
                        if (target.dataset.type == "t") {
                            setAll("toneMapped", false);
                            target.dataset.type = "f";
                            target.innerText = "F";
                        } else {
                            setAll("toneMapped", true);
                            target.dataset.type = "t";
                            target.innerText = "T";
                        }
                    }
                    return;
                }
                if (target.classList[1] == "change-visible-") {
                    for (let i = 0; i < this.mesh.length; i++) {
                        const e = this.mesh[i];
                        if (e.uuid == id) {
                            let tg = e.material[index * 1].visible;
                            if (tg) {
                                e.material[index * 1].visible = false;
                                target.innerText = "H";
                                target.dataset.active = "false";
                                return;
                            } else {
                                e.material[index * 1].visible = true;
                                target.innerText = "S";
                                target.dataset.active = "true";
                                return;
                            }
                        }
                    }
                }
                if (target.classList[1] == "change-tonemapped-") {
                    for (let i = 0; i < this.mesh.length; i++) {
                        const e = this.mesh[i];
                        if (e.uuid == id) {
                            let tg = e.material[index * 1].toneMapped;
                            if (tg) {
                                e.material[index * 1].toneMapped = false;
                                target.innerText = "F";
                                target.dataset.active = "false";
                                return;
                            } else {
                                e.material[index * 1].toneMapped = true;
                                target.innerText = "T";
                                target.dataset.active = "true";
                                return;
                            }
                        }
                    }
                }

            }
        });
    }
}

/**
 * 
 * @param {Blob} zip Blob file
 * @param {Boolean} url Is auto create object url
 * @returns {Array} name, file, url
 */
function readZip(zip, url){
    var u = URL.createObjectURL(zip);
    return new Promise((resolve, reject) => {
        JSZipUtils.getBinaryContent(u, function(err, data) {
            if(err) {
                throw err; // or handle err
            }
        
            JSZip.loadAsync(data, { encoding: 'Shift-JIS' }).then(async function (e) {
               if(e){
                e.files
                var arr = [];
                for (const k in e.files) {
                    if(e.files[k]){
                        var f = await e.files[k].async("blob");
                        var p = "none";
                        if(url){p = URL.createObjectURL(f)}
                        arr.push({
                            name: k,
                            file: f,
                            url: p
                        });
                    }
                }
                resolve(arr);
               } else{
                reject("unknow");
               }
            });
        });
    });
}
var loader;
var loggg = []
function readZip2(zip, url) {
    if (!loader) {
        loader = new ThreeLoader();
    }
    var url = URL.createObjectURL(zip);
    return new Promise((resolve, reject) => {

        loader.setResponseType('arraybuffer').load(url, function (buffer) {

            JSZip.loadAsync(buffer, {
                decodeFileName: function (bytes) {
                    var decoder = new TextDecoder('Shift_JIS');
                    var decodedString = decoder.decode(bytes);
                    loggg.push(bytes);
                    return decodedString;
                }
            }).then(async function (e) {
                if (e) {
                    e.files
                    var arr = [];
                    for (const k in e.files) {
                        if (e.files[k]) {
                            var f = await e.files[k].async("blob");
                            var p = "none";
                            if (url) { p = URL.createObjectURL(f) }
                            arr.push({
                                name: k,
                                file: f,
                                url: p
                            });
                        }
                    }
                    resolve(arr);
                } else {
                    reject("unknow");
                }
            });
        });
    });
}
