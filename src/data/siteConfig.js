import myOwnSchoolImage from "../assets/my-own-school.jpg";

const MY_OWN_SCHOOL_IMG_URL = myOwnSchoolImage;

export const PROFILE = {
  name: "Nishchaya Sharma",
  role: "Data Scientist / ML Engineer / AI Engineer",
  tagline: "Building intelligent systems from data to deployment with clear impact.",
  location: "Jaipur, India",
  email: "nishchayasharma15@gmail.com",
  github: "https://github.com/",
  linkedin: "https://www.linkedin.com/",
  resumeUrl: "#",
};

export const HERO_ROLES = ["Data Scientist", "ML Engineer", "AI Engineer"];

export const ABOUT_CONTENT = {
  paragraph:
    "I build end-to-end machine learning solutions, from problem framing and data preparation to model training, evaluation, and deployment. I enjoy turning messy datasets into reliable features, shipping lightweight inference APIs, and tracking model performance over time. I care about clean, reproducible workflows and clear communication that helps teams act with confidence.",
  cards: [
    {
      title: "Data and Features",
      body: "SQL-first data pulls, Python preprocessing, validation, and feature engineering that stays consistent between training and inference.",
    },
    {
      title: "Modeling",
      body: "scikit-learn pipelines, tuning, and evaluation with metrics that map to the product goal, plus explainability when it matters.",
    },
    {
      title: "Deploy and Iterate",
      body: "Dockerized services, simple APIs, versioned artifacts, and monitoring so models can improve safely and predictably.",
    },
  ],
};

export const CONTACT_FORM_ACTION = "https://formsubmit.co/nishchayasharma15@gmail.com";

export const PROJECTS = [
  {
    title: "Retail Sales Insights",
    type: "Analytics",
    blurb:
      "Exploratory analysis and KPI dashboard for multi-store retail sales with clean, decision-ready reporting.",
    impact:
      "Surfaced the top drivers behind weekly revenue swings and streamlined reporting into one dashboard.",
    tags: ["Python", "Pandas", "SQL", "Power BI"],
    links: { demo: "#", repo: "#" },
  },
  {
    title: "Customer Churn Predictor",
    type: "Machine Learning",
    blurb:
      "Baseline churn model with explainability and segmentation to help prioritize retention actions.",
    impact:
      "Improved churn recall and delivered actionable segments for targeted outreach and offers.",
    tags: ["Python", "scikit-learn", "EDA", "Storytelling"],
    links: { demo: "#", repo: "#" },
  },
  {
    title: "Movie Recommendation System",
    type: "AI / ML",
    blurb:
      "Interactive recommender app that suggests movies based on similarity and user selection, deployed on Hugging Face Spaces.",
    impact:
      "Shipped a usable ML demo with a clean interface so anyone can test recommendations instantly.",
    tags: ["Python", "Machine Learning", "Recommender Systems", "Streamlit", "Hugging Face"],
    links: {
      demo: "https://huggingface.co/spaces/shinzobolte/Movie-recommendation-system",
      repo: "https://huggingface.co/spaces/shinzobolte/Movie-recommendation-system",
    },
  },
];

export const DASHBOARDS = [
  { title: "Sales Pulse Dashboard", type: "Power BI", url: "#" },
  { title: "Marketing Funnel Dashboard", type: "Tableau", url: "#" },
];

export const EXPERIENCE = [
  {
    company: "JDA",
    role: "Web Developer",
    period: "",
    location: "Jaipur, India",
    bullets: [
      "Built responsive UI components and reusable layouts with clean HTML, CSS, and JavaScript.",
      "Collaborated with the team to ship web pages that matched design and performance needs.",
    ],
  },
  {
    company: "JDA",
    role: "Software Engineer",
    period: "",
    location: "Jaipur, India",
    bullets: [
      "Implemented application features and fixed bugs across the stack.",
      "Worked with version control and documented updates for smoother handoffs.",
    ],
  },
  {
    company: "Tag11softech",
    role: "Full Stack Web Developer",
    period: "",
    location: "Jaipur, India",
    bullets: [
      "Developed full stack features with clean UI and reliable API connections.",
      "Optimized pages for performance and consistent user experience.",
    ],
  },
];

export const SKILL_GROUPS = [
  {
    title: "Foundations",
    blurb: "Core analysis, stats, and experimentation basics.",
    items: ["Python", "SQL", "Data Cleaning", "EDA", "Data Storytelling"],
  },
  {
    title: "Machine Learning",
    blurb: "Modeling, features, and evaluation for real datasets.",
    items: [
      "scikit-learn",
      "XGBoost",
      "Feature Engineering",
      "Model Evaluation",
      "Hyperparameter Tuning",
      "Pipelines",
    ],
  },
  {
    title: "Deep Learning",
    blurb: "Neural models for language, vision, and sequence tasks.",
    items: ["PyTorch", "TensorFlow", "Neural Networks", "CNNs", "RNNs", "NLP"],
  },
  {
    title: "AI Engineering",
    blurb: "LLM applications, retrieval, and responsible AI systems.",
    items: [
      "Transformers",
      "LLMs",
      "Prompt Engineering",
      "RAG",
      "Vector Databases",
      "Embeddings",
      "Evaluation",
    ],
  },
  {
    title: "MLOps and Deployment",
    blurb: "Packaging, serving, and tracking models in production.",
    items: ["Docker", "FastAPI", "MLflow", "Git", "CI/CD", "Model Serving", "Monitoring"],
  },
  {
    title: "Visualization",
    blurb: "Clear charts and stakeholder-ready dashboards.",
    items: ["Matplotlib", "Seaborn"],
  },
];

export const JKLU_IMG_URL =
  "https://upload.wikimedia.org/wikipedia/commons/e/ef/JK_Lakshmipat_University.jpg";

export const EDUCATION = [
  {
    school: "JK Lakshmipat University (JKLU)",
    degree: "B.Tech - Computer Science and Engineering",
    period: "2021-2025",
    details:
      "Focused on machine learning, data science, and building projects that connect models to real user needs.",
    typeLabel: "College",
    location: "Jaipur, Rajasthan",
    imageUrl: JKLU_IMG_URL,
    imageAlt: "JK Lakshmipat University campus",
  },
  {
    school: "My Own School",
    degree: "High School (CBSE)",
    period: "Completed",
    details: "Strong foundation in Science and Mathematics.",
    typeLabel: "School",
    location: "Shyam Nagar, Jaipur",
    imageUrl: MY_OWN_SCHOOL_IMG_URL,
    imageAlt: "My Own School building",
  },
];

export const CERTIFICATIONS = [
  {
    title: "Machine Learning Specialization",
    issuer: "Coursera",
    year: "2024",
    credentialUrl: "#",
  },
  {
    title: "Deep Learning Fundamentals",
    issuer: "Udemy",
    year: "2024",
    credentialUrl: "#",
  },
];

export const SECTION_VISIBILITY = {
  projects: true,
  skills: true,
  about: true,
  experience: true,
  education: true,
  certifications: true,
  contact: true,
};

export const SECTION_SUBTITLES = {
  projects: "A mix of analytics work and developer builds with clean UI and measurable outcomes.",
  projectsAll: "Every project and demo in one place.",
  skills: "My toolkit for building machine learning models and shipping them into real products.",
  about: "",
  experience: "Roles where I shipped insights, dashboards, and analysis workflows.",
  education: "My academic journey",
  certifications: "Verified learning milestones in machine learning, AI, and software engineering.",
  contact: "Send a message and I will get back to you soon.",
};

export const FORMSPARK_FORM_ID = "";
