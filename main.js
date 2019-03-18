'use strict';

const {
  app, 
  BrowserWindow, 
  ipcMain,
  Menu,
  protocol
} = require('electron');
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// 本地服务器地址
// const feedURL = `http://192.168.1.2:8080/`;

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

log.info('App starting...');

// 自定义菜单
let template = [];

if (process.platform === 'darwin') {
  const name = app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,,
        role: 'about'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() {
          app.quit();
        }
      }
    ]
  })
}

let mainWindow = null;

function sendStatusToWindow(text) {
  log.info(text);
  mainWindow.webContents.send('message', text);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768
  });

  const indexUrl = `file://${__dirname}/index.html#v${app.getVersion()}`;

  mainWindow.loadURL(indexUrl);

  // 开启调试模式
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})

autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
});

autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
});

autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');
});



app.on('ready', () => {
  // Create the Menu
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  createWindow();
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

/**
 *  
 * 选择一种更新方式
 * */

// 自动更新: 当应用退出时, 会立即下载更新并安装

app.on('ready', function()  {
  autoUpdater.checkForUpdatesAndNotify();
});


// 手动更新

// 详情查看: https://github.com/electron-userland/electron-builder/wiki/Auto-Update#events

// The app doesn't need to listen to any events except `update-downloaded`

// app.on('ready', function()  {
//   autoUpdater.checkForUpdates();
// });
// autoUpdater.on('checking-for-update', () => {
// })
// autoUpdater.on('update-available', (info) => {
// })
// autoUpdater.on('update-not-available', (info) => {
// })
// autoUpdater.on('error', (err) => {
// })
// autoUpdater.on('download-progress', (progressObj) => {
// })
// autoUpdater.on('update-downloaded', (info) => {
//   autoUpdater.quitAndInstall();  
// })


// function sendUpdateMessage(message, data) {
//   mainWindow.webContents.send('message', {
//     message,
//     data
//   });
// }

// const checkForUpdate = () => {
//   // 设置检查更新的 url，并且初始化自动更新
//   autoUpdater.setFeedURL(feedURL);

//   // 监听错误
//   autoUpdater.on('error', message => {
//     sendUpdateMessage('err', message);
//   });

//   // 当开始检查更新的时候触发
//   autoUpdater.on('checking-for-update', message => {
//     sendUpdateMessage('checking-for-update', message);
//   });

//   autoUpdater.on('download-progress', progressObj => {
//     sendUpdateMessage('downloadProgress', progressObj);
//   });

//   // 更新下载完成事件
//   autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) => {
//     ipcMain.on('updateNow', (e, arg) => {
//       autoUpdater._appUpdateConfigPath.quitAndUpdate();
//     });

//     sendUpdateMessage('isUpdateNow');
//   });

//   // 向服务端查询现在是否有可用的更新
//   autoUpdater.checkForUpdates();
// }

// // 监听自定义事件
// ipcMain.on('update', (e, arg) => {
//   checkForUpdate();
// });
