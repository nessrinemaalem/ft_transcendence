import { GamePong } from "./GamePong"; 

export class GamePongComputation
{
    pong: GamePong = null
        
    constructor(pong: GamePong)
    {
        this.pong = pong
    } 
 
    updateCoordinatesRelativeFrom(planeFrom: any, plane: any, x: number, y: number) 
    {
        var planeFromPosition = planeFrom.position;
        var planePosition = plane.position;
    
        // Récupérer la largeur et la hauteur de planeFrom
        var planeFromGeometry = planeFrom.geometry;
        var planeFromSize = {
            width: planeFromGeometry.parameters.width,
            height: planeFromGeometry.parameters.height,
        };
    
        // Récupérer la largeur et la hauteur de plane
        var planeGeometry = plane.geometry;
        var planeSize = {
            width: planeGeometry.parameters.width,
            height: planeGeometry.parameters.height,
        };
        
        // Calculer les nouvelles coordonnées
        var x2 = planeFromPosition.x + x - planeFromSize.width / 2 + planeSize.width / 2;
        var y2 = planeFromPosition.y - y + planeFromSize.height / 2 - planeSize.height / 2;
    
        plane.position.set(x2, y2, planePosition.z);
    }

    generateRandomAngle() 
    {
        let angleView = 30;
        let angleIgnore1 = [90 - (angleView / 2), 90 + (angleView / 2)]; // plage près de 90 degrés
        let angleIgnore2 = [270 - (angleView / 2), 270 + (angleView / 2)]; // plage près de 270 degrés
        const verticalAngles = [90, 270];
        let angle;
        do {
            angle = Math.random() * 360;
        } while ((angle >= angleIgnore1[0] && angle <= angleIgnore1[1]) || (angle >= angleIgnore2[0] && angle <= angleIgnore2[1]) || verticalAngles.includes(angle));
        return angle;
    }
    
    ballCompute()
    {
        if (this.pong.getData().ballAngle == -1) 
        {
            this.pong.getData().ballAngle = this.generateRandomAngle();
        }

        var angleRad = this.pong.getData().ballAngle * Math.PI / 180;

        // this.pong.getData().ballSpeed = 10  // Level
        var speedX = Math.cos(angleRad) * this.pong.getData().ballSpeed;
        var speedY = Math.sin(angleRad) * this.pong.getData().ballSpeed;

        // Déplacer la balle dans la direction donnée par les vitesses
        this.pong.getData().ball.x += speedX * 1;
        this.pong.getData().ball.y += speedY * 1;

        return this.ballComputeColision()
    }

    detecterCollision(
        x_paddle: number,
        y_paddle: number,
        largeur_paddle: number,
        hauteur_paddle: number,
        x_balle: number,
        y_balle: number,
        taille_cote_balle: number,
        n_pixel: number
    ) {

        var gauche_paddle = x_paddle - n_pixel;
        var droite_paddle = x_paddle + largeur_paddle + n_pixel;
        var haut_paddle = y_paddle - n_pixel;
        var bas_paddle = y_paddle + hauteur_paddle + n_pixel;
    
        var gauche_balle = x_balle;
        var droite_balle = x_balle + taille_cote_balle;
        var haut_balle = y_balle;
        var bas_balle = y_balle + taille_cote_balle;
    
        if (gauche_paddle < droite_balle && droite_paddle > gauche_balle &&
            haut_paddle < bas_balle && bas_paddle > haut_balle) {
            return true;
        } else {
            return false;
        }
    }

