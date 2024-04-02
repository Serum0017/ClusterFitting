let positionsLen = window.spatialHashSettings.totalHashDistance / window.spatialHashSettings.hashDistance + 1;
if(positionsLen % 2 === 1) positionsLen++;
const halfPositionsLen = positionsLen / 2;
const hashDistance = window.spatialHashSettings.hashDistance;
let x = 0, y = 0;
class SpatialHash {
    constructor(){
        // positions: { x: {y: [stars at this hash] } }
        this.positions = [...Array(positionsLen)].map(_ => [...Array(positionsLen)]);
        for(x in this.positions){
            for(y in this.positions){
                this.positions[x][y] = 0;
            }
        }
        this.hashId = 0;
    }
    addPt(x, y){
        this.positions[Math.floor((x - minX) / hashDistance)][Math.floor((y - minY) / hashDistance)]++;
    }
    getNumberOfClose(x,y,radius=3){// radius is square
        let points = 0;
        const posX = Math.floor((x - minX) / hashDistance);
        const posY = Math.floor((y - minY) / hashDistance);
        
        for(let x = Math.max(0, posX - radius); x <= Math.min(this.positions.length, posX + radius); x++){
            for(let y = Math.max(0, posY - radius); y <= Math.min(this.positions[0].length, posY + radius); y++){
                points += this.positions[x][y];
            }
        }
        return points;
    }
    // logTotalPositions(){
    //     // console.log(this.positions);
    //     let totalPositions = 0;
    //     let totalEntities = 0;
    //     let hashPointsPerEntity = 0;
    //     for(let x in this.positions){
    //         for(let y in this.positions[x]){
    //             totalPositions++;
    //             for(let i in this.positions[x][y]){
    //                 if(hashPointsPerEntity === 0 && Math.random() < 0.1){
    //                     hashPointsPerEntity = (this.positions[x][y][i].hashData.top.x - this.positions[x][y][i].hashData.top.y) * (this.positions[x][y][i].hashData.bottom.x - this.positions[x][y][i].hashData.bottom.y);
    //                 }
    //                 totalEntities++;
    //             }
    //         }
    //     }
    //     console.log({totalPositions, totalEntities, hashPointsPerEntity});
    // }
    // renderDebug(canvas,ctx,entities){
    //     ctx.globalAlpha = 0.65;
    //     ctx.strokeStyle = 'blue';
    //     ctx.lineWidth = 4;
    //     for(let i = 0; i < entities.length; i++){
    //         if(entities[i].renderFlag === 'square' || entities[i].shape !== 'poly')continue;
    //         // ctx.strokeRect(entities[i].x-entities[i].difference.x/2, entities[i].y - entities[i].difference.y/2, entities[i].difference.x, entities[i].difference.y);
    //         const e = entities[i];
    //         ctx.fillStyle = 'red';
    //         for(let i = 0; i < e.hashPositions.length; i++){
    //             const {x,y} = e.hashPositions[i];
    //             ctx.beginPath();
    //             ctx.arc(parseInt(x), parseInt(y), 15, 0, Math.PI*2);
    //             ctx.fill();
    //             ctx.closePath();
    //         }
    //         if(Math.random() < 0.001){
    //             console.log(e.body);
    //         }
    //     }
    //     ctx.globalAlpha = 1;
    //     // ctx.globalAlpha = 0.8;
    //     // ctx.fillStyle = 'red';
    //     // for(let x in this.positions){
    //     //     for(let y in this.positions[x]){
    //     //         ctx.beginPath();
    //     //         ctx.arc(parseInt(x), parseInt(y), 15, 0, Math.PI*2);
    //     //         ctx.fill();
    //     //         ctx.closePath();
    //     //     }
    //     // }
    //     // ctx.globalAlpha = 1;
    // }
}