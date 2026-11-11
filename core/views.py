import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import Enrollment, SchoolClass, Student


def _parse_json(request):
    try:
        return json.loads(request.body or "{}"), None
    except json.JSONDecodeError:
        return None, JsonResponse({"error": "Invalid JSON body"}, status=400)


def _serialize_student(student):
    return {
        "id": student.id,
        "firstName": student.first_name,
        "lastName": student.last_name,
        "level": student.level,
    }


def _serialize_class(school_class):
    return {"id": school_class.id, "name": school_class.name, "level": school_class.level}


@require_http_methods(["GET"])
def health(request):
    return JsonResponse({"status": "ok"})


@csrf_exempt
@require_http_methods(["GET", "POST"])
def students(request):
    if request.method == "GET":
        return JsonResponse([_serialize_student(item) for item in Student.objects.all()], safe=False)

    body, error = _parse_json(request)
    if error:
        return error

    required = ["firstName", "lastName", "level"]
    if any(not body.get(field) for field in required):
        return JsonResponse({"error": "firstName, lastName and level are required"}, status=400)

    student = Student.objects.create(
        first_name=body["firstName"], last_name=body["lastName"], level=body["level"]
    )
    return JsonResponse(_serialize_student(student), status=201)


@csrf_exempt
@require_http_methods(["GET", "POST"])
def classes(request):
    if request.method == "GET":
        return JsonResponse([_serialize_class(item) for item in SchoolClass.objects.all()], safe=False)

    body, error = _parse_json(request)
    if error:
        return error

    required = ["name", "level"]
    if any(not body.get(field) for field in required):
        return JsonResponse({"error": "name and level are required"}, status=400)

    school_class = SchoolClass.objects.create(name=body["name"], level=body["level"])
    return JsonResponse(_serialize_class(school_class), status=201)


@csrf_exempt
@require_http_methods(["POST"])
def enrollments(request):
    body, error = _parse_json(request)
    if error:
        return error

    student_id = body.get("studentId")
    class_id = body.get("classId")
    if not student_id or not class_id:
        return JsonResponse({"error": "studentId and classId are required"}, status=400)

    try:
        student = Student.objects.get(id=student_id)
        school_class = SchoolClass.objects.get(id=class_id)
    except (Student.DoesNotExist, SchoolClass.DoesNotExist):
        return JsonResponse({"error": "student or class not found"}, status=404)

    if Enrollment.objects.filter(student=student, school_class=school_class).exists():
        return JsonResponse({"error": "student is already enrolled in this class"}, status=409)

    enrollment = Enrollment.objects.create(student=student, school_class=school_class)
    return JsonResponse(
        {"id": enrollment.id, "studentId": enrollment.student_id, "classId": enrollment.school_class_id},
        status=201,
    )


@require_http_methods(["GET"])
def class_students(request, class_id):
    try:
        school_class = SchoolClass.objects.get(id=class_id)
    except SchoolClass.DoesNotExist:
        return JsonResponse({"error": "class not found"}, status=404)

    students_data = [_serialize_student(item.student) for item in school_class.enrollments.select_related("student")]
    return JsonResponse(students_data, safe=False)
