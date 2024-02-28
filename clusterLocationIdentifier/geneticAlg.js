const SETTINGS = Object.freeze({
    // general
    populationSize: 100,
    selectionGradient: 1,
    minStartingSize: 10 / 100,
    maxStartingSize: 200 / 100,
    bigSizeAdd: 5,// size to check the delta in density, red circles

    // mutation
    mutationDecay: 0.9995,
    travelDistance: 240 / 100,
    sizeDif: 45 / 100,
})
let decay = 1;

// given a series of points, algorithmically determine the best fit
class GeneticAlgorithmn {
    constructor(points=[{x:0,y:0}]){
        this.points = points;

        this.population = new Array(SETTINGS.populationSize);
        for(let i = 0; i < this.population.length; i++){
            this.population[i] = new Guess(points);
        }
    }
    runGeneration(){
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
                this.population[i].dead = true;
            }
        }

        this.population = this.population.filter(p => p.dead !== true);

        while(this.population.length < SETTINGS.populationSize){
            // regenerate based on a random parent
            this.population.push(new Guess(this.points, this.population[Math.floor(this.population.length * Math.random())] ))
        }

        decay *= SETTINGS.mutationDecay;
    }
}

class Guess {
    constructor(points, /*hasExclusionZone=false,*/ parent=undefined){
        if(parent === undefined){
            return new Guess(points, {
                x: 15 + Math.random() * -30,//canvas.width,
                y: -15 + Math.random() * 30,//canvas.height,
                radiusX: interpolate(SETTINGS.minStartingSize, SETTINGS.maxStartingSize, Math.random()),
                radiusY: interpolate(SETTINGS.minStartingSize, SETTINGS.maxStartingSize, Math.random()),
                fitness: 0
            });
        }

        const randomAngle = Math.PI * Math.random() * 2;
        const mag = SETTINGS.travelDistance * decay * Math.random();//* (decay < 0.1 ? (Math.random() ** 2) : Math.random());

        this.x = parent.x + Math.cos(randomAngle) * mag;
        this.y = parent.y + Math.sin(randomAngle) * mag;

        // hmm we may want to have size change less when the parent size is smaller and we may have 1000 other clever improvements
        this.radiusX = Math.max(SETTINGS.minStartingSize, parent.radiusX + (Math.random()*2-1) * SETTINGS.sizeDif * decay);
        this.radiusY = Math.max(SETTINGS.minStartingSize, parent.radiusY + (Math.random()*2-1) * SETTINGS.sizeDif * decay);

        this.fitness = this.calculateFitness(points);
    }
    calculateFitness(points){
        // fitness is about the number of points within the ellipse

        let pointsWithin = 0, pointsWithinBig = 0;

        let angles = [];

        // TODO: spatial hash grid!! Looping through everything is really slow
        for(let i = 0; i < points.length; i++){
            if(this.contains(points[i]) === true) {pointsWithin++; pointsWithinBig++;}
            else if(this.containsBig(points[i]) === true) {
                // const angle = Math.atan2(points[i].y - this.y, points[i].x - this.x);

                // angles.push(angle);
                
                pointsWithinBig++;
            }
        }

        // const max = Math.PI*2;
        // function shortAngleDist(a0,a1) {
        //     const da = (a1 - a0) % max;
        //     return 2*da % max - da;
        // }

        // // this could be optimzed a lot lol
        // let angleDif = 0;
        // for(let i = 0; i < 20; i++){
        //     angleDif += Math.abs(shortAngleDist(angles[Math.floor(Math.random() * angles.length)], angles[Math.floor(Math.random() * angles.length)]));
        // }

        // to the power of 0.1 because bigger size that contains the same amount of point density should be ranked higher 
        // divide density of 
        const smallDensity = pointsWithin / ((this.radiusX * this.radiusY) /*** 0.8*/);
        const bigDensity = pointsWithinBig / (((this.radiusX + SETTINGS.bigSizeAdd) * (this.radiusY + SETTINGS.bigSizeAdd)) /*** 0.8*/) + 1; // + SETTINGS.bigSizeAdd ?
        console.log((smallDensity / bigDensity).toFixed(2));
        return (smallDensity / 30000 + smallDensity / bigDensity * (this.radiusX + this.radiusY) ** 0.4); /// (angleDif ** 1.6);
    }
    contains({x,y}){
        const difX = this.x - x;
        const difY = this.y - y;
        return (difX / this.radiusX) ** 2 + (difY / this.radiusY) ** 2 <= 1;
    }
    containsBig({x,y}){
        const difX = this.x - x;
        const difY = this.y - y;
        return (difX / (this.radiusX + SETTINGS.bigSizeAdd)) ** 2 + (difY / (this.radiusY + SETTINGS.bigSizeAdd)) ** 2 <= 1;
    }
}

function interpolate(a0, a1, t){
    return (1-t) * a0 + a1 * t;
}