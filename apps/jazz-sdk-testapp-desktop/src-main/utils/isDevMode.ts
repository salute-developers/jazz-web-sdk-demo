export function isDevMode(): boolean {
  // process.defaultApp available in electron dev environment
  return Boolean(process.defaultApp);
}
