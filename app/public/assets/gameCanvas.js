import { DEFAULT_CONFIG } from './gameEntities.js';
export class GameCanvas {
    constructor(canvasId = 'gameCanvas', config = DEFAULT_CONFIG) {
        this.resizeHandler = null;
        this.canvas = document.getElementById(canvasId);
        this.renderingContext = this.canvas?.getContext('2d') || null;
        this.config = config;
        console.log('GameCanvas initialized');
    }
    // Resize canvas based on viewport size
    resizeCanvas() {
        if (!this.canvas)
            return;
        // Canvas size
        const maxWidth = this.config.canvasWidth; //set this in gameEnteties
        const maxHeight = this.config.canvasHeight; //set this in gameEnteties
        const viewportWidth = window.innerWidth * 0.85;
        const viewportHeight = window.innerHeight * 0.7;
        // keep between min - max
        let width = Math.min(viewportWidth, maxWidth);
        let height = Math.min(viewportHeight, maxHeight);
        const aspectRatio = 2 / 1;
        if (width / height > aspectRatio) {
            width = height * aspectRatio;
        }
        else {
            height = width / aspectRatio;
        }
        this.canvas.width = width;
        this.canvas.height = height;
        console.log(`Canvas resized to: ${this.canvas.width}x${this.canvas.height}`);
        this.clear();
    }
    // Clear entire canvas
    clear() {
        if (!this.renderingContext || !this.canvas)
            return;
        this.renderingContext.fillStyle = '#1a1a1a';
        this.renderingContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    /*
    * Drawing functions inside Canvas
    */
    // Render game screen
    render(state) {
        if (!this.renderingContext || !this.canvas)
            return;
        this.clear();
        this.drawCenterLine();
        this.drawPaddle(state.leftPaddle);
        this.drawPaddle(state.rightPaddle);
        this.drawBall(state.ball);
    }
    // Draw center Line
    drawCenterLine() {
        if (!this.renderingContext || !this.canvas)
            return;
        this.renderingContext.strokeStyle = '#444444';
        this.renderingContext.lineWidth = 2;
        this.renderingContext.setLineDash([10, 10]);
        this.renderingContext.beginPath();
        this.renderingContext.moveTo(this.canvas.width / 2, 0);
        this.renderingContext.lineTo(this.canvas.width / 2, this.canvas.height);
        this.renderingContext.stroke();
        this.renderingContext.setLineDash([]); // Reset
    }
    // draw Paddle
    drawPaddle(paddle) {
        if (!this.renderingContext)
            return;
        this.renderingContext.fillStyle = '#ffffff';
        this.renderingContext.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    }
    // draw Ball
    drawBall(ball) {
        if (!this.renderingContext)
            return;
        this.renderingContext.fillStyle = '#ffffff';
        this.renderingContext.beginPath();
        this.renderingContext.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        this.renderingContext.fill();
    }
    /*
    * Public Helper functions
    */
    // Get canvas size
    getCanvasSize() {
        return {
            width: this.canvas?.width || 0,
            height: this.canvas?.height || 0
        };
    }
    // Show game container
    show() {
        const container = document.getElementById('gameContainer');
        container?.classList.remove('hidden');
        // set initial Canvas Size
        this.resizeCanvas();
        // set the rezise Listener
        this.resizeHandler = () => {
            this.resizeCanvas();
        };
        window.addEventListener('resize', this.resizeHandler);
        console.log('Game canvas visible');
    }
    // Hide game container
    hide() {
        const container = document.getElementById('gameContainer');
        container?.classList.add('hidden');
        // remove resize Listener
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }
        console.log('Game canvas hidden');
    }
}
