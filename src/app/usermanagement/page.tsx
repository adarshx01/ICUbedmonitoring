'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/app/lib/firebase' // Ensure this path is correct for your project
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from 'lucide-react'

type User = {
  id: string
  name: string
  email: string
  verified: boolean
  [key: string]: any // Allow for additional properties
}

type Doctor = User & {
  address: string
  bio: string
  certifications: string
  education: string
  efficiency: string
  patientsMonitored: string
  phone: string
  rating: string
  specialty: string
}

type Patient = User & {
  patientid: string
  ward: string
  medical_reason: string
  age: string
  gender: string
  condition: string
  admission: string
  medications: string
  allergies: string
  lab_reports: string
}

type Nurse = User & {
  phone: string
  shift: string
  specialization: string
  experience: string
}

type EntityType = 'doctor' | 'patient' | 'nurse'

export default function HealthcareDashboard() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [nurses, setNurses] = useState<Nurse[]>([])
  const [selectedEntity, setSelectedEntity] = useState<Doctor | Patient | Nurse | null>(null)
  const [editingType, setEditingType] = useState<EntityType | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const doctorsSnapshot = await getDocs(collection(db, 'doctors'))
      const patientsSnapshot = await getDocs(collection(db, 'patients'))
      const nursesSnapshot = await getDocs(collection(db, 'nurses'))

      setDoctors(doctorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), verified: doc.data().verified || false } as Doctor)))
      setPatients(patientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), verified: doc.data().verified || false } as Patient)))
      setNurses(nursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), verified: doc.data().verified || false } as Nurse)))
    }

    fetchData()
  }, [])

  const handleEntityClick = async (id: string, type: EntityType) => {
    const docRef = doc(db, `${type}s`, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      setSelectedEntity({ id: docSnap.id, ...docSnap.data(), verified: docSnap.data().verified || false } as Doctor | Patient | Nurse)
      setEditingType(type)
      setIsEditing(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!selectedEntity || !editingType) return

    const docRef = doc(db, `${editingType}s`, selectedEntity.id)
    await updateDoc(docRef, selectedEntity)

    // Update local state
    const updateState = (state: any[], setState: React.Dispatch<React.SetStateAction<any[]>>) => {
      setState(state.map(item => item.id === selectedEntity.id ? selectedEntity : item))
    }

    if (editingType === 'doctor') updateState(doctors, setDoctors)
    else if (editingType === 'patient') updateState(patients, setPatients)
    else if (editingType === 'nurse') updateState(nurses, setNurses)

    setIsEditing(false)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    if (selectedEntity) {
      setSelectedEntity({ ...selectedEntity, [field]: value })
    }
  }

  const handleVerify = async () => {
    if (!selectedEntity || !editingType) return

    const newVerificationStatus = !selectedEntity.verified
    const docRef = doc(db, `${editingType}s`, selectedEntity.id)
    await updateDoc(docRef, { verified: newVerificationStatus })

    setSelectedEntity({ ...selectedEntity, verified: newVerificationStatus })

    // Update local state
    const updateState = (state: any[], setState: React.Dispatch<React.SetStateAction<any[]>>) => {
      setState(state.map(item => item.id === selectedEntity.id ? { ...item, verified: newVerificationStatus } : item))
    }

    if (editingType === 'doctor') updateState(doctors, setDoctors)
    else if (editingType === 'patient') updateState(patients, setPatients)
    else if (editingType === 'nurse') updateState(nurses, setNurses)
  }

  const renderEntityList = (entities: (Doctor | Patient | Nurse)[], type: EntityType) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {entities.map(entity => (
        <Card key={entity.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleEntityClick(entity.id, type)}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {entity.name || 'N/A'}
              {entity.verified ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="w-4 h-4 mr-1" />
                  Unverified
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{(entity as Doctor).specialty || (entity as Patient).patientid || (entity as Nurse).specialization || 'N/A'}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  )

  const renderEntityDetails = () => {
    if (!selectedEntity) return null

    const fields = Object.keys(selectedEntity).filter(key => !['id', 'verified'].includes(key))

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {selectedEntity.name || 'N/A'}
            {selectedEntity.verified ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="w-4 h-4 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="secondary">
                <XCircle className="w-4 h-4 mr-1" />
                Unverified
              </Badge>
            )}
          </CardTitle>
          <CardDescription>{editingType?.charAt(0).toUpperCase() + editingType?.slice(1) || 'N/A'}</CardDescription>
        </CardHeader>
        <CardContent>
          {fields.map(field => (
            <div key={field} className="mb-4">
              <Label htmlFor={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</Label>
              {field === 'bio' || field === 'medical_reason' ? (
                <Textarea
                  id={field}
                  value={selectedEntity[field] || ''}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                />
              ) : (
                <Input
                  id={field}
                  value={selectedEntity[field] || ''}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                />
              )}
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex justify-between">
          {isEditing ? (
            <Button onClick={handleSave}>Save</Button>
          ) : (
            <Button onClick={handleEdit}>Edit</Button>
          )}
          <Button onClick={handleVerify} variant={selectedEntity.verified ? "destructive" : "default"}>
            {selectedEntity.verified ? "Unverify" : "Verify"}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Healthcare Dashboard</h1>
      <Tabs defaultValue="doctors">
        <TabsList>
          <TabsTrigger value="doctors">Doctors</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="nurses">Nurses</TabsTrigger>
        </TabsList>
        <TabsContent value="doctors">
          {renderEntityList(doctors, 'doctor')}
        </TabsContent>
        <TabsContent value="patients">
          {renderEntityList(patients, 'patient')}
        </TabsContent>
        <TabsContent value="nurses">
          {renderEntityList(nurses, 'nurse')}
        </TabsContent>
      </Tabs>
      {renderEntityDetails()}
    </div>
  )
}