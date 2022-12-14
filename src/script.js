import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import gsap from 'gsap';
import * as dat from 'dat.gui'
import {database ,ref,onValue,set} from './SideScripts/FirebaseSetup.js'
import { update } from 'firebase/database';
// import sky
import { Sky } from 'three/examples/jsm/objects/Sky.js'

const RoomID="1"
const selfid='p4'


/**
 * Base
 */

 const gui = new dat.GUI({
    // closed: true,
})

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

//Sizes

 const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
})

/**
 * Camera
 */

// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 10000)
camera.position.y = 5
camera.position.z = 5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true;
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//Loading
const textureLoader = new THREE.TextureLoader()
const fbxLoader = new FBXLoader()
const fontLoader=new THREE.FontLoader()

// Sky
let sky,sun

function initSky() {

    // Add Sky
    sky = new Sky();
    sky.scale.setScalar( 450000 );
    scene.add( sky );

    sun = new THREE.Vector3();

    /// GUI

    const effectController = {
        turbidity: 6.5,
        rayleigh: 3,
        mieCoefficient: 0.005,
        mieDirectionalG: 0.7,
        elevation: 1.3,
        azimuth: 180,
        exposure: renderer.toneMappingExposure
    };

    function guiChanged() {

        const uniforms = sky.material.uniforms;
        uniforms[ 'turbidity' ].value = effectController.turbidity;
        uniforms[ 'rayleigh' ].value = effectController.rayleigh;
        uniforms[ 'mieCoefficient' ].value = effectController.mieCoefficient;
        uniforms[ 'mieDirectionalG' ].value = effectController.mieDirectionalG;

        const phi = THREE.MathUtils.degToRad( 90 - effectController.elevation );
        const theta = THREE.MathUtils.degToRad( effectController.azimuth );

        sun.setFromSphericalCoords( 1, phi, theta );

        uniforms[ 'sunPosition' ].value.copy( sun );

        renderer.toneMappingExposure = effectController.exposure;
        renderer.render( scene, camera );

    }

    const guiSky = gui.addFolder( 'Sky' );

    guiSky.add( effectController, 'turbidity', 0.0, 20.0, 0.1 ).onChange( guiChanged );
    guiSky.add( effectController, 'rayleigh', 0.0, 4, 0.001 ).onChange( guiChanged );
    guiSky.add( effectController, 'mieCoefficient', 0.0, 0.1, 0.001 ).onChange( guiChanged );
    guiSky.add( effectController, 'mieDirectionalG', 0.0, 1, 0.001 ).onChange( guiChanged );
    guiSky.add( effectController, 'elevation', 0, 90, 0.1 ).onChange( guiChanged );
    guiSky.add( effectController, 'azimuth', - 180, 180, 0.1 ).onChange( guiChanged );
    guiSky.add( effectController, 'exposure', 0, 1, 0.0001 ).onChange( guiChanged );

    guiChanged();

}






initSky()














const GroundTextureBaseColor = textureLoader.load(
    "./textures/Terracotta_Tiles/Substance_Graph_basecolor.jpg"
  );
  
  const GroundTextureNormal = textureLoader.load(
    "./textures/Terracotta_Tiles/Substance_Graph_normal.jpg"
  );
  
  const GroundTextureHeight = textureLoader.load(
    "./textures/Terracotta_Tiles/Substance_Graph_height.png"
  );
  
  const GroundTextureRoughness = textureLoader.load(
    "./textures/Terracotta_Tiles/Substance_Graph_roughness.jpg"
  );
  

const repval=200

  GroundTextureBaseColor.repeat.set(repval, repval);
  GroundTextureBaseColor.wrapS = THREE.RepeatWrapping;
  GroundTextureBaseColor.wrapT = THREE.RepeatWrapping;
  
  GroundTextureNormal.repeat.set(repval, repval);
  GroundTextureNormal.wrapS = THREE.RepeatWrapping;
  GroundTextureNormal.wrapT = THREE.RepeatWrapping;
  
  GroundTextureRoughness.repeat.set(repval, repval);
  GroundTextureRoughness.wrapS = THREE.RepeatWrapping;
  GroundTextureRoughness.wrapT = THREE.RepeatWrapping;
  



// Text
// Group
const MetaKartText=new THREE.Group()
MetaKartText.position.set(12,7,-25.5)
MetaKartText.rotation.set(0,-1.6,0)
MetaKartText.scale.set(4,4,4)
scene.add(MetaKartText)
fontLoader.load(
    "./fonts/helvetiker_regular.typeface.json",
    function (response) {
      const textGeo = new THREE.TextGeometry("Metakart", {
        font: response,
        size: 0.6,
        height: 0.1,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.05,
        bevelSize: 0.01,
        bevelSegments: 5,
      });
      textGeo.computeBoundingBox();
      textGeo.computeVertexNormals();
      const centerOffset =-0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
      const textMaterial = new THREE.MeshNormalMaterial();
      const textMesh = new THREE.Mesh(textGeo, textMaterial);
      textMesh.position.x = centerOffset;
      MetaKartText.add(textMesh);
    }
  );

//   Gui
const MetaKartHelper={
    scale:1,
}
const MetaKartGUI=gui.addFolder('MetaKart Text')
MetaKartGUI.add(MetaKartText.position,'x',-100,100,0.1)
MetaKartGUI.add(MetaKartText.position,'y',-100,100,0.1)
MetaKartGUI.add(MetaKartText.position,'z',-100,100,0.1)
MetaKartGUI.add(MetaKartText.rotation,'x',-Math.PI,Math.PI,0.1)
MetaKartGUI.add(MetaKartText.rotation,'y',-Math.PI,Math.PI,0.1)
MetaKartGUI.add(MetaKartText.rotation,'z',-Math.PI,Math.PI,0.1)
MetaKartGUI.add(MetaKartHelper,'scale',0.1,10,0.1).onChange(()=>{
    MetaKartText.scale.set(MetaKartHelper.scale,MetaKartHelper.scale,MetaKartHelper.scale)
})







