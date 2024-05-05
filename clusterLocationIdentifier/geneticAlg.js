const SETTINGS = Object.freeze({
    // general
    populationSize: 10,//100,
    selectionGradient: 1,

    // minStartingSize: 10 / 100,
    // maxStartingSize: 20 / 100,
    // SATpoints: 7,
    // // bigSizeAdd: 5,

    // // mutation
    mutationDecay: 0.999,//0.9995,

    // unused
    // spatialHashQueryDist: 1,//2,

    evennessValuePower: 0.8,// 0.03
    densityEmphasisPower: 2,
    
    // travelDistance: 60 / 100,
    // sizeDif: 25 / 100,

    // // local minima prevention
    // bigTravelChance: 0.03,
    // bigTravelDist: 5000 / 100,

    // maxClusterSize: 60 / 100,
    // purpleTravelDistMult: 300 / 100,

    // // how much density vs spread should be weighted. 1 = we only care about density, 10 = we care a lot more about the amount of points within
    // purpleDensityValuePower: 2,
    // redDensityValuePower: 1.3,

    // // exporting
    // clusterSizeAdd: 20

    // historical constraints

    // kpc
    distance: {
        min: 0.22,
        max: 1.18,
        changeRate: 1,
    },

    // years
    logAge: {
        min: 6.6,
        max: 10.15,//10.2,
        changeRate: 2
    },

    // solar units
    metallicity: {
        min: -2.15,
        max: 0.55,
        changeRate: 2,
    },

    // unitless
    "E(B-V)": {
        min: 0,
        max: 1,
        changeRate: 0.9
    },

    bigJumpMult: 10,
    bigJumpChance: 0.05,

    // mag error not included b/c we don't know mag, and
    // it's no use guessing at something that is unhelpful!
})
let decay = 1;

// given a series of points, algorithmically determine the best fit
class GeneticAlgorithmn {
    constructor(points=[{x:0,y:0}]){
        this.points = points;

        this.spatialHash = new SpatialHash(true);
        for(let i = 0; i < this.points.length; i++){
            this.spatialHash.addKeyedPt(this.points[i]);
        }
        // console.log(structuredClone(this.spatialHash.positions));

        // a - purple, b - red
        this.population = new Array(SETTINGS.populationSize);
        for(let i = 0; i < this.population.length; i++){
            this.population[i] = new Guess();
        }

        this.lastBestFitness = 0;
    }
    runGeneration(){
        for(let i = 0; i < this.population.length; i++){
            this.population[i].fitness = this.population[i].calculateFitness(this.spatialHash, this.points);
        }

        // sort in decending order based on fitness
        this.population.sort((a, b) => b.fitness - a.fitness);

        // console.log(this.population.map(p => p.fitness));

        // kill w/ gradient
        // each individual has a chance of dying of rank^2
        // the last individual has a chance of dying of 100%
        const worstScore = (this.population.length - 1) ** 2;
        for(let i = 0; i < this.population.length; i++){
            const killChance = i ** 2 / worstScore;
            if(Math.random() < killChance){
                // kill both for speed
                this.population[i].dead = true;
            }
        }

        this.population = this.population.filter(p => p.dead !== true);

        while(this.population.length < SETTINGS.populationSize){
            // regenerate based on a random parent
            this.population.push(new Guess(this.population[Math.floor(this.population.length * Math.random())] ));
        }

        decay *= SETTINGS.mutationDecay;
    }
    getBestData(){
        const p = this.population;

        let bestFitness = -Infinity;
        let bestIndex = null;
        for(let i = 0; i < p.length; i++){
            if(p[i].fitness === undefined) p[i].fitness = p[i].calculateFitness(this.spatialHash, this.points);
            if(p[i].fitness > bestFitness){
                bestFitness = p[i].fitness;
                bestIndex = i;
            }
        }

        const bestAgent = p[bestIndex];

        if(bestIndex !== null){
            this.spatialHash.renderCellsWith(bestAgent.points);
        }

        const fitnessIncreaseRatioSinceLastTime = bestFitness / this.lastBestFitness;
        this.lastBestFitness = bestFitness;

        return {
            // color: smallestPopulation === this.populationA ? 'purple' : 'red',
            // clusterPoints: pointsIn,
            bestAgent,
            fitnessIncreaseRatioSinceLastTime
        }
    }
}

