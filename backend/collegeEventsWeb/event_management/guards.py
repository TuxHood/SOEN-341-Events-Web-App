
from rest_framework.exceptions import PermissionDenied

def assert_event_owner_or_admin(request, event):
    role = getattr(request.user, "role", None)
    if isinstance(role, str):
        role = role.upper()
    if role == "admin":
        return
    if role != "organiser" or event.organizer_id != request.user.id:
        raise PermissionDenied("Not allowed for this event.")
