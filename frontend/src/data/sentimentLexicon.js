const lexicon = {
  positive: {
    // ================= ENGLISH (GENERAL & EXPANDED) =================
    "good": 1, "love": 1, "great": 2, "excellent": 3, "best": 3, "outstanding": 3,
    "fantastic": 2, "awesome": 2, "wonderful": 2, "terrific": 2, "superb": 2,
    "brilliant": 2, "perfect": 3, "solid": 2, "amazing": 2, "impressive": 2,
    "commendable": 2, "praiseworthy": 2, "admirable": 2, "exceptional": 3,
    "phenomenal": 3, "top-tier": 3, "world-class": 3, "legendary": 3, "goat": 3,
    "stellar": 3, "splendid": 2, "magnificent": 2, "remarkable": 2, "superior": 2,
    "high-quality": 2, "first-rate": 3, "invaluable": 3, "essential": 2,

    // Teaching Style & Delivery
    "helpful": 1, "knowledgeable": 1, "approachable": 1, "engaging": 1, "clear": 1,
    "effective": 1, "insightful": 1, "thorough": 1, "passionate": 1, "informative": 1,
    "inspiring": 1, "encouraging": 1, "masterful": 2, "well-structured": 2,
    "understandable": 1, "comprehensible": 1, "hands-on": 2, "practical": 2,
    "interactive": 2, "collaborative": 2, "detailed": 1, "systematic": 2,
    "structured": 2, "articulate": 1, "eloquent": 2, "fluent": 1, "concise": 1,
    "precise": 1, "direct": 1, "simplified": 1, "digestible": 1,
    "expert": 2, "genius": 2, "pro": 1, "veteran": 1, "mastery": 2, "proficiency": 1,
    "updated": 1, "modern": 1, "relevant": 1, "current": 1,
    "lucid": 1, "coherent": 1, "logical": 1, "organized": 2, "methodical": 2,
    "comprehensive": 2, "relatable": 1, "demonstrative": 1, "visual": 1,
    "lively": 1, "vibrant": 1, "dynamic": 2, "stimulating": 2,
    "thought-provoking": 2, "intellectual": 1, "academic": 1, "scholarly": 1,
    "well-prepared": 2, "rehearsed": 1, "polished": 1, "well-researched": 2,
    "resourceful": 2, "empowering": 2, "pedagogical": 2, "rigorous": 1,
    "challenging": 1, "clear-cut": 1, "efficient": 1, "engrossing": 2,
    "captivating": 2, "mind-expanding": 3, "intellectually stimulating": 3,
    "simplifying": 0.5, "fostered curiosity": 2, "enlightening": 2, "illuminating": 2,
    "instructive": 2, "masterfully-taught": 3, "an absolute lifesaver": 3,
    "a true inspiration": 3, "highly": 1.5, "made learning fun": 2, "useful": 0.5,
    "encouraged growth": 2, "encourages": 1,

    // Personality & Behavior
    "responsive": 1, "caring": 1, "supportive": 1, "patient": 1, "fair": 1,
    "welcoming": 1, "friendly": 1, "personable": 1, "professional": 1, "prepared": 1,
    "positive": 1, "accommodating": 1, "flexible": 1, "accessible": 1, "kind": 1,
    "generous": 2, "lenient": 1, "humane": 2, "considerate": 2, "empathetic": 2,
    "understanding": 2, "respectful": 2, "humble": 1, "cheerful": 1,
    "punctual": 1, "ontime": 1, "early": 1, "available": 1, "reachable": 1,
    "unbiased": 2, "objective": 1, "equitable": 2, "just": 1, "balanced": 1,
    "transparent": 2, "honest": 2, "integrity": 2, "ethical": 2, "principled": 2,
    "open-minded": 2, "warm": 1, "gentle": 1, "calm": 1, "composed": 1,
    "dignified": 1, "role-model": 3, "mentor": 3, "guide": 2, "fatherly": 1,
    "motherly": 1, "dedicated": 2, "committed": 2, "hardworking": 2,
    "timely": 1, "prompt": 1, "fast": 1, "constructive": 2, "corrective": 1,
    "specific": 1, "reasonable": 1, "justified": 1, "valid": 1,

    // Experience/Vibe
    "easy": 1, "simple": 1, "interesting": 1, "fun": 1, "enjoyable": 1,
    "energetic": 1, "cool": 1, "chill": 1, "vibes": 1, "relaxing": 1,
    "motivating": 2, "enriching": 2, "rewarding": 2, "valuable": 2, "impactful": 2,
    "transformative": 3, "life-changing": 3, "eye-opening": 2, "memorable": 2,
    "humorous": 1, "funny": 1, "witty": 1, "entertaining": 1, "jolly": 1,
    "pleasant": 1, "delightful": 1, "refreshing": 1, "stress-free": 2,
    "comfortable": 1, "safe": 1, "inclusive": 2, "diverse": 1,
    "happy": 1, "satisfied": 1, "excited": 1, "grateful": 2, "liked": 1, "loved": 2,
    "enjoyed": 1, "compelling": 2, "innovative": 2, "thoughtful": 2, "meticulous": 2,

    // Modifiers
    "okay": 0.5, "alright": 0.5, "fine": 0.5, "decent": 0.5,
    "manageable": 1,

    // ================= TAGALOG =================
    "maganda": 1, "maayos": 1, "ayos": 1, "magaling": 2, "husay": 2, "mahusay": 2,
    "galing": 2, "lupit": 2, "malupit": 2, "hanep": 1, "panalo": 2, "bilib": 2,
    "astig": 2, "petmalu": 2, "lodi": 3, "werpa": 1, "idol": 2, "thebest": 3,
    "dabest": 3, "swabe": 1, "sakto": 1, "panis": 1,
    "mabait": 1, "masipag": 2, "matiyaga": 1, "madaling": 1, "malinaw": 1,
    "masaya": 1, "nakakatuwa": 1, "nakaka-inspire": 2, "nakakagana": 1,
    "maintindihan": 1, "nagtuturo": 1, "sulit": 2, "mapagbigay": 2, "makatao": 2,
    "matulungin": 1, "kalmado": 1, "kwela": 1, "mabiro": 1, "malumanay": 1,
    "walang-arte": 1, "hindi-terror": 1, "hindi-masungit": 1, "trop": 1,
    "tropa": 1, "barkada": 1, "konsiderasyon": 2, "madali-kausap": 2,

    // ================= BISAYA / CEBUANO =================
    "nindot": 1, "gwapo": 1, "chada": 1, "payter": 2, "maayo": 2,
    "ngilngig": 2, "banggiitan": 2, "hanas": 2, "hawod": 2, "swito": 2,
    "bright": 1, "brayt": 1, "kumbati": 1, "lami": 1, "bagsik": 1,
    "gamhanan": 2, "walay-kurat": 1, "goods": 1, "fyt": 1, "fyts": 1,
    "keri": 1, "rapsa": 1, "buotan": 1, "sayon": 1, "masabtan": 1,
    "lingaw": 1, "bibo": 1, "kalog": 2, "jamming": 2, "jaming": 2,
    "walay-libog": 2, "dili-libog": 2, "way-libog": 2, "mura-rag-barkada": 2,
    "mura-rag-amigo": 2, "daling-duol": 1, "daling-sabton": 1, "mapainubsanon": 2,
    "kugihan": 2, "kugi": 1, "dili-tapulan": 2, "gaan": 1,
  },

  negative: {
    // ================= ENGLISH (GENERAL & EXPANDED) =================
    "bad": -1, "hate": -2, "poor": -1, "terrible": -2, "awful": -2, "horrible": -2,
    "disappointing": -1, "disaster": -2, "worst": -3, "useless": -2, "pointless": -2,
    "waste": -2, "trash": -3, "garbage": -3, "nonsense": -2, "bullshit": -3, "bs": -2,
    "unacceptable": -2, "dreadful": -2, "atrocious": -2, "abysmal": -3,
    "failed": -2, "fail": -2, "failure": -2, "mediocre": -1, "inferior": -1,
    "subpar": -2, "lacking": -1, "inadequate": -1, "insufficient": -1, "weak": -1,
    "pathetic": -2, "shameful": -2, "disgraceful": -2,

    // Clarity/Understanding & Teaching Method
    "confusing": -1, "unclear": -1, "vague": -1, "ambiguous": -1, "incoherent": -2,
    "complicated": -1, "messy": -1, "disorganized": -2, "unstructured": -1,
    "hard": -1, "difficult": -1, "complex": -1, "overwhelming": -1,
    "mind-numbing": -3, "boring": -1, "dull": -1, "monotonous": -2, "tedious": -2,
    "sleepy": -1, "drowsy": -1, "unengaging": -1, "dry": -1, "repetitive": -1,
    "redundant": -1, "irrelevant": -1, "spoon-feeding": -1, "reading": -1,
    "tangent": -1, "off-topic": -1, "inconsiderate": -1, "scattered": -1,
    "rambling": -1, "disjointed": -1, "illogical": -2, "abstract": -1,
    "theoretical": -0.5, "bookish": -1, "outdated": -1, "traditional": -0.5,
    "clueless": -2, "confused": -1, "incompetent": -2, "unqualified": -2,
    "inexperienced": -1, "unprepared": -1, "novice": -1, "amateur": -1,
    "unhelpful": -1, "stupid": -1, "rushed": -1, "lacks": -2, "fails": -2,
    "struggled": -2, "frustrating": -2, "annoying": -1, "unnecessary": -1,
    "conflicted": -1, "abrupt": -1, "inaccessible": -1, "inconsistent": -1,
    "unreliable": -1, "irresponsible": -1, "inefficient": -1, "unproductive": -1,
    "underwhelming": -2, "lackluster": -2, "uninspiring": -2, "unreasonable": -2,
    "disconcerting": -2, "unfavorable": -1,

    // Voice & Communication
    "inaudible": -2, "quiet": -1, "soft-spoken": -1, "mumbling": -2, "mumbles": -2,
    "monotone": -2, "robotic": -1, "flat": -1, "shouting": -1, "yelling": -2,
    "screaming": -2, "loud": -1, "noisy": -1, "interrupting": -1,

    // Effort/Attendance
    "lazy": -2, "late": -1, "tardy": -1, "absent": -2, "missing": -1,
    "ghosted": -2, "ghost": -2, "slow": -1,
    "distracted": -1, "preoccupied": -1, "neglectful": -2, "negligent": -2,
    "careless": -1, "sloppy": -1, "absentee": -2, "cancelled": -1,

    // Attitude/Behavior
    "rude": -1, "arrogant": -2, "condescending": -2, "sarcastic": -1, "mocking": -2,
    "disrespectful": -2, "dismissive": -2, "hostile": -2, "intimidating": -2,
    "scary": -1, "terror": -2, "strict": -1, "harsh": -2, "demanding": -1,
    "rigid": -1, "unapproachable": -1, "cold": -1, "mean": -1, "angry": -1,
    "short-tempered": -2, "moody": -1, "insensitive": -2, "apathetic": -2,
    "unprofessional": -2, "immature": -2, "biased": -1, "unfair": -2,
    "subjective": -2, "favoritism": -2, "selective": -1, "prejudicial": -2,
    "boastful": -1, "prideful": -1, "judgmental": -2, "critical": -1,
    "nitpicky": -2, "petty": -2, "vindictive": -3, "vengeful": -3, "spiteful": -3,
    "creepy": -3, "uncomfortable": -2, "inappropriate": -3, "offensive": -2,
    "discriminatory": -3, "sexist": -3, "racist": -3, "insulting": -2,
    "humiliating": -3, "embarrassing": -2, "awkward": -1, "weird": -1,
    "egotistical": -2, "narcissistic": -2, "power-tripping": -3, "power-trip": -3,
    "unresponsive": -1, "negative": -1, "hated": -2, "disliked": -1,
    "annoyed": -1, "disappointed": -1, "upset": -1, "aggravating": -2,
    "infuriating": -2, "disheartening": -2, "discouraging": -2, "unfocused": -1,
    "devil": -1,

    // Workload/Grading
    "cramming": -1, "overload": -1, "heavy": -1, "burden": -2,
    "stressful": -2, "draining": -2, "exhausting": -2, "toxic": -3,
    "unfair-grading": -2, "arbitrary": -2, "stingy": -1, "strict-proctor": -1,
    "roam": -1, "impossible": -2, "illogical-grading": -2,
    "random": -2, "guessing": -2, "delayed": -1, "overdue": -1,
    "unmanageable": -2, "excessive": -2, "punishing": -2, "expensive": -1,
    "costly": -1,

    // ================= TAGALOG =================
    "pangit": -1, "sama": -1, "masama": -1, "baho": -2, "bulok": -2,
    "walang-kwenta": -2, "walang-silbi": -2, "sayang": -1, "basura": -2,
    "bobo": -3, "tanga": -3, "engot": -2, "inutil": -3, "labo": -1,
    "malabo": -1, "gulo": -1, "magulo": -1, "bagal": -1, "mabagal": -1,
    "hirap": -1, "mahirap": -1, "nakakainis": -1, "nakakaasar": -1,
    "nakakatamad": -1, "nakakaantok": -2, "nakakabagot": -2, "corny": -1,
    "laging-wala": -2, "bagsak": -2, "kuripot": -1, "madamot": -1,
    "nakakatakot": -1, "baduy": -1, "sabaw": -1, "nganga": -2,
    "lutang": -1, "tamad": -2, "batugan": -2, "sungit": -1,
    "masungit": -2, "suplado": -1, "suplada": -1, "bastos": -2,
    "epal": -1, "kupal": -2, "mayabang": -2, "yabang": -2,
    "mahangin": -1, "mapang-mata": -2, "matapobre": -2, "pabaya": -2,
    "iresponsable": -2, "sipsip": -2, "plastik": -2, "plastic": -2,
    "nambabagsak": -3, "roleta": -3, "hula-hula": -2,

    // ================= BISAYA / CEBUANO =================
    "bati": -1, "ngil-ad": -1, "hugaw": -1, "way-ayo": -2, "walay-ayo": -2,
    "way-lami": -2, "way-kwenta": -2, "way-nada": -2, "way-klaro": -2,
    "walay-klaro": -2, "usik": -1, "buang": -2, "boang": -2, "bugo": -2,
    "bogo": -2, "langayan": -1, "dugay": -1, "hinay": -1,
    "luya": -1, "labad": -1, "sakit-sa-ulo": -2, "makasapot": -2, "sapot": -1,
    "libog": -1, "kalibog": -1, "hanap": -1, "hanap-hanap": -1, "lisod": -1,
    "kalisod": -1, "hasol": -2, "samok": -1, "samokan": -2, "duka": -2,
    "katulgon": -1, "hagbong": -2, "hagbongon": -2, "tapulan": -2,
    "tapuwan": -2, "strikto": -1, "strikta": -1, "isog": -1, "hadlok": -1,
    "kuyaw": -1, "maldito": -2, "maldita": -2, "mug-ot": -1, "kusog-masuko": -1,
    "hambog": -2, "hambugero": -2, "hilas": -2, "arti": -1, "arte": -1,
    "libakira": -2, "libakiro": -2, "tabian": -1, "piste": -3, "yawa": -3,
    "animal": -3, "atay": -2, "bilatibay": -3, "tudlo-tudlo": -1,
    "report-report": -1, "baba": -1, "gamay-maghatag": -1, "dalo": -1,
    "kusog-manghagbong": -3, "hilig-manghagbong": -3, "wa'y": -1, "way": -1
  },

  negation: new Set([
    // English
    "not", "n't", "never", "no", "without", "lacking", "lacks", "don't", "can't",
    "didn't", "won't", "shouldn't", "couldn't", "wasn't", "isn't", "aren't",
    "weren't", "stop", "avoid", "hardly", "barely",
    // Tagalog
    "hindi", "di", "dili", "wala", "walang", "ayaw", "huwag", "wag",
    // Bisaya
    "wa", "way"
  ]),

  intensifier: {
    // English
    "very": 2, "extremely": 2, "so": 2, "really": 2, "highly": 2, "totally": 2,
    "completely": 2, "absolutely": 2, "utterly": 2, "exceptionally": 2,
    "incredibly": 2, "truly": 2, "remarkably": 2, "unusually": 2,
    "particularly": 2, "dramatically": 2, "profoundly": 2, "significantly": 2,
    "massively": 2, "undeniably": 2, "certainly": 2, "unquestionably": 2,
    "deeply": 2, "severely": 2, "super": 2, "too": 2, "overly": 2,
    // Tagalog
    "sobra": 2, "sobrang": 2, "grabe": 2, "talaga": 2, "napaka": 2,
    "masyado": 2, "masyadong": 2, "todo": 2, "tunay": 2, "ubod": 2, "saksakan": 2,
    // Bisaya
    "kaayo": 2, "kayo": 2, "hastang": 2, "pwerte": 2, "pwerteng": 2,
    "labihan": 2, "gyud": 1.5, "jud": 1.5, "perting": 2,
  },

  diminisher: {
    // English
    "a bit": 0.5, "slightly": 0.5, "somewhat": 0.5, "a little": 0.5,
    "partially": 0.5, "mildly": 0.5, "minimally": 0.5, "hardly": 0.5,
    "vaguely": 0.5, "barely": 0.5, "sort of": 0.5, "could": 0.5, "kinda": 0.5,
    // Tagalog
    "medyo": 0.5, "parang": 0.5, "konti": 0.5, "tila": 0.5, "bahagya": 0.5,
    // Bisaya
    "gamay": 0.5, "mura": 0.5, "murag": 0.5
  },

  phrases: {
    positive: {
      // English
      "easy to follow": 2, "well prepared": 2, "great": 2, "a big help": 2,
      "easy to understand": 2, "well-structured": 2, "clear explanation": 2,
      "organized class": 2, "quick to respond": 2, "made it easy": 2,
      "truly inspiring": 2, "stayed on track": 2, "easy to navigate": 2,
      "worth my time": 2, "made sense": 1, "above and beyond": 3,
      "made a difference": 3, "felt very prepared": 2, "highly recommend": 2,
      "learned a lot": 2, "took away a lot": 2, "eye-opening": 2,
      "thought-provoking": 2, "provided great resources": 2,
      "answered all my questions": 2, "encouraged participation": 2,
      "made me feel welcome": 2, "fair grading": 2, "constructive feedback": 2,
      "clear instructions": 2, "went the extra mile": 3,
      "made all the difference": 3, "office hours were helpful": 2,
      "the professor was available": 2, "class was a breeze": 1,
      "the workload was manageable": 1, "highly recommended": 2,
      "would take again": 2, "had a great time": 2, "an absolute pleasure": 3,
      "was an absolute pleasure": 3, "gave great feedback": 2,
      "provided clear instructions": 2,
      // Tagalog/Bisaya
      "walang arte": 1, "walay libog": 2, "daling duol": 1, "daling sabton": 1,
      "maayo motudlo": 2, "maayo mo explain": 2, "magaling magturo": 2,
      "lami magtudlo": 2, "gaan kasama": 1, "magaan ang loob": 1,
      "swak na swak": 2, "da best": 3, "lodi cakes": 2, "walay hasol": 2,
      "mura rag barkada": 2, "walay pressure": 1, "goods kaayo": 2,
      "chill lang": 1, "ok ra": 0.5, "oks ra": 0.5, "okay ra": 0.5,
    },
    negative: {
      // English
      "hard to follow": -2, "difficult to understand": -2, "not prepared": -2,
      "did not help": -2, "not clear": -2, "difficult to grasp": -2,
      "too slow": -2, "too fast": -2, "waste of time": -3, "went off topic": -2,
      "didn't make sense": -2, "did not feel prepared": -2, "very lost": -2,
      "not what I expected": -2, "lack of clarity": -2,
      "poor time management": -2, "struggled to keep up": -2,
      "poorly explained": -2, "unclear expectations": -2, "graded unfairly": -3,
      "confusing syllabus": -2, "inconsistent grading": -2,
      "unorganized lectures": -2, "hard to reach": -2,
      "did not provide feedback": -2, "office hours were useless": -2,
      "went over the material too quickly": -2, "made me feel stupid": -3,
      "unmanageable workload": -2, "lacked passion": -2,
      "the class was a mess": -2, "assignments were pointless": -2,
      "would not recommend": -3, "wish I had not taken": -3,
      "the grading was a black box": -3, "the lectures were incoherent": -2,
      "the material was outdated": -2, "had to teach myself": -2,
      "the professor was rude": -2, "felt completely lost": -3,
      "felt very discouraged": -2, "just reads the slides": -2,
      "spoon feeding": -1, "spoon fed": -1,
      // Tagalog/Bisaya
      "walang kwenta": -3, "walay ayo": -3, "way ayo": -3, "sakit sa ulo": -2,
      "labad sa ulo": -2, "sayang lang": -2, "sayang oras": -2,
      "dili motudlo": -3, "di nagtuturo": -3, "puro report": -2,
      "pa report": -1, "basta basta": -1, "lisod kaayo": -2, "hagbong tanan": -3,
      "walay klaro": -2, "way klaro": -2, "magbuot buot": -2,
      "kusog manghagbong": -3, "hilig manghagbong": -3,
      "walay konsiderasyon": -2, "walay consideration": -2, "way lami": -2,
      "makawala sa gana": -2, "dili kasabot": -2, "nag libog ko": -1,
      "hula hula": -2, "roleta ang grades": -3, "power trip": -3,
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
    "langayan": -1,
    "late lagi": -2,
    "absent parati": -2,
    "laging wala": -2,
    "walang consideration": -2,
    "di pumapasok": -2,
    "laging late": -1,
    // Bisaya
    "sige lag absent": -2, "sige lag late": -2, "way consideration": -2,
    "dili musulod": -2, "tagsa ra musulod": -1, "tagsa ra motudlo": -1,
    "wala juy ayo": -3, "wa juy ayo": -3, "perting lisura": -2,
    "basa ra sa slides": -2, "basa ra sa ppt": -2
  }
};

export default lexicon;