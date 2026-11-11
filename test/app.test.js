const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { createApp } = require("../app");

function request(server, method, path, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        method,
        port: server.address().port,
        path,
        headers: payload
          ? {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(payload)
            }
          : undefined
      },
      (res) => {
        let responseBody = "";
        res.on("data", (chunk) => {
          responseBody += chunk;
        });
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            body: responseBody ? JSON.parse(responseBody) : null
          });
        });
      }
    );

    req.on("error", reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

test("health endpoint returns service status", async () => {
  const server = http.createServer(createApp());
  await new Promise((resolve) => server.listen(0, resolve));

  try {
    const response = await request(server, "GET", "/health");
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, { status: "ok" });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("can create and list students, classes and enrollments", async () => {
  const server = http.createServer(createApp());
  await new Promise((resolve) => server.listen(0, resolve));

  try {
    const student = await request(server, "POST", "/students", {
      firstName: "Aminata",
      lastName: "Diallo",
      level: "CM1"
    });
    assert.equal(student.statusCode, 201);

    const schoolClass = await request(server, "POST", "/classes", {
      name: "CM1-A",
      level: "CM1"
    });
    assert.equal(schoolClass.statusCode, 201);

    const enrollment = await request(server, "POST", "/enrollments", {
      studentId: student.body.id,
      classId: schoolClass.body.id
    });
    assert.equal(enrollment.statusCode, 201);

    const classStudents = await request(
      server,
      "GET",
      `/classes/${schoolClass.body.id}/students`
    );
    assert.equal(classStudents.statusCode, 200);
    assert.equal(classStudents.body.length, 1);
    assert.equal(classStudents.body[0].firstName, "Aminata");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("enrollment rejects unknown entities", async () => {
  const server = http.createServer(createApp());
  await new Promise((resolve) => server.listen(0, resolve));

  try {
    const enrollment = await request(server, "POST", "/enrollments", {
      studentId: 999,
      classId: 999
    });
    assert.equal(enrollment.statusCode, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
