# Export Refactoring Plan: Achieving Wide Format (One Row Per User)

This document outlines the strategy to refactor the application's export functionality to achieve a "wide" data format, where each user occupies a single row in the CSV, and all quiz questions, answers, results, and demographics are represented as individual columns. This approach will be applied to all export types (Summary, VAK, EI, Rep System, Comprehensive).

## Core Principle

The core principle is to leverage a **Supabase View** as the single source of truth for all export data. This view will pre-process and pivot the data into the desired wide format directly in the database. The frontend will then simply query this view and filter/present the data as needed.

## Phase 1: Backend - Create Supabase View (`public.comprehensive_quiz_export`)

**Goal:** Create a database view that consolidates all necessary data into a single row per user, with questions and results as columns.

**Action:** Execute the following SQL query in your Supabase SQL Editor.

```sql
CREATE OR REPLACE VIEW public.comprehensive_quiz_export AS
SELECT
    u.id AS user_id,
    u.name AS user_name,
    u.email AS user_email,
    u.age AS user_age,
    u.gender AS user_gender,
    u.city AS user_city,
    u.course_name AS user_course_name,
    u.semester AS user_semester,
    u.created_at AS user_registration_date,
    qs.id AS session_id,
    qs.started_at AS session_started_at,

    -- VAK Responses (Q1-Q5)
    MAX(CASE WHEN vr.question_number = 1 THEN vr.selected_value END) AS vak_q1_selected_value,
    MAX(CASE WHEN vr.question_number = 2 THEN vr.selected_value END) AS vak_q2_selected_value,
    MAX(CASE WHEN vr.question_number = 3 THEN vr.selected_value END) AS vak_q3_selected_value,
    MAX(CASE WHEN vr.question_number = 4 THEN vr.selected_value END) AS vak_q4_selected_value,
    MAX(CASE WHEN vr.question_number = 5 THEN vr.selected_value END) AS vak_q5_selected_value,

    -- VAK Results
    MAX(vkr.visual_score) AS vak_visual_score,
    MAX(vkr.auditory_score) AS vak_auditory_score,
    MAX(vkr.kinesthetic_score) AS vak_kinesthetic_score,
    MAX(vkr.dominant_style) AS vak_dominant_style,

    -- EI Responses (S1-S50)
    MAX(CASE WHEN eir.question_number = 1 THEN eir.response_value END) AS ei_s1_response_value,
    MAX(CASE WHEN eir.question_number = 2 THEN eir.response_value END) AS ei_s2_response_value,
    MAX(CASE WHEN eir.question_number = 3 THEN eir.response_value END) AS ei_s3_response_value,
    MAX(CASE WHEN eir.question_number = 4 THEN eir.response_value END) AS ei_s4_response_value,
    MAX(CASE WHEN eir.question_number = 5 THEN eir.response_value END) AS ei_s5_response_value,
    MAX(CASE WHEN eir.question_number = 6 THEN eir.response_value END) AS ei_s6_response_value,
    MAX(CASE WHEN eir.question_number = 7 THEN eir.response_value END) AS ei_s7_response_value,
    MAX(CASE WHEN eir.question_number = 8 THEN eir.response_value END) AS ei_s8_response_value,
    MAX(CASE WHEN eir.question_number = 9 THEN eir.response_value END) AS ei_s9_response_value,
    MAX(CASE WHEN eir.question_number = 10 THEN eir.response_value END) AS ei_s10_response_value,
    MAX(CASE WHEN eir.question_number = 11 THEN eir.response_value END) AS ei_s11_response_value,
    MAX(CASE WHEN eir.question_number = 12 THEN eir.response_value END) AS ei_s12_response_value,
    MAX(CASE WHEN eir.question_number = 13 THEN eir.response_value END) AS ei_s13_response_value,
    MAX(CASE WHEN eir.question_number = 14 THEN eir.response_value END) AS ei_s14_response_value,
    MAX(CASE WHEN eir.question_number = 15 THEN eir.response_value END) AS ei_s15_response_value,
    MAX(CASE WHEN eir.question_number = 16 THEN eir.response_value END) AS ei_s16_response_value,
    MAX(CASE WHEN eir.question_number = 17 THEN eir.response_value END) AS ei_s17_response_value,
    MAX(CASE WHEN eir.question_number = 18 THEN eir.response_value END) AS ei_s18_response_value,
    MAX(CASE WHEN eir.question_number = 19 THEN eir.response_value END) AS ei_s19_response_value,
    MAX(CASE WHEN eir.question_number = 20 THEN eir.response_value END) AS ei_s20_response_value,
    MAX(CASE WHEN eir.question_number = 21 THEN eir.response_value END) AS ei_s21_response_value,
    MAX(CASE WHEN eir.question_number = 22 THEN eir.response_value END) AS ei_s22_response_value,
    MAX(CASE WHEN eir.question_number = 23 THEN eir.response_value END) AS ei_s23_response_value,
    MAX(CASE WHEN eir.question_number = 24 THEN eir.response_value END) AS ei_s24_response_value,
    MAX(CASE WHEN eir.question_number = 25 THEN eir.response_value END) AS ei_s25_response_value,
    MAX(CASE WHEN eir.question_number = 26 THEN eir.response_value END) AS ei_s26_response_value,
    MAX(CASE WHEN eir.question_number = 27 THEN eir.response_value END) AS ei_s27_response_value,
    MAX(CASE WHEN eir.question_number = 28 THEN eir.response_value END) AS ei_s28_response_value,
    MAX(CASE WHEN eir.question_number = 29 THEN eir.response_value END) AS ei_s29_response_value,
    MAX(CASE WHEN eir.question_number = 30 THEN eir.response_value END) AS ei_s30_response_value,
    MAX(CASE WHEN eir.question_number = 31 THEN eir.response_value END) AS ei_s31_response_value,
    MAX(CASE WHEN eir.question_number = 32 THEN eir.response_value END) AS ei_s32_response_value,
    MAX(CASE WHEN eir.question_number = 33 THEN eir.response_value END) AS ei_s33_response_value,
    MAX(CASE WHEN eir.question_number = 34 THEN eir.response_value END) AS ei_s34_response_value,
    MAX(CASE WHEN eir.question_number = 35 THEN eir.response_value END) AS ei_s35_response_value,
    MAX(CASE WHEN eir.question_number = 36 THEN eir.response_value END) AS ei_s36_response_value,
    MAX(CASE WHEN eir.question_number = 37 THEN eir.response_value END) AS ei_s37_response_value,
    MAX(CASE WHEN eir.question_number = 38 THEN eir.response_value END) AS ei_s38_response_value,
    MAX(CASE WHEN eir.question_number = 39 THEN eir.response_value END) AS ei_s39_response_value,
    MAX(CASE WHEN eir.question_number = 40 THEN eir.response_value END) AS ei_s40_response_value,
    MAX(CASE WHEN eir.question_number = 41 THEN eir.response_value END) AS ei_s41_response_value,
    MAX(CASE WHEN eir.question_number = 42 THEN eir.response_value END) AS ei_s42_response_value,
    MAX(CASE WHEN eir.question_number = 43 THEN eir.response_value END) AS ei_s43_response_value,
    MAX(CASE WHEN eir.question_number = 44 THEN eir.response_value END) AS ei_s44_response_value,
    MAX(CASE WHEN eir.question_number = 45 THEN eir.response_value END) AS ei_s45_response_value,
    MAX(CASE WHEN eir.question_number = 46 THEN eir.response_value END) AS ei_s46_response_value,
    MAX(CASE WHEN eir.question_number = 47 THEN eir.response_value END) AS ei_s47_response_value,
    MAX(CASE WHEN eir.question_number = 48 THEN eir.response_value END) AS ei_s48_response_value,
    MAX(CASE WHEN eir.question_number = 49 THEN eir.response_value END) AS ei_s49_response_value,
    MAX(CASE WHEN eir.question_number = 50 THEN eir.response_value END) AS ei_s50_response_value,

    -- EI Results
    MAX(eir_res.self_awareness_score) AS ei_self_awareness_score,
    MAX(eir_res.managing_emotions_score) AS ei_managing_emotions_score,
    MAX(eir_res.motivating_oneself_score) AS ei_motivating_oneself_score,
    MAX(eir_res.empathy_score) AS ei_empathy_score,
    MAX(eir_res.social_skill_score) AS ei_social_skill_score,
    MAX(eir_res.total_score) AS ei_total_score,
    MAX(eir_res.self_awareness_classification) AS ei_self_awareness_classification,
    MAX(eir_res.managing_emotions_classification) AS ei_managing_emotions_classification,
    MAX(eir_res.motivating_oneself_classification) AS ei_motivating_oneself_classification,
    MAX(eir_res.empathy_classification) AS ei_empathy_classification,
    MAX(eir_res.social_skill_classification) AS ei_social_skill_classification,
    MAX(eir_res.overall_level) AS ei_overall_level,

    -- Rep System Responses (Q1-Q4, each with 4 ranks)
    MAX(CASE WHEN rsr.question_number = 1 THEN rsr.visual_rank END) AS rep_q1_visual_rank,
    MAX(CASE WHEN rsr.question_number = 1 THEN rsr.auditory_rank END) AS rep_q1_auditory_rank,
    MAX(CASE WHEN rsr.question_number = 1 THEN rsr.kinesthetic_rank END) AS rep_q1_kinesthetic_rank,
    MAX(CASE WHEN rsr.question_number = 1 THEN rsr.auditory_digital_rank END) AS rep_q1_auditory_digital_rank,
    MAX(CASE WHEN rsr.question_number = 2 THEN rsr.visual_rank END) AS rep_q2_visual_rank,
    MAX(CASE WHEN rsr.question_number = 2 THEN rsr.auditory_rank END) AS rep_q2_auditory_rank,
    MAX(CASE WHEN rsr.question_number = 2 THEN rsr.kinesthetic_rank END) AS rep_q2_kinesthetic_rank,
    MAX(CASE WHEN rsr.question_number = 2 THEN rsr.auditory_digital_rank END) AS rep_q2_auditory_digital_rank,
    MAX(CASE WHEN rsr.question_number = 3 THEN rsr.visual_rank END) AS rep_q3_visual_rank,
    MAX(CASE WHEN rsr.question_number = 3 THEN rsr.auditory_rank END) AS rep_q3_auditory_rank,
    MAX(CASE WHEN rsr.question_number = 3 THEN rsr.kinesthetic_rank END) AS rep_q3_kinesthetic_rank,
    MAX(CASE WHEN rsr.question_number = 3 THEN rsr.auditory_digital_rank END) AS rep_q3_auditory_digital_rank,
    MAX(CASE WHEN rsr.question_number = 4 THEN rsr.visual_rank END) AS rep_q4_visual_rank,
    MAX(CASE WHEN rsr.question_number = 4 THEN rsr.auditory_rank END) AS rep_q4_auditory_rank,
    MAX(CASE WHEN rsr.question_number = 4 THEN rsr.kinesthetic_rank END) AS rep_q4_kinesthetic_rank,
    MAX(CASE WHEN rsr.question_number = 4 THEN rsr.auditory_digital_rank END) AS rep_q4_auditory_digital_rank,

    -- Rep System Results
    MAX(rsr_res.visual_total) AS rep_visual_total,
    MAX(rsr_res.auditory_total) AS rep_auditory_total,
    MAX(rsr_res.kinesthetic_total) AS rep_kinesthetic_total,
    MAX(rsr_digital_total) AS rep_auditory_digital_total,
    MAX(rsr_res.dominant_system) AS rep_dominant_system,
    MAX(rsr_res.visual_percentage) AS rep_visual_percentage,
    MAX(rsr_res.auditory_percentage) AS rep_auditory_percentage,
    MAX(rsr_res.kinesthetic_percentage) AS rep_kinesthetic_percentage,
    MAX(rsr_res.auditory_digital_percentage) AS rep_auditory_digital_percentage,

    -- Completion Status
    MAX(qs.vak_completed) AS vak_completed,
    MAX(qs.ei_completed) AS ei_completed,
    MAX(qs.rep_system_completed) AS rep_system_completed,
    MAX(qs.all_completed) AS all_completed,
    MAX(qs.completed_at) AS session_completion_date

FROM
    public.users u
JOIN
    public.quiz_sessions qs ON u.id = qs.user_id
LEFT JOIN
    public.vak_responses vr ON qs.id = vr.session_id
LEFT JOIN
    public.vak_results vkr ON qs.id = vkr.session_id
LEFT JOIN
    public.ei_responses eir ON qs.id = eir.session_id
LEFT JOIN
    public.ei_results eir_res ON qs.id = eir_res.session_id
LEFT JOIN
    public.rep_system_responses rsr ON qs.id = rsr.session_id
LEFT JOIN
    public.rep_system_results rsr_res ON qs.id = rsr_res.session_id
GROUP BY
    u.id, u.name, u.email, u.age, u.gender, u.city, u.course_name, u.semester, u.created_at,
    qs.id, qs.started_at
ORDER BY
    u.created_at DESC;
