const importBox = document.querySelector('.importBox');

let focusBox = true;
window.onmousedown = (e) => {
    if(focusBox) importBox.focus();
    else importBox.blur();
    focusBox = !focusBox;
    return e.preventDefault();
}

var importedData;
importBox.onchange = () => {
    if(importBox.value.length === 0) return;
    importedData = importBox.value;

    importedData = importedData.split('\n');
    for(let i = 0; i < importedData.length; i++){
        importedData[i] = importedData[i].split(',');
    }

    if(importedData.length === undefined || importedData.length === 0) return;

    let [x, y, _, _2] = importedData[0];

    if(Number.isFinite(parseFloat(x)) === false || Number.isFinite(parseFloat(y)) === false) return;

    importedData = importBox.value;

    importBox.remove();

    loadScripts();
}

function loadScripts(){
    loadScript(0);
}

const otherScriptNames = ['data/isochroneData', /*'data/dataPoints',*/ 'generateDimensions', 'geneticAlg', 'main'];
function loadScript(scriptIndex){
    if(scriptIndex >= otherScriptNames.length) return;
    const scr = document.createElement('script');
    scr.src = '../' + otherScriptNames[scriptIndex] + '.js';
    document.body.appendChild(scr);
    scr.onload = () => {
        loadScript(scriptIndex+1);
    }
}