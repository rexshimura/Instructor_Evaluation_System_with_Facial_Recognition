const lexicon = {
  positive: {
    "good": 1, "love": 1, "great": 2, "excellent": 3, "best": 3, "outstanding": 3, "fantastic": 2,
    "awesome": 2, "wonderful": 2, "terrific": 2, "superb": 2, "brilliant": 2,
    "helpful": 1, "knowledgeable": 1, "approachable": 1, "engaging": 1, "clear": 1,
    "effective": 1, "insightful": 1, "responsive": 1, "caring": 1, "supportive": 1, "patient": 1,
    "thorough": 1, "fair": 1, "passionate": 1, "welcoming": 1, "easy": 1,
    "simple": 1, "interesting": 1, "concise": 1, "informative": 1, "inspiring": 1,
    "encouraging": 1, "masterful": 2, "impressive": 2, "well-structured": 2,
    "understandable": 1, "comprehensible": 1, "accommodating": 1, "flexible": 1,
    "accessible": 1, "motivating": 2, "enriching": 2, "rewarding": 2, "valuable": 2,
    "impactful": 2, "constructive": 2, "just": 1, "balanced": 1, "friendly": 1,
    "personable": 1, "professional": 1, "prepared": 1, "positive": 1, "enjoyed": 1,
    "loved": 2, "liked": 1, "excited": 1, "grateful": 2, "happy": 1, "satisfied": 1,
    "pleasant": 1, "compelling": 2, "innovative": 2, "thoughtful": 2, "meticulous": 2,
    "well-researched": 2, "dynamic": 2, "interactive": 2, "collaborative": 2,
    "resourceful": 2, "empowering": 2, "transformative": 3, "life-changing": 3, "pedagogical": 2,
    "rigorous": 1, "challenging": 1, "respectful": 2, "empathetic": 2, "understanding": 2,
    "considerate": 2, "clear-cut": 1, "organized": 2, "efficient": 1, "engrossing": 2,
    "captivating": 2, "mind-expanding": 3, "intellectually stimulating": 3,
    "fostered curiosity": 2, "enlightening": 2, "illuminating": 2, "instructive": 2,
    "masterfully-taught": 3, "an absolute lifesaver": 3, "a true inspiration": 3,
    "made learning fun": 2, "commendable": 2, "praiseworthy": 2, "admirable": 2, "useful": 0.5,
    "encouraged growth": 2, "okay": 0.5, "alright": 0.5, "fine": 0.5, "decent": 0.5, "encourages": 1,
  },

  negative: {
    "bad": -1, "hate": -2, "poor": -1, "terrible": -2, "awful": -2, "horrible": -2, "disappointing": -1,
    "confusing": -1, "unclear": -1, "boring": -1, "vague": -1, "slow": -1, "unhelpful": -1,
    "unresponsive": -1, "hard": -1, "difficult": -2, "complicated": -1, "stupid": -1,
    "rushed": -1, "lacks": -2, "fails": -2, "struggled": -2,
    "frustrating": -2, "annoying": -1, "irrelevant": -1, "messy": -1, "unnecessary": -1,
    "conflicted": -1, "unengaging": -1, "abrupt": -1, "tedious": -2, "monotonous": -2,
    "overwhelming": -2, "unstructured": -1, "ambiguous": -1, "redundant": -1,
    "inaccessible": -1, "rigid": -1, "biased": -1, "unfair": -2, "inconsistent": -1,
    "unreliable": -1, "unprepared": -1, "irresponsible": -1, "hostile": -2, "intimidating": -2,
    "negative": -1, "hated": -2, "disliked": -1, "annoyed": -1, "disappointed": -1,
    "upset": -1, "rude": -1, "unapproachable": -1, "incompetent": -2, "unqualified": -2,
    "disrespectful": -2, "dismissive": -2, "prejudicial": -2, "arbitrary": -2,
    "aggravating": -2, "infuriating": -2, "disheartening": -2, "discouraging": -2,
    "inefficient": -1, "unprofessional": -2, "unfocused": -1, "unproductive": -1,
    "underwhelming": -2, "lackluster": -2, "uninspiring": -2, "mind-numbing": -3,
    "incoherent": -2, "outdated": -1, "unreasonable": -2, "disorganized": -2,
    "disconcerting": -2, "unfavorable": -1, "devil": -1, "terror": -2, "worst": -2,
  },

  negation: new Set(["not", "n't", "never", "no", "without", "lacking", "lacks", "don't", "can't", "didn't", "won't", "shouldn't", "couldn't", "wasn't", "isn't", "aren't", "weren't"]),

  intensifier: {
    "very": 2, "extremely": 2, "so": 2, "really": 2, "highly": 2, "totally": 2,
    "completely": 2, "absolutely": 2, "utterly": 2, "exceptionally": 2, "incredibly": 2,
    "truly": 2, "remarkably": 2, "unusually": 2, "particularly": 2, "dramatically": 2,
    "profoundly": 2, "significantly": 2, "massively": 2, "undeniably": 2, "certainly": 2,
    "unquestionably": 2, "deeply": 2, "severely": 2
  },

  diminisher: {
    "a bit": 0.5, "slightly": 0.5, "somewhat": 0.5, "a little": 0.5, "partially": 0.5, "mildly": 0.5,
    "minimally": 0.5, "hardly": 0.5, "vaguely": 0.5, "barely": 0.5, "sort of": 0.5
  },

  phrases: {
    positive: {
      "easy to follow": 2, "well prepared": 2, "a big help": 2, "easy to understand": 2,
      "well-structured": 2, "clear explanation": 2, "organized class": 2,
      "quick to respond": 2, "made it easy": 2, "truly inspiring": 2,
      "stayed on track": 2, "easy to navigate": 2, "worth my time": 2,
      "made sense": 1, "above and beyond": 3, "made a difference": 3,
      "felt very prepared": 2, "highly recommend": 2, "learned a lot": 2,
      "took away a lot": 2, "eye-opening": 2, "thought-provoking": 2,
      "provided great resources": 2, "answered all my questions": 2,
      "encouraged participation": 2, "made me feel welcome": 2,
      "fair grading": 2, "constructive feedback": 2, "clear instructions": 2,
      "went the extra mile": 3, "made all the difference": 3,
      "office hours were helpful": 2, "the professor was available": 2,
      "class was a breeze": 1, "the workload was manageable": 1,
      "would take again": 2, "had a great time": 2, "an absolute pleasure": 3,
      "was an absolute pleasure": 3, "gave great feedback": 2, "provided clear instructions": 2
    },
    negative: {
      "hard to follow": -2, "difficult to understand": -2, "not prepared": -2, "did not help": -2,
      "not clear": -2, "difficult to grasp": -2, "too slow": -2, "too fast": -2,
      "waste of time": -3, "went off topic": -2, "didn't make sense": -2,
      "did not feel prepared": -2, "very lost": -2, "not what I expected": -2,
      "lack of clarity": -2, "poor time management": -2, "struggled to keep up": -2,
      "poorly explained": -2, "unclear expectations": -2, "graded unfairly": -3,
      "confusing syllabus": -2, "inconsistent grading": -2, "unorganized lectures": -2,
      "hard to reach": -2, "did not provide feedback": -2,
      "office hours were useless": -2, "went over the material too quickly": -2,
      "made me feel stupid": -3, "unmanageable workload": -2,
      "lacked passion": -2, "the class was a mess": -2, "assignments were pointless": -2,
      "would not recommend": -3, "wish I had not taken": -3,
      "the grading was a black box": -3, "the lectures were incoherent": -2,
      "the material was outdated": -2, "had to teach myself": -2,
      "the professor was rude": -2, "felt completely lost": -3, "felt very discouraged": -2
    }
  },

  implicit: {
    "no feedback": -2,
    "never responded": -2,
    "did not get any": -2,
    "lacks in": -2,
    "did not cover": -2,
    "did not address": -2,
    "took too long": -2,
    "poorly explained": -2,
    "felt very lost": -2,
    "didn't show up": -2,
    "showed up late": -1,
    "never graded": -2,
    "final was a surprise": -2,
    "no communication": -2,
    "barely lectured": -2,
    "didn't seem to care": -3,
    "went on a tangent": -1,
    "stuck to the book": -1,
    "I barely passed": -1,
    "I had to teach myself": -2,
    "the course website was a mess": -2,
    "langayan": -1
  }
};

export default lexicon;