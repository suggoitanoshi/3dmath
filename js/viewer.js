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

var lineMat = new THREE.LineBasicMaterial({ color: 0xcc0a0a, linewidth: 2 });
var lineDist;
var lineTarget;
var lineGeo;

var pointA, pointB, orig, target, jarak, pA, pB;
// pA = name of origin point
// pB = name of target point

$("#jarak_ok").on("click", function(){
  scene.remove(lineDist);
  pointA = $("#pointA").val().trim().toUpperCase();
  pointB = $("#pointB").val().trim().toUpperCase();

  if(pointA.length == 1 && pointB.length == 1){
    // titik ke titik
    pA = cubeName.indexOf(pointA);
    pB = cubeName.indexOf(pointB);
    orig = cubePoints[pA];
    target = cubePoints[pB];
  }
  if(pointA.length == 1 && pointB.length == 2){
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
  }
  else{
    alert("Operation not yet supported!");
    return;
  }
  jarak = orig.distanceTo(target) * skalaRusuk;
  $("#jarak").text(jarak);

  lineGeo = new THREE.Geometry();
  lineGeo.vertices.push(orig);
  lineGeo.vertices.push(target);
  lineDist = new THREE.Line(lineGeo, lineMat);
  scene.add(lineDist);
  // else{
  //   alert("Operasi belum di-support!");
  //   return;
  // }
});

$("#rusuk_ok").on("click", function(){
  skalaRusuk = $("#rusuk").val() / rusuk;
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