    ballComputeColision() {
        let data = {
            isLeft: false,
            isRight: false,
        }
        // Vérifier si la balle est sortie à gauche ou à droite
        if (this.pong.getData().ball.x < 0) {
            // La balle est sortie à gauche
            data = {
                isLeft: true,
                isRight: false,
            }
            this.pong.getData().ballIsOut = true;
        } else if (this.pong.getData().ball.x > this.pong.getData().scene.width - this.pong.getData().ball.width) {
            // La balle est sortie à droite
            data = {
                isLeft: false,
                isRight: true,
            }
            this.pong.getData().ballIsOut = true;
        } else {
            // La balle n'est pas sortie
            this.pong.getData().ballIsOut = false;
        }
    
        // Loi de la réflexion
        // Si la balle touche le mur gauche ou droit
        if (this.pong.getData().ball.x < 0 || this.pong.getData().ball.x > this.pong.getData().scene.width - this.pong.getData().ball.width) {
            // Inverser la direction horizontale de la balle
            this.pong.getData().ballAngle = 180 - this.pong.getData().ballAngle;
            if (this.pong.getData().ballIsOut) {
                // Réinitialiser la balle au centre si elle est sortie
                this.pong.getData().ballAngle = -1;
                this.pong.getData().ball.x = (this.pong.getData().scene.width - this.pong.getData().ball.width) / 2;
                this.pong.getData().ball.y = (this.pong.getData().scene.height - this.pong.getData().ball.height) / 2;
            }
        }
    
        // Si la balle touche le mur haut ou bas
        if (this.pong.getData().ball.y < 0 || this.pong.getData().ball.y > this.pong.getData().scene.height - this.pong.getData().ball.height) {

            this.pong.getData().ballAngle = 360 - this.pong.getData().ballAngle;
        }
    
        this.ballComputeCollisionPaddle1();
        this.ballComputeCollisionPaddle2();

        return data
    }

    ballComputeCollisionPaddle1()
    {
        const isCollision1 = this.detecterCollision(
            this.pong.getData().paddle1.x, this.pong.getData().paddle1.y, 
            this.pong.getData().paddle1.width, this.pong.getData().paddle1.height, 
            this.pong.getData().ball.x, this.pong.getData().ball.y, 
            this.pong.getData().ball.width, 
            5,
        );

        if (isCollision1)
        {
            // console.log("Collision détectée !", 
            //     this.pong.getData().ball.x, this.pong.getData().ball.y,
            //     this.pong.getData().paddle1.x, this.pong.getData().paddle1.y, 
            // );

            // Générer une variation aléatoire d'angle
            let angleVariation = (Math.random() - 0.5) * 20; // Variation aléatoire entre -10 et 10 degrés

            // Ajouter cette variation à l'angle de réflexion
            this.pong.getData().ballAngle += angleVariation;


            // Si la balle touche le paddle, inverser l'angle horizontalement
            // Inverser l'angle horizontalement (par exemple, si la balle se déplace vers la gauche, elle doit se diriger vers la droite après la collision)
            if (this.pong.getData().ball.x > this.pong.getData().paddle1.x + this.pong.getData().paddle1.width / 2) {
                // Inverser l'angle horizontalement vers la droite
                this.pong.getData().ballAngle = 180 - this.pong.getData().ballAngle;
            } else {
                // Inverser l'angle horizontalement vers la gauche
                this.pong.getData().ballAngle = 180 + 180 - this.pong.getData().ballAngle;
            }

            // Inverser l'angle verticalement
            this.pong.getData().ballAngle = 360 - this.pong.getData().ballAngle;
        }
    }

    ballComputeCollisionPaddle2()
    {
        const isCollision2 = this.detecterCollision(
            this.pong.getData().paddle2.x, this.pong.getData().paddle2.y, 
            this.pong.getData().paddle2.width, this.pong.getData().paddle2.height,
            this.pong.getData().ball.x, this.pong.getData().ball.y, 
            this.pong.getData().ball.width, 
            5,
        ); 

        if (isCollision2)
        {
            // console.log("Collision détectée !",  
            //     this.pong.getData().ball.x, this.pong.getData().ball.y,
            //     this.pong.getData().paddle2.x, this.pong.getData().paddle2.y, 
            // );

            // Générer une variation aléatoire d'angle
            let angleVariation = (Math.random() - 0.5) * 20; // Variation aléatoire entre -10 et 10 degrés

            // Ajouter cette variation à l'angle de réflexion
            this.pong.getData().ballAngle += angleVariation;

            // Si la balle touche le paddle, inverser l'angle horizontalement
            // Inverser l'angle horizontalement (par exemple, si la balle se déplace vers la gauche, elle doit se diriger vers la droite après la collision)
            if (this.pong.getData().ball.x < this.pong.getData().paddle2.x + this.pong.getData().paddle2.width / 2) {
                // Inverser l'angle horizontalement vers la droite
                this.pong.getData().ballAngle = 180 - this.pong.getData().ballAngle;
            } else {
                // Inverser l'angle horizontalement vers la gauche
                this.pong.getData().ballAngle = 180 + 180 - this.pong.getData().ballAngle;
            }

            // Inverser l'angle verticalement
            this.pong.getData().ballAngle = 360 - this.pong.getData().ballAngle;
        }
    }
}