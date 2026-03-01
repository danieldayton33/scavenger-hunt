/**
 * Generates Dart models from Zod schemas (mobile API).
 * Run from scavenger-hunt: pnpm typegen:mobile
 * Writes a combined JSON Schema to frog_hunt_mobile then runs quicktype to generate Dart.
 */
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import {
  mobileUserSchema,
  huntListItemSchema,
  huntDetailSchema,
  huntItemWithSubmissionSchema,
  submissionSchema,
  progressSchema,
  createSubmissionBodySchema,
  scoreboardEntrySchema,
  scoreboardResponseSchema,
  requestLinkCodeResponseSchema,
  linkFirebaseResponseSchema,
  mobileApiErrorSchema,
} from '../lib/schemas/mobileApi';
import { linkFirebaseBodySchema } from '../lib/validators/mobile';

const FLUTTER_LIB = path.resolve(__dirname, '../../frog_hunt_mobile/lib');
const GENERATED_DIR = path.join(FLUTTER_LIB, 'generated');

const SCHEMAS: { name: string; schema: z.ZodType }[] = [
  { name: 'MobileUser', schema: mobileUserSchema },
  { name: 'HuntListItem', schema: huntListItemSchema },
  { name: 'HuntDetail', schema: huntDetailSchema },
  { name: 'HuntItemWithSubmission', schema: huntItemWithSubmissionSchema },
  { name: 'Submission', schema: submissionSchema },
  { name: 'Progress', schema: progressSchema },
  { name: 'CreateSubmissionBody', schema: createSubmissionBodySchema },
  { name: 'ScoreboardEntry', schema: scoreboardEntrySchema },
  { name: 'ScoreboardResponse', schema: scoreboardResponseSchema },
  { name: 'RequestLinkCodeResponse', schema: requestLinkCodeResponseSchema },
  { name: 'LinkFirebaseBody', schema: linkFirebaseBodySchema },
  { name: 'LinkFirebaseResponse', schema: linkFirebaseResponseSchema },
  { name: 'MobileApiError', schema: mobileApiErrorSchema },
];

const toJSONSchema = (z as unknown as { toJSONSchema: (s: z.ZodType, o?: object) => object }).toJSONSchema;

function main() {
  if (!fs.existsSync(FLUTTER_LIB)) {
    console.error('Flutter lib not found at', FLUTTER_LIB);
    process.exit(1);
  }
  if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
  }

  const options = { unrepresentable: 'any' as const };
  const defs: Record<string, object> = {};

  for (const { name, schema } of SCHEMAS) {
    try {
      const jsonSchema = toJSONSchema(schema, options) as object;
      defs[name] = jsonSchema;
    } catch (e) {
      console.error('Failed to generate JSON Schema for', name, e);
      process.exit(1);
    }
  }

  // Combined schema so quicktype generates all classes (root references $defs)
  const combinedSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    description: 'Mobile API types',
    properties: Object.fromEntries(SCHEMAS.map((s) => [s.name, { $ref: `#/$defs/${s.name}` }])),
    $defs: defs,
  };

  const schemaPath = path.join(GENERATED_DIR, 'mobile_api.schema.json');
  fs.writeFileSync(schemaPath, JSON.stringify(combinedSchema, null, 2));
  console.log('Wrote', schemaPath);

  const dartOutPath = path.join(GENERATED_DIR, 'api_models.dart');
  const cwd = path.resolve(__dirname, '../..');
  const { execSync } = require('child_process');
  try {
    execSync(
      `npx quicktype --src-lang schema --lang dart --out "${dartOutPath}" "${path.relative(cwd, schemaPath)}"`,
      { cwd, stdio: 'inherit' }
    );
    // Prepend ignore for enum constant names (quicktype uses UPPER_CASE; Dart lint prefers lowerCamelCase)
    const dartContent = fs.readFileSync(dartOutPath, 'utf-8');
    if (!dartContent.startsWith('// ignore_for_file:')) {
      fs.writeFileSync(
        dartOutPath,
        '// ignore_for_file: constant_identifier_names\n\n' + dartContent
      );
    }
    console.log('Generated', dartOutPath);
  } catch (e) {
    console.error('quicktype failed', e);
    process.exit(1);
  }
}

main();
