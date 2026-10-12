import type { APIRoute } from 'astro';
import { homeOgImage } from '../../../lib/og';

export const GET: APIRoute = () => homeOgImage('es');
