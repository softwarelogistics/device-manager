import AppServices from "../services/app-services";
import { Text, View, TextInput, } from 'react-native';

export interface ParagraphProps {
    content: string;
}

export default function Paragraph(props: ParagraphProps) {
    const themePalette = AppServices.instance.getAppTheme();
    return (
        <Text style={[{ textAlign: 'center', marginBottom: 5, marginTop: 20, color: themePalette.shellTextColor, fontSize: 16 }]}>
            {props.content}
        </Text>
    )
}