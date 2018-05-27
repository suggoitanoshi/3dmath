// Initialize scene and camera
var scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
var camera = new THREE.PerspectiveCamera(75, 1, .1, 1000);

// Set Renderer size
var renderer = new THREE.WebGLRenderer();
var width, height;
if(window.innerWidth / window.innerHeight > 1){
  width = window.innerWidth / 3;
  height = window.innerWidth / 3;
}
else{
  width = window.innerWidth;
  height = window.innerWidth;
}
renderer.setSize(width, height);
renderer.domElement.id = "cube-canvas";

// Insert generated canvas to "The World"
$("#cube").prepend(renderer.domElement);
var controls = new THREE.OrbitControls(camera, $("#cube-canvas")[0]);

// Create basic cube
var rusuk = 2;
var skalaRusuk = 1;
var geometry = new THREE.BoxGeometry(rusuk, rusuk, rusuk);
var edgeGeometry = new THREE.EdgesGeometry(geometry);
var material = new THREE.LineBasicMaterial({color: 0x00ff00, linewidth: 2});
var cube = new THREE.LineSegments(edgeGeometry, material);
scene.add(cube);

var cubeName = null;
var cubeNames = new Array();

var cubePoints = [
  new THREE.Vector3(-rusuk/2, -rusuk/2, rusuk/2),
  new THREE.Vector3(rusuk/2, -rusuk/2, rusuk/2),
  new THREE.Vector3(rusuk/2, -rusuk/2, -rusuk/2),
  new THREE.Vector3(-rusuk/2, -rusuk/2, -rusuk/2),
  new THREE.Vector3(-rusuk/2, rusuk/2, rusuk/2),
  new THREE.Vector3(rusuk/2, rusuk/2, rusuk/2),
  new THREE.Vector3(rusuk/2, rusuk/2, -rusuk/2),
  new THREE.Vector3(-rusuk/2, rusuk/2, -rusuk/2)
];

for(var i = 0; i < 8; i++){
  $("#cube-overlay").append($("<span></span>").addClass("point "+i));
}
var canvasOffset = $("#cube-canvas").offset();

$("#nama_ok").on("click", function(){
  cubeName = $("#nama").val().toUpperCase();
  if(cubeName.length != 8){
    alert("Nama!!");
    return;
  }
  var nama = cubeName.split("");

  for (var i = 0; i < nama.length; i++){
    $(".point."+i).text(nama[i]);
  }
});

