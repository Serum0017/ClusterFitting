const gaiaData = [[],[]];
importedData = importedData.split('\n');
for(let i = 0; i < importedData.length; i++){
    importedData[i] = importedData[i].split(',');
}

const pmOval = {
    ra_mid: (pmcuts.ra.min + pmcuts.ra.max) / 2,
    dec_mid: (pmcuts.dec.min + pmcuts.dec.max) / 2,
    ra_radius: Math.abs(pmcuts.ra.min - pmcuts.ra.max) / 2,
    dec_radius: Math.abs(pmcuts.dec.min - pmcuts.dec.max) / 2,
}

for(let i = 0; i < importedData.length; i++){
    // let [color, magnitude, _ , _2 ] = importedData[i];
    let [id,ra,dec,distance,pm_ra,pm_dec,BP,BP_error,G,G_error,RP,RP_error] = importedData[i];
    // color = parseFloat(color);
    const rp = parseFloat(RP);
    if(Number.isFinite(rp) === false) continue;
    const bp_rp = parseFloat(BP)-rp;
    if(Number.isFinite(bp_rp) === false) continue;

    pm_ra = parseFloat(pm_ra);
    pm_dec = parseFloat(pm_dec);
    if(Number.isFinite(pm_ra) === false) continue;
    
    // making the cuts in an oval shape
    if((pm_ra - pmOval.ra_mid) ** 2 / pmOval.ra_radius + (pm_dec - pmOval.dec_mid) ** 2 / pmOval.dec_radius > 1) continue;

    gaiaData[0].push(bp_rp);
    gaiaData[1].push(rp);

    // console.log({color, magnitude});
    // const {color, magnitude} = importedData[i];
    // gaiaData[0].push(color);
    // gaiaData[1].push(magnitude);

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