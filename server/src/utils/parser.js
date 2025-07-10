
export function parse(text, values = {}) {
  if (text === null || text === undefined) return text;
  if (typeof text !== 'string') return text;
  if (!text || !text.includes('{')) return text;

  return text.replace(/\{([^}]+)\}/g, (match, placeholder) => {
    const keys = placeholder.split('.');
    let current = values;
    for (const key of keys) {
      if (current === null || typeof current !== 'object' || !(key in current)) {
        return match;
      }
      current = current[key];
    }
    return String(current);
  });
}
