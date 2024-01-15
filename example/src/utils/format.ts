import type {
  ConnectionState,
  PermissionResult,
} from '../../../src/types/types';
import { strings } from '../constants/strings';

export const formatPermissionStatus = (
  permissionStatus: PermissionResult | null
) =>
  `${strings.PERMISSION_STATUS}:  ${permissionStatus || strings.NOT_REQUESTED}`;
export const formatAdapterStatus = (isEnabled: boolean) =>
  `${strings.IS_ADAPTER_ENABLED}:  ${isEnabled}`;
export const formatConnectionStatus = (connectionState: ConnectionState) =>
  `${strings.STATE}:  ${connectionState}`;
