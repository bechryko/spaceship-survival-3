export function displayKeyCode(keyCode: string): string {
  return keyCode.replaceAll('Key', '').replaceAll('Numpad', 'Np');
}
