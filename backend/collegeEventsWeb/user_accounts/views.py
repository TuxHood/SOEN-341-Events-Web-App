from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django.core.mail import send_mail

from rest_framework import status, permissions, viewsets, serializers as drf_serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
)

UserModel = get_user_model()


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
    # Allow anyone to call logout so we can clear the httponly access_token
    # cookie even when the token has expired. This avoids leaving clients in
    # a stale-auth state where the cookie continues to be sent by the browser.
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        resp = Response({"detail": "Logged out."}, status=status.HTTP_200_OK)
        resp.delete_cookie("access_token", path="/")
        return resp


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


# -------------------------
# Password Reset (Email-based)
# -------------------------
class PasswordResetRequestView(APIView):
    """
    POST { "email": "user@example.com" }

    Always returns 200 with a generic message
    (so you don’t leak whether the email exists).
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        if not email:
            return Response(
                {"detail": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = UserModel.objects.get(email=email)
        except UserModel.DoesNotExist:
            # Don't reveal that the email doesn't exist
            return Response(
                {"detail": "If that email exists, a reset link has been sent."},
                status=status.HTTP_200_OK
            )

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        frontend_base = getattr(settings, "FRONTEND_BASE_URL", "http://localhost:5173")
        reset_url = f"{frontend_base}/auth/reset-password/{uid}/{token}"

        send_mail(
            subject="Reset your Campus Events password",
            message=f"Click the link below to reset your password:\n\n{reset_url}",
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", None),
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response(
            {"detail": "If that email exists, a reset link has been sent."},
            status=status.HTTP_200_OK
        )


class PasswordResetConfirmView(APIView):
    """
    POST /api/users/password-reset/<uidb64>/<token>/
    Body: { "password": "newPassword123" }
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, uidb64, token, *args, **kwargs):
        new_password = request.data.get("password")
        if not new_password:
            return Response(
                {"detail": "Password is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = UserModel.objects.get(pk=uid)
        except (ValueError, TypeError, OverflowError, UserModel.DoesNotExist):
            return Response(
                {"detail": "Invalid reset link."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {"detail": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()

        return Response(
            {"detail": "Password has been reset successfully."},
            status=status.HTTP_200_OK
        )


# -------------------------
# ADMIN: Organizer Approval
# -------------------------
class UserViewSet(viewsets.ModelViewSet):
    """
    Admin-only user management + organizer approval flows.
    """
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
            user.reject_organizer(request.user)
            return Response(
                {"message": f"Organizer {user.name} rejected."},
                status=status.HTTP_200_OK
            )
        return Response(
            {"error": "User is not a pending organizer."},
            status=status.HTTP_400_BAD_REQUEST
        )
