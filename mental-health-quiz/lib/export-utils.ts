// Export utilities for generating different CSV formats

export interface ExportOptions {
  includeResponses: boolean
  includeResults: boolean
  dateRange?: {
    start: Date
    end: Date
  }
  courses?: string[]
  semesters?: number[]
}

export function generateUserSummaryCSV(users: any[]): string {
  const headers = [
    "User ID",
    "Name",
    "Email",
    "Age",
    "Gender",
    "City",
    "Course",
    "Semester",
    "Registration Date",
    "VAK Completed",
    "EI Completed",
    "Rep System Completed",
    "All Completed",
    "Completion Date",
  ]

  const rows = users.map((user) => [
    user.id,
    user.name,
    user.email,
    user.age,
    user.gender,
    user.city,
    user.course,
    user.semester,
    formatDate(user.created_at),
    user.vak_completed ? "Yes" : "No",
    user.ei_completed ? "Yes" : "No",
    user.rep_system_completed ? "Yes" : "No",
    user.all_completed ? "Yes" : "No",
    user.completion_date ? formatDate(user.completion_date) : "N/A",
  ])

  return generateCSV(headers, rows)
}

export function generateVAKResponsesCSV(data: any[]): string {
  const headers = [
    "User ID",
    "User Name",
    "User Email",
    "Course",
    "Semester",
    "Question Number",
    "Question Text",
    "Selected Option",
    "Selected Value (V/A/K)",
    "Visual Score",
    "Auditory Score",
    "Kinesthetic Score",
    "Dominant Style",
  ]

  const rows = data
    .filter((row) => row.vak_question_number)
    .map((row) => [
      row.user_id,
      row.user_name,
      row.user_email,
      row.user_course,
      row.user_semester,
      row.vak_question_number,
      row.vak_question_text,
      row.vak_selected_option,
      row.vak_selected_value,
      row.vak_visual_score,
      row.vak_auditory_score,
      row.vak_kinesthetic_score,
      row.vak_dominant_style,
    ])

  return generateCSV(headers, rows)
}

export function generateEIResponsesCSV(data: any[]): string {
  const headers = [
    "User ID",
    "User Name",
    "User Email",
    "Course",
    "Semester",
    "Statement Number",
    "Statement Text",
    "Rating (1-5)",
    "Category",
    "Self Awareness Score",
    "Managing Emotions Score",
    "Motivating Oneself Score",
    "Empathy Score",
    "Social Skill Score",
    "Total EI Score",
  ]

  const rows = data
    .filter((row) => row.ei_statement_number)
    .map((row) => [
      row.user_id,
      row.user_name,
      row.user_email,
      row.user_course,
      row.user_semester,
      row.ei_statement_number,
      row.ei_statement_text,
      row.ei_rating,
      row.ei_category,
      row.ei_self_awareness_score,
      row.ei_managing_emotions_score,
      row.ei_motivating_oneself_score,
      row.ei_empathy_score,
      row.ei_social_skill_score,
      row.ei_total_score,
    ])

  return generateCSV(headers, rows)
}

export function generateRepSystemResponsesCSV(data: any[]): string {
  const headers = [
    "User ID",
    "User Name",
    "User Email",
    "Course",
    "Semester",
    "Question Number",
    "Option Number",
    "Ranking (1-4)",
    "Option Text",
    "Option Value (V/A/K/Ad)",
    "Visual Score",
    "Auditory Score",
    "Kinesthetic Score",
    "Auditory Digital Score",
    "Dominant System",
  ]

  const rows = data
    .filter((row) => row.rep_question_number)
    .map((row) => [
      row.user_id,
      row.user_name,
      row.user_email,
      row.user_course,
      row.user_semester,
      row.rep_question_number,
      row.rep_option_number,
      row.rep_ranking,
      row.rep_option_text,
      row.rep_option_value,
      row.rep_visual_score,
      row.rep_auditory_score,
      row.rep_kinesthetic_score,
      row.rep_auditory_digital_score,
      row.rep_dominant_system,
    ])

  return generateCSV(headers, rows)
}

