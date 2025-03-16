import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [""].map((route) => ({
    url: `https://locarater.com${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: 1,
  }));

  return [...routes];
}
