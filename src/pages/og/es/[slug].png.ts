import type { APIRoute, GetStaticPaths } from 'astro';
import { getPostListItems } from '../../../lib/content';
import { postOgImage } from '../../../lib/og';

export const getStaticPaths: GetStaticPaths = async () => {
	const posts = await getPostListItems('es');
	return posts.map((post) => ({ params: { slug: post.id }, props: { title: post.title } }));
};

export const GET: APIRoute = ({ props }) => postOgImage('es', props.title);
