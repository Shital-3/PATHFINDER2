CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    education VARCHAR(200) NOT NULL,
    cgpa NUMERIC(4,2),
    skills JSONB NOT NULL DEFAULT '[]',
    interests JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS career_dilemmas (
    id UUID PRIMARY KEY,
    profile_id UUID REFERENCES student_profiles(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    options JSONB NOT NULL,
    constraints_json JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY,
    profile_id UUID REFERENCES student_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGSERIAL PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('student', 'assistant')),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessment_results (
    id UUID PRIMARY KEY,
    profile_id UUID REFERENCES student_profiles(id) ON DELETE SET NULL,
    total_questions INT NOT NULL,
    answered_questions INT NOT NULL,
    correct_answers INT NOT NULL,
    score_percentage NUMERIC(5,2) NOT NULL,
    result_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS career_comparisons (
    id UUID PRIMARY KEY,
    profile_id UUID NULL REFERENCES student_profiles(id) ON DELETE SET NULL,
    options_json JSONB NOT NULL,
    comparison_json JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS career_comparisons (
    id UUID PRIMARY KEY,
    profile_id UUID NULL REFERENCES student_profiles(id) ON DELETE SET NULL,
    options_json JSONB NOT NULL,
    comparison_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS career_roadmaps (
    id UUID PRIMARY KEY,
    comparison_id UUID NOT NULL REFERENCES career_comparisons(id) ON DELETE CASCADE,
    roadmap_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);