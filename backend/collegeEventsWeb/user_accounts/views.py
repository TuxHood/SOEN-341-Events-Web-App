from rest_framework import status, permissions, viewsets, serializers as drf_serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from .models import User
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer


class DebugAuthView(APIView):
    """Dev-only: return auth debug info so frontend can diagnose token/cookie issues."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        info = {
            'http_authorization': request.META.get('HTTP_AUTHORIZATION'),
            'cookies': {k: request.COOKIES.get(k) for k in ['access_token', 'csrftoken']},
            'user_is_authenticated': getattr(request.user, 'is_authenticated', False),
            'user_id': getattr(getattr(request, 'user', None), 'id', None),
        }
        # Try to authenticate via simplejwt directly
        try:
            jwt = JWTAuthentication()
            auth = jwt.authenticate(request)
            info['jwt_authenticate'] = bool(auth)
            if auth:
                user, token = auth
                info['jwt_user_id'] = user.id
        except Exception as e:
            info['jwt_error'] = str(e)

        return Response(info)


@method_decorator(ensure_csrf_cookie, name='dispatch')
class GetCSRFTokenView(APIView):
    """Dev helper: ensure the CSRF cookie is set for the frontend.

    Call this with GET (with credentials) before making POSTs from the SPA so
    the browser receives a `csrftoken` cookie and can include it in the
    X-CSRFToken header. This is safer than exempting views from CSRF.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"detail": "CSRF cookie set"})


# -------------------------
# JWT Helper
# -------------------------
def set_jwt_cookie(response, access_token, secure=False, samesite="Lax"):
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=secure,
        samesite=samesite,
        path="/",
        max_age=6 * 60 * 60,  # 6 hours
    )
    return response


# -------------------------
# Authentication Views
# -------------------------
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        data = UserSerializer(user).data
        return Response(data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        try:
            serializer.is_valid(raise_exception=True)
        except drf_serializers.ValidationError as exc:
            # Normalize error shape to {'detail': '...'} so frontend shows a clean message
            def extract_message(d):
                if isinstance(d, dict):
                    # prefer explicit 'detail' key, otherwise take the first value
                    v = d.get('detail') if 'detail' in d else next(iter(d.values()), None)
                    return extract_message(v)
                if isinstance(d, (list, tuple)):
                    return extract_message(d[0]) if d else None
                return str(d)

            message = extract_message(exc.detail)
            return Response({'detail': message or 'Invalid request.'}, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)

        resp = Response(
            {"user": UserSerializer(user).data, "token_type": "Bearer"},
            status=status.HTTP_200_OK
        )
        set_jwt_cookie(resp, access_token=access)
        resp.data["access"] = access
        resp.data["refresh"] = str(refresh)
        return resp


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        resp = Response({"detail": "Logged out."}, status=status.HTTP_200_OK)
        resp.delete_cookie("access_token", path="/")
        return resp


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


# -------------------------
# ADMIN: Organizer Approval
# -------------------------
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=True, methods=['post'])
    def approve_organizer(self, request, pk=None):
        user = self.get_object()
        if user.role == User.Role.ORGANIZER and user.status == User.Status.PENDING:
            user.approve_organizer(request.user)
            return Response(
                {"message": f"Organizer {user.name} approved."},
                status=status.HTTP_200_OK
            )
        return Response(
            {"error": "User is not a pending organizer."},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def reject_organizer(self, request, pk=None):
        user = self.get_object()
        if user.role == User.Role.ORGANIZER and user.status == User.Status.PENDING:
            user.status = User.Status.SUSPENDED
            user.save()
            return Response(
                {"message": f"Organizer {user.name} rejected."},
                status=status.HTTP_200_OK
            )
        return Response(
            {"error": "User is not a pending organizer."},
            status=status.HTTP_400_BAD_REQUEST
        )

