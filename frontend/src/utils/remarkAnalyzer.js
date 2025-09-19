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

import lexicon from "../data/sentimentLexicon";

// Create a Set for faster lookup of negation keywords.
const negationSet = lexicon.negation;

/**
 * Analyzes an array of remarks to determine the overall sentiment counts.
 * @param {string[]} remarks - An array of text strings to analyze.
 * @returns {object} An object containing the counts of positive, negative, and neutral remarks.
 */
const analyzeRemarks = (remarks) => {
  if (!remarks || remarks.length === 0) {
    return { positiveCount: 0, negativeCount: 0, neutralCount: 0 };
  }

  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  remarks.forEach(remark => {
    const lowerRemark = remark.toLowerCase();

    // A. PRIORITY: Check for phrases first (on the full remark).
    // This is the most reliable signal.
    if (lowerRemark.includes("mixed feelings")) {
      console.log(`\nRemark: "${remark}"`);
      console.log("Classification: NEUTRAL (Identified as mixed feelings)");
      neutralCount++;
      return; // Skip the rest of the analysis for this remark.
    }

    const words = lowerRemark.split(/[\s,.!?;:]+/).filter(word => word.length > 0);
    const butIndex = words.indexOf("but");

    let sentimentScore = 0;

    if (butIndex !== -1) {
      // B. BUT-CLAUSE LOGIC: Analyze both sides of the 'but' and give more weight to the second.
      const firstClauseWords = words.slice(0, butIndex);
      const secondClauseWords = words.slice(butIndex + 1);

      // Analyze the first clause
      let firstClauseScore = 0;
      firstClauseWords.forEach(word => {
        if (lexicon.positive[word]) firstClauseScore += lexicon.positive[word];
        if (lexicon.negative[word]) firstClauseScore += lexicon.negative[word];
      });

      // Analyze the second clause
      let secondClauseScore = 0;
      secondClauseWords.forEach(word => {
        if (lexicon.positive[word]) secondClauseScore += lexicon.positive[word];
        if (lexicon.negative[word]) secondClauseScore += lexicon.negative[word];
      });

      // Combine scores. A negative score in the second clause should cancel out a positive in the first.
      sentimentScore = secondClauseScore - firstClauseScore;

    } else {
      // C. STANDARD WORD-BY-WORD ANALYSIS: No 'but' found, proceed as normal.
      for (let i = 0; i < words.length; i++) {
        const currentWord = words[i];
        let sentimentValue = 0;
        let isNegated = false;
        let intensityModifier = 1;

        // Check for negation
        for (let j = 1; j <= 3; j++) {
          if (words[i - j] && negationSet.has(words[i - j])) {
            isNegated = true;
            break;
          }
        }

        // Check for intensifiers/diminishers
        const previousWord = words[i - 1];
        if (previousWord) {
            if (lexicon.intensifier[previousWord]) {
                intensityModifier = lexicon.intensifier[previousWord];
            } else if (lexicon.diminisher[previousWord]) {
                intensityModifier = lexicon.diminisher[previousWord];
            }
        }

        if (lexicon.positive[currentWord]) {
          sentimentValue = lexicon.positive[currentWord];
        } else if (lexicon.negative[currentWord]) {
          sentimentValue = lexicon.negative[currentWord];
        }

        if (sentimentValue !== 0) {
          let finalValue = sentimentValue * intensityModifier;
          if (isNegated) {
            finalValue *= -1;
          }
          sentimentScore += finalValue;
        }
      }
    }

    // D. FINAL CLASSIFICATION: Use the final score to classify.
    if (sentimentScore > 0) {
      positiveCount++;
    } else if (sentimentScore < 0) {
      negativeCount++;
    } else {
      neutralCount++;
    }

    console.log(`\nRemark: "${remark}"`);
    console.log(`Final Score: ${sentimentScore}`);
    console.log(`Classification: ${sentimentScore > 0 ? "positive" : sentimentScore < 0 ? "negative" : "neutral"}`);
  });

  return { positiveCount, negativeCount, neutralCount };
};

export default analyzeRemarks;