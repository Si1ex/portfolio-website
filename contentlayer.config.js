import { defineDocumentType, makeSource } from "contentlayer/source-files";
import { Redis } from "ioredis";

const redis = Redis.fromEnv();

/** @type {import('contentlayer/source-files').ComputedFields} */
const computedFields = {
  path: {
    type: "string",
    resolve: (doc) => `/${doc._raw.flattenedPath}`,
  },
  slug: {
    type: "string",
    resolve: (doc) => doc._raw.flattenedPath.split("/").slice(1).join("/"),
  },
};

export const Project = defineDocumentType(() => ({
  name: "Project",
  contentType: "mdx",
  fields: {
    // Define your fields based on the structure of your project data
    published: {
      type: "boolean",
    },
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
      required: true,
    },
    date: {
      type: "date",
    },
    url: {
      type: "string",
    },
    repository: {
      type: "string",
    },
  },
  computedFields,
}));

export const Page = defineDocumentType(() => ({
  name: "Page",
  contentType: "mdx",
  fields: {
    title: {
      type: "string",
      required: true,
    },
    description: {
      type: "string",
    },
  },
  computedFields,
}));

export default makeSource({
  contentDirPath: "./content",
  documentTypes: [Page, Project],
  mdx: {
    // Add your mdx configuration here, if needed
  },
  fetchData: async () => {
	try {
	  const projectKeys = await redis.keys("pageviews:projects:*");
	  console.log("Project Keys:", projectKeys);
	  const projects = await Promise.all(
		projectKeys.map(async (key) => {
		  const projectData = await redis.get(key);
		  console.log("Project Data:", projectData);
		  return JSON.parse(projectData);
		})
	  );
	  console.log("Fetched Projects:", projects);
	  return projects;
	} catch (error) {
	  console.error("Error fetching project data from Upstash:", error);
	  return [];
	}
  },
  
});
