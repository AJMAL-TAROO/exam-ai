const DATABASE_URL = "https://houseoftutors-f398e-default-rtdb.firebaseio.com";
const DEFAULT_PLAN = "BASIC";

const DEFAULT_CONFIG = {
  DEFAULT_PLAN,
  MONTH_TIMEZONE: "Indian/Mauritius",
  PLANS: {
    BASIC: {
      MONTHLY_CREDITS: 5,
    },
    PLUS: {
      MONTHLY_CREDITS: 15,
    },
    PREMIUM: {
      MONTHLY_CREDITS: 50,
    },
  },
  SUBJECT_MAP: {
    Mathematics: "maths",
    "Additional Mathematics": "maths",
    Physics: "physics",
    Chemistry: "chemistry",
    "Computer Science": "computer-science",
    "Business Studies": "business",
    Business: "business",
    Economics: "economics",
    Accounts: "accounts",
    Accounting: "accounts",
  },
};

export async function loadExamAiContext(sessionToken) {
  if (!sessionToken) {
    throw new Error("Missing Exam AI session. Open Exam AI from TAW.");
  }

  const config = await loadConfig();
  const session = await loadValidSession(sessionToken);
  const adminKey = cleanText(session.ADMIN_KEY);

  if (!adminKey) {
    throw new Error("Invalid Exam AI session. Open Exam AI from TAW again.");
  }

  const adminData = await firebaseGet(`ADMIN/${adminKey}`);
  if (!adminData || typeof adminData !== "object") {
    throw new Error("Tutor profile was not found in Firebase.");
  }

  const plan = await ensureTutorPlan(adminKey, config);
  const credit = await ensureCurrentMonthCredit(adminKey, plan, config);
  const allowedSubjects = mapTutorSubjects(adminData.SUBJECTS, config.SUBJECT_MAP);

  return {
    adminKey,
    tutorName: cleanText(adminData.FULL_NAME) || "Tutor",
    plan,
    credit,
    allowedSubjects,
    config,
    sessionToken,
  };
}

export async function refreshCurrentMonthCredit(context) {
  const credit = await ensureCurrentMonthCredit(
    context.adminKey,
    context.plan,
    context.config
  );
  context.credit = credit;
  return credit;
}

export async function consumeExamAiCredit(context) {
  const monthKey = currentMonthKey(context.config.MONTH_TIMEZONE);
  const path = `EXAM_AI/TUTOR_CREDITS/${context.adminKey}/${monthKey}`;
  const fallbackLimit = planLimit(context.plan, context.config);

  for (let attempt = 0; attempt < 4; attempt += 1) {
    let { value, etag } = await firebaseGetWithEtag(path);

    if (!value) {
      await ensureCurrentMonthCredit(context.adminKey, context.plan, context.config);
      ({ value, etag } = await firebaseGetWithEtag(path));
    }

    const limit = numberOr(value?.LIMIT, fallbackLimit);
    const used = numberOr(value?.USED, 0);
    const remaining = Math.max(0, limit - used);

    if (remaining <= 0) {
      throw new Error(`No Exam AI credits left for ${monthKey}. Credits renew next month.`);
    }

    const updated = {
      LIMIT: limit,
      USED: used + 1,
    };

    const didWrite = await firebasePutIfMatch(path, updated, etag);
    if (didWrite) {
      const credit = creditSummary(monthKey, updated.LIMIT, updated.USED);
      context.credit = credit;
      return credit;
    }
  }

  throw new Error("Credit update was busy. Please try Generate again.");
}

async function loadConfig() {
  const remoteConfig = await firebaseGet("EXAM_AI/CONFIG");
  const merged = mergeConfig(remoteConfig);

  if (!remoteConfig || typeof remoteConfig !== "object") {
    await firebaseSet("EXAM_AI/CONFIG", merged);
  }

  return merged;
}

async function loadValidSession(sessionToken) {
  const tokenPath = `EXAM_AI/SESSIONS/${sessionToken}`;
  const session = await firebaseGet(tokenPath);

  if (!session || typeof session !== "object") {
    throw new Error("Exam AI session was not found. Open Exam AI from TAW.");
  }

  const expiresAtMs = sessionExpiryMs(session);
  if (!Number.isFinite(expiresAtMs)) {
    await firebaseRemove(tokenPath);
    throw new Error("Exam AI session is invalid. Open Exam AI from TAW again.");
  }

  if (Date.now() > expiresAtMs) {
    await firebaseRemove(tokenPath);
    throw new Error("Exam AI session expired. Open Exam AI from TAW again.");
  }

  return session;
}

async function ensureTutorPlan(adminKey, config) {
  const path = `EXAM_AI/TUTOR_PLANS/${adminKey}`;
  const existing = cleanText(await firebaseGet(path)).toUpperCase();
  const availablePlans = config.PLANS || {};

  if (existing && availablePlans[existing]) {
    return existing;
  }

  const plan = cleanText(config.DEFAULT_PLAN).toUpperCase() || DEFAULT_PLAN;
  const safePlan = availablePlans[plan] ? plan : DEFAULT_PLAN;
  await firebaseSet(path, safePlan);
  return safePlan;
}

