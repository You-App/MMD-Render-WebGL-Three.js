// file url
var models = [
    // 0
    {
        name: "Furina P",
        pathName: "Genshin",
        src: "/lib/mmd/model/furina/1.pmx",
        color: 0xdddddd,
        toneMappingExposure: 0.55,
        extension: [
            "/lib/mmd/model/furina/3.pmx", "/lib/mmd/model/furina/4.pmx",
            "/lib/mmd/model/furina/5.pmx", "/lib/mmd/model/furina/6.pmx",
            "/lib/mmd/model/furina/7.pmx", "/lib/mmd/model/furina/8.pmx",
            "/lib/mmd/model/furina/9.pmx", "/lib/mmd/model/furina/10.pmx",
            "/lib/mmd/model/furina/11.pmx", "/lib/mmd/model/furina/12.pmx",
            "/lib/mmd/model/furina/13.pmx",
        ]
    },
    {
        name: "Furina O",
        pathName: "Genshin",
        src: "/lib/mmd/model/furina/2.pmx",
        color: 0xdddddd,
        toneMappingExposure: 0.55,
        extension: []
    },
    {
        name: "Hutao",
        pathName: "Genshin",
        src: "/lib/mmd/model/hutao/1.pmx",
        color: 0xdddddd,
        toneMappingExposure: 0.55,
        extension: []
    },
];

var vmd = [
    // 0
    {
        name: "default",
        src: "models/mmd/vmds/wavefile_v2.vmd"
    },
    // 1
    {
        name: "おねがいダーリン",
        src: "/lib/mmd/vmd/neko.vmd"
    },
];

var camera = [
    // 0
    {
        name: "Default",
        src: "models/mmd/vmds/wavefile_camera.vmd"
    },
    // 1
    {
        name: "Drama",
        src: "/lib/mmd/camera/neko.vmd"
    },
];
var _bg = [
    {
        name: "[N]夜月蓝·H2CU式stage13",
        isPmx: true,
        src: ["/lib/mmd/map/1.pmx"]
    },
    {
        name: "わた雲の空",
        isPmx: true,
        src: ["/lib/mmd/map/1.pmx"],
    },
];

export {models, vmd, camera, _bg}