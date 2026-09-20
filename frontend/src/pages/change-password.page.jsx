import React, { useContext, useRef, useState } from 'react';
import AnimationWrapper from './../common/page-animation';
import InputBox from './../components/input.component';
import { UserContext } from './../App';
import { toast, Toaster } from 'react-hot-toast';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, KeyRound, CheckCircle2 } from 'lucide-react';

const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

export default function ChangePassword() {
  const { userAuth: { access_token } } = useContext(UserContext);
  const changePasswordForm = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData(changePasswordForm.current);
    const formData = {};
    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    const { currentPassword, newPassword } = formData;
    if (!currentPassword?.trim() || !newPassword?.trim()) {
      return toast.error("Please fill in both current and new password fields.");
    }
    if (!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)) {
      return toast.error("Password must be 6 to 20 characters long with at least 1 uppercase letter, 1 lowercase letter, and 1 number.");
    }
    if (currentPassword === newPassword) {
      return toast.error("New password must be different from current password.");
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading("Updating password...");
    try {
      await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + "/change-password",
        formData,
        {
          headers: {
            'Authorization': `Bearer ${access_token}`
          }
        }
      );
      toast.dismiss(loadingToast);
      changePasswordForm.current.reset();
      toast.success("Password changed successfully! 🔐");
    } catch ({ response }) {
      toast.dismiss(loadingToast);
      toast.error(response?.data?.error || "Failed to change password. Please verify current password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimationWrapper>
      <Toaster />
      <div className="w-full pb-16">
        <h1 className="text-2xl font-bold font-inter text-foreground max-md:hidden mb-6">
          Security Settings
        </h1>

        <Card className="border-border shadow-md rounded-2xl max-w-xl bg-card text-card-foreground">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple/10 flex items-center justify-center text-purple">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-foreground">Change Password</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Ensure your account is using a long, random password to stay secure.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form ref={changePasswordForm} onSubmit={handleSubmit} className="flex flex-col">
              <InputBox
                label="Current Password"
                name="currentPassword"
                type="password"
                placeholder="Enter current password"
                icon="key"
              />

              <InputBox
                label="New Password"
                name="newPassword"
                type="password"
                placeholder="Enter new strong password"
                icon="key"
              />

              <div className="rounded-xl bg-muted/40 p-4 border border-border space-y-2 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">Password Requirements:</p>
                <ul className="space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple" />
                    <span>6 to 20 characters in length</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple" />
                    <span>At least 1 uppercase & 1 lowercase letter</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple" />
                    <span>At least 1 numerical digit (0-9)</span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl px-8 font-semibold gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isSubmitting ? "Updating..." : "Update Password"}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AnimationWrapper>
  );
}
