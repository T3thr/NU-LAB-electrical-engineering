async function setGenerator(page, parameter, value, unit = 'enter') {
  await page.locator({frequency:'#gen-freq',vpp:'#gen-amplitude',offset:'#gen-offset'}[parameter]).click();
  await page.locator('#gen-number').click();
  for (const digit of String(value)) await page.locator('[data-gen-digit="'+digit+'"]').click();
  await page.locator('#gen-'+unit).click();
  await page.locator('#gen-'+unit).blur();
}
async function highZ(page) {
  await page.locator('#gen-shift').click(); await page.locator('#gen-enter').click();
  for(let i=0;i<3;i++) await page.locator('#gen-right').click();
  await page.locator('#gen-down').click(); await page.locator('#gen-down').click();
  if((await page.locator('#gen-frequency').textContent()).includes('50 OHM')) await page.locator('#gen-right').click();
  await page.locator('#gen-enter').click();
}
module.exports={setGenerator,highZ};
