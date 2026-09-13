/**
 * OpenAPI Setup
 * 
 * Extends Zod with OpenAPI methods before any schemas are imported.
 */

import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);