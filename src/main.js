const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const pointsCanvas = document.getElementById('pointsCanvas');
const ptx = pointsCanvas.getContext('2d');

function resize(){ 
    let scale = window.innerWidth / canvas.width;
    if(window.innerHeight / canvas.height < window.innerWidth / canvas.width){
        scale = window.innerHeight / canvas.height;
    }

    pointsCanvas.style.transform = canvas.style.transform = `scale(${scale})`;
    pointsCanvas.style.left = canvas.style.left = (window.innerWidth - canvas.width) / 2 + "px";
    pointsCanvas.style.top = canvas.style.top =  (window.innerHeight - canvas.height) / 2 +"px";

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    window.canvasDimensions = canvas.getBoundingClientRect();
}
window.addEventListener("resize", resize);
resize();

function renderPoints(){
    ptx.fillStyle = 'white';
    ptx.fillRect(0,0,canvas.width,canvas.height);

    ptx.globalAlpha = 1;
    ptx.fillStyle = '#006db7';
    for(let i = 0; i < points.length; i++){
        ptx.beginPath();
        ptx.arc(XToScreen(points[i].x) + canvas.width / 2, YToScreen(points[i].y) + canvas.height / 2, 8/*6*//*18*/, 0, Math.PI * 2);
        ptx.fill();
        ptx.closePath();
    }

    ptx.globalAlpha = 1;

    // axes
    ptx.lineWidth = 5;
    ptx.strokeStyle = 'black';
    const linePadding = 90;
    ptx.lineCap = 'square';

    ptx.beginPath();
    ptx.moveTo(linePadding, linePadding);
    ptx.lineTo(linePadding, canvas.height - linePadding);
    ptx.moveTo(linePadding, canvas.height - linePadding);
    ptx.lineTo(canvas.width - linePadding, canvas.height - linePadding);
    ptx.stroke();
    ptx.closePath();

    ptx.font = "26px Inter";
    ptx.textAlign = 'center';
    ptx.textBaseline = 'middle';
    ptx.fillStyle = 'black';

    const axisSize = 80;
    for(let x = linePadding * 2; x <= canvas.width - linePadding; x += axisSize){
        ptx.beginPath();
        ptx.moveTo(x, canvas.height - linePadding * 1.3);
        ptx.lineTo(x, canvas.height - linePadding * 0.8);
        ptx.stroke();
        ptx.closePath();

        ptx.fillText(interpolate(minX, maxX, x / canvas.width).toFixed(2), x, canvas.height - linePadding * 0.4);
    }

    for(let y = linePadding * 1.1; y <= canvas.height - linePadding; y += axisSize){
        ptx.beginPath();
        ptx.moveTo(linePadding * 1.3, y);
        ptx.lineTo(linePadding * 0.8, y);
        ptx.stroke();
        ptx.closePath();

        ptx.translate(linePadding * 0.4, y);
        // ptx.rotate(Math.PI / 2);
        ptx.fillText(interpolate(minY, maxY, y / canvas.height).toFixed(2), 0, 0);
        // ptx.rotate(-Math.PI / 2);
        ptx.translate(-linePadding * 0.4, -y);
    }

    ptx.font = "32px Inter";
    ptx.translate(canvas.width - linePadding * 0.5, canvas.height - linePadding);
    ptx.rotate(Math.PI / 2);
    ptx.fillText('BP-RP', 0, 0);
    ptx.rotate(-Math.PI / 2);
    ptx.translate(-(canvas.width - linePadding * 0.5), -(canvas.height - linePadding));

    ptx.fillText('RP', linePadding, linePadding * 0.5);

    // triangles
    ptx.beginPath();
    ptx.moveTo(canvas.width - linePadding * 0.8, canvas.height - linePadding);
    ptx.lineTo(canvas.width - linePadding * 1, canvas.height - linePadding * 1.15);
    ptx.lineTo(canvas.width - linePadding * 1, canvas.height - linePadding * 0.85);
    ptx.fill();
    ptx.closePath();

    ptx.beginPath();
    ptx.moveTo(linePadding, linePadding * 0.8);
    ptx.lineTo(linePadding * 1.15, linePadding * 1);
    ptx.lineTo(linePadding * 0.85, linePadding * 1);
    ptx.fill();
    ptx.closePath();
}
function render(){
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    ctx.lineWidth = 2;
    // ctx.globalAlpha = 0.6;
    ctx.strokeStyle = '#fb9e9e';

    ctx.translate(canvas.width / 2, canvas.height / 2);
    for(let i = 0; i < GA.population.length; i++){
        let p = GA.population[i];
        ctx.beginPath();
        ctx.moveTo(XToScreen(p.points[0][0]), YToScreen(p.points[0][1]));
        for(let i = 1; i < p.points.length; i++){
            ctx.lineTo(XToScreen(p.points[i][0]), YToScreen(p.points[i][1]));    
            // point rendering
            // ctx.beginPath();
            // ctx.fillStyle = ctx.strokeStyle;
            // ctx.arc(XToScreen(p.points[i][0]), YToScreen(p.points[i][1]), 4, 0, Math.PI * 2);
            // ctx.fill();
            // ctx.closePath();
        }
        ctx.stroke();
        ctx.closePath();
    }
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    ctx.globalAlpha = 1;
}

