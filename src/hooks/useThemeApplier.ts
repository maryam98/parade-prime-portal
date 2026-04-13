import { useEffect } from 'react';
import { useSiteSettings } from './useSiteSettings';

/**
 * Applies dynamic theme settings (colors, fonts, favicon, logo) from site_settings table
 */
export const useThemeApplier = () => {
  const settings = useSiteSettings();

  useEffect(() => {
    if (!settings || Object.keys(settings).length === 0) return;

    // Apply primary color
    if (settings.theme_primary_color) {
      const hex = settings.theme_primary_color;
      const hsl = hexToHSL(hex);
      if (hsl) {
        document.documentElement.style.setProperty('--primary', hsl);
      }
    }

    // Apply background color
    if (settings.theme_bg_color) {
      const hsl = hexToHSL(settings.theme_bg_color);
      if (hsl) {
        document.documentElement.style.setProperty('--background', hsl);
      }
    }

    // Apply text color
    if (settings.theme_text_color) {
      const hsl = hexToHSL(settings.theme_text_color);
      if (hsl) {
        document.documentElement.style.setProperty('--foreground', hsl);
      }
    }

    // Apply fonts
    if (settings.theme_heading_font) {
      document.documentElement.style.setProperty('--font-heading', `"${settings.theme_heading_font}", sans-serif`);
      loadGoogleFont(settings.theme_heading_font);
    }
    if (settings.theme_body_font) {
      document.documentElement.style.setProperty('--font-body', `"${settings.theme_body_font}", sans-serif`);
      loadGoogleFont(settings.theme_body_font);
    }

    // Apply favicon
    if (settings.site_favicon) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.site_favicon;
    }
  }, [settings]);

  return settings;
};

function hexToHSL(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function loadGoogleFont(fontName: string) {
  const id = `google-font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
}
