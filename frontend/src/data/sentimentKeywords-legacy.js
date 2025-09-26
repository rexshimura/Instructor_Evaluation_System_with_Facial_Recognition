// // src/data/sentimentKeywords-legacy.js
//
// // Using objects to assign weights to each keyword
// const positiveKeywords = {
//   "good": 1,
//   "helpful": 1,
//   "knowledgeable": 1,
//   "approachable": 1,
//   "fun": 1,
//   "clear": 1,
//   "effective": 1,
//   "insightful": 1,
//   "responsive": 1,
//   "caring": 1,
//   "supportive": 1,
//   "patient": 1,
//   "organized": 1,
//   "thorough": 1,
//   "fair": 1,
//   "passionate": 1,
//   "welcoming": 1,
//   "easy": 1,
//   "simple": 1,
//   "interesting": 1,
//   "concise": 1,
//   "well-structured": 1,
//
//   "great": 2,
//   "fantastic": 2,
//   "impressive": 2,
//   "masterful": 2,
//
//   "excellent": 3,
//   "best": 3,
//   "outstanding": 3
// };
//
// const negativeKeywords = {
//   "bad": -1,
//   "confusing": -1,
//   "unclear": -1,
//   "poor": -1,
//   "boring": -1,
//   "vague": -1,
//   "slow": -1,
//   "fast": -1,
//   "unhelpful": -1,
//   "unresponsive": -1,
//   "hard": -1,
//   "complicated": -1,
//   "unorganized": -1,
//   "rushed": -1,
//   "lacks": -1,
//   "fails": -1,
//   "struggled": -1,
//   "difficult": -1
// };
//
// const negationKeywords = [
//   "not", "n't", "never", "no", "without"
// ];
//
// const intensifierKeywords = {
//   "very": 2,
//   "extremely": 2,
//   "so": 2,
//   "really": 2,
//   "highly": 2
// };
//
// const diminisherKeywords = {
//   "a bit": 0.5,
//   "slightly": 0.5,
//   "somewhat": 0.5
// };
//
// export { positiveKeywords, negativeKeywords, negationKeywords, intensifierKeywords, diminisherKeywords };