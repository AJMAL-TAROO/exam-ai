/**
 * A Level topic lists per subject.
 * Each entry: { id, label, keywords[] }
 * keywords are used for scoring questions into topics.
 */

export const TOPICS_A = {
  maths: [
    {
      id: "pure-algebra",
      label: "Pure – Algebra",
      keywords: [
        "polynomial", "factor theorem", "remainder theorem", "partial fraction",
        "binomial expansion", "binomial theorem", "series", "arithmetic progression",
        "geometric progression", "sum to infinity", "logarithm", "exponential",
        "modulus", "inequality", "quadratic inequality", "discriminant",
        "completing the square", "roots", "simultaneous", "surds",
        // additional keywords / synonyms
        "algebraic long division", "synthetic division", "rational roots",
        "natural numbers", "real numbers", "complex roots", "conjugate roots",
        "product of roots", "sum of roots", "Vieta's formulas",
        "log rules", "laws of logarithm", "change of base", "ln",
        "natural log", "exponential equation", "logarithmic equation",
        "absolute value", "modulus inequality", "critical values",
        "AP", "GP", "arithmetic mean", "geometric mean",
        "convergent series", "divergent series", "sigma notation",
        "nCr", "binomial coefficient", "Pascal's triangle"
      ]
    },
    {
      id: "pure-calculus",
      label: "Pure – Calculus",
      keywords: [
        "differentiate", "differentiation", "derivative", "integrate", "integration",
        "integral", "chain rule", "product rule", "quotient rule", "implicit",
        "parametric", "stationary point", "turning point", "inflection",
        "increasing", "decreasing", "maximum", "minimum", "area under curve",
        "volume of revolution", "definite integral", "indefinite integral",
        "natural logarithm", "ln", "exponential function", "rate of change",
        "tangent", "normal", "second derivative",
        // additional keywords / synonyms
        "dy/dx", "d²y/dx²", "f'(x)", "f''(x)", "gradient function",
        "first principles", "limit", "small angle approximation",
        "connected rates of change", "related rates", "implicit differentiation",
        "parametric differentiation", "integration by parts",
        "integration by substitution", "integration by partial fractions",
        "separable differential equation", "differential equation",
        "general solution", "particular solution", "initial condition",
        "trapezium rule", "numerical integration", "area between curves",
        "volume of solid of revolution", "kinematics calculus"
      ]
    },
    {
      id: "pure-trigonometry",
      label: "Pure – Trigonometry",
      keywords: [
        "radian", "arc length", "sector area", "sine rule", "cosine rule",
        "compound angle", "double angle", "half angle", "R formula",
        "sec", "cosec", "cot", "secant", "cosecant", "cotangent",
        "inverse trig", "arcsin", "arccos", "arctan", "identity",
        "trigonometric equation", "general solution", "period", "amplitude",
        // additional keywords / synonyms
        "reciprocal trigonometric", "Pythagorean identity",
        "sin²θ + cos²θ = 1", "sec²θ", "cosec²θ",
        "addition formula", "double angle formula", "half angle formula",
        "R sin(θ + α)", "R cos(θ + α)", "harmonic form",
        "sin(A ± B)", "cos(A ± B)", "tan(A ± B)",
        "exact values", "special angles", "30°", "45°", "60°",
        "solving trig equations", "trig graph", "sin graph", "cos graph",
        "phase shift", "vertical shift"
      ]
    },
    {
      id: "pure-functions",
      label: "Pure – Functions & Graphs",
      keywords: [
        "function", "domain", "range", "one-to-one", "onto", "bijection",
        "composite", "inverse function", "even", "odd", "periodic",
        "transformation", "translation", "stretch", "reflection", "asymptote",
        "modulus function", "graph", "sketch", "intercept", "intersection",
        // additional keywords / synonyms
        "f(x)", "g(x)", "fg(x)", "gf(x)", "f⁻¹(x)",
        "mapping", "many-to-one", "one-to-many", "function notation",
        "vertical line test", "horizontal line test",
        "self-inverse", "piecewise", "defined function",
        "graph transformation", "y = f(x+a)", "y = f(x) + a",
        "y = af(x)", "y = f(ax)", "y = -f(x)", "y = f(-x)",
        "graph of |f(x)|", "solve graphically", "number of solutions"
      ]
    },
    {
      id: "pure-vectors",
      label: "Pure – Vectors",
      keywords: [
        "vector", "position vector", "unit vector", "scalar product",
        "dot product", "magnitude", "direction", "parallel", "perpendicular",
        "collinear", "angle between vectors", "3D", "three-dimensional",
        "i j k", "component",
        // additional keywords / synonyms
        "displacement vector", "direction vector", "ratio theorem",
        "section formula", "midpoint", "vector equation of line",
        "equation of line in 3D", "skew lines", "intersecting lines",
        "distance from point to line", "angle between lines",
        "lambda", "parameter", "cartesian form", "column notation",
        "a·b", "i-component", "j-component", "k-component",
        "perpendicular vectors", "zero vector"
      ]
    },
    {
      id: "pure-numerical",
      label: "Pure – Numerical Methods",
      keywords: [
        "numerical method", "Newton-Raphson", "iteration", "iterative",
        "bisection", "convergence", "fixed point", "error bound",
        "root finding", "staircase diagram", "cobweb diagram",
        // additional keywords / synonyms
        "change of sign", "sign change", "root", "approximate root",
        "interval bisection", "decimal search", "xₙ₊₁ = g(xₙ)",
        "iterative formula", "convergent iteration", "divergent iteration",
        "Newton Raphson formula", "f(x) = 0", "gradient descent",
        "absolute error", "relative error", "percentage error",
        "number of iterations"
      ]
    },
    {
      id: "statistics",
      label: "Statistics",
      keywords: [
        "probability", "conditional probability", "independent", "mutually exclusive",
        "Bayes", "permutation", "combination", "binomial distribution",
        "normal distribution", "Poisson distribution", "hypothesis test",
        "significance level", "p-value", "confidence interval", "mean",
        "variance", "standard deviation", "correlation", "regression",
        "Spearman", "Pearson", "scatter diagram", "residual", "expected value",
        "cumulative distribution", "probability density", "continuous random variable",
        "discrete random variable",
        // additional keywords / synonyms
        "random variable", "probability distribution", "PDF", "CDF",
        "P(X = x)", "P(X < x)", "P(X ≤ x)", "P(X > x)",
        "B(n, p)", "N(μ, σ²)", "Po(λ)", "standardise", "z-score",
        "standard normal", "Φ(z)", "normal approximation",
        "Poisson approximation", "continuity correction",
        "null hypothesis", "alternative hypothesis", "H₀", "H₁",
        "critical region", "test statistic", "one-tailed", "two-tailed",
        "Type I error", "Type II error", "nCr", "nPr",
        "product rule", "addition rule", "Venn diagram",
        "sample mean", "unbiased estimate", "sample variance",
        "population", "sample", "census", "sampling method",
        "stratified", "systematic", "simple random", "cluster"
      ]
    },
    {
      id: "mechanics",
      label: "Mechanics",
      keywords: [
        "force", "Newton", "equilibrium", "moment", "torque", "friction",
        "coefficient of friction", "tension", "thrust", "compression",
        "velocity", "acceleration", "displacement", "SUVAT", "projectile",
        "energy", "momentum", "impulse", "conservation", "elastic",
        "inelastic", "work-energy", "power", "connected particles",
        "Atwood", "inclined plane", "circular motion", "centripetal",
        "angular velocity", "simple harmonic motion", "SHM",
        // additional keywords / synonyms
        "Newton's laws", "F = ma", "resultant force", "net force",
        "resolving forces", "resolve", "component of force",
        "limiting friction", "smooth surface", "rough surface",
        "light string", "inextensible string", "pulleys", "wedge",
        "lamina", "centre of gravity", "couple", "coplanar forces",
        "Lami's theorem", "triangle of forces",
        "v = u + at", "s = ut + ½at²", "v² = u² + 2as",
        "range of projectile", "maximum height", "time of flight",
        "conservation of energy", "conservation of momentum",
        "kinetic energy", "potential energy", "work done",
        "power output", "efficiency", "angular displacement",
        "angular acceleration", "centripetal acceleration",
        "period of circular motion", "amplitude", "frequency",
        "restoring force", "Hooke's law"
      ]
    }
  ],

  physics: [
    {
      id: "measurements",
      label: "Physical Quantities & Measurement",
      keywords: [
        "SI unit", "base unit", "derived unit", "homogeneous", "dimensional",
        "uncertainty", "error", "systematic", "random", "precision", "accuracy",
        "significant figure", "scalar", "vector", "order of magnitude",
        // additional keywords / synonyms
        "absolute uncertainty", "percentage uncertainty", "fractional uncertainty",
        "combining uncertainties", "error bar", "reading error",
        "parallax error", "zero error", "calibration", "sensitivity",
        "resolution", "range", "repeatability", "reproducibility",
        "dimensional analysis", "homogeneity", "fundamental quantity",
        "kilogram", "metre", "second", "ampere", "kelvin", "mole", "candela"
      ]
    },
    {
      id: "kinematics",
      label: "Kinematics",
      keywords: [
        "displacement", "velocity", "acceleration", "SUVAT", "uniform acceleration",
        "projectile", "free fall", "speed-time graph", "displacement-time graph",
        "gradient", "area under graph",
        // additional keywords / synonyms
        "v-t graph", "s-t graph", "a-t graph", "deceleration",
        "terminal velocity", "initial velocity", "final velocity",
        "horizontal component", "vertical component", "time of flight",
        "range of projectile", "maximum height", "relative velocity",
        "relative motion", "instantaneous velocity", "average velocity",
        "v = u + at", "s = ut + ½at²", "v² = u² + 2as",
        "non-uniform acceleration", "variable acceleration"
      ]
    },
    {
      id: "dynamics",
      label: "Dynamics",
      keywords: [
        "force", "Newton's law", "mass", "weight", "friction", "normal reaction",
        "tension", "thrust", "momentum", "impulse", "conservation of momentum",
        "elastic collision", "inelastic collision", "centre of mass",
        // additional keywords / synonyms
        "Newton's first law", "Newton's second law", "Newton's third law",
        "F = ma", "resultant force", "net force", "drag", "air resistance",
        "terminal velocity", "free body diagram", "resolving forces",
        "connected particles", "Atwood machine", "inclined plane",
        "coefficient of friction", "limiting friction", "smooth surface",
        "rough surface", "linear momentum", "change in momentum",
        "rate of change of momentum", "impulse-momentum theorem",
        "conservation of linear momentum", "perfectly elastic",
        "perfectly inelastic", "coefficient of restitution"
      ]
    },
    {
      id: "work-energy",
      label: "Work, Energy & Power",
      keywords: [
        "work done", "kinetic energy", "potential energy", "gravitational",
        "elastic", "conservation of energy", "power", "efficiency",
        "work-energy theorem",
        // additional keywords / synonyms
        "gravitational potential energy", "elastic potential energy",
        "chemical energy", "thermal energy", "nuclear energy",
        "energy transfer", "energy conversion", "dissipation",
        "W = Fd", "W = Fs cos θ", "KE = ½mv²", "GPE = mgh",
        "P = Fv", "P = W/t", "useful energy", "wasted energy",
        "Sankey diagram", "energy source", "renewable", "non-renewable",
        "mechanical energy"
      ]
    },
    {
      id: "matter",
      label: "Matter & Materials",
      keywords: [
        "density", "pressure", "upthrust", "Archimedes", "Young's modulus",
        "stress", "strain", "elastic limit", "Hooke's law", "spring constant",
        "tensile", "compressive", "brittle", "ductile", "plastic", "viscosity",
        // additional keywords / synonyms
        "elastic deformation", "plastic deformation", "yield point",
        "ultimate tensile stress", "UTS", "fracture", "stiffness",
        "extension", "compression", "load", "force-extension graph",
        "stress-strain graph", "area under force-extension", "elastic strain energy",
        "fluid", "pressure in fluid", "hydrostatic pressure", "buoyancy",
        "Stokes' law", "terminal velocity in fluid", "drag force",
        "laminar flow", "turbulent flow"
      ]
    },
    {
      id: "waves",
      label: "Waves & Superposition",
      keywords: [
        "wave", "wavelength", "frequency", "amplitude", "phase",
        "coherence", "superposition", "interference", "diffraction",
        "stationary wave", "node", "antinode", "standing wave",
        "Young's double slit", "diffraction grating", "polarisation",
        "electromagnetic spectrum", "doppler effect",
        // additional keywords / synonyms
        "constructive interference", "destructive interference",
        "path difference", "phase difference", "coherent source",
        "monochromatic light", "fringe spacing", "fringe width",
        "slit separation", "order of maximum", "diffraction pattern",
        "transverse wave", "longitudinal wave", "compression", "rarefaction",
        "wavefront", "Huygens' principle", "refraction", "reflection",
        "total internal reflection", "Snell's law", "refractive index",
        "critical angle", "wave speed", "v = fλ", "period",
        "plane polarised", "Malus's law", "brewster's angle",
        "stationary wave pattern", "harmonics", "fundamental frequency",
        "overtone", "resonance", "Doppler shift", "red shift", "blue shift",
        "speed of sound", "speed of light"
      ]
    },
    {
      id: "electricity",
      label: "Electricity",
      keywords: [
        "charge", "current", "voltage", "resistance", "Ohm's law",
        "potential difference", "EMF", "internal resistance", "Kirchhoff",
        "series circuit", "parallel circuit", "resistivity", "power",
        "energy", "capacitor", "capacitance", "dielectric", "charging",
        "discharging", "time constant",
        // additional keywords / synonyms
        "Kirchhoff's first law", "Kirchhoff's second law",
        "junction rule", "loop rule", "charge carrier", "electron drift",
        "drift velocity", "number density", "I = nAve", "V = IR",
        "P = IV", "P = I²R", "P = V²/R", "Q = CV", "E = ½CV²",
        "Q = It", "W = QV", "R = ρL/A", "resistivity",
        "temperature coefficient", "superconductivity", "Wheatstone bridge",
        "potential divider", "potentiometer", "terminal potential difference",
        "lost volts", "maximum power transfer",
        "RC circuit", "CR circuit", "exponential decay", "τ = RC",
        "charging capacitor", "discharging capacitor"
      ]
    },
    {
      id: "fields",
      label: "Fields",
      keywords: [
        "gravitational field", "electric field", "magnetic field",
        "field strength", "flux", "potential", "Coulomb", "Newton's law of gravitation",
        "inverse square law", "equipotential", "field line", "orbit",
        "geostationary", "satellite", "centripetal", "escape velocity",
        // additional keywords / synonyms
        "gravitational field strength", "g = GM/r²", "gravitational potential",
        "V = -GM/r", "gravitational potential energy", "GPE = -GMm/r",
        "electric field strength", "E = F/Q", "E = V/d", "E = kQ/r²",
        "electric potential", "V = kQ/r", "Coulomb's law", "F = kQ₁Q₂/r²",
        "permittivity", "ε₀", "radial field", "uniform field",
        "point charge", "charged sphere", "capacitor plates",
        "field between parallel plates", "orbital speed", "orbital period",
        "Kepler's third law", "T² ∝ r³", "geosynchronous orbit",
        "low Earth orbit", "orbital mechanics"
      ]
    },
    {
      id: "electromagnetism",
      label: "Electromagnetism",
      keywords: [
        "magnetic flux density", "flux linkage", "Faraday", "Lenz",
        "induced EMF", "transformer", "motor", "generator", "alternating current",
        "rms", "peak", "solenoid", "toroid", "Hall effect", "cyclotron",
        // additional keywords / synonyms
        "Faraday's law", "Lenz's law", "electromagnetic induction",
        "flux change", "rate of change of flux", "ε = -dΦ/dt",
        "Φ = BA", "flux linkage = NΦ", "B = μ₀nI",
        "force on current-carrying conductor", "F = BIL", "F = BIL sinθ",
        "force on moving charge", "F = BQv", "F = BQv sinθ",
        "magnetic force", "magnetic field of solenoid",
        "step-up transformer", "step-down transformer", "turns ratio",
        "V₁/V₂ = N₁/N₂", "transformer efficiency", "eddy currents",
        "peak voltage", "peak current", "Vrms", "Irms",
        "Vrms = V₀/√2", "power in AC circuit", "P = Vrms × Irms",
        "Hall voltage", "Hall probe", "cyclotron frequency"
      ]
    },
    {
      id: "nuclear",
      label: "Nuclear & Particle Physics",
      keywords: [
        "nucleus", "proton", "neutron", "electron", "quark", "lepton",
        "hadron", "baryon", "meson", "antimatter", "radioactive decay",
        "alpha", "beta", "gamma", "half-life", "binding energy",
        "mass defect", "nuclear fission", "nuclear fusion", "particle accelerator",
        "ionisation", "detector",
        // additional keywords / synonyms
        "alpha particle", "beta minus", "beta plus", "positron",
        "antineutrino", "neutrino", "nuclear equation", "atomic number",
        "mass number", "nucleon number", "proton number",
        "strong nuclear force", "weak nuclear force", "electromagnetic force",
        "fundamental forces", "up quark", "down quark", "strange quark",
        "charge of quark", "conservation of charge", "conservation of baryon number",
        "conservation of lepton number", "pair production", "annihilation",
        "nuclear stability", "binding energy per nucleon",
        "activity", "decay constant", "A = λN", "N = N₀e^{-λt}",
        "A = A₀e^{-λt}", "count rate", "Geiger-Müller", "cloud chamber",
        "spark chamber", "linear accelerator", "synchrotron",
        "chain reaction", "critical mass", "moderator", "control rod", "coolant"
      ]
    },
    {
      id: "quantum",
      label: "Quantum Physics",
      keywords: [
        "photon", "photoelectric effect", "work function", "threshold frequency",
        "de Broglie", "wave-particle duality", "electron diffraction",
        "energy level", "emission spectrum", "absorption spectrum",
        "Planck's constant", "quantum", "momentum of photon",
        // additional keywords / synonyms
        "quantum theory", "photon energy", "E = hf", "E = hc/λ",
        "p = h/λ", "de Broglie wavelength", "wave nature of particles",
        "particle nature of waves", "photoelectron", "stopping potential",
        "kinetic energy of photoelectron", "h = 6.63 × 10⁻³⁴",
        "Planck constant", "electron volt", "eV", "ionisation energy",
        "excitation", "ground state", "excited state",
        "line spectrum", "spectral line", "visible spectrum",
        "hydrogen spectrum", "Lyman series", "Balmer series",
        "stimulated emission", "spontaneous emission", "laser",
        "coherent light", "population inversion"
      ]
    }
  ],

  chemistry: [
    {
      id: "physical-chemistry",
      label: "Physical Chemistry",
      keywords: [
        "amount of substance", "mole", "avogadro", "empirical formula",
        "molecular formula", "ideal gas", "gas equation", "enthalpy",
        "born-haber", "hess law", "entropy", "gibbs free energy",
        "equilibrium", "le chatelier", "kc", "kp", "acid", "base",
        "ph", "buffer", "ka", "kb", "salt hydrolysis", "redox",
        "electrode potential", "electrolysis", "faraday", "rate equation",
        "reaction kinetics", "activation energy", "arrhenius", "catalyst",
        // additional keywords / synonyms
        "stoichiometry", "limiting reagent", "percentage yield", "atom economy",
        "ideal gas equation", "pv = nrt", "molar volume", "standard conditions",
        "enthalpy change", "standard enthalpy change", "enthalpy cycle",
        "bond energy", "lattice energy", "hydration enthalpy",
        "entropy change", "feasibility", "spontaneous", "delta g",
        "dynamic equilibrium", "position of equilibrium", "equilibrium constant",
        "weak acid", "weak base", "strong acid", "strong base",
        "ph curve", "acid-base titration", "indicator", "half-neutralisation",
        "buffer solution", "common ion effect", "partition coefficient",
        "oxidation number", "disproportionation", "comproportionation",
        "cell potential", "e cell", "electrochemical cell", "fuel cell",
        "electrode", "cathode", "anode", "standard hydrogen electrode",
        "collision theory", "maxwell-boltzmann", "boltzmann distribution",
        "order of reaction", "rate-determining step", "initial rates",
        "heterogeneous catalyst", "homogeneous catalyst"
      ]
    },
    {
      id: "inorganic-chemistry",
      label: "Inorganic Chemistry",
      keywords: [
        "periodicity", "group 2", "group 17", "halogen", "transition element",
        "transition metal", "coordination", "ligand", "complex ion",
        "oxidation state", "redox titration", "chromate", "manganate",
        "nitrogen", "sulfur", "ammonia", "contact process", "haber process",
        "thermal stability", "solubility", "nitrate", "carbonate",
        "transition metal chemistry", "catalytic converter",
        // additional keywords / synonyms
        "period 3", "period 2", "atomic radius", "ionic radius",
        "first ionisation energy", "successive ionisation energy",
        "electronegativity", "electron affinity", "melting point trend",
        "group 2 hydroxide", "group 2 sulfate", "decomposition of nitrates",
        "chlorine", "bromine", "iodine", "halide", "halide ion",
        "displacement reaction", "reducing ability", "oxidising ability",
        "aqueous chlorine", "chlorate", "chloride", "silver halide",
        "transition series", "d-block", "variable oxidation states",
        "colour of complex", "substitution reaction", "ligand exchange",
        "coordination number", "shape of complex ion", "bidentate ligand",
        "ammonia ligand", "aqua ligand", "chloride ligand", "cn ligand",
        "nitrogen chemistry", "oxides of nitrogen", "nitric acid",
        "sulfur dioxide", "sulfur trioxide", "sulfuric acid",
        "acid rain", "nitrogen fertiliser", "environmental chemistry"
      ]
    },
    {
      id: "organic-chemistry",
      label: "Organic Chemistry",
      keywords: [
        "organic", "hydrocarbon", "alkane", "alkene", "arene", "benzene",
        "halogenoalkane", "alcohol", "aldehyde", "ketone", "carboxylic acid",
        "acyl chloride", "ester", "amine", "amide", "polymer", "addition polymer",
        "condensation polymer", "electrophilic addition", "nucleophilic substitution",
        "elimination", "oxidation of alcohol", "reduction", "reflux",
        "fractional distillation", "structural isomerism", "stereoisomerism",
        "cis-trans", "e-z isomerism", "optical isomerism", "chirality",
        // additional keywords / synonyms
        "homologous series", "general formula", "displayed formula",
        "skeletal formula", "functional group", "homolytic fission",
        "heterolytic fission", "free radical substitution", "cracking",
        "combustion", "hydration", "hydrogenation", "polymerisation",
        "electrophilic substitution", "friedel-crafts", "nitration",
        "halogenation", "phenol", "phenylamine", "diazonium salt",
        "carbonyl compound", "cyanohydrin", "2,4-dnph", "tollens reagent",
        "fehlings solution", "iodoform", "acidified dichromate",
        "nucleophilic addition", "hydrolysis", "esterification",
        "acylation", "condensation reaction", "peptide bond",
        "polyamide", "polyester", "amino acid", "protein hydrolysis",
        "chiral centre", "enantiomer", "racemic mixture",
        "structural formula", "chain isomerism", "position isomerism",
        "functional group isomerism", "geometric isomerism"
      ]
    },
    {
      id: "analysis-and-techniques",
      label: "Analysis and Techniques",
      keywords: [
        "mass spectrometry", "infrared spectroscopy", "nmr", "chromatography",
        "titration", "qualitative analysis", "test for ion", "test for gas",
        "flame test", "precipitate", "aqueous ion", "deduce structure",
        "fragment ion", "molecular ion", "chemical shift", "splitting pattern",
        "retention factor", "rf value",
        // additional keywords / synonyms
        "mass spectrum", "peak abundance", "m/z", "relative atomic mass",
        "base peak", "parent peak", "molecular formula from mass spectrum",
        "infrared spectrum", "absorption band", "wavenumber", "fingerprint region",
        "oh stretch", "c=o stretch", "n-h stretch", "c-h stretch",
        "proton nmr", "carbon-13 nmr", "13c nmr", "integration",
        "number of proton environments", "coupling", "spin-spin splitting",
        "singlet", "doublet", "triplet", "quartet", "multiplet",
        "paper chromatography", "thin layer chromatography", "column chromatography",
        "mobile phase", "stationary phase", "solvent front",
        "test for ammonium", "test for sulfate", "test for nitrate",
        "test for carbonate", "test for chloride", "test for bromide",
        "test for iodide", "test for cation", "test for anion",
        "ammonia gas", "carbon dioxide test", "hydrogen test", "oxygen test"
      ]
    }
  ],

  economics: [
    {
      id: "microeconomics",
      label: "Microeconomics",
      keywords: [
        "demand", "supply", "price mechanism", "equilibrium price",
        "elasticity", "ped", "yed", "xed", "consumer surplus",
        "producer surplus", "market failure", "externality", "public good",
        "merit good", "demerit good", "asymmetric information",
        "tax", "subsidy", "minimum price", "maximum price", "resource allocation",
        // additional keywords / synonyms
        "individual demand", "market demand", "individual supply", "market supply",
        "change in demand", "change in quantity demanded", "extension of demand",
        "contraction of demand", "shift in demand", "shift in supply",
        "joint demand", "composite demand", "derived demand", "competitive supply",
        "price elasticity of demand", "income elasticity of demand",
        "cross elasticity of demand", "price elasticity of supply",
        "complement", "substitute", "normal good", "inferior good",
        "necessity", "luxury good", "incidence of tax", "specific tax",
        "ad valorem tax", "price ceiling", "price floor", "buffer stock",
        "social cost", "social benefit", "private cost", "private benefit",
        "deadweight loss", "allocative efficiency", "productive efficiency"
      ]
    },
    {
      id: "firms-and-market-structures",
      label: "Firms and Market Structures",
      keywords: [
        "cost", "revenue", "profit", "marginal cost", "average cost",
        "economies of scale", "diseconomies of scale", "perfect competition",
        "monopoly", "monopolistic competition", "oligopoly", "contestable market",
        "price discrimination", "barriers to entry", "profit maximisation",
        "efficiency", "productivity", "market structure",
        // additional keywords / synonyms
        "fixed cost", "variable cost", "total cost", "average variable cost",
        "average fixed cost", "marginal revenue", "average revenue",
        "normal profit", "supernormal profit", "abnormal profit",
        "shutdown point", "break-even", "short run", "long run",
        "minimum efficient scale", "internal economies", "external economies",
        "managerial economies", "technical economies", "purchasing economies",
        "risk-bearing economies", "x-inefficiency", "satisficing",
        "revenue maximisation", "sales maximisation", "principal-agent problem",
        "kinked demand curve", "cartel", "collusion", "non-price competition",
        "contestability", "natural monopoly", "monopsony", "duopoly"
      ]
    },
    {
      id: "macroeconomics",
      label: "Macroeconomics",
      keywords: [
        "gdp", "gnp", "economic growth", "inflation", "deflation",
        "unemployment", "balance of payments", "current account",
        "exchange rate", "aggregate demand", "aggregate supply",
        "circular flow", "multiplier", "money supply", "banking system",
        "living standards", "development", "poverty", "inequality",
        // additional keywords / synonyms
        "real gdp", "nominal gdp", "national income", "national output",
        "real income", "output gap", "business cycle", "trade cycle",
        "demand-pull inflation", "cost-push inflation", "hyperinflation",
        "disinflation", "consumer price index", "cpi",
        "cyclical unemployment", "structural unemployment",
        "frictional unemployment", "seasonal unemployment",
        "full employment", "labour force", "participation rate",
        "aggregate demand curve", "aggregate supply curve", "sr as", "lr as",
        "consumption", "investment", "government spending", "net exports",
        "credit creation", "commercial bank", "central bank",
        "liquidity preference", "quantity theory of money",
        "human development index", "hdi", "standard of living"
      ]
    },
    {
      id: "policy-and-international-economics",
      label: "Policy and International Economics",
      keywords: [
        "fiscal policy", "monetary policy", "supply-side policy",
        "government intervention", "budget deficit", "budget surplus",
        "public expenditure", "taxation", "interest rate", "trade protection",
        "tariff", "quota", "free trade", "globalisation", "wto", "imf",
        "exchange rate policy", "macroeconomic objectives",
        // additional keywords / synonyms
        "expansionary fiscal policy", "contractionary fiscal policy",
        "direct tax", "indirect tax", "progressive tax", "regressive tax",
        "proportional tax", "automatic stabiliser", "balanced budget",
        "public sector debt", "national debt", "budget balance",
        "expansionary monetary policy", "contractionary monetary policy",
        "open market operations", "quantitative easing", "policy rate",
        "privatisation", "deregulation", "labour market reform",
        "exchange control", "floating exchange rate", "fixed exchange rate",
        "managed float", "devaluation", "revaluation", "appreciation", "depreciation",
        "comparative advantage", "absolute advantage", "terms of trade",
        "customs union", "trade bloc", "protectionism", "dumping",
        "macroeconomic policy conflict", "sustainable growth"
      ]
    }
  ],

  accounts: [
    {
      id: "financial-accounting",
      label: "Financial Accounting",
      keywords: [
        "double entry", "ledger", "journal", "trial balance", "suspense account",
        "income statement", "statement of financial position", "balance sheet",
        "depreciation", "accrual", "prepayment", "bad debt", "irrecoverable debt",
        "allowance for receivables", "bank reconciliation", "capital expenditure",
        "revenue expenditure", "inventory valuation", "nrv",
        // additional keywords / synonyms
        "bookkeeping", "general journal", "sales journal", "purchases journal",
        "cash book", "petty cash", "control account", "sales ledger control account",
        "purchases ledger control account", "correction of errors",
        "error of omission", "error of commission", "error of principle",
        "depreciation method", "straight line", "reducing balance",
        "disposal account", "non-current asset", "current asset",
        "current liability", "non-current liability", "working capital",
        "year-end adjustment", "provision for depreciation",
        "inventory", "fifo", "avco", "lower of cost and nrv",
        "consignment", "incomplete records", "single entry"
      ]
    },
    {
      id: "published-and-company-accounts",
      label: "Published and Company Accounts",
      keywords: [
        "share capital", "ordinary share", "preference share", "debenture",
        "retained earnings", "statement of changes in equity", "company accounts",
        "limited company", "appropriation account", "issue of shares",
        "bonus issue", "rights issue", "dividend", "reserves",
        // additional keywords / synonyms
        "capital reserve", "revaluation reserve", "general reserve",
        "share premium", "authorised capital", "issued capital", "called-up capital",
        "redeemable preference shares", "loan note", "interest on debentures",
        "published accounts", "international accounting standards",
        "statement of profit or loss", "other comprehensive income",
        "shareholder equity", "equity finance", "gearing capital structure",
        "interim dividend", "final dividend", "dividend cover"
      ]
    },
    {
      id: "cost-and-management-accounting",
      label: "Cost and Management Accounting",
      keywords: [
        "costing", "marginal costing", "absorption costing", "break-even",
        "contribution", "limiting factor", "budget", "budgeting",
        "standard costing", "variance", "reconciliation", "overhead",
        "activity based costing", "relevant cost", "investment appraisal",
        "payback", "arr", "npv",
        // additional keywords / synonyms
        "cost centre", "cost unit", "prime cost", "factory overhead",
        "apportionment", "allocation of overheads", "under-absorption",
        "over-absorption", "labour rate variance", "labour efficiency variance",
        "material price variance", "material usage variance",
        "fixed budget", "flexed budget", "cash budget", "master budget",
        "budgeted production", "budgeted sales", "forecasting",
        "make or buy", "shutdown decision", "accept or reject order",
        "scarce resource", "contribution per limiting factor",
        "net present value", "discounted cash flow", "accounting rate of return"
      ]
    },
    {
      id: "analysis-and-interpretation",
      label: "Analysis and Interpretation",
      keywords: [
        "ratio analysis", "profitability", "liquidity", "trade receivable days",
        "trade payable days", "inventory turnover", "return on capital employed",
        "gross profit margin", "net profit margin", "gearing", "efficiency ratio",
        "cash flow", "statement of cash flows", "interpretation",
        // additional keywords / synonyms
        "current ratio", "acid test ratio", "quick ratio", "operating margin",
        "return on equity", "asset turnover", "interest cover",
        "earnings per share", "eps", "dividend yield", "price earnings ratio",
        "cash from operating activities", "investing activities", "financing activities",
        "cash generated from operations", "cash equivalent",
        "inter-firm comparison", "trend analysis", "limitations of ratio analysis",
        "stakeholder interpretation", "performance evaluation"
      ]
    }
  ],

  business: [
    {
      id: "business-activity",
      label: "Business Activity",
      keywords: [
        "business objective", "stakeholder", "enterprise", "entrepreneur",
        "added value", "primary sector", "secondary sector", "tertiary sector",
        "private sector", "public sector", "social enterprise", "business growth",
        "location", "size of business", "economies of scale",
        // additional keywords / synonyms
        "mission statement", "corporate objective", "profit maximisation",
        "survival", "growth objective", "market share", "ethics objective",
        "stakeholder conflict", "shareholder", "employee", "customer", "supplier",
        "pressure group", "internal growth", "external growth", "merger", "takeover",
        "integration", "vertical integration", "horizontal integration",
        "internal economies of scale", "external economies of scale",
        "multinational", "global business", "business environment"
      ]
    },
    {
      id: "people-and-operations",
      label: "People and Operations",
      keywords: [
        "motivation", "leadership", "management", "human resource management",
        "recruitment", "selection", "training", "appraisal", "organisation structure",
        "span of control", "delegation", "centralisation", "decentralisation",
        "production", "capacity utilisation", "lean production", "quality assurance",
        "quality control", "inventory control",
        // additional keywords / synonyms
        "maslow", "herzberg", "taylor", "mayo", "motivation theory",
        "financial motivation", "non-financial motivation", "piece rate",
        "fringe benefit", "job enrichment", "job rotation", "empowerment",
        "autocratic", "democratic", "laissez-faire", "leadership style",
        "line organisation", "matrix structure", "hierarchical structure",
        "chain of command", "delayering", "communication channel",
        "flow production", "job production", "batch production",
        "operations management", "labour productivity", "capital intensive",
        "labour intensive", "stock control", "buffer stock", "just in time",
        "kaizen", "total quality management", "tqm", "benchmarking"
      ]
    },
    {
      id: "marketing-and-finance",
      label: "Marketing and Finance",
      keywords: [
        "marketing", "market research", "market segmentation", "marketing mix",
        "product", "price", "promotion", "place", "branding", "elasticity",
        "budget", "cash flow", "income statement", "statement of financial position",
        "sources of finance", "working capital", "break-even", "contribution",
        "investment appraisal", "profitability",
        // additional keywords / synonyms
        "primary research", "secondary research", "questionnaire", "sampling",
        "consumer market", "industrial market", "niche market", "mass market",
        "market size", "market growth", "product life cycle", "extension strategy",
        "penetration pricing", "skimming", "competitive pricing",
        "price elasticity", "promotion mix", "advertising", "sales promotion",
        "public relations", "direct marketing", "e-commerce",
        "start-up capital", "long-term finance", "short-term finance",
        "share issue", "loan capital", "trade credit", "overdraft",
        "cash flow forecast", "cash budget", "gross profit", "net profit",
        "payback period", "arr", "liquidity", "gearing"
      ]
    },
    {
      id: "strategy-and-external-environment",
      label: "Strategy and External Environment",
      keywords: [
        "strategy", "strategic management", "corporate planning", "swot",
        "pest", "decision tree", "critical path analysis", "contingency planning",
        "change management", "globalisation", "multinational", "external environment",
        "competition", "government intervention", "exchange rate", "inflation",
        "business ethics", "corporate social responsibility",
        // additional keywords / synonyms
        "strategic choice", "strategy implementation", "strategic analysis",
        "ansoff matrix", "force field analysis", "decision node", "chance node",
        "expected value", "network analysis", "float time", "crash time",
        "organisational change", "resistance to change", "culture",
        "political factor", "economic factor", "social factor", "technological factor",
        "legal factor", "environmental factor", "porter five forces",
        "competitive advantage", "csr", "ethics", "sustainability",
        "exchange rate risk", "interest rate", "recession", "economic boom"
      ]
    }
  ],

  "computer-science": [
    {
      id: "ch01-information-representation",
      label: "Chapter 1 – Information representation and multimedia",
      keywords: [
        "binary", "hexadecimal", "denary conversion", "bits", "bytes",
        "ASCII", "Unicode", "character encoding", "two's complement", "overflow",
        "sampling rate", "sample resolution", "bit depth", "bitmap", "vector",
        "colour depth", "metadata",
        // additional keywords / synonyms
        "binary to denary", "denary to binary", "binary to hexadecimal",
        "hexadecimal to binary", "number base", "base 2", "base 16", "base 10",
        "sign and magnitude", "sign bit", "most significant bit", "MSB",
        "least significant bit", "LSB", "nibble", "pixel", "resolution",
        "image file", "sound file", "analogue to digital", "digitise",
        "lossy compression", "lossless compression", "run-length encoding", "RLE",
        "Huffman coding", "file size", "storage size"
      ]
    },
    {
      id: "ch02-communication",
      label: "Chapter 2 – Communication",
      keywords: [
        "LAN", "WAN", "PAN", "topology", "bus topology", "star topology",
        "mesh topology", "client-server", "peer-to-peer", "bandwidth", "latency",
        "throughput", "packets", "MAC address", "IP address", "subnet",
        "router", "switch", "firewall", "DNS", "DHCP",
        // additional keywords / synonyms
        "local area network", "wide area network", "personal area network",
        "network topology", "ring topology", "tree topology",
        "packet switching", "packet header", "routing table",
        "IPv4", "IPv6", "subnet mask", "default gateway", "NAT",
        "ethernet", "Wi-Fi", "wireless network", "wired network",
        "network interface card", "NIC", "access point", "SSID",
        "half duplex", "full duplex", "simplex", "protocol",
        "OSI model", "TCP/IP model", "port", "socket"
      ]
    },
    {
      id: "ch03-hardware",
      label: "Chapter 3 – Hardware",
      keywords: [
        "CPU", "ALU", "control unit", "registers", "RAM", "ROM", "cache",
        "address bus", "data bus", "control bus", "secondary storage",
        "HDD", "SSD", "I/O devices", "sensors", "actuators",
        "embedded systems", "interrupts", "motherboard",
        // additional keywords / synonyms
        "central processing unit", "arithmetic logic unit",
        "random access memory", "read-only memory", "flash memory",
        "volatile memory", "non-volatile memory", "primary memory",
        "hard disk drive", "solid state drive", "optical disk", "CD", "DVD",
        "clock speed", "GHz", "word length", "bus width",
        "keyboard", "mouse", "touchscreen", "microphone", "speaker",
        "printer", "monitor", "scanner", "webcam", "peripheral",
        "interrupt service routine", "ISR", "polling", "DMA",
        "logic gates", "AND gate", "OR gate", "NOT gate", "NAND", "NOR", "XOR",
        "truth table", "boolean"
      ]
    },
    {
      id: "ch04-processor-fundamentals",
      label: "Chapter 4 – Processor fundamentals",
      keywords: [
        "fetch-decode-execute cycle", "program counter", "PC",
        "memory address register", "MAR", "memory data register", "MDR",
        "accumulator", "ACC", "instruction set", "opcode", "operand",
        "addressing modes", "assembly language", "mnemonics",
        "immediate addressing", "direct addressing", "indirect addressing",
        "bitwise AND", "bitwise OR", "bitwise XOR", "bitwise NOT",
        "shift", "rotate",
        // additional keywords / synonyms
        "fetch cycle", "decode cycle", "execute cycle",
        "current instruction register", "CIR", "status register",
        "machine code", "instruction format", "address field",
        "immediate mode", "direct mode", "indexed addressing",
        "logical shift left", "logical shift right", "arithmetic shift",
        "rotate left", "rotate right", "carry flag",
        "assembly code", "assembler directive", "label", "operand field",
        "von Neumann architecture", "stored program",
        // assembly-language mnemonic anchors (prevent misclassification as Ch 1)
        "LDM", "LDD", "LDR", "LDX", "STO", "INC", "DEC",
        "ADD", "SUB", "JMP", "JPE", "JPN", "JPZ", "OUT", "IN", "END",
        // IX is the only register/CPU trace-table term not already listed above
        // (ACC, PC, MAR, MDR, CIR are retained from the original keyword set)
        "IX"
      ]
    },
    {
      id: "ch05-system-software",
      label: "Chapter 5 – System software",
      keywords: [
        "operating system functions", "process scheduling", "memory management",
        "virtual memory", "paging", "interrupt handling", "device drivers",
        "file systems", "utilities", "compiler", "interpreter", "assembler",
        "linker", "syntax error", "logic error",
        // additional keywords / synonyms
        "OS", "kernel", "shell", "multitasking", "multiprogramming",
        "time-sharing", "batch processing", "real-time OS",
        "round robin scheduling", "priority scheduling", "first come first served",
        "FCFS", "shortest job first", "SJF",
        "page table", "page fault", "frame", "swap space",
        "segmentation", "thrashing", "memory allocation", "fragmentation",
        "FAT", "NTFS", "directory", "path", "file management",
        "translation software", "high-level language", "low-level language",
        "source code", "object code", "executable", "library", "loader"
      ]
    },
    {
      id: "ch06-security-privacy-integrity",
      label: "Chapter 6 – Security, privacy and data integrity",
      keywords: [
        "CIA triad", "authentication", "authorization", "access control",
        "malware", "phishing", "social engineering", "backups",
        "validation", "verification", "hashing", "parity check",
        "check digit", "checksum", "data corruption", "audit trail",
        // additional keywords / synonyms
        "confidentiality", "integrity", "availability",
        "virus", "worm", "trojan", "ransomware", "spyware", "adware",
        "password", "biometric", "two-factor authentication", "MFA",
        "brute force", "dictionary attack", "phishing email",
        "data backup", "full backup", "incremental backup", "differential backup",
        "range check", "format check", "type check", "length check",
        "presence check", "lookup check", "input validation",
        "echo check", "read-after-write", "double entry",
        "hash value", "hash function", "digital signature", "encryption",
        "access control list", "ACL", "firewall", "intrusion detection"
      ]
    },
    {
      id: "ch07-ethics-ownership",
      label: "Chapter 7 – Ethics and ownership",
      keywords: [
        "intellectual property", "copyright", "licensing", "open source",
        "proprietary software", "digital divide", "bias", "privacy",
        "surveillance", "professional ethics", "environmental impact",
        "AI ethics", "accountability", "data protection law",
        // additional keywords / synonyms
        "software license", "creative commons", "freeware", "shareware",
        "software piracy", "plagiarism", "patent", "trademark",
        "GDPR", "data protection", "personal data", "informed consent",
        "acceptable use policy", "AUP", "computer ethics",
        "digital citizenship", "net neutrality", "censorship",
        "automation", "job displacement", "carbon footprint", "e-waste",
        "green computing", "recycling", "health and safety", "ergonomics",
        "artificial intelligence ethics", "algorithmic bias",
        "social impact", "economic impact"
      ]
    },
    {
      id: "ch08-databases",
      label: "Chapter 8 – Databases",
      keywords: [
        "entity", "attribute", "primary key", "foreign key", "relationship",
        "cardinality", "ERD", "normalization", "1NF", "2NF", "3NF",
        "referential integrity", "SQL SELECT", "WHERE", "JOIN", "GROUP BY",
        "DDL", "DML", "indexes",
        // additional keywords / synonyms
        "relational database", "database management system", "DBMS",
        "entity-relationship diagram", "ER diagram",
        "one-to-one", "one-to-many", "many-to-many",
        "normalisation", "first normal form", "second normal form", "third normal form",
        "functional dependency", "partial dependency", "transitive dependency",
        "data redundancy", "data anomaly",
        "SELECT", "FROM", "INSERT INTO", "UPDATE SET", "DELETE FROM",
        "CREATE TABLE", "ALTER TABLE", "DROP TABLE",
        "INNER JOIN", "LEFT JOIN", "ORDER BY", "HAVING",
        "COUNT", "SUM", "AVG", "MAX", "MIN",
        "index", "query", "table", "record", "field",
        "transaction", "ACID", "atomicity", "consistency", "isolation", "durability"
      ]
    },
    {
      id: "ch09-algorithm-design",
      label: "Chapter 9 – Algorithm design and problem solving",
      keywords: [
        "decomposition", "abstraction", "pattern recognition", "pseudocode",
        "flowcharts", "dry run", "trace table", "stepwise refinement",
        "preconditions", "postconditions", "algorithm correctness", "efficiency",
        "Big-O basics", "test data", "edge cases",
        // additional keywords / synonyms
        "computational thinking", "top-down design", "modular design",
        "sub-problem", "problem decomposition", "algorithm design",
        "sequence", "selection", "iteration", "loop",
        "desk check", "normal data", "boundary data", "erroneous data",
        "structured programming", "modular programming",
        "time complexity", "space complexity", "algorithm efficiency",
        "linear search", "binary search", "bubble sort", "insertion sort",
        "merge sort", "quick sort", "sorting algorithm", "searching algorithm"
      ]
    },
    {
      id: "ch10-data-types-structures",
      label: "Chapter 10 – Data types and structures",
      keywords: [
        "integer", "real", "boolean", "string", "record", "array",
        "1D array", "2D array", "stack", "queue", "linked list",
        "file handling", "sequential access", "random access",
        "ADT", "push", "pop", "enqueue", "dequeue", "traversal",
        "searching",
        // additional keywords / synonyms
        "data type", "primitive type", "composite type",
        "one-dimensional array", "two-dimensional array",
        "abstract data type", "LIFO", "FIFO",
        "top of stack", "front of queue", "rear of queue",
        "overflow", "underflow", "empty stack", "empty queue",
        "node", "pointer", "head pointer", "tail pointer",
        "singly linked list", "doubly linked list",
        "serial file", "sequential file", "text file", "binary file",
        "open file", "close file", "read file", "write file",
        "end of file", "EOF", "file mode", "append mode"
      ]
    },
    {
      id: "ch11-programming",
      label: "Chapter 11 – Programming",
      keywords: [
        "variables", "constants", "assignment", "input", "output",
        "selection", "IF", "CASE", "iteration", "FOR", "WHILE", "REPEAT",
        "procedures", "functions", "parameters", "scope", "modularity",
        "recursion", "validation", "exception types", "debugging",
        // additional keywords / synonyms
        "variable declaration", "data type", "integer", "real", "boolean", "string",
        "local variable", "global variable", "byvalue", "byreference",
        "pass by value", "pass by reference", "return value",
        "subroutine", "procedure call", "function call",
        "nested loop", "nested if", "CASE statement", "OTHERWISE",
        "count-controlled loop", "condition-controlled loop",
        "REPEAT UNTIL", "WHILE DO", "FOR TO NEXT",
        "syntax error", "logic error", "runtime error",
        "trace", "breakpoint", "test harness", "stub",
        "defensive programming", "input validation"
      ]
    },
    {
      id: "ch12-software-development",
      label: "Chapter 12 – Software development",
      keywords: [
        "SDLC", "requirements", "analysis", "design", "implementation",
        "testing", "unit testing", "integration testing", "system testing",
        "test plan", "black-box testing", "white-box testing",
        "maintenance", "corrective maintenance", "adaptive maintenance",
        "perfective maintenance", "documentation", "version control",
        "prototyping", "user acceptance testing",
        // additional keywords / synonyms
        "software development lifecycle", "waterfall model", "agile",
        "spiral model", "rapid application development", "RAD",
        "requirements specification", "feasibility study",
        "system analysis", "system design", "coding", "program testing",
        "alpha testing", "beta testing", "UAT",
        "regression testing", "path testing", "statement coverage",
        "branch coverage", "stubs", "drivers",
        "technical documentation", "user documentation",
        "git", "repository", "commit", "branch", "merge",
        "program maintenance", "evaluation", "review"
      ]
    },
    {
      id: "ch13-data-representation-a",
      label: "Chapter 13 – Data representation (A Level)",
      keywords: [
        "user-defined types", "enumerated types", "sets", "pointers",
        "references", "file organization", "serial files", "sequential files",
        "indexing", "hashing", "floating-point format", "mantissa", "exponent",
        "rounding error", "underflow", "overflow", "representation error",
        // additional keywords / synonyms
        "composite data type", "record type", "pointer type",
        "dynamic data structure", "heap memory", "stack memory",
        "serial access", "sequential access", "indexed sequential",
        "hash table", "hash function", "collision", "chaining", "linear probing",
        "open addressing", "overflow bucket",
        "IEEE 754", "single precision", "double precision",
        "normalised floating point", "denormalized", "infinity", "NaN",
        "absolute error", "relative error", "truncation", "rounding"
      ]
    },
    {
      id: "ch14-communication-internet",
      label: "Chapter 14 – Communication and internet technologies",
      keywords: [
        "protocol stack", "TCP/IP", "HTTP", "HTTPS", "FTP", "SFTP",
        "SMTP", "IMAP", "POP3", "packet switching", "circuit switching",
        "routing tables", "congestion", "QoS", "encryption in transit",
        "TLS", "cookies", "sessions", "authentication protocols",
        // additional keywords / synonyms
        "transmission control protocol", "internet protocol",
        "hypertext transfer protocol", "secure HTTP",
        "file transfer protocol", "email protocol",
        "application layer", "transport layer", "network layer",
        "data link layer", "physical layer", "OSI model",
        "seven-layer model", "encapsulation", "decapsulation",
        "socket", "port number", "well-known port",
        "packet header", "packet payload", "sequence number",
        "acknowledgement", "flow control", "error control",
        "congestion control", "quality of service",
        "SSL", "certificate", "handshake", "session key",
        "URL", "URI", "DNS lookup", "IP routing"
      ]
    },
    {
      id: "ch15-hardware-a",
      label: "Chapter 15 – Hardware (A Level)",
      keywords: [
        "pipelining", "superscalar", "multicore", "parallel processing",
        "SIMD", "MIMD", "GPU", "performance metrics", "speedup", "efficiency",
        "Boolean algebra", "Karnaugh maps", "logic simplification",
        "adders", "multiplexers", "flip-flops",
        // additional keywords / synonyms
        "pipeline stages", "pipeline hazard", "data hazard", "control hazard",
        "branch prediction", "out-of-order execution",
        "RISC", "CISC", "instruction level parallelism",
        "multi-processor", "distributed processing", "vector processor",
        "Boolean laws", "De Morgan's theorem", "sum of products",
        "product of sums", "Karnaugh map", "K-map", "don't care",
        "half adder", "full adder", "carry bit",
        "multiplexer", "demultiplexer", "decoder", "encoder",
        "SR flip-flop", "D flip-flop", "JK flip-flop",
        "combinational circuit", "sequential circuit", "register",
        "latch", "clock signal", "synchronous circuit"
      ]
    },
    {
      id: "ch16-system-software-vms",
      label: "Chapter 16 – System software and virtual machines",
      keywords: [
        "hypervisor", "VM", "emulation", "virtualization", "sandboxing",
        "container", "OS kernel", "scheduling algorithms", "deadlock",
        "memory protection", "translation software differences", "bytecode",
        "virtual machine architecture", "portability",
        // additional keywords / synonyms
        "virtual machine", "type 1 hypervisor", "type 2 hypervisor",
        "bare-metal hypervisor", "hosted hypervisor",
        "hardware virtualization", "software emulation",
        "guest OS", "host OS", "virtual hardware",
        "Docker", "container image", "isolation",
        "process scheduling", "round robin", "priority queue",
        "deadlock prevention", "deadlock avoidance", "deadlock detection",
        "Banker's algorithm", "resource allocation",
        "memory segmentation", "memory paging", "address translation",
        "intermediate language", "JVM", "Java bytecode",
        "cross-platform", "write once run anywhere",
        "compiler", "interpreter", "assembler"
      ]
    },
    {
      id: "ch17-security-a",
      label: "Chapter 17 – Security (A Level)",
      keywords: [
        "symmetric encryption", "asymmetric encryption", "public key",
        "private key", "RSA", "key exchange", "digital signatures",
        "certificates", "PKI", "TLS handshake", "quantum cryptography",
        "QKD", "attack vectors", "man-in-the-middle", "brute force",
        // additional keywords / synonyms
        "symmetric key", "asymmetric key", "public key cryptography",
        "private key cryptography", "key pair", "key generation",
        "RSA algorithm", "Diffie-Hellman", "elliptic curve cryptography",
        "block cipher", "stream cipher", "AES", "DES", "3DES",
        "hash function", "SHA-256", "MD5", "HMAC",
        "digital certificate", "Certificate Authority", "CA", "PKI",
        "public key infrastructure", "certificate chain",
        "SSL", "TLS", "HTTPS", "secure channel",
        "quantum key distribution", "quantum computing",
        "man-in-the-middle attack", "replay attack",
        "phishing", "social engineering", "zero-day exploit",
        "penetration testing", "vulnerability assessment"
      ]
    },
    {
      id: "ch18-artificial-intelligence",
      label: "Chapter 18 – Artificial intelligence (A Level)",
      keywords: [
        "graph", "nodes", "edges", "weighted graph", "shortest path",
        "Dijkstra", "A*", "heuristics", "state space",
        "machine learning", "supervised learning", "unsupervised learning",
        "training data", "overfitting", "neural network", "deep learning",
        "bias", "AI ethics",
        // additional keywords / synonyms
        "directed graph", "undirected graph", "adjacency matrix",
        "adjacency list", "path finding", "graph traversal",
        "breadth-first search", "BFS", "depth-first search", "DFS",
        "greedy algorithm", "heuristic function",
        "state space search", "search tree", "pruning",
        "classification", "regression", "clustering",
        "decision tree", "random forest", "support vector machine", "SVM",
        "gradient descent", "backpropagation", "activation function",
        "hidden layer", "input layer", "output layer", "perceptron",
        "convolutional neural network", "CNN", "recurrent neural network", "RNN",
        "training set", "test set", "validation set",
        "underfitting", "cross-validation", "hyperparameter",
        "reinforcement learning", "reward function"
      ]
    },
    {
      id: "ch19-computational-thinking-a",
      label: "Chapter 19 – Computational thinking and problem solving (A Level)",
      keywords: [
        "algorithm analysis", "Big-O", "best case", "average case", "worst case",
        "recursion", "base case", "stack frame", "divide-and-conquer",
        "backtracking", "invariants", "proof of correctness",
        "optimization", "refinement", "complexity trade-offs",
        // additional keywords / synonyms
        "time complexity", "space complexity", "O(1)", "O(n)", "O(log n)",
        "O(n log n)", "O(n^2)", "O(2^n)", "polynomial time", "exponential time",
        "tractable", "intractable", "NP-complete", "NP-hard",
        "recursive algorithm", "recursive call", "call stack", "activation record",
        "tail recursion", "memoization", "memoisation", "dynamic programming",
        "merge sort", "quick sort", "binary search",
        "greedy algorithm", "greedy choice", "optimal substructure",
        "backtracking algorithm", "constraint satisfaction",
        "loop invariant", "precondition", "postcondition",
        "algorithm correctness", "termination", "partial correctness",
        "stepwise refinement", "top-down design"
      ]
    },
    {
      id: "ch20-further-programming",
      label: "Chapter 20 – Further programming (A Level)",
      keywords: [
        "OOP", "class", "object", "encapsulation", "inheritance",
        "polymorphism", "functional programming", "procedural programming",
        "file processing patterns", "exceptions", "try-catch",
        "defensive programming", "data parsing", "iterative solutions",
        "recursive solutions", "code reuse", "libraries", "modules",
        // additional keywords / synonyms
        "object-oriented programming", "instantiation", "instance",
        "constructor", "destructor", "method", "attribute", "property",
        "subclass", "superclass", "base class", "derived class",
        "method overriding", "method overloading", "operator overloading",
        "getter", "setter", "accessor", "mutator",
        "private", "public", "protected", "access modifier",
        "abstract class", "interface", "abstract method",
        "lambda function", "higher-order function", "first-class function",
        "map", "filter", "reduce", "immutable", "pure function",
        "exception handling", "error handling", "throw", "catch", "finally",
        "file reading", "file writing", "CSV parsing", "JSON parsing",
        "module import", "library function", "API"
      ]
    }
  ],
  "english": [
    {
      id: "reading-comprehension",
      label: "Reading – Comprehension",
      keywords: [
        "comprehension", "passage", "extract", "reading", "infer", "inference",
        "deduce", "deduction", "summary", "summarise", "summarize",
        "main idea", "supporting detail", "tone", "mood", "atmosphere",
        "purpose", "audience", "effect", "evidence", "quote", "reference",
        "implicit", "explicit", "connotation", "denotation",
        "fact", "opinion", "bias", "perspective", "viewpoint",
        "argue", "persuade", "inform", "entertain",
        "headline", "caption", "heading", "subheading",
        "formal", "informal", "register", "address"
      ]
    },
    {
      id: "language-analysis",
      label: "Language Analysis",
      keywords: [
        "language", "technique", "device", "metaphor", "simile", "personification",
        "alliteration", "onomatopoeia", "imagery", "symbolism", "hyperbole",
        "irony", "sarcasm", "oxymoron", "juxtaposition", "contrast",
        "repetition", "rhetorical question", "emotive language", "sensory",
        "adjective", "adverb", "verb", "noun", "tense", "active voice",
        "passive voice", "sentence structure", "short sentence", "complex sentence",
        "compound sentence", "paragraph", "discourse marker",
        "descriptive", "narrative", "dialogue", "syntax", "diction",
        "word choice", "connotation", "figurative language", "literal"
      ]
    },
    {
      id: "writing-directed",
      label: "Writing – Directed",
      keywords: [
        "directed writing", "format", "layout", "letter", "report", "speech",
        "article", "interview", "diary", "email", "review", "leaflet",
        "newsletter", "formal letter", "informal letter", "salutation",
        "sign off", "introduction", "conclusion", "paragraph structure",
        "address", "subject", "greeting", "purpose", "audience", "register",
        "persuasive", "discursive", "analytical", "advisory", "descriptive",
        "plan", "draft", "redraft", "proofread", "edit"
      ]
    },
    {
      id: "writing-composition",
      label: "Writing – Composition",
      keywords: [
        "composition", "creative writing", "narrative", "descriptive writing",
        "story", "plot", "character", "setting", "theme", "conflict",
        "resolution", "climax", "opening", "ending", "structure",
        "first person", "third person", "point of view", "narration",
        "dialogue", "show don't tell", "atmosphere", "tension",
        "pace", "vivid", "engaging", "cohesion", "coherence",
        "vocabulary", "sophisticated", "varied sentence", "expression",
        "original", "creative", "imaginative"
      ]
    },
    {
      id: "summary-writing",
      label: "Summary Writing",
      keywords: [
        "summary", "summarise", "summarize", "key point", "main point",
        "select", "identify", "own words", "paraphrase", "concise",
        "relevant", "irrelevant", "word limit", "note", "lift",
        "directly quote", "bullet point", "condense", "précis"
      ]
    }
  ]
};

