import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Bell, Shield, Database, Mail, Layout, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  
  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully",
    });
  };
  
  const handleResetSettings = () => {
    toast({
      title: "Settings reset",
      description: "Your settings have been reset to default values",
    });
  };
  
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-neutral-500">Settings</h2>
        <p className="text-neutral-400">Manage your account and application preferences</p>
      </div>
      
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">
            <User className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Layout className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="clinic">
            <Database className="h-4 w-4 mr-2" />
            Clinic Data
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account details and personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <Avatar className="w-24 h-24">
                  <AvatarFallback>DR</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="font-medium">Profile Picture</div>
                  <div className="text-sm text-neutral-500">
                    Your profile picture will be used on your profile and throughout the application.
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Change Photo
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive">
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue="Dr. Roberts" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue="doctor">
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="dr.roberts@dentalcare.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue="(555) 123-4567" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">About</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Write a short bio..."
                  defaultValue="Experienced dentist specializing in general and cosmetic dentistry with over 15 years of practice."
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your password and account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-neutral-500" />
                <span className="text-sm text-neutral-500">
                  Password should be at least 8 characters with a mix of letters, numbers, and symbols.
                </span>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="font-medium">Two-Factor Authentication</div>
                <div className="text-sm text-neutral-500">
                  Add an extra layer of security to your account by enabling two-factor authentication.
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="two-factor" />
                  <Label htmlFor="two-factor">Enable two-factor authentication</Label>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSave}>Update Security Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Appointment Reminders</div>
                    <div className="text-sm text-neutral-500">Receive notifications for upcoming appointments</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="appointment-reminders" defaultChecked />
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">New Patient Notifications</div>
                    <div className="text-sm text-neutral-500">Get notified when a new patient registers</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="new-patient-notifications" defaultChecked />
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Payment Alerts</div>
                    <div className="text-sm text-neutral-500">Receive notifications for payment activities</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="payment-alerts" defaultChecked />
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">System Updates</div>
                    <div className="text-sm text-neutral-500">Get notified about system updates and maintenance</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="system-updates" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mt-6">
                <div className="font-medium">Notification Channels</div>
                <div className="text-sm text-neutral-500">
                  Select how you'd like to receive notifications
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="email-notifications" defaultChecked />
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="sms-notifications" />
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="browser-notifications" defaultChecked />
                    <Label htmlFor="browser-notifications">Browser Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="app-notifications" defaultChecked />
                    <Label htmlFor="app-notifications">In-App Notifications</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSave}>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how DentalCare looks for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="font-medium">Theme</div>
                <div className="text-sm text-neutral-500">
                  Choose your preferred color theme
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <Button variant="outline" className="justify-start px-3 border-2 border-primary">
                    <span className="h-4 w-4 rounded bg-primary mr-2"></span>
                    Light
                  </Button>
                  <Button variant="outline" className="justify-start px-3">
                    <span className="h-4 w-4 rounded bg-neutral-800 mr-2"></span>
                    Dark
                  </Button>
                  <Button variant="outline" className="justify-start px-3">
                    <span className="flex h-4 w-4 items-center justify-center rounded bg-gradient-to-r from-neutral-100 to-neutral-800 mr-2"></span>
                    System
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="font-medium">Font Size</div>
                <div className="text-sm text-neutral-500">
                  Adjust the application font size
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <Button variant="outline" className="justify-start px-3">
                    <span className="text-xs mr-2">A</span>
                    Small
                  </Button>
                  <Button variant="outline" className="justify-start px-3 border-2 border-primary">
                    <span className="text-sm mr-2">A</span>
                    Medium
                  </Button>
                  <Button variant="outline" className="justify-start px-3">
                    <span className="text-base mr-2">A</span>
                    Large
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="font-medium">Dashboard Layout</div>
                <div className="text-sm text-neutral-500">
                  Choose your preferred dashboard layout
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button variant="outline" className="justify-start px-3 border-2 border-primary">
                    <Layout className="h-4 w-4 mr-2" />
                    Standard
                  </Button>
                  <Button variant="outline" className="justify-start px-3">
                    <span className="i-lucide-layout-dashboard h-4 w-4 mr-2"></span>
                    Compact
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleResetSettings}>Reset to Default</Button>
                <Button onClick={handleSave}>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="clinic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clinic Information</CardTitle>
              <CardDescription>
                Manage your clinic details and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clinic-name">Clinic Name</Label>
                  <Input id="clinic-name" defaultValue="DentalCare Clinic" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clinic-phone">Clinic Phone</Label>
                  <Input id="clinic-phone" defaultValue="(555) 987-6543" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clinic-email">Clinic Email</Label>
                  <Input id="clinic-email" type="email" defaultValue="info@dentalcare.com" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clinic-website">Website</Label>
                  <Input id="clinic-website" defaultValue="www.dentalcare.com" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clinic-address">Address</Label>
                <Textarea 
                  id="clinic-address" 
                  defaultValue="123 Main Street, Suite 101, Anytown, ST 12345"
                  className="min-h-[80px]"
                />
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="font-medium">Working Hours</div>
                <div className="text-sm text-neutral-500">
                  Set your clinic's operating hours
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="monday-hours">Monday - Friday</Label>
                    <Input id="monday-hours" defaultValue="9:00 AM - 5:00 PM" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="saturday-hours">Saturday</Label>
                    <Input id="saturday-hours" defaultValue="9:00 AM - 2:00 PM" />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="font-medium">Data Export</div>
                <div className="text-sm text-neutral-500">
                  Export your clinic data in various formats
                </div>
                <div className="flex space-x-2 mt-2">
                  <Button variant="outline">
                    Export Patients (CSV)
                  </Button>
                  <Button variant="outline">
                    Export Appointments (CSV)
                  </Button>
                  <Button variant="outline">
                    Export Treatments (CSV)
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSave}>Save Clinic Settings</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-destructive">
            <CardHeader className="text-destructive">
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription className="text-destructive/80">
                These actions are irreversible
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Clear All Data</div>
                  <div className="text-sm text-neutral-500">
                    This will permanently delete all patients, appointments, and treatment records
                  </div>
                </div>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Data
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Reset Application</div>
                  <div className="text-sm text-neutral-500">
                    Reset the application to its initial state
                  </div>
                </div>
                <Button variant="destructive">
                  Reset Application
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
