const { chromium } = require('C:/Users/loren/AppData/Local/npm-cache/_npx/423231821c231c73/node_modules/playwright');
const assert = require('node:assert/strict');
const bank = require('../quiz-reviewer/dist/questions');

(async () => {
  const browser = await chromium.launch({channel:'msedge',headless:true});
  try {
    const page = await browser.newPage({viewport:{width:390,height:844}});
    const errors = [];
    page.on('pageerror',error=>errors.push(error.message));
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto('file:///C:/Users/loren/PhpstormProjects/untitled/quiz-reviewer/IT401-Reviewer.html');
    await page.locator('#username').fill('Question Audit');
    await page.locator('#login-form button').click();
    await page.locator('#start-button').click();
    const key = 'recall-it401-v1-active-question%20audit';
    const oldScore = {id:'before-review',player:'Question Audit',playerKey:'question audit',title:'Earlier quiz',date:'2026-10-18T10:00:00Z',correct:1,total:2,answered:2,duration:120,status:'completed',settings:{topic:'all',type:'all',count:'all',pace:'standard'},results:[{id:'Q024',correct:true,response:'Cyber terrorism'},{id:'Q049',correct:false,response:0}]};
    await page.evaluate(({key,oldScore})=>{
      const active = JSON.parse(localStorage.getItem(key));
      delete active.bankVersion;
      localStorage.setItem(key,JSON.stringify(active));
      localStorage.setItem('recall-it401-v1-history',JSON.stringify([oldScore]));
    },{key,oldScore});
    await page.reload();
    assert.match(await page.locator('#storage-warning').innerText(),/questions have been revised/);
    assert.equal(await page.locator('[data-action="resume"]').count(),0);
    await page.locator('[data-go="history"]').click();
    await page.locator('[data-review="before-review"]').click();
    assert.equal(await page.locator('.result-score').innerText(),'1 / 2');
    assert.match(await page.locator('.source-panel').innerText(),/recorded score is unchanged/);
    assert.equal(await page.locator('.answers-review').count(),0);
    assert.equal(await page.locator('[data-action="retry-missed"]').count(),0);
    assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('recall-it401-v1-history'))),[oldScore]);
    await page.locator('[data-action="play-again"]').click();
    assert.equal(await page.locator('#storage-warning').isVisible(),false);
    const current = await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
    assert.equal(current.bankVersion,bank.version);
    const q = bank.questions.find(q=>q.id==='Q066');
    await page.evaluate(({key,q})=>{
      const active = JSON.parse(localStorage.getItem(key));
      active.ids = [q.id];
      active.layouts = {[q.id]:{options:[],rows:[],choices:[]}};
      active.position = 0;
      active.results = [];
      active.feedback = null;
      active.draft = Array(4).fill('');
      active.questionStarted = Date.now();
      active.deadline = Date.now() + 120000;
      localStorage.setItem(key,JSON.stringify(active));
    },{key,q});
    await page.reload();
    await page.locator('[data-action="resume"]').click();
    assert.equal(await page.locator('.question-prompt').innerText(),q.prompt);
    assert.match(await page.locator('.question-context').innerText(),/legally permitted settlement/);
    assert.equal(await page.locator('input[placeholder="Type one disqualifying circumstance"]').count(),4);
    assert.match(await page.locator('.answer-hint').innerText(),/All 4 answers are required/);
    assert.doesNotMatch(await page.locator('.question-card').innerText(),/\b(?:module|lesson|slide|pdf|handout)\b/i);
    assert.equal(await page.locator('.question-source').count(),0);
    for (const [index,answer] of ['The victim is a woman','Prior conviction leading to enhanced punishment','Child under 18','Affects socioeconomic conditions'].entries()) {
      await page.locator(`[data-item="${index}"]`).fill(answer);
    }
    await page.locator('#answer-form button[type="submit"]').click();
    assert.match(await page.locator('.answer-feedback').innerText(),/1 point earned/);
    await page.screenshot({path:'.tools/screenshots/revised-enumeration-mobile.png',fullPage:true});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.locator('[data-action="next"]').click();
    assert.equal(await page.locator('.result-score').innerText(),'1 / 1');
    await page.locator('.review-item summary').click();
    assert.doesNotMatch(await page.locator('.answers-review').innerText(),/\b(?:module|lesson|slide|pdf|handout)\b/i);
    const saved = await page.evaluate(()=>JSON.parse(localStorage.getItem('recall-it401-v1-history')));
    assert.deepEqual(saved[0],oldScore);
    assert.equal(saved[1].bankVersion,2);
    assert.deepEqual(errors,[]);
    console.log('PASS: old scores preserved, old attempts cannot use changed keys, replay uses version 2, Q066 context and meaningful fields display on mobile, natural paraphrases earn one point, and quiz/review contain no document references.');
  } finally {
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
