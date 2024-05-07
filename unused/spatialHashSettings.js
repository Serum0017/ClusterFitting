// originally in geneticAlg.js but moved to unused.
window.spatialHashSettings = {
    totalHashDistanceX: Math.abs(maxX - minX),
    totalHashDistanceY: Math.abs(maxY - minY),
}
window.spatialHashSettings.hashDistanceX = window.spatialHashSettings.totalHashDistanceX / 20;// 400 cells
window.spatialHashSettings.hashDistanceY = window.spatialHashSettings.totalHashDistanceY / 20;// 400 cells