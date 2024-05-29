import * as THREE from 'three'
import { Pong } from './Pong';
import { PongComputation } from './PongComputation'

export class PongDraw
{
    element: any = null

    pong: any = null;
    computation: any = null;

    scene: any = null;
    camera: any = null;
    renderer: any = null;

    field: any = null;
    line: any = null;
    paddle1: any = null;
    paddle2: any = null;
    ball: any = null;

    gameLoop: any = null;
    gameFPS: any = 25

    onUpdate: any = null
    isStarted: boolean = false 
    

    constructor(
        element: any, 
        pong: Pong, 
        computation: PongComputation, 
        onUpdate: any = null)
    {
        this.element = element
        this.pong = pong
        this.computation = computation

        this.setup()
        this.setupField()
        this.setupLine()
        this.setupPaddle1()
        this.setupPaddle2()
        this.setupBall()
        //this.draw()
        this.onUpdate = onUpdate
    }

    setup()
    {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.pong.getData().scene.width /  this.pong.getData().scene.height, 0.01, 1000);
        this.renderer = new THREE.WebGLRenderer();

        this.renderer.setSize(this.pong.getData().scene.width, this.pong.getData().scene.height);
        this.element.appendChild(this.renderer.domElement);
    }

    setupField()
    {
        var geometry = new THREE.PlaneGeometry(this.pong.getData().scene.width, this.pong.getData().scene.height);
        var material = new THREE.MeshBasicMaterial({ color: 0x091C2A });
        this.field = new THREE.Mesh(geometry, material);
    }

    setupLine()
    {
        var geometry = new THREE.PlaneGeometry(2,  this.pong.getData().scene.height);
        var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.line = new THREE.Mesh(geometry, material);
    }

    setupPaddle1()
    {
        var geometry = new THREE.PlaneGeometry(this.pong.getData().paddle1.width, this.pong.getData().paddle1.height);
        var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.paddle1 = new THREE.Mesh(geometry, material);      
    }

    setupPaddle2()
    {
        var geometry = new THREE.PlaneGeometry(this.pong.getData().paddle2.width, this.pong.getData().paddle2.height);
        var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.paddle2 = new THREE.Mesh(geometry, material);
    }

    setupBall()
    {        
        var geometry = new THREE.PlaneGeometry(this.pong.getData().ball.width, this.pong.getData().ball.height);
        var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.ball = new THREE.Mesh(geometry, material);
    }

    drawPaddle1CollisionSquares()
    {
        const isCollision = this.computation.detecterCollision(
            this.pong.getData().paddle1.x, this.pong.getData().paddle1.y, 
            this.pong.getData().paddle1.width, this.pong.getData().paddle1.height, 
            this.pong.getData().ball.x, this.pong.getData().ball.y, 
            this.pong.getData().ball.width, 
            5,
        );
        // Quand il y a une collision
        if (isCollision)
        {
            // Dessiner quatre carrés de tailles différentes entre 10 et 20 pixels
            // avec une bordure blanche et une couleur de remplissage transparente
            // autour de la collision,
            // s'éloignant progressivement jusqu'à un maximum de 10 pixels du centre de la collision.
            // Plus ils s'éloignent, plus ils deviennent transparents et disparaissent.
        }
    }

    drawAll()
    {
        this.scene.add(this.field);
        this.camera.position.z = this.field.geometry.parameters.height / (2 * Math.tan(Math.PI * this.camera.fov / 360));
        this.scene.add(this.line);
        this.scene.add(this.paddle1);
        this.computation.updateCoordinatesRelativeFrom(this.field, this.paddle1, this.pong.getData().paddle1.x, this.pong.getData().paddle1.y);
        this.scene.add(this.paddle2);
        this.computation.updateCoordinatesRelativeFrom(this.field, this.paddle2, this.pong.getData().paddle2.x, this.pong.getData().paddle2.y);
        this.scene.add(this.ball);
        this.computation.updateCoordinatesRelativeFrom(this.field, this.ball, this.pong.getData().ball.x, this.pong.getData().ball.y);
        this.renderer.render(this.scene, this.camera);
    }

    draw()
    {
        this.drawAll()

        const animate = () => {
            
            this.gameLoop = requestAnimationFrame(animate);

            if(this.pong.getData().isEnd || !this.isStarted)
                return 

            const data = this.computation.ballCompute()

            
            
            this.scene.clear();
            this.drawAll()

            if (this.pong.getData().ballIsOut)
                this.stop()

        };
        
        animate();
    }

    start()
    {
        this.isStarted = true
        this.draw()
    }

    stop()
    {   
        this.isStarted = false
        cancelAnimationFrame(this.gameLoop)
    }

    // server update view
    serverDraw()
    {
        // this.drawAll()

        // const animate = () => {
        //     this.gameLoop = requestAnimationFrame(animate);            
        //     this.scene.clear();
        //     this.drawAll()
        // };
        
        // animate();

        this.scene.clear();
        this.drawAll()
    }
}