export function generateComprehensiveCSV(data: any[]): string {
  // Group data by user to create one row per user with all their responses
  const userMap = new Map()

  data.forEach((row) => {
    if (!userMap.has(row.user_id)) {
      userMap.set(row.user_id, {
        user: {
          id: row.user_id,
          name: row.user_name,
          email: row.user_email,
          age: row.user_age,
          gender: row.user_gender,
          city: row.user_city,
          course: row.user_course,
          semester: row.user_semester,
          registration_date: row.registration_date,
        },
        vak: {
          responses: [],
          results: {
            visual_score: row.vak_visual_score,
            auditory_score: row.vak_auditory_score,
            kinesthetic_score: row.vak_kinesthetic_score,
            dominant_style: row.vak_dominant_style,
          },
        },
        ei: {
          responses: [],
          results: {
            self_awareness_score: row.ei_self_awareness_score,
            managing_emotions_score: row.ei_managing_emotions_score,
            motivating_oneself_score: row.ei_motivating_oneself_score,
            empathy_score: row.ei_empathy_score,
            social_skill_score: row.ei_social_skill_score,
            total_score: row.ei_total_score,
          },
        },
        rep: {
          responses: [],
          results: {
            visual_score: row.rep_visual_score,
            auditory_score: row.rep_auditory_score,
            kinesthetic_score: row.rep_kinesthetic_score,
            auditory_digital_score: row.rep_auditory_digital_score,
            dominant_system: row.rep_dominant_system,
          },
        },
        completion: {
          vak_completed: row.vak_completed,
          ei_completed: row.ei_completed,
          rep_system_completed: row.rep_system_completed,
          all_completed: row.all_completed,
          completion_date: row.completion_date,
        },
      })
    }

    const userData = userMap.get(row.user_id)

    if (row.vak_question_number) {
      userData.vak.responses.push({
        question: row.vak_question_number,
        selected: row.vak_selected_value,
      })
    }

    if (row.ei_statement_number) {
      userData.ei.responses.push({
        statement: row.ei_statement_number,
        rating: row.ei_rating,
      })
    }

    if (row.rep_question_number) {
      userData.rep.responses.push({
        question: row.rep_question_number,
        option: row.rep_option_number,
        ranking: row.rep_ranking,
        value: row.rep_option_value,
      })
    }
  })

  // Generate headers
  const headers = [
    "User ID",
    "Name",
    "Email",
    "Age",
    "Gender",
    "City",
    "Course",
    "Semester",
    "Registration Date",
    // VAK Results
    "VAK Visual Score",
    "VAK Auditory Score",
    "VAK Kinesthetic Score",
    "VAK Dominant Style",
    // VAK Responses (Q1-Q5)
    "VAK Q1",
    "VAK Q2",
    "VAK Q3",
    "VAK Q4",
    "VAK Q5",
    // EI Results
    "EI Self Awareness",
    "EI Managing Emotions",
    "EI Motivating Oneself",
    "EI Empathy",
    "EI Social Skill",
    "EI Total",
    // EI Responses (first 10 for brevity)
    ...Array.from({ length: 10 }, (_, i) => `EI S${i + 1}`),
    // Rep System Results
    "Rep Visual",
    "Rep Auditory",
    "Rep Kinesthetic",
    "Rep Auditory Digital",
    "Rep Dominant",
    // Completion Status
    "VAK Completed",
    "EI Completed",
    "Rep Completed",
    "All Completed",
    "Completion Date",
  ]

  const rows = Array.from(userMap.values()).map((userData) => {
    const vakResponses = Array.from({ length: 5 }, (_, i) => {
      const response = userData.vak.responses.find((r: any) => r.question === i + 1)
      return response ? response.selected : ""
    })

    const eiResponses = Array.from({ length: 10 }, (_, i) => {
      const response = userData.ei.responses.find((r: any) => r.statement === i + 1)
      return response ? response.rating : ""
    })

    return [
      userData.user.id,
      userData.user.name,
      userData.user.email,
      userData.user.age,
      userData.user.gender,
      userData.user.city,
      userData.user.course,
      userData.user.semester,
      formatDate(userData.user.registration_date),
      userData.vak.results.visual_score || "",
      userData.vak.results.auditory_score || "",
      userData.vak.results.kinesthetic_score || "",
      userData.vak.results.dominant_style || "",
      ...vakResponses,
      userData.ei.results.self_awareness_score || "",
      userData.ei.results.managing_emotions_score || "",
      userData.ei.results.motivating_oneself_score || "",
      userData.ei.results.empathy_score || "",
      userData.ei.results.social_skill_score || "",
      userData.ei.results.total_score || "",
      ...eiResponses,
      userData.rep.results.visual_score || "",
      userData.rep.results.auditory_score || "",
      userData.rep.results.kinesthetic_score || "",
      userData.rep.results.auditory_digital_score || "",
      userData.rep.results.dominant_system || "",
      userData.completion.vak_completed ? "Yes" : "No",
      userData.completion.ei_completed ? "Yes" : "No",
      userData.completion.rep_system_completed ? "Yes" : "No",
      userData.completion.all_completed ? "Yes" : "No",
      userData.completion.completion_date ? formatDate(userData.completion.completion_date) : "N/A",
    ]
  })

  return generateCSV(headers, rows)
}

function generateCSV(headers: string[], rows: any[][]): string {
  const csvRows = [headers, ...rows]
  return csvRows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString()
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
