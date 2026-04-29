function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function interpolateString(str, context) {
  return str.replace(/\{\{(.+?)\}\}/g, (match, path) => {
    const trimmedPath = path.trim();
    const value = getNestedValue(context, trimmedPath);
    if (value === undefined) {
      throw new Error(`Variable resolution failed: "${trimmedPath}" is not defined in the execution context.`);
    }
    return String(value);
  });
}

export function interpolate(target, context) {
  if (typeof target === 'string') {
    return interpolateString(target, context);
  }

  if (Array.isArray(target)) {
    return target.map(item => interpolate(item, context));
  }

  if (target !== null && typeof target === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(target)) {
      result[key] = interpolate(value, context);
    }
    return result;
  }

  return target;
}

export default interpolate;

