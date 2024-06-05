// file url
// maybe it can write as json...
var models = [
    {
        name: "Furina P",
        pathName: "Genshin",
        src: "../lib/mmd/models/furina/1.pmx",
        color: 0xdddddd,
        toneMappingExposure: 0.55,
        extension: [
            "../lib/mmd/models/furina/3.pmx", "../lib/mmd/models/furina/4.pmx",
            "../lib/mmd/models/furina/5.pmx", "../lib/mmd/models/furina/6.pmx",
            "../lib/mmd/models/furina/7.pmx", "../lib/mmd/models/furina/8.pmx",
            "../lib/mmd/models/furina/9.pmx", "../lib/mmd/models/furina/10.pmx",
            "../lib/mmd/models/furina/11.pmx", "../lib/mmd/models/furina/12.pmx",
            "../lib/mmd/models/furina/13.pmx",
        ]
    },
    {
        name: "Furina O",
        pathName: "Genshin",
        src: "../lib/mmd/models/furina/2.pmx",
        color: 0xdddddd,
        toneMappingExposure: 0.55,
        extension: []
    },
    {
        name: "Hutao",
        pathName: "Genshin",
        src: "../lib/mmd/models/hutao/1.pmx",
        color: 0xdddddd,
        toneMappingExposure: 0.55,
        extension: []
    },
    {
        name: "Chiori",
        pathName: "Genshin",
        src: "../lib/mmd/models/chiori/chiori.pmx",
        color: 0xdddddd,
        toneMappingExposure: 0.55,
        extension: []
    },
];

var vmd = [
    {
        name: "default",
        src: "../lib/mmd/vmd/1/wavefile_v2.vmd"
    },
    {
        name: "ねこみみ。。。",
        src: "../lib/mmd/vmd/2/neko.vmd"
    },
    {
        name: "Toothless dance",
        src: "../lib/mmd/vmd/3/tld.vmd"
    },
];

var camera = [
    {
        name: "Default",
        src: "../lib/mmd/camera/1/wavefile_camera.vmd"
    },
    {
        name: "ねこみみ。。。",
        src: "../lib/mmd/camera/2/neko.vmd"
    },
];
var _bg = [
    {
        name: "夜月蓝·H2CU式stage13",
        isPmx: true,
        src: ["../lib/mmd/map/1/1.pmx"]
    },
    {
        name: "わた雲の空",
        isPmx: true,
        src: ["../lib/mmd/map/2/1.pmx"],
    },
];

export {models, vmd, camera, _bg}