function clamp(min, max, a){
    if(a < min) return min;
    if(a > max) return max;
    return a;
}

let bigJump = false;
class Guess {
    constructor(parent=undefined){
        if(parent === undefined){
            return new Guess({
                distance: interpolate(SETTINGS.distance.min, SETTINGS.distance.max, Math.random()),
                "E(B-V)": interpolate(SETTINGS["E(B-V)"].min, SETTINGS["E(B-V)"].max, Math.random()),
                logAge: interpolate(SETTINGS.logAge.min, SETTINGS.logAge.max, Math.random()),
                metallicity: interpolate(SETTINGS.metallicity.min, SETTINGS.metallicity.max, Math.random()),
            });
        }

        if(decay !== 0 && Math.random() < SETTINGS.bigJumpChance){
            decay *= SETTINGS.bigJumpMult;
            bigJump = true;
        }

        this.distance = parent.distance + SETTINGS.distance.changeRate * (Math.random()-0.5) * decay;
        this.distance = clamp(SETTINGS.distance.min, SETTINGS.distance.max, this.distance);

        this.logAge = parent.logAge + SETTINGS.logAge.changeRate * (Math.random()-0.5) * decay;
        this.logAge = clamp(SETTINGS.logAge.min, SETTINGS.logAge.max, this.logAge);

        this.metallicity = parent.metallicity + SETTINGS.metallicity.changeRate * (Math.random()-0.5) * decay;
        this.metallicity = clamp(SETTINGS.metallicity.min, SETTINGS.metallicity.max, this.metallicity);

        this["E(B-V)"] = parent["E(B-V)"] + SETTINGS["E(B-V)"].changeRate * (Math.random()-0.5) * decay;
        this["E(B-V)"] = clamp(SETTINGS["E(B-V)"].min, SETTINGS["E(B-V)"].max, this["E(B-V)"]);

        if(bigJump === true){
            decay /= SETTINGS.bigJumpMult;
            bigJump = false;
        }

        // this.logAge = 8.7;
        // this.metallicity = -.15;

        // this.logAge = 7.1;// continue off on https://arxiv.org/pdf/1804.09374.pdf. Probably not useful so i think i'll just pull things from either the astromancer code or puppeteer
        // this.metallicity = 0.6;
        // decay = 0;

        // this.logAge = 9.6;
        // this.metallicity = -2.2;
        // this["E(B-V)"] = 1;
        // this.distance = 1.19;

        // console.log(Math.round(this.logAge * 10) / 10, Math.round(this.metallicity) / 10);

        /*const result =*/
        this.points = generateIsochrone(this.distance, Math.round(this.logAge * 20) / 20, Math.round(this.metallicity * 20) / 20, this["E(B-V)"]);

        // console.log(this.densities);

        // regenerate isochrone if the points dont exist
        // if(this.points.length === 0){
        //     console.log('xd');
        //     const choices = Object.keys(isochroneData[Math.round(this.logAge * 20) / 20]);
        //     this.metallicity = parseFloat(choices[Math.floor(Math.random() * choices.length)]);
        //     this.points = generateIsochrone(this.distance, Math.round(this.logAge * 20) / 20, Math.round(this.metallicity * 20) / 20, this["E(B-V)"]);
        //     // console.log({choices, age: this.logAge, mtl: this.metallicity, pts: this.points});
        // }

        // generate densities

        let prevDist = Math.sqrt((this.points[0][0] - this.points[1][0]) ** 2 + (this.points[0][1] - this.points[1][1]) ** 2);
        this.densities = [];
        for(let i = 1; i < this.points.length-1; i++){
            // const prev = this.points[i-1];
            const next = this.points[i+1];
            const cur = this.points[i];
            const nextDist = Math.sqrt((next[0] - cur[0]) ** 2 + (next[1] - cur[1]) ** 2);
            this.densities[i] = prevDist + nextDist;
            prevDist = nextDist;
        }
        this.densities[0] = this.densities[1];
        this.densities[this.points.length-1] = this.densities[this.points.length-2];
    }
    calculateFitness(spatialHash, points) {
        // TODO: densities?
        // let minDistSqs = new Array(points.length).fill(Infinity);
        // for(let i = 0; i < this.points.length; i++){
        //     const pts = spatialHash.getEntitiesInRadius(this.points[i][0], this.points[i][1], 1);
        //     // if(Math.random() < 0.01) console.log(pts);
        //     for(let j = 0; j < pts.length; j++){
        //         const distSq = (this.points[j][0] - pts[j].x) ** 2 + (this.points[j][1] - pts[j].y) ** 2;
        //         if(distSq < minDistSqs[pts[j].ind]) minDistSqs[pts[j].ind] = distSq;
        //     }
        // }

        // // if(Math.random() < 0.01) console.log(minDistSqs);
        
        // let totalDist = 0;
        // for(let i = 0; i < points.length; i++){
        //     if(minDistSqs[i] !== Infinity){
        //         totalDist += minDistSqs[i];
        //         continue;
        //     }

        //     // very far away point. Spatial hash will be inefficient at detecting it, so just brute force
        //     let minDist = Infinity;
        //     for(let j = 0; j < this.points.length; j++){
        //         const distSq = (this.points[j][0] - points[i].x) ** 2 + (this.points[j][1] - points[i].y) ** 2;
        //         if(distSq < minDist) minDist = distSq;
        //     }
        //     totalDist += minDist;
        // }

        // if(Math.random() < 0.01)console.log(totalDist, minDistSqs);

        // return -totalDist;

        // Old: fitness is just the negative of the distance of every point to the closest neighbor
        let totalDist = 0, t, dx, dy, nearestX, nearestY, distSq;
        for(let i = 0; i < points.length; i++){
            let minDist = Infinity;
            for(let j = 0; j < this.points.length-1; j++){
                // we consider points 2 at a time, i and i+1. This is why we stop the loop 1 short

                // const distSq = (this.points[j][0] - points[i].x) ** 2 + (this.points[j][1] - points[i].y) ** 2;
                dx = this.points[j+1][0] - this.points[j][0];
                dy = this.points[j+1][1] - this.points[j][1];

                // optimization to avoid computing sqrts
                if(Math.abs(dx) > minDist || Math.abs(dy) > minDist) continue;

                t = ((this.points[j][0] - points[i].x) * dx + (this.points[j][1] - points[i].y) * dy) / (dx*dx + dy*dy);

                if(t < 0){
                    nearestX = this.points[j][0];
                    nearestY = this.points[j][1];
                } else if(t > 1){
                    nearestX = this.points[j+1][0];
                    nearestY = this.points[j+1][1];
                } else {
                    nearestX = this.points[j][0] + t * dx;
                    nearestY = this.points[j][0] + t * dy;
                }

                distSq = (points[i].x - nearestX) * (points[i].x - nearestX) + (points[i].y - nearestY) * (points[i].y - nearestY);

                if(distSq < minDist) minDist = distSq;
            }
            totalDist += minDist / this.densities[i];
        }
        return -totalDist;

        // VERY OLD

        // let fitness = 0;
        // for(let i = 0; i < this.points.length; i++){
        //     fitness += spatialHash.getNumberOfClose(this.points[i][0], this.points[i][1]/*, SETTINGS.spatialHashQueryDist*/) ** SETTINGS.evennessValuePower / (this.densities[i] /*** SETTINGS.densityEmphasisPower*/);// big emphasis on small density bc we want the isochrone to 100% find the smallest region
        // }
        // return fitness // / this.points.length;
        // mean squared regression for now, obviously we dont want to fit all stars equally so TODO actually implement isochrone-specific stuff

        // EVEN OLDER

        // let totalDist = 0;

        // for(let i = 0; i < stars.length; i++){
        //     let minDist = Infinity;
        //     for(let j = 0; j < this.points.length; j++){
        //         // we don't have to sqrt! we're doing mean SQUARED regression!
        //         const dist = (this.points[j][0] - stars[i].x) ** 2 + (this.points[j][1] - stars[i].y) ** 2;
        //         if(isNaN(dist) === false && dist < minDist){
        //             minDist = dist;
        //         }
        //     }
        //     if(minDist !== Infinity)totalDist += minDist;
        // }

        // // big totalDist = bad
        // return -totalDist;
    }
    // pointToSegmentDistanceSquared(px, py, x1, y1, x2, y2){
    //     let dx = x2 - x1;
    //     let dy = y2 - y1;

