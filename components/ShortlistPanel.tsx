'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store/useAppStore';
import { Recommendation } from '@/lib/prediction/engine';
import CutoffTrendChart from './CutoffTrendChart';
import {
  GripVertical, Star, StarOff, ChevronDown, ChevronUp,
  Trash2, FileDown, Info, MapPin, IndianRupee, BarChart3
} from 'lucide-react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  studentRank: number;
}

function SortableRow({
  rec, index, onRemove, studentRank,
}: {
  rec: Recommendation;
  index: number;
  onRemove: (id: string) => void;
  studentRank: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: rec.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const tierColors: Record<string, string> = {
    Dream: '#f43f5e', Realistic: '#f59e0b', Safe: '#10b981', Reach: '#8b5cf6',
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        marginBottom: '0.625rem',
        background: isDragging ? 'rgba(99,102,241,0.05)' : 'var(--surface-1)',
        border: isDragging ? '1.5px solid rgba(99,102,241,0.3)' : '1px solid var(--surface-border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: isDragging ? 'var(--shadow-brand)' : 'var(--shadow-sm)',
        overflow: 'hidden',
      }}
    >
      {/* Main row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.875rem 1rem',
      }}>
        {/* Drag handle */}
        <div
          className="drag-handle"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={18} />
        </div>

        {/* Priority badge */}
        <span style={{
          flexShrink: 0,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28,
          background: index < 3
            ? `linear-gradient(135deg, ${tierColors[rec.tier] ?? '#6366f1'}, ${tierColors[rec.tier] ?? '#8b5cf6'})`
            : 'var(--surface-3)',
          color: index < 3 ? 'white' : 'var(--text-secondary)',
          borderRadius: '50%',
          fontSize: '0.78rem', fontWeight: 800,
        }}>
          {index + 1}
        </span>

        {/* College info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.1rem' }}>
            {rec.collegeName}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span>{rec.branchName}</span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <MapPin size={10} />{rec.city}
            </span>
          </div>
        </div>

        {/* Cutoff */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', fontVariantNumeric: 'tabular-nums' }}>
            {rec.predictedCutoff.toLocaleString('en-IN')}
          </div>
          <div style={{
            fontSize: '0.7rem', fontWeight: 600,
            color: rec.tier === 'Safe' ? 'var(--color-safe)' : rec.tier === 'Dream' ? 'var(--color-dream)' : 'var(--color-realistic)',
          }}>
            {rec.tier}
          </div>
        </div>

        {/* Expand */}
        <button
          className="btn btn-icon btn-ghost"
          onClick={() => setExpanded(!expanded)}
          title="View details & trend"
        >
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {/* Remove */}
        <button
          className="btn btn-icon"
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none' }}
          onClick={() => onRemove(rec.id)}
          title="Remove from shortlist"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{
          borderTop: '1px solid var(--surface-border)',
          padding: '1rem',
          background: 'var(--surface-2)',
        }} className="animate-fade-in">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}>
            {[
              { label: 'NAAC Grade', value: rec.naac },
              { label: 'Annual Fee', value: `₹${(rec.annualFee / 1000).toFixed(0)}K` },
              { label: 'Avg Package', value: `${rec.avgPackage} LPA` },
              { label: 'Placement Rate', value: `${rec.avgPlacementRate}%` },
              { label: 'Confidence', value: `${Math.round(rec.confidenceScore * 100)}%` },
              { label: 'Admission Prob.', value: `${Math.round(rec.probabilityOfAdmission * 100)}%` },
            ].map(({ label, value }) => (
              <div key={label} style={{
                padding: '0.625rem',
                background: 'var(--surface-1)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--surface-border)',
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{label}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
              </div>
            ))}
          </div>

          <CutoffTrendChart recommendation={rec} studentRank={studentRank} />
        </div>
      )}
    </div>
  );
}

export default function ShortlistPanel({ studentRank }: Props) {
  const { shortlist, removeFromShortlist, reorderShortlist } = useAppStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = shortlist.findIndex(r => r.id === active.id);
      const newIndex = shortlist.findIndex(r => r.id === over.id);
      reorderShortlist(arrayMove(shortlist, oldIndex, newIndex));
    }
  };

  const handleExportPDF = () => {
    // Trigger PDF download
    window.open('/api/export-pdf', '_blank');
  };

  if (shortlist.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⭐</div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          Your Shortlist is Empty
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Click the ★ icon on any recommendation to add it to your shortlist.
          You can then drag to reorder them before exporting.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1.25rem',
      }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
            My Option Entry List
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {shortlist.length} options • Drag to reorder
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleExportPDF}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
        >
          <FileDown size={14} />
          Export PDF
        </button>
      </div>

      {/* Info tip */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
        padding: '0.75rem 1rem',
        background: 'rgba(99,102,241,0.08)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1rem',
        fontSize: '0.8rem', color: 'var(--color-brand-700)',
      }}>
        <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          Option 1 is your top preference. The system will try to allot you the highest-priority option where your rank qualifies.
          Add Dream options first, then Realistic, then Safe.
        </span>
      </div>

      {/* Drag-and-drop list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={shortlist.map(r => r.id)} strategy={verticalListSortingStrategy}>
          {shortlist.map((rec, index) => (
            <SortableRow
              key={rec.id}
              rec={rec}
              index={index}
              onRemove={removeFromShortlist}
              studentRank={studentRank}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
