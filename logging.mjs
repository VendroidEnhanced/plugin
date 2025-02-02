// @ts-check
import { hostname } from "os";

/**
 *
 * @param {*} startTime
 * @param {string} commitInfo
 * @returns
 */
export function successLog(startTime, commitInfo, repoName) {
	if (!process.env.DISCORD_WEBHOOK) return;
	const endTime = Math.floor(Date.now() / 1000);
	fetch(process.env.DISCORD_WEBHOOK, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			embeds: [
				{
					color: 0xd79465,
					description: `### <:husk:1279411419619655780> Successful build
							> **Repository:** ${repoName}
							> **Start time:** <t:${Math.floor(startTime / 1000)}:D> at <t:${Math.floor(
						startTime / 1000
					)}:T>
							> **End time:** <t:${endTime}:D> at <t:${endTime}:T>
							> **Duration:** ${((Date.now() - startTime) / 1000).toFixed(2)} seconds
							> **Builder hostname:** \`${hostname()}\`
							> **Ran on:** \`${process.env.REASON}\`
							> **Commit:** ${commitInfo}

-# You can update to this build in VendroidEnhanced settings.`
				}
			]
		})
	});
}
