import i18n from "@/translations/i18n";
import { Alert } from "react-native";

interface ConfirmProps {
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
}

export const confirm = async ({ title, message, onConfirm, onCancel, confirmText, cancelText }: ConfirmProps) => {
    const confirmed = await new Promise<boolean>((resolve) => {
        Alert.alert(
            title,
            message,
            [
                {
                    text: cancelText ?? i18n.t("common.cancel"),
                    onPress: () => {
                        resolve(false);
                        onCancel?.();
                    },
                },
                {
                    text: confirmText ?? i18n.t("common.yesProceed"),
                    style: "destructive",
                    onPress: () => {
                        resolve(true);
                        onConfirm?.();
                    },
                },
            ],
            { cancelable: true }
        );
    });

    if (!confirmed) return;
    return confirmed;
};