declare namespace NodeJS {
  interface ProcessEnv {
    CRON_SECRET: string;
    GOOGLE_SHEETS_ID: string;
    GOOGLE_CLIENT_EMAIL: string;
    GOOGLE_PRIVATE_KEY: string;
  }
}
