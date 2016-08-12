import { Menu } from 'electron'

export default function (app, win) {
  let template

  if (process.platform === 'darwin') {
    template = darwinMenu(app, win)
  } else {
    template = windowsMenu(app, win)
  }

  const menu = Menu.buildFromTemplate(template)
  win.setMenu(menu)

  win.webContents.on('context-menu', (e, props) => {
    Menu.buildFromTemplate([{
      label: 'Inspect element',
      click() { win.inspectElement(props.x, props.y) }
    }]).popup(win)
  })
}

export const darwinMenu = (app, win) => { // eslint-disable-line
  return [
    {
      label: 'Rinobot',
      submenu: [
        {
          label: 'About Rinobot',
          selector: 'orderFrontStandardAboutPanel:'
        }, {
          type: 'separator'
        }, {
          label: 'Services',
          submenu: []
        }, {
          type: 'separator'
        }, {
          label: 'Hide Rinobot',
          accelerator: 'Command+H',
          selector: 'hide:'
        }, {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:'
        }, {
          label: 'Show All',
          selector: 'unhideAllApplications:'
        }, {
          type: 'separator'
        }, {
          label: 'Quit',
          accelerator: 'Command+Q',
          click() {
            app.quit()
          }
        }
      ]
    }, {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click() {
            win.webContents.reload()
          }
        }, {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click() {
            win.setFullScreen(!win.isFullScreen())
          }
        }, {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click() {
            win.toggleDevTools()
          }
        }
      ]
    }, {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          selector: 'performMiniaturize:'
        }, {
          label: 'Close',
          accelerator: 'Command+W',
          selector: 'performClose:'
        }, {
          type: 'separator'
        }, {
          label: 'Bring All to Front',
          selector: 'arrangeInFront:'
        }
      ]
    },
  ]
}

export const windowsMenu = (app, win) => { // eslint-disable-line
  return [
    {
      label: '&File',
      submenu: [
        {
          label: '&Open',
          accelerator: 'Ctrl+O'
        }, {
          label: '&Close',
          accelerator: 'Ctrl+W',
          click() {
            win.close()
          }
        }
      ]
    }, {
      label: '&View',
      submenu: [
        {
          label: '&Reload',
          accelerator: 'Ctrl+R',
          click() {
            win.webContents.reload()
          }
        }, {
          label: 'Toggle &Full Screen',
          accelerator: 'F11',
          click() {
            win.setFullScreen(!win.isFullScreen())
          }
        }, {
          label: 'Toggle &Developer Tools',
          accelerator: 'Alt+Ctrl+I',
          click() {
            win.toggleDevTools()
          }
        }
      ]
    },
  ]
}
