export const splitWords = (text: string): string => {
  return text
    .split('')
    .map((char) => (char === ' ' ? ' ' : `<span>${char}</span>`))
    .join('');
};
