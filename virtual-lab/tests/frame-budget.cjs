/* Measure the host's RAF cap before loading the application (e.g. 30 Hz power saving). */
module.exports = async page => page.evaluate(async () => {
  const times = [];
  await new Promise(resolve => {
    function frame(time) {
      times.push(time);
      if (times.length === 61) resolve(); else requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  });
  return 60000 / (times.at(-1) - times[0]);
});
