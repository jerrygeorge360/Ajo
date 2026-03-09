import { useReadContract, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { AJO_ABI } from '../abi/Ajo';

const CONTRACT = (import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;

export function useCircleState(circleId: number) {
  const result = useReadContract({
    address: CONTRACT,
    abi: AJO_ABI,
    functionName: 'getCircleState',
    args: [BigInt(circleId)],
    query: {
      refetchInterval: 4000,
    },
  });

  return {
    ...result,
    data: result.data
      ? {
          creator: result.data[0],
          contributionAmount: result.data[1],
          roundDuration: result.data[2],
          maxMembers: result.data[3],
          members: result.data[4],
          currentRound: result.data[5],
          roundStartTime: result.data[6],
          status: result.data[7],
          nextRecipient: result.data[8],
          contributorsThisRound: result.data[9],
        }
      : undefined,
  };
}

export function useCircleCount() {
  return useReadContract({
    address: CONTRACT,
    abi: AJO_ABI,
    functionName: 'circleCount',
    query: {
      refetchInterval: 6000,
    },
  });
}

export function useHasContributed(circleId: number, member: `0x${string}` | undefined) {
  return useReadContract({
    address: CONTRACT,
    abi: AJO_ABI,
    functionName: 'hasContributed',
    args: member ? [BigInt(circleId), member] : undefined,
    query: {
      enabled: !!member,
      refetchInterval: 4000,
    },
  });
}

export function useContribute() {
  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  const contribute = (circleId: number, amountFlow: string) => {
    writeContract({
      address: CONTRACT,
      abi: AJO_ABI,
      functionName: 'contribute',
      args: [BigInt(circleId)],
      value: parseEther(amountFlow),
    });
  };

  return { contribute, isPending, isSuccess, error };
}

export function useCreateCircle() {
  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  const createCircle = (amountFlow: string, roundDurationSeconds: number, maxMembers: number) => {
    writeContract({
      address: CONTRACT,
      abi: AJO_ABI,
      functionName: 'createCircle',
      args: [parseEther(amountFlow), BigInt(roundDurationSeconds), BigInt(maxMembers)],
    });
  };

  return { createCircle, isPending, isSuccess, error };
}

export function useJoinCircle() {
  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  const joinCircle = (circleId: number) => {
    writeContract({
      address: CONTRACT,
      abi: AJO_ABI,
      functionName: 'joinCircle',
      args: [BigInt(circleId)],
    });
  };

  return { joinCircle, isPending, isSuccess, error };
}
