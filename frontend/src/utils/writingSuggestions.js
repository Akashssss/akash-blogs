/**
 * Hybrid Offline-First Writing & Vocabulary Suggestion Engine
 * - Natural English First: Extensive dictionary of common writing words (annoying, another, because, etc.).
 * - In-Document Learning: Prioritizes vocabulary already written in the current article.
 * - Curated Tech Dictionary: Popular developer frameworks, libraries, and terms.
 * - Clean Online Fallback: Only for specialized packages, filtered to avoid obscure hyphenated names.
 */

// ── 1. Comprehensive Common English Writing Dictionary (Ranked by Frequency) ──
const COMMON_ENGLISH_WORDS = [
  // A
  "ability", "about", "above", "absolute", "absolutely", "academic", "accept", "acceptable", "access", "accident",
  "accompany", "according", "account", "accurate", "accurately", "achieve", "achievement", "across", "action", "active",
  "actively", "activity", "actor", "actual", "actually", "adapt", "addition", "additional", "address", "adequate",
  "adjust", "administration", "admire", "admit", "adopt", "adult", "advance", "advanced", "advantage", "adventure",
  "advertising", "advice", "advise", "advocate", "affair", "affect", "afford", "afraid", "after", "afternoon",
  "afterward", "again", "against", "agency", "agenda", "agent", "aggressive", "agree", "agreement", "agricultural",
  "ahead", "alarm", "album", "alcohol", "alive", "allegation", "allege", "allied", "allow", "almost",
  "alone", "along", "already", "also", "alternative", "although", "altogether", "always", "amazing", "ambition",
  "amount", "analysis", "analyze", "ancient", "anger", "angle", "angry", "animal", "anniversary", "announce",
  "announcement", "annoy", "annoying", "annual", "annually", "anonymous", "another", "answer", "anticipate", "anxiety",
  "anxious", "anybody", "anymore", "anyone", "anything", "anyway", "anywhere", "apart", "apartment", "apparent",
  "apparently", "appeal", "appear", "appearance", "application", "apply", "appoint", "appointment", "appreciate", "approach",
  "appropriate", "approval", "approve", "approximate", "approximately", "architect", "architecture", "archive", "area", "argue",
  "argument", "arise", "armed", "army", "around", "arrange", "arrangement", "arrest", "arrival", "arrive",
  "arrow", "article", "artificial", "artist", "artistic", "aside", "aspect", "asphalt", "aspiration", "assault",
  "assemble", "assembly", "assert", "assess", "assessment", "asset", "assign", "assignment", "assist", "assistance",
  "assistant", "associate", "associated", "association", "assume", "assumption", "assurance", "assure", "astonishing", "athlete",
  "atmosphere", "attach", "attachment", "attack", "attain", "attempt", "attend", "attendance", "attention", "attitude",
  "attorney", "attract", "attraction", "attractive", "attribute", "audience", "author", "authority", "authorize", "auto",
  "automatic", "automatically", "automobile", "autumn", "availability", "available", "average", "avoid", "await", "award",
  "aware", "awareness", "awesome", "awful",

  // B
  "background", "backup", "balance", "balanced", "barrier", "baseline", "basic", "basically", "basis", "battery",
  "battle", "beach", "beauty", "because", "become", "before", "beginning", "behavior", "behind", "belief",
  "believe", "belong", "below", "benchmark", "beneath", "benefit", "beneficial", "beside", "besides", "better",
  "between", "beyond", "billion", "binary", "biology", "blank", "blanket", "block", "blogger", "boast",
  "board", "border", "bored", "boring", "borrow", "bother", "bottle", "bottom", "boundary", "branch",
  "brand", "brave", "breadth", "break", "breakdown", "breakthrough", "breathe", "breathing", "bridge", "brief",
  "briefly", "bright", "brilliant", "bring", "broad", "broadcast", "broadly", "broken", "browser", "budget",
  "buffer", "build", "builder", "building", "bullet", "bundle", "burden", "business", "busy", "button",

  // C
  "calculate", "calculation", "calculator", "calendar", "campaign", "campus", "cancel", "candidate", "canvas", "capability",
  "capable", "capacity", "capital", "capture", "career", "careful", "carefully", "carrier", "carry", "casual",
  "catalyst", "catch", "category", "cautious", "celebrate", "celebration", "central", "century", "certain", "certainly",
  "certificate", "chain", "chair", "challenge", "challenging", "chamber", "champion", "chance", "change", "channel",
  "chaos", "chapter", "characteristic", "characterize", "charge", "chart", "chase", "cheap", "check", "checklist",
  "chemical", "choice", "choose", "chronic", "chronological", "chunk", "circle", "circuit", "circular", "circumstance",
  "citizen", "civic", "civil", "claim", "clarify", "clarity", "classic", "classical", "classify", "clean",
  "clear", "clearly", "clever", "click", "client", "climate", "climb", "clinic", "clinical", "clipboard",
  "clock", "close", "closely", "closure", "cloth", "clothes", "cloud", "cluster", "coach", "coalition",
  "coastal", "cohesive", "cohort", "collaborate", "collaboration", "collaborative", "collapse", "colleague", "collect", "collection",
  "collective", "college", "column", "columnist", "combat", "combination", "combine", "command", "commander", "comment",
  "commentary", "commerce", "commercial", "commission", "commit", "commitment", "committee", "commodity", "common", "commonly",
  "communicate", "communication", "community", "compact", "companion", "company", "compare", "comparison", "compassion", "compatible",
  "compel", "compelling", "compensate", "compensation", "compete", "competition", "competitive", "competitor", "compile", "compiler",
  "complain", "complaint", "complement", "complete", "completely", "complex", "complexity", "compliance", "complicated", "comply",
  "component", "compose", "composition", "comprehensive", "compress", "compression", "compromise", "compute", "computer", "computing",
  "conceive", "concentrate", "concentration", "concept", "conceptual", "concern", "concerned", "conclude", "conclusion", "conclusive",
  "concrete", "concur", "concurrent", "condition", "conduct", "conference", "confidence", "confident", "configuration", "configure",
  "confirm", "confirmation", "conflict", "conform", "confront", "confusion", "connect", "connection", "connector", "conquer",
  "conscience", "conscious", "consciousness", "consecutive", "consensus", "consent", "consequence", "consequent", "consequently", "conservation",
  "conservative", "consider", "considerable", "considerably", "consideration", "consist", "consistent", "consistently", "console", "constant",
  "constantly", "constitute", "constraint", "construct", "construction", "consult", "consultant", "consulting", "consume", "consumer",
  "consumption", "contact", "contain", "container", "contemporary", "content", "contest", "context", "contextual", "continent",
  "contingent", "continue", "continued", "continuing", "continuous", "continuously", "contract", "contractor", "contradict", "contrary",
  "contrast", "contribute", "contribution", "contributor", "control", "controller", "controversial", "controversy", "convenience", "convenient",
  "convention", "conventional", "conversation", "conversion", "convert", "converter", "convey", "convince", "convincing", "cookie",
  "cooperate", "cooperation", "coordinate", "coordination", "coordinator", "copilot", "corner", "corporate", "corporation", "correct",
  "correction", "correctly", "correlate", "correlation", "correspond", "correspondence", "corridor", "costume", "cottage", "council",
  "counsel", "counselor", "counter", "counterpart", "countless", "country", "couple", "courage", "course", "court",
  "courtesy", "coverage", "creative", "creativity", "creator", "creature", "credibility", "credible", "credit", "crew",
  "crime", "criminal", "crisis", "criteria", "criterion", "critic", "critical", "critically", "criticism", "criticize",
  "cross", "crowd", "crucial", "crystal", "cultural", "culture", "curious", "current", "currently", "curriculum",
  "cursor", "custom", "customer", "customize", "customized", "cycle",

  // D
  "damage", "danger", "dangerous", "dashboard", "database", "daughter", "daylight", "deadline", "dealer", "dealing",
  "debate", "decade", "decay", "decent", "decide", "decision", "decisive", "declare", "declaration", "decline",
  "decode", "decrease", "dedicate", "dedicated", "deduce", "deduct", "deepen", "deeply", "default", "defeat",
  "defect", "defend", "defendant", "defense", "defensive", "deficit", "define", "definite", "definitely", "definition",
  "definitive", "degree", "delay", "delegate", "delete", "deletion", "deliberate", "deliberately", "delicate", "delight",
  "deliver", "delivery", "demand", "demanding", "democracy", "democrat", "democratic", "demographic", "demonstrate", "demonstration",
  "denial", "dense", "density", "depart", "department", "departure", "depend", "dependable", "dependence", "dependent",
  "depict", "deploy", "deployment", "deposit", "depreciation", "depress", "depression", "depth", "deputy", "derive",
  "descend", "describe", "description", "descriptive", "desert", "deserve", "design", "designate", "designer", "desirable",
  "desire", "desktop", "despair", "desperate", "desperately", "destination", "destroy", "destruction", "destructive", "detach",
  "detail", "detailed", "detain", "detect", "detection", "detector", "deteriorate", "determination", "determine", "determined",
  "develop", "developer", "developing", "development", "developmental", "device", "devise", "devote", "devoted", "diagnose",
  "diagnosis", "diagnostic", "diagram", "diagrams", "dialogue", "diameter", "differ", "difference", "different", "differently",
  "difficult", "difficulty", "diffuse", "digest", "digital", "digitally", "dignity", "dilemma", "dimension", "dimensional",
  "diminish", "direction", "directly", "director", "directory", "disability", "disabled", "disadvantage", "disagree", "disagreement",
  "disappear", "disappoint", "disappointment", "disaster", "disastrous", "discipline", "disclose", "disclosure", "discount", "discourage",
  "discourse", "discover", "discovery", "discreet", "discrepancy", "discrete", "discretion", "discriminate", "discrimination", "discuss",
  "discussion", "disease", "dishonest", "dislike", "dismiss", "disorder", "dispatch", "displace", "display", "disposal",
  "dispose", "disposition", "dispute", "disrupt", "disruption", "disruptive", "distance", "distant", "distinct", "distinction",
  "distinctive", "distinguish", "distort", "distortion", "distract", "distraction", "distribute", "distribution", "distributor", "district",
  "disturb", "disturbing", "divergent", "diverse", "diversification", "diversify", "diversity", "divide", "dividend", "divine",
  "division", "divorce", "doctrine", "document", "documentary", "documentation", "domain", "domestic", "dominant", "dominate",
  "donate", "donation", "donor", "double", "doubt", "doubtful", "downfall", "download", "downward", "draft",
  "drain", "drama", "dramatic", "dramatically", "drawer", "drawing", "drive", "driver", "drop", "dropout",
  "duration", "during", "dynamic", "dynamics",

  // E
  "eager", "earlier", "early", "earn", "earnest", "earnings", "earthquake", "easily", "eastern", "echo",
  "ecologist", "ecology", "economic", "economical", "economist", "economy", "ecosystem", "edition", "editor", "editorial",
  "educate", "educated", "education", "educational", "educator", "effective", "effectively", "effectiveness", "efficiency", "efficient",
  "efficiently", "effort", "elaborate", "elderly", "elect", "election", "elective", "electric", "electrical", "electricity",
  "electronic", "electronically", "elegant", "element", "elementary", "elevate", "elevation", "elevator", "eligible", "eliminate",
  "elimination", "elite", "eloquent", "elsewhere", "email", "embed", "embedded", "emboss", "embrace", "emerge",
  "emergence", "emergency", "emerging", "emission", "emotion", "emotional", "emotionally", "emphasis", "emphasize", "empirical",
  "employ", "employee", "employer", "employment", "empower", "empowerment", "enable", "enact", "enclosed", "encounter",
  "encourage", "encouragement", "encouraging", "encyclopedia", "endeavor", "endless", "endorse", "endorsement", "endure", "enemy",
  "energy", "enforce", "enforcement", "engage", "engagement", "engine", "engineer", "engineering", "enhance", "enhancement",
  "enjoy", "enjoyable", "enjoyment", "enormous", "enough", "enquiry", "enroll", "enrollment", "ensemble", "ensure",
  "enterprise", "entertain", "entertaining", "entertainment", "enthusiasm", "enthusiastic", "entire", "entirely", "entitle", "entity",
  "entrance", "entrepreneur", "entry", "envelope", "environment", "environmental", "envision", "epidemic", "episode", "equal",
  "equality", "equally", "equation", "equip", "equipment", "equity", "equivalent", "era", "erase", "erosion",
  "error", "escalate", "escape", "especially", "essay", "essence", "essential", "essentially", "establish", "establishment",
  "estate", "estimate", "estimation", "ethical", "ethics", "ethnic", "evaluate", "evaluation", "event", "eventual",
  "eventually", "everybody", "everyday", "everyone", "everything", "everywhere", "evidence", "evident", "evidently", "evolution",
  "evolutionary", "evolve", "exact", "exactly", "exaggerate", "examine", "examination", "example", "exceed", "excellent",
  "except", "exception", "exceptional", "excerpt", "excess", "excessive", "exchange", "excite", "excited", "excitement",
  "exciting", "exclude", "exclusion", "exclusive", "exclusively", "execute", "execution", "executive", "exemplary", "exempt",
  "exercise", "exert", "exhaust", "exhausted", "exhibit", "exhibition", "exist", "existence", "existing", "expand",
  "expansion", "expect", "expectation", "expedite", "expense", "expensive", "experience", "experienced", "experiment", "experimental",
  "expert", "expertise", "explain", "explanation", "explicit", "explicitly", "explode", "exploit", "exploration", "explore",
  "explorer", "explosion", "export", "expose", "exposition", "exposure", "express", "expression", "expressive", "extend",
  "extension", "extensive", "extent", "external", "externally", "extinct", "extra", "extract", "extraction", "extraordinary",
  "extreme", "extremely",

  // F
  "fabric", "fabulous", "facilitate", "facility", "factor", "factory", "faculty", "failed", "failure", "fairly",
  "faith", "faithful", "familiar", "family", "famous", "fantastic", "fascinate", "fashion", "fast", "faster",
  "fatal", "favor", "favorable", "favorite", "feasible", "feature", "federal", "federation", "feedback", "feeling",
  "fellow", "female", "feminist", "fence", "festival", "fever", "fiber", "fiction", "fictional", "field",
  "fierce", "fight", "figure", "file", "filter", "final", "finally", "finance", "financial", "financially",
  "finding", "finger", "finish", "finished", "finite", "firewall", "firmly", "fiscal", "fishery", "fitness",
  "fixed", "fixture", "flavor", "flawless", "fleet", "flexibility", "flexible", "flight", "floating", "flood",
  "floor", "flourish", "flow", "flower", "fluent", "fluid", "focus", "focused", "folder", "follow",
  "follower", "following", "footage", "forecast", "foreigner", "forensic", "forestry", "forever", "forget", "forgive",
  "formal", "formally", "format", "formation", "former", "formerly", "formula", "formulate", "forthcoming", "fortune",
  "forward", "foster", "foundation", "founder", "fraction", "fracture", "fragile", "fragment", "framework", "franchise",
  "frankly", "fraud", "freelance", "freedom", "freely", "freeze", "frequency", "frequent", "frequently", "fresh",
  "freshman", "friction", "friend", "friendly", "friendship", "frighten", "frontier", "frustrate", "frustrated", "frustrating",
  "frustration", "fulfill", "fulfilling", "fulfillment", "fully", "function", "functional", "functionality", "fundamental", "fundamentally",
  "funding", "funeral", "funny", "furious", "furniture", "further", "furthermore", "fusion", "future",

  // G
  "gallery", "gambling", "gateway", "gather", "gathering", "gender", "general", "generally", "generate", "generation",
  "generator", "generic", "generosity", "generous", "genetic", "genius", "genre", "genuine", "genuinely", "geographic",
  "geography", "gesture", "ghost", "giant", "gifted", "gigantic", "glance", "glimpse", "global", "globally",
  "glorious", "glory", "glove", "golden", "goodness", "gorgeous", "govern", "governance", "government", "governmental",
  "governor", "graceful", "graduate", "graduation", "grammar", "grandfather", "grandmother", "grant", "graphic", "graphical",
  "graphics", "grasp", "grateful", "gratitude", "gravity", "greatest", "greatly", "greatness", "greenhouse", "greeting",
  "grocery", "ground", "group", "growth", "guarantee", "guardian", "guidance", "guide", "guideline", "guilty",

  // H
  "habitat", "habitual", "handbook", "handle", "handler", "handling", "handsome", "handy", "happen", "happening",
  "happiness", "harbor", "hardcore", "hardly", "hardship", "hardware", "harmful", "harmony", "harvest", "headline",
  "headquarters", "health", "healthy", "heart", "heartily", "heat", "heavily", "height", "helicopter", "helmet",
  "helpful", "helping", "helpless", "heritage", "heroic", "hesitate", "hesitation", "hidden", "hierarchy", "highlight",
  "highway", "hilarious", "historic", "historical", "historian", "history", "hitherto", "holder", "holding", "holiday",
  "holistic", "homeless", "homework", "honesty", "honor", "honorable", "hook", "horizon", "horizontal", "horrible",
  "hospital", "hospitality", "hostile", "hostility", "household", "housing", "however", "human", "humanity", "humble",
  "humor", "humorous", "hundred", "hunger", "hungry", "hybrid", "hypothesis", "hypothetical",

  // I
  "iconic", "ideal", "ideally", "identical", "identifiable", "identification", "identify", "identity", "ideology", "idiom",
  "ignition", "ignorance", "ignorant", "ignore", "illegal", "illuminate", "illusion", "illustrate", "illustration", "image",
  "imagery", "imaginary", "imagination", "imaginative", "imagine", "immediate", "immediately", "immense", "immigrant", "immigration",
  "immune", "immunity", "impact", "impatient", "imperative", "imperfect", "implement", "implementation", "implication", "implicit",
  "implicitly", "imply", "import", "importance", "important", "importantly", "impose", "impossible", "impress", "impressed",
  "impression", "impressive", "improve", "improved", "improvement", "impulse", "inability", "inadequate", "inappropriate", "incentive",
  "incidence", "incident", "incidentally", "include", "included", "including", "inclusion", "inclusive", "income", "incorporate",
  "incorporated", "incorrect", "increase", "increasing", "increasingly", "incredible", "incredibly", "indeed", "indefinite", "independence",
  "independent", "independently", "index", "indicate", "indication", "indicator", "indifference", "indigenous", "indirect", "indirectly",
  "individual", "individually", "induce", "indulge", "industrial", "industry", "ineffective", "inefficient", "inequality", "inevitable",
  "inevitably", "inexpensive", "infant", "infection", "infectious", "infer", "inference", "inferior", "infinite", "inflation",
  "influence", "influential", "inform", "informal", "information", "informative", "informed", "infrastructure", "infrequent", "ingenious",
  "ingredient", "inhabit", "inherent", "inherit", "initial", "initially", "initiate", "initiative", "inject", "injection",
  "injured", "injury", "injustice", "inline", "innocent", "innovate", "innovation", "innovative", "input", "inquire",
  "inquiry", "insane", "insert", "insertion", "inside", "insight", "insightful", "insist", "inspect", "inspection",
  "inspector", "inspiration", "inspire", "inspired", "install", "installation", "instance", "instant", "instantly", "instead",
  "instinct", "institute", "institution", "institutional", "instruct", "instruction", "instructive", "instructor", "instrument", "instrumental",
  "insufficient", "insulate", "insult", "insurance", "intact", "integral", "integrate", "integrated", "integration", "integrity",
  "intellect", "intellectual", "intelligence", "intelligent", "intend", "intense", "intensity", "intensive", "intent", "intention",
  "intentional", "intentionally", "interact", "interaction", "interactive", "intercept", "interest", "interested", "interesting", "interface",
  "interfere", "interference", "interim", "interior", "intermediate", "internal", "internally", "international", "internet", "interpret",
  "interpretation", "interrupt", "interruption", "interval", "intervene", "intervention", "interview", "intimate", "intimidate", "intolerant",
  "intricate", "intrigue", "intrinsic", "introduce", "introduction", "introductory", "intrude", "intuition", "intuitive", "invade",
  "invalid", "invaluable", "invariable", "invariably", "invasion", "invent", "invention", "inventor", "inventory", "inverse",
  "invest", "investigate", "investigation", "investigator", "investing", "investment", "investor", "invisible", "invitation", "invite",
  "inviting", "invoice", "invoke", "involve", "involved", "involvement", "ironic", "ironically", "irrational", "irregular",
  "irrelevant", "irresponsible", "irreversible", "isolate", "isolated", "isolation", "issue", "iteration",

  // J - L
  "jealous", "jewelry", "journey", "judgment", "judicial", "junction", "junior", "jurisdiction", "justice", "justification",
  "justify", "keen", "keyboard", "keynote", "kickoff", "kinetic", "kingdom", "kitchen", "knight", "knowledge",
  "knowledgeable", "known", "label", "labor", "laboratory", "ladder", "landmark", "landscape", "language", "laptop",
  "large", "largely", "laser", "lasting", "latter", "launch", "launcher", "laundry", "lawyer", "layer",
  "layout", "leader", "leadership", "leading", "league", "leakage", "learning", "leather", "lecture", "lecturer",
  "legacy", "legal", "legend", "legendary", "legislation", "legislative", "legitimate", "leisure", "length", "lengthen",
  "lesson", "leverage", "liability", "liable", "liberal", "liberty", "library", "license", "licensing", "lifetime",
  "lighting", "lightning", "likelihood", "likely", "likewise", "limitation", "limited", "linear", "linger", "linguistic",
  "linking", "liquid", "listen", "listener", "literal", "literally", "literary", "literature", "lively", "living",
  "loading", "lobby", "locally", "location", "lodging", "logic", "logical", "logistics", "longstanding", "longtime",
  "lookout", "loophole", "loudly", "loyalty", "lucrative", "luggage", "luminous", "luxury",

  // M
  "machine", "machinery", "magazine", "magical", "magician", "magnet", "magnetic", "magnificent", "magnitude", "mainland",
  "mainstream", "maintain", "maintenance", "majestic", "majority", "makeup", "mammal", "manage", "management", "manager",
  "managerial", "mandate", "mandatory", "manifest", "manifestation", "manipulate", "manipulation", "mankind", "manpower", "mansion",
  "manual", "manually", "manufacture", "manufacturer", "manufacturing", "manuscript", "mapping", "marathon", "margin", "marginal",
  "marine", "marital", "marketer", "marketing", "marketplace", "marriage", "martial", "marvelous", "masculine", "massive",
  "master", "masterpiece", "mastery", "matching", "material", "mathematical", "mathematician", "mathematics", "matrix", "matter",
  "mature", "maturity", "maximize", "maximum", "meaning", "meaningful", "meantime", "meanwhile", "measure", "measurement",
  "mechanical", "mechanism", "media", "mediate", "mediation", "medical", "medication", "medicine", "medieval", "medium",
  "meeting", "melancholy", "melody", "membership", "membrane", "memorable", "memorial", "memorize", "memory", "mental",
  "mentality", "mentally", "mention", "mentor", "mentorship", "merchant", "merciful", "mercury", "mercy", "merely",
  "merger", "merit", "message", "messenger", "metabolism", "metaphor", "meteor", "method", "methodical", "methodology",
  "metropolitan", "microbe", "microphone", "microscope", "microscopic", "midday", "midnight", "midst", "migrant", "migrate",
  "migration", "milestone", "military", "militia", "millennium", "million", "millionaire", "mindset", "mineral", "miniature",
  "minimal", "minimize", "minimum", "minister", "ministry", "minority", "miracle", "miraculous", "mirror", "misbehave",
  "miscellaneous", "mischief", "misconduct", "miserable", "misery", "misfortune", "misguide", "mislead", "misleading", "misplace",
  "missile", "missing", "mission", "missionary", "mistake", "mistaken", "mistrust", "misunderstand", "misunderstanding", "mixture",
  "mobility", "mobilize", "mockery", "modal", "modality", "model", "modeling", "moderate", "moderately", "moderation",
  "moderator", "modern", "modernity", "modernize", "modest", "modesty", "modification", "modifier", "modify", "modular",
  "module", "moisture", "molecular", "molecule", "moment", "momentary", "momentous", "momentum", "monarch", "monarchy",
  "monetary", "monitor", "monitoring", "monopoly", "monotonous", "monument", "monumental", "moody", "morality", "morally",
  "morning", "morphology", "mortality", "mortgage", "mostly", "motherhood", "motif", "motion", "motivate", "motivation",
  "motivational", "motive", "motorcycle", "motorist", "mountain", "mounting", "mourning", "movement", "multicultural", "multimedia",
  "multiple", "multiplication", "multiply", "multitask", "multitude", "municipal", "municipality", "museum", "musician", "mutation",
  "mutual", "mutually", "mysterious", "mystery", "mystical", "mythology",

  // N - O
  "narrative", "narrow", "nation", "national", "nationwide", "native", "natural", "naturally", "nature", "navigate",
  "navigation", "navigator", "nearer", "nearly", "neatly", "necessarily", "necessary", "necessity", "needle", "negative",
  "neglect", "negotiate", "negotiation", "neighbor", "neighborhood", "neither", "nervous", "network", "networking", "neutral",
  "neutrality", "nevertheless", "newcomer", "newly", "newsletter", "newspaper", "nicely", "nightmare", "nobility", "noble",
  "nobody", "nominal", "nominate", "nomination", "nominee", "nonetheless", "nonsense", "normal", "normally", "northeast",
  "northern", "northwest", "notable", "notably", "notebook", "notice", "noticeable", "notification", "notify", "notion",
  "notorious", "novelty", "nowadays", "nuclear", "nuance", "nucleus", "nuisance", "nullify", "numerical", "numerous",
  "nursery", "nurture", "nutrient", "nutrition", "nutritional", "oasis", "obedient", "obesity", "object", "objection",
  "objective", "objectively", "obligation", "obligatory", "oblige", "oblivious", "obscure", "observable", "observant", "observation",
  "observatory", "observe", "observer", "obsession", "obsessive", "obsolete", "obstacle", "obtain", "obtainable", "obvious",
  "obviously", "occasion", "occasional", "occasionally", "occupation", "occupational", "occupy", "occur", "occurrence", "offense",
  "offensive", "official", "officially", "offshore", "offspring", "ongoing", "online", "opaque", "operate", "operating",
  "operation", "operational", "operator", "opinion", "opponent", "opportunity", "oppose", "opposite", "opposition", "optimism",
  "optimistic", "optimization", "optimize", "optimum", "optional", "orchestrate", "orderly", "ordinary", "organization", "organizational",
  "organize", "organized", "organizer", "orientation", "original", "originality", "originally", "originate", "outcome", "outfit",
  "outgoing", "outing", "outlaw", "outlet", "outline", "outlook", "outnumber", "output", "outrage", "outrageous",
  "outreach", "outside", "outsider", "outstanding", "outward", "overall", "overcome", "overflow", "overhead", "overlap",
  "overload", "overlook", "overnight", "overseas", "oversight", "overview", "overwhelm", "overwhelming", "ownership",

  // P
  "package", "packet", "painful", "painting", "palette", "pandemic", "paradigm", "paradox", "paragraph", "parallel",
  "parameter", "parent", "parental", "parliament", "partial", "partially", "participant", "participate", "participation", "particle",
  "particular", "particularly", "partner", "partnership", "passage", "passenger", "passion", "passionate", "passive", "password",
  "pastime", "patent", "pathetic", "patience", "patient", "patiently", "patron", "pattern", "payload", "payment",
  "peaceful", "peculiar", "peerless", "penalty", "pending", "penetrate", "penetration", "pension", "perceive", "perceived",
  "percent", "percentage", "perception", "perceptive", "perfect", "perfection", "perfectly", "perform", "performance", "performer",
  "performing", "perhaps", "period", "periodic", "periodical", "peripheral", "perish", "permanent", "permanently", "permission",
  "permissive", "permit", "perpetual", "perplex", "perseverance", "persevere", "persist", "persistence", "persistent", "person",
  "personal", "personality", "personally", "personnel", "perspective", "persuade", "persuasion", "persuasive", "pertain", "pertinent",
  "pervasive", "pessimistic", "petition", "petroleum", "phantom", "pharmacy", "phase", "phenomenal", "phenomenon", "philosophy",
  "photo", "photograph", "photographer", "photography", "phrase", "physical", "physically", "physician", "physics", "pinnacle",
  "pioneer", "pipeline", "piracy", "placement", "plaintiff", "planned", "planner", "planning", "platform", "plausible",
  "playful", "pleasant", "pleasure", "plentiful", "plenty", "plumbing", "plural", "pointer", "polarize", "policy",
  "polish", "polite", "political", "politically", "politician", "politics", "pollution", "popular", "popularity", "populate",
  "population", "portable", "portal", "portfolio", "portion", "portrait", "portray", "portrayal", "position", "positive",
  "positively", "possess", "possession", "possibility", "possible", "possibly", "postage", "poster", "postpone", "posture",
  "potential", "potentially", "poverty", "powerful", "powerfully", "practical", "practically", "practice", "practitioner", "praise",
  "prayer", "preach", "precaution", "precede", "precedence", "precedent", "preceding", "precious", "precise", "precisely",
  "precision", "preclude", "predator", "predecessor", "predict", "predictable", "prediction", "predominant", "prefer", "preferable",
  "preference", "pregnant", "prejudice", "preliminary", "premature", "premier", "premise", "premium", "preoccupation", "preparation",
  "prepare", "prepared", "prerequisite", "prescription", "presence", "present", "presentation", "presently", "preservation", "preserve",
  "presidency", "president", "presidential", "prestige", "prestigious", "presumably", "presume", "presumption", "pretend", "pretext",
  "prevail", "prevailing", "prevalence", "prevalent", "prevent", "prevention", "preventive", "preview", "previous", "previously",
  "primary", "primarily", "primitive", "principal", "principally", "principle", "printing", "priority", "privacy", "private",
  "privately", "privilege", "privileged", "probability", "probable", "probably", "probation", "problem", "problematic", "procedure",
  "proceed", "proceeding", "process", "processing", "processor", "proclaim", "produce", "producer", "product", "production",
  "productive", "productivity", "profession", "professional", "professionally", "professor", "proficiency", "proficient", "profile", "profit",
  "profitable", "profound", "profoundly", "prognosis", "program", "programmer", "programming", "progress", "progression", "progressive",
  "prohibit", "prohibition", "project", "projection", "prolific", "prominence", "prominent", "promise", "promising", "promote",
  "promoter", "promotion", "promotional", "prompt", "promptly", "pronounce", "pronunciation", "proof", "propaganda", "propagate",
  "proper", "properly", "property", "prophecy", "proportion", "proportional", "proposal", "propose", "proposition", "prosecute",
  "prosecution", "prosecutor", "prospect", "prospective", "prosperity", "prosperous", "protect", "protection", "protective", "protector",
  "protocol", "prototype", "provider", "province", "provincial", "provision", "provisional", "provoke", "prudence", "prudent",
  "psychological", "psychology", "public", "publication", "publicity", "publicly", "publish", "publisher", "publishing", "purchase",
  "purely", "purify", "purpose", "purposeful", "pursue", "pursuit", "puzzle",

  // Q - R
  "qualification", "qualified", "qualify", "qualitative", "quality", "quantify", "quantitative", "quantity", "quantum", "quarter",
  "quarterly", "question", "questionable", "questionnaire", "queue", "quick", "quickly", "quietly", "quarantine", "quota",
  "quotation", "racial", "radiant", "radiation", "radical", "radically", "rainbow", "random", "randomly", "ranking",
  "rapid", "rapidly", "rapport", "rarely", "rational", "rationale", "rationalize", "reaction", "reactive", "readily",
  "reading", "realistic", "reality", "realization", "realize", "rearrange", "reasonable", "reasonably", "reassure", "rebellion",
  "rebound", "rebuild", "receipt", "receive", "receiver", "recent", "recently", "receptive", "reception", "recession",
  "recipe", "recipient", "reciprocal", "reckless", "reclaim", "recognition", "recognize", "recognized", "recollect", "recommend",
  "recommendation", "reconcile", "reconciliation", "reconsider", "reconstruct", "reconstruction", "record", "recorder", "recording", "recover",
  "recovery", "recreation", "recruit", "recruitment", "rectangle", "rectify", "recurrence", "recurrent", "recycle", "redesign",
  "reduce", "reduction", "redundancy", "redundant", "referee", "reference", "refine", "refined", "refinement", "reflect",
  "reflection", "reflective", "reform", "reformation", "refresh", "refreshing", "refugee", "refusal", "regardless", "regenerate",
  "regime", "region", "regional", "register", "registration", "registry", "regret", "regrettable", "regular", "regularity",
  "regularly", "regulate", "regulation", "regulatory", "rehabilitate", "rehearsal", "rehearse", "reign", "reinforce", "reinforcement",
  "reinvent", "reiterate", "reject", "rejection", "rejoice", "relate", "related", "relation", "relationship", "relative",
  "relatively", "relax", "relaxation", "release", "relevance", "relevant", "reliability", "reliable", "reliance", "reliant",
  "relief", "relieve", "relieved", "religion", "religious", "reluctance", "reluctant", "remain", "remainder", "remaining",
  "remark", "remarkable", "remarkably", "remedy", "remember", "remind", "reminder", "reminiscent", "remnant", "remote",
  "remotely", "removal", "remove", "renaissance", "render", "rendering", "rendition", "renew", "renewable", "renewal",
  "renovate", "renovation", "renown", "renowned", "reorganize", "repair", "reparation", "repeat", "repeated", "repeatedly",
  "repel", "repent", "repetition", "repetitive", "replace", "replaceable", "replacement", "replica", "replicate", "replication",
  "reply", "report", "reporter", "reporting", "represent", "representation", "representative", "repress", "reproduce", "reproduction",
  "reproductive", "republic", "republican", "reputation", "request", "require", "required", "requirement", "requisite", "rescue",
  "research", "researcher", "resemblance", "resemble", "resent", "resentment", "reservation", "reserve", "reservoir", "reside",
  "residence", "resident", "residential", "residual", "residue", "resign", "resignation", "resilience", "resilient", "resist",
  "resistance", "resistant", "resolute", "resolution", "resolve", "resolved", "resonance", "resort", "resource", "resourceful",
  "respect", "respectable", "respectful", "respective", "respectively", "respiration", "respiratory", "respond", "respondent", "response",
  "responsibility", "responsible", "responsive", "restart", "restaurant", "restoration", "restore", "restrain", "restraint", "restrict",
  "restricted", "restriction", "restrictive", "restructure", "result", "resulting", "resume", "resumption", "resurgence", "retail",
  "retailer", "retain", "retaliate", "retaliation", "retention", "retire", "retired", "retirement", "retract", "retreat",
  "retrieve", "retrieval", "retroactive", "retrospect", "return", "reveal", "revealing", "revelation", "revenge", "revenue",
  "reverence", "reverse", "reversible", "revert", "review", "reviewer", "revise", "revision", "revival", "revive",
  "revoke", "revolution", "revolutionary", "revolutionize", "reward", "rewarding", "rhythm", "rhythmic", "ribbon", "ridiculous",
  "righteous", "rightful", "rigid", "rigor", "rigorous", "ritual", "rivalry", "robust", "romance", "romantic",
  "rookie", "roster", "rotate", "rotation", "roughly", "routine", "routinely", "routing", "royalty", "rubber",
  "ruinous", "rumor", "runner", "running", "runtime", "rupture", "rural",

  // S
  "sacrifice", "safeguard", "safety", "salary", "salvation", "sample", "sampling", "sanction", "sanctuary", "sandwich",
  "sanity", "satellite", "satisfaction", "satisfactory", "satisfied", "satisfy", "saturation", "scandal", "scanner", "scarcely",
  "scarcity", "scenario", "scenery", "schedule", "scheme", "scholar", "scholarly", "scholarship", "scientific", "scientifically",
  "scientist", "scissors", "scope", "scratch", "screen", "screening", "screenshot", "script", "scrutiny", "sculpture",
  "seamless", "seamlessly", "seasonal", "secondly", "secret", "secretary", "section", "sector", "secular", "secure",
  "securely", "security", "segment", "segmentation", "segregate", "seldom", "select", "selection", "selective", "selector",
  "selfish", "semester", "semiconductor", "seminar", "senate", "senator", "sensation", "sensational", "sensible", "sensitive",
  "sensitivity", "sensor", "sensory", "sentence", "sentiment", "separate", "separately", "separation", "sequence", "sequential",
  "serenade", "serene", "serenity", "series", "serious", "seriously", "seriousness", "servant", "service", "session",
  "settle", "settlement", "settler", "several", "severe", "severely", "severity", "shackle", "shadow", "shallow",
  "shameful", "shared", "shareholder", "sharing", "sharp", "sharply", "shatter", "shelter", "shepherd", "sheriff",
  "shield", "shift", "shifting", "shipment", "shipping", "shiver", "shocking", "shortage", "shortcoming", "shorten",
  "shortly", "shoulder", "showcase", "shower", "shrink", "shuttle", "sibling", "sidebar", "sickness", "sidewalk",
  "sightseeing", "signage", "signal", "signature", "significance", "significant", "significantly", "signify", "silence", "silent",
  "silently", "silhouette", "silicon", "similar", "similarity", "similarly", "simple", "simplicity", "simplified", "simplify",
  "simply", "simulate", "simulation", "simulator", "simultaneous", "simultaneously", "sincere", "sincerely", "sincerity", "singular",
  "sinister", "sisterhood", "skeptical", "skeleton", "skeptic", "sketch", "skilful", "skilled", "slight", "slightly",
  "slippery", "slogan", "smart", "smartphone", "smooth", "smoothly", "snippet", "sociable", "social", "socialism",
  "socialist", "socialize", "socially", "society", "sociology", "software", "solidarity", "solitary", "solitude", "solution",
  "solve", "somebody", "somehow", "someone", "something", "sometime", "sometimes", "somewhat", "somewhere", "sophisticated",
  "sophistication", "sorrow", "soundtrack", "source", "southern", "southwest", "sovereign", "sovereignty", "spacious", "sparkle",
  "spatial", "speaker", "special", "specialist", "specialization", "specialize", "specialized", "specially", "specialty", "species",
  "specific", "specifically", "specification", "specify", "specimen", "spectacle", "spectacular", "spectator", "spectrum", "speculate",
  "speculation", "speculative", "speedy", "spending", "sphere", "spin-off", "spiritual", "spirituality", "splendid", "split",
  "spokesman", "spokesperson", "sponsor", "sponsorship", "spontaneous", "sporadic", "spotlight", "spread", "spreadsheet", "springtime",
  "stability", "stabilize", "stable", "stadium", "staggering", "stainless", "staircase", "stakeholder", "standard", "standardization",
  "standardize", "standpoint", "startling", "startup", "statement", "statesman", "static", "stationary", "statistical", "statistically",
  "statistician", "statistics", "statue", "stature", "status", "statute", "statutory", "steadfast", "steadily", "steady",
  "steer", "stimulate", "stimulation", "stimulus", "stipulate", "stochastic", "stockholder", "storage", "storyteller", "storytelling",
  "straight", "straightforward", "strain", "stranded", "stranger", "strategic", "strategically", "strategist", "strategy", "strength",
  "strengthen", "strenuous", "stressful", "stretch", "strictly", "stringent", "structural", "structure", "structured", "struggle",
  "stubborn", "student", "studiowork", "stumble", "stunning", "subconscious", "subdivision", "subdue", "subjective", "submarine",
  "submerge", "submission", "submit", "subordinate", "subscriber", "subscription", "subsequent", "subsequently", "subsidiary", "subsidize",
  "subsidy", "substance", "substantial", "substantially", "substantiate", "substantive", "substitute", "substitution", "subtle", "subtlety",
  "suburb", "suburban", "succeed", "success", "successful", "successfully", "succession", "successive", "successor", "succinct",
  "sudden", "suddenly", "suffer", "sufferer", "suffering", "sufficient", "sufficiently", "suffocate", "suggestion", "suggestive",
  "suitable", "suitcase", "summary", "summit", "sunlight", "superb", "superficial", "superintendent", "superior", "superiority",
  "supermarket", "supernatural", "supersede", "supervise", "supervision", "supervisor", "supplement", "supplementary", "supplier", "supply",
  "support", "supporter", "supportive", "suppose", "supposedly", "suppress", "suppression", "supreme", "surcharge", "surface",
  "surge", "surgeon", "surgery", "surgical", "surmount", "surpass", "surplus", "surprise", "surprised", "surprising",
  "surprisingly", "surrender", "surround", "surrounding", "surveillance", "survey", "surveyor", "survival", "survive", "survivor",
  "susceptible", "suspect", "suspend", "suspense", "suspension", "suspicion", "suspicious", "sustain", "sustainability", "sustainable",
  "sustenance", "swallow", "sweater", "sweeping", "swiftly", "swimming", "switchboard", "symbol", "symbolic", "symbolize",
  "symmetric", "symmetry", "sympathetic", "sympathize", "sympathy", "symphony", "symptom", "synonymous", "synopsis", "syntax",
  "synthesis", "synthetic", "system", "systematic", "systematically", "systemic",

  // T
  "tactic", "tactical", "tagline", "talent", "talented", "tangible", "tantamount", "target", "targeted", "taskforce",
  "tasteful", "taxation", "taxpayer", "teacher", "teaching", "teamwork", "technical", "technically", "technician", "technique",
  "technological", "technologically", "technology", "tedious", "teenager", "telecom", "telecommunications", "telegraph", "telephone", "telescope",
  "temperament", "temperate", "temperature", "temporary", "temptation", "tendency", "tender", "tenuous", "terminal", "terminate",
  "termination", "terminology", "terrace", "terrible", "terribly", "terrific", "territorial", "territory", "testify", "testimony",
  "testing", "textbook", "textile", "texture", "thankful", "theatre", "theatrical", "thematic", "theoretical", "theoretically",
  "theorist", "theory", "therapeutic", "therapist", "therapy", "thermal", "thesaurus", "thickness", "thought", "thoughtful",
  "thousand", "threaten", "threatening", "threshold", "thriving", "through", "throughout", "throwback", "thumbnail", "thunder",
  "timeless", "timeline", "timely", "timezone", "timestamp", "tiny", "tolerance", "tolerant", "tolerate", "tomorrow",
  "tonight", "toolkit", "toolbox", "topical", "topology", "tornado", "torture", "totalitarian", "totally", "touchdown",
  "touching", "tourism", "tourist", "tournament", "toward", "towards", "toxicity", "traceable", "trackball", "tracking",
  "trademark", "tradeoff", "tradition", "traditional", "traditionally", "traffic", "tragedy", "tragic", "trainee", "training",
  "trajectory", "transaction", "transcend", "transcribe", "transcript", "transcription", "transfer", "transform", "transformation", "transient",
  "transit", "transition", "transitional", "translate", "translation", "translator", "transmission", "transmit", "transmitter", "transparency",
  "transparent", "transpiration", "transport", "transportation", "traveler", "traverse", "treacherous", "treasure", "treasurer", "treasury",
  "treatment", "tremendous", "tremendously", "trench", "tribute", "trigger", "triumph", "triumphant", "trivial", "troubleshoot",
  "troublesome", "trustee", "trustworthy", "truthful", "turnaround", "turnover", "tutorial", "twentieth", "twilight", "typography",

  // U - Z
  "ubiquitous", "ultimate", "ultimately", "unacceptable", "unanimous", "unavoidable", "unaware", "uncertain", "uncertainty", "unchanged",
  "uncomfortable", "unconditional", "unconscious", "underestimate", "undergo", "undergraduate", "underline", "underlying", "undermine", "understand",
  "understanding", "undertake", "undertaking", "underwrite", "undisputed", "undoubtedly", "unemployed", "unemployment", "unexpected", "unexpectedly",
  "unfair", "unfamiliar", "unfavorable", "unforeseen", "unfortunate", "unfortunately", "uniform", "uniformity", "uniformly", "unify",
  "unilateral", "unique", "uniquely", "universal", "universally", "universe", "university", "unjustified", "unknown", "unlawful",
  "unlimited", "unnecessary", "unprecedented", "unpredictable", "unpleasant", "unreasonable", "unreliable", "unresponsive", "unsettling", "unstable",
  "unsuccessful", "until", "unusual", "unusually", "upgrade", "upmarket", "upload", "upon", "upper", "upright",
  "uprising", "upscale", "upstream", "upward", "urban", "urgency", "urgent", "urgently", "useful", "usefulness",
  "user-friendly", "username", "utility", "utilization", "utilize", "utmost", "utopia", "vacation", "vaccination", "vaccine",
  "vacuum", "vague", "valuable", "valuation", "variable", "variation", "variety", "various", "vastly", "vector",
  "velocity", "venture", "verbal", "verdict", "verification", "verify", "versatile", "versatility", "version", "vertical",
  "veteran", "viable", "vibrant", "vibrate", "vibration", "vicinity", "victim", "victorious", "victory", "video",
  "viewpoint", "vigorous", "village", "violate", "violation", "violence", "violent", "virtual", "virtually", "virtue",
  "visible", "visibly", "vision", "visionary", "visiting", "visual", "visualization", "visualize", "visually", "vital",
  "vitality", "vivid", "vocabulary", "vocation", "volatile", "volatility", "volcano", "voltage", "voluntary", "volunteer",
  "vulnerable", "warmth", "warrant", "warranty", "warrior", "watchdog", "watchful", "watercolor", "waterfall", "waterproof",
  "wavelength", "weakness", "wealth", "wealthy", "wearable", "weather", "webinar", "webmaster", "website", "weekday",
  "weekend", "weigh", "weight", "welcome", "welfare", "western", "whatever", "whenever", "wherever", "whichever",
  "whoever", "wholehearted", "wholesome", "widespread", "wildlife", "willing", "willingness", "windfall", "wireless", "wisdom",
  "withdraw", "withdrawal", "withhold", "within", "without", "wonderful", "wonderfully", "woodland", "workforce", "workload",
  "workplace", "workshop", "workspace", "workstation", "worldwide", "worthwhile", "wreckage", "writing", "written", "wrongdoing",
  "yield", "yielding", "youngster", "youthful", "zealous", "zenith", "zero-sum"
];

