# Native builds (Android + iOS)

SnapBooth is a PWA-first web app that can also be wrapped as a native
Android/iOS shell using [Capacitor](https://capacitorjs.com/). Everything
here runs on your own machine — Lovable's sandbox cannot produce `.apk`
or `.ipa` binaries.

## One-time setup

```bash
# from the project root, after cloning locally
bun install
bun run build           # generates dist/
npx cap add android     # (requires Android Studio + JDK 17)
npx cap add ios         # (requires macOS + Xcode 15+)
npx cap sync
```

## Every time you change the web app

```bash
bun run build
npx cap sync
```

## Open the native project

```bash
npx cap open android    # launches Android Studio
npx cap open ios        # launches Xcode
```

From there, use the IDE's standard "Run" flow to install on a device or
emulator. To ship to stores, follow the platform guides:

- Android: <https://developer.android.com/studio/publish>
- iOS: <https://developer.apple.com/app-store/submissions/>

## Server URL vs. bundled assets

`capacitor.config.ts` ships with `server.url` commented out. That means the
shell loads the copy of `dist/` bundled at build time. To make the shell
always fetch the latest deploy instead, set `server.url` to your published
`https://…lovable.app` URL and re-run `npx cap sync`.

## Permissions

The Camera and Filesystem plugins are pre-installed. Their permission
strings live in the generated native projects:

- Android — `android/app/src/main/AndroidManifest.xml`
- iOS — `ios/App/App/Info.plist` (`NSCameraUsageDescription`, `NSMicrophoneUsageDescription`, `NSPhotoLibraryUsageDescription`)

Update the copy before submitting to the stores.