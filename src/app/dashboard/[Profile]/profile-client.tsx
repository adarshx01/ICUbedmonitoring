"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, Mail, MapPin, Phone } from "lucide-react";
import { doc, setDoc } from 'firebase/firestore';
import { db } from "@/app/lib/firebase";
import { useRouter } from "next/navigation";

interface ProfileClientProps {
  initialProfile: {
    userId: string;
    name: string;
    specialty: string;
    email: string;
    phone: string;
    address: string;
    bio: string;
    education: string;
    certifications: string;
  };
}

export function ProfileClient({ initialProfile }: ProfileClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [doctor, setDoctor] = useState(initialProfile);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDoctor((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const { userId, ...profileData } = doctor;
      const docRef = doc(db, 'doctors', userId);
      await setDoc(docRef, profileData, { merge: true });
      setIsEditing(false);
      router.refresh();
      console.log("Profile saved successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src="/placeholder.svg?height=96&width=96" alt={doctor.name} />
            <AvatarFallback>{doctor.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl font-bold">{doctor.name}</CardTitle>
            <p className="text-muted-foreground">{doctor.specialty}</p>
          </div>
        </div>
        <Button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={doctor.name}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Input
                id="specialty"
                name="specialty"
                value={doctor.specialty}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Biography</Label>
              <Textarea
                id="bio"
                name="bio"
                value={doctor.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={4}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex">
                <Mail className="w-5 h-5 mr-2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={doctor.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="flex">
                <Phone className="w-5 h-5 mr-2 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={doctor.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="flex">
                <MapPin className="w-5 h-5 mr-2 text-muted-foreground" />
                <Input
                  id="address"
                  name="address"
                  value={doctor.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">Professional Information</h3>
          <div className="space-y-2">
            <Label htmlFor="education">Education</Label>
            <Input
              id="education"
              name="education"
              value={doctor.education}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="certifications">Certifications</Label>
            <Input
              id="certifications"
              name="certifications"
              value={doctor.certifications}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ProfileClient;