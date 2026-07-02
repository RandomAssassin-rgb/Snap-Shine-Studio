import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.snapbooth.mobile",
  appName: "SnapBooth",
  webDir: "dist",
  server: {
    // Point at your published Lovable URL so the mobile shell always loads the latest build.
    // For local dev, comment `url` and run `bun run build && npx cap sync`.
    // url: "https://your-project.lovable.app",
    cleartext: false,
  },
  plugins: {
    Camera: { permissions: ["camera", "photos"] },
  },
  ios: { contentInset: "always" },
  android: { allowMixedContent: false },
};

export default config;