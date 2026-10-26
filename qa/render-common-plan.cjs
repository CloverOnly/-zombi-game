const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/lyj/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1400,height:900},deviceScaleFactor:1});
    const root=path.resolve(__dirname,'..');
    await page.goto(pathToFileURL(path.join(root,'common-entrance-corrected-6f.svg')).href);
    await page.screenshot({path:path.join(root,'common-entrance-corrected-6f.png')});
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
