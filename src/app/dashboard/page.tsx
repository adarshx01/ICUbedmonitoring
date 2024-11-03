
import React from 'react'
import { Bell, ChevronDown, LayoutDashboard, Users, FileText, Settings, Video, Activity, Coffee, Moon, Sun, AlertTriangle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Link from 'next/link'
import Patient from '@/app/dashboard/patient'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'

export default async function CriticalLinkDashboard() {
  let doctorInfo = [];
  let patients = [];
  let nurses = [];

  const { getUser } = getKindeServerSession();
  const user = await getUser();
  
  // Fetch all data
  const doctorsSnapshot = await getDocs(collection(db, 'doctors'))
  const patientsSnapshot = await getDocs(collection(db, 'patients'))
  const nursesSnapshot = await getDocs(collection(db, 'nurses'))

  // Process doctor data
  doctorInfo = doctorsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    verified: doc.data().verified || false,
  }));

  // Find the current doctor's info based on user email
  const currentDoctor = doctorInfo.find(doc => doc.email === user?.email) || {
    name: 'Doctor Name Not Found',
    specialty: 'Specialty Not Found',
    rating: 0,
    patientsMonitored: 0,
    efficiency: 0,
    verified: false
  };

  // Process patients and nurses data
  patients = patientsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    verified: doc.data().verified || false,
  }));

  nurses = nursesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    verified: doc.data().verified || false,
  }));

  // Calculate ICU usage data
  const totalPatients = patients.length;
  const occupiedBeds = patients.filter(patient => patient.status === 'admitted').length;
  const icuUsageData = [
    { name: 'Occupied', value: (occupiedBeds / totalPatients) * 100 || 0 },
    { name: 'Available', value: ((totalPatients - occupiedBeds) / totalPatients) * 100 || 0 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const costSavingsData = [
    { name: 'Traditional ICU', cost: 10000 },
    { name: 'CriticalLink ICU', cost: 1000 },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm text-black">
          <div className="flex items-center justify-between px-6 py-4">
            <div className='justify-center items-center space-x-1'>
              <Link href={`/dashboard/${user?.id}`}><Button variant="" size="">Profile</Button></Link>
              <Link href={`/usermanagement`}><Button variant="" size="">Verify Users</Button></Link>
              <Link href={`/medbot`}><Button variant="" size="">Medbot</Button></Link>
              
              <Button variant="" size="">Nurses ({nurses.length})</Button>
              <Link href={`/realtime`}><Button variant="" size="">Realtime Monitor</Button></Link>
              <Button variant="" size="">..upcoming</Button>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Avatar>
                <AvatarImage src={currentDoctor.profileImage || "/placeholder.svg?height=32&width=32"} alt={currentDoctor.name} />
                <AvatarFallback>{currentDoctor.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex items-center">
                <span className="mr-2 text-sm font-medium">{currentDoctor.name}</span>
                <span className="text-gray-500">{user?.email}</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Doctor Profile</CardTitle>
              <CardDescription>{currentDoctor.specialty}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={currentDoctor.profileImage || "/placeholder.svg?height=64&width=64"} alt={currentDoctor.name} />
                  <AvatarFallback>{currentDoctor.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{currentDoctor.name}</h3>
                  <p className="text-sm text-gray-500">{currentDoctor.specialty}</p>
                  {currentDoctor.verified && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                      Verified
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Rating</CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="w-4 h-4 text-yellow-500"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{currentDoctor.rating || 'N/A'}</div>
                    <p className="text-xs text-gray-500">Out of 5</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Patients Monitored</CardTitle>
                    <Users className="w-4 h-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{patients.length}</div>
                    <p className="text-xs text-gray-500">Active patients</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
                    <Activity className="w-4 h-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{currentDoctor.efficiency || 0}%</div>
                    <Progress value={currentDoctor.efficiency || 0} className="w-full" />
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>ICU Bed Usage</CardTitle>
                <CardDescription>Total Beds: {totalPatients} | Occupied: {occupiedBeds}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[200px]">
                  {/* Charts component would go here */}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Cost Savings Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[200px]">
                  {/* Charts component would go here */}
                </div>
              </CardContent>
            </Card>
          </div>

          <Patient patients={patients} />

          <Card>
            <CardHeader>
              <CardTitle>Live Patient Monitoring</CardTitle>
              <CardDescription>Real-time video feed of selected patient</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
              <iframe src="http://localhost:5000" width="640" height="480" frameborder="0"></iframe></div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}