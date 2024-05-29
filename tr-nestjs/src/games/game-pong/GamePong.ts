import { GamePongComputation } from './GamePongComputation'

export class GamePong
{
    __SCENE_WIDTH__: any = 600
    __SCENE_HEIGHT__: any = 400

    data = {
        scene: {
            x: 0, 
            y: 0,
            width: 0,
            height: 0,
        },
        paddle1: {
            x: 0, 
            y: 0,
            width: 0,
            height: 0,
        },
        paddle2: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        },
        ball: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        },
        ballSpeed: 4,
        ballAngle: 0,
        ballIsOut: true,
        ballOut: {
            isLeft: false,
            isRight: false,
        },
        isEnd: false,
        isPlayer1Ready: false,
        isPlayer2Ready: false,
        isReady: false,
        isStopped: false,
        score: {
            player_1: 0,
            player_2: 0,
            max: 2,
        }
    }

    gameLoop: any = null
    gameFPS: any = 65

    computation: GamePongComputation = null

    onUpdate: any = null

    constructor(data: {options: any, onUpdate: any})
    {
        this.reset()
        if (data.options)
        {   
            this.data.ballSpeed = data.options.ballSpeed ? data.options.ballSpeed : 5 
            this.data.score.max = data.options.score.max ? this.data.score.max : 2
            this.data.isPlayer2Ready = data.options.isPlayer2Ready
        }
        this.onUpdate = data.onUpdate
        this.computation = new GamePongComputation(this)
    }

    getData()
    {
        return this.data
    }

    setData(data: any)
    {
        this.data = data
    }

    setDataPlayer1(data: any)
    {
        if (!data)
            return
        this.data = {
            ...this.data,
            paddle1: data.paddle1 ? data.paddle1 : this.data.paddle1,
            isPlayer1Ready: data.isPlayer1Ready !== undefined ? data.isPlayer1Ready : this.data.isPlayer1Ready,
        }
    }

    setDataPlayer2(data: any)
    {
        if (!data)
            return
        this.data = {
            ...this.data,
            paddle2: data.paddle2 ? data.paddle2 : this.data.paddle2,
            isPlayer2Ready: data.isPlayer2Ready !== undefined ? data.isPlayer2Ready : this.data.isPlayer2Ready,
        }
    }

    reset()
    {
        this.data.scene.width = this.__SCENE_WIDTH__
        this.data.scene.height = this.__SCENE_HEIGHT__

        // compute with media query
        this.data.paddle1.width = 30
        this.data.paddle1.height = 100
        this.data.paddle1.x = 100
        this.data.paddle1.y = (this.data.scene.height - this.data.paddle1.height) / 2

        // compute with media query
        this.data.paddle2.width = 30
        this.data.paddle2.height = 100
        this.data.paddle2.x = this.data.scene.width - 100 - this.data.paddle2.width
        this.data.paddle2.y = (this.data.scene.height - this.data.paddle2.height) / 2

        // compute with media query
        this.data.ball.width = 30
        this.data.ball.height = 30
        this.data.ball.x = (this.data.scene.width - this.data.ball.width) / 2
        this.data.ball.y = (this.data.scene.height - this.data.ball.height) / 2

        this.data.ballAngle = 0
        this.data.isEnd = false
        this.data.isReady = false

        this.data.score = {
            player_1: 0,
            player_2: 0,
            max: 2,
        }
    }

    start()
    {
        if (
            this.data.isPlayer1Ready 
            && this.data.isPlayer2Ready
        )
        {
            this.data.isReady = true
        }

        // tmp
        //this.data.isReady = true

        if (this.data.isStopped)
            this.data.isStopped = false

        if (this.data.isReady && !this.gameLoop)
        {
            this.gameLoop = setInterval(() => {
                if (this.data.isEnd || this.data.isStopped)
                {
                    this.stop()
                    if (this.onUpdate)
                        this.onUpdate(this.data)
                }
                else 
                {
                    this.data.ballOut = this.computation.ballCompute()
                    if (this.data.ballOut.isLeft)
                        this.data.score.player_2 += 1
                    else if (this.data.ballOut.isRight)
                        this.data.score.player_1 += 1
                    if (
                        this.data.score.player_1 === this.data.score.max
                        || this.data.score.player_2 === this.data.score.max
                    )
                        this.data.isEnd = true

                    if (this.onUpdate)
                        this.onUpdate(this.data)
                    //this.stop()
                }
              }, this.gameFPS)
            return true
        }
        return false
    }

    stop()
    {
        if (this.gameLoop)
        {
            this.data.isStopped = true
            clearInterval(this.gameLoop)
            this.gameLoop = null
        }
    }

    // paddles

    movePaddle1(dx: number, dy: number) {
        const nextPaddleX = this.data.paddle1.x + dx;
        const nextPaddleY = this.data.paddle1.y + dy;
    
        // Vérifier si le déplacement entraînerait une collision avec la balle
        const isCollision = this.computation?.detecterCollision(
            nextPaddleX, nextPaddleY,
            this.data.paddle1.width, this.data.paddle1.height,
            this.data.ball.x, this.data.ball.y,
            this.data.ball.width,
            5
        );
    
        // Si une collision est détectée, ne pas effectuer le déplacement
        if (isCollision) {
            return;
        }
    
        // Déplacer le paddle
        this.data.paddle1.x = nextPaddleX;
        this.data.paddle1.y = nextPaddleY;
    }
    
    movePaddle2(dx: number, dy: number) 
    {
        const nextPaddleX = this.data.paddle2.x + dx;
        const nextPaddleY = this.data.paddle2.y + dy;
    
        // Vérifier si le déplacement entraînerait une collision avec la balle
        const isCollision = this.computation?.detecterCollision(
            nextPaddleX, 
            nextPaddleY,
            this.data.paddle2.width, 
            this.data.paddle2.height,
            this.data.ball.x, 
            this.data.ball.y,
            this.data.ball.width,
            5
        );
    
        // Si une PongComputation.js:201:21 collision est détectée, ne pas effectuer le déplacement
        if (isCollision) {
            return;
        }
    
        // Déplacer le paddle
        this.data.paddle2.x = nextPaddleX;
        this.data.paddle2.y = nextPaddleY;
    }

    tryPaddleMovement(data: any) 
    {
        const gap = 20;
    
        if (data && data.player1)
        {
            if (data.player1.up && this.data.paddle1.y > 10)
                this.movePaddle1(0, -gap); // Déplacer vers le haut
            if (data.player1.down && this.data.paddle1.y < this.data.scene.height - 10 - this.data.paddle1.height)
                this.movePaddle1(0, gap); // Déplacer vers le bas
        }
        
        // Déplacement du paddle 2 (avec les touches 'ArrowUp' et 'ArrowDown')
        if(data && data.player2)
        {
            if (data.player2.up && this.data.paddle2.y > 10)
                this.movePaddle2(0, -gap); // Déplacer vers le haut
            if (data.player2.down && this.data.paddle2.y < this.data.scene.height  - 10 - this.data.paddle2.height)
                this.movePaddle2(0, gap); // Déplacer vers le bas
        }
    }
}