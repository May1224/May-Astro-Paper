import readingTime from "reading-time";

export type ReadingTime = {
  minutes: number;
  words: number;
};

export function getReadingTime(content: string): ReadingTime {
  const result = readingTime(content);

  return {
    minutes: Math.max(1, Math.ceil(result.minutes)),
    words: result.words,
  };
}
