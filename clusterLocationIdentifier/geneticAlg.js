const SETTINGS = Object.freeze({
    // general
    populationSize: 10,//0,
    selectionGradient: 1,

    // minStartingSize: 10 / 100,
    // maxStartingSize: 20 / 100,
    // SATpoints: 7,
    // // bigSizeAdd: 5,

    // // mutation
    // mutationDecay: 0.9995,
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

    // yeras
    logAge: {
        min: 6.6,
        max: 10.2,
        changeRate: 0.4
    },

    // solar units
    metallicity: {
        min: -2.2,
        max: 0.7,
        changeRate: 0.12,
    },

    // unitless
    "E(B-V)": {
        min: 0,
        max: 1,
        changeRate: 0.09
    }

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
            this.population[i] = new Guess(points, true);
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
            this.population.push(new Guess(this.points, true, this.population[Math.floor(this.population.length * Math.random())] ));
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
    constructor(stars, parent=undefined){
        if(parent === undefined){
            return new Guess(stars, {
                distance: interpolate(SETTINGS.distance.min, SETTINGS.distance.max, Math.random()),
                logAge: interpolate(SETTINGS.logAge.min, SETTINGS.logAge.max, Math.random() ** 2), // most clusters are young
                metallicity: interpolate(SETTINGS.metallicity.min, SETTINGS.metallicity.max, Math.random()),
                "E(B-V)": interpolate(SETTINGS["E(B-V)"].min, SETTINGS["E(B-V)"].max, Math.random()),
                fitness: 0
            });
        }

        this.distance = parent.distance + SETTINGS.distance.changeRate * Math.random() * decay;
        this.distance = clamp(SETTINGS.distance.min, SETTINGS.distance.max, this.distance);

        this.logAge = parent.logAge + SETTINGS.distance.changeRate * Math.random() * decay;
        this.logAge = clamp(SETTINGS.logAge.min, SETTINGS.logAge.max, this.logAge);

        this.metallicity = parent.metallicity + SETTINGS.metallicity.changeRate * Math.random() * decay;
        this.metallicity = clamp(SETTINGS.metallicity.min, SETTINGS.metallicity.max, this.metallicity);

        this["E(B-V)"] = parent["E(B-V)"] + SETTINGS["E(B-V)"].changeRate * Math.random() * decay;
        this["E(B-V)"] = clamp(SETTINGS["E(B-V)"].min, SETTINGS["E(B-V)"].max, this["E(B-V)"]);

        // const randomAngle = Math.PI * Math.random() * 2;
        // const mag = (isPurple && Math.random() < SETTINGS.bigTravelChance) ? SETTINGS.bigTravelDist * Math.random() : SETTINGS.travelDistance * (isPurple ? SETTINGS.purpleTravelDistMult : 1) * decay * Math.random();//* (decay < 0.1 ? (Math.random() ** 2) : Math.random());

        // this.x = parent.x + Math.cos(randomAngle) * mag;
        // this.y = parent.y + Math.sin(randomAngle) * mag;

        // // hmm we may want to have size change less when the parent size is smaller and we may have 1000 other clever improvements
        // this.radiusX = Math.max(SETTINGS.minStartingSize, parent.radiusX + (Math.random()*2-1) * SETTINGS.sizeDif * decay);
        // this.radiusY = Math.max(SETTINGS.minStartingSize, parent.radiusY + (Math.random()*2-1) * SETTINGS.sizeDif * decay);

        // if(isPurple === true){
        //     if(this.radiusX > SETTINGS.maxClusterSize) this.radiusX = SETTINGS.maxClusterSize;
        //     if(this.radiusY > SETTINGS.maxClusterSize) this.radiusY = SETTINGS.maxClusterSize;
        // }
        // this.isPurple = isPurple;
        

        // // approximate oval with polygon
        // this.sat = this.generateSAT();


    }
    generateSAT(){
        const points = [];
        for(let i = 0; i < SETTINGS.SATpoints; i++){
            const angle = i / SETTINGS.SATpoints * (Math.PI * 2);
            points.push(new SAT.Vector(this.x + this.radiusX * Math.cos(angle), this.y + this.radiusY * Math.sin(angle)));
        }
        return new SAT.Polygon(new SAT.Vector(), points);
    }
    calculateFitness(points, enemyPopulation) {
        let pointsWithin = 0;

        for(let i = 0; i < points.length; i++){
            if(this.contains(points[i]) === true) pointsWithin++;
        }

        let enemiesWithin = 0;
        for(let i = 0; i < enemyPopulation.length; i++){
            if(this.containsOther(enemyPopulation[i]) === true) enemiesWithin++;
        }

        return enemiesWithin !== 0 ? -Infinity : pointsWithin ** (this.isPurple ? SETTINGS.purpleDensityValuePower : SETTINGS.redDensityValuePower) / (this.radiusX * this.radiusY);
    }
    // calculateFitness(points){
    //     // fitness is about the number of points within the ellipse

    //     let pointsWithin = 0, pointsWithinBig = 0;

    //     // let angles = [];

    //     // TODO: spatial hash grid!! Looping through everything is really slow
    //     for(let i = 0; i < points.length; i++){
    //         if(this.contains(points[i]) === true) {pointsWithin++; pointsWithinBig++;}
    //         // else if(this.containsBig(points[i]) === true) {
    //         //     // const angle = Math.atan2(points[i].y - this.y, points[i].x - this.x);

    //         //     // angles.push(angle);
                
    //         //     pointsWithinBig++;
    //         // }
    //     }

    //     // const max = Math.PI*2;
    //     // function shortAngleDist(a0,a1) {
    //     //     const da = (a1 - a0) % max;
    //     //     return 2*da % max - da;
    //     // }

    //     // // this could be optimzed a lot lol
    //     // let angleDif = 0;
    //     // for(let i = 0; i < 20; i++){
    //     //     angleDif += Math.abs(shortAngleDist(angles[Math.floor(Math.random() * angles.length)], angles[Math.floor(Math.random() * angles.length)]));
    //     // }

    //     // to the power of 0.1 because bigger size that contains the same amount of point density should be ranked higher 
    //     // divide density of 
    //     const smallDensity = pointsWithin / ((this.radiusX * this.radiusY) /*** 0.8*/);
    //     // const bigDensity = pointsWithinBig / (((this.radiusX + SETTINGS.bigSizeAdd) * (this.radiusY + SETTINGS.bigSizeAdd)) /*** 0.8*/) + 1; // + SETTINGS.bigSizeAdd ?
    //     return (smallDensity / 30000 + smallDensity / bigDensity * (this.radiusX + this.radiusY) ** 0.4); /// (angleDif ** 1.6);
    // }
    contains({x,y}){
        const difX = this.x - x;
        const difY = this.y - y;
        return (difX / this.radiusX) ** 2 + (difY / this.radiusY) ** 2 <= 1;
    }
    // containsBig({x,y}){
    //     const difX = this.x - x;
    //     const difY = this.y - y;
    //     return (difX / (this.radiusX + SETTINGS.bigSizeAdd)) ** 2 + (difY / (this.radiusY + SETTINGS.bigSizeAdd)) ** 2 <= 1;
    // }
    containsOther(other){
        // bounding box check for optimization
        if(Math.abs(this.x - other.x) > this.radiusX + other.radiusX) return false;
        if(Math.abs(this.y - other.y) > this.radiusY + other.radiusY) return false;

        // collision detection using the SAT library
        return SAT.testPolygonPolygon(this.sat, other.sat);
    }
}

function interpolate(a0, a1, t){
    return (1-t) * a0 + a1 * t;
}