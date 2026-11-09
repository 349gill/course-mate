import fetchCourses from "../../../lib/fetchCourses";

export default async function handler(req, res) {
  const subject = decodeURIComponent(req.query.course).split(" ")[0];
  const id = decodeURIComponent(req.query.course).split(" ")[1];
  if (!/^[A-Z]{2,6}$/.test(subject) || !/^\d{3}[A-Z]?$/.test(id)) {
    return res.status(400).json({ error: "Invalid course format" });
  }

  const result = await fetchCourses(subject, id);
  return res.status(200).json({ courses: result });
}