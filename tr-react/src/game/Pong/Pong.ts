import { PongComputation } from './PongComputation'
import { PongDraw } from './PongDraw'

export class Pong
{
    element: any = null

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

    isScrollDisabled: boolean = false

    computation: PongComputation | null = null;
    draw: PongDraw | null = null;

    keysPressed: { [key: string]: boolean } = {};

    onUpdate: any = null
    onServerPlayerMovement: any = null

    constructor(data: any)
    {
        this.element = data.element

        this.onUpdate = data.onUpdate
        this.onServerPlayerMovement = data.onServerPlayerMovement

        this.reset()

        this.computation = new PongComputation(this)
        
        this.draw = new PongDraw(
            this.element,
            this, 
            this.computation,
            this.onUpdate,
        )

        window.addEventListener('keydown', (event: any) => this.handleKeyDown(event));
        window.addEventListener('keyup', (event: any) => this.handleKeyUp(event));
        this.element.addEventListener('click', () => {
            this.handleScroll(!this.isScrollDisabled); 
        });
    }

    getData()
    {
        return this.data
    }

    setData(data: any)
    {
        this.data = data
    }

    reset()
    {
        this.data.scene.width = this.element.clientWidth
        this.data.scene.height = this.element.clientHeight
        
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
            max: 4,
        }
    }

    handleKeyDown(event: KeyboardEvent) 
    {
        this.keysPressed[event.key] = true;
        //this.updatePaddleMovement(); // offline 
        this.serverPlayerMovement() // server mode
    }

    handleKeyUp(event: KeyboardEvent) 
    {
        delete this.keysPressed[event.key];
    }

    handleScroll(isDisable: boolean) {
        if (isDisable) {
            this.element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        this.isScrollDisabled = isDisable;
    }

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

    updatePaddleMovement() 
    {
        const gap = 20;
        console.log('data ...', this.data)
    
        // Déplacement du paddle 1 (avec les touches 'w' et 's')
        if (this.data.isPlayer1Ready)
        {
            if ('w' in this.keysPressed && this.data.paddle1.y > 10) {
                this.movePaddle1(0, -gap); // Déplacer vers le haut
            }
            if ('s' in this.keysPressed && this.data.paddle1.y < this.data.scene.height - 10 - this.data.paddle1.height) {
                this.movePaddle1(0, gap); // Déplacer vers le bas
            }
        }
        
        // Déplacement du paddle 2 (avec les touches 'ArrowUp' et 'ArrowDown')
        if(this.data.isPlayer2Ready)
        {
            if ('ArrowUp' in this.keysPressed && this.data.paddle2.y > 10) {
                this.movePaddle2(0, -gap); // Déplacer vers le haut
            }
            if ('ArrowDown' in this.keysPressed && this.data.paddle2.y < this.data.scene.height  - 10 - this.data.paddle2.height) {
                this.movePaddle2(0, gap); // Déplacer vers le bas
            }
        }
    }

    setLevel(level: any)
    {
        this.data.ballSpeed = level
    }

    start()
    {
        if (this.draw && !this.draw.isStarted)
        {
            console.log('Pong start ...', this.data)

            if (!this.data.isReady)
            {
                if(this.onUpdate)
                {
                    this.onUpdate({
                        data: this.data,
                        ball_out: null,
                    })
                }
                return ;
            }
            this.handleScroll(true)
            this.reset()
            this.draw.start()
        }
    }

    end()
    {
        if (this.draw)
        {
            console.log('Pong end ...')
            this.handleScroll(false)
            this.draw.stop()
            this.data.isEnd = true
        }
    }

    clear()
    {
        if (this.draw)
        {
            this.handleScroll(false)
            this.reset()
            this.draw.serverDraw()
        }
    }

    // server mode
    serverStart(data: any)
    {    
        if (this.draw && data)
        {
            if (data.isEnd)
                console.log('end ...')
            this.handleScroll(!data.isEnd)
            this.setData(data)
            // maybe update data for the client screen (%)
            this.draw.serverDraw()
        }
    }

    serverPlayerMovement()
    {
    
        let data = { }
        // Déplacement du paddle 1 (avec les touches 'w' et 's')
        if (this.data.isPlayer1Ready)
        {
            if ('w' in this.keysPressed)
            {
                data = {
                    ...data,
                    player1: {
                        up: true
                    }
                }
            }
            if ('s' in this.keysPressed) 
            {
                data = {
                    ...data,
                    player1: {
                        down: true
                    }
                }
            }
        }
        
        // Déplacement du paddle 2 (avec les touches 'ArrowUp' et 'ArrowDown')
        if(this.data.isPlayer2Ready)
        {
            if ('ArrowUp' in this.keysPressed) 
            {
                data = {
                    ...data,
                    player2: {
                        up: true
                    }
                }
            }
            if ('ArrowDown' in this.keysPressed) 
            {
                data = {
                    ...data,
                    player2: {
                        down: true
                    }
                }
            }
        }

        if (this.onServerPlayerMovement)
            this.onServerPlayerMovement(data)
    }
}