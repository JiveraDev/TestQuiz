const { chromium } = require('C:/Users/loren/AppData/Local/npm-cache/_npx/423231821c231c73/node_modules/playwright');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const bank = require('../quiz-reviewer/dist/questions');
const server = require('../quiz-reviewer/index');
const byId = new Map(bank.questions.map(q => [q.id,q]));
const username = 'Offences Audit';
const activeKey = 'recall-it401-v1-active-offences%20audit';
const historyKey = 'recall-it401-v1-history';

async function checkApp(browser, url, migration = false) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror',error => errors.push(error.message));
  const active = () => page.evaluate(key => JSON.parse(localStorage.getItem(key)),activeKey);
  const oldScore = { bankVersion:2,id:'legacy-score',player:username,playerKey:'offences audit',title:'Earlier mixed reviewer',date:'2026-10-19T10:00:00Z',correct:1,total:2,answered:2,duration:90,status:'completed',settings:{topic:'network',type:'boolean',count:'all',pace:'standard'},results:[{id:'Q001',correct:true,response:'network security'},{id:'Q100',correct:false,response:2}] };
  try {
    await page.goto(url);
    await page.locator('#username').fill(username);
    await page.locator('#login-form button').click();
    if (migration) {
      await page.evaluate(({historyKey,activeKey,oldScore}) => {
        localStorage.setItem(historyKey,JSON.stringify([oldScore]));
        localStorage.setItem(activeKey,JSON.stringify({bankVersion:2}));
      },{historyKey,activeKey,oldScore});
      await page.reload();
      assert.match(await page.locator('#storage-warning').innerText(),/questions have been revised/);
      assert.equal(await page.locator('[data-action="resume"]').count(),0);
      await page.locator('[data-go="history"]').click();
      await page.locator('[data-review="legacy-score"]').click();
      assert.match(await page.locator('.result-score').innerText(),/1\s*\/\s*2/);
      assert.match(await page.locator('.source-panel').innerText(),/recorded score is unchanged/);
      assert.equal(await page.locator('.answers-review').count(),0);
      await page.locator('[data-action="play-again"]').click();
      assert.equal((await active()).ids.length,bank.questions.length);
      assert.equal((await active()).bankVersion,bank.version);
      // Discard only this isolated browser's audit attempt, then exercise real UI flows.
      await page.evaluate(key => localStorage.removeItem(key),activeKey);
      await page.reload();
      const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)),historyKey);
      assert.deepEqual(saved,[oldScore]);
      console.log('PASS: earlier mixed scores survive; obsolete attempts restart against the full cybercrime bank');
    }
    await page.locator('[data-go="coverage"]').click();
    assert.equal(await page.locator('.offence-row:not(.compounding-row)').count(),23);
    assert.equal(await page.locator('.module-page').count(),6);
    assert.equal(await page.locator('.research-card').count(),8);
    await page.locator('.reference-group > summary').click();
    for (const width of [1440,390]) {
      await page.setViewportSize({width,height:1000});
      if (!await page.locator('.offence-row').first().getAttribute('open').then(value => value !== null)) await page.locator('.offence-row').first().locator('summary').click();
      if (!await page.locator('.module-page').first().getAttribute('open').then(value => value !== null)) await page.locator('.module-page').first().locator('summary').click();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true,`coverage overflow ${width}`);
      await page.screenshot({path:`.tools/screenshots/cybercrime-coverage-${migration?'hosted':'offline'}-${width}.png`,fullPage:true});
    }
    assert.equal(await page.locator('.module-page').first().locator('pre').textContent(),bank.modulePages[0].text.replace(/\r\n/g,'\n'));
    await page.locator('button[data-go="practice"]').click();
    assert.match(await page.locator('#bank-summary').innerText(),new RegExp(String(bank.questions.length)));
    assert.doesNotMatch(await page.locator('#app').innerText(),/network protection|risk management|security testing/i);
    for (const type of Object.keys(bank.types)) {
      await page.setViewportSize({width:type === 'matching' ? 390 : 1440,height:1000});
      await page.locator('select[name="type"]').selectOption(type);
      await page.locator('select[name="count"]').selectOption('10');
      await page.locator('#start-button').click();
      assert.equal((await active()).ids.length,10);
      await page.locator('#answer-form button[type="submit"]').click();
      assert.match(await page.locator('#answer-error').innerText(),/Enter or choose/);
      for (let index = 0; index < 10; index++) {
        const state = await active();
        const q = byId.get(state.ids[state.position]);
        assert.equal(q.type,type);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true,`${type} overflow`);
        if (q.options) await page.locator(`[data-choice="${q.answer}"]`).click();
        else if (q.pairs) {
          for (let row = 0; row < q.pairs.length; row++) await page.locator(`[data-match="${row}"]`).selectOption(q.pairs[row].right);
        } else await page.locator('input[name="response"]').fill(q.answer);
        if (type === 'fill' && index === 0) {
          await page.reload();
          await page.locator('[data-action="resume"]').click();
          assert.equal(await page.locator('input[name="response"]').inputValue(),q.answer);
        }
        await page.locator('#answer-form button[type="submit"]').click();
        assert.equal((await active()).feedback.correct,true,q.id);
        await page.locator('[data-action="next"]').click();
      }
      assert.match(await page.locator('.result-score').innerText(),/10\s*\/\s*10/);
      console.log(`PASS: ${migration?'hosted':'offline'} ${type}: 10/10 using visible answer controls`);
      await page.locator('[data-action="practice"]').click();
    }
    await page.locator('select[name="area"]').selectOption('real-world');
    await page.locator('select[name="type"]').selectOption('situational');
    assert.match(await page.locator('#selection-count').innerText(),/8 available/);
    await page.locator('#start-button').click();
    const caseQuestion = byId.get((await active()).ids[0]);
    await page.locator(`[data-choice="${caseQuestion.answer}"]`).click();
    await page.locator('#answer-form button[type="submit"]').click();
    assert.equal(await page.locator('.research-links a').count(),1);
    assert.equal(await page.locator('.research-links a').getAttribute('href'),bank.research.find(item => item.id === caseQuestion.researchId).url);
    await page.locator('[data-action="end"]').click();
    await page.locator('#accept-confirm').click();
    assert.match(await page.locator('.result-score').innerText(),/1\s*\/\s*8/);
    assert.equal(await page.locator('.review-item').count(),8);
    assert.deepEqual(errors,[]);
    console.log(`PASS: ${migration?'hosted':'offline'} full reference, responsive layout, filters, research attribution and early-end denominator`);
  } finally {
    await context.close();
  }
}

(async () => {
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  let browser;
  try {
    browser = await chromium.launch({channel:'msedge',headless:true});
    await checkApp(browser,`http://127.0.0.1:${server.address().port}`,true);
    await checkApp(browser,pathToFileURL(path.resolve('quiz-reviewer/IT401-Reviewer.html')).href);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode=1; });
