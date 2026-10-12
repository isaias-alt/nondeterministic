import type { APIRoute, GetStaticPaths } from 'astro';
import { getPostListItems } from '../../lib/content';
import { postOgImage } from '../../lib/og';

export const getStaticPaths: GetStaticPaths = async () => {
	const posts = await getPostListItems('en');
	return posts.map((post) => ({ params: { slug: post.id }, props: { title: post.title } }));
};

export const GET: APIRoute = ({ props }) => postOgImage('en', props.title);
