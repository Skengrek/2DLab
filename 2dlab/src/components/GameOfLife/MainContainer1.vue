<script setup>
    import { Application, Ticker, Container, Sprite, Texture} from 'pixi.js';
</script>

<template>
    <div id="pixi-container"></div>
    <div>{{ time }}ms</div>
    <button @click="regeneratGrid">Regenerate</button>
    <button @click="processTick">One Tick</button>
    <button @click="appTicker.start">Start Ticker</button>
    <button @click="appTicker.stop">Stop Ticker</button>
</template>

<script>

export default {
    data() {
        return {
            app: new Application(),
            container: new Container(),
            appTicker: Ticker.shared,
            width: 1000,
            height: 1000,
            particuleWidth: 10,
            particuleHeight: 10,
            time_per_frame:50,
            tick: 0,
            grid: [],
            newGrid: [],
            sprites: [],
            isSpriteCreated: false,
            time: 0,
        }
    },
    async mounted(){
        await this.app.init({ width: this.width, height: this.height})
        this.app.stage.addChild(this.container)
        document.getElementById('pixi-container').appendChild(this.app.canvas);
        this.startUp()
        this.regeneratGrid()
    },
    methods: {
        startUp(){
            this.grid = []
            this.newGrid = []
            this.sprites = []
            for (let x=0; x<this.width/this.particuleWidth;x++){
                this.grid[x] = []
                this.newGrid[x] = []
                this.sprites[x] = []
                for (let y=0; y<this.height/this.particuleHeight; y++){
                    this.grid[x][y] = {value:0}
                    this.newGrid[x][y] = {value:0}
                    const rect = new Sprite(Texture.WHITE)
                    rect.width=this.particuleWidth
                    rect.height=this.particuleHeight
                    rect.x = x*this.particuleWidth
                    rect.y = y*this.particuleHeight
                    this.sprites[x][y] = rect
                    this.container.addChild(rect)
                }
            }

        },
        regeneratGrid(){
            this.initValues()
            this.initTicker()
        },
        initValues(){
            for (let x in this.grid){
                for (let y in this.grid[x]){
                    let value = Math.random() > 0.7
                    this.grid[x][y]={value:value}
                    this.sprites[x][y].renderable = value
                }
            }
        },
        initTicker(){
            this.appTicker.autoStart = false
            this.appTicker.add(this.processTick)
        },
        processTick(){
            const start = performance.now();

            for (let x = 0; x < this.grid.length; x++) {
                for (let y = 0; y < this.grid[x].length; y++) {
                    const sumAlive = this.countAliveNeighbor(x, y);
                    const isAlive = this.grid[x][y].value;
                    const newValue = (isAlive && (sumAlive === 2 || sumAlive === 3)) || (!isAlive && sumAlive === 3);
                    this.newGrid[x][y] = { value: newValue };
                    this.sprites[x][y].renderable = newValue;
                }
            }

            [this.grid, this.newGrid] = [this.newGrid, this.grid]; // Swap references
            this.time = performance.now() - start;
        },
        countAliveNeighbor(x, y){
            const maxX = this.grid.length;
            const maxY = this.grid[0].length;
            let nbAliveNeighbor = 0;

            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    if (dx === 0 && dy === 0) continue;
                    const nx = (x + dx + maxX) % maxX;
                    const ny = (y + dy + maxY) % maxY;
                    if (this.grid[nx][ny].value) nbAliveNeighbor++;
                }
            }

            return nbAliveNeighbor;
        },
    }
}
</script>
