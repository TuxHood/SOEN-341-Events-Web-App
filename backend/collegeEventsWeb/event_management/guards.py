from rest_framework.exceptions import PermissionDenied

def assert_event_owner_or_admin(request, event):
    role = getattr(request.user, "role", "").lower()  # ✅ Always use lowercase
    if role == "admin":
        return
    if role != "organizer" or event.organizer_id != request.user.id:
        raise PermissionDenied("Not allowed for this event.")