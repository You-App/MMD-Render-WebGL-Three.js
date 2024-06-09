import * as s1 from './js/file.js';
import {FileLoader} from 'three';

// golal from module

window._start_time_ = Date.now();
window.file = s1;
window.ThreeLoader = FileLoader;
// after gobal, start main script
var js = document.createElement("script");
js.src = "js/work.js";
document.body.appendChild(js);
