'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { InteractionStatus, RoutingOutcome } from '@/types';

interface StatusButtonProps {
  interactionId: string;
  currentStatus: InteractionStatus;
  routingOutcome: RoutingOutcome;
  onStatusChange?: () => void;
}

const statusOptions: { value: InteractionStatus; label: string }[] = [
  { value: 'responded', label: 'Responded' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'failed', label: 'Failed' },
];

export function StatusButton({
  interactionId,
  currentStatus,
  routingOutcome,
  onStatusChange,
}: StatusButtonProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Only show status button for non-escalated items
  // Escalated items should be managed in TechSupport AI
  if (routingOutcome === 'escalated_techsupport') {
    return null;
  }

  // Don't show if already resolved
  if (currentStatus === 'resolved') {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="text-xs"
      >
        ✓ Resolved
      </Button>
    );
  }

  const updateStatus = async (newStatus: InteractionStatus) => {
    setIsUpdating(true);
    setShowMenu(false);

    try {
      const response = await fetch(`/api/interactions/${interactionId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Trigger refresh
      if (onStatusChange) {
        onStatusChange();
      } else {
        // Fallback: reload page
        window.location.reload();
      }
    } catch (error) {
      console.error('Status update error:', error);
      alert('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        disabled={isUpdating}
        className="text-xs"
      >
        {isUpdating ? '...' : 'Update Status'}
      </Button>

      {showMenu && (
        <>
          {/* Backdrop to close menu */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />

          {/* Dropdown menu */}
          <div className="absolute right-0 top-full mt-1 z-20 bg-white border rounded-lg shadow-lg min-w-[140px]">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation();
                  updateStatus(option.value);
                }}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
