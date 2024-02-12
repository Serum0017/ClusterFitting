const puppeteer = require('puppeteer');

const url = "https://miro.com/app/board/uXjVNuGAbpQ=/";

async function run () {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    await wait(3);
    await page.screenshot({path: 'screenshot.png'});
    browser.close();
}
run();

async function wait(delayInSeconds=1){
    return new Promise((resolve) => {
        setTimeout(resolve, delayInSeconds * 1000);
    })
}

// running python!
const nodecallspython = require("node-calls-python");
const py = nodecallspython.interpreter;

py.import("./AI/main.py").then(async function(pymodule) {
    const result = await py.call(pymodule, "magnificent_ai", 3);

    // expected output: 6
    console.log("I called python up. They said: ", {result});
});