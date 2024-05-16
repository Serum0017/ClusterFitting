minX--; minY--; maxX++; maxY++; // gives some space for points not on the isochrone to not be counted by the clamps

const positionsLen = 20;
const hashDistanceX = (maxX - minX) / positionsLen;
const hashDistanceY = (maxY - minY) / positionsLen;
window.adjacentQueryErrorBound = Math.min(hashDistanceX, hashDistanceY);

class SpatialHash {
    constructor(){
        // positions: { x: {y: [entities at this hash] } }
        this.positions = [...Array(positionsLen)].map(_ => [...Array(positionsLen)]);
        this.positionsLen = this.positions.length;
        for(let x in this.positions){
            for(let y in this.positions){
                this.positions[x][y] = [];
            }
        }
        this.hashId = 0;
    }
    add(o, x, y){
        let hashX = Math.floor(clampN((x - minX) / (maxX - minX)) * this.positionsLen);
        let hashY = Math.floor(clampN((y - minY) / (maxY - minY)) * this.positionsLen);
        if(hashX === this.positionsLen) hashX--;
        if(hashY === this.positionsLen) hashY--;
        this.positions[hashX][hashY].push(o);
    }
    queryAdjacent(x, y){
        const hashX = clamp(1, positionsLen-2, Math.floor(clampN((x - minX) / (maxX - minX)) * this.positionsLen));
        const hashY = clamp(1, positionsLen-2, Math.floor(clampN((y - minY) / (maxY - minY)) * this.positionsLen));
        return [
            this.positions[hashX-1][hashY-1], this.positions[hashX][hashY-1], this.positions[hashX+1][hashY-1],
            this.positions[hashX-1][hashY],   this.positions[hashX][hashY],   this.positions[hashX+1][hashY],
            this.positions[hashX-1][hashY+1], this.positions[hashX][hashY+1], this.positions[hashX+1][hashY+1],
        ]
    }
}

function clamp(min, max, n){
    if(n < min) return min;
    if(n > max) return max;
    return n;
}

const clampN = (n) => {return clamp(0, 1, n);}

// this just gives the graph some space. It has no effect besides aesthetics.
// maxY *= 1.1;
// minX -= 2;
// maxX += 2;
// minY -= 2;
// maxY += 2;