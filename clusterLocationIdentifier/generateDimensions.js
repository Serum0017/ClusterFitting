const gaiaData = [[],[]];
for(let i = 0; i < importedData.length; i++){
    const {color, magnitude} = importedData[i];
    gaiaData[0].push(color);
    gaiaData[1].push(magnitude);
}

let maxX = -Infinity, maxY = -Infinity, minX = Infinity, minY = Infinity;
function XToScreen(x){
    return ((x - minX) / (maxX - minX) - 0.5) * canvas.width;
}

function ScreenToX(s){
    return (s / canvas.width + 0.5) * (maxX - minX) + minX;
}

// just for scaling something to a magnitude, without an offset. Used for ellipse radii
function XToMag(x){
    return x / (maxX - minX) * canvas.width;
}

function YToScreen(y){
    return ((y - minY) / (maxY - minY) - 0.5) * canvas.height;
}

function ScreenToY(s){
    return (s / canvas.height + 0.5) * (maxY - minY) + minY;
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

// this just makes it look better because of the y axis
maxY *= 1.1;

window.spatialHashSettings = {
    totalHashDistanceX: Math.abs(maxX - minX),
    totalHashDistanceY: Math.abs(maxY - minY),
}
window.spatialHashSettings.hashDistanceX = window.spatialHashSettings.totalHashDistanceX / 20;// 400 cells
window.spatialHashSettings.hashDistanceY = window.spatialHashSettings.totalHashDistanceY / 20;// 400 cells