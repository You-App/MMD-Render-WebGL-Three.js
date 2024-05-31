var models = [
    // 0
    {
        name: "Furina P",
        pathName: "Genshin",
        src: "/src/mmd/model/gi/furina/1.pmx",
        color: 0xdddddd,
        toneMappingExposure: 0.5,
        extension: [
            "/src/mmd/model/gi/furina/3.pmx", "/src/mmd/model/gi/furina/4.pmx",
            "/src/mmd/model/gi/furina/5.pmx", "/src/mmd/model/gi/furina/6.pmx",
            "/src/mmd/model/gi/furina/7.pmx", "/src/mmd/model/gi/furina/8.pmx",
            "/src/mmd/model/gi/furina/9.pmx", "/src/mmd/model/gi/furina/10.pmx",
            "/src/mmd/model/gi/furina/11.pmx", "/src/mmd/model/gi/furina/12.pmx",
            "/src/mmd/model/gi/furina/13.pmx",
        ]
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
        src: "/src/mmd/wavefile/p1/2.vmd"
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
        src: "/src/mmd/cam/drama.vmd"
    },
];
var _bg = [
    {
        name: "[N]夜月蓝·H2CU式stage13",
        isPmx: true,
        src: ["/src/mmd/bg/2/1.pmx"]
    },
    {
        name: "[N]虫无阶梯·H2CU式stage10-1",
        isPmx: true,
        src: ["/src/mmd/bg/3/1.pmx"]
    },
    {
        name: "わた雲の空",
        isPmx: true,
        src: ["/src/mmd/bg/12/1.pmx"],
    },
];

export {models, vmd, camera, _bg}