//Theater Space
const theater=new THREE.Group()
scene.add(theater)
theater.position.set(100,0,-15)
theater.scale.set(0.3,0.3,0.3)
const theaterGUI={
    scale:1,
}

// fbxLoader.load('./models/Cinema/Theater.fbx',(object)=>{
//     object.scale.set(0.0049,0.005,0.00485)
//     theater.add(object)
// })

fbxLoader.load('./City/combinedx.fbx',(object)=>{
    object.scale.set(0.005,0.005,0.005)
    // Material double sided and cast shadows
    object.traverse(function(child) {
        if (child.isMesh) {
            // child.castShadow = true;
            child.receiveShadow = true;
            // child.material.side = THREE.DoubleSide;
        }
    });
    theater.add(object)
})





const TheterGUIFolder=gui.addFolder('Theater')
TheterGUIFolder.add(theaterGUI,'scale',0,1).onChange(()=>{
    theater.scale.set(theaterGUI.scale,theaterGUI.scale,theaterGUI.scale)
})
TheterGUIFolder.add(theater.position,'x',-3000,3000,0.001)
TheterGUIFolder.add(theater.position,'y',-3000,3000,0.001)
TheterGUIFolder.add(theater.position,'z',-3000,3000,0.001)
TheterGUIFolder.add(theater.rotation,'x',-Math.PI,Math.PI,0.001)
TheterGUIFolder.add(theater.rotation,'y',-Math.PI,Math.PI,0.001)
TheterGUIFolder.add(theater.rotation,'z',-Math.PI,Math.PI,0.001)

//Testing Space


// Hoodie

const hoodie=new THREE.Group()
hoodie.position.set(-4.28,1.1,-12.3)
hoodie.scale.set(0.017,0.017,0.017)
hoodie.rotation.set(0,Math.PI,0)
scene.add(hoodie)
fbxLoader.load('./Items/Hoodie.fbx',(object)=>{
    hoodie.add(object)
})

const hoodieGUIHelper={
    scale:1,
}
const hoodieGUI=gui.addFolder('Hoodie')
hoodieGUI.add(hoodie.position,'x',-300,300,0.001)
hoodieGUI.add(hoodie.position,'y',-300,300,0.001)
hoodieGUI.add(hoodie.position,'z',-300,300,0.001)
hoodieGUI.add(hoodie.rotation,'x',-Math.PI,Math.PI,0.001)
hoodieGUI.add(hoodie.rotation,'y',-Math.PI,Math.PI,0.001)
hoodieGUI.add(hoodie.rotation,'z',-Math.PI,Math.PI,0.001)
hoodieGUI.add(hoodieGUIHelper,'scale',0.0001,0.5,0.001).onChange(()=>{
    hoodie.scale.set(hoodieGUIHelper.scale,hoodieGUIHelper.scale,hoodieGUIHelper.scale)
})



const Laptop=new THREE.Group()
Laptop.position.set(-6.5,1.21,-43.2)
Laptop.scale.set(0.11,0.11,0.11)
scene.add(Laptop)
fbxLoader.load('./Items/Laptop.fbx',(object)=>{
    Laptop.add(object)
})

const laptopGUIHelper={
    scale:1,
    isSpinning:false,
    startSpinning:()=>{
        if(laptopGUIHelper.isSpinning!=true){
            laptopGUIHelper.isSpinning=true
            gsap.to(Laptop.position,{
                duration:1,
                y:1.4,
                z:-43,
                ease:'linear',
                onComplete:()=>{
                    gsap.to(Laptop.rotation,{
                        duration:5,
                        y:Math.PI*2,
                        repeat:2,
                        ease:'linear',
                        onComplete:()=>{
                            gsap.to(Laptop.position,{
                                duration:1,
                                y:1.21,
                                z:-43.2,
                                ease:'linear',
                                onComplete:()=>{
                                    laptopGUIHelper.isSpinning=false
                                }
                            })
                        }
                    })
                }
            })
    }
    },

}

const laptopGUI=gui.addFolder('Laptop')
laptopGUI.add(Laptop.position,'x',-300,300,0.001)
laptopGUI.add(Laptop.position,'y',-300,300,0.001)
laptopGUI.add(Laptop.position,'z',-300,300,0.001)
laptopGUI.add(Laptop.rotation,'x',-Math.PI,Math.PI,0.001)
laptopGUI.add(Laptop.rotation,'y',-Math.PI,Math.PI,0.001)
laptopGUI.add(Laptop.rotation,'z',-Math.PI,Math.PI,0.001)
laptopGUI.add(laptopGUIHelper,'scale',0.0001,100,0.001).onChange(()=>{
    Laptop.scale.set(laptopGUIHelper.scale,laptopGUIHelper.scale,laptopGUIHelper.scale)
})
laptopGUI.add(laptopGUIHelper,'startSpinning')
































//Screen
const screenElement=document.getElementById('MainScreen')
// screenElement.src="https://download.blender.org/peach/trailer/trailer_400p.ogg"
// screenElement.src="./Video/MainVideo.mp4"
// screenElement.src="https://patient-grass-d785dadaad.cijil73139.workers.dev/opyWlBwLolwSTgh9SUhJa72uL8aNLkBkrH4euWVy/gd8.botworker.xyz/Iron.Man.2.2010.720p.Hindi.English.MoviesFlixPro.in.mkv"
const screenGeometry = new THREE.PlaneBufferGeometry(16, 9)
const screenMaterial = new THREE.MeshBasicMaterial({
    map: new THREE.VideoTexture(screenElement),
    side : THREE.DoubleSide,
})
const screenMesh = new THREE.Mesh(screenGeometry, screenMaterial)
screenMesh.position.set(13.8, 7.5, -14)
screenMesh.rotation.set(Math.PI, -Math.PI/2, Math.PI)
screenMesh.scale.set(0.4,0.4,0.4)
scene.add(screenMesh)

