// components/builder/NodeEditor.tsx
// Painel de edição de um nó: campos comuns + editor específico do kind.
"use client";

import type { StoryAct, StoryNode } from "@/lib/story/schema";
import { Badge } from "./ui";
import { NodeCommonFields } from "./NodeCommonFields";
import { NarrationAppendEditor } from "./NarrationAppendEditor";
import { EndingNodeEditor } from "./EndingNodeEditor";
import { SceneNodeEditor } from "./SceneNodeEditor";

const KIND_LABEL: Record<StoryNode["kind"], string> = {
  scene: "Cena (escolhas)", dice: "Teste de dado (d20)", ending: "Final",
};

export function NodeEditor({
  act, node, onChangeNode, onRename,
}: {
  act: StoryAct;
  node: StoryNode;
  onChangeNode: (node: StoryNode) => void;
  onRename: (oldId: string, newId: string) => void;
}) {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Badge tone="accent">{KIND_LABEL[node.kind]}</Badge>
        {act.start === node.id && <Badge tone="success">★ nó inicial</Badge>}
      </div>
      <NodeCommonFields
        key={node.id}
        act={act}
        node={node}
        onChangeNode={onChangeNode}
        onRename={onRename}
      />
      <NarrationAppendEditor
        act={act}
        value={node.narrationAppend}
        onChange={(narrationAppend) => onChangeNode({ ...node, narrationAppend })}
      />
      <hr className="border-edge" />
      {node.kind === "ending" && (
        <EndingNodeEditor act={act} node={node} onChangeNode={onChangeNode} />
      )}
      {node.kind === "scene" && (
        <SceneNodeEditor act={act} node={node} onChangeNode={onChangeNode} />
      )}
      {node.kind === "dice" && (
        <p className="text-sm text-ink-soft">Editor de teste de dado em construção.</p>
      )}
    </div>
  );
}