var distMat = new THREE.LineBasicMaterial({ color: 0xcc0a0a, linewidth: 2 });
var targetMat = new THREE.LineBasicMaterial({ color: 0x000acc, linewidth: 2 });
var shapeMat = new THREE.MeshBasicMaterial( { color: 0x000acc, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
var lineDist;
var lineTarget;
var lineGeo;
var shapeGeo;
var shapeTarget;

var pointA, pointB, orig, target, jarak, jarakRaw, pA, pB;
// pA = name of origin point
// pB = name of target point

$("#jarak_ok").on("click", function(){
  scene.remove(lineDist);
  scene.remove(lineTarget);
  scene.remove(shapeTarget);
  pointA = $("#pointA").val().trim().toUpperCase();
  pointB = $("#pointB").val().trim().toUpperCase();
  if(pointA.length == 1){
    if(pointB.length == 1){
      // titik ke titik
      pA = cubeName.indexOf(pointA);
      pB = cubeName.indexOf(pointB);
      orig = cubePoints[pA];
      target = cubePoints[pB];
    }
    else if(pointB.length == 2){
      // titik ke garis
      pA = cubeName.indexOf(pointA);
      orig = cubePoints[pA];
      // introduce two new points, C and D
      pointB = pointB.split("");
      var pC = cubeName.indexOf(pointB[0]);
      var pD = cubeName.indexOf(pointB[1]);
      var pointC = cubePoints[pC];
      var pointD = cubePoints[pD];
      var d = new THREE.Vector3().subVectors(pointC, pointD).divideScalar(pointD.distanceTo(pointC));
      var v = new THREE.Vector3().subVectors(orig, pointC);
      var t = v.dot(d);
      target = pointC.clone().add(d.multiplyScalar(t));
      lineGeo = new THREE.Geometry();
      lineGeo.vertices.push(pointC);
      lineGeo.vertices.push(pointD);
      lineTarget = new THREE.Line(lineGeo, targetMat);
      scene.add(lineTarget);
    }
    else if(pointB.length == 3 || pointB.length == 4){
      // titik ke bidang (?)
      // TODO: much research
      pA = cubeName.indexOf(pointA);
      orig = cubePoints[pA];
      pointB = pointB.split("");
      shapeGeo = new THREE.Geometry();
      var plane = new Array(), planePoint = new Array();
      for(var i = 0; i < pointB.length; i++){
        plane[i] = cubeName.indexOf(pointB[i]);
        planePoint[i] = cubePoints[plane[i]];
        shapeGeo.vertices.push(planePoint[i]);
      }
      shapeGeo.vertices.push(planePoint[0]);
      shapeGeo.faces.push(new THREE.Face3(0,1,2));
      if(pointB.length == 4){
        shapeGeo.faces.push(new THREE.Face3(0,3,2));
      }
      shapeTarget = new THREE.Mesh(shapeGeo, shapeMat);
      // ambil 2 garis
      var line1 = new THREE.Vector3().subVectors(planePoint[0], planePoint[1]);
      var line2 = new THREE.Vector3().subVectors(planePoint[1], planePoint[2]);
      // cari garis normal menggunakan 'cross product'
      var norm = line1.cross(line2);
      var len = norm.clone().length()
      norm.divideScalar(len);
      // jarak titik awal ke salah satu titik di bidang
      var pointOnPlane = planePoint[0].clone().add(planePoint[1]).add(planePoint[2]).divideScalar(3)
      var dist = new THREE.Vector3().subVectors(pointOnPlane, orig);
      // dot product dist dan norm = "jarak titik ke bidang"
      jarak = dist.dot(norm);
      // titik hasil proyeksi
      target = orig.clone().add(norm.clone().multiplyScalar(jarak));
      scene.add(shapeTarget);
    }
    else{

    }
  }
  jarakRaw = orig.distanceTo(target);
  jarak = jarakRaw*skalaRusuk;
  $("#jarak").text(jarak);

  lineGeo = new THREE.Geometry();
  lineGeo.vertices.push(orig);
  lineGeo.vertices.push(target);
  lineDist = new THREE.Line(lineGeo, distMat);
  scene.add(lineDist);
});

$("#rusuk_ok").on("click", function(){
  var rusukBaru = $("#rusuk").val();
  skalaRusuk = rusukBaru / rusuk;
  $("#jarak").text(jarakRaw*skalaRusuk);
  rusukBaru = null;
});

camera.position.z = 5;

var sdiagDisplay = false;

var halfWidth = width/2;
var halfHeight = height / 2;
function animate(){
  requestAnimationFrame(animate);

  renderer.render(scene, camera);

  if(cubeName !== null){
    for(var i = 0; i < 8; i++){
      var tempScreen = cubePoints[i].clone();
      // tempScreen.setFromMatrixPosition(cube.matrixWorld);
      tempScreen.project(camera);
      tempScreen.x = (tempScreen.x * halfWidth) + halfWidth;
      tempScreen.y = -(tempScreen.y * halfHeight) + halfHeight;
      $(".point."+i).css({left: tempScreen.x + "px", top: tempScreen.y + "px"});
    }
  }
}
animate();

var pos = $("#cube-canvas").offset();

$("#cube-overlay").css({top: pos.top, left: pos.left, width: $("#cube-canvas").width(), height: $("#cube-canvas").height()});
