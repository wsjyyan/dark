// 每个 tab 的黑屏状态
const tabStates = new Map();

// 图标路径
const ICON_ON = {
  16: 'icons/icon-on-16.png',
  48: 'icons/icon-on-48.png',
  128: 'icons/icon-on-128.png'
};
const ICON_OFF = {
  16: 'icons/icon-off-16.png',
  48: 'icons/icon-off-48.png',
  128: 'icons/icon-off-128.png'
};

chrome.action.onClicked.addListener(async (tab) => {
  const tabId = tab.id;
  const currentState = tabStates.get(tabId) || false;
  const nextState = !currentState;

  try {
    // 先注入 content script（如果还没注入的话）
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    });
  } catch (e) {
    // content.js 可能已经被注入过了，忽略错误
  }

  // 发送 toggle 消息
  try {
    const response = await chrome.tabs.sendMessage(tabId, { action: 'toggle', state: nextState });
    tabStates.set(tabId, nextState);

    // 切换图标
    const iconPath = nextState ? ICON_ON : ICON_OFF;
    chrome.action.setIcon({ tabId, path: iconPath });
    chrome.action.setTitle({ tabId, title: nextState ? 'dark: on' : 'dark: off' });
  } catch (e) {
    // 页面可能无法注入（如 chrome:// 页面），静默处理
    console.log('无法在此页面使用黑屏模式');
  }
});

// tab 关闭时清理状态
chrome.tabs.onRemoved.addListener((tabId) => {
  tabStates.delete(tabId);
});

// tab 更新（刷新/跳转）时重置状态
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    if (tabStates.get(tabId)) {
      tabStates.delete(tabId);
      chrome.action.setIcon({ tabId, path: ICON_OFF });
      chrome.action.setTitle({ tabId, title: 'dark: off' });
    }
  }
});
