/* eslint-disable simple-header/header */
import { definePluginSettings } from "@api/Settings";
import { Link } from "@components/Link";
import { Devs } from "@utils/constants";
import { Margins } from "@utils/margins";
import definePlugin, { OptionType } from "@utils/types";
import { Alerts, Forms, Text } from "@webpack/common";

import myself from ".";

function isDev(id) {
    const devs: string[] = ["886685857560539176", "259558259491340288", "1230555039475568640"];
    return devs.includes(id);
}
const VENCORD_SUPPORT_ID = "1026515880080842772";
const NINAWARE_SUPPORT_ID = "1279410015681122396";

function showNoVencordSupportModal() {
    Alerts.show({
        title: "Hold on!",
        body: <>
            <img src="https://github.com/user-attachments/assets/4a351bfb-a2a1-4693-be2d-d19f18d76684" />
            <Forms.FormText className={Margins.top8}>You are using VendroidEnhanced, which the Vencord Server does not provide support for!</Forms.FormText>

            <Forms.FormText className={Margins.top8}>
                Vencord only provides support for official builds. Therefore, please ask for support in the <Link href="https://discord.gg/qtmpcF56Yf">VendroidEnhanced support server</Link>.
            </Forms.FormText>

            <Text variant="text-md/bold" className={Margins.top8}>You will be banned from receiving support if you ignore this rule.</Text>

            <Text variant="text-xs/medium" className={Margins.top8}>You can disable this warning and regain message sending permissions here in the VendroidEnhancements plugin settings.</Text>
        </>,
    });
}


export default definePlugin({
    name: "VendroidEnhancements",
    description: "Makes Vendroid usable.",
    required: true,
    authors: [Devs.nin0dev, Devs.Sqaaakoi],
    dependencies: ["MessageEventsAPI"],
    patches: [
        {
            find: "chat input type must be set",
            replacement: [{
                match: /(\i.\i.useSetting\(\))&&!\(0,\i.isAndroidWeb\)\(\)/,
                replace: "$1"
            }]
        }
    ],
    settings: definePluginSettings({
        allowSupportMessageSending: {
            description: "Allow sending messages in the Vencord support channel. DO NOT ASK FOR SUPPORT IN IT FOR VENDROIDENHANCED ISSUES!!",
            default: false,
            type: OptionType.BOOLEAN
        }
    }),
    onBeforeMessageSend(c, msg) {
        if (c === VENCORD_SUPPORT_ID && !this.settings.store.allowSupportMessageSending) {
            showNoVencordSupportModal();
            msg.content = "";
        }
    },
    userProfileBadge: {
        description: "VendroidEnhanced Contributor",
        image: "https://raw.githubusercontent.com/VendroidEnhanced/UpdateTracker/main/logo.png",
        position: 0,
        props: {
            style: {
                borderRadius: "50%",
                transform: "scale(0.9)" // The image is a bit too big compared to default badges
            }
        },
        shouldShow: ({ userId }) => isDev(userId),
        link: "https://github.com/VendroidEnhanced/Vendroid"
    },
    flux: {
        async CHANNEL_SELECT({ channelId }) {
            if (myself.settings.store.allowSupportMessageSending) return;
            switch (channelId) {
                case VENCORD_SUPPORT_ID: {
                    showNoVencordSupportModal();
                }
            }
        }
    }
});

