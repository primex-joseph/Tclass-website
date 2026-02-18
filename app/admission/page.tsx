"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitAdmissionForm } from "@/lib/admission-submit";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const learnerClassifications = [
  "4Ps Beneficiary",
  "Agrarian Reform Beneficiary",
  "Balik Probinsya",
  "Displaced Workers",
  "Drug Dependents Surrenderees/Surrenderers",
  "Family Members of AFP and PNP Killed-in-Action",
  "Family Members of AFP and PNP Wounded-in-Action",
  "Farmers and Fishermen",
  "Indigenous People and Cultural Communities",
  "Industry Workers",
  "Inmates and Detainees",
  "MILF Beneficiary",
  "Out-of-School-Youth",
  "Overseas Filipino Workers (OFW) Dependents",
  "RCEF-RESP",
  "Rebel Returnees/Decommissioned Combatants",
  "Returning/Repatriated Overseas Filipino Workers (OFW)",
  "Student",
  "TESDA Alumni",
  "TVET Trainers",
  "Uniformed Personnel",
  "Victim of Natural Disasters and Calamities",
  "Wounded-in-Action AFP and PNP Personnel",
];

const disabilityTypes = [
  "Mental/Intellectual",
  "Visual Disability",
  "Orthopedic (Musculoskeletal) Disability",
  "Hearing Disability",
  "Speech Impairment",
  "Multiple Disabilities (specify)",
  "Psychosocial Disability",
  "Disability Due to Chronic Illness",
  "Learning Disability",
];

const disabilityCauses = ["Congenital/Inborn", "Illness", "Injury"];

const civilStatuses = ["Single", "Married", "Widow/er", "Separated", "Solo Parent"];
const employmentStatuses = ["Employed", "Unemployed"];
const educationalAttainments = [
  "No Grade Completed",
  "Pre-School (Nursery/Kinder/Prep)",
  "High School Undergraduate",
  "High School Graduate",
  "Elementary Undergraduate",
  "Post Secondary Undergraduate",
  "College Undergraduate",
  "College Graduate or Higher",
  "Elementary Graduate",
  "Post Secondary Graduate",
  "Junior High Graduate",
  "Senior High Graduate",
];

type FormState = {
  uliNumber: string;
  entryDate: string;
  lastName: string;
  firstName: string;
  middleName: string;
  extensionName: string;
  numberStreet: string;
  barangay: string;
  district: string;
  cityMunicipality: string;
  province: string;
  region: string;
  emailAddress: string;
  facebookAccount: string;
  contactNo: string;
  nationality: string;
  sex: string;
  civilStatus: string[];
  employmentStatus: string;
  monthOfBirth: string;
  dayOfBirth: string;
  yearOfBirth: string;
  age: string;
  birthplaceCity: string;
  birthplaceProvince: string;
  birthplaceRegion: string;
  educationalAttainment: string[];
  parentGuardianName: string;
  parentGuardianAddress: string;
  parentGuardianBirthdate: string;
  parentGuardianRelationship: string;
  learnerClassifications: string[];
  learnerClassificationOthers: string;
  disabilityTypes: string[];
  disabilityTypeOthers: string;
  disabilityCauses: string[];
  courseQualificationName: string;
  scholarshipType: string;
  privacyConsent: "agree" | "disagree" | "";
  applicantSignature: string;
  dateAccomplished: string;
  idPictureNote: string;
  rightThumbmarkNote: string;
};

const defaultForm: FormState = {
  uliNumber: "",
  entryDate: "",
  lastName: "",
  firstName: "",
  middleName: "",
  extensionName: "",
  numberStreet: "",
  barangay: "",
  district: "",
  cityMunicipality: "",
  province: "",
  region: "",
  emailAddress: "",
  facebookAccount: "",
  contactNo: "",
  nationality: "",
  sex: "",
  civilStatus: [],
  employmentStatus: "",
  monthOfBirth: "",
  dayOfBirth: "",
  yearOfBirth: "",
  age: "",
  birthplaceCity: "",
  birthplaceProvince: "",
  birthplaceRegion: "",
  educationalAttainment: [],
  parentGuardianName: "",
  parentGuardianAddress: "",
  parentGuardianBirthdate: "",
  parentGuardianRelationship: "",
  learnerClassifications: [],
  learnerClassificationOthers: "",
  disabilityTypes: [],
  disabilityTypeOthers: "",
  disabilityCauses: [],
  courseQualificationName: "",
  scholarshipType: "",
  privacyConsent: "",
  applicantSignature: "",
  dateAccomplished: "",
  idPictureNote: "",
  rightThumbmarkNote: "",
};

const ADMISSION_DRAFT_KEY = "tclass_admission_form_draft_v1";

