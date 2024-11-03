import { Suspense } from "react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { doc, getDoc } from 'firebase/firestore';
import { db } from "@/app/lib/firebase";
import ProfileClient from "./profile-client";

async function getProfile() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  
  if (!user?.id) {
    throw new Error('User not authenticated');
  }

  const docRef = doc(db, 'doctors', user.id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return {
      userId: user.id,
      ...docSnap.data()
    };
  }

  // Return default profile if none exists
  return {
    userId: user.id,
    name: user.given_name ? `Dr. ${user.given_name} ${user.family_name}` : "Dr.",
    specialty: "",
    email: user.email || "",
    phone: "",
    address: "",
    bio: "",
    education: "",
    certifications: "",
  };
}

export default async function ProfilePage() {
  const profile = await getProfile();
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Suspense fallback={<div>Loading...</div>}>
        <ProfileClient initialProfile={profile} />
      </Suspense>
    </div>
  );
}