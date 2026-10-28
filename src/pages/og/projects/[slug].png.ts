import type { APIRoute, GetStaticPaths } from 'astro';
import { getContent } from '../../../lib/cms.server';
import { type Project, projectSlug } from '../../../lib/content';
import { ogPngResponse, renderOgImage } from '../../../lib/og.server';
import { getProjectSpec } from '../../../lib/projects';

export const getStaticPaths = (async () => {
  const { projects } = await getContent();

  return projects.map((project) => ({
    params: { slug: projectSlug(project) },
    props: { project },
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute<{ project: Project }, { slug: string }> = async ({
  props,
}) => {
  const { project } = props;
  const spec = getProjectSpec(project);

  const png = await renderOgImage({
    eyebrow: 'PROJECT OVERVIEW',
    meta: project.category,
    title: project.name,
    description: spec.userSummary,
    tags: project.tags,
  });

  return ogPngResponse(png);
};
