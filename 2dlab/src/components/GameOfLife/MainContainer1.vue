<script setup>
    import { Application, Ticker, Container, Sprite, Texture} from 'pixi.js';
</script>

<template>
    <div id="pixi-container"></div>
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
            width: 500,
            height: 500,
            particuleWidth: 10,
            particuleHeight: 10,
            tick: 0,
            grid: [],
            newGrid: [],
            sprites: [],
            isSpriteCreated: false
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
            var newGrid = []
            for (let x in this.grid){
                newGrid[x] = []
                for (let y in this.grid[x]){
                    var sumAlive = this.countAliveNeighboor(x, y)
                    var newValue = false
                    if (this.grid[x][y].value){
                        if (sumAlive===2){newValue = true}
                        if (sumAlive===3){newValue = true}
                    }
                    else {
                        if (sumAlive===3){newValue = true}
                    }
                    newGrid[x][y] = {value: newValue}
                    this.sprites[x][y].renderable = newValue
                }
            }
            this.grid = newGrid
        },
        countAliveNeighboor(x, y){
            let nbAliveNeighboor = 0
            let previousX = x - 1
            if (previousX<0){previousX=this.grid.length-1}
            let previousY = y - 1
            if (previousY<0){previousY=this.grid[x].length-1}

            let nextX = parseInt(x)+1
            if (nextX>this.grid.length-1){nextX=0}
            let nextY = parseInt(y)+1

            if (nextY>this.grid[x].length-1){nextY=0}
            
            if (this.grid[previousX][previousY].value){
                nbAliveNeighboor++
            }
            if (this.grid[previousX][y].value){
                nbAliveNeighboor++
            }
            if (this.grid[previousX][nextY].value){
                nbAliveNeighboor++
            }

            if (this.grid[x][previousY].value){
                nbAliveNeighboor++
            }
            if (this.grid[x][nextY].value){
                nbAliveNeighboor++
            }

            if (this.grid[nextX][previousY].value){
                nbAliveNeighboor++
            }
            if (this.grid[nextX][y].value){
                nbAliveNeighboor++
            }
            if (this.grid[nextX][nextY].value){
                nbAliveNeighboor++
            }
            
            return nbAliveNeighboor
        },
        clickContainer(e){
            console.log(e)
            const x = 0
            const y = 0
            this.sprites[x][y].renderable = true
            this.grid[x][y] = true
        },
    }
}
</script>
