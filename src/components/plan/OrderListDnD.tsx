'use client';

import * as React from 'react';
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Pencil,
  Trash2,
} from 'lucide-react';

export type OrderItem = {
  id: string;
  label?: string | null;
  secondary?: string | null;
};

type Props = {
  items: OrderItem[];
  onReorder: (next: OrderItem[]) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  dense?: boolean;
};

export default function OrderListDnD({ items, onReorder, onEdit, onDelete, dense }: Props) {
  const dragIndex = React.useRef<number | null>(null);

  function move(from: number, to: number) {
    if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return;
    const next = [...items];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    onReorder(next);
  }

  const onDragStart = (i: number) => (event: React.DragEvent<HTMLLIElement>) => {
    dragIndex.current = i;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(i));
  };

  const onDragOver = (_i: number) => (event: React.DragEvent<HTMLLIElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (i: number) => (event: React.DragEvent<HTMLLIElement>) => {
    event.preventDefault();
    const fromStr = event.dataTransfer.getData('text/plain');
    const from = dragIndex.current ?? (fromStr ? Number(fromStr) : -1);
    dragIndex.current = null;
    if (from >= 0) move(from, i);
  };

  const onDragEnd = () => {
    dragIndex.current = null;
  };

  const onKeyReorder = (i: number) => (event: React.KeyboardEvent<HTMLLIElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      move(i, Math.max(0, i - 1));
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      move(i, Math.min(items.length - 1, i + 1));
    }
  };

  return (
    <ul className={`neo-sortable${dense ? ' neo-sortable--dense' : ''}`} role="list">
      {items.map((item, index) => (
        <li
          key={item.id}
          className="neo-sortable__item"
          draggable
          onDragStart={onDragStart(index)}
          onDragOver={onDragOver(index)}
          onDrop={onDrop(index)}
          onDragEnd={onDragEnd}
          onKeyDown={onKeyReorder(index)}
          tabIndex={0}
          aria-grabbed={dragIndex.current === index || undefined}
        >
          <span className="neo-sortable__handle" aria-hidden>
            <GripVertical size={16} strokeWidth={2} />
          </span>

          <div className="neo-sortable__body">
            <span className="neo-sortable__title">{item.label ?? 'Elemento'}</span>
            {item.secondary && <span className="neo-sortable__subtitle">{item.secondary}</span>}
          </div>

          <div className="neo-sortable__actions">
            {onEdit && (
              <button
                type="button"
                className="neo-icon-button"
                onClick={() => onEdit(item.id)}
                aria-label="Editar"
              >
                <Pencil size={16} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="neo-icon-button"
                onClick={() => onDelete(item.id)}
                aria-label="Apagar"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button
              type="button"
              className="neo-icon-button"
              onClick={() => move(index, Math.max(0, index - 1))}
              aria-label="Mover para cima"
              disabled={index === 0}
            >
              <ArrowUp size={16} />
            </button>
            <button
              type="button"
              className="neo-icon-button"
              onClick={() => move(index, Math.min(items.length - 1, index + 1))}
              aria-label="Mover para baixo"
              disabled={index === items.length - 1}
            >
              <ArrowDown size={16} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
