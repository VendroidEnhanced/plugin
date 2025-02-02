// @ts-check

import { execSync } from "child_process";
import { buildVencord } from "./build.mjs";
import { hostname } from "os";
import { successLog } from "./logging.mjs";

process.on("uncaughtException", e => {
	const error = e.stack || e;
	const failTime = Math.floor(Date.now() / 1000);
	console.error(error);
	if (!process.env.DISCORD_WEBHOOK) {
		process.exit(1);
	}
	fetch(
		`${process.env.DISCORD_WEBHOOK}?wait=true&thread_id=1335651275689295872`,
		{
			headers: {
				"Content-Type": "application/json"
			},
			method: "POST",
			body: JSON.stringify({
				content: `\`\`\`\n${error}\n\`\`\``
			})
		}
	)
		.catch(() => {
			process.exit(1);
		})
		.then(response => response.json())
		.then(json => {
			const messageURL = `https://discord.com/channels/1274790619146879108/${json.channel_id}/${json.id}`;
			// @ts-ignore
			fetch(process.env.DISCORD_WEBHOOK, {
				headers: {
					"Content-Type": "application/json"
				},
				method: "POST",
				body: JSON.stringify({
					content: "<@886685857560539176>",
					embeds: [
						{
							color: 0xfecb4f,
							description: `### <:blobcatcozy:1279411388607107163> Build failed
						> **Start time:** <t:${Math.floor(startTime / 1000)}:D> at <t:${Math.floor(
								startTime / 1000
							)}:T>
						> **End time:** <t:${failTime}:D> at <t:${failTime}:T>
						> **Duration:** ${((Date.now() - startTime) / 1000).toFixed(2)} seconds
						> **Builder hostname:** \`${hostname()}\`
						> **Stacktrace:** ${messageURL}`
						}
					]
				})
			})
				.then(() => {
					process.exit(1);
				})
				.catch(() => {
					process.exit(1);
				});
		});
});

const startTime = Date.now();
const chosenMod = process.argv[2];
if (!chosenMod) {
	throw new Error("Need to specify vencord, equicord, or a clone URL");
}
//throw new Error("h");
try {
	execSync("pnpm --version", {
		stdio: "ignore"
	});
	execSync("gh --version", {
		stdio: "ignore"
	});
	execSync("git --version", {
		stdio: "ignore"
	});
} catch {
	throw new Error("Missing pnpm, gh or git");
}

switch (chosenMod) {
	case "vencord": {
		buildVencord("https://github.com/Vendicated/Vencord");
		const commitInfo = execSync(
			'cd working && git log -1 --pretty=format:"\\`%h\\` ~ %s"'
		)
			.toString()
			.trim();
		successLog(startTime, commitInfo, "Vencord");
		break;
	}
	case "equicord": {
		buildVencord("https://github.com/Vendicated/Vencord");
		const commitInfo = execSync(
			'cd working && git log -1 --pretty=format:"\\`%h\\` ~ %s"'
		)
			.toString()
			.trim();
		successLog(startTime, commitInfo, "Equicord");
	}
}
