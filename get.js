import * as s1 from './js/file.js';
import {FileLoader} from 'three';

// golal

window._start_time_ = Date.now();
window.file = s1;
window.ThreeLoader = FileLoader;
var js = document.createElement("script");
js.src = "js/work.js";
document.body.appendChild(js);