// ── 2. Curated Technical & Modern Web Dictionary ──
const TECH_DICTIONARY = [
  "react", "react-dom", "react-router-dom", "next", "vite", "vue", "nuxt", "svelte", "remix", "astro",
  "redux", "zustand", "jotai", "mobx", "recoil", "tanstack", "axios", "fetch",
  "tailwindcss", "tailwind", "shadcn", "lucide", "radix", "bootstrap", "sass",
  "express", "fastify", "nest", "koa", "mongoose", "mongodb", "prisma", "sequelize", "typeorm", "postgres", "mysql", "redis",
  "jwt", "jsonwebtoken", "bcrypt", "passport", "auth", "cors", "helmet", "dotenv",
  "typescript", "javascript", "zod", "yup", "joi", "nodejs",
  "jest", "vitest", "cypress", "playwright", "eslint", "prettier", "nodemon", "webpack", "vitejs",
  "mermaid", "chartjs", "d3", "recharts", "blocknote", "excalidraw", "katex",
  "lodash", "date-fns", "sharp", "multer", "socket.io", "uuid", "nanoid"
];

// Combine into dynamic cache
const dynamicCache = new Map();

// Populate with common writing words first
for (const word of COMMON_ENGLISH_WORDS) {
  dynamicCache.set(word.toLowerCase(), word);
}

