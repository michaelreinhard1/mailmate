import { useToast } from "vue-toastification";
import { IconAlertTriangle } from "@tabler/icons-vue";
const toast = useToast();

export function DisplayError(message) {
  toast.error(message, {
    icon: IconAlertTriangle,
  });
}
