const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// resizing canvas
function resize(){ 
    let scale = window.innerWidth / canvas.width;
    if(window.innerHeight / canvas.height < window.innerWidth / canvas.width){
        scale = window.innerHeight / canvas.height;
    }

    canvas.style.transform = `scale(${scale})`;
    canvas.style.left = (window.innerWidth - canvas.width) / 2 + "px";
    canvas.style.top =  (window.innerHeight - canvas.height) / 2 +"px";

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

function render(){
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.globalAlpha = 0.01;
    ctx.fillStyle = '#006db7';
    for(let i = 0; i < points.length; i++){
        ctx.beginPath();
        ctx.arc(XToScreen(points[i].x) + canvas.width / 2, YToScreen(points[i].y) + canvas.height / 2, 18/*12*/, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
    
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3;
    for(let i = 0; i < GA.populationA.length; i++){
        let p = GA.populationA[i];
        ctx.strokeStyle = '#ad9efb';
        ctx.beginPath();
        ctx.ellipse(XToScreen(p.x) + canvas.width / 2, YToScreen(p.y) + canvas.height / 2, XToScreen(p.radiusX), YToScreen(p.radiusY), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();

        p = GA.populationB[i];
        ctx.strokeStyle = '#fb9e9e';
        ctx.beginPath();
        ctx.ellipse(XToScreen(p.x) + canvas.width / 2, YToScreen(p.y) + canvas.height / 2, XToScreen(p.radiusX), YToScreen(p.radiusY), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
    }

    ctx.globalAlpha = 1;
}

function XToScreen(x){
    return x / 30 * canvas.width;
}

function YToScreen(y){
    return y / 30 * canvas.height;
}

const points = [];
for(let i = 0; i < gaiaData[0].length; i++){
    points.push({
        x: gaiaData[0][i],
        y: gaiaData[1][i]
    });
}
const GA = new GeneticAlgorithmn(points);

(function run(){
    GA.runGeneration();
    render();
    requestAnimationFrame(run);
})();