    //     if(dx === 0 && dy === 0) return (px - x1) ** 2 + (py - y1) ** 2;

    //     let t = ((px - x1) * dx + (py - y1) * dy) / (dx**2 + dy**2);

    //     let nearestX;
    //     let nearestY;
    //     if(t < 0){
    //         nearestX = x1;
    //         nearestY = y1;
    //     } else if(t > 1){
    //         nearestX = x2;
    //         nearestY = y2;
    //     } else {
    //         nearestX = x1 + t * dx;
    //         nearestY = y1 + t * dy;
    //     }

    //     return (px - nearestX) ** 2 + (py - nearestY) ** 2;
    // }
}

function interpolate(a0, a1, t){
    return (1-t) * a0 + a1 * t;
}

function generateIsochrone(distance, logAge, metallicity, EBV) {
    // const points = [];
    
    // for(let x = minX; x <= maxX; x += 0.1){
    //     const y = interpolate(minY, maxY, EBV) + (maxY - minY) / (maxX - minX) * (distance - SETTINGS.distance.min) / (SETTINGS.distance.max - SETTINGS.distance.min) * x;
    //     points.push([x + Math.random() * metallicity * 7/1000,y + Math.random() * logAge/100]);
    // }

    // return points;
    
    // im pulling these numbers out of nowhere, TODO: Figure out how much E(B-V) filter mag actually offsets
    const d = isochroneData[logAge][metallicity];
    if(d === undefined) return [[],[]];

    const [shiftX, shiftY] = getShift(EBV, distance);
    // let [shiftX, shiftY] = getShift(EBV, distance);
    return /*[*/d.map(p => { return [p[0] + shiftX, p[1] + shiftY] })/*, generatePointDensity(d, logAge, metallicity)]*/;
}

