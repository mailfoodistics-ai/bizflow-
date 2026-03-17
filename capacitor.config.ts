import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.bizflow.pos",
  appName: "BizFlow POS",
  webDir: "dist",
  server: {
    androidScheme: "https",
    cleartext: false,
    allowNavigation: ["api.supabase.co", "mail.google.com", "bizflow.app"],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#000000",
      showSpinner: false,
      spinnerStyle: "large",
      spinnerColor: "#3366ff",
    },
  },
};

export default config;
