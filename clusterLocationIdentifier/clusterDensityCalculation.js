// Not part of the application. Used for verifying that some cuts (whether it be GA or manual) make the surrounding star density equal to the cluster's.
// Run in the developer console.

function calculateDensity({x,y,rx,ry},[distMin,distMax], excludedPts=[]){
    function ovalContains(x,y,rx,ry,pt){
        const difX = pt.x-x;
        const difY = pt.y-y;
        return (difX / rx) ** 2 + (difY / ry) ** 2 <= 1;
    }
    
    let numPtsInside = 0; let ptsInside = [];
    let area = rx * ry;
    for(let i = 0; i < points.length; i++){
        if(ovalContains(x,y,rx,ry,points[i]) && points[i].distance>=distMin && points[i].distance<=distMax && !excludedPts.includes(points[i])){
            numPtsInside++;
            ptsInside.push(points[i]);
        }
    }
    return {density: numPtsInside / area, ptsInside};
}

function boundsToOval(xbounds, ybounds){
    const [min1,max1] = xbounds;
    const [min2,max2] = ybounds;
    return {x: (min1+max1)/2, y: (min2+max2)/2, rx: Math.abs(min1-max1)/2, ry: Math.abs(min2-max2)/2};
}
const bounds = boundsToOval([-0.64,1.15],[-2.93,-1.3]);
const bigBounds = structuredClone(bounds);
bigBounds.rx *= 2; bigBounds.ry *= 2;
let excluded = calculateDensity(bounds,[0.61*1000,0.87*1000]).ptsInside
let normal = calculateDensity(bounds,[-Infinity,Infinity],excluded)
let big = calculateDensity(bigBounds,[-Infinity,Infinity],excluded)
console.log({normal,big});