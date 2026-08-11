const LEAFLET_STYLESHEET_ID = 'zadna-leaflet-styles';

export function ensureLeafletStylesheet(): void {
  const documentRef = globalThis.document;
  if (!documentRef || documentRef.getElementById(LEAFLET_STYLESHEET_ID)) {
    return;
  }

  const link = documentRef.createElement('link');
  link.id = LEAFLET_STYLESHEET_ID;
  link.rel = 'stylesheet';
  link.href = new URL('assets/leaflet/leaflet.css', documentRef.baseURI).toString();
  documentRef.head.appendChild(link);
}
