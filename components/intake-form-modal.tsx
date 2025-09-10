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

  const handleSave = async () => {
    setIsSaving(true)
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

      console.log("Intake form saved successfully")
    } catch (error) {
      console.error("Error saving intake form:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleSection = (section: keyof typeof sectionStates) => {
    setSectionStates((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleCheckboxChange = (field: keyof IntakeFormData, value: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter((item) => item !== value),
    }))
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
      <Button
        variant="ghost"
        className="w-full justify-between p-4 h-auto hover:bg-muted/50"
        onClick={() => toggleSection(section)}
      >
        <div className="flex items-center gap-3">
          {sectionStates[section] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <span className="font-medium text-left">{title}</span>
          {isRequired && <AlertCircle className="h-3 w-3 text-orange-500" />}
        </div>
        <Badge variant={completion === 100 ? "default" : completion > 0 ? "secondary" : "outline"}>{completion}%</Badge>
      </Button>
    </CollapsibleTrigger>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-5 w-5" />
            Center Walk-In Intake - {clientName}
          </DialogTitle>
          <div className="text-sm text-muted-foreground mb-3">
            These questions help us connect you to the team members and supports that you need and want.
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress value={overallCompletion} className="h-3" />
            </div>
            <Badge variant={overallCompletion === 100 ? "default" : "secondary"} className="text-sm px-3 py-1">
              {overallCompletion}% Complete
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-2">
          {/* Basic Information Section */}
          <Collapsible open={sectionStates.basicInfo} onOpenChange={() => toggleSection("basicInfo")}>
            <SectionHeader
              title="Basic Information"
              section="basicInfo"
              completion={sectionCompletion.basicInfo}
              isRequired
            />
            <CollapsibleContent className="px-4 pb-4 space-y-4 border-l-2 border-muted ml-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="flex items-center gap-1">
                    Name <AlertCircle className="h-3 w-3 text-orange-500" />
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Full name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="pronouns">Pronouns</Label>
                  <Input
                    id="pronouns"
                    value={formData.pronouns}
                    onChange={(e) => setFormData((prev) => ({ ...prev, pronouns: e.target.value }))}
                    placeholder="e.g., he/him, she/her, they/them"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="birthYear">Birth Year (if date unknown)</Label>
                  <Input
                    id="birthYear"
                    value={formData.birthYear}
                    onChange={(e) => setFormData((prev) => ({ ...prev, birthYear: e.target.value }))}
                    placeholder="e.g., 1990"
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="program">Program</Label>
                  <Input
                    id="program"
                    value={formData.program}
                    onChange={(e) => setFormData((prev) => ({ ...prev, program: e.target.value }))}
                    placeholder="Program name"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="howHeardAboutUs">How did you hear about us?</Label>
                <Textarea
                  id="howHeardAboutUs"
                  value={formData.howHeardAboutUs}
                  onChange={(e) => setFormData((prev) => ({ ...prev, howHeardAboutUs: e.target.value }))}
                  placeholder="Please describe how you learned about ReVive"
                  rows={3}
                  className="mt-1"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Support Needs Section */}
          <Collapsible open={sectionStates.supportNeeds} onOpenChange={() => toggleSection("supportNeeds")}>
            <SectionHeader
              title="What support do you hope to have at ReVive's Engagement Center?"
              section="supportNeeds"
              completion={sectionCompletion.supportNeeds}
            />
            <CollapsibleContent className="px-4 pb-4 space-y-6 border-l-2 border-muted ml-4">
              <div>
                <Label className="text-sm font-semibold text-muted-foreground mb-3 block">Needs:</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {NEEDS_OPTIONS.map((need) => (
                    <div key={need} className="flex items-start space-x-2">
                      <Checkbox
                        id={`need-${need}`}
                        checked={formData.needs.includes(need)}
                        onCheckedChange={(checked) => handleCheckboxChange("needs", need, checked as boolean)}
                        className="mt-0.5"
                      />
                      <Label htmlFor={`need-${need}`} className="text-sm leading-5">
                        {need}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-muted-foreground mb-3 block">See a:</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {SEE_STAFF_OPTIONS.map((staff) => (
                    <div key={staff} className="flex items-start space-x-2">
                      <Checkbox
                        id={`staff-${staff}`}
                        checked={formData.seeStaff.includes(staff)}
                        onCheckedChange={(checked) => handleCheckboxChange("seeStaff", staff, checked as boolean)}
                        className="mt-0.5"
                      />
                      <Label htmlFor={`staff-${staff}`} className="text-sm leading-5">
                        {staff}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="otherSupport" className="text-sm font-semibold text-muted-foreground">
                  Other:
                </Label>
                <Textarea
                  id="otherSupport"
                  value={formData.otherSupport}
                  onChange={(e) => setFormData((prev) => ({ ...prev, otherSupport: e.target.value }))}
                  placeholder="Please describe any other support needs"
                  rows={2}
                  className="mt-2"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Language Section */}
          <Collapsible open={sectionStates.language} onOpenChange={() => toggleSection("language")}>
            <SectionHeader title="Language" section="language" completion={sectionCompletion.language} />
            <CollapsibleContent className="px-4 pb-4 border-l-2 border-muted ml-4">
              <div>
                <Label htmlFor="languages">Language (most fluent language first)</Label>
                <Input
                  id="languages"
                  value={formData.languages}
                  onChange={(e) => setFormData((prev) => ({ ...prev, languages: e.target.value }))}
                  placeholder="e.g., English, Spanish, Arabic"
                  className="mt-1"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Housing Status Section */}
          <Collapsible open={sectionStates.housing} onOpenChange={() => toggleSection("housing")}>
            <SectionHeader title="Housing Status" section="housing" completion={sectionCompletion.housing} />
            <CollapsibleContent className="px-4 pb-4 space-y-6 border-l-2 border-muted ml-4">
              <div>
                <Label className="text-sm font-semibold text-muted-foreground mb-3 block">
                  Current Housing Status (Unstably housed, such as):
                </Label>
                <div className="grid grid-cols-1 gap-3">
                  {CURRENT_HOUSING_OPTIONS.map((status) => (
                    <div key={status} className="flex items-start space-x-2">
                      <Checkbox
                        id={`current-housing-${status}`}
                        checked={formData.currentHousingStatus.includes(status)}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("currentHousingStatus", status, checked as boolean)
                        }
                        className="mt-0.5"
                      />
                      <Label htmlFor={`current-housing-${status}`} className="text-sm leading-5">
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-muted-foreground mb-3 block">Past Housing Status:</Label>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="past-housing-homeless"
                      checked={formData.pastHousingStatus.includes("I have been homeless or had unstable housing")}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(
                          "pastHousingStatus",
                          "I have been homeless or had unstable housing",
                          checked as boolean,
                        )
                      }
                      className="mt-0.5"
                    />
                    <Label htmlFor="past-housing-homeless" className="text-sm leading-5">
                      I have been homeless or had unstable housing
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="past-housing-na"
                      checked={formData.pastHousingStatus.includes("N/A")}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("pastHousingStatus", "N/A", checked as boolean)
                      }
                      className="mt-0.5"
                    />
                    <Label htmlFor="past-housing-na" className="text-sm leading-5">
                      N/A
                    </Label>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Demographics Section */}
          <Collapsible open={sectionStates.demographics} onOpenChange={() => toggleSection("demographics")}>
            <SectionHeader title="Demographics" section="demographics" completion={sectionCompletion.demographics} />
            <CollapsibleContent className="px-4 pb-4 space-y-6 border-l-2 border-muted ml-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="race">Race</Label>
                  <Input
                    id="race"
                    value={formData.race}
                    onChange={(e) => setFormData((prev) => ({ ...prev, race: e.target.value }))}
                    placeholder="Race"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="block mb-2">Ethnicity</Label>
                  <RadioGroup
                    value={formData.ethnicity}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, ethnicity: value }))}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Hispanic" id="hispanic" />
                      <Label htmlFor="hispanic">Hispanic</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Non-Hispanic" id="non-hispanic" />
                      <Label htmlFor="non-hispanic">Non-Hispanic</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label className="block mb-2">Gender</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Man" id="man" />
                      <Label htmlFor="man">Man</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Woman" id="woman" />
                      <Label htmlFor="woman">Woman</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Non-binary" id="non-binary" />
                      <Label htmlFor="non-binary">Non-binary</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Other" id="other-gender" />
                      <Label htmlFor="other-gender">Other</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="block mb-2">Disability?</Label>
                    <RadioGroup
                      value={formData.isDisabled === null ? "" : formData.isDisabled.toString()}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, isDisabled: value === "" ? null : value === "true" }))
                      }
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="disabled-yes" />
                        <Label htmlFor="disabled-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="disabled-no" />
                        <Label htmlFor="disabled-no">No</Label>
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
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="veteran-yes" />
                        <Label htmlFor="veteran-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="veteran-no" />
                        <Label htmlFor="veteran-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Employment and Income Section */}
          <Collapsible open={sectionStates.employment} onOpenChange={() => toggleSection("employment")}>
            <SectionHeader title="Employment & Income" section="employment" completion={sectionCompletion.employment} />
            <CollapsibleContent className="px-4 pb-4 space-y-6 border-l-2 border-muted ml-4">
              <div>
                <Label className="block mb-2">Are you:</Label>
                <RadioGroup
                  value={formData.employmentStatus}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, employmentStatus: value }))}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="employed" id="employed" />
                    <Label htmlFor="employed">Employed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="underemployed" id="underemployed" />
                    <Label htmlFor="underemployed">Underemployed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unemployed" id="unemployed" />
                    <Label htmlFor="unemployed">Unemployed</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-sm font-semibold text-muted-foreground mb-3 block">I have:</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {INCOME_SOURCES.map((source) => (
                    <div key={source} className="flex items-start space-x-2">
                      <Checkbox
                        id={`income-${source}`}
                        checked={formData.incomeSources.includes(source)}
                        onCheckedChange={(checked) => handleCheckboxChange("incomeSources", source, checked as boolean)}
                        className="mt-0.5"
                      />
                      <Label htmlFor={`income-${source}`} className="text-sm leading-5">
                        {source}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Goals Section */}
          <Collapsible open={sectionStates.goals} onOpenChange={() => toggleSection("goals")}>
            <SectionHeader title="My Main Goals" section="goals" completion={sectionCompletion.goals} />
            <CollapsibleContent className="px-4 pb-4 space-y-4 border-l-2 border-muted ml-4">
              <div>
                <Label htmlFor="goal1">1.</Label>
                <Textarea
                  id="goal1"
                  value={formData.goal1}
                  onChange={(e) => setFormData((prev) => ({ ...prev, goal1: e.target.value }))}
                  placeholder="Describe your first main goal"
                  rows={2}
                  className="mt-1"
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
                  className="mt-1"
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
                  className="mt-1"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Contact Information Section */}
          <Collapsible open={sectionStates.contact} onOpenChange={() => toggleSection("contact")}>
            <SectionHeader title="My Contact Info" section="contact" completion={sectionCompletion.contact} />
            <CollapsibleContent className="px-4 pb-4 space-y-4 border-l-2 border-muted ml-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone #</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone number"
                    className="mt-1"
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
                    className="mt-1"
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
                  className="mt-1"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Emergency Contact Section */}
          <Collapsible open={sectionStates.emergencyContact} onOpenChange={() => toggleSection("emergencyContact")}>
            <SectionHeader
              title="Emergency Contact Info"
              section="emergencyContact"
              completion={sectionCompletion.emergencyContact}
            />
            <CollapsibleContent className="px-4 pb-4 space-y-4 border-l-2 border-muted ml-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContactName">Name</Label>
                  <Input
                    id="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContactName: e.target.value }))}
                    placeholder="Emergency contact name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                  <Input
                    id="emergencyContactRelationship"
                    value={formData.emergencyContactRelationship}
                    onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContactRelationship: e.target.value }))}
                    placeholder="e.g., spouse, parent, friend"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="emergencyContactPhone">Phone #</Label>
                <Input
                  id="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContactPhone: e.target.value }))}
                  placeholder="Emergency contact phone number"
                  className="mt-1"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="pt-6 border-t space-y-4">
          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <strong>Note:</strong> Please provide a copy of your ID and health insurance card as part of your
            enrollment. This will help us to better support you in reaching your goals.
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">Progress is automatically saved</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Progress"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
