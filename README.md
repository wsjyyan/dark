# 一键黑屏 - Cinema Dark

一键黑屏看视频。点击图标，页面其余部分变黑，只保留视频画面，沉浸观影。

Dark cinema mode: one click, video only.

## 安装

1. 打开 Chrome → `chrome://extensions/`
2. 开启右上角 **开发者模式**
3. 点击 **加载已解压的扩展程序**
4. 选择本文件夹

## 使用

| 操作 | 效果 |
|------|------|
| 点击图标 | 切换黑屏模式 |
| 再次点击 | 恢复正常 |

## 原理

采用四条固定定位遮罩条围住播放器，不修改页面 DOM 结构，不受 z-index / overflow 限制。完美支持 `<video>` 和 `<iframe>` 播放器。

## 权限

仅 `activeTab` + `scripting`，无 `host_permissions`，审核友好。

## 许可

MIT