const screenGuiHelper={
    scale:1,
}
const screenGUI=gui.addFolder('Screen')
screenGUI.add(screenMesh.position,'x',-100,100,0.001)
screenGUI.add(screenMesh.position,'y',-100,100,0.001)
screenGUI.add(screenMesh.position,'z',-100,100,0.001)
screenGUI.add(screenMesh.rotation,'x',-Math.PI,Math.PI,0.001)
screenGUI.add(screenMesh.rotation,'y',-Math.PI,Math.PI,0.001)
screenGUI.add(screenMesh.rotation,'z',-Math.PI,Math.PI,0.001)
screenGUI.add(screenGuiHelper,'scale',0.1,10,0.001).onChange(()=>{
    screenMesh.scale.set(screenGuiHelper.scale,screenGuiHelper.scale,screenGuiHelper.scale)
})





//Screen
const MainScreenTitle=document.getElementById('MainScreenTitle')
const MainScreenSeekBar=document.getElementById('MainScreenSeekBar')
const MainScreenPlayPause=document.getElementById('MainScreenPlayPause')
const MainScreenUpdateEveryone=document.getElementById('MainScreenUpdateEveryone')
MainScreenSeekBar.min=0
MainScreenSeekBar.step=0.01

screenElement.addEventListener('timeupdate',()=>{
    MainScreenSeekBar.value=screenElement.currentTime
})

MainScreenSeekBar.addEventListener('change',(event)=>{
    set(ref(database,"Rooms/"+RoomID+"/"+"VideoPlayer/currentTime"),event.target.value)
})

MainScreenPlayPause.addEventListener('click',()=>{
    onValue(ref(database,"Rooms/"+RoomID+"/"+"VideoPlayer/isPlaying"),(snapshot)=>{
        if(snapshot.val()){
            if(snapshot.val().value){
                set(ref(database,"Rooms/"+RoomID+"/"+"VideoPlayer/isPlaying/value"),false)
            }
            else{
                set(ref(database,"Rooms/"+RoomID+"/"+"VideoPlayer/isPlaying/value"),true)
            }
        }
    },{
        onlyOnce:true
    })
})



MainScreenUpdateEveryone.addEventListener('click',()=>{
    set(ref(database,"Rooms/"+RoomID+"/"+"VideoPlayer/currentTime"),screenElement.currentTime-0.1)
    set(ref(database,"Rooms/"+RoomID+"/"+"VideoPlayer/duration"),screenElement.duration)
    MainScreenSeekBar.max=screenElement.duration

})





onValue(ref(database,"Rooms/"+RoomID+"/"+'VideoPlayer/'),(snapshot)=>{
    if(snapshot.val()){
        MainScreenTitle.innerHTML=snapshot.val().title
        if(snapshot.val().isPlaying.value){
            screenElement.play()
        }
        else{
            screenElement.pause()
        }
        screenElement.src=snapshot.val().src
        setTimeout(()=>{
            if(!isNaN(screenElement.duration)){
                set(ref(database,"Rooms/"+RoomID+"/"+"VideoPlayer/duration"),screenElement.duration)
                MainScreenSeekBar.max=screenElement.duration
                screenElement.currentTime=snapshot.val().currentTime
                MainScreenSeekBar.value=screenElement.currentTime
            }
        },2000)
    }
},{
    onlyOnce:true
})


onValue(ref(database,"Rooms/"+RoomID+"/"+'VideoPlayer/title'),(snapshot)=>{
    if(snapshot.val()){
        MainScreenTitle.innerHTML=snapshot.val()
    }
})


onValue(ref(database,"Rooms/"+RoomID+"/"+'VideoPlayer/isPlaying'),(snapshot)=>{
    if(snapshot.val()){
        if(snapshot.val().value){
            screenElement.play()
        }
        else{
            screenElement.pause()
        }
    }
})

onValue(ref(database,"Rooms/"+RoomID+"/"+'VideoPlayer/src'),(snapshot)=>{
    if(snapshot.val()){
        screenElement.src=snapshot.val()
        setTimeout(()=>{
            if(!isNaN(screenElement.duration)){
                set(ref(database,"Rooms/"+RoomID+"/"+"VideoPlayer/duration"),screenElement.duration)
                MainScreenSeekBar.max=screenElement.duration
            }
        },2000)
    }
})

onValue(ref(database,"Rooms/"+RoomID+"/"+'VideoPlayer/currentTime'),(snapshot)=>{
    if(snapshot.val()){
        screenElement.currentTime=snapshot.val()
        MainScreenSeekBar.max=screenElement.duration
    }
})

















/**
 * Object
 */
const FloorGeometry = new THREE.PlaneBufferGeometry(1000, 1000)
const FloorMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    map: GroundTextureBaseColor,
    normalMap: GroundTextureNormal,
    roughnessMap: GroundTextureRoughness,
})
const Floor= new THREE.Mesh(FloorGeometry, FloorMaterial)
Floor.receiveShadow = true
Floor.position.y=-0.1
Floor.rotation.x = -Math.PI / 2
scene.add(Floor)





//Lights
const LightGUI={
    ambientLight:{
        color:0xffffff,
    },
    hemiLight:{
        color:0xffffff,
    },
    directionalLight:{
        color:0xffffff,
    },
    pointLight1:{
        color:0xffffff,
    },
    pointLight2:{
        color:0xffffff,
    },
    pointLight3:{
        color:0xffffff,
    },
    pointLight4:{
        color:0xffffff,
    },
    spotLight1:{
        color:0xffffff,
    },
    spotLight2:{
        color:0xffffff,
    },
    spotLight3:{
        color:0xffffff,
    },
    spotLight4:{
        color:0xffffff,
    },
}