// Populate with tech terms second
for (const term of TECH_DICTIONARY) {
  if (!dynamicCache.has(term.toLowerCase())) {
    dynamicCache.set(term.toLowerCase(), term);
  }
}

/**
 * Recursively extracts plain text from BlockNote blocks
 */
function extractBlockText(blocks) {
  if (!blocks || !Array.isArray(blocks)) return "";
  let text = "";
  for (const block of blocks) {
    if (Array.isArray(block.content)) {
      for (const span of block.content) {
        if (span.text) text += " " + span.text;
      }
    }
    if (block.children && block.children.length > 0) {
      text += " " + extractBlockText(block.children);
    }
  }
  return text;
}

/**
 * Dynamically extracts unique words from the active document
 */
export function extractDocumentWords(blocks) {
  const fullText = extractBlockText(blocks);
  if (!fullText) return [];
  const words = fullText.match(/[a-zA-Z0-9@_/-]{3,}/g) || [];
  const unique = new Set();
  for (const w of words) {
    unique.add(w.toLowerCase());
  }
  return Array.from(unique);
}

/**
 * STEP 1: Offline check (0ms, zero network)
 * Hierarchy:
 * 1. In-document vocabulary (what you are currently writing)
 * 2. Natural English words (annoying, another, because, etc.)
 * 3. Tech dictionary terms
 * Returns match object if found, or null if not found offline.
 */
