// @ts-check

import { execSync } from "child_process";
import {
	copyFileSync,
	cpSync,
	mkdirSync,
	readdirSync,
	rmSync,
	statSync
} from "fs";
import { join } from "path";

/**
 *
 * @param {string} sourceDir
 */
function applyChanges(sourceDir) {
	const files = readdirSync(sourceDir);
	const filesToCopy = files.filter(f => !f.endsWith(".patch"));
	const patches = files.filter(f => f.endsWith(".patch"));
	for (const file of filesToCopy) {
		const path = join("working/", file.replaceAll("_", "/"));
		console.log("Copying", file, "to", path);
		cpSync(join(sourceDir, file), path, {
			recursive: true
		});
	}
	for (const patch of patches) {
		console.log("Applying patch", patch);
		execSync(`cd working && git apply ../${sourceDir}/${patch}`);
	}
}

/**
 * @param {string} cloneURL
 * @param {string} dirToLookAt
 */
export function buildVencord(cloneURL, dirToLookAt = "vencord") {
	if (
		!/^https:\/\/(github\.com|codeberg\.org|git\.nin0\.dev)\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-\._]+(?:\.git)?\/?$/.test(
			cloneURL
		)
	) {
		throw new Error(
			"Invalid clone URL. Must be github, codeberg or nin0git"
		);
	}

	try {
		if (statSync("working/").isDirectory()) {
			console.log("Working dir exists, deleting");
			rmSync("working/", {
				force: true,
				recursive: true
			});
		}
	} catch {}
	console.log("Creating working dir");
	mkdirSync("working/");

	console.log(`Cloning ${cloneURL}`);
	execSync(
		"git clone --depth 1 --branch main ${cloneURL} working/", // FIXME: clone more securely
		{
			stdio: "ignore"
		}
	);

	console.log("Installing Vencord deps");
	execSync("cd working && pnpm i --frozen-lockfile", {
		stdio: "inherit"
	});

	console.log("Applying common files");
	applyChanges("src/common");
	console.log("Applying", dirToLookAt, "files");
	applyChanges(`src/${dirToLookAt}`);

	console.log("Building Vencord");
	execSync("cd working && pnpm buildWeb", {
		stdio: "inherit"
	});

	console.log("Releasing");
	cpSync("working/dist/browser.js", "dist/browser.js", {
		recursive: true
	});
	cpSync("working/dist/browser.css", "dist/browser.css", {
		recursive: true
	});
	cpSync("working/dist/browser.js.LEGAL.txt", "dist/browser.js.LEGAL.txt", {
		recursive: true
	});
	execSync(
		`export GH_TOKEN=${process.env.GH_TOKEN} && gh release upload ${
			cloneURL.includes("Vencord") ? "devbuild" : "devbuild-equi"
		} --clobber dist/*`,
		{
			stdio: "ignore"
		}
	);
}
