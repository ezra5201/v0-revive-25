"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Save, FileText, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface IntakeFormData {
  // Basic Information
  name: string
  pronouns: string
  dateOfBirth: string
  birthYear: string
  program: string
  howHeardAboutUs: string

  // Support Needs
  needs: string[]
  seeStaff: string[]
  otherSupport: string

  // Language
  languages: string

  // Housing Status
  currentHousingStatus: string[]
  pastHousingStatus: string[]

  // Demographics
  race: string
  ethnicity: string
  gender: string
  isDisabled: boolean | null
  isVeteran: boolean | null

  // Employment and Income
  employmentStatus: string
  incomeSources: string[]

  // Goals
  goal1: string
  goal2: string
  goal3: string

  // Contact Information
  phone: string
  email: string
  preferredContactMethod: string

  // Emergency Contact
  emergencyContactName: string
  emergencyContactRelationship: string
  emergencyContactPhone: string
}

interface IntakeFormModalProps {
  isOpen: boolean
  onClose: () => void
  clientId: number
  clientName: string
}

const NEEDS_OPTIONS = [
  "Food/water",
  "Hygiene products",
  "Safer use/harm reduction supplies",
  "Housing or shelter",
  "Laundry",
  "Transportation",
  "Get documents (ID, homeless letter)",
  "Phone",
  "Computer use",
  "Safe place to rest",
  "Place to hang out",
]

const SEE_STAFF_OPTIONS = [
  "Case manager",
  "Occupational Therapist",
  "Doctor",
  "Psychiatrist",
  "Social worker",
  "Substance use recovery",
]

const CURRENT_HOUSING_OPTIONS = [
  "Landlord problems and risk of eviction",
  "Cannot pay rent",
  "Domestic violence (DV) at home",
  "Disability affecting me from living safely in my home",
  "Other things keeping me from staying in my home",
  "Couch surfing",
  "In a shelter",
  "Unsheltered (train, tent, abandoned building)",
  "None of the above",
]

const INCOME_SOURCES = ["Income (from a job)", "Income (from SSI/SSDI)", "Low income (<$15,650)", "No income"]

