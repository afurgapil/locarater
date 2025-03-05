import toast from "react-hot-toast";

type ToastType = "success" | "error" | "loading";

export function useToast() {
  const showToast = (message: string, type: ToastType = "success") => {
    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      case "loading":
        toast.loading(message);
        break;
      default:
        toast(message);
    }
  };

  return { showToast };
}