const ambientLight = new THREE.AmbientLight(0xffffff, 0.1)
scene.add(ambientLight)
const ambientLightGUI=gui.addFolder('Ambient Light')
ambientLightGUI.addColor(LightGUI.ambientLight,'color').onChange((val)=>{
    ambientLight.color.set(val)
    }
)
ambientLightGUI.add(ambientLight,'intensity',0,2,0.001)

const hemiLight=new THREE.HemisphereLight(0xffffff,0xffffff,0.1)
scene.add(hemiLight)
const hemiLightGUI=gui.addFolder('Hemi Light')
hemiLightGUI.addColor(LightGUI.hemiLight,'color').onChange((val)=>{
    hemiLight.color.set(val)
    }
)
hemiLightGUI.add(hemiLight,'intensity',0,2,0.001)


const pointLightGUIMain=gui.addFolder('Point Light')

for(let i=1;i<=4;i++){
    const pointLight=new THREE.PointLight(0xffffff,0)
    pointLight.castShadow=true
    scene.add(pointLight)
    const pointLightHelper=new THREE.PointLightHelper(pointLight,1)
    scene.add(pointLightHelper)
    const pointLightGUI=pointLightGUIMain.addFolder('Point Light '+i)
    pointLightGUI.addColor(LightGUI['pointLight'+i],'color').onChange((val)=>{
        pointLight.color.set(val)
        }
    )
    pointLightGUI.add(pointLight,'intensity',0,2,0.001)
    pointLightGUI.add(pointLight,'distance',0,100,0.001)
    pointLightGUI.add(pointLight,'decay',0,2,0.001)
    pointLightGUI.add(pointLight.position,'x',-100,100,0.001)
    pointLightGUI.add(pointLight.position,'y',-100,100,0.001)
    pointLightGUI.add(pointLight.position,'z',-100,100,0.001)
    if(i==1){
        pointLight.position.set(-1.5,4,-13.5)
        pointLight.intensity=0.58
        pointLight.decay=1.4
        pointLight.distance=12.3
    }
    if(i==2){
        pointLight.position.set(-7,3,-13)
        pointLight.intensity=1.56
        pointLight.decay=1
        pointLight.distance=30
    }
    if(i==3){
        pointLight.position.set(-13,4,-42)
        pointLight.intensity=0.36
        pointLight.decay=1
        pointLight.distance=11
    }
    if(i==4){
        pointLight.position.set(-13,4,-42)
        pointLight.intensity=1.3
        pointLight.decay=1
        pointLight.distance=11
    }
}


const spotLightGUIMain=gui.addFolder('SpotLight')
for(let i=1;i<0;i++){
    const spotLight=new THREE.SpotLight(0xffffff,0)
    scene.add(spotLight)
    scene.add(spotLight.target)
    const spotLightHelper=new THREE.SpotLightHelper(spotLight,1)
    scene.add(spotLightHelper)
    const spotLightGUI=spotLightGUIMain.addFolder('SpotLight '+i)
    spotLightGUI.addColor(LightGUI['spotLight'+i],'color').onChange((val)=>{
        spotLight.color.set(val)
        }
    )
    spotLightGUI.add(spotLight,'intensity',0,2,0.001)
    spotLightGUI.add(spotLight,'distance',0,100,0.001)
    spotLightGUI.add(spotLight,'decay',0,2,0.001)
    spotLightGUI.add(spotLight.position,'x',-100,100,0.001)
    spotLightGUI.add(spotLight.position,'y',-100,100,0.001)
    spotLightGUI.add(spotLight.position,'z',-100,100,0.001)
    spotLightGUI.add(spotLight,'angle',-Math.PI,Math.PI/2,0.001)
    spotLightGUI.add(spotLight,'penumbra',0,1,0.001)
    spotLightGUI.add(spotLight.target.position,'x',-100,100,0.001).name('Target X').onChange((val)=>{
        spotLight.target.position.x=val
    })
    spotLightGUI.add(spotLight.target.position,'y',-100,100,0.001).name('Target Y').onChange((val)=>{
        spotLight.target.position.y=val
    })
    spotLightGUI.add(spotLight.target.position,'z',-100,100,0.001).name('Target Z').onChange((val)=>{
        spotLight.target.position.z=val
    })

}










const directionalLight=new THREE.DirectionalLight(0xffffff,0.781)
directionalLight.position.set(-2.005,3.142,0.489)

// directionalLight.castShadow=true
// directionalLight.shadow.mapSize.width=1024
// directionalLight.shadow.mapSize.height=1024





scene.add(directionalLight)
const directionalLightGUI=gui.addFolder('Directional Light')
directionalLightGUI.addColor(LightGUI.directionalLight,'color').onChange((val)=>{
    directionalLight.color.set(val)
    }
)
directionalLightGUI.add(directionalLight,'intensity',0,2,0.001)
directionalLightGUI.add(directionalLight.position,'x',-Math.PI,Math.PI,0.001)
directionalLightGUI.add(directionalLight.position,'y',-Math.PI,Math.PI,0.001)
directionalLightGUI.add(directionalLight.position,'z',-Math.PI,Math.PI,0.001)







//Load Character
const mainPlayerStats={
    canmove: false,
    isGhosting:{value:false},
    targetOffset: 2,
    currentSpeedForward: 0,
    currentSpeedRotation:0,
    canIdle:true,
    MaxForward: 2,
    MaxRotation:0.8,
    boostFactor: 1,
    rotationSpeed: 1,
    AcclerationForward: 0.06,
    AcclerationRotation: 0.06,
    retardation: 0.2,
    isready: false,
    jumpHeight: 1,
    jumpTime: 1.8,
    inJumping: false,
}