// Maths is paper-aware because each Cambridge 9709 component has its own
// chapter list. Other A-Level subjects still use the legacy subject-wide array
// format until they are migrated.
TOPICS_A.maths = {
  "paper-1": {
    label: "Pure Mathematics 1",
    topics: [
      {
        id: "p1-quadratics",
        label: "Quadratics",
        keywords: [
          "quadratic", "quadratic equation", "quadratic function", "discriminant",
          "roots", "factorise", "factorize", "complete the square",
          "completing the square", "vertex", "turning point", "parabola",
          "minimum value", "maximum value", "inequality", "quadratic inequality"
        ]
      },
      {
        id: "p1-functions",
        label: "Functions",
        keywords: [
          "function", "domain", "range", "mapping", "one-to-one", "many-to-one",
          "composite function", "inverse function", "modulus function", "f(x)",
          "g(x)", "fg(x)", "gf(x)", "transformation", "translation", "stretch",
          "reflection", "graph of", "sketch"
        ]
      },
      {
        id: "p1-coordinate-geometry",
        label: "Coordinate geometry",
        keywords: [
          "coordinate geometry", "straight line", "gradient", "intercept",
          "equation of a line", "parallel", "perpendicular", "midpoint",
          "distance between", "circle", "equation of circle", "centre",
          "center", "radius", "tangent", "normal", "intersection"
        ]
      },
      {
        id: "p1-circular-measure",
        label: "Circular measure",
        keywords: [
          "radian", "radians", "arc length", "sector", "sector area",
          "angle subtended", "circumference", "minor sector", "major sector",
          "perimeter of sector", "circular measure"
        ]
      },
      {
        id: "p1-trigonometry",
        label: "Trigonometry",
        keywords: [
          "trigonometry", "sine", "cosine", "tangent", "sin", "cos", "tan",
          "sine rule", "cosine rule", "trig equation", "trigonometric equation",
          "identity", "exact value", "angle", "triangle", "bearing"
        ]
      },
      {
        id: "p1-series",
        label: "Series",
        keywords: [
          "series", "sequence", "arithmetic progression", "geometric progression",
          "AP", "GP", "common difference", "common ratio", "sum to infinity",
          "nth term", "sigma notation", "binomial expansion", "binomial theorem",
          "Pascal", "coefficient"
        ]
      },
      {
        id: "p1-differentiation",
        label: "Differentiation",
        keywords: [
          "differentiate", "differentiation", "derivative", "dy/dx",
          "gradient function", "stationary point", "turning point", "tangent",
          "normal", "increasing", "decreasing", "maximum", "minimum",
          "rate of change", "second derivative"
        ]
      },
      {
        id: "p1-integration",
        label: "Integration",
        keywords: [
          "integrate", "integration", "integral", "definite integral",
          "indefinite integral", "constant of integration", "area under curve",
          "area between curve", "reverse differentiation", "limits"
        ]
      }
    ]
  },

  "paper-2": {
    label: "Pure Mathematics 2",
    topics: [
      {
        id: "p2-algebra",
        label: "Algebra",
        keywords: [
          "algebra", "polynomial", "factor theorem", "remainder theorem",
          "factorise", "factorize", "division of polynomials", "partial fractions",
          "modulus", "inequality", "roots", "rational roots", "simultaneous"
        ]
      },
      {
        id: "p2-logarithmic-exponential",
        label: "Logarithmic and exponential functions",
        keywords: [
          "logarithm", "log", "ln", "natural log", "exponential", "e^x",
          "laws of logarithms", "change of base", "logarithmic equation",
          "exponential equation", "growth", "decay"
        ]
      },
      {
        id: "p2-trigonometry",
        label: "Trigonometry",
        keywords: [
          "trigonometry", "compound angle", "double angle", "sec", "cosec",
          "cot", "trigonometric identity", "trigonometric equation",
          "general solution", "radian", "sin", "cos", "tan", "exact value"
        ]
      },
      {
        id: "p2-differentiation",
        label: "Differentiation",
        keywords: [
          "differentiate", "differentiation", "derivative", "chain rule",
          "product rule", "quotient rule", "implicit differentiation",
          "parametric differentiation", "stationary point", "second derivative"
        ]
      },
      {
        id: "p2-integration",
        label: "Integration",
        keywords: [
          "integrate", "integration", "integral", "substitution", "by parts",
          "partial fractions", "trapezium rule", "area under curve",
          "volume of revolution", "definite integral"
        ]
      },
      {
        id: "p2-numerical-solution",
        label: "Numerical solution of equations",
        keywords: [
          "numerical solution", "iteration", "iterative formula", "Newton-Raphson",
          "Newton Raphson", "root", "approximate root", "change of sign",
          "convergence", "divergence", "staircase diagram", "cobweb diagram"
        ]
      }
    ]
  },

  "paper-3": {
    label: "Pure Mathematics 3",
    topics: [
      {
        id: "p3-algebra",
        label: "Algebra",
        keywords: [
          "algebra", "polynomial", "factor theorem", "remainder theorem",
          "partial fractions", "modulus", "inequality", "roots",
          "rational roots", "binomial expansion", "series"
        ]
      },
      {
        id: "p3-logarithmic-exponential",
        label: "Logarithmic and exponential functions",
        keywords: [
          "logarithm", "log", "ln", "natural log", "exponential", "e^x",
          "laws of logarithms", "exponential equation", "logarithmic equation",
          "growth", "decay"
        ]
      },
      {
        id: "p3-trigonometry",
        label: "Trigonometry",
        keywords: [
          "trigonometry", "compound angle", "double angle", "sec", "cosec",
          "cot", "inverse trig", "arcsin", "arccos", "arctan",
          "trigonometric identity", "trigonometric equation", "general solution"
        ]
      },
      {
        id: "p3-differentiation",
        label: "Differentiation",
        keywords: [
          "differentiate", "differentiation", "derivative", "chain rule",
          "product rule", "quotient rule", "implicit differentiation",
          "parametric differentiation", "rate of change", "second derivative"
        ]
      },
      {
        id: "p3-integration",
        label: "Integration",
        keywords: [
          "integrate", "integration", "integral", "substitution", "by parts",
          "partial fractions", "differential equation", "separable",
          "area under curve", "volume of revolution"
        ]
      },
      {
        id: "p3-numerical-solution",
        label: "Numerical solution of equations",
        keywords: [
          "numerical solution", "iteration", "iterative formula", "Newton-Raphson",
          "root", "approximate root", "change of sign", "convergence",
          "staircase diagram", "cobweb diagram"
        ]
      },
      {
        id: "p3-vectors",
        label: "Vectors",
        keywords: [
          "vector", "position vector", "unit vector", "scalar product",
          "dot product", "magnitude", "direction", "parallel", "perpendicular",
          "collinear", "angle between vectors", "3D", "i j k", "line"
        ]
      },
      {
        id: "p3-differential-equations",
        label: "Differential equations",
        keywords: [
          "differential equation", "separable", "general solution",
          "particular solution", "initial condition", "dy/dx", "rate of change",
          "modelling", "modeling", "constant of proportionality"
        ]
      },
      {
        id: "p3-complex-numbers",
        label: "Complex numbers",
        keywords: [
          "complex number", "real part", "imaginary part", "argument",
          "modulus", "Argand diagram", "conjugate", "locus", "polar form",
          "cartesian form", "roots", "i"
        ]
      }
    ]
  },

  "paper-4": {
    label: "Mechanics",
    topics: [
      {
        id: "p4-forces-equilibrium",
        label: "Forces and equilibrium",
        keywords: [
          "force", "equilibrium", "resultant force", "resolve", "resolving",
          "component", "friction", "coefficient of friction", "limiting friction",
          "normal reaction", "tension", "thrust", "smooth", "rough",
          "inclined plane", "lamina", "centre of gravity", "center of gravity"
        ]
      },
      {
        id: "p4-kinematics",
        label: "Kinematics of motion in a straight line",
        keywords: [
          "kinematics", "motion in a straight line", "displacement", "velocity",
          "acceleration", "speed", "SUVAT", "constant acceleration",
          "v = u + at", "s = ut", "v^2", "distance-time", "velocity-time",
          "area under graph", "gradient"
        ]
      },
      {
        id: "p4-momentum",
        label: "Momentum",
        keywords: [
          "momentum", "impulse", "conservation of momentum", "collision",
          "coalescence", "separation", "elastic", "inelastic", "linear momentum",
          "change in momentum", "rebound"
        ]
      },
      {
        id: "p4-newtons-laws",
        label: "Newton's laws of motion",
        keywords: [
          "Newton", "Newton's law", "F = ma", "mass", "weight",
          "acceleration", "resultant force", "connected particles", "pulley",
          "light string", "inextensible string", "tension", "driving force"
        ]
      },
      {
        id: "p4-energy-work-power",
        label: "Energy, work and power",
        keywords: [
          "energy", "work", "work done", "power", "kinetic energy",
          "potential energy", "gravitational potential energy",
          "conservation of energy", "work-energy", "efficiency", "rate of working"
        ]
      }
    ]
  },

  "paper-5": {
    label: "Probability & Statistics 1",
    topics: [
      {
        id: "p5-representation-of-data",
        label: "Representation of data",
        keywords: [
          "data", "histogram", "frequency", "cumulative frequency",
          "box plot", "stem and leaf", "mean", "median", "mode",
          "quartile", "interquartile range", "standard deviation", "variance",
          "coding", "outlier"
        ]
      },
      {
        id: "p5-permutations-combinations",
        label: "Permutations and combinations",
        keywords: [
          "permutation", "combination", "arrangement", "selection", "factorial",
          "nPr", "nCr", "ways", "choose", "order matters", "without repetition",
          "with repetition"
        ]
      },
      {
        id: "p5-probability",
        label: "Probability",
        keywords: [
          "probability", "event", "sample space", "mutually exclusive",
          "independent", "conditional probability", "tree diagram", "Venn diagram",
          "addition rule", "multiplication rule", "P(A)", "P(B)", "given"
        ]
      },
      {
        id: "p5-discrete-random-variables",
        label: "Discrete random variables",
        keywords: [
          "discrete random variable", "random variable", "probability distribution",
          "expected value", "expectation", "E(X)", "Var(X)", "variance",
          "binomial distribution", "B(n, p)", "binomial", "probability mass"
        ]
      },
      {
        id: "p5-normal-distribution",
        label: "The normal distribution",
        keywords: [
          "normal distribution", "standard normal", "z-score", "standardise",
          "standardize", "mean", "variance", "standard deviation", "N(",
          "Phi", "normal approximation", "continuity correction", "probability"
        ]
      }
    ]
  },

  "paper-6": {
    label: "Probability & Statistics 2",
    topics: [
      {
        id: "p6-poisson-distribution",
        label: "The Poisson distribution",
        keywords: [
          "Poisson", "Poisson distribution", "Po(", "lambda", "mean rate",
          "events per", "independent events", "Poisson approximation",
          "probability"
        ]
      },
      {
        id: "p6-linear-combinations",
        label: "Linear combinations of random variables",
        keywords: [
          "linear combination", "random variables", "aX + bY",
          "sum of random variables", "difference of random variables", "E(aX",
          "Var(aX", "independent", "mean of", "variance of"
        ]
      },
      {
        id: "p6-continuous-random-variables",
        label: "Continuous random variables",
        keywords: [
          "continuous random variable", "probability density function", "pdf",
          "cumulative distribution function", "cdf", "density function",
          "f(x)", "F(x)", "median", "quartile", "expected value",
          "variance", "integration"
        ]
      },
      {
        id: "p6-sampling-estimation",
        label: "Sampling and estimation",
        keywords: [
          "sample", "population", "sampling", "estimation", "estimate",
          "confidence interval", "unbiased estimate", "sample mean",
          "sample variance", "central limit theorem", "standard error",
          "random sample", "sampling distribution"
        ]
      },
      {
        id: "p6-hypothesis-tests",
        label: "Hypothesis tests",
        keywords: [
          "hypothesis test", "null hypothesis", "alternative hypothesis",
          "significance level", "critical region", "test statistic", "p-value",
          "one-tailed", "two-tailed", "reject", "do not reject",
          "Type I error", "Type II error"
        ]
      }
    ]
  }
};

