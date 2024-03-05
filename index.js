// const puppeteer = require('puppeteer');

// const url = "https://miro.com/app/board/uXjVNuGAbpQ=/";

// async function run () {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto(url);
//     await wait(3);
//     await page.screenshot({path: 'screenshot.png'});
//     browser.close();
// }
// run();

// async function wait(delayInSeconds=1){
//     return new Promise((resolve) => {
//         setTimeout(resolve, delayInSeconds * 1000);
//     })
// }

// // running python!
// const nodecallspython = require("node-calls-python");
// const py = nodecallspython.interpreter;

// py.import("./AI/main.py").then(async function(pymodule) {
//     const result = await py.call(pymodule, "magnificent_ai", 3);

//     // expected output: 6
//     console.log("I called python up. They said: ", {result});
// });

// running python!
const nodecallspython = require("node-calls-python");
const py = nodecallspython.interpreter;

py.import("./getGaiaData.py").then(async function(pymodule) {
    const result = await py.call(pymodule, "get_Gaia_data_js_wrapper");

    let resultStr = '[';
    for(let i = 0; i < result.length; i++){
        const column = result[i];
        resultStr += '[';
        for(let j = 0; j < column.length; j++){
            const number = column[j];
            resultStr += `${number},\n`;
        }
        resultStr += '],\n';
    }
    resultStr[resultStr.length - 1] = ';';
    resultStr += ']';

    // console.log(resultStr);

    // write the file
    const fs = require('node:fs');
    const content = `/*Auto generated. 2 arrays, first is Gaia BP-RP color, second is Gaia G absolute magnitude*/const gaiaData = ${resultStr}`;
    fs.writeFile('./clusterLocationIdentifier/gaiaData.js', content, err => {
        if (err) {
            console.error(err);
        } else {
            console.log('file written successfully!');
        }
    });
});