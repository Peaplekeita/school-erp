from django.test import TestCase


class SchoolApiTests(TestCase):
    def test_health_endpoint(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(response.content, {"status": "ok"})

    def test_create_entities_and_enroll(self):
        student_response = self.client.post(
            "/students",
            data={"firstName": "Aminata", "lastName": "Diallo", "level": "CM1"},
            content_type="application/json",
        )
        self.assertEqual(student_response.status_code, 201)
        student_id = student_response.json()["id"]

        class_response = self.client.post(
            "/classes",
            data={"name": "CM1-A", "level": "CM1"},
            content_type="application/json",
        )
        self.assertEqual(class_response.status_code, 201)
        class_id = class_response.json()["id"]

        enrollment_response = self.client.post(
            "/enrollments",
            data={"studentId": student_id, "classId": class_id},
            content_type="application/json",
        )
        self.assertEqual(enrollment_response.status_code, 201)

        students_in_class = self.client.get(f"/classes/{class_id}/students")
        self.assertEqual(students_in_class.status_code, 200)
        self.assertEqual(len(students_in_class.json()), 1)

    def test_enrollment_with_unknown_entities(self):
        response = self.client.post(
            "/enrollments",
            data={"studentId": 999, "classId": 999},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 404)
