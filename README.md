# Streamer Reader

Streamer Reader listens to a Kick chat and **reads messages out loud, but only from viewers who have a high enough Kick level** (for example level 30 or higher). It is made for streamers who want to hear their most loyal viewers without being interrupted by everyone else.

The app is available in **English and Latvian** (switch with the LV / EN button in the top right) and includes a Latvian text-to-speech voice.

## Features

- Reads only the chat messages from viewers at or above the level you choose
- Latvian and English interface
- Works on **Mac and Windows** as a normal app, no terminal needed
- Latvian online voice, plus any voices already installed on your computer
- Speed, volume, skip and test controls, and a queue that drops old messages so the voice never falls far behind
- Links in chat are read as the word "link" and very long messages are shortened
- Optional: read the username before each message (off by default)
- Remembers your channel and settings for next time

## Download

Go to the **[Releases](../../releases)** page and download the file for your computer:

| System | File |
| --- | --- |
| Windows | the `.exe` installer |
| Mac (Apple chip, M1 or newer) | the `.dmg` file |

### Installing on Windows

1. Run the `.exe` file.
2. If a blue window says "Windows protected your PC", click **More info**, then **Run anyway**.
3. Follow the installer and open Streamer Reader from the Start menu.

### Installing on Mac

1. Open the `.dmg` and drag **Streamer Reader** into the **Applications** folder.
2. The first time, right-click the app and choose **Open**, then click **Open** again.
3. If macOS says the app is "damaged", open Terminal and run:
   ```
   xattr -cr "/Applications/Streamer Reader.app"
   ```
   Then open the app again.

### Why do these warnings appear?

Windows and macOS show a warning for any app that is not signed with a paid developer certificate. Streamer Reader is a free hobby project and is not signed, so the warning is expected. It does not mean the app is harmful.

## How to use

1. Type the streamer's Kick channel name (for example `xqc`).
2. Choose the minimum level, for example 30.
3. Choose a voice. For Latvian, pick **Latvian voice (online)**. Press **Test voice** to hear it.
4. Press **Start reading**.

Only viewers who meet the level are shown in the list and read aloud. Press **Stop** to disconnect.

### Good to know

- **Hidden level badges can't be read.** Kick's level badge is switched off by default, and each viewer has to turn it on (Chat → Settings → Identity → Global badges). A viewer who keeps it hidden looks the same as a viewer without a level, so the app cannot read them.
- **Viewers need to hear the voice.** Make sure your streaming software captures your computer's sound. OBS's built-in browser often does not support text-to-speech, so use the app as a normal window.
- **If the chatroom isn't found automatically**, open **Advanced settings** and paste the chatroom ID. To find it, open `https://kick.com/api/v2/channels/CHANNELNAME` in your browser, look for `"chatroom"` and copy the number next to `"id"`.

## Is it safe? Does it contain viruses?

**Streamer Reader does not contain viruses or malware.** It is a small, open-source program, and all of its code is in this repository, so anyone can read it and check what it does. There are only a few files: `index.html` (the interface), `server.js` (connects to Kick) and `main.js` (opens the window).

What the app does:

- It connects to **Kick's public chat** to receive chat messages, the same messages anyone can see on kick.com.
- It does **not** log in to your Kick account and never asks for a password, email or any personal information.
- It does **not** collect, store or send your data anywhere. There is no analytics, tracking or advertising.
- It saves only your own settings (channel name, level, voice settings, language) on your computer, inside the app.
- It does not install anything else, change system files, or run in the background after you close it.

The only internet connections it makes are:

| Connection | Why |
| --- | --- |
| `kick.com` and `web.kick.com` / `realtime.*.kick.com` | to find the chatroom and receive chat messages |
| `translate.google.com` | only when you use the Latvian online voice, to turn message text into speech |
| `fonts.googleapis.com` | to load the interface font |

If you want to double-check, you can:

- Read the source code in this repository.
- Upload the downloaded file to [virustotal.com](https://www.virustotal.com) and see the results. Occasionally one or two scanners flag unsigned apps by mistake. This is called a false positive.
- Build the app yourself from the source code (see below) instead of downloading it.

## Run from source (optional)

You need [Node.js](https://nodejs.org) 22 or newer.

```
npm install
npm start
```

To make the installers yourself:

```
npm run dist
```

The finished files appear in the `dist` folder. Build the Mac version on a Mac and the Windows version on Windows, or use the included GitHub Actions workflow (`.github/workflows/build.yml`), which builds both.

## Limitations

- Streamer Reader uses Kick's **unofficial** chat connection, which Kick can change at any time. If it stops working after a Kick update, the app will need an update too.
- The Latvian online voice uses Google Translate's public voice, which is also unofficial. It needs internet and may be slowed down or blocked by Google if used heavily.
- The Mac build is made for Macs with an Apple chip (M1 or newer).

## Disclaimer

Streamer Reader is an independent fan project. It is **not affiliated with, endorsed by, or connected to Kick**. Kick is a trademark of its owners. Use the app responsibly and respect Kick's terms of service.

---

## Īsi latviski

**Streamer Reader** nolasa skaļi Kick čata ziņas, bet tikai no skatītājiem, kuriem ir pietiekami augsts Kick līmenis (piemēram, 30 vai vairāk). Lietotne ir latviešu un angļu valodā, un tajā ir latviešu balss.

- **Lejupielāde:** sadaļā [Releases](../../releases) lejupielādē `.exe` (Windows) vai `.dmg` (Mac).
- **Lietošana:** ieraksti kanāla nosaukumu, izvēlies minimālo līmeni un balsi, spied **Sākt lasīšanu**.
- **Brīdinājumi instalējot:** Windows un Mac rāda brīdinājumu, jo lietotne nav parakstīta ar maksas sertifikātu. Windows: **More info** → **Run anyway**. Mac: ar peles labo pogu izvēlies **Open**.
- **Drošība:** lietotne nesatur vīrusus vai ļaunprātīgu kodu. Visas programmas koda rindas ir šajā krātuvē, un lietotne nevāc, nesūta un neglabā nekādus personas datus. Tā tikai klausās publisko Kick čatu.
- **Svarīgi:** skatītāji, kas paslēpuši savu līmeņa nozīmīti, netiks nolasīti, jo lietotne viņu līmeni neredz.
