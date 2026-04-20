import axios from "axios";
import * as cheerio from "cheerio";

const fetchCourses = async (subject, course) => {
  try {
    const { data } = await axios.get(
      "https://apps.ualberta.ca/catalogue/course/" + subject + "/" + course
    );

    const $ = cheerio.load(data);

    const courses = {
      corequisites: [],
      prerequisites: [],
    };

    // The catalogue markup changed (old `h5.mt-0` selector no longer exists).
    // Prerequisite text now lives in a plain <p> inside the course container.
    // Collect paragraph texts and prefer one mentioning prerequisites.
    const paragraphs = $("p")
      .map((_, el) => $(el).text().trim().replace(/\s+/g, " "))
      .get()
      .filter(Boolean);

    let description =
      paragraphs.find((t) => /Prerequisite/i.test(t)) ||
      paragraphs.join(" ");

    // Fallback to main/body text if no <p> matched (e.g. markup changes again)
    if (!description) {
      description = ($("main").text() || $("body").text())
        .trim()
        .replace(/\s+/g, " ");
    }
    const preq = description.match(/Prerequisite[s]?:\s*(.*?)(\.)/);
    const core = description.match(/Corequisite[s]?:\s*(.*?)(\.)/);

    preq &&
      courses.prerequisites.push(
        ...preq[1].split(";").map((item) => item.trim())
      );
    core &&
      courses.corequisites.push(
        ...core[1].split(";").map((item) => item.trim())
      );

    return courses;
  } catch (error) {
    throw error;
  }
};

export default fetchCourses;
