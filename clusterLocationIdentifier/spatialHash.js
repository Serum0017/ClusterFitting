let positionsLen = window.spatialHashSettings.totalHashDistance / window.spatialHashSettings.hashDistance + 1;
if(positionsLen % 2 === 1) positionsLen++;
const halfPositionsLen = positionsLen / 2;
const hashDistance = window.spatialHashSettings.hashDistance;
const halfHashDistance = hashDistance / 2;
let x = 0, y = 0;
class SpatialHash {
    // REAL
    // constructor(){
    //     // positions: { x: {y: [stars at this hash] } }
    //     this.positions = [...Array(positionsLen)].map(_ => [...Array(positionsLen)]);
    //     for(x in this.positions){
    //         for(y in this.positions){
    //             this.positions[x][y] = 0;
    //         }
    //     }
    //     this.hashId = 0;
    // }
    // addPt(x, y){
    //     this.positions[Math.floor((x - minX) / hashDistance)][Math.floor((y - minY) / hashDistance)]++;
    // }
    // getNumberOfClose(x,y,radius=3){// radius is square
    //     let points = 0;
    //     const posX = Math.floor((x - minX) / hashDistance);
    //     const posY = Math.floor((y - minY) / hashDistance);
        
    //     for(let x = Math.max(0, posX - radius); x <= Math.min(this.positions.length, posX + radius); x++){
    //         for(let y = Math.max(0, posY - radius); y <= Math.min(this.positions[0].length, posY + radius); y++){
    //             if(isNaN(this.positions[x][y]) === true) continue;
    //             points += this.positions[x][y];
    //         }
    //     }
    //     return points;
    // }
    // ENDREAL

    constructor() {
        this.positions = [];
    }
    addPt(x,y){
        this.positions.push([x,y]);
    }
    getNumberOfClose(px,py,radius=3){
        let pts = 0;
        const maxD = (/*radius**/hashDistance)**2;
        for(let i = 0; i < this.positions.length; i++){
            const [x,y] = this.positions[i];
            if((px-x)**2+(py-y)**2 < maxD){
                pts++;
            }
        }
        return pts;
    }

    // this is an actually useful debug function
    // renderPositions(){
    //     const lastGA = ctx.globalAlpha;
    //     ctx.globalAlpha = 0.1;
    //     for(let x = 0; x < this.positions.length; x++){
    //         for(let y = 0; y < this.positions[x].length; y++){
    //             const scaledX = minX + (x / this.positions.length) * Math.abs(maxX - minX);
    //             const scaledY = minY + (y / this.positions[x].length) * Math.abs(maxY - minY);

    //             ctx.fillStyle = 'red';
    //             ctx.beginPath();
    //             ctx.arc(XToScreen(scaledX) + canvas.width / 2, YToScreen(scaledY) + canvas.height / 2, 12, 0, Math.PI * 2);
    //             ctx.fill();
    //             ctx.closePath();
    //         }
    //     }
    //     ctx.globalAlpha = lastGA;
    // }


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