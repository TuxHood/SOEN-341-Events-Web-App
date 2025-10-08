from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone

from .serializers import RegisterSerializer, LoginSerializer, UserSerializer

def set_jwt_cookie(response, access_token, secure=False, samesite="Lax"):
    # Set HttpOnly cookie with JWT access token
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
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        # Issue tokens
        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)

        resp = Response({"user": UserSerializer(user).data, "token_type": "Bearer"}, status=status.HTTP_200_OK)
        set_jwt_cookie(resp, access_token=access, secure=False, samesite="Lax")
        # Optional: also return bearer in body if your frontend prefers Authorization header usage
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
