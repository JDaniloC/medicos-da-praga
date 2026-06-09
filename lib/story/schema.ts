import { z } from "zod";

// ---- Condições ----
export const ConditionSchema: z.ZodType<Condition> = z.lazy(() =>
  z.union([
    z.object({ trait: z.string() }).strict(),
    z.object({ flag: z.string(), value: z.boolean() }).strict(),
    z.object({ hasItem: z.string() }).strict(),
    z.object({ treatment: z.record(z.string(), z.string()) }).strict(),
    z.object({ anyOf: z.array(ConditionSchema) }).strict(),
    z.object({ allOf: z.array(ConditionSchema) }).strict(),
    z.object({ not: ConditionSchema }).strict(),
  ])
);
export type Condition =
  | { trait: string }
  | { flag: string; value: boolean }
  | { hasItem: string }
  | { treatment: Record<string, string> }
  | { anyOf: Condition[] }
  | { allOf: Condition[] }
  | { not: Condition };

// ---- Effects ----
export const EffectSchema = z.union([
  z.object({ setFlag: z.string(), value: z.boolean(), when: ConditionSchema.optional() }).strict(),
  z.object({ grantItem: z.string(), when: ConditionSchema.optional() }).strict(),
  z.object({ setTreatment: z.string(), value: z.string(), when: ConditionSchema.optional() }).strict(),
  z.object({
    setPatient: z.string(),
    value: z.enum(["sucesso", "fracasso"]),
    when: ConditionSchema.optional(),
  }).strict(),
]);
export type Effect = z.infer<typeof EffectSchema>;

// ---- Next ----
export const NextRuleSchema = z.object({
  when: ConditionSchema.optional(),
  goto: z.string().optional(),
  default: z.string().optional(),
}).strict();
export const NextSchema = z.union([z.string(), z.array(NextRuleSchema)]);
export type Next = z.infer<typeof NextSchema>;

// ---- Choice ----
export const ChoiceSchema = z.object({
  id: z.string(),
  label: z.string(),
  requiresTrait: z.string().optional(),
  when: ConditionSchema.optional(),
  effects: z.array(EffectSchema).optional(),
  next: NextSchema,
}).strict();
export type Choice = z.infer<typeof ChoiceSchema>;

// ---- Difficulty / Resolution ----
export const DifficultyRuleSchema = z.object({
  when: ConditionSchema.optional(),
  set: z.number().optional(),
  delta: z.number().optional(),
}).strict();
export const ResolutionSchema = z.object({
  effects: z.array(EffectSchema).optional(),
  goto: NextSchema,
}).strict();

// ---- Nós ----
const BaseNodeFields = {
  id: z.string(),
  image: z.string(),
  narration: z.string(),
  narrationAppend: z
    .array(z.object({ when: ConditionSchema, text: z.string() }).strict())
    .optional(),
};
export const SceneNodeSchema = z.object({
  ...BaseNodeFields, kind: z.literal("scene"), choices: z.array(ChoiceSchema),
}).strict();
export const DiceNodeSchema = z.object({
  ...BaseNodeFields, kind: z.literal("dice"), reason: z.string(),
  difficulty: z.object({ base: z.number(), rules: z.array(DifficultyRuleSchema).optional() }).strict(),
  resolve: z.object({ onSuccess: ResolutionSchema, onFail: ResolutionSchema }).strict(),
}).strict();
export const EndingNodeSchema = z.object({
  ...BaseNodeFields, kind: z.literal("ending"), outcome: z.string(), title: z.string(),
}).strict();
export const NodeSchema = z.discriminatedUnion("kind", [
  SceneNodeSchema, DiceNodeSchema, EndingNodeSchema,
]);
export type SceneNode = z.infer<typeof SceneNodeSchema>;
export type DiceNode = z.infer<typeof DiceNodeSchema>;
export type EndingNode = z.infer<typeof EndingNodeSchema>;
export type StoryNode = z.infer<typeof NodeSchema>;

// ---- Trait + Act ----
export const TraitDefSchema = z.object({
  id: z.string(),
  nome: z.string(),
  descricao: z.string(),
  portrait: z.string(),
  inventarioInicial: z.array(z.string()),
}).strict();
export type TraitDef = z.infer<typeof TraitDefSchema>;

export const StoryActSchema = z.object({
  act: z.number().int(),
  title: z.string(),
  start: z.string(),
  worldContext: z.string(),
  traits: z.array(TraitDefSchema),
  items: z.record(z.string(), z.string()).optional(),
  badges: z.record(z.string(), z.string()).optional(),
  nodes: z.array(NodeSchema),
}).strict();
export type StoryAct = z.infer<typeof StoryActSchema>;
