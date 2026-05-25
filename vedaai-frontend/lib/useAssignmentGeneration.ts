'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Assignment } from './store';
import { WS_BASE_URL } from './config';

export function useAssignmentGeneration(
  id: string,
  fetchDetails: (id: string) => Promise<Assignment | null>
) {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState(0);
  const [generationEpoch, setGenerationEpoch] = useState(0);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    const data = await fetchDetails(id);
    if (!data) {
      setError('Assignment not found');
      setLoading(false);
      return null;
    }
    setAssignment(data);
    if (data.status !== 'pending') {
      setLoading(false);
    }
    return data;
  }, [id, fetchDetails]);

  useEffect(() => {
    let socket: Socket | null = null;
    let phaseInterval: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    async function init() {
      const data = await fetchDetails(id);
      if (cancelled || !data) {
        if (!cancelled) {
          setError('Assignment not found');
          setLoading(false);
        }
        return;
      }

      setAssignment(data);

      if (data.status === 'pending') {
        setLoading(true);
        phaseInterval = setInterval(() => {
          setPhase((prev) => (prev < 3 ? prev + 1 : prev));
        }, 2500);

        socket = io(WS_BASE_URL);
        socket.on('connect', () => {
          socket?.emit('join-assignment', id);
        });
        socket.on('assignment:completed', (updated: Assignment) => {
          if (phaseInterval) clearInterval(phaseInterval);
          if (!cancelled) {
            setAssignment(updated);
            setLoading(false);
            setPhase(3);
          }
        });
        socket.on('assignment:failed', (payload: { error: string }) => {
          if (phaseInterval) clearInterval(phaseInterval);
          if (!cancelled) {
            setAssignment((prev) => (prev ? { ...prev, status: 'failed' } : null));
            setError(payload.error || 'AI generation failed');
            setLoading(false);
          }
        });
      } else {
        setLoading(false);
      }
    }

    init();

    return () => {
      cancelled = true;
      if (phaseInterval) clearInterval(phaseInterval);
      socket?.disconnect();
    };
  }, [id, fetchDetails, generationEpoch]);

  const startRegeneration = useCallback(() => {
    setPhase(0);
    setError(null);
    setAssignment((prev) =>
      prev ? { ...prev, status: 'pending', sections: [], answerKey: '', aiResponseText: '' } : prev
    );
    setGenerationEpoch((e) => e + 1);
  }, []);

  return {
    assignment,
    setAssignment,
    loading,
    setLoading,
    error,
    setError,
    phase,
    reload,
    startRegeneration,
  };
}
