const SETTINGS = Object.freeze({
    // general
    populationSize: 10,//100,
    selectionGradient: 1,

    // minStartingSize: 10 / 100,
    // maxStartingSize: 20 / 100,
    // SATpoints: 7,
    // // bigSizeAdd: 5,

    // // mutation
    mutationDecay: 0.9995,
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
        min: 0.25,
        max: 86.22,
        changeRate: 2,
    },

    // years
    logAge: {
        min: 6.6,
        max: 10.2,
        changeRate: 3
    },

    // solar units
    metallicity: {
        min: -2.2,
        max: 0.6,//0.7, // oops i didn't generate 0.7 yet
        changeRate: 1,
    },

    // unitless
    "E(B-V)": {
        min: 0,
        max: 1,
        changeRate: 0.09
    },

    // mag error not included b/c we don't know mag, and
    // it's no use guessing at something that is unhelpful!
})
let decay = 1;

// given a series of points, algorithmically determine the best fit
class GeneticAlgorithmn {
    constructor(points=[{x:0,y:0}]){
        this.points = points;

        // a - purple, b - red
        this.population = new Array(SETTINGS.populationSize);
        for(let i = 0; i < this.population.length; i++){
            this.population[i] = new Guess();
        }
    }
    runGeneration(){
        for(let i = 0; i < this.population.length; i++){
            this.population[i].fitness = this.population[i].calculateFitness(this.points);
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
        return {
            TODO: true
        };
        // let bestFitness = -1;
        // let bestIndex = null;
        // for(let i = 0; i < smallestPopulation.length; i++){
        //     if(smallestPopulation[i].fitness === undefined) smallestPopulation[i].fitness = smallestPopulation[i].calculateFitness(this.points, []);
        //     if(smallestPopulation[i].fitness > bestFitness){
        //         bestFitness = smallestPopulation[i].fitness;
        //         bestIndex = i;
        //     }
        // }

        // const bestAgent = smallestPopulation[bestIndex];

        // // include a bit more just for safety
        // bestAgent.radiusX += SETTINGS.clusterSizeAdd;
        // bestAgent.radiusY += SETTINGS.clusterSizeAdd;

        // const pointsIn = [];
        // for(let i = 0; i < this.points.length; i++){
        //     if(bestAgent.contains(this.points[i]) === true){
        //         pointsIn.push({ra: this.points[i].x, dec: this.points[i].y});
        //     }
        // }

        // bestAgent.radiusX -= SETTINGS.clusterSizeAdd;
        // bestAgent.radiusY -= SETTINGS.clusterSizeAdd;

        // return {
        //     color: smallestPopulation === this.populationA ? 'purple' : 'red',
        //     clusterPoints: pointsIn,
        //     bestAgent
        // }
    }
}

function clamp(min, max, a){
    if(a < min) return min;
    if(a > max) return max;
    return a;
}

class Guess {
    constructor(parent=undefined){
        if(parent === undefined){
            return new Guess({
                distance: interpolate(SETTINGS.distance.min, SETTINGS.distance.max, Math.random()),
                logAge: interpolate(SETTINGS.logAge.min, SETTINGS.logAge.max, Math.random() ** 2), // most clusters are young
                metallicity: interpolate(SETTINGS.metallicity.min, SETTINGS.metallicity.max, Math.random()),
                "E(B-V)": interpolate(SETTINGS["E(B-V)"].min, SETTINGS["E(B-V)"].max, Math.random()),
                fitness: 0
            });
        }

        this.distance = parent.distance + SETTINGS.distance.changeRate * (Math.random()-0.5) * decay;
        this.distance = clamp(SETTINGS.distance.min, SETTINGS.distance.max, this.distance);

        this.logAge = parent.logAge + SETTINGS.logAge.changeRate * (Math.random()-0.5) * decay;
        this.logAge = clamp(SETTINGS.logAge.min, SETTINGS.logAge.max, this.logAge);

        this.metallicity = parent.metallicity + SETTINGS.metallicity.changeRate * (Math.random()-0.5) * decay;
        this.metallicity = clamp(SETTINGS.metallicity.min, SETTINGS.metallicity.max, this.metallicity);

        this["E(B-V)"] = parent["E(B-V)"] + SETTINGS["E(B-V)"].changeRate * (Math.random()-0.5) * decay;
        this["E(B-V)"] = clamp(SETTINGS["E(B-V)"].min, SETTINGS["E(B-V)"].max, this["E(B-V)"]);

        // console.log(Math.round(this.logAge * 10) / 10, Math.round(this.metallicity) / 10);

        this.points = generateIsochrone(this.distance, Math.round(this.logAge * 10) / 10, Math.round(this.metallicity * 10) / 10, this["E(B-V)"]);

        // regenerate isochrone if the points dont exist
        if(this.points.length === 0){
            const choices = Object.keys(isochroneData[Math.round(this.logAge * 10) / 10]);
            this.metallicity = parseFloat(choices[Math.floor(Math.random() * choices.length)]);
            this.points = generateIsochrone(this.distance, Math.round(this.logAge * 10) / 10, Math.round(this.metallicity * 10) / 10, this["E(B-V)"]);
            // console.log({choices, age: this.logAge, mtl: this.metallicity, pts: this.points});
        }
    }
    calculateFitness(stars) {
        // mean squared regression for now, obviously we dont want to fit all stars equally so TODO actually implement isochrone-specific stuff

        // TODO: Spatial hash!

        let totalDist = 0;

        for(let i = 0; i < stars.length; i++){
            let minDist = Infinity;
            for(let j = 0; j < this.points.length; j++){
                // we don't have to sqrt! we're doing mean SQUARED regression!
                const dist = (this.points[j][0] - stars[i].x) ** 2 + (this.points[j][1] - stars[i].y) ** 2;
                if(isNaN(dist) === false && dist < minDist){
                    minDist = dist;
                }
            }
            if(minDist !== Infinity)totalDist += minDist;
        }

        // big totalDist = bad
        return -totalDist;
    }
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
    if(isochroneData[logAge][metallicity] === undefined) return [];
    return isochroneData[logAge][metallicity].map(p => { return [p[0]-EBV*6, p[1]+distance] });
}