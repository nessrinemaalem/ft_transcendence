const pong = new Pong({
    selector: '#pong',
})


// // placer 'plane' relativement par raport au 'planeFrom'
// // si 'planeFrom' x1 = 200
// // si 'planeFrom' y1 = 100
// // si x = 0
// // si y = 0
// // alors 'plane' setrouve 
// // x1 + x pour x2
// // y1 + y pour y2
// function updateCoordinatesRelativeFrom(planeFrom, plane, x, y) {
//     var planeFromPosition = planeFrom.position;
//     var planePosition = plane.position;

//     // Récupérer la largeur et la hauteur de planeFrom
//     var planeFromGeometry = planeFrom.geometry;
//     var planeFromSize = {
//         width: planeFromGeometry.parameters.width,
//         height: planeFromGeometry.parameters.height,
//     };

//     // Récupérer la largeur et la hauteur de plane
//     var planeGeometry = plane.geometry;
//     var planeSize = {
//         width: planeGeometry.parameters.width,
//         height: planeGeometry.parameters.height,
//     };
    
//     // Calculer les nouvelles coordonnées
//     var x2 = planeFromPosition.x + x - planeFromSize.width / 2 + planeSize.width / 2;
//     var y2 = planeFromPosition.y - y + planeFromSize.height / 2 - planeSize.height / 2;

//     plane.position.set(x2, y2, planePosition.z);
// }


// // Initialiser Three.js
// var scene = new THREE.Scene();
// var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// var renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// // Créer un rectangle rouge (plan)
// var geometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);
// var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
// var planeField = new THREE.Mesh(geometry, material);
// scene.add(planeField);

// var geometry2 = new THREE.PlaneGeometry(30, 100);
// var material2 = new THREE.MeshBasicMaterial({ color: 0xffffff });
// var planeRect = new THREE.Mesh(geometry2, material2);

// scene.add(planeRect);

// // Placer le planRect relativement à planeField

// updateCoordinatesRelativeFrom(planeField, planeRect, 0, 0);


// // Ajuster la position de la caméra pour qu'elle soit face au rectangle et remplisse tout l'écran
// const max_zoom = camera.position.z = planeField.geometry.parameters.height / (2 * Math.tan(Math.PI * camera.fov / 360))

// camera.position.z = planeField.geometry.parameters.height / (2 * Math.tan(Math.PI * camera.fov / 360));
// // console.log(camera.position.z)
// // camera.position.z = 0;
// scene.add(camera);

// renderer.render(scene, camera);

// // faire reculer la caméra progressivement
// var distance = camera.position.z; // distance initiale
// var initialZoomSpeed = 0.5; // Vitesse de zoom initiale
// var zoomSpeed = initialZoomSpeed; // Vitesse de zoom actuelle

// document.addEventListener('keydown', function(event) {
//     var maxZoomSpeed = 10; // Vitesse de zoom maximale
//     if (event.keyCode === 40 && distance > max_zoom) { // Flèche bas
//         if (zoomSpeed < maxZoomSpeed) {
//             zoomSpeed += 0.5; // Augmentez la vitesse de zoom progressivement
//         }
//         distance -= zoomSpeed; // ajuster la distance de la caméra
//     }
//     else if (event.keyCode === 38) { // Flèche haut
//         if (zoomSpeed < maxZoomSpeed) {
//             zoomSpeed += 0.5; // Augmentez la vitesse de zoom progressivement
//         }
//         distance += zoomSpeed; // ajuster la distance de la caméra
//     }
    
//     camera.position.z = distance;
//     console.log(camera.position.z);
//     renderer.render(scene, camera);
// });


// // function animate() {
// //     requestAnimationFrame(animate);
// //     distance += 1; // ajuster la vitesse de recul
// //     camera.position.z = distance;
// //     renderer.render(scene, camera);
// // }
// // animate();






