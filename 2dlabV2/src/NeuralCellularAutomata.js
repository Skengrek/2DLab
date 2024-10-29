import * as PIXI from 'pixi.js';
const width = 512;
const height = 512;
const gridWidth = 256;
const gridHeight = 256;
const cellSize = width / gridWidth;
const gridSize = gridWidth * gridHeight;
const matrix = Array.from({ length: 3 }, () => Array(3).fill(0));

(async() => {
    const app = new PIXI.Application();
    await app.init({
        // resizeTo: window,
        width: width,
        height: height,
        backgroundAlpha: 0.5,
    });
    // app.canvas.style.position = 'absolute';
    document.body.appendChild(app.canvas);

    const createCellTexture = () => {
        const cellGraphics = new PIXI.Graphics();
        cellGraphics.rect(0, 0, cellSize, cellSize);
        cellGraphics.fill(0x00ff00);
        return app.renderer.generateTexture(cellGraphics);
    };

    const liveTexture = createCellTexture();

    const data = new Uint32Array((gridWidth * gridHeight) / 32);

    const sprites = [];
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const sprite = new PIXI.Sprite(liveTexture);
            sprite.x = x * cellSize;
            sprite.y = y * cellSize;
            app.stage.addChild(sprite);
            sprites.push(sprite);
        }
    }

    const getCell = (x, y) => {
        if (x < 0 || y < 0 || x >= gridWidth || y >= gridHeight) return 0;
        const index = y * gridWidth + x;
        const dataIndex = Math.floor(index / 32);
        const bitPosition = index % 32;
        return (data[dataIndex] & (1 << bitPosition)) !== 0 ? 1 : 0;
    };

    const setCell = (x, y, state) => {
        const index = y * gridWidth + x;
        const dataIndex = Math.floor(index / 32);
        const bitPosition = index % 32;
        if (state) {
            data[dataIndex] |= 1 << bitPosition;
        } else {
            data[dataIndex] &= ~(1 << bitPosition);
        }
    };

    const randomizeGrid = () => {
        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                const state = Math.random() > 0.5;
                setCell(x, y, state);
                sprites[y * gridWidth + x].alpha = state;
            }
        }
    };

    const updateGrid = () => {
        const newGrid = new Uint32Array(data.length);
        for (let y = 0; y < gridHeight; y++) {
            for (let x = 0; x < gridWidth; x++) {
                const index = y * gridWidth + x;
                const currentState = getCell(x, y);

                let nextState = calculateValue(x, y)

                const dataIndex = Math.floor(index / 32);
                const bitPosition = index % 32;
                if (nextState) {
                    newGrid[dataIndex] |= 1 << bitPosition;
                } else {
                    newGrid[dataIndex] &= ~(1 << bitPosition);
                }

                if (nextState !== currentState) {
                    sprites[index].alpha = nextState
                }
            }
        }
        data.set(newGrid);
    };

    const calculateValue = (x, y) => {
        let nextState = 0;
        for (let matrixY = -1; matrixY <= 1; matrixY++) {
            for (let matrixX = -1; matrixX <= 1; matrixX++) {
                // Get the neighbor coordinates
                const neighborX = x + matrixX;
                const neighborY = y + matrixY;
        
                // Get the corresponding matrix value
                const matrixValue = matrix[matrixY + 1][matrixX + 1]; // Adjust for 0-based index
        
                // Multiply the neighbor cell value by the matrix value
                const neighborValue = getCell(neighborX, neighborY);
                nextState += neighborValue * matrixValue;
            }
        }
        return nextState/10
    }

    let running = false;

    const start = () => {
        running = true;
        app.ticker.add(updateGrid);
    };

    const stop = () => {
        running = false;
        app.ticker.remove(updateGrid);
    };

    const resetGrid = () => {
        stop();
        for (let i = 0; i < data.length; i++) data[i] = 0;
        sprites.forEach(sprite => (sprite.texture = deadTexture));
    };

    const randomizeButton = document.createElement('button');
    randomizeButton.innerText = 'Randomize';
    randomizeButton.onclick = () => randomizeGrid();
    document.body.appendChild(randomizeButton);

    const startButton = document.createElement('button');
    startButton.innerText = 'Start';
    startButton.onclick = () => start();
    document.body.appendChild(startButton);

    const stopButton = document.createElement('button');
    stopButton.innerText = 'Stop';
    stopButton.onclick = () => stop();
    document.body.appendChild(stopButton);

    const resetButton = document.createElement('button');
    resetButton.innerText = 'Reset';
    resetButton.onclick = () => resetGrid();
    document.body.appendChild(resetButton);
    randomizeGrid();

    // Create a matrix of input fields
    const createMatrixInputs = () => {
        const matrixContainer = document.createElement('div');
        matrixContainer.style.display = 'grid';
        matrixContainer.style.gridTemplateColumns = 'repeat(3, 50px)'; // 3 columns
        matrixContainer.style.gridGap = '5px';

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                const input = document.createElement('input');
                input.type = 'number';
                input.value = matrix[i][j];
                input.style.width = '50px';

                // Update matrix and redraw when the input value changes
                input.oninput = () => {
                    const newValue = parseFloat(input.value);
                    matrix[i][j] = isNaN(newValue) ? 0 : newValue; // Update the matrix value
                };

                matrixContainer.appendChild(input);
            }
        }

        document.body.appendChild(matrixContainer);
    }
    createMatrixInputs(); // Call to create the input fields
})();