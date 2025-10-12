from django import forms
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from .models import User

class UserCreationForm(forms.ModelForm):
    password1 = forms.CharField(label="Password", widget=forms.PasswordInput)
    password2 = forms.CharField(label="Password confirmation", widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ("email", "name", "role", "status")

    def clean_password2(self):
        p1 = self.cleaned_data.get("password1")
        p2 = self.cleaned_data.get("password2")
        if p1 and p2 and p1 != p2:
            raise forms.ValidationError("Passwords don't match")
        return p2

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        # status controls is_active; ensure consistency before save
        user.is_active = (user.status == user.Status.ACTIVE)
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    password = ReadOnlyPasswordHashField(
        help_text=(
            "Raw passwords are not stored, so there is no way to see this user's password, "
            "but you can change the password using <a href=\"../password/\">this form</a>."
        )
    )

    class Meta:
        model = User
        fields = ("email", "name", "password", "role", "status", "is_active", "is_staff", "is_superuser")

    def clean_password(self):
        # Return the initial value regardless of what the user provides.
        return self.initial.get("password")

