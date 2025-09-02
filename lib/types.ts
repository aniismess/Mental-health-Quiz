export interface User {
  id: string
  name: string
  email: string
  age: number
  gender: string
  city: string
  course: string
  semester: number
  created_at: string
}

export interface VAKQuestion {
  text: string
  options: {
    label: string
    value: "V" | "A" | "K"
  }[]
}

export interface VAKResponse {
  question_number: number
  question_text: string
  selected_option: string
  selected_value: "V" | "A" | "K"
}

export interface VAKResult {
  visual_score: number
  auditory_score: number
  kinesthetic_score: number
  dominant_style: string
}

export interface EIResponse {
  statement_number: number
  statement_text: string
  rating: number
  category: "SA" | "ME" | "MO" | "E" | "SS"
}

export interface EIResult {
  self_awareness_score: number
  self_awareness_classification: string
  managing_emotions_score: number
  managing_emotions_classification: string
  motivating_oneself_score: number
  motivating_oneself_classification: string
  empathy_score: number
  empathy_classification: string
  social_skill_score: number
  social_skill_classification: string
  total_score: number
}

export interface RepSystemResponse {
  question_number: number
  option_number: number
  ranking: number
  option_text: string
  option_value: "V" | "A" | "K" | "Ad"
}

export interface RepSystemResult {
  visual_score: number
  auditory_score: number
  kinesthetic_score: number
  auditory_digital_score: number
  dominant_system: string
}

export interface QuizCompletion {
  vak_completed: boolean
  ei_completed: boolean
  rep_system_completed: boolean
  all_completed: boolean
}