// let pointDensityCache = {};
// function generatePointDensity(points, la, me){
//     // let density = [0];
//     // for(let i = 1; i < points.length-1; i++){
//     //     const p = points[i];
//     //     const prev = points[i-1];
//     //     const next = points[i+1];

//     //     const prevDistSq = (prev[0] - p[0]) ** 2 + (prev[1] - p[1]) ** 2;
//     //     const nextDistSq = (next[0] - p[0]) ** 2 + (next[1] - p[1]) ** 2;
//     // }

//     if(pointDensityCache[la] !== undefined && pointDensityCache[la][me] !== undefined) return pointDensityCache[la][me];
//     let spHash = new SpatialHash();

//     // align to the minimum of the spatial hash grid
//     let minPtX = Infinity;
//     let minPtY = Infinity;
//     for(let i = 0; i < points.length; i++){
//         if(points[i][0] < minPtX) minPtX = points[i][0];
//         if(points[i][1] < minPtY) minPtY = points[i][1];
//     }
//     const difX = minX - minPtX;
//     const difY = minY - minPtY;
//     let newPts = points.map(p => {return [p[0] + difX, p[1] + difY]});
//     for(let i = 0; i < newPts.length; i++){
//         spHash.addPt(newPts[i][0], newPts[i][1]);
//     }
    
//     // calculate densities as the amount of pts in the spatial hash cell. This isn't perfect but it doesn't need to be.
//     let densities = [];
//     for(let i = 0; i < newPts.length; i++){
//         densities[i] = spHash.getNumberInRadius(newPts[i][0], newPts[i][1], 2) + 1;
//     }

//     if(pointDensityCache[la] === undefined) pointDensityCache[la] = {};
//     pointDensityCache[la][me] = densities;
//     return densities;
// }

// scrapped because we can just use the isochrone's bounding box 

// shifts - from jules's colab https://colab.research.google.com/drive/1owvmAgPJPJU5J5w5Ce9fZMubGF5RXGBR
// const ag_over_ebv = 3.172-1.537;  //ebv coefficient for g band gaia
// const arp_over_ebv = 1.537;  //rp
// // function getEbvShift(/*xRange, yRange,*/ebv){
// //     // let ag = ag_over_ebv * ebv;
// //     // let arp = arp_over_ebv * ebv;

