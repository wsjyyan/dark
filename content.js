(function () {
  if (window.__darkScreenInjected) return;
  window.__darkScreenInjected = true;

  let isDarkMode = false;
  let strips = [];        // [topDiv, bottomDiv, leftDiv, rightDiv]
  let resizeHandler = null;
  let scrollHandler = null;

  // 需要包围的播放器元素
  const PLAYER_SELECTOR = 'video, iframe';

  // ==================== 四条遮罩条 ====================

  function createStrip(style) {
    var el = document.createElement('div');
    el.className = '__dark-strip__';
    var css = 'position:fixed;background:#000;z-index:2147483646;pointer-events:none;';
    for (var k in style) {
      css += k + ':' + style[k] + ';';
    }
    el.style.cssText = css;
    document.body.appendChild(el);
    return el;
  }

  function findMainPlayer() {
    // 找最大的可见播放器
    var players = document.querySelectorAll(PLAYER_SELECTOR);
    var best = null;
    var bestArea = 0;

    for (var i = 0; i < players.length; i++) {
      var p = players[i];
      var rect = p.getBoundingClientRect();
      // 跳过不可见或太小的
      if (rect.width < 100 || rect.height < 100) continue;
      if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
      if (rect.right < 0 || rect.left > window.innerWidth) continue;

      var area = Math.min(rect.width, window.innerWidth) *
                 Math.min(rect.height, window.innerHeight);
      if (area > bestArea) {
        bestArea = area;
        best = p;
      }
    }

    return best;
  }

  function layoutStrips() {
    var player = findMainPlayer();
    if (!player) return;

    var r = player.getBoundingClientRect();
    r.left = Math.max(0, r.left);
    r.top = Math.max(0, r.top);
    r.right = Math.min(window.innerWidth, r.right);
    r.bottom = Math.min(window.innerHeight, r.bottom);

    if (strips.length < 4) {
      strips = [
        createStrip({ top: '0', left: '0', width: '100vw', height: r.top + 'px' }),
        createStrip({ top: r.bottom + 'px', left: '0', width: '100vw',
                      height: (window.innerHeight - r.bottom) + 'px' }),
        createStrip({ top: r.top + 'px', left: '0',
                      width: r.left + 'px', height: (r.bottom - r.top) + 'px' }),
        createStrip({ top: r.top + 'px', left: r.right + 'px',
                      width: (window.innerWidth - r.right) + 'px', height: (r.bottom - r.top) + 'px' })
      ];
    } else {
      strips[0].style.height = r.top + 'px';
      strips[1].style.top = r.bottom + 'px';
      strips[1].style.height = (window.innerHeight - r.bottom) + 'px';
      strips[2].style.top = r.top + 'px';
      strips[2].style.width = r.left + 'px';
      strips[2].style.height = (r.bottom - r.top) + 'px';
      strips[3].style.top = r.top + 'px';
      strips[3].style.left = r.right + 'px';
      strips[3].style.width = (window.innerWidth - r.right) + 'px';
      strips[3].style.height = (r.bottom - r.top) + 'px';
    }
  }

  function removeStrips() {
    for (var i = 0; i < strips.length; i++) {
      strips[i].remove();
    }
    strips = [];
  }

  function onResize() {
    if (isDarkMode) layoutStrips();
  }

  function onScroll() {
    if (isDarkMode) layoutStrips();
  }

  // ==================== 模式切换 ====================

  function enableDarkMode() {
    if (isDarkMode) return;
    isDarkMode = true;

    layoutStrips();

    resizeHandler = onResize;
    scrollHandler = onScroll;
    window.addEventListener('resize', resizeHandler);
    window.addEventListener('scroll', scrollHandler, { passive: true });

    document.documentElement.style.setProperty('background', '#000', 'important');
    if (document.body) {
      document.body.style.setProperty('background', '#000', 'important');
    }
  }

  function disableDarkMode() {
    if (!isDarkMode) return;
    isDarkMode = false;

    removeStrips();

    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler);
      resizeHandler = null;
    }
    if (scrollHandler) {
      window.removeEventListener('scroll', scrollHandler);
      scrollHandler = null;
    }

    document.documentElement.style.background = '';
    if (document.body) {
      document.body.style.background = '';
    }
  }

  // ==================== 消息监听 ====================

  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'toggle') {
      if (message.state) {
        enableDarkMode();
        sendResponse({ status: 'on' });
      } else {
        disableDarkMode();
        sendResponse({ status: 'off' });
      }
    }
  });
})();
