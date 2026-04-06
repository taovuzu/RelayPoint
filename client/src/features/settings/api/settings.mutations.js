import { useDispatch, useSelector } from 'react-redux';
import { useState, useCallback } from 'react';
import { changePassword } from '@/redux/settings/settingsThunks';
import { selectSettingsLoading } from '@/redux/settings/settingsSlice';
import { toast } from 'sonner';

export function useChangePassword() {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectSettingsLoading);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (data, onSuccess) => {
    setError(null);
    try {
      const resultAction = await dispatch(changePassword(data)).unwrap();
      toast.success(resultAction.message || 'Password changed successfully');
      if (onSuccess) onSuccess();
      return resultAction;
    } catch (err) {
      setError(err);
      toast.error(err.message || 'Failed to change password');
      throw err;
    }
  }, [dispatch]);

  return { mutate, isLoading, error };
}