let mainPlayerStatsUpdate={
    CharacterType: "type1",
    isSitting: {
        value:false
    },
    canmove:true,
    action: {
        Idle: {value:0},
        Jump: {value:0},
        Left: {value:0},
        LeftTurn: {value:0},
        Right: {value:0},
        RightTurn: {value:0},
        Run: {value:0},
        WalkingB: {value:0},
        WalkingF: {value:0},
        SitIdle: {value:0},
    },
    transform:{
        position: {
            x: 0,
            y: 0,
            z: 0
        },
        rotation: {
            x: 0,
            y: 0,
            z: 0
        }
    }
}




const players={}
const playerMixers={};
const actions={}
const models={};

//working model name ELY_K_ATIENZA

const modelUrl = {
    type1:"./Characters/M_Original/M_Original.fbx",
    type2:"./Characters/M_Hoodie/M_Hoodie.fbx",
    type3:"./Characters/F/F.fbx",
};

const actionUrL = {
    Idle:"./Characters/Animations/Idle.fbx",
    Jump:"./Characters/Animations/Jump.fbx",
    Left:"./Characters/Animations/Left.fbx",
    LeftTurn:"./Characters/Animations/LeftTurn.fbx",
    Right:"./Characters/Animations/Right.fbx",
    RightTurn:"./Characters/Animations/RightTurn.fbx",
    Run:"./Characters/Animations/Run.fbx",
    SitIdle:"./Characters/Animations/SittingIdle.fbx",
    DefusedSitToStand:"./Characters/Animations/SitToStand.fbx",
    DefusedStandToSit:"./Characters/Animations/StandToSit.fbx",
    WalkingB:"./Characters/Animations/WalkingB.fbx",
    WalkingF:"./Characters/Animations/WalkingF.fbx",
};




let modelCount=0;
let actionsCount=0;
const actionsCountTotal=Object.keys(actionUrL).length;
const modelCountTotal = Object.values(modelUrl).length





for(const modelName in modelUrl){
    fbxLoader.load(modelUrl[modelName],
    (model) => {
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        })
        models[modelName] = model
        model.scale.set(0.01, 0.01, 0.01)
        checkProgress('models')
        }
    )
}

for (const actionName in actionUrL) {
    fbxLoader.load(actionUrL[actionName],
        (model) => {
            actions[actionName] = model.animations[0]
            model.animations[0].name=actionName
            checkProgress('actions')
        }
    )
}



function checkProgress(type) {
    if(type==='models'){
        modelCount++;
    }
    else if(type==='actions'){
        actionsCount++;
    }
    // console.log(`${modelCount}/${modelCountTotal} ${actionsCount}/${actionsCountTotal}`)
	if (modelCount+actionsCount >= modelCountTotal+actionsCountTotal) {
		loadingComplete();
	}
}




function RegisterToDB(selfid){
    console.log('Registering to DB')
    set(ref(database,"Rooms/"+RoomID+"/"+'players/'+selfid),{
        canmove:true,
        position:{
            x:0,
            y:0,
            z:0,
        },
        rotation:{
            x:0,
            y:0,
            z:0,
        },
        CharacterType:'type1',
        action:{
            Idle:{value:0},
            Jump:{value:0},
            Left:{value:0},
            LeftTurn:{value:0},
            Right:{value:0},
            RightTurn:{value:0},
            Run:{value:0},
            SitIdle:{value:0},
            WalkingF:{value:0},
            WalkingB:{value:0},
        },
    
    })
}



let mainPlayer=null;
let mainPlayerMixer=null;

function loadingComplete(){
    onValue(ref(database,"Rooms/"+RoomID+"/"+'players/'),(snapshot)=>{
        if(snapshot.val()){
            if(!snapshot.val()[selfid]){
                RegisterToDB(selfid)
            }
            for(const playerID in snapshot.val()){
                if(playerID==selfid){
                    mainPlayerStatsUpdate.CharacterType=snapshot.val()[playerID].CharacterType
                    mainPlayerStatsUpdate.transform.position=snapshot.val()[playerID].transform.position
                    mainPlayerStatsUpdate.transform.rotation=snapshot.val()[playerID].transform.rotation
                    mainPlayerStatsUpdate.canmove=snapshot.val()[playerID].canmove
                    mainPlayer=SkeletonUtils.SkeletonUtils.clone(models[snapshot.val()[playerID].CharacterType])
                    mainPlayer.position.set(mainPlayerStatsUpdate.transform.position.x,mainPlayerStatsUpdate.transform.position.y,mainPlayerStatsUpdate.transform.position.z)
                    mainPlayer.rotation.set(mainPlayerStatsUpdate.transform.rotation.x,mainPlayerStatsUpdate.transform.rotation.y,mainPlayerStatsUpdate.transform.rotation.z)
                    scene.add(mainPlayer)
                    onValue(ref(database,"Rooms/"+RoomID+"/"+'players/'+playerID+'/canmove'),(snapshot)=>{
                        mainPlayerStatsUpdate.canmove=snapshot.val()
                    })
                    onValue(ref(database,"Rooms/"+RoomID+"/"+'players/'+playerID+'/isGhosting'),(snapshot)=>{
                        mainPlayerStats.isGhosting.value=snapshot.val().value
                    })
                    mainPlayerMixer=new THREE.AnimationMixer(mainPlayer)
                    playerMixers[playerID]=mainPlayerMixer
                    for(const actionName in actions){
                        if(actionName.slice(0,7)!='Defused'){
                            mainPlayerMixer.clipAction(actions[actionName]).play()
                            mainPlayerMixer.clipAction(actions[actionName]).weight=0;
                        }
                        else{
                            mainPlayerMixer.clipAction(actions[actionName]).loop=THREE.LoopOnce;
                        }
                    }
                }
                else if(true){
                    players[playerID]=SkeletonUtils.SkeletonUtils.clone(models[snapshot.val()[playerID].CharacterType])
                    playerMixers[playerID]=new THREE.AnimationMixer(players[playerID])
                    scene.add(players[playerID])
                    for(const actionName in actions){
                        if(actionName.slice(0,7)!='Defused'){
                            playerMixers[playerID].clipAction(actions[actionName]).play()
                            playerMixers[playerID].clipAction(actions[actionName]).weight=0;
                        }else{
                            playerMixers[playerID].clipAction(actions[actionName]).loop=THREE.LoopOnce;
                        }
                    }
                    onValue(ref(database,"Rooms/"+RoomID+"/"+'players/'+playerID+"/"+"isSitting"),(snapshot)=>{
                        if(snapshot.val()){
                            if(snapshot.val().value){
                                sittingGSAP.Activate(playerID)
                            }
                            else{
                                sittingGSAP.Deactivate(playerID)
                            }
                        }
                    })
                    onValue(ref(database,"Rooms/"+RoomID+"/"+'players/'+playerID+"/"+"transform"),(snapshot)=>{
                        if(snapshot.val()){
                            players[playerID].position.set(snapshot.val().position.x,snapshot.val().position.y,snapshot.val().position.z)
                            players[playerID].rotation.set(snapshot.val().rotation.x,snapshot.val().rotation.y,snapshot.val().rotation.z)
                        }})
                    onValue(ref(database,"Rooms/"+RoomID+"/"+'players/'+playerID+"/"+"action"),(snapshot)=>{
                        if(snapshot.val()){
                            for(const actionName in snapshot.val()){
                                playerMixers[playerID].clipAction(actions[actionName]).weight=snapshot.val()[actionName].value
                                }
                            }
                        }
                    )
                }
        }
            mainPlayerStats.previousAnimation='Idle'
            mainPlayerStats.canmove=true;
            console.log('Loading Complete')
        }
    },
        {
            onlyOnce:true
        }
    )
}

