/** 
  utils.ts - General functions to use all over the project.
*/

/**
  input: string 
  output: true if the string has space/s, false otherwise.
*/
export function hasSpace(str: string): boolean {
    return str.includes(' ');
  }
  
  /**
    input: string, substring
    output: [0, the last appearnce of the substring].
  */
  export function removeFrom(text: string, char: string): string{
      const indexToStopRemove = text.lastIndexOf(char);
      if(indexToStopRemove === -1) {
          return text;
      }
      return text.substring(0, indexToStopRemove);
  }
  
  /**
    input: string, substring 
    output: [substring, end of stirng].
  */
  export function removeUntil(text: string, char: string): string{
      const indexToRemoveFrom = text.indexOf(char);
      if(indexToRemoveFrom === -1) {
          return text;
      }
      return text.substring(indexToRemoveFrom);
  }
  
  /**
    input: string 
    output: true if the string is a cex file name, false otherwise.
  */
  export function isCex(file: string) : boolean {
      const indexToRemoveFrom = file.indexOf("cex");
      if(indexToRemoveFrom === -1) {
          return false;
      }
      return true;
  }