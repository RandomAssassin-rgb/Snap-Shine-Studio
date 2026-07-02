import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, Trash2, Shuffle, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  shots: HTMLCanvasElement[];
  onChange: (next: HTMLCanvasElement[]) => void;
}

export function SortableShots({ shots, onChange }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
  );
  const ids = shots.map((_, i) => `s-${i}`);

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    const from = ids.indexOf(String(e.active.id));
    const to = ids.indexOf(String(e.over.id));
    if (from < 0 || to < 0) return;
    onChange(arrayMove(shots, from, to));
  };

  const duplicate = (i: number) => {
    const clone = document.createElement("canvas");
    clone.width = shots[i].width; clone.height = shots[i].height;
    clone.getContext("2d")!.drawImage(shots[i], 0, 0);
    const next = [...shots]; next.splice(i + 1, 0, clone); onChange(next);
  };
  const remove = (i: number) => { const n = [...shots]; n.splice(i, 1); onChange(n); };
  const randomize = () => {
    const arr = [...shots];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    onChange(arr);
  };

  if (!shots.length) return null;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gold">Reorder shots</p>
        <Button variant="ghost" size="sm" onClick={randomize}>
          <Shuffle className="mr-1 h-3 w-3" />Randomize
        </Button>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {shots.map((c, i) => (
              <SortableThumb key={ids[i]} id={ids[i]} canvas={c} onDuplicate={() => duplicate(i)} onRemove={() => remove(i)} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableThumb({ id, canvas, onDuplicate, onRemove }: { id: string; canvas: HTMLCanvasElement; onDuplicate: () => void; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="group relative shrink-0">
      <img src={canvas.toDataURL("image/jpeg", 0.5)} className="h-20 w-28 rounded-lg object-cover shadow-tape" alt="Shot thumbnail" />
      <button
        {...attributes} {...listeners}
        className="absolute left-1 top-1 rounded-md bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
        title="Drag"
      >
        <GripVertical className="h-3 w-3" />
      </button>
      <button onClick={onDuplicate} className="absolute right-1 top-1 rounded-md bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100" title="Duplicate">
        <Copy className="h-3 w-3" />
      </button>
      <button onClick={onRemove} className="absolute right-1 bottom-1 rounded-md bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100" title="Remove">
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}