// //     // let x_shift = ag;
// //     // let y_shift = arp;
// //     // // let shifted_x_range = []; let shifted_y_range = [];
// //     // // for(let i = 0; i < xRange; i++){
// //     // //     shifted_x_range[i] = x_shift + xRange[i];
// //     // //     shifted_y_range[i] = y_shift + yRange[i];
// //     // // }

// //     // return [x_shift, y_shift];
// //     return [ag_over_ebv * ebv, arp_over_ebv * ebv];// shift the isochrone by this [x, y];
// // }

// // const apparent_magnitude_band1 = 15.0;
// // const apparent_magnitude_band2 = 14.5;
// // function getDistanceShift(distance){
// //     // let distance_modulus = 5 * (Math.log10(distance) - 1);
// //     // let adjusted_apparent_magnitude_band1 = apparent_magnitude_band1 - distance_modulus;
// //     // let adjusted_apparent_magnitude_band2 = apparent_magnitude_band2 - distance_modulus;

// //     // let x_shift = adjusted_apparent_magnitude_band1;
// //     // let y_shift = adjusted_apparent_magnitude_band2;

// //     // return [x_shift, y_shift];
// //     return [0, 15.809976 - 5 * (Math.log10(distance) - 1)];
// // }

// function getShift(ebv, distance){
//     // let distance_modulus = 5 * (Math.log10(distance) - 1);
//     return [
//         ag_over_ebv * ebv,
//         arp_over_ebv * ebv + 15.809976 - 5 * (Math.log10(distance) - 1) - 2
//     ];
// }

// const filterWavelength = {
//     "U": 0.364,
//     "B": 0.442,
//     "V": 0.54,
//     "R": 0.647,
//     "I": 0.7865,
//     "uprime": 0.354,
//     "gprime": 0.475,
//     "rprime": 0.622,
//     "iprime": 0.763,
//     "zprime": 0.905,
//     "J": 1.25,
//     "H": 1.65,
//     "K": 2.15,
//     // "Ks": 2.15,
//     "W1": 3.4,
//     "W2": 4.6,
//     "W3": 12,
//     "W4": 22,
//     "BP": 0.532,
//     "G": 0.673,
//     "RP": 0.797,
// };

function getShift(reddening/*E(B-V)*/, distance) {
    // const plotParams = this.isochroneService.getPlotParams();
    const blueExtinction = getExtinction(0.532/*"BP"*/, reddening);
    const redExtinction = getExtinction(/*"RP"*/0.797, reddening);
    // const lumExtinction = getExtinction("RP", reddening);
    return [
        /*x:*/ -(redExtinction - blueExtinction),
        /*y:*/ -(-/*lumExtinction*/redExtinction - 5 * Math.log10(distance * 1000) + 5)
    ]// redExtinction == lumExtinction bc they're the same filter. The redExtinction in the y should techincally be lumExtinction tho.
    // for more info, see https://github.com/SkynetRTN/astromancer/blob/8179fe905d266691d838926e70bf41d24b2b1581/src/app/tools/cluster/cluster.util.ts#L194
}

function getExtinction(/*filter*/waveLength, reddening, rv=3.1) {
    // const waveLength = filterWavelength[filter];
    const x = (waveLength / 1) ** -1;
    const y = x - 1.82;
    let a = 0;
    let b = 0;
    if (x > 0.3 && x < 1.1) {
      a = 0.574 * x ** 1.61;
    } else if (x > 1.1 && x < 3.3) {
      a =
        1 +
        0.17699 * y -
        0.50447 * y ** 2 -
        0.02427 * y ** 3 +
        0.72085 * y ** 4 +
        0.01979 * y ** 5 -
        0.7753 * y ** 6 +
        0.32999 * y ** 7;
    }
  
    if (x > 0.3 && x < 1.1) {
      b = -0.527 * x ** 1.61;
    } else if (x > 1.1 && x < 3.3) {
      b =
        1.41338 * y +
        2.28305 * y ** 2 +
        1.07233 * y ** 3 -
        5.38434 * y ** 4 -
        0.62251 * y ** 5 +
        5.3026 * y ** 6 -
        2.09002 * y ** 7;
    }
  
    return 3.1 * reddening * (a + b / rv);
}