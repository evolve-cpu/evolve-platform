import FeaturePage from "./FeaturePage";
import {
  daily_news,
  microlessons,
  skill_quizzes
} from "../../assets/images/ecosystem";

const FEATURES = [
  {
    title: "Daily News",
    image: daily_news,
    desc: "Handpicked headlines and emerging trends summarized for fast reading."
  },
  {
    title: "Microlessons",
    image: microlessons,
    desc: "Short, actionable lessons covering practical concepts and systems."
  },
  {
    title: "Skill Quizzes",
    image: skill_quizzes,
    desc: "Quick knowledge checks to test understanding and track your learning streak."
  }
];

const Grow = () => (
  <FeaturePage
    seo={{
      title: "Grow — the daily upskill engine | evolve",
      description:
        "Daily design news, microlessons and quick skill quizzes. Small, focused sessions that fit into your day and add up to real progress.",
      path: "/grow"
    }}
    eyebrow="Coming soon..."
    title="The Daily Upskill Engine"
    intro="Dive into your daily learning loop. Complete microlesson, test your recall with a quick quiz, and catch up on essential design news before your workday starts."
    features={FEATURES}
    variant="compact"
  />
);

export default Grow;
