import assert from "node:assert/strict";
import {
  loadTutorClassrooms,
  uploadGeneratedPaperToClassroom,
} from "../firebaseBackend.js";

const context = { adminKey: "ADMIN_9" };
const classroom = {
  CLASSROOM_ID: 1045,
  TITLE: "Computer Science",
  STORAGE_FOLDER: "1045_NOTES",
};

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function databasePath(url) {
  const parsed = new URL(url);
  return decodeURIComponent(parsed.pathname.replace(/^\/|\.json$/g, ""));
}

async function testTutorClassroomFiltering() {
  globalThis.fetch = async (url) => {
    const path = databasePath(url);
    if (path === "ADMIN/ADMIN_9") {
      return jsonResponse({ VIRTUAL_ROOMS: "1045,1048" });
    }
    if (path === "CLASSROOMS") {
      return jsonResponse({
        CLASSROOM_1045: classroom,
        CLASSROOM_9999: {
          CLASSROOM_ID: 9999,
          TITLE: "Another Tutor",
          STORAGE_FOLDER: "9999_NOTES",
        },
      });
    }
    throw new Error(`Unexpected request: ${url}`);
  };

  const classrooms = await loadTutorClassrooms(context);
  assert.deepEqual(classrooms, [{
    id: 1045,
    title: "Computer Science",
    storageFolder: "1045_NOTES",
  }]);
}

async function testExistingNotesUploadFlow() {
  const writes = [];
  globalThis.fetch = async (url, options = {}) => {
    const method = options.method || "GET";
    if (String(url).startsWith("https://firebasestorage.googleapis.com/")) {
      assert.equal(method, "POST");
      assert.match(String(url), /name=1045_NOTES%2F8/);
      assert.equal(options.headers["Content-Type"], "application/pdf");
      return jsonResponse({ name: "1045_NOTES/8" });
    }

    const path = databasePath(url);
    if (method === "GET" && path === "ADMIN/ADMIN_9") {
      return jsonResponse({ VIRTUAL_ROOMS: "1045" });
    }
    if (method === "GET" && path === "CLASSROOMS") {
      return jsonResponse({ CLASSROOM_1045: classroom });
    }
    if (method === "GET" && path === "NUMBERS/ID_CLASSROOM_1045_NOTES/NUMBER") {
      return jsonResponse(7);
    }
    if (method === "PUT") {
      writes.push({ path, value: JSON.parse(options.body) });
      return jsonResponse(null);
    }
    throw new Error(`Unexpected ${method} request: ${url}`);
  };

  const result = await uploadGeneratedPaperToClassroom(context, {
    classroomId: 1045,
    fileName: "Database Revision",
    pdfBlob: new Blob(["pdf"], { type: "application/pdf" }),
  });

  assert.equal(result.noteId, 8);
  assert.equal(result.fileName, "Database Revision.pdf");
  assert.deepEqual(
    writes.map((write) => write.path),
    [
      "1045_NOTES/8",
      "NUMBERS/ID_CLASSROOM_1045_NOTES/NUMBER",
      "ADMIN/ADMIN_9/LOGS/LAST_UPLOAD_NOTES",
    ]
  );
  assert.deepEqual(Object.keys(writes[0].value).sort(), ["ID", "Link", "Name", "Time"]);
  assert.equal(writes[0].value.ID, 8);
  assert.equal(writes[0].value.Name, "Database Revision.pdf");
  assert.equal(writes[1].value, 8);
  assert.equal(writes[2].value.CLASSROOM_ID, "1045");
}

try {
  await testTutorClassroomFiltering();
  await testExistingNotesUploadFlow();
  console.log("firebaseBackend\n  PASS filters tutor-owned classrooms\n  PASS uploads through existing notes flow");
} finally {
  delete globalThis.fetch;
}
