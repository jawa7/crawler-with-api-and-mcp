function normalizeUrl(url: string, baseUrl: string | null): string | null {
  if (!url?.trim()) return null;

  try {
    let resolvedUrl: URL;

    if (url.startsWith('//')) {
      resolvedUrl = new URL(`https:${url}`);
    } else if (url.startsWith('/') && !url.includes('www')) {
      if (!baseUrl) return null;
      resolvedUrl = new URL(baseUrl.slice(0, -1) + url);
    } else {
      // Если нет схемы, добавляем https:// по умолчанию
      const hasScheme = /^https?:\/\//i.test(url);
      const urlToParse = hasScheme ? url : `https://${url}`;
      resolvedUrl = new URL(urlToParse);
    }

    if (!resolvedUrl.protocol.startsWith('http')) return null;

    if (resolvedUrl.hostname.startsWith('www.')) {
      resolvedUrl.hostname = resolvedUrl.hostname.replace(/^www\./, '');
    }
    return resolvedUrl.href;
  } catch (e) {
    console.error('Error normalizing URL:', e);
    return null;
  }
}

export { normalizeUrl };
