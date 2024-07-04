// Support to work.js
// no idea
class FileControl{
    /**
     * 
     * @param {HTMLElement} conatiner container
     * @param {Object} params option
     * @param {Array} params.file files list
     * @param {Boolean} params.style add css
     * @param {String} params.dropTitle title when drag file to box
     * @param {String} params.title title on box
     * @param {Boolean} params.single only 1 file is selected
     * @param {Boolean | undefined} params.showPath show pathName file
     */
    constructor(conatiner, params = {}){
        this.params = params;
        this.conatiner = conatiner;
        if(params.style === true){
            this.createCSS();
        }
        this.callbackLeft = [];
        this.callbackRight = [];
        this.callbackRemoveAll = [];
        this.ondrop = null;
        this.name = "";
    }
    create(){
        if(!this.params.file) return;
        var fileList = "";
        var isHaveEx = false;
        this.count = 1;
        for (let i = 0; i < this.params.file.length; i++) {
            const e = this.params.file[i];
            let src = this.getSrc(e);
            for (let k = 0; k < src.length; k++) {
                const s = src[k];
                if(k === 0){
                    var path = "";
                    if(this.params.showPath === true && e.pathName) path = e.pathName;
                    fileList += `
                    <div class="mmd-item" style="--s: ${this.count}">
                        <div class="mmd-item-name">${path} - ${e.name}</div>
                        <div class="mmd-item-stat">unload</div>
                        <div class="mi-ovl" data-src="${s}"></div>
                    </div>
                    `;
                    this.count++;
                    continue;
                }
                fileList += `
                <div class="mmd-item small-child" style="--s: ${this.count}">
                    <div class="mmd-item-name">${e.name} m${k}</div>
                    <div class="mmd-item-stat">unload</div>
                    <div class="mi-ovl" data-src="${s}"></div>
                </div>
                `;
                isHaveEx = true;
                this.count++;
            }
            this.count++;
        }
        var ex = `<div class="mid-ct-btn -md-hide" title="Hide misc file">H</div>`;
        let html = `
        <div class="mmd-block">
            <div class="map-ct m-box mmd-box-left"></div>
            <div class="map-sw mid-control">
                <div class="mid-ct-btn -md-left" title="Move to selected box">&lt;</div>
                <div class="mid-ct-btn -md-right" title="Remove select">&gt;</div>
                <div class="mid-ct-btn -md-all" title="Remove all select">&gt;&gt;</div>
                ${isHaveEx ? ex : ""}
            </div>
            <div class="map-ct m-box mmd-box-right">
                ${fileList}
            </div>
            <div class="hov-drag-ovl"><div class="hov-drag-text"></div></div>
        </div>
        `;
        let title = this.params.title ? `<div class="fc-box-title">${this.params.title}</div>` : "";
        let cont = document.createElement("div");
        // cont.className = "mmd-block";
        cont.innerHTML = title + html;
        this.manager = cont;
        this.conatiner.appendChild(cont);
        this.left = this.manager.querySelector(".mmd-box-left");
        this.right = this.manager.querySelector(".mmd-box-right");
        if(this.params.addOnDrag){
            this.manager.addEventListener("dragover", (e) =>{
                e.preventDefault();
                var el = this.manager.querySelector(".hov-drag-ovl"); 
                el.style.display = "flex";
                el.querySelector(".hov-drag-text").innerText = `Drop ${this.params.dropTitle} File Here`;
            });
            this.manager.addEventListener("dragend", (e) =>{
                e.preventDefault();
                var el = this.manager.querySelector(".hov-drag-ovl"); 
                el.style.display = "";
                el.querySelector(".hov-drag-text").innerText = ``;
            });
            this.manager.addEventListener("dragleave", () =>{
                var el = this.manager.querySelector(".hov-drag-ovl"); 
                el.style.display = "";
                el.querySelector(".hov-drag-text").innerText = ``;
            });
            this.manager.addEventListener("drop", (e) =>{
                e.preventDefault();
                var el = this.manager.querySelector(".hov-drag-ovl"); 
                el.style.display = "";
                el.querySelector(".hov-drag-text").innerText = ``;
                if(this.ondrop) { this.ondrop(e)};
            });
            this.manager.addEventListener("drag", (e) => e.preventDefault()); 
            this.manager.addEventListener("draged", (e) => e.preventDefault()); 
        }
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
        .mmd-block { position: relative; width: 480px; height: 245px; border: 1px solid #ddd; display: flex; flex-direction: row; margin: 5px; }
        .big-block{ width: 600px; }
        .m-box { position: relative; width: calc(50% - 15px); height: 100%; overflow-y: scroll; display: flex; flex-direction: column; }
        .mid-control { position: relative; width: 30px; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .mid-ct-btn { font-size: 1.9em; border: 1px solid #ddd; width: 28px; text-align: center; margin: 4px 0px 4px 0px; }
        .mid-ct-btn:hover { border: 1px solid #00ffff; color: #00ffff; }
        .mmd-box-left { border-right: 1px solid #ddd; }
        .mmd-box-right { border-left: 1px solid #ddd; }
        .mmd-item { display: flex; flex-direction: row; position: relative; justify-content: space-between; font-size: 1.1em; order: var(--s); margin-top: 2px; }
        .mmd-box-left > .mmd-item{ order: unset !important; }
        .mi-ovl { position: absolute; left: 0; top: 0; width: 100%; height: 100%; }
        .mmd-item-name{ white-space: nowrap; overflow: hidden; padding-left: 2px; }
        .mi-ovl:hover { background-color: #ffffff32; }
        .mmd-selected { background-color: #00ffff35 !important; }
        .small-child, .add-zip-child { width: calc(100% - 15px); margin-left: 15px; }
        .small-child::before { content: '|'; position: absolute; left: -10px; }
        .add-zip-child::before { content: '+'; position: absolute; left: -10px; background: green; height: 100%; padding: 1px; }
        .mmd-item-stat { padding-right: 2px; }
        .fc-box-title { font-size: 1.2em; margin-left: 5px; }
        .hov-drag-ovl{ position: absolute; width: 100%; height: 100%; left: 0; top: 0; background: #00dd0060; display: none; flex-direction: column; align-content: center; justify-content: center; align-items: center; }
        .hov-drag-text { font-size: 2em; background: #00000060; padding: 5px; }
        `;
        document.head.appendChild(style);
    }
    connect(manager){
        if(!manager || typeof manager !== "object") return;
        if(this.linked) console.warn("Replace connect");
        this.linked = manager;
        let el = document.createElement("div");
        el.className = "mid-ct-btn";
        el.classList.add("-md-move");
        el.innerText = "T";
        el.title = `Move Object To ${manager.name}`;
        this.manager.querySelector(".map-sw.mid-control").appendChild(el);
    }
    _addEvent(){
        if(this.manager){
            const scope = this;
            this.manager.addEventListener("dblclick", () => {
                let select = scope.manager.querySelector(".mmd-selected");
                if (!select) return;
                let deep = select.parentElement.parentElement;
                if (deep.classList[2] == "mmd-box-right") {
                    if(scope.params.single){
                        let a = scope.left.querySelector(".mmd-item");
                        if(a){
                            let data = a.querySelector(".mi-ovl");
                            scope.right.appendChild(a);
                            scope._callEvent(scope, "right", data.dataset.src, data);
                        }
                    }
                    scope.left.appendChild(select.parentElement);
                    scope._callEvent(scope, "left", select.dataset.src, select);
                } else if (deep.classList[2] == "mmd-box-left") {
                    scope.right.appendChild(select.parentElement);
                    scope._callEvent(scope, "right", select.dataset.src, select);
                }
            });
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
                if(target.classList[0] == "mid-ct-btn"){
                    if (target.innerText == "H") {
                        scope.manager.querySelectorAll(".mmd-item.small-child").forEach(e => {
                            e.style.display = "none";
                        });
                        target.innerText = "S";
                    } else if (target.innerText == "S") {
                        scope.manager.querySelectorAll(".mmd-item.small-child").forEach(e => {
                            e.style.display = "";
                        });
                        target.innerText = "H";
                    }
                    if(target.classList[1] == "-md-all"){
                        let all = scope.left.querySelectorAll(".mmd-item");
                        let data = [];
                        let obj = [];
                        for (let i = 0; i < all.length; i++) {
                            const e = all[i];
                            let ov = e.querySelector(".mi-ovl");
                            data.push(ov.dataset.src);
                            obj.push(ov);
                            scope.right.appendChild(e);
                        }
                        scope._callEvent(scope, "allRight", data, obj);
                    }
                    
                    let select = scope.manager.querySelector(".mmd-selected");
                    if(!select) return;
                    let deep = select.parentElement.parentElement;
                    if(target.classList[1] == "-md-left"){
                        if(deep.classList[2] == "mmd-box-right"){
                            if(scope.params.single){
                                let a = scope.left.querySelector(".mmd-item");
                                if (a) {
                                    let data = a.querySelector(".mi-ovl");
                                    scope.right.appendChild(a);
                                    scope._callEvent(scope, "right", data.dataset.src, data);
                                }
                            }
                            scope.left.appendChild(select.parentElement);
                            scope._callEvent(scope, "left", select.dataset.src, select);
                        }
                    }
                    if(target.classList[1] == "-md-right"){
                        if(deep.classList[2] == "mmd-box-left"){
                            scope.right.appendChild(select.parentElement);
                            scope._callEvent(scope, "right", select.dataset.src, select);
                        }
                    }
                    if(target.classList[1] == "-md-move"){
                        if(deep.classList[2] == "mmd-box-left"){
                            scope._callEvent(scope, "right", select.dataset.src, select);
                        }
                        if(deep.classList[2] == "mmd-box-right"){
                            scope.linked.right.appendChild(select.parentElement);
                            select.parentElement.attributes.style.value = `--s: 0`;
                        }
                        select.classList.remove("mmd-selected");
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
        if(type == "allRight"){
            for (let i = 0; i < scope.callbackRemoveAll.length; i++) {
                const f = scope.callbackRemoveAll[i];
                f(data, element);
            }
        }
    }
    /**
     * 
     * @param {String} type type event when file move: left | right | allRight
     * @param {Function} callback callback event
     */
    on(type, callback){
        if(type){
            if(type === "left" && typeof callback === "function"){
                this.callbackLeft.push(callback);
            } else if(type === "right" && typeof callback === "function"){
                this.callbackRight.push(callback);
            } else if(type === "allRight" && typeof callback === "function"){
                this.callbackRemoveAll.push(callback);
            }
        }
    }

}

class MeshManager{
    /**
     * 
     * @param {HTMLElement} conatiner container
     * @param {Object3D} scene scene three.js
     * @param {Object} params option
     * @returns {undefined} when no container
     */
    constructor(conatiner, scene, params = {}){
        if(!conatiner) return;
        this.conatiner = conatiner;
        this.scene = scene;
        this.params = params;
        this.objId = {};
        this.mesh = [];
        this.callEvent = {
            posChange: [],
            scaleChange: [],
            nameChange: [],
            visibleChange: [],
            toneMappedChange: []
        }
    }
    append(){
        this.mesh = this.getMesh(this.scene);
        var htName = "";
        var htMesh = "";
        
        for (let i = 0; i < this.mesh.length; i++) {
            const e = this.mesh[i];
            htName += `<div class="mesh-item" role="button" data-id="${e.uuid}" title="${e.name}">${e.name}</div>`;
            var htMaterial = "";
            var htMorph = "";
            for (let k = 0; k < e.material.length; k++) {
                const m = e.material[k];
                htMaterial += this._getHtmlMaterial({uuid: e.uuid, k, name: m.name});
            }
            for (const key in e.morphTargetDictionary) {
                htMorph += this._getHtmlMorph({
                    name: key,
                    to: e.morphTargetDictionary[key],
                    uuid: e.uuid
                });
            }
            htMesh += this._getHtmlCont({htMaterial, e, htMorph});
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
        this._upObj();
    }
    /**
     * 
     * @param {Object3D} scene scene
     */
    update(scene){
        var filter = [];
        let list = this._getEleArr(".mesh-select > .mesh-item");
        var allList = [...list];
        for (let i = 0; i < scene.children.length; i++) {
            const e = scene.children[i];
            if(e.type === "SkinnedMesh" || e.type === "Group"){
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
            htName += `<div class="mesh-item" role="button" data-id="${e.uuid}" title="${e.name}">${e.name}</div>`;
            var htMaterial = "";
            var htMorph = "";
            if (!e.material) {
                htMesh += this._getHtmlCont({ htMaterial, e });
            continue;
            };
            for (let k = 0; k < e.material.length; k++) {
                const m = e.material[k];
                htMaterial += this._getHtmlMaterial({uuid: e.uuid, k, name: m.name});
            }
            for (const key in e.morphTargetDictionary) {
                htMorph += this._getHtmlMorph({
                    name: key,
                    to: e.morphTargetDictionary[key],
                    uuid: e.uuid
                });
            }
            htMesh += this._getHtmlCont({htMaterial, e, htMorph});
        }
        this.target.querySelector(".mesh-select").insertAdjacentHTML("beforeend", htName);
        this.target.insertAdjacentHTML("beforeend", htMesh);

        this._upObj();
    }
    /**
     * 
     * @param {Object} mesh mesh
     * @param {Object} option 
     * @param {Object} option.position
     * @param {Object} option.scale
     * @param {Object} option.material
     */
    updateOption(mesh, option){
        let {position, scale, material} = option;
        let scope = this;
        if(position){
            let {x, y, z} = position;
            mesh.position.set(c(x), c(y), c(z));
            setDomValue("position");
        }
        if(scale){
            let {x, y, z} = scale;
            mesh.scale.set(c(x), c(y), c(z));
            setDomValue("scale");
        }
        if(material){
            let cont = scope.target.querySelector(`.mesh-option[data-mesh="${mesh.uuid}"]`);
            if(!cont) return;
            for (const key in material) {
                let tar = cont.querySelector(`.material-item[data-index="${key}"]`);
                if(!tar) continue;
                let obj = material[key];
                if(obj.name){
                    tar.querySelector(".mt-name-edit").value = obj.name;
                }
                if(obj.visible === false){
                    let btn = tar.querySelector(".change-visible-");
                    btn.innerText = "H";
                    mesh.material[key*1].visible = false;
                    btn.dataset.active = "false";
                }
                if(obj.toneMapped === false){
                    let btn = tar.querySelector(".change-tonemapped-");
                    btn.innerText = "H";
                    mesh.material[key*1].toneMapped = false;
                    btn.dataset.active = "false";
                }
            }
        }
        function setDomValue(type){
            let cont = scope.target.querySelector(`.mesh-option[data-mesh="${mesh.uuid}"]`);
            if(cont){
                if (type == "position") {
                    let { x, y, z } = position;
                    cont.querySelector(`.inp-mesh-x[data-mode="position"]`).value = x | 0;
                    cont.querySelector(`.inp-mesh-y[data-mode="position"]`).value = y | 0;
                    cont.querySelector(`.inp-mesh-z[data-mode="position"]`).value = z | 0;
                } else if (type == "scale") {
                    let { x, y, z } = scale;
                    cont.querySelector(`.inp-mesh-x[data-mode="scale"]`).value = x | 0;
                    cont.querySelector(`.inp-mesh-y[data-mode="scale"]`).value = y | 0;
                    cont.querySelector(`.inp-mesh-z[data-mode="scale"]`).value = z | 0;
                }
            }
        }
        function c(value){ return value ? value : 0 }
    }
    updateMorph(meshs){
        if (!Array.isArray(meshs)){
            meshs = [meshs];
        }
        for (let i = 0; i < meshs.length; i++) {
            const mesh = meshs[i];
            // if(!this.target) continue;
            var select = this.target.querySelector(`.mesh-option[data-mesh="${mesh.uuid}"]`);
            var at = select.querySelector("#auto-update").checked;
            //no update when no check auto update or element is hide
            //element hide with display: none; have width & height = 0 
            if (!at || at.offsetHeight == 0) continue;
            var morphHtml = select.querySelector(".morph-list");
            for (const key in mesh.morphTargetDictionary) {
                let e = morphHtml.querySelector(`.morph-box[data-name="${key}"]`);
                if (e) {
                    var target = e.querySelector(".morph-input");
                    if(target.value !== mesh.morphTargetInfluences[mesh.morphTargetDictionary[key]]){ // no update if value no change
                        target.value = mesh.morphTargetInfluences[mesh.morphTargetDictionary[key]];
                    }
                }
            }
        }
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
            <div class="misc-box">
                <input type="checkbox" id="no-scroll-" class="inp-checkbox">
                <label for="no-scroll-" class="label-inp">No scroll list</label>
            </div>
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
                <div class="misc-box">
                    <input type="checkbox" id="auto-rs-physic" class="inp-checkbox" data-mesh="${data.e.uuid}">
                    <label for="auto-rs-physic" class="label-inp">Auto Reset Physic</label>
                </div>
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
            <div class="mesh-value mesh-morph">
                <div class="morph-option">
                    <div class="misc-box">
                        <input type="checkbox" id="auto-update" class="inp-checkbox">
                        <label for="auto-update" class="label-inp">Auto Update</label>
                    </div>
                </div>
                <div class="morph-list">${data.htMorph}</div>
            </div>
        </div>
    `;
    }
    _getHtmlMorph(data = {}){
        return `
        <div class="morph-box" data-name="${data.name}">
            <input type="text" class="morph-name" value="${data.name}">
            <input type="range" class="cs-input morph-input" value="0" data-uuid="${data.uuid}" data-to="${data.to}" min="0" max="1" step="0.1">
        </div>
        `;
    }
    updateRsPhysics(helper){
        if(!helper) return;
        this.helper = helper;
            for (let i = 0; i < this.mesh.length; i++) {
                const e = this.mesh[i];
                var data = this.helper.objects.get(e);
                if(data){
                    var el = document.querySelector(`#auto-rs-physic[data-mesh="${e.uuid}"]`);
                    if(el.checked) {
                        data.physics.reset();
                    }
                }
            }
    }
    _upObj() {
        for (let i = 0; i < this.mesh.length; i++) {
            const m = this.mesh[i];
            this.objId[m.uuid] = m;
        }
    }
    _getEleArr(s){
        var ar = [];
        if(!this.target) return ar;
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
    /**
     * 
     * @param {String} type type event "posChange" | "scaleChange" | "nameChange" | "visibleChange" | "toneMappedChange"
     * @param {Function} callback callback function
     * @returns 
     */
    on(type, callback){
        if(typeof callback !== "function") return;
        if(type === "posChange"){
            this.callEvent.posChange.push(callback);
        } else if(type === "scaleChange"){
            this.callEvent.scaleChange.push(callback);
        } else if(type === "nameChange"){
            this.callEvent.nameChange.push(callback);
        } else if(type === "visibleChange"){
            this.callEvent.visibleChange.push(callback);
        } else if(type === "toneMappedChange"){
            this.callEvent.toneMappedChange.push(callback);
        } 
    }
    _callCustomEv(type, e){
        if(type === "posChange"){
            for (let i = 0; i < this.callEvent.posChange.length; i++) {
                const ev = this.callEvent.posChange[i];
                if(typeof ev === "function") ev(e);
            }
        } else if(type === "scaleChange"){
            for (let i = 0; i < this.callEvent.scaleChange.length; i++) {
                const ev = this.callEvent.scaleChange[i];
                if(typeof ev === "function") ev(e);
            }
        } else if(type === "nameChange"){
            for (let i = 0; i < this.callEvent.nameChange.length; i++) {
                const ev = this.callEvent.nameChange[i];
                if(typeof ev === "function") ev(e);
            }
        } else if(type === "visibleChange"){
            for (let i = 0; i < this.callEvent.visibleChange.length; i++) {
                const ev = this.callEvent.visibleChange[i];
                if(typeof ev === "function") ev(e);
            }
        } else if(type === "toneMappedChange"){
            for (let i = 0; i < this.callEvent.toneMappedChange.length; i++) {
                const ev = this.callEvent.toneMappedChange[i];
                if(typeof ev === "function") ev(e);
            }
        } 
    }
    _addEvent(){
        if(!this.target) return;
        let scope = this;
        function changeValue(e){
            var {target} = e;
            if(target.classList[1] == "morph-input"){
                var {uuid, to} = target.dataset;
                var m = scope.objId[uuid];
                m.morphTargetInfluences[(to*1)] = target.valueAsNumber;
            }
            if (target.classList[0] == "mt-name-edit") {
                let data = target.parentElement.parentElement.dataset;
                let evType = "nameChange";
                scope._callCustomEv(evType, {
                    type: evType,
                    modelName: scope.objId[data.for].name,
                    newValue: target.value,
                    object: scope.objId[data.for],
                    index: data.index
                });
            }
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
                    if(target.classList[1] == "inp-mesh-x"){
                        let evType = mode == "position" ? "posChange" : "scaleChange";
                        scope._callCustomEv(evType, {
                            type: evType,
                            modelName: scope.objId[meshId].name,
                            pos: "x",
                            oldValue: scope.objId[meshId][mode].x,
                            newValue: target.valueAsNumber,
                            object: scope.objId[meshId]
                        });
                        scope.objId[meshId][mode].x = target.valueAsNumber; 
                    }
                    if(target.classList[1] == "inp-mesh-y"){
                        let evType = mode == "position" ? "posChange" : "scaleChange";
                        scope._callCustomEv(evType, {
                            type: evType,
                            modelName: scope.objId[meshId].name,
                            pos: "y",
                            oldValue: scope.objId[meshId][mode].y,
                            newValue: target.valueAsNumber,
                            object: scope.objId[meshId]
                        });
                        scope.objId[meshId][mode].y = target.valueAsNumber; 
                    }
                    if(target.classList[1] == "inp-mesh-z"){
                        let evType = mode == "position" ? "posChange" : "scaleChange";
                        scope._callCustomEv(evType, {
                            type: evType,
                            modelName: scope.objId[meshId].name,
                            pos: "z",
                            oldValue: scope.objId[meshId][mode].z,
                            newValue: target.valueAsNumber,
                            object: scope.objId[meshId]
                        });
                        scope.objId[meshId][mode].z = target.valueAsNumber; 
                    }
                }
            }
        }

        this.target.addEventListener("change", changeValue);
        this.target.addEventListener("click", (e) => {
            scope.clickEnent = e;
            var {target} = e;
            if(target.classList[1] == "morph-input"){
                var {uuid, to} = target.dataset;
                var m = scope.objId[uuid];
                m.morphTargetInfluences[(to*1)] = target.valueAsNumber;
            }
            if(target.id == "no-scroll-"){
                let el = scope.target.querySelector(".mesh-option");
                if(target.checked){
                    if(el.classList.value.indexOf("-no-scroll-") == -1){
                        el.classList.add("-no-scroll-");
                    }
                } else{
                    if(el.classList.value.indexOf("-no-scroll-") !== -1){
                        el.classList.remove("-no-scroll-");
                    }
                }
            }
            if (target.className == "mesh-item") {
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
                            let evType = "visibleChange";
                            this._callCustomEv(evType, {
                                type: evType,
                                modelName: e.name,
                                newValue: !tg,
                                object: e,
                                index: index
                            });
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
                            let evType = "toneMappedChange";
                            this._callCustomEv(evType, {
                                type: evType,
                                modelName: e.name,
                                newValue: !tg,
                                object: e,
                                index: index
                            });
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

var loader;
/**
 * 
 * @param {Blob} zip Blob file
 * @param {Boolean} url Is auto create object url
 * @returns {Array} name, file, url
 */

function readZip(zip, url) {
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

class RecordVideo{
    /**
     * 
     * @param {HTMLCanvasElement} canvas canvas
     * @param {HTMLAudioElement} audio audio
     * @param {String} type type video: video/mp4 | video/webm;codecs=daala | video/webm;codecs=h264 | video/webm;codecs=vp8 | video/webm
     * @param {Number} fps fps video 
     * @returns 
     */
    constructor(canvas, audio, type = "video/webm;codecs=h264", fps = 20){
        if (!canvas) return;
        this.canvas = canvas;
        this.audio = audio;
        this.fps = fps;
        this.recording = false;
        this.record = [];
        this.time = 0;
        this.totalTime = 0;
        this.videoBit = 8000000;
        this.setType(type);
    }
    start(){
        if(this.recording) return;
        this.stream = this.canvas.captureStream(this.fps);
        if(this.audio.src){
            this.audioStream = this.audio.captureStream();
            let streams = new MediaStream([this.audioStream.getAudioTracks()[0], this.stream.getVideoTracks()[0]]);
            this.recorder = new MediaRecorder(streams, {
                mimeType: this.type,
                audioBitsPerSecond : 128000,
                videoBitsPerSecond: this.videoBit,
            });
        } else{
            this.recorder = new MediaRecorder(this.stream, {
                mimeType: this.type,
                videoBitsPerSecond: this.videoBit,
            });
        }
        
          //bruh
        let that = this;
        this.recorder.ondataavailable = (e) => {
            if(e.data.size) {
                that.record.push(e.data);
                if(that.callback){
                    that.callback(e.data);
                }
            };
        }
        this.recorder.start();
        this.interval = setInterval(() => {
            that.time++;
            if(that.updateRuning) that.updateRuning();
        }, 1000);
        this.recording = true;
    }
    stop(){
        if(!this.recording) return;
        this.recorder.stop();
        this.totalTime = this.time;
        clearInterval(this.interval);
        this.time = 0;
        this.recording = false;
        var vid = this.stream.getVideoTracks();
        var aud = this.stream.getAudioTracks();
        if(vid[0]){
            this.stream.removeTrack(vid[0]);
        }
        if(aud[0]){
            this.stream.removeTrack(aud[0]);
        }
    }
    onStop(callback){
        if(typeof callback == "function") this.callback = callback;
    }
    onRunning(callback){
        if(typeof callback == "function") this.updateRuning = callback;

    }
    /**
     * 
     * @param {Number} fps 
     * @returns {RecordVideo}
     */
    setFps(fps){
        if(!fps) return this;
        this.fps = fps;
        return this;
    }
    /**
     * 
     * @param {Number} bit videoBitsPerSecond: 2000000+
     * @returns {RecordVideo}
     */
    setVideoBit(bit){
        if(!bit) return this;
        this.videoBit = bit;
        return this;
    }
    /**
     * 
     * @param {String} type 
     * @returns {RecordVideo}
     */
    setType(type){
        if(type){
            let sup = MediaRecorder.isTypeSupported(type);
            if(sup){
                this.type = type;
                return this;
            }
        }
        console.warn(`"${type}" not support`);
        let types = [
            "video/mp4",
            "video/webm;codecs=daala",
            "video/webm;codecs=h264",
            "video/webm;codecs=vp8",
            "video/webm",
        ];
        for (let i = 0; i < types.length; i++) {
            const e = types[i];
            let sup = MediaRecorder.isTypeSupported(e);
            if(sup){
                this.type = e;
                console.warn(`| Swich to ${e}`);
                return this;
            }
        }
    }
}

class AudioCtx{
    /**
     * Note: From another pj then just use something
     * @param {HTMLVideoElement | HTMLAudioElement | String | undefined} audio video/audio tag or video/audio selector
     * @param {HTMLCanvasElement | String | undefined} canvas canvas to render or selector canvas
     * @param {Object} option 
     * @returns 
     */
    constructor(audio, canvas, option = {}){
        let au ,cv;
        if(typeof audio === "string"){
            au = document.querySelector(audio);
        } else if(typeof audio === "object"){
            au = audio;
        } else{ au = new Audio() }
        if(typeof canvas === "string"){
            cv = document.querySelector(canvas);
        } else if(typeof canvas === "object"){
            cv = canvas;
        }
        if(!au) return;
        this.audio = au;
        this.audio.loop = true;
        this.canvas = cv;
        this.option = option;
        this.limit = {
            start: 0,
            end: 1,
            run: false
        }
        this.eq = {};
        this.eq.DEFAULT = {
            highShelf: {value: 4500, gain: 50},
            lowShelf: {value: 200, gain: 50},
            highPass: {value: 1150, Q: 0.7},
            lowPass: {value: 880, Q: 1},
        }
        this._runtime = performance.now();
        this._runfps = 0;
        this.delay = 0;
        this.callAnimation = [];
        this.fpsPerSec = 0;
        this.fps = 0;
        this.time = 0;
        this.runId = 0;
        this.run = true;
        // setup
        this.audioContext = new AudioContext();

        if(this.canvas){
            this.ctx = this.canvas.getContext("2d");
            this.width = this.canvas.width;
            this.height = this.canvas.height;
        }
        
        this.analyser = this.audioContext.createAnalyser();
        this.track = this.audioContext.createMediaElementSource(this.audio);

        this.eq.highShelf = this.audioContext.createBiquadFilter();
        this.eq.highShelf = this.audioContext.createBiquadFilter();
        this.eq.lowShelf = this.audioContext.createBiquadFilter();
        this.eq.highPass = this.audioContext.createBiquadFilter();
        this.eq.lowPass = this.audioContext.createBiquadFilter();
        this.eq.booster = this.audioContext.createGain();
        this.eq.stereoNode = new StereoPannerNode(this.audioContext, { pan: 0 });
        this.eq.highShelf.type = "highshelf";
        this.eq.lowShelf.type = "lowshelf";
        this.eq.highPass.type = "highpass";
        this.eq.lowPass.type = "lowpass";
        this.setDefaultEqualizer();
        // highSh > lowSh > highP > lowP > boost > stereo
        this.track.connect(this.eq.highShelf).connect(this.eq.lowShelf).connect(this.eq.highPass).connect(this.eq.lowPass).connect(this.eq.booster).connect(this.eq.stereoNode).connect(this.analyser);
        this.analyser.connect(this.audioContext.destination); //output audio
        this.analyser.smoothingTimeConstant = 0.7;
        this._importOption();
        this.dataArray = new Uint8Array(this.bufferLength);
        var scope = this;
        scope.update_size();
        window.addEventListener("resize", ()=>{
            if(scope.option.autoResize === true){
                scope.update_size();
                setTimeout(() => {
                    scope.update_size();
                }, 700);
            }
        });
        setTimeout(() => {
            scope.update_size();
        }, 300);
        window.addEventListener("blur", () => {
            if(!this.pauseOnOutWindow) return;
            this.audio.pause();
        });
        window.addEventListener("focus", () => {
            if(!this.pauseOnOutWindow) return;
            this.audio.play();
        });
    }
    _importOption(){
        this.analyser.fftSize = this.option.fftSize ? this.option.fftSize : 256;
        this.bufferLength = this.option.bufferLength ? this.option.bufferLength : 200;
        this.barWidth = this.option.barWidth ? this.option.barWidth : 1;
        this.container = this.option.container ? this.option.container : window;
        this.bar = this.option.bar ? this.option.bar : 1;
        this.downBar = this.option.downBar ? this.option.downBar : 0;
        this.speed = this.option.speed ? this.option.speed : true;
    }
    setUrl(url, autoPlay = false){
        if(autoPlay){this.audio.autoplay = true}
        this.audio.src = url;
        return this;
    }
    setCurrentTime(time = 0){
        this.audio.currentTime = time;
        return this;
    }
    setLimit(start, end){
        this.limit.start = start ? start : 0;
        this.limit.end = end ? end : this.audio.duration;
        this.limit.run = true;
        return this;
    }
    upLimit(num = 0){
        if((this.limit.end + num) <= this.audio.duration){
            this.limit.start += num;
            this.limit.end += num;
        }
    }
    setOption(option = {}){
        this.analyser.fftSize = option.fftSize ? option.fftSize : 256;
        this.analyser.smoothingTimeConstant = option.smoothingTimeConstant ? option.smoothingTimeConstant : 0.6;
        this.pauseOnOutWindow = pauseOnOutWindow ? pauseOnOutWindow : false;
        return this;
    }
    play(time){
        var t = time ? time : this.audio.currentTime;
        if(this.limit.run && time){
            t = this.limit.start + time;
        }
        this.audio.currentTime = t;
        if(this.audio.paused) this.audio.play();
    }
    pause(time){
        var t = time ? time : this.audio.currentTime;
        this.audio.currentTime = t;
        if(!this.audio.paused) this.audio.pause();
    }
    update_size(){
        if(!this.canvas) return;
        let w = this.option.container ? this.option.container : window;
        let x = w.self ? w.innerWidth : w.offsetWidth;
        let y = w.self ? w.innerHeight : w.offsetHeight;
        this.canvas.width = x;
        this.canvas.height = y;
        this.width = x;
        this.height = y;
        this.barWidth = (this.width / this.bufferLength) * 2.4
    }
    setDefaultEqualizer(single){
        let setup = this.eq.DEFAULT;
        if(single){
            if(this.eq[single]){
                this.eq[single].frequency.value = setup[single].value;
                if(single === "highPass" || single === "lowPass"){
                    this.eq[single].Q.value = setup[single].Q;
                } else{
                    this.eq[single].gain.value = setup[single].gain;
                }
                return;
            }
        }
        this.eq.highShelf.frequency.value = setup.highShelf.value;
        this.eq.lowShelf.frequency.value = setup.lowShelf.value;
        this.eq.highPass.frequency.value = setup.highPass.value;
        this.eq.lowPass.frequency.value = setup.lowPass.value;

        this.eq.highShelf.gain.value = setup.highShelf.gain;
        this.eq.lowShelf.gain.value = setup.lowShelf.gain;
        this.eq.highPass.Q.value = setup.highPass.Q;
        this.eq.lowPass.Q.value = setup.lowPass.Q;

    }
    _getValueAnalyser(scope){
        scope.analyser.getByteFrequencyData(scope.dataArray);
    }
    getWaveAudio(uint8Array){
        if(uint8Array){
            this.analyser.getByteFrequencyData(uint8Array);
        }
    }
    getAverrange(){
        this.dataArray = new Uint8Array(this.analyser.fftSize);
        this.analyser.getByteFrequencyData(this.dataArray);
        var v = this.dataArray.reduce((x, y) => x + y, 0) / this.dataArray.length;
        return v;
    }
    compare(value, option = {}){
        if(value >= (option.base - option.range) && value <= (option.base + option.range)){
            return true;
        }
        return false;
    }
    syncCheck(time, range = 2){
        if(!time) return;
        var cr = this.audio.currentTime;
        var dr = this.audio.duration;
        if ((cr - this.limit.start) > (time + range) || (cr - this.limit.start) < (time - range)){
            let newTime = this.limit.start + time;
            if(newTime > dr){
                let next = newTime - dr;
                this.audio.currentTime = this.limit.start + next;
                return;
            }
            this.audio.currentTime = newTime;
        }
    }
    update(delta = 1){
        this.time += delta;
        if(this.limit.run && this.limit.end <= this.audio.duration){
            if(this.audio.currentTime < this.limit.start){
                this.audio.currentTime = this.limit.start;
            }
            if(this.audio.currentTime > this.limit.end){
                this.audio.currentTime = this.limit.start;
            }
        }
    }
    drawFunction(scope) {
        var x = 0;
        scope.ctx.clearRect(0, 0, scope.width, scope.height);
        for (var i = 0; i < scope.bufferLength - 30; i++) {
            var barHeight = scope.dataArray[i];
            if(barHeight > scope.option.downBar){
                barHeight -= scope.option.downBar;
            }
            if (barHeight < 1) {
                barHeight = 8;
            }

            var r = barHeight + (25 * (i / scope.bufferLength));
            var g = 140 * (i / scope.bufferLength);
            var b = 255;
            if (barHeight > (247 - scope.option.downBar)) {
                scope.ctx.fillStyle = 'rgba(254,0,67,1)';
                scope.ctx.fillRect(x, scope.height - (barHeight * scope.bar), scope.barWidth, (barHeight * scope.bar));
            } else {
                scope.ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + 0.6 + ')';
                scope.ctx.fillRect(x, scope.height - (barHeight * scope.bar), scope.barWidth, (barHeight * scope.bar));
            }
            scope.ctx.shadowBlur = (barHeight / 5);
            scope.ctx.shadowColor = 'rgb(' + r + ',' + g + ',' + b + ')';
            x += scope.barWidth + 2;
        }
    }
    start() {
        if(this.running === true) return;
        const scope = this;
        var now;
        callFunction();
        function callFunction(){
            scope._runfps++;
            now = Date.now();
            let per = performance.now();
            scope.fps = (1000 / (per - scope._runtime)).toFixed(0)*1;
            scope._runtime = per;
            
            scope.running = true;
            scope._getValueAnalyser(scope);
            if(scope.run === true && scope.canvas) scope.drawFunction(scope);
            for (let i = 0; i < scope.callAnimation.length; i++) {
                const e = scope.callAnimation[i];
                if(typeof e.callback === "function"){
                    e.callback.call(e.id);
                }
            }
            scope.delay = Date.now() - now;
            if(scope.speed == true){
                scope.runId = requestAnimationFrame(callFunction);
            } else if(scope.speed >= 10){
                scope.runId = setTimeout(() => {
                    callFunction();
                }, scope.speed);
            } else{
                scope.runId = requestAnimationFrame(callFunction);
            }
        }
        scope.secIntervel = setInterval(() => {
            scope.fpsPerSec = scope._runfps;
            scope._runfps = 0;
            this.time++;
        }, 999);
    }
    stop(){
        if(this.running === false) return;
        try {
            clearInterval(this.secIntervel);
            clearTimeout(this.runId); this.running = false;
            cancelAnimationFrame(this.runId); this.running = false;
        } catch (e) { }
        this.fps = 0;
        this.fpsPerSec = 0;
    }
    addCall(callback){
        if(typeof callback === "function"){
            let id = Math.random() * 999999999 | 0;
            this.callAnimation.push({callback: callback, id: id});
            return id;
        }
    }
    removeCall(id){
        for (let i = 0; i < this.callAnimation.length; i++) {
            const e = this.callAnimation[i];
            if(typeof id === "number"){
                if(id === e.id){
                    this.callAnimation.splice(i, 1);
                    break;
                }
            } else if(typeof id === "function"){
                if(id == e.callback){
                    this.callAnimation.splice(i, 1);
                    break;
                }
            } else{
                break;
            }
        }
    }
}
