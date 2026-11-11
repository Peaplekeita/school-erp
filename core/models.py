from django.db import models


class SchoolClass(models.Model):
    name = models.CharField(max_length=100, unique=True)
    level = models.CharField(max_length=50)

    def __str__(self) -> str:
        return self.name


class Student(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    level = models.CharField(max_length=50)

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name}"


class Enrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="enrollments")
    school_class = models.ForeignKey(
        SchoolClass, on_delete=models.CASCADE, related_name="enrollments"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["student", "school_class"], name="unique_student_class_enrollment"
            )
        ]
