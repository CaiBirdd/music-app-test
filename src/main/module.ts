import { ipcMain, BrowserWindow, app } from 'electron'

/**
 * 设置窗口相关的 IPC 事件监听
 * 用于处理来自渲染进程的窗口控制请求（如最大化、最小化、关闭等）
 * @param mainWindow 浏览器窗口实例
 */
function setupWindowEvents(mainWindow: BrowserWindow): void {
  // 最大化窗口
  ipcMain.on('maximize', () => {
    mainWindow.maximize()
  })

  // 取消最大化
  ipcMain.on('unmaximize', () => {
    mainWindow.unmaximize()
  })

  // 最小化窗口
  ipcMain.on('minimize', () => {
    mainWindow.minimize()
  })

  // 还原窗口
  ipcMain.on('restore', () => {
    mainWindow.restore()
  })

  // 关闭窗口
  ipcMain.on('close', () => {
    mainWindow.close()
  })

  // 重启应用
  ipcMain.on('reset', () => {
    app.exit()
    app.relaunch()
  })
}

export default setupWindowEvents
