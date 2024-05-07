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

// function calculateLine(pts){
//     let meanX = 0;
//     let meanY = 0;
//     for(let j = 0; j < pts.length; j++){
//         const pt = pts[j];
//         meanX += pt.x;
//         meanY += pt.y;
//     }
//     meanX /= pts.length;
//     meanY /= pts.length;
//     let numerator = 0;
//     let denominator = 0;
//     for(let j = 0; j < pts.length; j++){
//         const pt = pts[j];
//         numerator += (pt.x - meanX) * (pt.y - meanY);
//         denominator += (pt.x - meanX) ** 2;
//     }
//     const slope = numerator / denominator;
//     const intercept = meanY - slope * meanX;
//     const stdDev = Math.sqrt(denominator / pts.length);

//     return [slope, intercept, stdDev];
// }

// function isInsideStddev(m,b,stdDev,{x,y},sigma){
//     return Math.abs(y - (m * x + b)) < stdDev * sigma;
// }

// // outlier removal
// // divide the isochrone points into 10 bins
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
//         if(isInsideStddev(m,b,stdDev,bins[i][j],6) === false){
//             bins[i][j].emphasis = 10;
//         }
//     }
// }