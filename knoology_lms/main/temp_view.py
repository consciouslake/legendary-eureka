@csrf_exempt
def get_completed_chapters(request, student_id, course_id):
    try:
        from .models import Student, Course, StudentChapterProgress
        student = Student.objects.get(id=student_id)
        course = Course.objects.get(id=course_id)
        completed_chapters = StudentChapterProgress.objects.filter(student=student, course=course).values_list('chapter_id', flat=True)
        return JsonResponse({'status': 'success', 'completed_chapters': list(completed_chapters)})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
