export function hasSpace(str: string): boolean {
    return str.includes(' ');
  }
  
  export function removeFrom(text: string, char: string): string{
      const indexToStopRemove = text.lastIndexOf(char);
      if(indexToStopRemove === -1) {
          return text;
      }
      return text.substring(0, indexToStopRemove);
  }
  
  export function removeUntil(text: string, char: string): string{
      const indexToRemoveFrom = text.indexOf(char);
      if(indexToRemoveFrom === -1) {
          return text;
      }
      return text.substring(indexToRemoveFrom);
  }
  
  export function isCex(file: string) : boolean {
      const indexToRemoveFrom = file.indexOf("cex");
      if(indexToRemoveFrom === -1) {
          return false;
      }
      return true;
  }