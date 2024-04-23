let positionsLenX = window.spatialHashSettings.totalHashDistanceX / window.spatialHashSettings.hashDistanceX + 1;
let positionsLenY = window.spatialHashSettings.totalHashDistanceY / window.spatialHashSettings.hashDistanceY + 1;
if(positionsLenX % 2 === 1) positionsLenX++;
if(positionsLenY % 2 === 1) positionsLenY++;
const halfPositionsLenX = positionsLenX / 2;
const halfPositionsLenY = positionsLenY / 2;
const hashDistanceX = window.spatialHashSettings.hashDistanceX;
const hashDistanceY = window.spatialHashSettings.hashDistanceY;
const halfHashDistanceX = hashDistanceX / 2;
const halfHashDistanceY = hashDistanceY / 2;
let x = 0, y = 0;
class SpatialHash {
    // REAL
    constructor(){
        // positions: { x: {y: [stars at this hash] } }
        this.positions = [...Array(positionsLenX)].map(_ => [...Array(positionsLenY)]);
        for(x in this.positions){
            for(y in this.positions){
                this.positions[x][y] = 0;
            }
        }
        this.hashId = 0;
    }
    addPt(x, y){
        this.positions[Math.min(positionsLenX-1,Math.max(0,Math.floor((x - minX) / hashDistanceX)))][Math.min(positionsLenY-1,Math.max(0,Math.floor((y - minY) / hashDistanceY)))]++;
    }
    getNumberOfClose(x,y){
        // try{
            // this.positions[Math.max(0,Math.min(positionsLenX-1,Math.floor((x - minX) / hashDistanceX)))][Math.max(0,Math.min(positionsLenY-1,Math.floor((y - minY) / hashDistanceY)))];
        // } catch(e){
        //     console.log(x,y);
        //     return 0;
        // }
        return this.positions[Math.max(0,Math.min(positionsLenX-1,Math.floor((x - minX) / hashDistanceX)))][Math.max(0,Math.min(positionsLenY-1,Math.floor((y - minY) / hashDistanceY)))];
    }
    getNumberInRadius(x,y,radius=3){// square radius
        let ps = 0;
        const posX = Math.floor((x - minX) / hashDistanceX);
        const posY = Math.floor((y - minY) / hashDistanceY);

        for(let x = Math.max(0, posX - radius); x <= Math.min(this.positions.length, posX + radius); x++){
            for(let y = Math.max(0, posY - radius); y <= Math.min(this.positions[0].length, posY + radius); y++){
                if(this.positions[x] === undefined || isNaN(this.positions[x][y]) === true) continue;
                ps += this.positions[x][y];
            }
        }
        return ps;
    }
    renderDebug(){
        ptx.fillStyle = 'red';
        for(let i = 0; i < this.positions.length; i++){
            for(let j = 0; j < this.positions[i].length; j++){
                const x = minX + (i+0.5) / this.positions.length * (maxX - minX);
                const y = minY + (j+0.5) / this.positions.length * (maxY - minY);
                ptx.beginPath();
                // ptx.font = '12px Comic Sans MS';
                // ptx.textAlign = 'center';
                // ptx.textBaseline = 'middle';
                // ptx.fillText(this.getNumberOfClose(x,y,1), XToScreen(x) + canvas.width / 2, YToScreen(y) + canvas.height / 2);
                ptx.arc(XToScreen(x) + canvas.width / 2, YToScreen(y) + canvas.height / 2, this.getNumberOfClose(x,y,1) / 30, 0, Math.PI * 2);
                ptx.fill();
                ptx.closePath();
            }
        }
    }
    renderCellsWith(pts){
        // let uniqueCells = {/*x: {y: true}*/};

        // for(let i = 0; i < pts.length; i++){
        //     const x = Math.min(positionsLenX-1,Math.max(0,Math.floor((pts[i][0] - minX) / hashDistanceX)));
        //     const y = Math.min(positionsLenY-1,Math.max(0,Math.floor((pts[i][1] - minY) / hashDistanceY)));

        //     if(uniqueCells[x] === undefined) uniqueCells[x] = {};
        //     uniqueCells[x][y] = true;
        // }

        // console.log(uniqueCells);

        // ptx.fillStyle = 'green';
        // ptx.globalAlpha = 0.1;
        const cellSize = {
            x: (maxX - minX) / this.positions.length,
            y: (maxY - minY) / this.positions.length
        };
        // for(let x in uniqueCells){
        //     for(let y in uniqueCells[x]){
        //         ptx.fillRect(XToScreen(x-cellSize.x/2) + canvas.width / 2,YToScreen(y-cellSize.y/2) + canvas.height / 2,XToMag(cellSize.x),YToMag(cellSize.y))
        //     }
        // }
        // ptx.globalAlpha = 1;

        let alreadyDrawn = {};
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = 'green';
        for(let i = 0; i < pts.length; i++){
            const x = Math.min(positionsLenX-1,Math.max(0,Math.floor((pts[i][0] - minX) / hashDistanceX) * hashDistanceX + minX))
            const y = Math.min(positionsLenY-1,Math.max(0,Math.floor((pts[i][1] - minY) / hashDistanceY) * hashDistanceY + minY));
            if(alreadyDrawn[x] !== undefined && alreadyDrawn[x][y] !== undefined) continue;
            if(alreadyDrawn[x] === undefined) alreadyDrawn[x] = {};
            alreadyDrawn[x][y] = true;
            ctx.beginPath();
            ctx.rect(XToScreen(x - cellSize.x/2) + canvas.width / 2, YToScreen(y - cellSize.x/2) + canvas.height / 2, XToMag(cellSize.x), YToMag(cellSize.y));
            ctx.fill();
            ctx.closePath();
        }

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
    // ENDREAL

    // TEST
    // constructor() {
    //     this.positions = [];
    // }
    // addPt(x,y){
    //     this.positions.push([x,y]);
    // }
    // getNumberOfClose(px,py,radius=3){
    //     let pts = 0;
    //     const maxD = (/*radius**/hashDistance)**2;
    //     for(let i = 0; i < this.positions.length; i++){
    //         const [x,y] = this.positions[i];
    //         if((px-x)**2+(py-y)**2 < maxD){
    //             pts++;
    //         }
    //     }
    //     return pts;
    // }
    // ENDTEST

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