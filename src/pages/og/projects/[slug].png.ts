import type { APIRoute, GetStaticPaths } from 'astro';
import { getContent } from '../../../lib/cms.server';
import { type Project, projectSlug } from '../../../lib/content';
import { ogPngResponse, renderOgImage } from '../../../lib/og.server';

export const getStaticPaths = (async () => {
  const { projects } = await getContent();

  return projects
    .filter((project) => !project.librarySlug)
    .map((project) => ({
      params: { slug: projectSlug(project) },
      props: { project },
    }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ project: Project }, { slug: string }> = async ({
  props,
}) => {
  const { project } = props;

  const png = await renderOgImage({
    eyebrow: 'PROJECT OVERVIEW',
    meta: project.category,
    title: project.name,
    description: project.description,
    tags: project.tags,
  });

  return ogPngResponse(png);
};
