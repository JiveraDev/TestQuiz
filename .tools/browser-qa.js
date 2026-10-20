const { chromium } = require('C:/Users/loren/AppData/Local/npm-cache/_npx/423231821c231c73/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const bank = require('../quiz-reviewer/dist/questions');
const byId = new Map(bank.questions.map(q=>[q.id,q]));
const directory = 'C:/Users/loren/PhpstormProjects/untitled/.tools/screenshots';
fs.mkdirSync(directory,{recursive:true});
let browser;

(async () => {
  browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1050}});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(process.argv[2] || 'http://localhost:4173');
  await page.locator('#login-dialog[open]').waitFor();
  await page.screenshot({path:directory+'/login-desktop.png'});
  await page.locator('#username').fill('Mika IT401');
  await page.locator('#login-form button').click();
  await page.locator('#start-button').waitFor();
  await page.locator('#toast').waitFor({state:'hidden'});
  for (const width of [1440,768,390]) {
    await page.setViewportSize({width,height:width===390?844:1050});
    await page.screenshot({path:directory+`/dashboard-${width}.png`,fullPage:true});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,`Dashboard overflow at ${width}`);
  }
  console.log('PASS: username sign-in and dashboard at desktop, tablet, and mobile widths');
  await page.setViewportSize({width:1440,height:1050});
  await page.emulateMedia({reducedMotion:'reduce'});
  const active=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('recall-it401-v1-active-mika%20it401')));
  const history=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('recall-it401-v1-history'))||[]);
  await page.locator('select[name="count"]').selectOption('10');
  await page.locator('select[name="type"]').selectOption('multiple');
  await page.locator('#start-button').click();
  const first=await active();
  assert.equal(first.ids.length,10);
  await page.locator('[data-action="restart"]').click();
  await page.locator('#accept-confirm').click();
  const restarted=await active();
  assert.notEqual(first.id,restarted.id);
  assert.notDeepEqual(first.ids,restarted.ids);
  assert.equal((await history()).length,0);
  await page.locator('#answer-form button[type="submit"]').click();
  assert.match(await page.locator('#answer-error').innerText(),/Enter or choose/);
  for (let index=0;index<10;index++) {
    const state=await active();
    const q=byId.get(state.ids[state.position]);
    await page.locator(`[data-choice="${q.answer}"]`).click();
    await page.locator('#answer-form button[type="submit"]').click();
    assert.equal((await active()).feedback.correct,true);
    await page.locator('[data-action="next"]').click();
  }
  assert.equal((await history())[0].correct,10);
  await page.screenshot({path:directory+'/results-desktop.png',fullPage:true});
  console.log('PASS: shuffled restart, empty-answer validation, 10/10 score, and saved session');
  await page.locator('[data-action="play-again"]').click();
  const again=await active();
  assert.notEqual(again.id,restarted.id);
  assert.notDeepEqual(again.ids,restarted.ids);
  const wrongQ=byId.get(again.ids[0]);
  await page.locator(`[data-choice="${(wrongQ.answer+1)%wrongQ.options.length}"]`).click();
  await page.locator('#answer-form button[type="submit"]').click();
  assert.equal((await active()).feedback.correct,false);
  await page.locator('[data-action="end"]').click();
  await page.locator('#accept-confirm').click();
  const ended=(await history())[1];
  assert.equal(ended.correct,0);
  assert.equal(ended.total,10);
  assert.equal(ended.answered,1);
  await page.locator('[data-action="retry-missed"]').click();
  assert.equal((await active()).ids.length,10);
  console.log('PASS: unlimited replay, wrong-answer feedback, early finish, and retry missed');

  // Move the stored absolute deadline into the past, then reload and resume.
  await page.evaluate(()=>{
    const key='recall-it401-v1-active-mika%20it401';
    const session=JSON.parse(localStorage.getItem(key));
    session.deadline=Date.now()-1000;
    localStorage.setItem(key,JSON.stringify(session));
  });
  await page.reload();
  await page.locator('[data-action="resume"]').click();
  await page.locator('.answer-feedback').waitFor();
  assert.equal((await active()).feedback.timedOut,true);
  await page.locator('[data-action="next"]').click();
  const beforeRefresh=await active();
  await page.reload();
  await page.locator('[data-action="resume"]').click();
  const afterRefresh=await active();
  assert.equal(beforeRefresh.deadline,afterRefresh.deadline);
  assert.deepEqual(beforeRefresh.layouts,afterRefresh.layouts);
  console.log('PASS: timeout auto-check and refresh preserve the deadline and shuffled layouts');

  await page.locator('.quiz-home').click();
  await page.locator('#accept-confirm').click();
  await page.locator('#switch-player').click();
  await page.locator('#username').fill('Lian IT401');
  await page.locator('#login-form button').click();
  await page.locator('[data-go="history"]').click();
  assert.match(await page.locator('#app').innerText(),/Your story starts/);
  await page.locator('.nav-item[data-go="practice"]').click();
  await page.locator('select[name="topic"]').selectOption('all');
  await page.locator('select[name="type"]').selectOption('all');
  await page.locator('select[name="count"]').selectOption('all');
  await page.locator('#start-button').click();
  const lianActive=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('recall-it401-v1-active-lian%20it401')));
  assert.equal((await lianActive()).ids.length,100);
  const formats=new Set();
  for (let index=0;index<100;index++) {
    const state=await lianActive();
    const q=byId.get(state.ids[state.position]);
    formats.add(q.type);
    if (q.options) await page.locator(`[data-choice="${q.answer}"]`).click();
    else if (q.items) for (let item=0;item<q.items.length;item++) await page.locator(`[data-item="${item}"]`).fill(q.items[q.items.length-1-item].label);
    else if (q.pairs) for (let item=0;item<q.pairs.length;item++) await page.locator(`[data-match="${item}"]`).selectOption(q.pairs[item].right);
    else await page.locator('input[name="response"]').fill(q.answer.toUpperCase());
    if (!['multiple','boolean'].includes(q.type)) {
      const file=directory+`/question-${q.type}.png`;
      if (!fs.existsSync(file)) {
        await page.setViewportSize({width:390,height:844});
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,`Quiz overflow: ${q.type}`);
        await page.screenshot({path:file,fullPage:true});
        await page.setViewportSize({width:1440,height:1050});
      }
    }
    await page.locator('#answer-form button[type="submit"]').click();
    assert.equal((await lianActive()).feedback.correct,true,`Browser grading ${q.id}`);
    await page.locator('[data-action="next"]').click();
    if ((index+1)%25===0) console.log(`Browser full-bank quiz: ${index+1}/100 questions passed`);
  }
  assert.equal(formats.size,6);
  const all=await history();
  const lian=all.filter(s=>s.player==='Lian IT401');
  assert.equal(lian.length,1);
  assert.equal(lian[0].correct,100);
  assert.equal(lian[0].total,100);
  assert.equal(all.filter(s=>s.player==='Mika IT401').length,2);
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:directory+'/results-mobile.png',fullPage:true});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
  await page.locator('[data-action="toggle-missed"]').click();
  assert.match(await page.locator('.answers-review').innerText(),/No missed answers/);
  await page.locator('[data-go="coverage"]').click();
  assert.match(await page.locator('#app').innerText(),/Section 65/);
  await page.screenshot({path:directory+'/coverage-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('PASS: all 100 questions through the real UI, all six formats, 100/100 scoring, separate usernames, mobile results, source coverage, and zero browser errors');
  await browser.close();
})().catch(async error=>{console.error(error);if(browser)await browser.close();process.exitCode=1;});
