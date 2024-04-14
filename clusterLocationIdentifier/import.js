const importBox = document.querySelector('.importBox');

window.onmousedown = (e) => {
    importBox.focus();
    return e.preventDefault();
}

let importedData = [];
importBox.onchange = () => {
    if(importBox.value.length === 0) return;
    try {
        // format: each row is ra, dec, color, magnitude
        let rows = importBox.value.split('\n');
        for(let i = 0; i < rows.length; i++){
            let [ra,dec,color,magnitude] = rows[i].split(',');
            color = parseFloat(color);
            magnitude = parseFloat(magnitude);
            if(Number.isFinite(color) && Number.isFinite(magnitude)){
                importedData.push({
                    ra: parseFloat(ra),
                    dec: parseFloat(dec),
                    color, magnitude
                });
            }
        }
        Object.freeze(importedData);

        importBox.remove();

        loadScripts();
    } catch(e){
        alert('data could not be parsed!');
    }
}

function loadScripts(){
    loadScript(0);
}

const otherScriptNames = [/*'gaiaData',*/ 'isochroneData', 'generateDimensions', 'spatialHash', 'geneticAlg', 'main'];
function loadScript(scriptIndex){
    const scr = document.createElement('script');
    scr.src = otherScriptNames[scriptIndex] + '.js';
    document.body.appendChild(scr);
    scr.onload = () => {
        loadScript(scriptIndex+1);
    }
}

// export in format
// ra,dec,color,magnitude
// row2
// row3
// ...