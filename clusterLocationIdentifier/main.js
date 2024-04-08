const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const pointsCanvas = document.getElementById('pointsCanvas');
const ptx = pointsCanvas.getContext('2d');

// resizing canvas
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

// for now we'll just generate some dummy sample data. Eventually we'll want to query from gaia
// const points = [];
// // we'll make a pretty obvious cluster
// for(let i = 0; i < 100; i++){
//     if(Math.random() < 0.2){
//         points.push({
//             x: 300 + Math.random() * 200,
//             y: 500 + Math.random() * 100
//         })
//     } else {
//         points.push({
//             x: Math.random() * canvas.width,
//             y: Math.random() * canvas.height
//         })
//     }
// }

function renderPoints(){
    ptx.fillStyle = 'white';
    ptx.fillRect(0,0,canvas.width,canvas.height);

    ptx.globalAlpha = 0.01//0.04;
    ptx.fillStyle = '#006db7';
    for(let i = 0; i < points.length; i++){
        ptx.beginPath();
        ptx.arc(XToScreen(points[i].x) + canvas.width / 2, YToScreen(points[i].y) + canvas.height / 2, 18/*12*/, 0, Math.PI * 2);
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

    ptx.translate(canvas.width - linePadding * 0.5, canvas.height - linePadding);
    ptx.rotate(Math.PI / 2);
    ptx.fillText('Gaia BP-RP color', -linePadding * 0.3, 0);
    ptx.rotate(-Math.PI / 2);
    ptx.translate(-(canvas.width - linePadding * 0.5), -(canvas.height - linePadding));

    ptx.fillText('Gaia G Relative Magnitude', linePadding * 1.8, linePadding * 0.5);

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

    // GA.spatialHash.renderDebug();
}

// let debugX = 0;
// let debugY = 0;
function render(){
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = '#fb9e9e';

    ctx.translate(canvas.width / 2, canvas.height / 2);
    for(let i = 0; i < GA.population.length; i++){
        let p = GA.population[i];
        ctx.beginPath();
        ctx.moveTo(XToScreen(p.points[0][0]), YToScreen(p.points[0][1]));
        for(let i = 1; i < p.points.length; i++){
            ctx.lineTo(XToScreen(p.points[i][0]), YToScreen(p.points[i][1]));
        }
        ctx.stroke();
        ctx.closePath();
    }
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    ctx.globalAlpha = 1;

    // GA.spatialHash.renderPositions();
    // if(debugX !== 0){
    //     ctx.beginPath();
    //     ctx.arc(XToScreen(debugX) + canvas.width / 2, YToScreen(debugY) + canvas.height / 2, 30, 0, Math.PI * 2);
    //     ctx.fill();
    //     ctx.stroke();
    //     ctx.closePath();
    // }
}

// for zooming in 2x
// const avgX = (minX + maxX) / 2;
// const avgY = (minY + maxY) / 2;

// minX = interpolate(minX, avgX, 0.5);
// minY = interpolate(minY, avgY, 0.5);

// maxX = interpolate(maxX, avgX, 0.5);
// maxY = interpolate(maxY, avgY, 0.5);

let GA = new GeneticAlgorithmn(points);

renderPoints();

let running = true;

function run(){
    if(running === false) return;
    GA.runGeneration();
    render();
    requestAnimationFrame(run);
}

run();

window.onmousedown = (e) => {
    // debugX = ScreenToX(e.pageX);
    // debugY = ScreenToY(e.pageY);
    // console.log(debugX, debugY, GA.spatialHash.getNumberOfClose(debugX, debugY, 3));

    // right click
    if(e.which === 3 || e.button === 2) { 
        GA = new GeneticAlgorithmn(points);
        decay = 1;
        return e.preventDefault();
    }
    running = !running;
    if(running === true){
        run();
    } else {
        // export data
        console.log('best fit found:', GA.getBestData());
    }
}

window.oncontextmenu = (e) => {
    return e.preventDefault();
}