// model url names
const modelNames = ["type1","type2","type3"]
let currchar="type1"

function changeCharacter(){
    currchar=modelNames[(modelNames.indexOf(currchar)+1)%modelNames.length]
    scene.remove(mainPlayer)
    mainPlayer=SkeletonUtils.SkeletonUtils.clone(models[currchar])
    mainPlayer.position.set(mainPlayerStatsUpdate.transform.position.x,mainPlayerStatsUpdate.transform.position.y,mainPlayerStatsUpdate.transform.position.z)
    mainPlayer.rotation.set(mainPlayerStatsUpdate.transform.rotation.x,mainPlayerStatsUpdate.transform.rotation.y,mainPlayerStatsUpdate.transform.rotation.z)
    scene.add(mainPlayer)
    mainPlayerMixer=new THREE.AnimationMixer(mainPlayer)
    playerMixers[selfid]=mainPlayerMixer
    for(const actionName in actions){
        if(actionName.slice(0,7)!='Defused'){
            mainPlayerMixer.clipAction(actions[actionName]).play()
            mainPlayerMixer.clipAction(actions[actionName]).weight=0;
        }
        else{
            mainPlayerMixer.clipAction(actions[actionName]).loop=THREE.LoopOnce;
        }
    }
}















const sittingGSAP={
    isSitting:false,
    weight:0,
    Activate:(id=selfid)=>{
        if(!sittingGSAP.isSitting || id!=selfid){
            playerMixers[id].stopAllAction()
            if(id==selfid){
                sittingGSAP.isSitting=true
                mainPlayerStats.canmove=false;
                mainPlayerStatsUpdate.isSitting.value=true;
            }
            playerMixers[id].clipAction(actions['SitIdle']).play()
            playerMixers[id].clipAction(actions['DefusedStandToSit']).play()
            gsap.fromTo(
                sittingGSAP,{
                    weight:0
                },
                {
                    duration:1,
                    weight:1,
                    onUpdate:()=>{
                        playerMixers[id].clipAction(actions['SitIdle']).weight=sittingGSAP.weight
                    }
                }
            )
        }
    },
    Deactivate:(id=selfid)=>{
        if(sittingGSAP.isSitting || id!=selfid){
            playerMixers[id].clipAction(actions['DefusedSitToStand']).play()
            playerMixers[id].clipAction(actions['Idle']).weight=0
            gsap.fromTo(
                sittingGSAP,{
                    weight:1
                },
                {
                    duration:1,
                    weight:0,
                    onUpdate:()=>{
                        playerMixers[id].clipAction(actions['SitIdle']).weight=sittingGSAP.weight
                        playerMixers[id].clipAction(actions['Idle']).weight=1-sittingGSAP.weight
                    },
                    onComplete:()=>{
                        if(id==selfid){
                            mainPlayerStats.canmove=true;
                            sittingGSAP.isSitting=false;
                            mainPlayerStatsUpdate.isSitting.value=false;
                        }
                    }
                }
            )
            for(const actionName in actions){
                if(actionName.slice(0,7)!='Defused'){
                    playerMixers[id].clipAction(actions[actionName]).play()
                    playerMixers[id].clipAction(actions[actionName]).weight=0;
                }
                else{
                    playerMixers[id].clipAction(actions[actionName]).loop=THREE.LoopOnce;
                }
            }
        }
    }
    
}




gui.add(sittingGSAP, 'Activate').name('Activate Sitting')
gui.add(sittingGSAP, 'Deactivate').name('Deactivate Sitting')