function renderGraph(bestFitnesses=[]){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // axes
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'black';
    const linePadding = 90;
    ctx.lineCap = 'square';

    ctx.beginPath();
    ctx.moveTo(linePadding, linePadding);
    ctx.lineTo(linePadding, canvas.height - linePadding);
    ctx.moveTo(linePadding, canvas.height - linePadding);
    ctx.lineTo(canvas.width - linePadding, canvas.height - linePadding);
    ctx.stroke();
    ctx.closePath();

    ctx.font = "26px Inter";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'black';

    const numBins = bestFitnesses.length - 1;

    const axisSize = 80;

    const GOAT = Math.max(...bestFitnesses);
    const WOAT = Math.min(...bestFitnesses);

    let i = 0;
    for(let x = linePadding * 2; x <= canvas.width - linePadding; x += (canvas.width - linePadding * 3) / numBins){
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - linePadding * 1.3);
        ctx.lineTo(x, canvas.height - linePadding * 0.8);
        ctx.stroke();
        ctx.closePath();

        ctx.fillText(i.toString(), x, canvas.height - linePadding * 0.4);
        i++;
    }

    for(let y = canvas.height - linePadding; y >= linePadding * 1.1; y -= axisSize){
        ctx.beginPath();
        ctx.moveTo(linePadding * 1.3, y);
        ctx.lineTo(linePadding * 0.8, y);
        ctx.stroke();
        ctx.closePath();

        ctx.translate(linePadding * 0.4, y);
        // ctx.rotate(Math.PI / 2);
        ctx.fillText(interpolate(WOAT, GOAT, (y - linePadding*1.1) / (canvas.height - linePadding * 2.2)).toFixed(2), 0, 0);
        // ctx.rotate(-Math.PI / 2);
        ctx.translate(-linePadding * 0.4, -y);
    }

    i = 0;
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    const ratio0 = (bestFitnesses[0] - WOAT) / (GOAT - WOAT);
    const y0 = linePadding * 1.1 + (1-ratio0) * (canvas.height - linePadding * 2.2);
    ctx.moveTo(linePadding * 2, y0);
    for(let x = linePadding * 2; x <= canvas.width - linePadding; x += (canvas.width - linePadding * 3) / numBins){
        const fitness = bestFitnesses[i];
        const ratio = (fitness - WOAT) / (GOAT - WOAT);
        const y = linePadding * 1.1 + (1-ratio) * (canvas.height - linePadding * 2.2);
        ctx.lineTo(x, y);
        i++;
    }
    ctx.stroke();
    ctx.closePath();

    ctx.fillStyle = 'black';

    ctx.translate(canvas.width - linePadding * 0.5, canvas.height - linePadding);
    ctx.rotate(Math.PI / 2);
    ctx.fillText('Trial #', 0, 0);
    ctx.rotate(-Math.PI / 2);
    ctx.translate(-(canvas.width - linePadding * 0.5), -(canvas.height - linePadding));

    ctx.fillText('Max Fitness', linePadding, linePadding * 0.5);

    // triangles
    ctx.beginPath();
    ctx.moveTo(canvas.width - linePadding * 0.8, canvas.height - linePadding);
    ctx.lineTo(canvas.width - linePadding * 1, canvas.height - linePadding * 1.15);
    ctx.lineTo(canvas.width - linePadding * 1, canvas.height - linePadding * 0.85);
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(linePadding, linePadding * 0.8);
    ctx.lineTo(linePadding * 1.15, linePadding * 1);
    ctx.lineTo(linePadding * 0.85, linePadding * 1);
    ctx.fill();
    ctx.closePath();
}

let GA = new GeneticAlgorithmn(points);

// renderPoints();

let running = true;

// slow running loop. Great for visualizations
// function run(){
//     if(running === false) return;
//     GA.runGeneration();
//     render();
//     requestAnimationFrame(run);
// }

// This, along with the commented code starting with if(tick % 8000 === 0 && tick !== 0) runs many trials and alerts the user when a new best one is found.
let GOAT = undefined;
let greatestFitness = -Infinity;
let timesRan = 0;
let bestFitnesses = [];

let tick = 0;
function run(){
    while(true){
        if(running === false) return;
        GA.runGeneration();

        if(tick % 8000 === 0 && tick !== 0){
            const bestData = GA.getBestData();
            const fitness = bestData.bestAgent.fitness;
            timesRan++;
            console.log(timesRan);
            if(fitness > greatestFitness){
                greatestFitness = fitness;
                GOAT = bestData.bestAgent;
                console.log({GOAT});
            }
            GA = new GeneticAlgorithmn(points);
            decay = 1;
            tick = 0;
            bestFitnesses.push(greatestFitness);
            requestAnimationFrame(run);
            return;
        }

        if(tick++ % 1000 === 0){
            // render();
            renderGraph(bestFitnesses);
            requestAnimationFrame(run);
            return;
        }
    }
}

run();

window.onmousedown = (e) => {
    // right click
    if(e.which === 3 || e.button === 2) { 
        GA = new GeneticAlgorithmn(points);
        decay = 1;
        return e.preventDefault();
    }
    running = !running;
    render();
    if(running === true){
        run();
    } else {
        console.log('best fit found:', GA.getBestData());
    }
}

window.oncontextmenu = (e) => {
    return e.preventDefault();
}