function topicsFor(subjectKey, topicIds) {
  const topics = TOPICS_A[subjectKey];
  if (!Array.isArray(topics)) return [];
  const idSet = new Set(topicIds);
  return topics.filter((topic) => idSet.has(topic.id));
}

TOPICS_A.physics.paperTopics = {
  "paper-1": {
    label: "AS Physics Multiple Choice",
    topics: topicsFor("physics", [
      "measurements", "kinematics", "dynamics", "work-energy", "matter",
      "waves", "electricity"
    ])
  },
  "paper-2": {
    label: "AS Physics Structured Questions",
    topics: topicsFor("physics", [
      "measurements", "kinematics", "dynamics", "work-energy", "matter",
      "waves", "electricity"
    ])
  },
  "paper-3": {
    label: "Advanced Practical Skills",
    topics: topicsFor("physics", [
      "measurements", "kinematics", "dynamics", "work-energy", "matter",
      "waves", "electricity"
    ])
  },
  "paper-4": {
    label: "A Level Physics Structured Questions",
    topics: topicsFor("physics", [
      "measurements", "kinematics", "dynamics", "work-energy", "matter",
      "waves", "electricity", "fields", "electromagnetism", "nuclear",
      "quantum"
    ])
  }
};

TOPICS_A.chemistry.paperTopics = {
  "paper-1": {
    label: "AS Chemistry Multiple Choice",
    topics: topicsFor("chemistry", [
      "physical-chemistry", "inorganic-chemistry", "organic-chemistry",
      "analysis-and-techniques"
    ])
  },
  "paper-2": {
    label: "AS Chemistry Structured Questions",
    topics: topicsFor("chemistry", [
      "physical-chemistry", "inorganic-chemistry", "organic-chemistry",
      "analysis-and-techniques"
    ])
  },
  "paper-3": {
    label: "Advanced Practical Skills",
    topics: topicsFor("chemistry", [
      "analysis-and-techniques", "physical-chemistry", "inorganic-chemistry",
      "organic-chemistry"
    ])
  },
  "paper-4": {
    label: "A Level Chemistry Structured Questions",
    topics: topicsFor("chemistry", [
      "physical-chemistry", "inorganic-chemistry", "organic-chemistry",
      "analysis-and-techniques"
    ])
  },
  "paper-5": {
    label: "Planning, Analysis and Evaluation",
    topics: topicsFor("chemistry", [
      "analysis-and-techniques", "physical-chemistry"
    ])
  }
};

