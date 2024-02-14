import type { ConnectionState } from '../../../src/types/types';
import { strings } from '../constants/strings';

export const formatPermissionStatus = (isPermissionGranted: boolean) =>
  `${strings.IS_PERMISSION_GRANTED}:  ${isPermissionGranted}`;

export const formatAdapterStatus = (isEnabled: boolean) =>
  `${strings.IS_ADAPTER_ENABLED}:  ${isEnabled}`;

export const formatConnectionStatus = (connectionState: ConnectionState) =>
  `${strings.STATE}:  ${connectionState}`;
