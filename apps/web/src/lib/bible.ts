"use strict";

// Constants
const PROVIDER = "http://labs.bible.org/api/?type=json&passage=";

export class BibleEnglish {
  static reference?: string;

  /**
   * getVerse
   * Gets the reference using labs.bible.org provider.
   *
   * @name getVerse
   * @function
   * @param {String} reference Bible verse reference
   * @param {Function} callback The callback function
   * @return
   */
  static async getVerse(reference: string): Promise<any> {
    if (this.reference) {
      reference = this.reference;
    }
    
    try {
      const response = await fetch(PROVIDER + reference);
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.message);
      }
      return await response.json();
    } catch (err) {
      throw err;
    }
  }
}

const bible = new BibleEnglish();

export default bible;
