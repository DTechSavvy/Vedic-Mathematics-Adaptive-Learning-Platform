export class TextMatcher {
  static matchesPhrase(text: string, phrase: string): boolean {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const regex = new RegExp(`\\b${escaped}\\b`, 'i');

    return regex.test(text);
  }
}
