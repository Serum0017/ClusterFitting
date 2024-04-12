const SETTINGS = Object.freeze({
    // general
    populationSize: 10,//0,
    selectionGradient: 1,
    minStartingSize: 10 / 100,
    maxStartingSize: 20 / 100,
    SATpoints: 7,
    // bigSizeAdd: 5,

    // mutation
    mutationDecay: 0.9995,
    travelDistance: 600 / 100,
    sizeDif: 25 / 100,

    // local minima prevention
    bigTravelChance: 0.03,
    bigTravelDist: 5000 / 100,

    maxClusterSize: 60 / 100,
    purpleTravelDistMult: 300 / 100,

    // how much density vs spread should be weighted. 1 = we only care about density, 10 = we care a lot more about the amount of points within
    purpleDensityValuePower: 3,//3,//0.1,//2,//1.8,
    redDensityValuePower: 1,//2,//1.8,//1.5,//2,//1.3,

    // exporting
    clusterSizeAdd: 0.4//20
})
let decay = 1;

// given a series of points, algorithmically determine the best fit
class GeneticAlgorithmn {
    constructor(points=[{x:0,y:0}]){
        this.points = points;

        // a - purple, b - red
        this.populationA = new Array(SETTINGS.populationSize);
        for(let i = 0; i < this.populationA.length; i++){
            this.populationA[i] = new Guess(points, true);
        }

        this.populationB = new Array(SETTINGS.populationSize);
        for(let i = 0; i < this.populationB.length; i++){
            this.populationB[i] = new Guess(points, false);
        }
    }
    runGeneration(){
        for(let i = 0; i < this.populationA.length; i++){
            this.populationA[i].fitness = this.populationA[i].calculateFitness(this.points, this.populationB);
            this.populationB[i].fitness = this.populationB[i].calculateFitness(this.points, []);// red beats purple
        }

        // sort in decending order based on fitness
        this.populationA.sort((a, b) => b.fitness - a.fitness);
        this.populationB.sort((a, b) => b.fitness - a.fitness);

        // console.log(this.population.map(p => p.fitness));

        // kill w/ gradient
        // each individual has a chance of dying of rank^2
        // the last individual has a chance of dying of 100%
        const worstScore = (this.populationA.length - 1) ** 2;
        for(let i = 0; i < this.populationA.length; i++){
            const killChance = i ** 2 / worstScore;
            if(Math.random() < killChance){
                // kill both for speed
                this.populationA[i].dead = true;
                this.populationB[i].dead = true;
            }
        }

        this.populationA = this.populationA.filter(p => p.dead !== true);
        this.populationB = this.populationB.filter(p => p.dead !== true);

        while(this.populationA.length < SETTINGS.populationSize){
            // regenerate based on a random parent
            this.populationA.push(new Guess(this.points, true, this.populationA[Math.floor(this.populationA.length * Math.random())] ));
            this.populationB.push(new Guess(this.points, false, this.populationB[Math.floor(this.populationB.length * Math.random())] ));
        }

        decay *= SETTINGS.mutationDecay;
    }
    getBestData(){
        const populationA = this.populationA, populationB = this.populationB;

        // smaller population is assumed to be the one that has the cluster
        let smallestPopulation = populationB//A;
        // if(
        //     populationA[0].radiusX * populationA[0].radiusY + populationA[1].radiusX * populationA[1].radiusY + populationA[2].radiusX * populationA[2].radiusY >
        //     populationB[0].radiusX * populationB[0].radiusY + populationB[1].radiusX * populationB[1].radiusY + populationB[2].radiusX * populationB[2].radiusY
        // ) {
        //     smallestPopulation = populationB;
        // }

        let bestFitness = -1;
        let bestIndex = null;
        for(let i = 0; i < smallestPopulation.length; i++){
            if(smallestPopulation[i].fitness === undefined) smallestPopulation[i].fitness = smallestPopulation[i].calculateFitness(this.points, []);
            if(smallestPopulation[i].fitness > bestFitness){
                bestFitness = smallestPopulation[i].fitness;
                bestIndex = i;
            }
        }

        const bestAgent = smallestPopulation[bestIndex];

        // include a bit more just for safety
        bestAgent.radiusX += SETTINGS.clusterSizeAdd;
        bestAgent.radiusY += SETTINGS.clusterSizeAdd;

        const pointsIn = [];
        for(let i = 0; i < this.points.length; i++){
            if(bestAgent.contains(this.points[i]) === true){
                pointsIn.push({ra: this.points[i].x, dec: this.points[i].y, color: this.points[i].col, magnitude: this.points[i].mag});
            }
        }

        console.log(bestAgent.x - this.points[0].x, bestAgent.radiusX);

        // console.log(this.points.length, pointsIn.length, this.points);
        // console.log(bestAgent);

        bestAgent.radiusX -= SETTINGS.clusterSizeAdd;
        bestAgent.radiusY -= SETTINGS.clusterSizeAdd;

        render(bestAgent);

        return {
            color: smallestPopulation === this.populationA ? 'purple' : 'red',
            clusterPoints: pointsIn,
            bestAgent
        }
    }
}

class Guess {
    constructor(points, isPurple, parent=undefined){
        if(parent === undefined){
            return new Guess(points, isPurple, {
                x: 15 + Math.random() * -30,//canvas.width,
                y: -15 + Math.random() * 30,//canvas.height,
                radiusX: interpolate(SETTINGS.minStartingSize, SETTINGS.maxStartingSize, Math.random()),
                radiusY: interpolate(SETTINGS.minStartingSize, SETTINGS.maxStartingSize, Math.random()),
                fitness: 0
            });
        }

        const randomAngle = Math.PI * Math.random() * 2;
        const mag = (isPurple && Math.random() < SETTINGS.bigTravelChance) ? SETTINGS.bigTravelDist * Math.random() : SETTINGS.travelDistance * (isPurple ? SETTINGS.purpleTravelDistMult : 1) * decay * Math.random();//* (decay < 0.1 ? (Math.random() ** 2) : Math.random());

        this.x = parent.x + Math.cos(randomAngle) * mag;
        this.y = parent.y + Math.sin(randomAngle) * mag;

        // hmm we may want to have size change less when the parent size is smaller and we may have 1000 other clever improvements
        this.radiusX = Math.max(SETTINGS.minStartingSize, parent.radiusX + (Math.random()*2-1) * SETTINGS.sizeDif * decay);
        this.radiusY = Math.max(SETTINGS.minStartingSize, parent.radiusY + (Math.random()*2-1) * SETTINGS.sizeDif * decay);

        if(isPurple === true){
            if(this.radiusX > SETTINGS.maxClusterSize) this.radiusX = SETTINGS.maxClusterSize;
            if(this.radiusY > SETTINGS.maxClusterSize) this.radiusY = SETTINGS.maxClusterSize;
        }
        this.isPurple = isPurple;
        

        // approximate oval with polygon
        this.sat = this.generateSAT();
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