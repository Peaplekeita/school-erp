const { URL } = require("node:url");

function json(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function createApp() {
  const store = {
    students: [],
    classes: [],
    enrollments: []
  };

  let studentId = 1;
  let classId = 1;
  let enrollmentId = 1;

  return async function handler(req, res) {
    const method = req.method || "GET";
    const requestUrl = new URL(req.url || "/", "http://localhost");
    const path = requestUrl.pathname;

    if (method === "GET" && path === "/health") {
      json(res, 200, { status: "ok" });
      return;
    }

    if (method === "GET" && path === "/students") {
      json(res, 200, store.students);
      return;
    }

    if (method === "POST" && path === "/students") {
      try {
        const body = await parseBody(req);
        const { firstName, lastName, level } = body;
        if (!firstName || !lastName || !level) {
          json(res, 400, {
            error: "firstName, lastName and level are required"
          });
          return;
        }

        const student = { id: studentId++, firstName, lastName, level };
        store.students.push(student);
        json(res, 201, student);
      } catch (error) {
        json(res, 400, { error: error.message });
      }
      return;
    }

    if (method === "GET" && path === "/classes") {
      json(res, 200, store.classes);
      return;
    }

    if (method === "POST" && path === "/classes") {
      try {
        const body = await parseBody(req);
        const { name, level } = body;
        if (!name || !level) {
          json(res, 400, { error: "name and level are required" });
          return;
        }

        const schoolClass = { id: classId++, name, level };
        store.classes.push(schoolClass);
        json(res, 201, schoolClass);
      } catch (error) {
        json(res, 400, { error: error.message });
      }
      return;
    }

    if (method === "POST" && path === "/enrollments") {
      try {
        const body = await parseBody(req);
        const { studentId: currentStudentId, classId: currentClassId } = body;

        if (!currentStudentId || !currentClassId) {
          json(res, 400, { error: "studentId and classId are required" });
          return;
        }

        const student = store.students.find((item) => item.id === currentStudentId);
        const schoolClass = store.classes.find((item) => item.id === currentClassId);

        if (!student || !schoolClass) {
          json(res, 404, { error: "student or class not found" });
          return;
        }

        const alreadyEnrolled = store.enrollments.some(
          (item) => item.studentId === currentStudentId && item.classId === currentClassId
        );

        if (alreadyEnrolled) {
          json(res, 409, { error: "student is already enrolled in this class" });
          return;
        }

        const enrollment = {
          id: enrollmentId++,
          studentId: currentStudentId,
          classId: currentClassId
        };
        store.enrollments.push(enrollment);
        json(res, 201, enrollment);
      } catch (error) {
        json(res, 400, { error: error.message });
      }
      return;
    }

    const classStudents = path.match(/^\/classes\/(\d+)\/students$/);
    if (method === "GET" && classStudents) {
      const currentClassId = Number(classStudents[1]);
      const schoolClass = store.classes.find((item) => item.id === currentClassId);
      if (!schoolClass) {
        json(res, 404, { error: "class not found" });
        return;
      }

      const students = store.enrollments
        .filter((item) => item.classId === currentClassId)
        .map((item) => store.students.find((student) => student.id === item.studentId))
        .filter(Boolean);

      json(res, 200, students);
      return;
    }

    json(res, 404, { error: "route not found" });
  };
}

module.exports = { createApp };
