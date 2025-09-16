// src/utils/remarkAnalyzer.js

/* AYAW RANI HILABTI HEHE
 * This utility file is responsible for analyzing text remarks to determine their sentiment.
 * It provides a quick summary of whether comments are generally positive, negative, or neutral.
 *
 * It does NOT use a complex AI model. Instead, it uses a smarter keyword-based approach:
 * 1.  **Keyword Lists:** It imports predefined lists of positive, negative, and negation keywords.
 * 2.  **Tokenization:** It breaks down each remark into individual words.
 * 3.  **Contextual Analysis:** For each word, it checks if it's a sentiment keyword. It then looks at the words immediately before it to see if a negation word (like "not" or "never") is present. This handles tricky phrases like "not bad" correctly.
 * 4.  **Sentiment Scoring:** Based on the presence or absence of keywords and negations, it categorizes the remark and increments the appropriate counter.
 * The final output is a simple summary object with the total counts for positive, negative, and neutral comments.
 */

import { positiveKeywords, negativeKeywords, negationKeywords } from "../data/sentimentKeywords";

// Create sets for faster keyword lookup
const positiveSet = new Set(positiveKeywords);
const negativeSet = new Set(negativeKeywords);
const negationSet = new Set(negationKeywords);

const analyzeRemarks = (remarks) => {
  if (!remarks || remarks.length === 0) {
    return null;
  }

  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  remarks.forEach(remark => {
    const lowerRemark = remark.toLowerCase();
    const words = lowerRemark.split(/\s+/).filter(word => word.length > 0);

    let hasPositive = false;
    let hasNegative = false;

    for (let i = 0; i < words.length; i++) {
      const currentWord = words[i];

      // Check for negations in the 3 words preceding the current word
      const isNegated = (words[i - 1] && negationSet.has(words[i - 1])) ||
                        (words[i - 2] && negationSet.has(words[i - 2])) ||
                        (words[i - 3] && negationSet.has(words[i - 3]));

      if (positiveSet.has(currentWord)) {
        if (isNegated) {
          hasNegative = true;
        } else {
          hasPositive = true;
        }
      } else if (negativeSet.has(currentWord)) {
        if (isNegated) {
          hasPositive = true;
        } else {
          hasNegative = true;
        }
      }
    }

    if (hasPositive && !hasNegative) {
      positiveCount++;
    } else if (hasNegative && !hasPositive) {
      negativeCount++;
    } else {
      neutralCount++;
    }
  });

  return { positiveCount, negativeCount, neutralCount };
};

export default analyzeRemarks;