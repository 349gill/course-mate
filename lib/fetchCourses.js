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

    const description = $("h5.mt-0").next().next().text().trim();
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
