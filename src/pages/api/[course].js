import fetchCourses from "../../../lib/fetchCourses";

export default async function handler(req, res) {
  const { course } = req.query;

  const subject = decodeURIComponent(course).split(" ")[0];
  const id = decodeURIComponent(course).split(" ")[1];

  const result = await fetchCourses(subject, id);
  return res.status(200).json({ courses: result });
}
