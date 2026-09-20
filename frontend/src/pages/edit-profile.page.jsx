import React, { useContext, useEffect, useRef, useState } from 'react';
import { UserContext } from './../App';
import axios from 'axios';
import { profileDataStructure } from './profile.page';
import AnimationWrapper from '../common/page-animation';
import toast, { Toaster } from 'react-hot-toast';
import InputBox from '../components/input.component';
import { uploadImage } from '../utils/imageUploadUtils';
import { storeInSession } from '../common/session';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Camera, Upload, Save, Globe, AtSign, User, Mail } from 'lucide-react';

export default function EditProfile() {
    const [profile, setProfile] = useState(profileDataStructure);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImg, setIsUploadingImg] = useState(false);
    const profileImgEle = useRef();
    const editProfileForm = useRef();
    const [updatedProfileImg, setUpdatedProfileImg] = useState(null);
    const bioLimit = 150;
    const [charactersLeft, setCharactersLeft] = useState(bioLimit);
    const { personal_info: { fullname, username: profile_username, profile_img, email, bio }, social_links = {} } = profile;
    const { userAuth, setUserAuth, userAuth: { access_token } } = useContext(UserContext);

    useEffect(() => {
        if (access_token) {
            axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/get-profile', { username: userAuth.username })
                .then(({ data }) => {
                    if (data?.user) {
                        setProfile(data.user);
                        if (data.user.personal_info?.bio) {
                            setCharactersLeft(bioLimit - data.user.personal_info.bio.length);
                        }
                    }
                    setLoading(false);
                }).catch((error) => {
                    console.error("Error fetching profile:", error);
                    setLoading(false);
                });
        }
    }, [access_token]);

    const handleImageUpload = async (e) => {
        e.preventDefault();
        if (!updatedProfileImg) {
            return toast.error("Please select a new profile image first.");
        }

        setIsUploadingImg(true);
        const loadingToast = toast.loading("Compressing and uploading image...");
        try {
            const response = await uploadImage(updatedProfileImg);
            if (response.success) {
                const { data } = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/update-profile-image', { url: response.file.url }, {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                });

                const newUserAuth = {
                    ...userAuth,
                    profile_img: data.profile_img
                };

                storeInSession("user", JSON.stringify(newUserAuth));
                setUserAuth(newUserAuth);
                setUpdatedProfileImg(null);
                toast.dismiss(loadingToast);
                toast.success("Profile photo updated successfully! 👍");
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error(error.message || "Failed to upload profile photo.");
            console.error(error);
        } finally {
            setIsUploadingImg(false);
        }
    };

    const handleCharacterChange = (e) => {
        setCharactersLeft(bioLimit - e.target.value.length);
    };

    const handleImagePreview = (e) => {
        const img = e.target.files[0];
        if (!img) return;
        if (profileImgEle.current) {
            profileImgEle.current.src = URL.createObjectURL(img);
        }
        setUpdatedProfileImg(img);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData(editProfileForm.current);
        const formData = {};
        for (let [key, value] of form.entries()) {
            formData[key] = value;
        }
        const { username, bio, youtube, facebook, twitter, github, instagram, website } = formData;

        if (!username || username.length < 3) {
            return toast.error("Username must be at least 3 characters long.");
        }
        if (bio && bio.length > bioLimit) {
            return toast.error(`Bio cannot exceed ${bioLimit} characters.`);
        }

        setIsSaving(true);
        const loadingToast = toast.loading("Updating profile...");
        try {
            const { data } = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + "/update-profile",
                { username, bio, social_links: { youtube, facebook, twitter, github, instagram, website } },
                {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                }
            );

            if (userAuth.username !== data.username) {
                const newUserAuth = { ...userAuth, username: data.username };
                storeInSession("user", JSON.stringify(newUserAuth));
                setUserAuth(newUserAuth);
            }

            toast.dismiss(loadingToast);
            toast.success("Profile saved successfully! 👍");
        } catch ({ response }) {
            toast.dismiss(loadingToast);
            toast.error(response?.data?.error || "Failed to update profile.");
            console.error(response?.data?.error);
        } finally {
            setIsSaving(false);
        }
    };

    const initials = (fullname || profile_username || 'U').slice(0, 2).toUpperCase();

    return (
        <AnimationWrapper>
            <Toaster />
            <div className="w-full pb-16">
                <h1 className="text-2xl font-bold font-inter text-foreground max-md:hidden mb-6">
                    Account Settings
                </h1>

                {loading ? (
                    <div className="space-y-6">
                        <div className="flex gap-6 items-center">
                            <Skeleton className="w-24 h-24 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-72" />
                            </div>
                        </div>
                        <Skeleton className="h-48 w-full rounded-2xl" />
                    </div>
                ) : (
                    <Card className="border-border shadow-md rounded-2xl bg-card text-card-foreground">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-foreground">Public Profile</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                This information will be displayed publicly on your stories and author profile.
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form ref={editProfileForm} onSubmit={handleSubmit} className="space-y-8">
                                {/* Profile Photo Section */}
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-border">
                                    <div className="relative group">
                                        <label
                                            htmlFor="uploadImg"
                                            className="relative block w-28 h-28 rounded-full overflow-hidden cursor-pointer ring-4 ring-border group-hover:ring-purple/50 transition-all duration-200"
                                        >
                                            <img
                                                ref={profileImgEle}
                                                src={profile_img}
                                                alt="Profile avatar"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 text-xs font-medium gap-1">
                                                <Camera className="w-5 h-5" />
                                                <span>Change</span>
                                            </div>
                                        </label>
                                        <input
                                            type="file"
                                            id="uploadImg"
                                            accept="image/png, image/jpeg, image/jpg, image/webp"
                                            hidden
                                            onChange={handleImagePreview}
                                        />
                                    </div>

                                    <div className="flex flex-col justify-center text-center sm:text-left space-y-2">
                                        <h3 className="font-semibold text-sm text-foreground">Profile Avatar</h3>
                                        <p className="text-xs text-muted-foreground max-w-sm">
                                            Clear face or logo recommended. Max 5MB, automatically compressed with Sharp into high-efficiency WebP.
                                        </p>
                                        {updatedProfileImg && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                disabled={isUploadingImg}
                                                onClick={handleImageUpload}
                                                className="rounded-xl mt-1 w-fit max-sm:mx-auto gap-2 text-xs"
                                            >
                                                <Upload className="w-3.5 h-3.5" />
                                                <span>{isUploadingImg ? "Uploading..." : "Confirm Photo Upload"}</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* User Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
                                    <InputBox
                                        label="Full Name"
                                        name="fullname"
                                        type="text"
                                        value={fullname}
                                        placeholder="Full Name"
                                        disable={true}
                                        icon="user"
                                        helperText="Full name cannot be changed"
                                    />

                                    <InputBox
                                        label="Email Address"
                                        name="email"
                                        type="email"
                                        value={email}
                                        placeholder="Email Address"
                                        disable={true}
                                        icon="envelope"
                                        helperText="Verified account email"
                                    />
                                </div>

                                <InputBox
                                    label="Username"
                                    name="username"
                                    type="text"
                                    placeholder="Username"
                                    value={profile_username}
                                    icon="at"
                                    helperText={`Your unique profile URL: ${window.location.origin}/user/${profile_username}`}
                                />

                                {/* Bio Field */}
                                <div className="mb-5">
                                    <div className="flex justify-between items-center mb-1.5 ml-1">
                                        <label className="text-xs font-semibold text-muted-foreground">Bio</label>
                                        <span className="text-[11px] text-muted-foreground">
                                            {charactersLeft} characters left
                                        </span>
                                    </div>
                                    <textarea
                                        name="bio"
                                        maxLength={bioLimit}
                                        defaultValue={bio}
                                        onChange={handleCharacterChange}
                                        placeholder="Tell readers a little bit about yourself, your background, and what you write about..."
                                        className="input-box h-32 resize-none leading-relaxed py-3 px-4"
                                    />
                                    <p className="text-[11px] text-muted-foreground mt-1.5 ml-1">
                                        A brief description displayed on your profile and story headers.
                                    </p>
                                </div>

                                {/* Social Links */}
                                <div className="pt-2">
                                    <h3 className="text-sm font-semibold text-foreground mb-4">
                                        Social & Web Profiles
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                                        {['twitter', 'github', 'youtube', 'facebook', 'instagram', 'website'].map((key) => (
                                            <InputBox
                                                key={key}
                                                label={key.charAt(0).toUpperCase() + key.slice(1)}
                                                name={key}
                                                type="text"
                                                value={social_links[key] || ""}
                                                placeholder={key === "website" ? "https://yourwebsite.com" : `https://${key}.com/...`}
                                                icon={key === "website" ? "globe" : "link"}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-border">
                                    <Button
                                        type="submit"
                                        disabled={isSaving}
                                        className="rounded-xl px-8 font-semibold gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AnimationWrapper>
    );
}