export function getOfflineSuggestion(query, documentBlocks = []) {
  if (!query || query.length < 2) return null;
  const clean = query.toLowerCase().trim();

  // 1. In-document vocabulary (highest priority)
  if (documentBlocks && documentBlocks.length > 0) {
    const docWords = extractDocumentWords(documentBlocks);
    let bestDocMatch = null;
    for (const word of docWords) {
      if (word.startsWith(clean) && word !== clean) {
        if (!bestDocMatch || word.length < bestDocMatch.length) {
          bestDocMatch = word;
        }
      }
    }
    if (bestDocMatch) {
      return {
        suggestion: bestDocMatch,
        completion: bestDocMatch.slice(clean.length),
        type: "document"
      };
    }
  }

  // 2. Common English writing words (natural language priority)
  let bestEnglishMatch = null;
  for (const word of COMMON_ENGLISH_WORDS) {
    if (word.startsWith(clean) && word !== clean) {
      // Pick shortest natural completion
      if (!bestEnglishMatch || word.length < bestEnglishMatch.length) {
        bestEnglishMatch = word;
      }
    }
  }
  if (bestEnglishMatch) {
    return {
      suggestion: bestEnglishMatch,
      completion: bestEnglishMatch.slice(clean.length),
      type: "english"
    };
  }

  // 3. Tech dictionary & cached terms
  let bestTechMatch = null;
  for (const [key, original] of dynamicCache.entries()) {
    if (key.startsWith(clean) && key !== clean) {
      if (!bestTechMatch || original.length < bestTechMatch.length) {
        bestTechMatch = original;
      }
    }
  }
  if (bestTechMatch) {
    return {
      suggestion: bestTechMatch,
      completion: bestTechMatch.slice(clean.length),
      type: "tech"
    };
  }

  return null;
}

