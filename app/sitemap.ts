import { MetadataRoute } from "next";

const SITE_URL =
	process.env.NEXT_PUBLIC_SITE_URL || "https://founderfrequency.com";

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: SITE_URL,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 1.0,
		},
		// Add new pages here as you build them:
		// {
		//   url: `${SITE_URL}/report`,
		//   lastModified: new Date(),
		//   changeFrequency: 'monthly',
		//   priority: 0.8,
		// },
		// {
		//   url: `${SITE_URL}/blog`,
		//   lastModified: new Date(),
		//   changeFrequency: 'weekly',
		//   priority: 0.7,
		// },
	];
}