const CameraStats={
    cameraShouldFollow: true,
    cameraShouldTrack: true,
    isFirstPerson:false,
    duration:1,
    cameraOffset: 3,
    cameraHeight: 2.42,
    cameraTargetHeight: 1.42,
    cameraTargetDistanceFactor: 1,
    FirstPerson:()=>{
        if(!CameraStats.isFirstPerson){
            gsap.to(CameraStats, {
                duration: CameraStats.duration,
                cameraOffset:-0.3,
                cameraHeight: 1.51,
                cameraTargetHeight:1.45,
                ease: "power3.inOut",
            });
            CameraStats.isFirstPerson = true;
        }
    },
    ThirdPerson:()=>{
            if(CameraStats.isFirstPerson){
                gsap.to(CameraStats, {
                    duration: CameraStats.duration,
                    cameraOffset:3,
                    cameraHeight: 2.42,
                    cameraTargetHeight: 1.42,
                    ease: "power3.inOut",
                }); 
                CameraStats.isFirstPerson = false;
        }  
    },

}

const CameraFolderGui=gui.addFolder('Camera')
CameraFolderGui.add(CameraStats,'cameraShouldFollow')
CameraFolderGui.add(CameraStats,'cameraShouldTrack')
CameraFolderGui.add(CameraStats,'FirstPerson')
CameraFolderGui.add(CameraStats,'ThirdPerson')
CameraFolderGui.add(CameraStats,'cameraOffset',-5,5)
CameraFolderGui.add(CameraStats,'cameraHeight',-5,5)
CameraFolderGui.add(CameraStats,'cameraTargetHeight',-5,5)
CameraFolderGui.add(CameraStats,'cameraTargetDistanceFactor',-5,5)
CameraFolderGui.add(CameraStats,'duration',0,5)





















const fadeToAction=(actionName,previousAnimation,duration=0.2)=>{
    if(actionName==previousAnimation){
        return
    }
    else{
        gsap.to(mainPlayerMixer.clipAction(actions[previousAnimation]),{
            duration:duration,
            weight:0,
            onUpdate:()=>{
                mainPlayerStatsUpdate.action[previousAnimation].value=mainPlayerMixer.clipAction(actions[previousAnimation]).weight
            }
        })
        gsap.to(mainPlayerMixer.clipAction(actions[actionName]),{
            duration:duration,
            weight:1,
            onUpdate:()=>{
                mainPlayerStatsUpdate.action[actionName].value=mainPlayerMixer.clipAction(actions[actionName]).weight
            }
        })
 
        mainPlayerStats.previousAnimation=actionName
    }
}




const keysPressed={}


document.addEventListener("keydown", (event) => {

    keysPressed[event.key.toLowerCase()] = true;

    if(event.key.toLowerCase()=='u'){
        changeCharacter()
    }
    if(event.key.toLowerCase()=='l'){
        laptopGUIHelper.startSpinning()
    }

    if(event.key.toLowerCase()=='g'){
        onValue(ref(database,"Rooms/"+RoomID+"/"+'players/'+selfid+'/isGhosting'),(snapshot)=>{
            mainPlayerStats.isGhosting.value=!snapshot.val().value
            update(ref(database,"Rooms/"+RoomID+"/"+'players/'+selfid+'/isGhosting'),{value:mainPlayerStats.isGhosting.value})
            if(mainPlayerStats.isGhosting.value){
                const ghost=document.getElementById('Ghost')
                ghost.style.display='flex'
                console.log('Ghosting')
            }
            else{
                const ghost=document.getElementById('Ghost')
                ghost.style.display='none'
                console.log('Not Ghosting')
            }

        },{
            onlyOnce:true
        }
        )
    }

    if(event.key.toLowerCase()=='f'){
        if(CameraStats.isFirstPerson){
            CameraStats.ThirdPerson()
        }
        else{
            CameraStats.FirstPerson()
        }
    }
});

document.addEventListener("keyup", (event) => {
    delete keysPressed[event.key.toLowerCase()];
});




/**
 * Animate
 */

const updatePlayerMixer=(deltaTime)=>{
    if(!mainPlayerStats.isGhosting.value){
        update(ref(database,"Rooms/"+RoomID+"/"+'players/'+selfid),mainPlayerStatsUpdate)
    }
    
    for (const mixer of Object.values(playerMixers)) {
        mixer.update(deltaTime);
    }
}

