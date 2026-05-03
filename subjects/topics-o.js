/**
 * O Level topic lists per subject.
 * Each entry: { id, label, keywords[] }
 * keywords are used for scoring questions into topics.
 */

export const TOPICS_O = {
  maths: [
    {
      id: "number",
      label: "Number",
      keywords: [
        "integer", "fraction", "decimal", "percentage", "ratio", "proportion",
        "prime", "factor", "multiple", "square root", "cube root", "standard form",
        "significant figure", "rounding", "hcf", "lcm", "indices", "power",
        "reciprocal", "number line",
        // additional keywords / synonyms
        "highest common factor", "lowest common multiple", "index notation",
        "upper bound", "lower bound", "truncate", "estimate", "approximation",
        "compound interest", "simple interest", "direct proportion",
        "inverse proportion", "rate", "percentage change", "percentage increase",
        "percentage decrease", "profit", "loss", "discount", "tax",
        "exchange rate", "speed", "distance", "time"
      ]
    },
    {
      id: "algebra",
      label: "Algebra",
      keywords: [
        "expression", "equation", "inequality", "expand", "factorise", "factorize",
        "simplify", "formula", "subject", "simultaneous", "quadratic", "linear",
        "substitution", "sequence", "term", "nth term", "algebraic", "solve",
        "variable", "coefficient",
        // additional keywords / synonyms
        "rearrange", "make the subject", "expand brackets", "quadratic formula",
        "completing the square", "solve the equation", "linear equation",
        "arithmetic sequence", "geometric sequence", "common difference",
        "common ratio", "expand and simplify", "factorise completely",
        "difference of squares", "perfect square", "remainder", "identity",
        "proof", "show that", "algebraic fraction"
      ]
    },
    {
      id: "geometry",
      label: "Geometry",
      keywords: [
        "angle", "triangle", "circle", "polygon", "quadrilateral", "rectangle",
        "square", "rhombus", "parallelogram", "trapezium", "kite", "arc",
        "sector", "chord", "tangent", "radius", "diameter", "circumference",
        "parallel", "perpendicular", "bisect", "congruent", "similar",
        "symmetry", "reflection", "rotation", "translation", "enlargement",
        "bearing", "scale drawing", "locus",
        // additional keywords / synonyms
        "interior angle", "exterior angle", "alternate angle", "corresponding angle",
        "co-interior angle", "allied angle", "vertically opposite", "reflex angle",
        "obtuse angle", "acute angle", "right angle", "isosceles", "equilateral",
        "scalene", "cyclic quadrilateral", "inscribed", "circumscribed",
        "tangent from point", "alternate segment", "angle in semicircle",
        "angles in same segment", "opposite angles", "centre of circle",
        "line of symmetry", "rotational symmetry", "order of symmetry",
        "corresponding sides", "scale factor", "object", "image"
      ]
    },
    {
      id: "mensuration",
      label: "Mensuration",
      keywords: [
        "area", "perimeter", "volume", "surface area", "prism", "cylinder",
        "cone", "sphere", "pyramid", "compound shape", "cross-section",
        // additional keywords / synonyms
        "total surface area", "curved surface area", "lateral surface",
        "net of", "trapezoid", "hemisphere", "frustum",
        "base area", "cross section", "solid", "3D shape",
        "area of circle", "area of triangle", "area of rectangle",
        "volume of cylinder", "volume of cone", "volume of sphere",
        "volume of prism"
      ]
    },
    {
      id: "trigonometry",
      label: "Trigonometry",
      keywords: [
        "sine", "cosine", "tangent", "sin", "cos", "tan", "soh cah toa",
        "pythagoras", "hypotenuse", "right-angled", "angle of elevation",
        "angle of depression", "trigonometric", "opposite", "adjacent",
        // additional keywords / synonyms
        "sine rule", "cosine rule", "right angle triangle",
        "SOHCAHTOA", "trigonometry", "bearing and distance",
        "angle of inclination", "pythagoras theorem",
        "opposite side", "adjacent side", "hypotenuse",
        "trigonometric ratio", "solve the triangle", "ambiguous case"
      ]
    },
    {
      id: "statistics",
      label: "Statistics & Probability",
      keywords: [
        "mean", "median", "mode", "range", "average", "frequency",
        "histogram", "bar chart", "pie chart", "scatter diagram", "correlation",
        "probability", "event", "sample space", "tree diagram", "cumulative",
        "interquartile", "quartile", "stem and leaf", "data", "survey",
        "random", "likely", "expected",
        // additional keywords / synonyms
        "frequency table", "frequency polygon", "class interval", "class width",
        "mid-interval value", "estimated mean", "grouped data", "raw data",
        "tally", "cumulative frequency diagram", "box plot", "box-and-whisker",
        "outlier", "positive correlation", "negative correlation", "line of best fit",
        "moving average", "weighted mean", "bivariate", "two-way table",
        "mutually exclusive", "independent events", "combined events",
        "conditional probability", "relative frequency", "theoretical probability",
        "experimental probability", "equally likely", "exhaustive"
      ]
    },
    {
      id: "vectors-matrices",
      label: "Vectors & Matrices",
      keywords: [
        "vector", "matrix", "matrices", "column vector", "magnitude",
        "translation vector", "transformation matrix", "determinant", "inverse",
        "identity matrix",
        // additional keywords / synonyms
        "row vector", "2×2 matrix", "scalar multiple", "vector addition",
        "resultant vector", "position vector", "unit vector", "zero vector",
        "inverse matrix", "singular matrix", "non-singular",
        "simultaneous equations using matrix", "matrix equation"
      ]
    },
    {
      id: "functions",
      label: "Functions & Graphs",
      keywords: [
        "function", "graph", "coordinate", "gradient", "intercept", "curve",
        "asymptote", "domain", "range", "composite", "inverse function",
        "sketch", "plot", "axis", "turning point", "maximum", "minimum",
        "y-intercept", "x-intercept",
        // additional keywords / synonyms
        "equation of line", "straight line", "y = mx + c", "gradient of line",
        "x-axis", "y-axis", "origin", "coordinates", "table of values",
        "draw the graph", "read off", "intersection of graphs",
        "quadratic graph", "exponential graph", "reciprocal graph",
        "distance-time graph", "speed-time graph", "area under graph",
        "gradient of curve", "tangent to curve"
      ]
    }
  ],

  physics: [
    {
      id: "motion",
      label: "Motion, Forces & Energy",
      keywords: [
        "speed", "velocity", "acceleration", "deceleration", "distance",
        "displacement", "force", "newton", "weight", "mass", "friction",
        "gravity", "momentum", "kinetic energy", "potential energy",
        "work done", "power", "efficiency", "pressure", "upthrust",
        "density", "moment", "equilibrium", "centre of gravity",
        // additional keywords / synonyms
        "resultant force", "net force", "balanced forces", "unbalanced forces",
        "terminal velocity", "stopping distance", "thinking distance", "braking distance",
        "Newton's first law", "Newton's second law", "Newton's third law",
        "F = ma", "law of conservation of momentum", "elastic collision",
        "inelastic collision", "turning effect", "principle of moments",
        "centre of mass", "gravitational potential energy", "elastic potential energy",
        "law of conservation of energy", "mechanical advantage", "load", "effort",
        "Hooke's law", "spring constant", "extension", "compression",
        "pressure in fluids", "atmospheric pressure", "Pascal", "manometer",
        "hydraulic", "Archimedes' principle"
      ]
    },
    {
      id: "thermal",
      label: "Thermal Physics",
      keywords: [
        "temperature", "heat", "thermal", "conduction", "convection",
        "radiation", "specific heat capacity", "latent heat", "evaporation",
        "boiling", "melting", "freezing", "expansion", "thermometer",
        "kinetic theory", "particle", "gas", "liquid", "solid", "Celsius",
        "kelvin", "absolute zero",
        // additional keywords / synonyms
        "thermal energy", "heat transfer", "thermal equilibrium",
        "good conductor", "poor conductor", "insulator", "infrared",
        "black body", "matt surface", "shiny surface", "vacuum flask",
        "Boyle's law", "Charles's law", "ideal gas", "gas pressure",
        "gas volume", "internal energy", "specific latent heat of fusion",
        "specific latent heat of vaporisation", "cooling curve", "heating curve",
        "change of state", "solidification", "condensation", "sublimation"
      ]
    },
    {
      id: "waves",
      label: "Waves",
      keywords: [
        "wave", "wavelength", "frequency", "amplitude", "period",
        "transverse", "longitudinal", "sound", "light", "reflection",
        "refraction", "diffraction", "interference", "electromagnetic",
        "spectrum", "ultrasound", "echo", "speed of sound", "speed of light",
        "total internal reflection", "critical angle", "lens", "focal",
        "image", "real", "virtual",
        // additional keywords / synonyms
        "wavefront", "plane wave", "ray diagram", "normal", "angle of incidence",
        "angle of reflection", "angle of refraction", "Snell's law",
        "refractive index", "optical fibre", "prism", "dispersion",
        "white light", "visible spectrum", "infrared", "ultraviolet", "X-ray",
        "gamma ray", "radio wave", "microwave", "convex lens", "concave lens",
        "converging", "diverging", "principal focus", "focal length",
        "object distance", "image distance", "magnification", "real image",
        "virtual image", "mirror", "plane mirror", "convex mirror", "concave mirror",
        "echo location", "seismic wave", "P-wave", "S-wave"
      ]
    },
    {
      id: "electricity",
      label: "Electricity & Magnetism",
      keywords: [
        "current", "voltage", "resistance", "ohm", "circuit", "series",
        "parallel", "ammeter", "voltmeter", "charge", "coulomb", "power",
        "energy", "fuse", "switch", "conductor", "insulator", "semiconductor",
        "diode", "transistor", "magnetic", "magnet", "field", "electromagnet",
        "motor", "generator", "transformer", "alternating", "direct current",
        "ac", "dc", "cathode ray",
        // additional keywords / synonyms
        "potential difference", "electromotive force", "emf", "internal resistance",
        "ohm's law", "V = IR", "resistor", "variable resistor", "rheostat",
        "thermistor", "light-dependent resistor", "LDR", "capacitor",
        "cell", "battery", "power supply", "kilowatt-hour", "kWh",
        "live wire", "neutral wire", "earth wire", "three-pin plug",
        "circuit breaker", "earth leakage", "relay", "solenoid",
        "magnetic field lines", "magnetic flux", "induced current",
        "electromagnetic induction", "Lenz's law", "Fleming's rule",
        "step-up transformer", "step-down transformer", "turns ratio",
        "rectification", "half-wave", "full-wave", "smoothing"
      ]
    },
    {
      id: "atomic",
      label: "Atomic Physics",
      keywords: [
        "atom", "nucleus", "proton", "neutron", "electron", "isotope",
        "radioactive", "radioactivity", "alpha", "beta", "gamma", "decay",
        "half-life", "background radiation", "nuclear", "fission", "fusion",
        "ionisation", "geiger", "detector",
        // additional keywords / synonyms
        "alpha particle", "beta particle", "gamma ray", "alpha decay",
        "beta decay", "gamma emission", "nuclear equation", "atomic number",
        "mass number", "nucleon number", "proton number", "nuclear radiation",
        "ionising radiation", "radioactive decay", "count rate",
        "Geiger-Müller tube", "cloud chamber", "radioactive source",
        "nuclear reactor", "chain reaction", "moderator", "control rod",
        "nuclear energy", "binding energy", "mass defect", "E = mc²"
      ]
    },
    {
      id: "space",
      label: "Space Physics",
      keywords: [
        "star", "galaxy", "universe", "planet", "orbit", "solar system",
        "moon", "sun", "telescope", "red shift", "big bang", "gravitational",
        "satellite", "comet", "asteroid", "nebula",
        // additional keywords / synonyms
        "red giant", "white dwarf", "black hole", "supernova", "neutron star",
        "main sequence", "Hertzsprung-Russell", "light year", "parsec",
        "Milky Way", "elliptical orbit", "gravitational field", "escape velocity",
        "geostationary orbit", "polar orbit", "cosmic microwave background",
        "dark matter", "dark energy", "expanding universe", "Hubble"
      ]
    }
  ],

  "computer-science": [
    {
      id: "data-representation",
      label: "Data Representation",
      keywords: [
        "binary", "hexadecimal", "denary", "bit", "byte", "nibble",
        "ASCII", "unicode", "two's complement", "sign and magnitude",
        "floating point", "mantissa", "exponent", "encode", "represent",
        "convert", "bitmap", "pixel", "resolution", "colour depth",
        "sampling rate", "sample size", "sound", "image", "video",
        "compression", "lossy", "lossless",
        // additional keywords / synonyms
        "denary to binary", "binary to denary", "binary to hexadecimal",
        "hexadecimal to binary", "binary addition", "binary subtraction",
        "overflow", "character code", "number base", "base 2", "base 16",
        "base 10", "digital data", "analogue to digital", "digitise",
        "file size", "storage size", "kilobyte", "megabyte", "gigabyte",
        "run-length encoding", "RLE", "Huffman coding", "lossless compression",
        "lossy compression", "image file", "sound file", "metadata"
      ]
    },
    {
      id: "data-transmission",
      label: "Data Transmission",
      keywords: [
        "transmission", "serial", "parallel", "bandwidth", "baud rate",
        "parity", "checksum", "error detection", "error correction",
        "protocol", "USB", "ethernet", "wifi", "bluetooth", "fibre optic",
        "copper", "wireless", "encryption", "packet", "network",
        // additional keywords / synonyms
        "parity bit", "parity check", "even parity", "odd parity",
        "echo check", "error checking", "ARQ", "data integrity",
        "half duplex", "full duplex", "simplex", "synchronous", "asynchronous",
        "bit rate", "data rate", "latency", "noise", "attenuation",
        "repeater", "amplifier", "signal", "digital signal", "analogue signal",
        "modulation", "demodulation", "modem"
      ]
    },
    {
      id: "hardware",
      label: "Hardware",
      keywords: [
        "CPU", "processor", "ALU", "control unit", "register", "RAM",
        "ROM", "cache", "memory", "clock", "bus", "address", "data bus",
        "control bus", "fetch-execute", "instruction set", "input", "output",
        "storage", "HDD", "SSD", "optical", "motherboard", "GPU",
        "peripheral",
        // additional keywords / synonyms
        "arithmetic logic unit", "fetch decode execute", "machine code",
        "assembly language", "instruction", "program counter", "accumulator",
        "memory address register", "MAR", "memory data register", "MDR",
        "current instruction register", "CIR", "clock speed", "GHz",
        "core", "multi-core", "word length", "address bus",
        "secondary storage", "primary memory", "volatile", "non-volatile",
        "read-only memory", "random access memory", "flash memory",
        "solid state drive", "hard disk drive", "optical disk", "CD", "DVD",
        "Blu-ray", "keyboard", "mouse", "touchscreen", "microphone",
        "speaker", "printer", "monitor", "scanner", "webcam"
      ]
    },
    {
      id: "internet",
      label: "Internet & Networks",
      keywords: [
        "internet", "network", "LAN", "WAN", "IP address", "MAC address",
        "router", "switch", "hub", "firewall", "HTTP", "HTTPS", "FTP",
        "DNS", "URL", "TCP/IP", "packet switching", "client", "server",
        "cloud", "VPN", "network topology", "star", "mesh", "ring",
        // additional keywords / synonyms
        "local area network", "wide area network", "wireless network",
        "wired network", "network interface card", "NIC", "access point",
        "SSID", "DHCP", "NAT", "port", "socket", "HTML", "web browser",
        "web server", "streaming", "upload", "download", "internet service provider",
        "ISP", "World Wide Web", "hyperlink", "cookie", "cache",
        "peer-to-peer", "file sharing", "client-server model", "topology",
        "bus topology", "star topology", "mesh topology"
      ]
    },
    {
      id: "logic",
      label: "Logic Gates & Boolean",
      keywords: [
        "logic gate", "NAND", "NOR", "XOR", "XNOR",
        "truth table", "boolean", "logic circuit", "gate", "complement",
        "De Morgan", "half adder", "full adder", "flip-flop",
        // additional keywords / synonyms
        "boolean algebra", "boolean expression", "logic diagram",
        "logic symbol", "AND gate", "OR gate", "NOT gate", "NAND gate",
        "NOR gate", "XOR gate", "exclusive OR", "boolean simplification",
        "De Morgan's theorem", "sum of products", "product of sums",
        "carry bit", "sum bit", "D flip-flop", "SR flip-flop",
        "register", "latch", "combinational circuit", "sequential circuit"
      ]
    },
    {
      id: "programming",
      label: "Programming",
      keywords: [
        "algorithm", "flowchart", "pseudocode", "variable", "constant",
        "assignment", "sequence", "selection", "iteration", "loop",
        "while", "for", "if", "else", "procedure", "function", "parameter",
        "return", "array", "string", "integer", "real", "boolean",
        "input", "output", "recursion", "library",
        // additional keywords / synonyms
        "trace table", "dry run", "desk check", "test data",
        "normal data", "boundary data", "erroneous data",
        "structured programming", "top-down design", "modular",
        "subroutine", "local variable", "global variable",
        "data type", "casting", "concatenation", "substring",
        "index", "subscript", "two-dimensional array",
        "bubble sort", "insertion sort", "linear search", "binary search",
        "count-controlled loop", "condition-controlled loop",
        "REPEAT UNTIL", "WHILE DO", "FOR TO", "nested loop",
        "nested if", "CASE", "OTHERWISE", "END IF", "END WHILE"
      ]
    },
    {
      id: "databases",
      label: "Databases",
      keywords: [
        "database", "table", "record", "field", "primary key", "foreign key",
        "SQL", "query", "SELECT", "WHERE", "JOIN", "index", "validation",
        "verification", "data type", "relationship", "entity",
        // additional keywords / synonyms
        "flat-file database", "relational database", "database management system",
        "DBMS", "data redundancy", "data inconsistency", "normalisation",
        "normalization", "entity-relationship diagram", "ERD",
        "one-to-one", "one-to-many", "many-to-many", "attribute",
        "INSERT", "UPDATE", "DELETE", "CREATE TABLE", "ORDER BY",
        "GROUP BY", "HAVING", "COUNT", "SUM", "AVG", "MAX", "MIN",
        "validation rule", "presence check", "range check", "format check",
        "type check", "length check", "lookup check"
      ]
    },
    {
      id: "security",
      label: "Security",
      keywords: [
        "security", "password", "authentication", "encryption", "malware",
        "virus", "spyware", "phishing", "hacking", "firewall", "HTTPS",
        "cyber", "threat", "access control", "biometric", "two-factor",
        // additional keywords / synonyms
        "cybersecurity", "cyber attack", "brute force", "denial of service",
        "DoS", "DDoS", "ransomware", "trojan", "worm", "adware",
        "spam", "social engineering", "identity theft", "data breach",
        "intrusion detection", "penetration testing", "white hat", "black hat",
        "captcha", "multi-factor authentication", "MFA", "digital certificate",
        "SSL", "TLS", "end-to-end encryption", "key", "cipher",
        "symmetric encryption", "asymmetric encryption", "public key",
        "private key", "hash", "checksum", "digital signature"
      ]
    },
    {
      id: "ethics",
      label: "Ethics & Impact",
      keywords: [
        "ethical", "privacy", "copyright", "intellectual property",
        "data protection", "GDPR", "environmental", "impact", "social",
        "economic", "legal", "open source", "software license",
        // additional keywords / synonyms
        "computer ethics", "digital divide", "accessibility", "inclusion",
        "net neutrality", "censorship", "surveillance", "personal data",
        "data collection", "informed consent", "terms and conditions",
        "acceptable use policy", "AUP", "plagiarism", "software piracy",
        "creative commons", "proprietary software", "freeware", "shareware",
        "artificial intelligence ethics", "automation", "job displacement",
        "health and safety", "ergonomics", "carbon footprint", "e-waste",
        "recycling", "green computing", "digital citizenship"
      ]
    }
  ],

  accounts: [
    {
      id: "accounting-principles",
      label: "Accounting Principles",
      keywords: [
        "accounting", "bookkeeping", "business entity", "money measurement",
        "going concern", "consistency", "prudence", "materiality", "accruals",
        "matching", "realisation", "historical cost", "double entry", "debit",
        "credit", "ledger", "account", "transaction", "source document",
        "invoice", "receipt", "credit note", "debit note"
      ]
    },
    {
      id: "books-of-prime-entry",
      label: "Books of Prime Entry",
      keywords: [
        "book of prime entry", "day book", "sales journal", "purchases journal",
        "returns inwards", "returns outwards", "cash book", "petty cash book",
        "analysed cash book", "bank column", "cash column", "discount allowed",
        "discount received", "posting", "ledger", "control account", "sales ledger",
        "purchases ledger", "general ledger"
      ]
    },
    {
      id: "trial-balance-and-errors",
      label: "Trial Balance & Errors",
      keywords: [
        "trial balance", "balance", "error", "suspense account", "correction",
        "omission", "commission", "principle", "compensating", "original entry",
        "complete reversal", "transposition", "casting error", "journal entry",
        "adjustment", "contra", "opening balance", "closing balance"
      ]
    },
    {
      id: "financial-statements",
      label: "Financial Statements",
      keywords: [
        "income statement", "statement of financial position", "balance sheet",
        "trading account", "profit and loss", "gross profit", "profit for the year",
        "sales", "revenue", "cost of sales", "purchases", "inventory", "drawings",
        "capital", "asset", "liability", "equity", "expense", "income",
        "depreciation", "bad debt", "provision for doubtful debts", "prepayment",
        "accrual"
      ]
    },
    {
      id: "bank-reconciliation",
      label: "Bank Reconciliation",
      keywords: [
        "bank reconciliation", "bank statement", "cash book", "unpresented cheque",
        "uncredited deposit", "standing order", "direct debit", "bank charges",
        "dishonoured cheque", "credit transfer", "overdraft", "balance per bank",
        "balance per cash book", "reconcile", "adjusted cash book"
      ]
    },
    {
      id: "partnerships-clubs-and-manufacturing",
      label: "Partnerships, Clubs & Manufacturing",
      keywords: [
        "partnership", "partner", "appropriation account", "current account",
        "capital account", "interest on capital", "interest on drawings", "salary",
        "profit sharing ratio", "club", "subscriptions", "receipts and payments",
        "income and expenditure", "accumulated fund", "manufacturing account",
        "prime cost", "factory overhead", "work in progress", "production cost"
      ]
    },
    {
      id: "accounting-ratios",
      label: "Accounting Ratios",
      keywords: [
        "ratio", "profitability", "liquidity", "gross profit margin",
        "profit margin", "mark-up", "return on capital employed", "ROCE",
        "current ratio", "acid test ratio", "quick ratio", "inventory turnover",
        "trade receivables collection period", "trade payables payment period",
        "interpret", "compare", "performance"
      ]
    }
  ],

  business: [
    {
      id: "business-activity",
      label: "Business Activity",
      keywords: [
        "business activity", "need", "want", "goods", "services", "scarcity",
        "opportunity cost", "factor of production", "land", "labour", "capital",
        "enterprise", "entrepreneur", "added value", "primary sector",
        "secondary sector", "tertiary sector", "objective", "profit", "growth",
        "survival", "market share", "stakeholder"
      ]
    },
    {
      id: "people-in-business",
      label: "People in Business",
      keywords: [
        "employee", "employer", "manager", "recruitment", "selection",
        "training", "motivation", "leadership", "communication", "teamwork",
        "organisation chart", "span of control", "chain of command",
        "delegation", "wage", "salary", "piece rate", "bonus", "job satisfaction",
        "human resource", "redundancy", "dismissal"
      ]
    },
    {
      id: "marketing",
      label: "Marketing",
      keywords: [
        "marketing", "market research", "primary research", "secondary research",
        "questionnaire", "survey", "sample", "market segment", "target market",
        "product", "price", "place", "promotion", "marketing mix", "advertising",
        "brand", "packaging", "sales", "demand", "supply", "competition",
        "customer", "consumer"
      ]
    },
    {
      id: "operations-management",
      label: "Operations Management",
      keywords: [
        "production", "operations", "productivity", "efficiency", "quality",
        "quality control", "quality assurance", "inventory", "stock", "supplier",
        "raw material", "job production", "batch production", "flow production",
        "lean production", "just in time", "location", "technology", "capacity",
        "economies of scale"
      ]
    },
    {
      id: "finance",
      label: "Finance",
      keywords: [
        "finance", "capital", "source of finance", "loan", "overdraft",
        "share capital", "retained profit", "cash flow", "cash-flow forecast",
        "break-even", "fixed cost", "variable cost", "total cost", "revenue",
        "profit", "loss", "margin of safety", "budget", "income statement",
        "balance sheet"
      ]
    },
    {
      id: "external-influences",
      label: "External Influences",
      keywords: [
        "external influence", "government", "tax", "subsidy", "law", "regulation",
        "consumer protection", "employment law", "environment", "pollution",
        "exchange rate", "interest rate", "inflation", "unemployment",
        "globalisation", "competition", "ethics", "social responsibility",
        "pressure group", "economic growth"
      ]
    }
  ],

  chemistry: [
    {
      id: "particles-and-separation",
      label: "Particles & Separation",
      keywords: [
        "solid", "liquid", "gas", "particle", "kinetic theory", "diffusion",
        "melting", "boiling", "freezing", "condensation", "sublimation",
        "mixture", "pure substance", "filtration", "crystallisation",
        "distillation", "fractional distillation", "chromatography", "solvent",
        "solute", "solution", "residue", "filtrate", "Rf value"
      ]
    },
    {
      id: "atomic-structure-and-bonding",
      label: "Atomic Structure & Bonding",
      keywords: [
        "atom", "element", "compound", "molecule", "proton", "neutron",
        "electron", "nucleus", "atomic number", "mass number", "isotope",
        "electronic configuration", "shell", "periodic table", "group", "period",
        "metal", "non-metal", "ionic bonding", "covalent bonding", "ion",
        "lattice", "structure", "formula"
      ]
    },
    {
      id: "stoichiometry",
      label: "Stoichiometry",
      keywords: [
        "relative atomic mass", "relative molecular mass", "Ar", "Mr", "mole",
        "Avogadro", "empirical formula", "molecular formula", "balanced equation",
        "stoichiometry", "limiting reagent", "concentration", "mol/dm3",
        "gas volume", "percentage yield", "percentage purity", "mass", "volume",
        "titration", "calculation"
      ]
    },
    {
      id: "chemical-reactions",
      label: "Chemical Reactions",
      keywords: [
        "chemical reaction", "reactant", "product", "word equation",
        "symbol equation", "oxidation", "reduction", "redox", "combustion",
        "thermal decomposition", "displacement", "neutralisation", "precipitation",
        "rate of reaction", "catalyst", "collision theory", "activation energy",
        "exothermic", "endothermic", "reversible reaction", "equilibrium"
      ]
    },
    {
      id: "acids-bases-and-salts",
      label: "Acids, Bases & Salts",
      keywords: [
        "acid", "base", "alkali", "salt", "pH", "indicator", "litmus",
        "methyl orange", "neutralisation", "hydrogen ion", "hydroxide ion",
        "carbonate", "nitrate", "sulfate", "chloride", "ammonium", "soluble",
        "insoluble", "preparation of salts", "crystallisation", "titration"
      ]
    },
    {
      id: "metals-and-electrolysis",
      label: "Metals & Electrolysis",
      keywords: [
        "metal", "reactivity series", "potassium", "sodium", "calcium",
        "magnesium", "aluminium", "zinc", "iron", "copper", "silver",
        "extraction", "ore", "reduction", "blast furnace", "alloy", "corrosion",
        "rusting", "electrolysis", "electrolyte", "electrode", "anode",
        "cathode", "ionic compound", "molten", "aqueous"
      ]
    },
    {
      id: "organic-chemistry",
      label: "Organic Chemistry",
      keywords: [
        "organic chemistry", "hydrocarbon", "alkane", "alkene", "alcohol",
        "carboxylic acid", "homologous series", "functional group", "isomer",
        "crude oil", "petroleum", "fractional distillation", "cracking",
        "combustion", "addition reaction", "polymer", "monomer",
        "polymerisation", "ethanol", "ethanoic acid", "ester"
      ]
    },
    {
      id: "environment-and-industry",
      label: "Environment & Industry",
      keywords: [
        "air", "water", "pollution", "pollutant", "carbon dioxide",
        "carbon monoxide", "sulfur dioxide", "nitrogen oxide", "acid rain",
        "greenhouse effect", "global warming", "fertiliser", "ammonia",
        "Haber process", "contact process", "sulfuric acid", "limestone",
        "water treatment", "recycling", "sustainability"
      ]
    }
  ],

  economics: [
    {
      id: "basic-economic-problem",
      label: "Basic Economic Problem",
      keywords: [
        "scarcity", "choice", "opportunity cost", "needs", "wants",
        "economic problem", "factor of production", "land", "labour",
        "capital", "enterprise", "resource allocation", "production possibility",
        "PPC", "specialisation", "division of labour", "exchange"
      ]
    },
    {
      id: "market-forces",
      label: "Market Forces",
      keywords: [
        "demand", "supply", "price", "market", "equilibrium", "shortage",
        "surplus", "elasticity", "price elasticity of demand", "PED",
        "price elasticity of supply", "PES", "substitute", "complement",
        "consumer surplus", "producer surplus", "market failure"
      ]
    },
    {
      id: "government-and-macroeconomy",
      label: "Government & Macroeconomy",
      keywords: [
        "government", "tax", "subsidy", "public spending", "budget",
        "fiscal policy", "monetary policy", "interest rate", "inflation",
        "unemployment", "economic growth", "GDP", "standard of living",
        "balance of payments", "exchange rate", "recession", "aggregate demand"
      ]
    },
    {
      id: "firms-and-production",
      label: "Firms & Production",
      keywords: [
        "firm", "business", "production", "cost", "fixed cost", "variable cost",
        "total cost", "average cost", "revenue", "profit", "productivity",
        "economies of scale", "diseconomies of scale", "competition", "monopoly",
        "market structure", "private sector", "public sector"
      ]
    },
    {
      id: "labour-market",
      label: "Labour Market",
      keywords: [
        "labour", "worker", "wage", "salary", "employment", "unemployment",
        "trade union", "productivity", "specialisation", "mobility of labour",
        "minimum wage", "labour force", "occupation", "training", "skills",
        "derived demand", "participation rate"
      ]
    },
    {
      id: "international-trade-and-development",
      label: "International Trade & Development",
      keywords: [
        "international trade", "import", "export", "tariff", "quota",
        "protectionism", "free trade", "exchange rate", "balance of trade",
        "current account", "globalisation", "development", "developing country",
        "developed country", "poverty", "income distribution", "aid",
        "foreign investment", "multinational", "comparative advantage"
      ]
    }
  ]
};