export function IntakeFormModal({ isOpen, onClose, clientId, clientName }: IntakeFormModalProps) {
  const [formData, setFormData] = useState<IntakeFormData>({
    name: "",
    pronouns: "",
    dateOfBirth: "",
    birthYear: "",
    program: "",
    howHeardAboutUs: "",
    needs: [],
    seeStaff: [],
    otherSupport: "",
    languages: "",
    currentHousingStatus: [],
    pastHousingStatus: [],
    race: "",
    ethnicity: "",
    gender: "",
    isDisabled: null,
    isVeteran: null,
    employmentStatus: "",
    incomeSources: [],
    goal1: "",
    goal2: "",
    goal3: "",
    phone: "",
    email: "",
    preferredContactMethod: "",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone: "",
  })

  const [sectionStates, setSectionStates] = useState({
    basicInfo: false,
    supportNeeds: false,
    language: false,
    housing: false,
    demographics: false,
    employment: false,
    goals: false,
    contact: false,
    emergencyContact: false,
  })

  const [sectionCompletion, setSectionCompletion] = useState({
    basicInfo: 0,
    supportNeeds: 0,
    language: 0,
    housing: 0,
    demographics: 0,
    employment: 0,
    goals: 0,
    contact: 0,
    emergencyContact: 0,
  })

  const [overallCompletion, setOverallCompletion] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Calculate section completion percentages
  useEffect(() => {
    const calculateSectionCompletion = () => {
      const newCompletion = {
        basicInfo: calculateBasicInfoCompletion(),
        supportNeeds: calculateSupportNeedsCompletion(),
        language: calculateLanguageCompletion(),
        housing: calculateHousingCompletion(),
        demographics: calculateDemographicsCompletion(),
        employment: calculateEmploymentCompletion(),
        goals: calculateGoalsCompletion(),
        contact: calculateContactCompletion(),
        emergencyContact: calculateEmergencyContactCompletion(),
      }

      setSectionCompletion(newCompletion)

      // Calculate overall completion
      const totalCompletion = Object.values(newCompletion).reduce((sum, val) => sum + val, 0)
      setOverallCompletion(Math.round(totalCompletion / 9))
    }

    calculateSectionCompletion()
  }, [formData])

  const calculateBasicInfoCompletion = () => {
    const requiredFields = [formData.name, formData.program, formData.howHeardAboutUs]
    const optionalFields = [formData.pronouns, formData.dateOfBirth || formData.birthYear] // Either date or year counts

    const filledRequired = requiredFields.filter((field) => field && field.trim() !== "").length
    const filledOptional = optionalFields.filter((field) => field && field.trim() !== "").length

    // Weight required fields more heavily
    const totalFields = requiredFields.length + optionalFields.length
    const weightedScore =
      (filledRequired * 1.5 + filledOptional) / (requiredFields.length * 1.5 + optionalFields.length)

    return Math.round(weightedScore * 100)
  }

  const calculateSupportNeedsCompletion = () => {
    const hasNeeds = formData.needs.length > 0
    const hasStaff = formData.seeStaff.length > 0
    const filledCount = [hasNeeds, hasStaff].filter(Boolean).length
    return Math.round((filledCount / 2) * 100)
  }

  const calculateLanguageCompletion = () => {
    return formData.languages.trim() !== "" ? 100 : 0
  }

  const calculateHousingCompletion = () => {
    const hasCurrentStatus = formData.currentHousingStatus.length > 0
    const hasPastStatus = formData.pastHousingStatus.length > 0
    const filledCount = [hasCurrentStatus, hasPastStatus].filter(Boolean).length
    return Math.round((filledCount / 2) * 100)
  }

  const calculateDemographicsCompletion = () => {
    const fields = [
      formData.race,
      formData.ethnicity,
      formData.gender,
      formData.isDisabled !== null,
      formData.isVeteran !== null,
    ]
    const filledFields = fields.filter(
      (field) => field === true || (typeof field === "string" && field.trim() !== ""),
    ).length
    return Math.round((filledFields / fields.length) * 100)
  }

  const calculateEmploymentCompletion = () => {
    const hasEmploymentStatus = formData.employmentStatus !== ""
    const hasIncomeSources = formData.incomeSources.length > 0
    const filledCount = [hasEmploymentStatus, hasIncomeSources].filter(Boolean).length
    return Math.round((filledCount / 2) * 100)
  }

  const calculateGoalsCompletion = () => {
    const goals = [formData.goal1, formData.goal2, formData.goal3]
    const filledGoals = goals.filter((goal) => goal && goal.trim() !== "").length
    return Math.round((filledGoals / goals.length) * 100)
  }

  const calculateContactCompletion = () => {
    const fields = [formData.phone, formData.email, formData.preferredContactMethod]
    const filledFields = fields.filter((field) => field && field.trim() !== "").length
    return Math.round((filledFields / fields.length) * 100)
  }

  const calculateEmergencyContactCompletion = () => {
    const fields = [
      formData.emergencyContactName,
      formData.emergencyContactRelationship,
      formData.emergencyContactPhone,
    ]
    const filledFields = fields.filter((field) => field && field.trim() !== "").length
    return Math.round((filledFields / fields.length) * 100)
  }

  useEffect(() => {
    if (!hasUnsavedChanges) return

    const autoSaveTimer = setTimeout(() => {
      handleSave(true) // Pass true to indicate auto-save
    }, 3000) // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(autoSaveTimer)
  }, [formData, hasUnsavedChanges])

  useEffect(() => {
    setHasUnsavedChanges(true)
  }, [formData])

  const handleSave = async (isAutoSave = false) => {
    if (!isAutoSave) setIsSaving(true)
    try {
      const response = await fetch("/api/intake-forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          formData,
          sectionCompletion,
          overallCompletion,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save intake form")
      }

      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      console.log("Intake form saved successfully")
    } catch (error) {
      console.error("Error saving intake form:", error)
    } finally {
      if (!isAutoSave) setIsSaving(false)
    }
  }

  const SectionHeader = ({
    title,
    section,
    completion,
    isRequired = false,
  }: {
    title: string
    section: keyof typeof sectionStates
    completion: number
    isRequired?: boolean
  }) => (
    <CollapsibleTrigger asChild>
      <Button variant="ghost" className="w-full justify-between p-4 h-auto hover:bg-muted/50">
        <div className="flex items-center gap-3">
          {sectionStates[section] ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          <span className="font-bold text-left text-lg">{title}</span>
          {isRequired && <AlertCircle className="h-4 w-4 text-orange-500" />}
        </div>
        <Badge
          variant={completion === 100 ? "default" : completion > 0 ? "secondary" : "outline"}
          className="text-base px-3 py-1"
        >
          {completion}%
        </Badge>
      </Button>
    </CollapsibleTrigger>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-gray-500/30 backdrop-blur-sm z-40" />
      <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[85vw] lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] flex flex-col p-0 z-50">
        <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-700 p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl text-white font-semibold">
              <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="truncate">Center Walk-In Intake - {clientName}</span>
            </DialogTitle>
            <div className="text-sm sm:text-base text-gray-300 mb-3">
              These questions help us connect you to the team members and supports that you need and want.
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex-1">
                <Progress value={overallCompletion} className="h-2 sm:h-3" />
              </div>
              <Badge
                variant={overallCompletion === 100 ? "default" : "secondary"}
                className="text-sm sm:text-base px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap"
              >
                {overallCompletion}% Complete
              </Badge>
            </div>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-2">
            {/* Basic Information Section */}
            <Collapsible
              open={sectionStates.basicInfo}
              onOpenChange={(open) => setSectionStates((prev) => ({ ...prev, basicInfo: open }))}
            >
              <SectionHeader
                title="1. Basic Information"
                section="basicInfo"
                completion={sectionCompletion.basicInfo}
                isRequired
              />
              <CollapsibleContent className="px-2 sm:px-4 pb-4 space-y-4 border-l-2 border-muted ml-2 sm:ml-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="flex items-center gap-1 text-base font-medium">
                      Name <AlertCircle className="h-3 w-3 text-orange-500" />
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Full name"
                      className="mt-1 text-base h-11 sm:h-10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pronouns" className="text-base font-medium">
                      Pronouns
                    </Label>
                    <Input
                      id="pronouns"
                      value={formData.pronouns}
                      onChange={(e) => setFormData((prev) => ({ ...prev, pronouns: e.target.value }))}
                      placeholder="e.g., he/him, she/her, they/them"
                      className="mt-1 text-base h-11 sm:h-10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth" className="text-base font-medium">
                      Date of Birth
                    </Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="mt-1 text-base h-11 sm:h-10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="birthYear" className="text-base font-medium">
                      Birth Year (if date unknown)
                    </Label>
                    <Input
                      id="birthYear"
                      value={formData.birthYear}
                      onChange={(e) => setFormData((prev) => ({ ...prev, birthYear: e.target.value }))}
                      placeholder="e.g., 1990"
                      className="mt-1 text-base h-11 sm:h-10"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <Label htmlFor="program" className="text-base font-medium">
                      Program
                    </Label>
                    <Input
                      id="program"
                      value={formData.program}
                      onChange={(e) => setFormData((prev) => ({ ...prev, program: e.target.value }))}
                      placeholder="Program name"
                      className="mt-1 text-base h-11 sm:h-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="howHeardAboutUs" className="text-base font-medium">
                    How did you hear about us?
                  </Label>
                  <Textarea
                    id="howHeardAboutUs"
                    value={formData.howHeardAboutUs}
                    onChange={(e) => setFormData((prev) => ({ ...prev, howHeardAboutUs: e.target.value }))}
                    placeholder="Please describe how you learned about ReVive"
                    rows={3}
                    className="mt-1 text-base min-h-[80px]"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Support Needs Section */}
            <Collapsible
              open={sectionStates.supportNeeds}
              onOpenChange={(open) => setSectionStates((prev) => ({ ...prev, supportNeeds: open }))}
            >
              <SectionHeader
                title="2. What support do you hope to have at ReVive's Engagement Center?"
                section="supportNeeds"
                completion={sectionCompletion.supportNeeds}
              />
              <CollapsibleContent className="px-2 sm:px-4 pb-4 space-y-6 border-l-2 border-muted ml-2 sm:ml-4">
                <div>
                  <Label className="text-base font-semibold text-muted-foreground mb-3 block">Needs:</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {NEEDS_OPTIONS.map((need) => (
                      <div key={need} className="flex items-start space-x-3">
                        <Checkbox
                          id={`need-${need}`}
                          checked={formData.needs.includes(need)}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              needs: checked ? [...prev.needs, need] : prev.needs.filter((item) => item !== need),
                            }))
                          }
                          className="mt-0.5 h-5 w-5 sm:h-4 sm:w-4"
                        />
                        <Label htmlFor={`need-${need}`} className="text-base leading-6 cursor-pointer">
                          {need}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold text-muted-foreground mb-3 block">See a:</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {SEE_STAFF_OPTIONS.map((staff) => (
                      <div key={staff} className="flex items-start space-x-3">
                        <Checkbox
                          id={`staff-${staff}`}
                          checked={formData.seeStaff.includes(staff)}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              seeStaff: checked
                                ? [...prev.seeStaff, staff]
                                : prev.seeStaff.filter((item) => item !== staff),
                            }))
                          }
                          className="mt-0.5 h-5 w-5 sm:h-4 sm:w-4"
                        />
                        <Label htmlFor={`staff-${staff}`} className="text-base leading-6 cursor-pointer">
                          {staff}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="otherSupport" className="text-base font-semibold text-muted-foreground">
                    Other:
                  </Label>
                  <Textarea
                    id="otherSupport"
                    value={formData.otherSupport}
                    onChange={(e) => setFormData((prev) => ({ ...prev, otherSupport: e.target.value }))}
                    placeholder="Please describe any other support needs"
                    rows={2}
                    className="mt-2 text-base min-h-[60px]"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Language Section */}
            <Collapsible
              open={sectionStates.language}
              onOpenChange={(open) => setSectionStates((prev) => ({ ...prev, language: open }))}
            >
              <SectionHeader title="3. Language" section="language" completion={sectionCompletion.language} />
              <CollapsibleContent className="px-4 pb-4 border-l-2 border-muted ml-4">
                <div>
                  <Label htmlFor="languages">Language (most fluent language first)</Label>
                  <Input
                    id="languages"
                    value={formData.languages}
                    onChange={(e) => setFormData((prev) => ({ ...prev, languages: e.target.value }))}
                    placeholder="e.g., English, Spanish, Arabic"
                    className="mt-1 text-base"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Housing Status Section */}
            <Collapsible
              open={sectionStates.housing}
              onOpenChange={(open) => setSectionStates((prev) => ({ ...prev, housing: open }))}
            >
              <SectionHeader title="4. Housing Status" section="housing" completion={sectionCompletion.housing} />
              <CollapsibleContent className="px-4 pb-4 space-y-6 border-l-2 border-muted ml-4">
                <div>
                  <Label className="text-base font-semibold text-muted-foreground mb-3 block">
                    Current Housing Status (Unstably housed, such as):
                  </Label>
                  <div className="grid grid-cols-1 gap-3">
                    {CURRENT_HOUSING_OPTIONS.map((status) => (
                      <div key={status} className="flex items-start space-x-2">
                        <Checkbox
                          id={`current-housing-${status}`}
                          checked={formData.currentHousingStatus.includes(status)}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              currentHousingStatus: checked
                                ? [...prev.currentHousingStatus, status]
                                : prev.currentHousingStatus.filter((item) => item !== status),
                            }))
                          }
                          className="mt-0.5"
                        />
                        <Label htmlFor={`current-housing-${status}`} className="text-base leading-5">
                          {status}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold text-muted-foreground mb-3 block">
                    Past Housing Status:
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="past-housing-homeless"
                        checked={formData.pastHousingStatus.includes("I have been homeless or had unstable housing")}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            pastHousingStatus: checked
                              ? [...prev.pastHousingStatus, "I have been homeless or had unstable housing"]
                              : prev.pastHousingStatus.filter(
                                  (item) => item !== "I have been homeless or had unstable housing",
                                ),
                          }))
                        }
                        className="mt-0.5"
                      />
                      <Label htmlFor="past-housing-homeless" className="text-base leading-5">
                        I have been homeless or had unstable housing
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="past-housing-na"
                        checked={formData.pastHousingStatus.includes("N/A")}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            pastHousingStatus: checked
                              ? [...prev.pastHousingStatus, "N/A"]
                              : prev.pastHousingStatus.filter((item) => item !== "N/A"),
                          }))
                        }
                        className="mt-0.5"
                      />
                      <Label htmlFor="past-housing-na" className="text-base leading-5">
                        N/A
                      </Label>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Demographics Section */}
            <Collapsible
              open={sectionStates.demographics}
              onOpenChange={(open) => setSectionStates((prev) => ({ ...prev, demographics: open }))}
            >
              <SectionHeader
                title="5. Demographics"
                section="demographics"
                completion={sectionCompletion.demographics}
              />
              <CollapsibleContent className="px-2 sm:px-4 pb-4 space-y-6 border-l-2 border-muted ml-2 sm:ml-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="race">Race</Label>
                    <Input
                      id="race"
                      value={formData.race}
                      onChange={(e) => setFormData((prev) => ({ ...prev, race: e.target.value }))}
                      placeholder="Race"
                      className="mt-1 text-base h-11 sm:h-10"
                    />
                  </div>
                  <div>
                    <Label className="block mb-2">Ethnicity</Label>
                    <RadioGroup
                      value={formData.ethnicity}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, ethnicity: value }))}
                      className="flex flex-col sm:flex-row gap-4 sm:gap-6"
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="Hispanic" id="hispanic" className="h-5 w-5 sm:h-4 sm:w-4" />
                        <Label htmlFor="hispanic" className="text-base cursor-pointer">
                          Hispanic
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="Non-Hispanic" id="non-hispanic" className="h-5 w-5 sm:h-4 sm:w-4" />
                        <Label htmlFor="non-hispanic" className="text-base cursor-pointer">
                          Non-Hispanic
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="lg:col-span-2">
                    <Label className="block mb-2">Gender</Label>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="Man" id="man" className="h-5 w-5 sm:h-4 sm:w-4" />
                        <Label htmlFor="man" className="text-base cursor-pointer">
                          Man
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="Woman" id="woman" className="h-5 w-5 sm:h-4 sm:w-4" />
                        <Label htmlFor="woman" className="text-base cursor-pointer">
                          Woman
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="Non-binary" id="non-binary" className="h-5 w-5 sm:h-4 sm:w-4" />
                        <Label htmlFor="non-binary" className="text-base cursor-pointer">
                          Non-binary
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="Other" id="other-gender" className="h-5 w-5 sm:h-4 sm:w-4" />
                        <Label htmlFor="other-gender" className="text-base cursor-pointer">
                          Other
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="lg:col-span-2 space-y-4">
                    <div>
                      <Label className="block mb-2">Disability?</Label>
                      <RadioGroup
                        value={formData.isDisabled === null ? "" : formData.isDisabled.toString()}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, isDisabled: value === "" ? null : value === "true" }))
                        }
                        className="flex flex-col sm:flex-row gap-4 sm:gap-6"
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="true" id="disabled-yes" className="h-5 w-5 sm:h-4 sm:w-4" />
                          <Label htmlFor="disabled-yes" className="text-base cursor-pointer">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="false" id="disabled-no" className="h-5 w-5 sm:h-4 sm:w-4" />
                          <Label htmlFor="disabled-no" className="text-base cursor-pointer">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div>
                      <Label className="block mb-2">Veteran?</Label>
                      <RadioGroup
                        value={formData.isVeteran === null ? "" : formData.isVeteran.toString()}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, isVeteran: value === "" ? null : value === "true" }))
                        }
                        className="flex flex-col sm:flex-row gap-4 sm:gap-6"
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="true" id="veteran-yes" className="h-5 w-5 sm:h-4 sm:w-4" />
                          <Label htmlFor="veteran-yes" className="text-base cursor-pointer">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="false" id="veteran-no" className="h-5 w-5 sm:h-4 sm:w-4" />
                          <Label htmlFor="veteran-no" className="text-base cursor-pointer">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Employment and Income Section */}
            <Collapsible
              open={sectionStates.employment}
              onOpenChange={(open) => setSectionStates((prev) => ({ ...prev, employment: open }))}
            >
              <SectionHeader
                title="6. Employment & Income"
                section="employment"
                completion={sectionCompletion.employment}
              />
              <CollapsibleContent className="px-2 sm:px-4 pb-4 space-y-6 border-l-2 border-muted ml-2 sm:ml-4">
                <div>
                  <Label className="block mb-2">Are you:</Label>
                  <RadioGroup
                    value={formData.employmentStatus}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, employmentStatus: value }))}
                    className="flex flex-col sm:flex-row gap-4 sm:gap-6"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="employed" id="employed" className="h-5 w-5 sm:h-4 sm:w-4" />
                      <Label htmlFor="employed" className="text-base cursor-pointer">
                        Employed
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="underemployed" id="underemployed" className="h-5 w-5 sm:h-4 sm:w-4" />
                      <Label htmlFor="underemployed" className="text-base cursor-pointer">
                        Underemployed
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="unemployed" id="unemployed" className="h-5 w-5 sm:h-4 sm:w-4" />
                      <Label htmlFor="unemployed" className="text-base cursor-pointer">
                        Unemployed
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-semibold text-muted-foreground mb-3 block">I have:</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {INCOME_SOURCES.map((source) => (
                      <div key={source} className="flex items-start space-x-3">
                        <Checkbox
                          id={`income-${source}`}
                          checked={formData.incomeSources.includes(source)}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              incomeSources: checked
                                ? [...prev.incomeSources, source]
                                : prev.incomeSources.filter((item) => item !== source),
                            }))
                          }
                          className="mt-0.5 h-5 w-5 sm:h-4 sm:w-4"
                        />
                        <Label htmlFor={`income-${source}`} className="text-base leading-5 cursor-pointer">
                          {source}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Goals Section */}
            <Collapsible
              open={sectionStates.goals}
              onOpenChange={(open) => setSectionStates((prev) => ({ ...prev, goals: open }))}
            >
              <SectionHeader title="7. My Main Goals" section="goals" completion={sectionCompletion.goals} />
              <CollapsibleContent className="px-4 pb-4 space-y-4 border-l-2 border-muted ml-4">
                <div>
                  <Label htmlFor="goal1">1.</Label>
                  <Textarea
                    id="goal1"
                    value={formData.goal1}
                    onChange={(e) => setFormData((prev) => ({ ...prev, goal1: e.target.value }))}
                    placeholder="Describe your first main goal"
                    rows={2}
                    className="mt-1 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="goal2">2.</Label>
                  <Textarea
                    id="goal2"
                    value={formData.goal2}
                    onChange={(e) => setFormData((prev) => ({ ...prev, goal2: e.target.value }))}
                    placeholder="Describe your second main goal"
                    rows={2}
                    className="mt-1 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="goal3">3.</Label>
                  <Textarea
                    id="goal3"
                    value={formData.goal3}
                    onChange={(e) => setFormData((prev) => ({ ...prev, goal3: e.target.value }))}
                    placeholder="Describe your third main goal"
                    rows={2}
                    className="mt-1 text-base"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Contact Information Section */}
            <Collapsible
              open={sectionStates.contact}
              onOpenChange={(open) => setSectionStates((prev) => ({ ...prev, contact: open }))}
            >
              <SectionHeader title="8. My Contact Info" section="contact" completion={sectionCompletion.contact} />
              <CollapsibleContent className="px-2 sm:px-4 pb-4 space-y-4 border-l-2 border-muted ml-2 sm:ml-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone #</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="Phone number"
                      className="mt-1 text-base h-11 sm:h-10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      placeholder="Email address"
                      className="mt-1 text-base h-11 sm:h-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="preferredContactMethod">How do you prefer to be contacted?</Label>
                  <Input
                    id="preferredContactMethod"
                    value={formData.preferredContactMethod}
                    onChange={(e) => setFormData((prev) => ({ ...prev, preferredContactMethod: e.target.value }))}
                    placeholder="e.g., phone call, text, email"
                    className="mt-1 text-base h-11 sm:h-10"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Emergency Contact Section */}
            <Collapsible
              open={sectionStates.emergencyContact}
              onOpenChange={(open) => setSectionStates((prev) => ({ ...prev, emergencyContact: open }))}
            >
              <SectionHeader
                title="9. Emergency Contact Info"
                section="emergencyContact"
                completion={sectionCompletion.emergencyContact}
              />
              <CollapsibleContent className="px-2 sm:px-4 pb-4 space-y-4 border-l-2 border-muted ml-2 sm:ml-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContactName">Name</Label>
                    <Input
                      id="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContactName: e.target.value }))}
                      placeholder="Emergency contact name"
                      className="mt-1 text-base h-11 sm:h-10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                    <Input
                      id="emergencyContactRelationship"
                      value={formData.emergencyContactRelationship}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, emergencyContactRelationship: e.target.value }))
                      }
                      placeholder="e.g., spouse, parent, friend"
                      className="mt-1 text-base h-11 sm:h-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="emergencyContactPhone">Phone #</Label>
                  <Input
                    id="emergencyContactPhone"
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContactPhone: e.target.value }))}
                    placeholder="Emergency contact phone number"
                    className="mt-1 text-base h-11 sm:h-10"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="pt-6 border-t space-y-4">
            <div className="text-base text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <strong>Note:</strong> Please provide a copy of your ID and health insurance card as part of your
              enrollment. This will help us to better support you in reaching your goals.
              <br />
              <em className="text-sm">*Reference 2025 Federal Poverty Guidelines</em>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="text-sm sm:text-base text-muted-foreground">
                {hasUnsavedChanges
                  ? "Saving changes..."
                  : lastSaved
                    ? `Last saved: ${lastSaved.toLocaleTimeString()}`
                    : "Progress will be saved automatically"}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="text-base px-4 sm:px-6 py-2 h-11 sm:h-10 bg-transparent flex-1 sm:flex-none"
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleSave(false)}
                  disabled={isSaving}
                  className="text-base px-4 sm:px-6 py-2 h-11 sm:h-10 flex-1 sm:flex-none"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Now"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
