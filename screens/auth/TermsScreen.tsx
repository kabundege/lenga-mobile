import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextHeading } from '@/components/typography/textHeading';
import globalStyles from '@/utils/styles/globalstyles.style';
import { ScrollView, StyleSheet, View } from 'react-native';
import IconButton from '@/components/buttons/iconButton';
import { ThemedView } from '@/components/themed-view';
import { TextBody } from '@/components/typography';
import { themeToken } from '@/utils/theme/styles';
import { StatusBar } from 'expo-status-bar';
import colors from '@/utils/theme/colors';
import { router } from 'expo-router';

const SECTIONS = [
  {
    title: '1. Amakuru rusange',
    body: 'Murakaza neza kuri serivisi ya LENGA. Aya mategeko n\'amabwiriza agenga ikoreshwa ry\'uburyo bwacu bwo kwiga. Mukoresha porogaramu yacu, wemeye gukomeza amabwiriza yose avugwa hano.',
  },
  {
    title: '2. Ikoreshwa ry\'uburyo',
    body: 'Uburyo bwacu bwashyizweho gufasha abakoresha bato kumenya no kwiga mu buryo bworoshye. Ntabwo yemewe gukoresha serivisi yacu mu buryo bubi cyangwa bwangiza abandi.',
  },
  {
    title: '3. Amakuru y\'umukoresha',
    body: 'Dukusanya amakuru ngenderwaho yo gufungura konti yawe nk\'izina, nimero ya telefoni n\'ijambobanga. Amakuru yawe ategekwa kubikwa mu buryo bwizewe kandi ntazahabwa undi muntu utibirebwa.',
  },
  {
    title: '4. Ubwisanzure bw\'umukoresha',
    body: 'Ufite uburenganzira bwo kureba, guhindura cyangwa gusiba amakuru yawe igihe icyo aricyo cyose. Ushobora gusaba gusiba konti yawe utumanahaze kuri serivisi yacu.',
  },
  {
    title: '5. Ibikoresho by\'amashusho n\'amajwi',
    body: 'Ibibikoresho byose by\'amashusho, amajwi n\'ibyanditse bihari muri LENGA ni ubutunzi bw\'abayikoze. Ntabwo yemewe gukoporora cyangwa gusangira ibibikoresho nta ngufu.',
  },
  {
    title: '6. Igenamigambi ry\'inyigisho',
    body: 'Inyigisho zihabwa ku murongo zishingiye ku mushinga wa UNDP wo guteza imbere uburezi mu Rwanda. Tugerageza gushyiraho amakuru y\'ukuri kandi yuzuye ariko ntidushobora kwishingira ku nyungu zose zimwe na zimwe.',
  },
  {
    title: '7. Impinduka ku mategeko',
    body: 'Dufite uburenganzira bwo guhindura aya mategeko n\'amabwiriza igihe icyo aricyo cyose. Impinduka zizamenyeshwa ku bakoresha binyuze mu butumwa bwa porogaramu. Gukomeza gukoresha serivisi nyuma y\'impinduka bisobanura ko wemeye amategeko mashya.',
  },
  {
    title: '8. Twandikire',
    body: 'Niba ufite ibibazo cyangwa ibyifuzo bijyanye n\'aya mategeko n\'amabwiriza, watwandikira kuri: info@lenga.rw',
  },
];

export default function TermsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={globalStyles.flex_1}>
      <StatusBar style="dark" />

      <View style={[styles.header, { paddingTop: insets.top + themeToken.paddingSm }]}>
        <IconButton icon="chevron-left" onPress={router.back} backgroundColor={colors.primary_light} />
        <TextHeading variant="heading" color="default" style={globalStyles.flex_95}>
          Amategeko n'amabwiriza
        </TextHeading>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + themeToken.spacingLg }]}
        showsVerticalScrollIndicator={false}
      >
        <TextBody variant="body2" color="tertiary" >
          Itariki y'amategeko: Mutarama 1, 2025
        </TextBody>

        {SECTIONS.map((section, index) => (
          <View key={section.title} style={[styles.section, index ? globalStyles.border_t_secondary : {}]}>
            <TextHeading variant="title" color="default" style={globalStyles.mb_xs}>
              {section.title}
            </TextHeading>
            <TextBody variant="body2" color="secondary">
              {section.body}
            </TextBody>
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    gap: themeToken.spacingSm,
    justifyContent: 'space-between',
    paddingBottom: themeToken.padding,
    backgroundColor: colors.primary_light,
    paddingHorizontal: themeToken.paddingLg,
    borderBottomColor: colors.border.primary,
  },
  backButton: {
    padding: themeToken.paddingSm,
    borderRadius: themeToken.borderRadius,
    backgroundColor: colors.background.tertiary,
  },
  content: {
    padding: themeToken.paddingLg,
    gap: themeToken.spacing,
  },
  section: {
    gap: themeToken.spacingSm,
    paddingTop: themeToken.padding,
  },
});
