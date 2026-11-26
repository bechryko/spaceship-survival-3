export function classNames(classes: Record<string, unknown>): string | undefined {
  const classNames = Object.entries(classes)
    .reduce<string[]>((previous, [className, condition]) => {
      if (condition) {
        return [...previous, className];
      }
      return previous;
    }, [])
    .join(' ');

  if (classNames.length === 0) {
    return undefined;
  }
  return classNames;
}
