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
        "reciprocal", "number line"
      ]
    },
    {
      id: "algebra",
      label: "Algebra",
      keywords: [
        "expression", "equation", "inequality", "expand", "factorise", "factorize",
        "simplify", "formula", "subject", "simultaneous", "quadratic", "linear",
        "substitution", "sequence", "term", "nth term", "algebraic", "solve",
        "variable", "coefficient"
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
        "bearing", "scale drawing", "locus"
      ]
    },
    {
      id: "mensuration",
      label: "Mensuration",
      keywords: [
        "area", "perimeter", "volume", "surface area", "prism", "cylinder",
        "cone", "sphere", "pyramid", "compound shape", "cross-section"
      ]
    },
    {
      id: "trigonometry",
      label: "Trigonometry",
      keywords: [
        "sine", "cosine", "tangent", "sin", "cos", "tan", "soh cah toa",
        "pythagoras", "hypotenuse", "right-angled", "angle of elevation",
        "angle of depression", "trigonometric", "opposite", "adjacent"
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
        "random", "likely", "expected"
      ]
    },
    {
      id: "vectors-matrices",
      label: "Vectors & Matrices",
      keywords: [
        "vector", "matrix", "matrices", "column vector", "magnitude",
        "translation vector", "transformation matrix", "determinant", "inverse",
        "identity matrix"
      ]
    },
    {
      id: "functions",
      label: "Functions & Graphs",
      keywords: [
        "function", "graph", "coordinate", "gradient", "intercept", "curve",
        "asymptote", "domain", "range", "composite", "inverse function",
        "sketch", "plot", "axis", "turning point", "maximum", "minimum",
        "y-intercept", "x-intercept"
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
        "density", "moment", "equilibrium", "centre of gravity"
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
        "kelvin", "absolute zero"
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
        "image", "real", "virtual"
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
        "ac", "dc", "cathode ray"
      ]
    },
    {
      id: "atomic",
      label: "Atomic Physics",
      keywords: [
        "atom", "nucleus", "proton", "neutron", "electron", "isotope",
        "radioactive", "radioactivity", "alpha", "beta", "gamma", "decay",
        "half-life", "background radiation", "nuclear", "fission", "fusion",
        "ionisation", "geiger", "detector"
      ]
    },
    {
      id: "space",
      label: "Space Physics",
      keywords: [
        "star", "galaxy", "universe", "planet", "orbit", "solar system",
        "moon", "sun", "telescope", "red shift", "big bang", "gravitational",
        "satellite", "comet", "asteroid", "nebula"
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
        "compression", "lossy", "lossless"
      ]
    },
    {
      id: "data-transmission",
      label: "Data Transmission",
      keywords: [
        "transmission", "serial", "parallel", "bandwidth", "baud rate",
        "parity", "checksum", "error detection", "error correction",
        "protocol", "USB", "ethernet", "wifi", "bluetooth", "fibre optic",
        "copper", "wireless", "encryption", "packet", "network"
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
        "peripheral"
      ]
    },
    {
      id: "internet",
      label: "Internet & Networks",
      keywords: [
        "internet", "network", "LAN", "WAN", "IP address", "MAC address",
        "router", "switch", "hub", "firewall", "HTTP", "HTTPS", "FTP",
        "DNS", "URL", "TCP/IP", "packet switching", "client", "server",
        "cloud", "VPN", "network topology", "star", "mesh", "ring"
      ]
    },
    {
      id: "logic",
      label: "Logic Gates & Boolean",
      keywords: [
        "logic gate", "AND", "OR", "NOT", "NAND", "NOR", "XOR", "XNOR",
        "truth table", "boolean", "logic circuit", "gate", "complement",
        "De Morgan", "half adder", "full adder", "flip-flop"
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
        "input", "output", "recursion", "library"
      ]
    },
    {
      id: "databases",
      label: "Databases",
      keywords: [
        "database", "table", "record", "field", "primary key", "foreign key",
        "SQL", "query", "SELECT", "WHERE", "JOIN", "index", "validation",
        "verification", "data type", "relationship", "entity"
      ]
    },
    {
      id: "security",
      label: "Security",
      keywords: [
        "security", "password", "authentication", "encryption", "malware",
        "virus", "spyware", "phishing", "hacking", "firewall", "HTTPS",
        "cyber", "threat", "access control", "biometric", "two-factor"
      ]
    },
    {
      id: "ethics",
      label: "Ethics & Impact",
      keywords: [
        "ethical", "privacy", "copyright", "intellectual property",
        "data protection", "GDPR", "environmental", "impact", "social",
        "economic", "legal", "open source", "software license"
      ]
    }
  ]
};
