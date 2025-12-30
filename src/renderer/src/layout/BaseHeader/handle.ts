import { useFlags } from '@/store/flags'

export const handle = () => {
  const flags = useFlags()
  const maximize = () => {
    flags.isMaximize = true
    window.electron?.ipcRenderer.send('maximize')
  }
  const unmaximize = () => {
    flags.isMaximize = false
    window.electron?.ipcRenderer.send('unmaximize')
  }
  const minimize = () => {
    flags.isMinimize = true
    window.electron?.ipcRenderer.send('minimize')
  }
  const restore = () => {
    flags.isMinimize = false
    window.electron?.ipcRenderer.send('restore')
  }
  const close = () => {
    window.electron?.ipcRenderer.send('close')
  }

  return {
    maximize,
    unmaximize,
    minimize,
    restore,
    close
  }
}