TOPICS_A.economics.paperTopics = {
  "paper-1": {
    label: "AS Economics Multiple Choice",
    topics: topicsFor("economics", [
      "microeconomics", "macroeconomics"
    ])
  },
  "paper-2": {
    label: "AS Economics Data Response and Essays",
    topics: topicsFor("economics", [
      "microeconomics", "macroeconomics"
    ])
  },
  "paper-3": {
    label: "A Level Economics Multiple Choice",
    topics: topicsFor("economics", [
      "microeconomics", "firms-and-market-structures", "macroeconomics",
      "policy-and-international-economics"
    ])
  },
  "paper-4": {
    label: "A Level Economics Data Response and Essays",
    topics: topicsFor("economics", [
      "microeconomics", "firms-and-market-structures", "macroeconomics",
      "policy-and-international-economics"
    ])
  }
};

TOPICS_A.accounts.paperTopics = {
  "paper-1": {
    label: "Accounting Multiple Choice",
    topics: topicsFor("accounts", [
      "financial-accounting", "published-and-company-accounts",
      "cost-and-management-accounting", "analysis-and-interpretation"
    ])
  },
  "paper-2": {
    label: "Accounting Fundamentals",
    topics: topicsFor("accounts", [
      "financial-accounting", "cost-and-management-accounting",
      "analysis-and-interpretation"
    ])
  },
  "paper-3": {
    label: "Financial Accounting",
    topics: topicsFor("accounts", [
      "financial-accounting", "published-and-company-accounts",
      "analysis-and-interpretation"
    ])
  },
  "paper-4": {
    label: "Cost and Management Accounting",
    topics: topicsFor("accounts", [
      "cost-and-management-accounting", "analysis-and-interpretation"
    ])
  }
};
