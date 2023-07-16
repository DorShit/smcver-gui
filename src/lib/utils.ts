export function hasSpace(str: string): boolean {
    return str.includes(' ');
  }
  
  export function removeFrom(text: string, note: string): string{
      const indexToRemoveFrom = text.lastIndexOf(note);
      if (indexToRemoveFrom === -1) {
          return text;
      }
      return text.substring(0, indexToRemoveFrom);
  }
  
  export function removeUntil(text: string, note: string): string{
      const indexToRemoveFrom = text.indexOf(note);
      if (indexToRemoveFrom === -1) {
          return text;
      }
      return text.substring(indexToRemoveFrom);
  }
  
  export function isCex(file: string) : boolean {
      const indexToRemoveFrom = file.indexOf("cex");
      if (indexToRemoveFrom === -1) {
          return false;
      }
      return true;
  }