export const findNoteSize = (text: string): string => {
  const encoder = new TextEncoder();
  const encodedText = encoder.encode(text);
  const size = encodedText.length;
  const kb = size / 1024;
  return kb.toFixed(2);
};
