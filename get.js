import * as s1 from './file.js';
import {FileLoader} from 'three';

// golal
window.file = s1;
window.ThreeLoader = FileLoader;
var js = document.createElement("script");
js.src = "work.js";
document.body.appendChild(js);