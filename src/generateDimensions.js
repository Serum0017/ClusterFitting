const starPointData = [[],[]];
importedData = importedData.split('\n');
for(let i = 0; i < importedData.length; i++){
    importedData[i] = importedData[i].split(',');
}

for(let i = 0; i < importedData.length; i++){
    let [x, y, _ , _2 ] = importedData[i];
    x = parseFloat(x);
    if(Number.isFinite(x) === false) continue;
    y = parseFloat(y);

    starPointData[0].push(x);
    starPointData[1].push(y);

    // Test that includes isochrone points as well
    // starPointData[0].push(parseFloat(_));
    // starPointData[1].push(parseFloat(_2));
}

let maxX = -Infinity, maxY = -Infinity, minX = Infinity, minY = Infinity;
function XToScreen(x){
    return ((x - minX) / (maxX - minX) - 0.5) * canvas.width;
}

// useful for debugging purposes
function ScreenToX(s){
    return (s / canvas.width + 0.5) * (maxX - minX) + minX;
}

function YToScreen(y){
    return ((y - minY) / (maxY - minY) - 0.5) * canvas.height;
}

// useful for debugging purposes
function ScreenToY(s){
    return (s / canvas.height + 0.5) * (maxY - minY) + minY;
}

let points = [];
for(let i = 0; i < starPointData[0].length; i++){
    points.push({
        x: starPointData[0][i],
        y: starPointData[1][i],
    });
    const pt = points[points.length-1];
    if(pt.x < minX) minX = pt.x;
    if(pt.x > maxX) maxX = pt.x;
    if(pt.y < minY) minY = pt.y;
    if(pt.y > maxY) maxY = pt.y;
}
