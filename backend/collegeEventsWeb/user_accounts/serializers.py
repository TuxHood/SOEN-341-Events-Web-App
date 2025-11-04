from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("name", "email", "password", "role")  # role optional—we’ll enforce rules
        extra_kwargs = {"role": {"required": False}}

    def create(self, validated_data):
        role = validated_data.get("role", User.Role.STUDENT)
        password = validated_data.pop("password")

        # Enforce your rules:
        if role == User.Role.ORGANIZER:
            status = User.Status.PENDING
        else:
            role = User.Role.STUDENT
            status = User.Status.ACTIVE

        user = User.objects.create_user(
            email=validated_data["email"],
            name=validated_data["name"],
            password=password,
            role=role,
            status=status,
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        user = authenticate(request=self.context.get("request"), email=email, password=password)
        if not user:
            # Manual authenticate for custom USERNAME_FIELD=email if needed
            try:
                u = User.objects.get(email=email)
                if not u.check_password(password):
                    raise serializers.ValidationError("Invalid email or password.")
                user = u
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid email or password.")

        if user.status != User.Status.ACTIVE:
            # Treat non-active as blocked login
            raise serializers.ValidationError("Account is not active.")
        attrs["user"] = user
        return attrs


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "name", "email", "role", "status", "created_at", "updated_at")