export default function AdmissionPage() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idPictureFile, setIdPictureFile] = useState<File | null>(null);
  const [oneByOnePictureFile, setOneByOnePictureFile] = useState<File | null>(null);
  const [rightThumbmarkFile, setRightThumbmarkFile] = useState<File | null>(null);
  const [submittedModalOpen, setSubmittedModalOpen] = useState(false);
  const [isDraftReady, setIsDraftReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = window.localStorage.getItem(ADMISSION_DRAFT_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as Partial<FormState>;
      setForm((prev) => ({ ...prev, ...parsed }));
      toast.success("Draft restored. You can continue where you left off.");
    } catch {
      // Ignore invalid draft payload.
    } finally {
      setIsDraftReady(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isDraftReady) return;
    try {
      window.localStorage.setItem(ADMISSION_DRAFT_KEY, JSON.stringify(form));
    } catch {
      // Ignore storage failures.
    }
  }, [form, isDraftReady]);

  const toggleArrayValue = (
    key: "civilStatus" | "educationalAttainment" | "learnerClassifications" | "disabilityTypes" | "disabilityCauses",
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.emailAddress.trim()) {
      toast.error("Email address is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fullName = [form.firstName, form.middleName, form.lastName, form.extensionName]
        .filter((value) => value.trim().length > 0)
        .join(" ");

      const response = await submitAdmissionForm({
        fullName,
        age: Number(form.age),
        gender: form.sex,
        primaryCourse: form.courseQualificationName,
        secondaryCourse: form.scholarshipType || null,
        email: form.emailAddress,
        facebookAccount: form.facebookAccount || null,
        contactNo: form.contactNo || null,
        formData: form,
        idPictureFile,
        oneByOnePictureFile,
        rightThumbmarkFile,
      });

      toast.success((response as { message?: string }).message ?? "Admission submitted successfully.");
      setForm(defaultForm);
      setIdPictureFile(null);
      setOneByOnePictureFile(null);
      setRightThumbmarkFile(null);
      setSubmittedModalOpen(true);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(ADMISSION_DRAFT_KEY);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit admission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-slate-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="glass-panel rounded-2xl p-5 md:p-6 flex items-start justify-between gap-4">
          <div>
            <Badge className="mb-2 bg-blue-100 text-blue-700 border border-blue-200">Registration Form</Badge>
            <h1 className="text-3xl font-semibold text-blue-950">Learner&apos;s Profile Form</h1>
            <p className="text-slate-600 mt-1">TESDA-style admission enrollment profile (frontend draft).</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-blue-200 text-blue-800 hover:bg-blue-50">Back to Home</Button>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="elev-card border-blue-100/80 bg-white/90">
            <CardHeader>
              <CardTitle className="text-blue-900">Learner ID Picture</CardTitle>
              <CardDescription>Attach learner ID picture (for profile and verification).</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ID Picture</Label>
                <Input type="file" accept="image/*" onChange={(e) => setIdPictureFile(e.target.files?.[0] ?? null)} />
                <p className="text-xs text-slate-500">
                  {idPictureFile ? `Selected: ${idPictureFile.name}` : "No file selected."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="elev-card border-blue-100/80 bg-white/90">
            <CardHeader>
              <CardTitle className="text-blue-900">1. T2MIS Auto Generated</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Unique Learner Identifier (ULI) Number</Label>
                <Input value={form.uliNumber} onChange={(e) => setForm((prev) => ({ ...prev, uliNumber: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Entry Date</Label>
                <Input type="date" value={form.entryDate} onChange={(e) => setForm((prev) => ({ ...prev, entryDate: e.target.value }))} />
              </div>
            </CardContent>
          </Card>

          <Card className="elev-card border-blue-100/80 bg-white/90">
            <CardHeader>
              <CardTitle className="text-blue-900">2. Learner/Manpower Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Last Name</Label>
                  <Input value={form.lastName} onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input value={form.firstName} onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Middle Name</Label>
                  <Input value={form.middleName} onChange={(e) => setForm((prev) => ({ ...prev, middleName: e.target.value }))} />
                </div>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Extension Name (Jr., Sr.)</Label>
                  <Input value={form.extensionName} onChange={(e) => setForm((prev) => ({ ...prev, extensionName: e.target.value }))} />
                </div>
              </div>
              <CardDescription className="text-slate-700 font-medium pt-2">Complete Permanent Mailing Address</CardDescription>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Number, Street</Label>
                  <Input value={form.numberStreet} onChange={(e) => setForm((prev) => ({ ...prev, numberStreet: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Barangay</Label>
                  <Input value={form.barangay} onChange={(e) => setForm((prev) => ({ ...prev, barangay: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>District</Label>
                  <Input value={form.district} onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))} />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>City/Municipality</Label>
                  <Input value={form.cityMunicipality} onChange={(e) => setForm((prev) => ({ ...prev, cityMunicipality: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Province</Label>
                  <Input value={form.province} onChange={(e) => setForm((prev) => ({ ...prev, province: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Region</Label>
                  <Input value={form.region} onChange={(e) => setForm((prev) => ({ ...prev, region: e.target.value }))} />
                </div>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    placeholder="Primary email for login credentials"
                    value={form.emailAddress}
                    onChange={(e) => setForm((prev) => ({ ...prev, emailAddress: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Facebook Account</Label>
                  <Input
                    placeholder="Optional Facebook profile/link"
                    value={form.facebookAccount}
                    onChange={(e) => setForm((prev) => ({ ...prev, facebookAccount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact No.</Label>
                  <Input value={form.contactNo} onChange={(e) => setForm((prev) => ({ ...prev, contactNo: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Nationality</Label>
                  <Input value={form.nationality} onChange={(e) => setForm((prev) => ({ ...prev, nationality: e.target.value }))} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="elev-card border-blue-100/80 bg-white/90">
            <CardHeader>
              <CardTitle className="text-blue-900">3. Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Sex</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Male", "Female"].map((item) => (
                      <label key={item} className="flex items-center gap-2 text-sm">
                        <input type="radio" name="sex" checked={form.sex === item} onChange={() => setForm((prev) => ({ ...prev, sex: item }))} />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Civil Status</Label>
                  <div className="space-y-1">
                    {civilStatuses.map((item) => (
                      <label key={item} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={form.civilStatus.includes(item)} onChange={() => toggleArrayValue("civilStatus", item)} />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Employment Status (before training)</Label>
                  <div className="space-y-1">
                    {employmentStatuses.map((item) => (
                      <label key={item} className="flex items-center gap-2 text-sm">
                        <input type="radio" name="employment" checked={form.employmentStatus === item} onChange={() => setForm((prev) => ({ ...prev, employmentStatus: item }))} />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Month of Birth</Label>
                  <Input value={form.monthOfBirth} onChange={(e) => setForm((prev) => ({ ...prev, monthOfBirth: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Day of Birth</Label>
                  <Input value={form.dayOfBirth} onChange={(e) => setForm((prev) => ({ ...prev, dayOfBirth: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Year of Birth</Label>
                  <Input value={form.yearOfBirth} onChange={(e) => setForm((prev) => ({ ...prev, yearOfBirth: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input value={form.age} onChange={(e) => setForm((prev) => ({ ...prev, age: e.target.value }))} />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Birthplace - City/Municipality</Label>
                  <Input value={form.birthplaceCity} onChange={(e) => setForm((prev) => ({ ...prev, birthplaceCity: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Birthplace - Province</Label>
                  <Input value={form.birthplaceProvince} onChange={(e) => setForm((prev) => ({ ...prev, birthplaceProvince: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Birthplace - Region</Label>
                  <Input value={form.birthplaceRegion} onChange={(e) => setForm((prev) => ({ ...prev, birthplaceRegion: e.target.value }))} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Educational Attainment Before the Training (Trainee)</Label>
                <div className="grid md:grid-cols-3 gap-2">
                  {educationalAttainments.map((item) => (
                    <label key={item} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={form.educationalAttainment.includes(item)} onChange={() => toggleArrayValue("educationalAttainment", item)} />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Parent/Guardian Name</Label>
                  <Input value={form.parentGuardianName} onChange={(e) => setForm((prev) => ({ ...prev, parentGuardianName: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Parent/Guardian Complete Permanent Mailing Address</Label>
                  <Input value={form.parentGuardianAddress} onChange={(e) => setForm((prev) => ({ ...prev, parentGuardianAddress: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Parent/Guardian Birthdate</Label>
                  <Input type="date" value={form.parentGuardianBirthdate} onChange={(e) => setForm((prev) => ({ ...prev, parentGuardianBirthdate: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Relationship</Label>
                  <Input value={form.parentGuardianRelationship} onChange={(e) => setForm((prev) => ({ ...prev, parentGuardianRelationship: e.target.value }))} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="elev-card border-blue-100/80 bg-white/90">
            <CardHeader>
              <CardTitle className="text-blue-900">4. Learner/Trainee/Student Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-2">
                {learnerClassifications.map((item) => (
                  <label key={item} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.learnerClassifications.includes(item)} onChange={() => toggleArrayValue("learnerClassifications", item)} />
                    {item}
                  </label>
                ))}
              </div>
              <div className="space-y-2">
                <Label>Others (please specify)</Label>
                <Input value={form.learnerClassificationOthers} onChange={(e) => setForm((prev) => ({ ...prev, learnerClassificationOthers: e.target.value }))} />
              </div>
            </CardContent>
          </Card>

          <Card className="elev-card border-blue-100/80 bg-white/90">
            <CardHeader>
              <CardTitle className="text-blue-900">5. Type of Disability (for Persons with Disability only)</CardTitle>
              <CardDescription>To be filled up by TESDA personnel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-2">
                {disabilityTypes.map((item) => (
                  <label key={item} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.disabilityTypes.includes(item)} onChange={() => toggleArrayValue("disabilityTypes", item)} />
                    {item}
                  </label>
                ))}
              </div>
              <div className="space-y-2">
                <Label>If multiple/others, please specify</Label>
                <Input value={form.disabilityTypeOthers} onChange={(e) => setForm((prev) => ({ ...prev, disabilityTypeOthers: e.target.value }))} />
              </div>
            </CardContent>
          </Card>

          <Card className="elev-card border-blue-100/80 bg-white/90">
            <CardHeader>
              <CardTitle className="text-blue-900">6. Causes of Disability (for Persons with Disability only)</CardTitle>
              <CardDescription>To be filled up by TESDA personnel.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-2">
              {disabilityCauses.map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.disabilityCauses.includes(item)} onChange={() => toggleArrayValue("disabilityCauses", item)} />
                  {item}
                </label>
              ))}
            </CardContent>
          </Card>

          <Card className="elev-card border-blue-100/80 bg-white/90">
            <CardHeader>
              <CardTitle className="text-blue-900">7. Name of Course/Qualification</CardTitle>
            </CardHeader>
            <CardContent>
              <Input value={form.courseQualificationName} onChange={(e) => setForm((prev) => ({ ...prev, courseQualificationName: e.target.value }))} />
            </CardContent>
          </Card>

          <Card className="elev-card border-blue-100/80 bg-white/90">
            <CardHeader>
              <CardTitle className="text-blue-900">8. If Scholar, Type of Scholarship Package (TWSP, PESFA, STEP, others)</CardTitle>
            </CardHeader>
            <CardContent>
              <Input value={form.scholarshipType} onChange={(e) => setForm((prev) => ({ ...prev, scholarshipType: e.target.value }))} />
            </CardContent>
          </Card>

          <Card className="elev-card border-blue-100/80 bg-white/90">
            <CardHeader>
              <CardTitle className="text-blue-900">9. Privacy Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-700 leading-relaxed">
                I hereby allow TESDA to use/post my contact details, name, email, cellphone/landline nos. and other information I provided
                which may be used for processing of my scholarship application, for employment opportunities and for the survey of TESDA programs.
              </p>
              <div className="flex items-center gap-8">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="privacyConsent" checked={form.privacyConsent === "agree"} onChange={() => setForm((prev) => ({ ...prev, privacyConsent: "agree" }))} />
                  Agree
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="privacyConsent" checked={form.privacyConsent === "disagree"} onChange={() => setForm((prev) => ({ ...prev, privacyConsent: "disagree" }))} />
                  Disagree
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="elev-card border-blue-100/80 bg-white/90">
            <CardHeader>
              <CardTitle className="text-blue-900">10. Applicant&apos;s Signature</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600">This is to certify that the information stated above is true and correct.</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Applicant&apos;s Signature Over Printed Name</Label>
                  <Input value={form.applicantSignature} onChange={(e) => setForm((prev) => ({ ...prev, applicantSignature: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Date Accomplished</Label>
                  <Input type="date" value={form.dateAccomplished} onChange={(e) => setForm((prev) => ({ ...prev, dateAccomplished: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>1x1 Picture (taken within the last 6 months)</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setOneByOnePictureFile(e.target.files?.[0] ?? null)} />
                  <p className="text-xs text-slate-500">
                    {oneByOnePictureFile ? `Selected: ${oneByOnePictureFile.name}` : "No file selected."}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Right Thumbmark</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setRightThumbmarkFile(e.target.files?.[0] ?? null)} />
                  <p className="text-xs text-slate-500">
                    {rightThumbmarkFile ? `Selected: ${rightThumbmarkFile.name}` : "No file selected."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Save Registration Form"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => setForm(defaultForm)}>
              Reset
            </Button>
          </div>
        </form>

        <Dialog open={submittedModalOpen} onOpenChange={setSubmittedModalOpen}>
          <DialogContent className="sm:max-w-md border-blue-100">
            <DialogHeader className="text-left space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <DialogTitle className="text-2xl text-blue-950">Registration Submitted</DialogTitle>
              <DialogDescription className="text-slate-600 text-base leading-relaxed">
                Thank you for registering. Please wait for admin approval on your email.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-900">
              We will send your login credentials after approval.
            </div>
            <DialogFooter className="gap-2 sm:justify-end">
              <Button variant="outline" onClick={() => setSubmittedModalOpen(false)}>
                Close
              </Button>
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
