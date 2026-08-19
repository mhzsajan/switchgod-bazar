import { useMemo } from 'react';
import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';
import {
  useMakeOrRevokeAdminMutation,
  useRevokeAdminMutation,
} from '@/data/user';

const MakeAdminView = () => {
  const { mutate: makeOrRevokeAdmin, isLoading: loading } =
    useMakeOrRevokeAdminMutation();
  const { mutate: revokeAdmin, isLoading: revokeLoading } =
    useRevokeAdminMutation();
  const { data } = useModalState();

  const { closeModal } = useModalAction();

  const user =
    typeof data === 'object' && data !== null && 'id' in data ? data : null;
  const user_id = user?.id ?? data;

  const isAdmin = useMemo(
    () =>
      user?.permissions?.some(
        (permission: any) => permission?.name === 'super_admin',
      ) ?? false,
    [user],
  );

  async function handleToggleAdmin() {
    if (isAdmin) {
      revokeAdmin({ user_id });
    } else {
      makeOrRevokeAdmin({ user_id });
    }
    closeModal();
  }

  return (
    <ConfirmationCard
      onCancel={closeModal}
      onDelete={handleToggleAdmin}
      deleteBtnText="text-yes"
      title={isAdmin ? 'text-remove-admin' : 'text-make-admin'}
      description={
        isAdmin
          ? 'text-description-remove-admin'
          : 'text-description-make-admin'
      }
      deleteBtnLoading={loading || revokeLoading}
    />
  );
};

export default MakeAdminView;