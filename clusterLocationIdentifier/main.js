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

    ptx.globalAlpha = 0.01;
    ptx.fillStyle = '#006db7';
    for(let i = 0; i < points.length; i++){
        ptx.beginPath();
        ptx.arc(XToScreen(points[i].x) + canvas.width / 2, YToScreen(points[i].y) + canvas.height / 2, 18/*12*/, 0, Math.PI * 2);
        ptx.fill();
        ptx.closePath();
    }
}

function render(){
    ctx.clearRect(0,0,canvas.width, canvas.height);
    
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3;
    for(let i = 0; i < GA.populationA.length; i++){
        let p = GA.populationA[i];
        ctx.strokeStyle = '#ad9efb';
        ctx.beginPath();
        ctx.ellipse(XToScreen(p.x) + canvas.width / 2, YToScreen(p.y) + canvas.height / 2, XToMag(p.radiusX), YToMag(p.radiusY), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();

        p = GA.populationB[i];
        ctx.strokeStyle = '#fb9e9e';
        ctx.beginPath();
        ctx.ellipse(XToScreen(p.x) + canvas.width / 2, YToScreen(p.y) + canvas.height / 2, XToMag(p.radiusX), YToMag(p.radiusY), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
    }

    ctx.globalAlpha = 1;
}

let maxX = -Infinity, maxY = -Infinity, minX = Infinity, minY = Infinity;
function XToScreen(x){
    return ((x - minX) / (maxX - minX) - 0.5) * canvas.width;
}

// just for scaling something to a magnitude, without an offset. Used for ellipse radii
function XToMag(x){
    return x / (maxX - minX) * canvas.width;
}

function YToScreen(y){
    return ((y - minY) / (maxY - minY) - 0.5) * canvas.height;
}

function YToMag(y){
    return y / (maxY - minY) * canvas.height;
}

const points = [];
for(let i = 0; i < gaiaData[0].length; i++){
    points.push({
        x: gaiaData[0][i],
        y: gaiaData[1][i]
    });
    const pt = points[points.length-1];
    if(pt.x < minX) minX = pt.x;
    if(pt.x > maxX) maxX = pt.x;
    if(pt.y < minY) minY = pt.y;
    if(pt.y > maxY) maxY = pt.y;
}

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