// Active AbortController and timer for debounced online requests
let onlineAbortController = null;
let onlineDebounceTimer = null;

/**
 * STEP 2: Online lookup
 * Only called if NO English word or in-document word was found offline.
 * Filtered to ignore obscure hyphenated package names unless explicitly requested.
 */
export function fetchOnlineSuggestion(query, callback) {
  if (!query || query.length < 3) return;
  const clean = query.toLowerCase().trim();

  // Clear existing debounce timer
  if (onlineDebounceTimer) clearTimeout(onlineDebounceTimer);

  onlineDebounceTimer = setTimeout(async () => {
    if (onlineAbortController) {
      onlineAbortController.abort();
    }
    onlineAbortController = new AbortController();

    try {
      const url = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(clean)}&size=5`;
      const res = await fetch(url, { signal: onlineAbortController.signal });
      if (!res.ok) return;

      const data = await res.json();
      if (data && Array.isArray(data.objects)) {
        let bestMatch = null;

        for (const item of data.objects) {
          const pkg = item.package;
          if (!pkg || !pkg.name) continue;

          const pkgLower = pkg.name.toLowerCase();

          // Reject weird packages with internal dashes if user didn't type dash
          if (!clean.includes("-") && pkgLower.includes("-")) {
            continue;
          }

          if (pkgLower.startsWith(clean) && pkgLower !== clean) {
            if (!bestMatch || pkg.name.length < bestMatch.suggestion.length) {
              bestMatch = {
                suggestion: pkg.name,
                completion: pkg.name.slice(clean.length),
                type: "online"
              };
            }
          }
        }

        if (bestMatch && typeof callback === "function") {
          dynamicCache.set(bestMatch.suggestion.toLowerCase(), bestMatch.suggestion);
          callback(bestMatch);
        }
      }
    } catch (err) {
      // Graceful ignore
    }
  }, 320);
}