async function ensureCurrentMonthCredit(adminKey, plan, config) {
  const monthKey = currentMonthKey(config.MONTH_TIMEZONE);
  const path = `EXAM_AI/TUTOR_CREDITS/${adminKey}`;
  const limit = planLimit(plan, config);
  const creditsByMonth = await firebaseGet(path);
  const data = creditsByMonth && typeof creditsByMonth === "object"
    ? creditsByMonth
    : {};

  let current = data[monthKey];
  if (!current || typeof current !== "object") {
    current = {
      LIMIT: limit,
      USED: 0,
    };
    await firebaseSet(`${path}/${monthKey}`, current);
  } else {
    current = {
      LIMIT: numberOr(current.LIMIT, limit),
      USED: numberOr(current.USED, 0),
    };
    await firebaseSet(`${path}/${monthKey}`, current);
  }

  await deleteOldMonthNodes(path, data, monthKey);
  return creditSummary(monthKey, current.LIMIT, current.USED);
}

async function deleteOldMonthNodes(path, creditsByMonth, currentMonthKey) {
  if (!creditsByMonth || typeof creditsByMonth !== "object") {
    return;
  }

  const staleKeys = Object.keys(creditsByMonth).filter((key) => key !== currentMonthKey);
  await Promise.all(staleKeys.map((key) => firebaseRemove(`${path}/${key}`)));
}

function mapTutorSubjects(subjectsValue, subjectMap) {
  const subjects = parseCsv(subjectsValue);
  const mapEntries = Object.entries(subjectMap || DEFAULT_CONFIG.SUBJECT_MAP);
  const normalizedMap = new Map(
    mapEntries.map(([label, key]) => [normalizeSubject(label), { label, key }])
  );
  const seen = new Set();
  const mapped = [];

  for (const subject of subjects) {
    const matched = normalizedMap.get(normalizeSubject(subject));
    if (!matched || seen.has(matched.key)) {
      continue;
    }

    seen.add(matched.key);
    mapped.push({
      label: subject,
      key: matched.key,
    });
  }

  return mapped;
}

function mergeConfig(remoteConfig) {
  const remote = remoteConfig && typeof remoteConfig === "object"
    ? remoteConfig
    : {};

  return {
    DEFAULT_PLAN: remote.DEFAULT_PLAN || DEFAULT_CONFIG.DEFAULT_PLAN,
    MONTH_TIMEZONE: remote.MONTH_TIMEZONE || DEFAULT_CONFIG.MONTH_TIMEZONE,
    PLANS: {
      ...DEFAULT_CONFIG.PLANS,
      ...(remote.PLANS || {}),
    },
    SUBJECT_MAP: {
      ...DEFAULT_CONFIG.SUBJECT_MAP,
      ...(remote.SUBJECT_MAP || {}),
    },
  };
}

function planLimit(plan, config) {
  return numberOr(config.PLANS?.[plan]?.MONTHLY_CREDITS, DEFAULT_CONFIG.PLANS.BASIC.MONTHLY_CREDITS);
}

function creditSummary(monthKey, limit, used) {
  const safeLimit = numberOr(limit, DEFAULT_CONFIG.PLANS.BASIC.MONTHLY_CREDITS);
  const safeUsed = numberOr(used, 0);

  return {
    monthKey,
    limit: safeLimit,
    used: safeUsed,
    remaining: Math.max(0, safeLimit - safeUsed),
  };
}

function currentMonthKey(timeZone) {
  const formatter = new Intl.DateTimeFormat("en", {
    timeZone: timeZone || DEFAULT_CONFIG.MONTH_TIMEZONE,
    year: "numeric",
    month: "2-digit",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date()).map((part) => [part.type, part.value])
  );
  return `${parts.year}-${parts.month}`;
}

function sessionExpiryMs(session) {
  const numeric = Number(session.EXPIRES_AT_MS);
  if (Number.isFinite(numeric)) {
    return numeric;
  }

  const parsed = Date.parse(cleanText(session.EXPIRES_AT));
  return Number.isFinite(parsed) ? parsed : NaN;
}

function parseCsv(value) {
  return cleanText(value)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeSubject(value) {
  return cleanText(value).replace(/\s+/g, " ").toLowerCase();
}

function cleanText(value) {
  return value == null ? "" : String(value).trim();
}

function numberOr(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function firebaseGet(path) {
  const response = await fetch(firebaseUri(path));
  ensureSuccess(response, `read ${path}`);
  const text = await response.text();
  if (!text || text === "null") {
    return null;
  }
  return JSON.parse(text);
}

async function firebaseGetWithEtag(path) {
  const response = await fetch(firebaseUri(path), {
    headers: {
      "X-Firebase-ETag": "true",
    },
  });
  ensureSuccess(response, `read ${path}`);
  const text = await response.text();
  return {
    value: !text || text === "null" ? null : JSON.parse(text),
    etag: response.headers.get("etag"),
  };
}

async function firebaseSet(path, value) {
  const response = await fetch(firebaseUri(path), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(value),
  });
  ensureSuccess(response, `write ${path}`);
}

async function firebasePutIfMatch(path, value, etag) {
  const response = await fetch(firebaseUri(path), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "If-Match": etag,
    },
    body: JSON.stringify(value),
  });

  if (response.status === 412) {
    return false;
  }

  ensureSuccess(response, `write ${path}`);
  return true;
}

async function firebaseRemove(path) {
  const response = await fetch(firebaseUri(path), {
    method: "DELETE",
  });
  ensureSuccess(response, `delete ${path}`);
}

function firebaseUri(path) {
  const normalizedPath = path
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
  return `${DATABASE_URL}/${normalizedPath}.json`;
}

function ensureSuccess(response, action) {
  if (response.ok) {
    return;
  }

  throw new Error(`Firebase failed to ${action}: ${response.status}`);
}