const updateMainPlayerMotion=()=>{
    if(mainPlayer){
        mainPlayerStatsUpdate.transform.rotation.y=mainPlayerStatsUpdate.transform.rotation.y%(2*Math.PI);
        //PreCalculations
        const vectorCosFactor=Math.cos(-mainPlayerStatsUpdate.transform.rotation.y-Math.PI/2);
        const vectorSinFactor=Math.sin(-mainPlayerStatsUpdate.transform.rotation.y-Math.PI/2);
        
        const CalcVecCameraPosition=new THREE.Vector3(
            mainPlayerStatsUpdate.transform.position.x+(vectorCosFactor*CameraStats.cameraOffset),
            mainPlayerStatsUpdate.transform.position.y,
            mainPlayerStatsUpdate.transform.position.z+(vectorSinFactor*CameraStats.cameraOffset)
            );
            
            const CalcVecPlayerTarget=new THREE.Vector3(
                mainPlayerStatsUpdate.transform.position.x-(vectorCosFactor*mainPlayerStats.targetOffset),
                mainPlayerStatsUpdate.transform.position.y,
                mainPlayerStatsUpdate.transform.position.z-(vectorSinFactor*mainPlayerStats.targetOffset)
                );
                
                const CalcVecCameraTarget=new THREE.Vector3(
                    mainPlayerStatsUpdate.transform.position.x-(vectorCosFactor*CameraStats.cameraTargetDistanceFactor),
                    mainPlayerStatsUpdate.transform.position.y+CameraStats.cameraTargetHeight,
                    mainPlayerStatsUpdate.transform.position.z-(vectorSinFactor*CameraStats.cameraTargetDistanceFactor)
        );
    
        if (mainPlayerStats.currentSpeedForward > 0) {
            mainPlayerStats.currentSpeedForward = clamp(mainPlayerStats.currentSpeedForward - mainPlayerStats.retardation,0,mainPlayerStats.MaxForward);
        }
        if (mainPlayerStats.currentSpeedForward < 0) {
            mainPlayerStats.currentSpeedForward = clamp(mainPlayerStats.currentSpeedForward + mainPlayerStats.retardation,-mainPlayerStats.MaxForward,0);
        }
        if(mainPlayerStats.currentSpeedRotation > 0){
            mainPlayerStats.currentSpeedRotation = clamp(mainPlayerStats.currentSpeedRotation - mainPlayerStats.retardation,0,mainPlayerStats.MaxRotation);
        }
        if(mainPlayerStats.currentSpeedRotation < 0){
            mainPlayerStats.currentSpeedRotation = clamp(mainPlayerStats.currentSpeedRotation + mainPlayerStats.retardation,-mainPlayerStats.MaxRotation,0);
        }
        
        if(mainPlayerStats.canmove && mainPlayerStatsUpdate.canmove){
            for (let key in keysPressed) {
                if (key == "w") {
                    mainPlayerStats.currentSpeedForward = clamp(
                        mainPlayerStats.currentSpeedForward + mainPlayerStats.retardation + mainPlayerStats.AcclerationForward,0,mainPlayerStats.MaxForward);
                        mainPlayerStatsUpdate.transform.position.z +=(CalcVecPlayerTarget.z-mainPlayer.position.z)/2 * mainPlayerStats.currentSpeedForward * mainPlayerStats.boostFactor * deltaTime;
                        mainPlayerStatsUpdate.transform.position.x +=(CalcVecPlayerTarget.x-mainPlayer.position.x)/2 * mainPlayerStats.currentSpeedForward * mainPlayerStats.boostFactor * deltaTime;
                    }
                    if (key == "s") {
                    mainPlayerStats.currentSpeedForward = clamp(
                    mainPlayerStats.currentSpeedForward - mainPlayerStats.retardation - mainPlayerStats.AcclerationForward,-mainPlayerStats.MaxForward,0);
                    mainPlayerStatsUpdate.transform.position.z -=(CalcVecPlayerTarget.z-mainPlayer.position.z)/2 * Math.abs(mainPlayerStats.currentSpeedForward) * deltaTime;
                    mainPlayerStatsUpdate.transform.position.x -=(CalcVecPlayerTarget.x-mainPlayer.position.x)/2 * Math.abs(mainPlayerStats.currentSpeedForward) * deltaTime;
            }
            if (key == "a") {
                mainPlayerStats.currentSpeedRotation = clamp(
                    mainPlayerStats.currentSpeedRotation + mainPlayerStats.retardation + mainPlayerStats.AcclerationRotation,0,mainPlayerStats.MaxForward);
                    mainPlayerStatsUpdate.transform.rotation.y += mainPlayerStats.currentSpeedRotation * deltaTime;
            }
            if (key == "d") {
                mainPlayerStats.currentSpeedRotation = clamp(
                    mainPlayerStats.currentSpeedRotation - mainPlayerStats.retardation - mainPlayerStats.AcclerationRotation,-mainPlayerStats.MaxForward,0);
                    mainPlayerStatsUpdate.transform.rotation.y += mainPlayerStats.currentSpeedRotation * deltaTime;
                }
                
            }
        }

        if(mainPlayerStats.currentSpeedForward > 0 ){
            if(keysPressed.shift){
                fadeToAction('Run',mainPlayerStats.previousAnimation)
            }
            else{
                fadeToAction('WalkingF',mainPlayerStats.previousAnimation)
            }
        }
        else if(mainPlayerStats.currentSpeedForward < 0){
            fadeToAction('WalkingB',mainPlayerStats.previousAnimation)
        }
        else if(mainPlayerStats.currentSpeedRotation > 0 && mainPlayerStats.currentSpeedForward == 0){
            fadeToAction('LeftTurn',mainPlayerStats.previousAnimation)
        }
        else if(mainPlayerStats.currentSpeedRotation < 0 && mainPlayerStats.currentSpeedForward == 0){
            fadeToAction('RightTurn',mainPlayerStats.previousAnimation)
        }
        else if (mainPlayerStats.canIdle){
            fadeToAction('Idle',mainPlayerStats.previousAnimation)
        }

        if(mainPlayerStats.canmove){
            if(keysPressed.shift && mainPlayerStats.currentSpeedForward>0){
                mainPlayerStats.boostFactor=clamp(mainPlayerStats.boostFactor+1*deltaTime,0,2);
            }
        }
        if(!keysPressed.shift){
            mainPlayerStats.boostFactor=clamp(mainPlayerStats.boostFactor-2*deltaTime,1,2);
        }
        
        
        mainPlayer.position.copy(mainPlayerStatsUpdate.transform.position);
        mainPlayer.rotation.y = mainPlayerStatsUpdate.transform.rotation.y;
        
        
        if(CameraStats.cameraShouldFollow){
            camera.position.set(
                CalcVecCameraPosition.x,
                mainPlayerStatsUpdate.transform.position.y+CameraStats.cameraHeight,
                CalcVecCameraPosition.z
                )
            }
            
            if(CameraStats.cameraShouldTrack){
                controls.target.copy(CalcVecCameraTarget);
            }   
        }
    }
    
    
    
    const clock = new THREE.Clock()
    let previousTime=0;
    let deltaTime=0;
    const tick = () =>
    {
        const elapsedTime = clock.getElapsedTime()
        deltaTime = elapsedTime - previousTime;
        previousTime = elapsedTime;
        updatePlayerMixer(deltaTime);
        updateMainPlayerMotion();
        
        // Update controls
        controls.update()
        
        // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()