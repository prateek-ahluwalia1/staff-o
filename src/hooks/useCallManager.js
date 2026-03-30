import { useDispatch } from "react-redux";
import { setOutgoingCall } from "../store/slices/welfareCallSlice";
import useSubmit from "./useSubmit";
import { toast } from "react-toastify";

export const useCallManager = () => {
  const dispatch = useDispatch();
  const { submit, loading: isCalling } = useSubmit({ isAuth: true });

  const initiateCall = async (user) => {
    if (!user || !user.id) {
      toast.error("Invalid user selected for calling.");
      return;
    }

    try {
      const payload = { receiver_id: user.id };
      const res = await submit("api/calls/initiate", payload, {
        method: "POST",
      });

      if (res && res.success && res.agora_config) {
        // Dispatch to Redux, which automatically pops open the WelfareCallModal
        dispatch(
          setOutgoingCall({
            receiverName: user.name,
            agoraConfig: res.agora_config,
            callDetails: res.call,
          }),
        );
      }
    } catch (err) {
      toast.error(err.message || "Failed to initiate call");
    }
  };

  return { initiateCall, isCalling };
};
