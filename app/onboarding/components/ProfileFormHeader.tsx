import { ThemedText } from "@/components/themed-text";
import { TextBody } from "@/components/typography";
import globalStyles from "@/utils/styles/globalstyles.style";
import { centered } from "@/utils/styles/reusable.style";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function ProfileFormHeader() {
  return (
    <SafeAreaView style={globalStyles.center}>
      <StatusBar style="dark" />
      <ThemedText type="title" style={globalStyles.text_center}>
        Umwirondoro
      </ThemedText>
      <TextBody
        style={[globalStyles.w_80, globalStyles.text_center]}
        variant="body2"
        color="secondary"
      >
        Uzuza amakuru yawe kugira ngo dusobanukirwe bidufashe gutunganya
        amasomo.
      </TextBody>
    </SafeAreaView>
  );
}
