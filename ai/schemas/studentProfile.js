const studentProfileSchema = {
  education: {
    degree: null,
    branch: null,
    year: null,
    graduationYear: null,
  },

  skills: [],

  projectsAndExperience: {
    projects: [],
    internships: [],
    workExperience: [],
  },

  careerGoal: {
    goal: null,
    interests: [],
  },

  dilemma: {
    problem: null,
    options: [],
  },

  constraints: [],
};

export default studentProfileSchema;