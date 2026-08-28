import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.monikarogel.zamorafest',
  appName: 'ZamoraFest',
  webDir: 'dist',
  android: {
    allowMixedContent: true
  },
  server: {
    cleartext: true
  }
};

export default config;
