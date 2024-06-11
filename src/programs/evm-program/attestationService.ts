import { IRIS_ATTESTATION_API_URL } from '@/constants';

export enum AttestationStatus {
  complete = 'complete',
  pending_confirmations = 'pending_confirmations',
}

export interface AttestationResponse {
  attestation: string | null;
  status: AttestationStatus;
}
export interface Attestation {
  message: string | null;
  status: AttestationStatus;
}

const mapAttestation = (attestationResponse: AttestationResponse) => ({
  message: attestationResponse.attestation,
  status: attestationResponse.status,
});

const baseURL = `${IRIS_ATTESTATION_API_URL}/attestations`;

export const getAttestation = async (
  messageHash: string
): Promise<Attestation | null> => {
  const response = await fetch(`${baseURL}/${messageHash}`);

  let data: AttestationResponse;
  if (response.status === 404) {
    data = {
      attestation: null,
      status: AttestationStatus.pending_confirmations,
    };
  } else if (!response.ok) {
    return null;
  }

  data = (await response.json()) as AttestationResponse;

  return mapAttestation(data);
};
