const { app, BrowserWindow, shell } = require("electron");
const { start } = require("./server.js");

async function createWindow() {
  // Fiksēts ports, lai pārlūka saglabātie iestatījumi paliek starp palaišanas reizēm
  let port;
  try { port = await start(38211); } catch { port = await start(0); }
  const win = new BrowserWindow({
    width: 1280, height: 840, minWidth: 900, minHeight: 600,
    backgroundColor: "#0d0f1c", title: "Streamer Reader", autoHideMenuBar: true,
  });
  win.loadURL(`http://localhost:${port}`);
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
