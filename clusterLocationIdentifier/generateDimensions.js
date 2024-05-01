const gaiaData = [[],[]];
importedData = importedData.split('\n');
for(let i = 0; i < importedData.length; i++){
    importedData[i] = importedData[i].split(',');
}

// const pmOval = {
//     ra_mid: (pmcuts.ra.min + pmcuts.ra.max) / 2,
//     dec_mid: (pmcuts.dec.min + pmcuts.dec.max) / 2,
//     ra_radius: Math.abs(pmcuts.ra.min - pmcuts.ra.max) / 2,
//     dec_radius: Math.abs(pmcuts.dec.min - pmcuts.dec.max) / 2,
// }

for(let i = 0; i < importedData.length; i++){
    let [x, y, _ , _2 ] = importedData[i];
    x = parseFloat(x);
    if(Number.isFinite(x) === false) continue;
    y = parseFloat(y);

    // DISPLAYING ISOCHRONE TEMP
    // _ = parseFloat(_);
    // if(Number.isFinite(_) === false) continue;
    // _2 = parseFloat(_2);

    // let [id,ra,dec,distance,pm_ra,pm_dec,BP,BP_error,G,G_error,RP,RP_error] = importedData[i];
    // const rp = parseFloat(RP);
    // if(Number.isFinite(rp) === false) continue;
    // const bp_rp = parseFloat(BP)-rp;
    // if(Number.isFinite(bp_rp) === false) continue;

    // pm_ra = parseFloat(pm_ra);
    // pm_dec = parseFloat(pm_dec);
    // if(Number.isFinite(pm_ra) === false) continue;
    
    // // making the cuts in an oval shape
    // if((pm_ra - pmOval.ra_mid) ** 2 / pmOval.ra_radius + (pm_dec - pmOval.dec_mid) ** 2 / pmOval.dec_radius > 1) continue;

    // gaiaData[0].push(bp_rp);
    // gaiaData[1].push(rp);

    // console.log({color, magnitude});
    // const {color, magnitude} = importedData[i];
    gaiaData[0].push(x);
    gaiaData[1].push(y);// TODO: axis labels

    // to see isochrone points
    // gaiaData[0].push(parseFloat(_));
    // gaiaData[1].push(parseFloat(_2));
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

let points = [];
for(let i = 0; i < gaiaData[0].length; i++){
    points.push({
        x: gaiaData[0][i],
        y: gaiaData[1][i],
        emphasis: 1
    });
    const pt = points[points.length-1];
    if(pt.x < minX) minX = pt.x;
    if(pt.x > maxX) maxX = pt.x;
    if(pt.y < minY) minY = pt.y;
    if(pt.y > maxY) maxY = pt.y;
}

// outlier removal
// divide the isochrone points into 10 bins
// const num_bins = 10;
// const bins = new Array(num_bins).fill([]);
// for(let i = 0; i < points.length; i++){
//     const binNum = Math.floor((points[i].x - minX) / (maxX - minX) * num_bins);
//     bins[Math.min(binNum,num_bins-1)].push(points[i]);
// }

// // filter within 30 stddev and then within 6
// for(let i = 0; i < bins.length; i++){
//     let [m, b, stdDev] = calculateLine(bins[i]);
//     for(let j = 0; j < bins[i].length; j++){
//         if(isInsideStddev(m,b,stdDev,bins[i][j],30) === false){
//             bins[i][j].dead = true;
//         }
//     }
//     bins[i] = bins[i].filter(p => p.dead !== true);

//     [m, b, stdDev] = calculateLine(bins[i]);
//     for(let j = 0; j < bins[i].length; j++){
//         if(isInsideStddev(m,b,stdDev,bins[i][j],6) === false){
//             bins[i][j].dead = true;
//         }
//     }
// }

// points = points.filter(p => p.dead !== true);

// // for the sp hash optimization
// for(let i = 0; i < points.length; i++){
//     points[i].ind = i;
// }

function calculateLine(pts){
    let meanX = 0;
    let meanY = 0;
    for(let j = 0; j < pts.length; j++){
        const pt = pts[j];
        meanX += pt.x;
        meanY += pt.y;
    }
    meanX /= pts.length;
    meanY /= pts.length;
    let numerator = 0;
    let denominator = 0;
    for(let j = 0; j < pts.length; j++){
        const pt = pts[j];
        numerator += (pt.x - meanX) * (pt.y - meanY);
        denominator += (pt.x - meanX) ** 2;
    }
    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;
    const stdDev = Math.sqrt(denominator / pts.length);

    return [slope, intercept, stdDev];
}

function isInsideStddev(m,b,stdDev,{x,y},sigma){
    return Math.abs(y - (m * x + b)) < stdDev * sigma;
}

// repurposing the stddev calculation code to EMPHASIZE red giants instead of remove them
// outlier removal
// divide the isochrone points into 10 bins
const num_bins = 10;
const bins = new Array(num_bins).fill([]);
for(let i = 0; i < points.length; i++){
    const binNum = Math.floor((points[i].x - minX) / (maxX - minX) * num_bins);
    bins[Math.min(binNum,num_bins-1)].push(points[i]);
}

// filter within 30 stddev and then within 6
for(let i = 0; i < bins.length; i++){
    let [m, b, stdDev] = calculateLine(bins[i]);
    for(let j = 0; j < bins[i].length; j++){
        if(isInsideStddev(m,b,stdDev,bins[i][j],6) === false){
            bins[i][j].emphasis = 10;
        }
    }
}


// this just makes it look better because of the y axis
maxY *= 1.1;

minX -= 2;
maxX += 2;
minY -= 2;
maxY += 2;

window.spatialHashSettings = {
    totalHashDistanceX: Math.abs(maxX - minX),
    totalHashDistanceY: Math.abs(maxY - minY),
}
window.spatialHashSettings.hashDistanceX = window.spatialHashSettings.totalHashDistanceX / 20;// 400 cells
window.spatialHashSettings.hashDistanceY = window.spatialHashSettings.totalHashDistanceY / 20;// 400 cells