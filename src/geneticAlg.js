const SETTINGS = Object.freeze({
    // general
    populationSize: 10,

    // mutation
    mutationDecay: 0.999,//0.9995,

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
})
let decay = 1;

// given a series of points, algorithmically determine the best fit
class GeneticAlgorithmn {
    constructor(points=[{x:0,y:0}]){
        this.points = points;

        this.population = new Array(SETTINGS.populationSize);
        for(let i = 0; i < this.population.length; i++){
            this.population[i] = new Guess();
        }

        this.lastBestFitness = 0;
    }
    runGeneration(){
        for(let i = 0; i < this.population.length; i++){
            this.population[i].fitness = this.population[i].calculateFitness(this.points);
        }

        // sort in decending order based on fitness
        this.population.sort((a, b) => b.fitness - a.fitness);

        // kill w/ gradient
        // each individual has a chance of dying of rank^2
        // the last individual has a chance of dying of 100%
        const worstScore = (this.population.length - 1) ** 2;
        for(let i = 0; i < this.population.length; i++){
            const killChance = i ** 2 / worstScore;
            if(Math.random() < killChance){
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
            if(p[i].fitness === undefined) p[i].fitness = p[i].calculateFitness(this.points);
            if(p[i].fitness > bestFitness){
                bestFitness = p[i].fitness;
                bestIndex = i;
            }
        }

        const bestAgent = p[bestIndex];

        if(bestIndex !== null){
            const pts = bestAgent.points;
            ctx.globalAlpha = 0.3;
            let lastLineWidth = ctx.lineWidth;
            let lastSS = ctx.strokeStyle;
            ctx.lineWidth *= 3;
            ctx.beginPath();
            ctx.strokeStyle = 'purple';
            ctx.moveTo(XToScreen(pts[0][0]) + canvas.width / 2, YToScreen(pts[0][1]) + canvas.height / 2);
            for(let i = 0; i < pts.length; i++){
                ctx.lineTo(XToScreen(pts[i][0]) + canvas.width / 2, YToScreen(pts[i][1]) + canvas.height / 2);
            }
            ctx.stroke();
            ctx.closePath();
            ctx.lineWidth = lastLineWidth;
            ctx.strokeStyle = lastSS;
            ctx.globalAlpha = 1;
        }

        const fitnessIncreaseRatioSinceLastTime = bestFitness / this.lastBestFitness;
        this.lastBestFitness = bestFitness;

        return {
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

        this.points = generateIsochrone(this.distance, Math.round(this.logAge * 20) / 20, Math.round(this.metallicity * 20) / 20, this["E(B-V)"]);

        // generate densities
        let prevDist = Math.sqrt((this.points[0][0] - this.points[1][0]) ** 2 + (this.points[0][1] - this.points[1][1]) ** 2);
        this.densities = [];
        for(let i = 1; i < this.points.length-1; i++){
            const next = this.points[i+1];
            const cur = this.points[i];
            const nextDist = Math.sqrt((next[0] - cur[0]) ** 2 + (next[1] - cur[1]) ** 2);
            this.densities[i] = prevDist + nextDist;
            prevDist = nextDist;
        }
        this.densities[0] = this.densities[1];
        this.densities[this.points.length-1] = this.densities[this.points.length-2];
    }
    calculateFitness(points) {
        let totalDist = 0, t, dx, dy, nearestX, nearestY, distSq;
        for(let i = 0; i < points.length; i++){
            let minDist = Infinity;
            for(let j = 0; j < this.points.length-1; j++){
                // we consider points 2 at a time, i and i+1. This is why we stop the loop 1 short
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

                // Crude approximation that does not interpolate the point on a line. Useful for getting a decent fit fast. 
                // const distSq = (this.points[j][0] - points[i].x) ** 2 + (this.points[j][1] - points[i].y) ** 2;

                distSq = (points[i].x - nearestX) * (points[i].x - nearestX) + (points[i].y - nearestY) * (points[i].y - nearestY);

                if(distSq < minDist) minDist = distSq;
            }
            totalDist += minDist / this.densities[i];
        }
        return -totalDist;
    }
}

function interpolate(a0, a1, t){
    return (1-t) * a0 + a1 * t;
}

function generateIsochrone(distance, logAge, metallicity, EBV) {
    // look up points
    const d = isochroneData[logAge][metallicity];
    if(d === undefined) return [[],[]];

    // apply offsets
    const [shiftX, shiftY] = getShift(EBV, distance);
    return d.map(p => { return [p[0] + shiftX, p[1] + shiftY] });
}

function getShift(reddening/*E(B-V)*/, distance) {
    const blueExtinction = getExtinction(/*"BP"*/0.532, reddening);
    const redExtinction = getExtinction(/*"RP"*/0.797, reddening);
    return [
        /*x:*/ -(redExtinction - blueExtinction),
        /*y:*/ -(-/*lumExtinction*/redExtinction - 5 * Math.log10(distance * 1000) + 5)
    ]// redExtinction == lumExtinction bc they're the same filter. The redExtinction in the y should techincally be lumExtinction tho.
    // for more info, see https://github.com/SkynetRTN/astromancer/blob/8179fe905d266691d838926e70bf41d24b2b1581/src/app/tools/cluster/cluster.util.ts#L194
}

function getExtinction(waveLength, reddening, rv=3.1) {
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