export const THEME_STORAGE_KEY = "theme";

export type Theme = "light" | "dark" | "system";

/**
 * Runs before first paint so the right theme class is already on <html> —
 * otherwise a dark-mode user gets a flash of the light theme.
 */
export const themeInitScript = `(function(){try{var s=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)});var t=s==="light"||s==="dark"?s:"system";var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;
