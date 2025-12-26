import { ElectronAPI } from '@electron-toolkit/preload'

type Channel = 'maximize' | 'unmaximize' | 'minimize' | 'restore' | 'close'

declare global {
  interface Window {
    // Phase 2 占位：播放器在 Phase 5 才实现
    // Phase 5 完成后会将其替换为 MusicPlayerInstanceType
    $audio: any
    $login: any
    electron: ElectronAPI
  }

  interface ImportMetaEnv {
    VITE_URL: string
  }
}

declare module '@electron-toolkit/preload' {
  interface IpcRenderer {
    send(channel: Channel, ...args: any[]): void
  }
}
