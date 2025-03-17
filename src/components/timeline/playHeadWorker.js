
self.onmessage = function (e,) {
    let { position, isPlaying } = e.data;
    let lastTime = performance.now();
  
    function updatePlayhead(timestamp) {
      if (!isPlaying) return;
  
      let deltaTime = timestamp - lastTime;
      let pixelsPerSecond = 100;
      let pixelsPerMs = pixelsPerSecond / 1000;
  
      position += deltaTime * pixelsPerMs;
      lastTime = timestamp;
  
      self.postMessage({ position });
  
      requestAnimationFrame(updatePlayhead);
    }
  
    if (isPlaying) {
      requestAnimationFrame(updatePlayhead);
    }
  };
  